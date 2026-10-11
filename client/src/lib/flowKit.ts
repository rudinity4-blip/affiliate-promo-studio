import { z } from "zod";
import type { ScenePack, SceneSettings } from "./scenePack";

const Overlay = z.object({ t: z.string(), text: z.string() });

export const KitSchema = z.object({
  project: z.string(),
  ratio: z.string(),
  model: z.enum(["veo-3.1-lite", "omni-flash-1.1"]),
  overlayMode: z.enum(["space", "prompt", "none"]).default("space"),
  promptLang: z.enum(["id", "en"]).default("id"),
  delivery: z.enum(["720p", "1080p", "4k"]).default("720p"),
  draft: z.boolean().default(false),
  naming: z.object({ folder: z.string(), file: z.string() }).default({ folder: "{proyek}_{tanggal}", file: "{proyek}_scene-{no}" }),
  slots: z.array(z.string()),
  scenes: z
    .array(
      z.object({
        id: z.number(),
        seconds: z.number(),
        mode: z.enum(["ingredients", "frames-first", "frames-first-last", "text"]),
        slots: z.array(z.string()),
        prompt: z.string(),
        startFramePrompt: z.string().default(""),
        endFramePrompt: z.string().default(""),
        overlay: z.array(Overlay).default([]),
        vo: z.string().default(""),
      }),
    )
    .min(1),
});
export type Kit = z.infer<typeof KitSchema>;

export const ReportSchema = z.object({
  project: z.string(),
  scenes: z
    .array(
      z.object({
        id: z.number(),
        status: z.enum(["ok", "ulang", "gagal"]),
        similarity: z.number().min(1).max(5).optional(),
        note: z.string().default(""),
        videoMediaId: z.string().optional(),
        resolution: z.string().optional(),
      }),
    )
    .min(1),
  package: z.object({ folder: z.string(), files: z.array(z.string()) }).optional(),
});
export type Report = z.infer<typeof ReportSchema>;

export type Parsed<T> = { ok: true; data: T; version: string } | { ok: false; error: string };
export const SUPPORTED_VERSIONS = ["1.3", "1.4"];
export const KIT_WARN_CHARS = 20000;

/** Ambil objek JSON pertama yang seimbang setelah posisi `from` (abaikan teks/JSON lain sesudahnya). */
export function firstJsonObject(text: string, from: number): string | null {
  const start = text.indexOf("{", from);
  if (start < 0) return null;
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

function parseBlock<S extends z.ZodType>(text: string, kind: "KIT" | "REPORT", schema: S): Parsed<z.infer<S>> {
  const m = text.match(new RegExp(`PROMO-${kind}\\s+v(\\d+\\.\\d+)`));
  if (!m) return { ok: false, error: `Baris awal "PROMO-${kind} v1.4" tidak ditemukan. Tempel teks lengkap mulai dari baris pertama.` };
  if (!SUPPORTED_VERSIONS.includes(m[1])) return { ok: false, error: `Versi v${m[1]} tidak didukung. Versi yang didukung: ${SUPPORTED_VERSIONS.map((v) => `v${v}`).join(", ")}.` };
  const raw = firstJsonObject(text, (m.index ?? 0) + m[0].length);
  if (!raw) return { ok: false, error: "Blok JSON tidak ditemukan atau terpotong setelah baris awal. Pastikan seluruh teks tertempel." };
  let obj: unknown;
  try {
    obj = JSON.parse(raw);
  } catch (e) {
    return { ok: false, error: `JSON rusak: ${(e as Error).message}` };
  }
  const r = schema.safeParse(obj);
  if (!r.success) {
    const i = r.error.issues[0];
    return { ok: false, error: `Isi tidak valid pada "${i.path.join(".") || "(akar)"}": ${i.message}` };
  }
  return { ok: true, data: r.data, version: m[1] };
}

export const parseKit = (text: string) => parseBlock(text, "KIT", KitSchema);
export const parseReport = (text: string) => parseBlock(text, "REPORT", ReportSchema);

/** Susun Kit v1.4 dari Scene Pack dan pengaturannya. Hanya teks. */
export function buildKit(pack: ScenePack, s: SceneSettings): string {
  const kit: Kit = {
    project: s.project,
    ratio: s.ratio,
    model: s.model,
    overlayMode: s.overlayMode,
    promptLang: s.promptLang,
    delivery: s.delivery,
    draft: s.draft,
    naming: s.naming,
    slots: s.ingredients,
    scenes: pack.scenes.map((sc, i) => ({
      id: i + 1,
      seconds: s.clipSeconds[i],
      mode: s.mode,
      slots: s.ingredients,
      prompt: sc.prompt,
      startFramePrompt: sc.start_frame_prompt,
      endFramePrompt: sc.end_frame_prompt,
      overlay: sc.overlays,
      vo: sc.voiceover_line,
    })),
  };
  return `PROMO-KIT v1.4\n${JSON.stringify(kit)}`;
}

export const kitTooLarge = (text: string) => text.length > KIT_WARN_CHARS;

/** Scene yang perlu diperbaiki: status ulang/gagal, atau kemiripan <= 2. */
export const scenesToFix = (r: Report) => r.scenes.filter((s) => s.status !== "ok" || (s.similarity !== undefined && s.similarity <= 2));
