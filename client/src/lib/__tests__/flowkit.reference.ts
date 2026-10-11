import { parseKit, parseReport, buildKit, firstJsonObject, scenesToFix, kitTooLarge } from "../flowKit";
import { existsSync, readFileSync } from "node:fs";
const find = (name: string, env?: string) => [env, `__fixtures__/${name}`, `../__fixtures__/${name}`, `src/lib/__fixtures__/${name}`, `client/src/lib/__fixtures__/${name}`].filter(Boolean).find((p) => existsSync(p as string)) as string;
const eq = (n: string, a: unknown, b: unknown) => console.log(JSON.stringify(a) === JSON.stringify(b) ? "OK  " : "FAIL", n, JSON.stringify(a).slice(0, 110));

// Laporan asli dari Tool (field tambahan di akar + blok Kode keadaan di bawahnya)
const report = `PROMO-REPORT v1.4
{
  "project": "Tumbler-Hitam", "promptLang": "id", "delivery": "720p", "draft": false,
  "naming": {"folder": "{proyek}_{tanggal}", "file": "{proyek}_scene-{no}"},
  "scenes": [
    {"id": 1, "status": "ok", "similarity": 4, "note": "", "videoMediaId": "175806ee", "resolution": "720p"},
    {"id": 2, "status": "ok", "similarity": 4, "note": "", "videoMediaId": "e38ae71b", "resolution": "720p"}
  ]
}
{
  "kit": {"project": "Tumbler-Hitam", "scenes": []},
  "results": {"1": {"status": "ok"}},
  "savedAt": "2026-10-10T11:55:34.219Z"
}`;
const r = parseReport(report);
eq("report asli diterima", r.ok && r.data.scenes.length, 2);
eq("report versi", r.ok && r.version, "1.4");
eq("report: similarity", r.ok && r.data.scenes.map((s) => s.similarity), [4, 4]);
eq("scenesToFix kosong", r.ok && scenesToFix(r.data).length, 0);
eq("report ulang terdeteksi", (() => { const x = parseReport(report.replace('"status": "ok", "similarity": 4, "note": "", "videoMediaId": "e38ae71b"', '"status": "ulang", "similarity": 2, "note": "label buram", "videoMediaId": "e38ae71b"')); return x.ok ? scenesToFix(x.data).map((s) => s.id) : "err"; })(), [2]);
eq("header salah", parseReport("TOKEN\n{}").ok, false);
eq("versi 1.2 ditolak", (() => { const x = parseReport("PROMO-REPORT v1.2\n{}"); return !x.ok && x.error.includes("v1.2"); })(), true);
eq("json terpotong", (() => { const x = parseReport('PROMO-REPORT v1.4\n{"project":"a","scenes":['); return !x.ok; })(), true);
eq("json rusak", (() => { const x = parseReport("PROMO-REPORT v1.4\n{project: a}"); return !x.ok; })(), true);
eq("isi tidak valid", (() => { const x = parseReport('PROMO-REPORT v1.4\n{"project":"a","scenes":[{"id":1,"status":"mungkin"}]}'); return !x.ok && x.error.includes("scenes"); })(), true);

const kit = readFileSync(find("KIT_SCENE_TUMBLER.txt", process.env.KIT_PATH), "utf8");
const k = parseKit(kit);
eq("kit v1.4 contoh valid", k.ok && [k.data.scenes.length, k.data.model, k.data.promptLang], [2, "omni-flash-1.1", "id"]);
eq("kit v1.3 nilai bawaan", (() => { const x = parseKit('PROMO-KIT v1.3\n{"project":"p","ratio":"9:16","model":"veo-3.1-lite","slots":["produk-depan"],"scenes":[{"id":1,"seconds":8,"mode":"ingredients","slots":[],"prompt":"x"}]}'); return x.ok && [x.data.delivery, x.data.draft, x.data.naming.file]; })(), ["720p", false, "{proyek}_scene-{no}"]);
eq("kit model tak dikenal", parseKit('PROMO-KIT v1.4\n{"project":"p","ratio":"9:16","model":"x","slots":[],"scenes":[]}').ok, false);
eq("firstJsonObject abaikan } dalam string", firstJsonObject('A {"a":"}{","b":{"c":1}} {"z":1}', 0), '{"a":"}{","b":{"c":1}}');
eq("kitTooLarge", [kitTooLarge("x".repeat(19999)), kitTooLarge("x".repeat(20001))], [false, true]);

// buildKit -> parseKit (round trip)
const pack: any = { scenes: [{ role: "r", shot: "s", prompt: "p1", start_frame_prompt: "", end_frame_prompt: "", overlays: [{ t: "0-3s", text: "Hai" }], voiceover_line: "vo1" }, { role: "r", shot: "s", prompt: "p2", start_frame_prompt: "", end_frame_prompt: "", overlays: [], voiceover_line: "vo2" }] };
const st: any = { model: "omni-flash-1.1", mode: "ingredients", ratio: "9:16", clipSeconds: [8, 8], ingredients: ["produk-depan", "ruang"], dropped: [], sideAllowed: false, overlayMode: "space", formatLabel: "x", promptLang: "id", delivery: "720p", draft: false, project: "Tes", naming: { folder: "{proyek}_{tanggal}", file: "{proyek}_scene-{no}" } };
const built = buildKit(pack, st);
const rt = parseKit(built);
eq("round trip buildKit", rt.ok && [rt.data.scenes.length, rt.data.scenes[1].seconds, rt.data.scenes[0].overlay[0].text, rt.data.project], [2, 8, "Hai", "Tes"]);

// Laporan asli dari Tool (berkas contoh): field tambahan + blok Kode keadaan di bawahnya
const real = parseReport(readFileSync(find("CONTOH_LAPORAN_ASLI.txt", process.env.REPORT_PATH), "utf8"));
eq("berkas laporan asli diterima", real.ok && [real.data.project, real.data.scenes.length, real.data.scenes[0].similarity, real.data.scenes[1].resolution], ["Tumbler-Hitam", 2, 4, "720p"]);
