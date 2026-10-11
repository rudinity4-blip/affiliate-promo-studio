import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { applyNaming, MAX_REFS, omniCredits, creditEstimate, planClipSeconds } from "../scenePack";
import { suggestFormats, planIngredients, effectiveOverlay } from "../adFormats";
import { buildKit, firstJsonObject, kitTooLarge, parseKit, parseReport, scenesToFix } from "../flowKit";

const fixture = (name: string) => readFileSync(resolve(__dirname, "..", "__fixtures__", name), "utf8");

describe("Stage 7 logic", () => {
  it("plans durations and format combinations", () => {
    expect(planClipSeconds("omni-flash-1.1", "ingredients", 16)).toEqual([8, 8]);
    expect(planClipSeconds("omni-flash-1.1", "ingredients", 16, "maks")).toEqual([10, 6]);
    expect(planClipSeconds("omni-flash-1.1", "ingredients", 10)).toEqual([10]);
    expect(planClipSeconds("veo-3.1-lite", "ingredients", 16)).toEqual([8, 8]);
    expect(suggestFormats("aktor", "fashion").map(x => x.id)).toEqual(["aktor-cermin", "aktor-ruang", "aktor-pegang"]);
    expect(suggestFormats("aktor", "umum").map(x => x.id)).toEqual(["aktor-pakai-umum", "aktor-pegang"]);
    expect(suggestFormats("ruang", "umum").map(x => x.id)).toEqual(["tangan-meja", "unboxing-meja"]);
    expect(planIngredients(["depan", "samping", "atas"], "ruang")).toEqual({ slots: ["produk-depan", "ruang", "produk-samping"], dropped: ["produk-atas"], sideAllowed: true });
    expect(effectiveOverlay("prompt", "veo-3.1-lite")).toBe("space");
  });

  it("handles naming, references, and credit estimates", () => {
    expect(applyNaming("{proyek}_scene-{no}", { proyek: "Tumbler Hitam", no: 2 })).toBe("Tumbler_Hitam_scene-02");
    expect(applyNaming("{proyek}_{foo}", { proyek: "X" })).toBe("X");
    expect(MAX_REFS).toEqual({ "veo-3.1-lite": 3, "omni-flash-1.1": 7 });
    expect(omniCredits(8, "720p")).toBe(12);
    expect(creditEstimate("omni-flash-1.1", [8, 8], "360p")).toBe(12);
  });

  it("parses the real Tool report with trailing state JSON", () => {
    const r = parseReport(fixture("CONTOH_LAPORAN_ASLI.txt"));
    expect(r.ok).toBe(true);
    if (r.ok) { expect(r.version).toBe("1.4"); expect(r.data.scenes).toHaveLength(2); expect(r.data.scenes[0].similarity).toBe(4); expect(scenesToFix(r.data)).toHaveLength(0); }
  });

  it("parses v1.3 defaults, v1.4 kit, errors, and size warning", () => {
    const v13 = parseKit('PROMO-KIT v1.3\n{"project":"p","ratio":"9:16","model":"veo-3.1-lite","slots":["produk-depan"],"scenes":[{"id":1,"seconds":8,"mode":"ingredients","slots":[],"prompt":"x"}]}');
    expect(v13.ok && v13.data.delivery).toBe("720p");
    const v14 = parseKit(fixture("KIT_SCENE_TUMBLER.txt"));
    expect(v14.ok).toBe(true);
    expect(parseReport("PROMO-REPORT v1.2\n{}").ok).toBe(false);
    expect(firstJsonObject('A {"a":"}{","b":{"c":1}} {"z":1}', 0)).toBe('{"a":"}{","b":{"c":1}}');
    expect(kitTooLarge("x".repeat(19999))).toBe(false);
    expect(kitTooLarge("x".repeat(20001))).toBe(true);
  });

  it("round-trips a v1.4 kit", () => {
    const pack: any = { scenes: [{ role: "r", shot: "s", prompt: "p", start_frame_prompt: "", end_frame_prompt: "", overlays: [], voiceover_line: "vo" }] };
    const settings: any = { model: "omni-flash-1.1", mode: "ingredients", ratio: "9:16", clipSeconds: [8], ingredients: ["produk-depan"], overlayMode: "space", promptLang: "id", delivery: "720p", draft: false, project: "Tes", naming: { folder: "{proyek}_{tanggal}", file: "{proyek}_scene-{no}" } };
    const parsed = parseKit(buildKit(pack, settings));
    expect(parsed.ok && parsed.data.project).toBe("Tes");
  });
});
