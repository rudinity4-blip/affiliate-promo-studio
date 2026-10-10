import { z } from "zod";
import type { ScenePack, SceneSettings } from "./scenePack";

const KitScene = z.object({ id: z.string(), seconds: z.number(), mode: z.string(), slots: z.array(z.string()), prompt: z.string(), startFramePrompt: z.string(), endFramePrompt: z.string(), overlay: z.array(z.object({ t: z.string(), text: z.string() })), vo: z.string() });
export const KitSchema = z.object({ project: z.string(), ratio: z.string(), model: z.enum(["veo-3.1-lite", "omni-flash-1.1"]), overlayMode: z.enum(["space", "prompt", "none"]), slots: z.array(z.string()), scenes: z.array(KitScene) });
export type Kit = z.infer<typeof KitSchema>;
export const ReportSchema = z.object({ project: z.string(), scenes: z.array(z.object({ id: z.string(), status: z.enum(["ok", "ulang", "gagal"]), similarity: z.number().min(1).max(5), note: z.string(), videoMediaId: z.string().optional() })) });
export type Report = z.infer<typeof ReportSchema>;

export function buildKit(pack: ScenePack, settings: SceneSettings, project = "Affiliate Promo Studio"): string {
  const kit: Kit = { project, ratio: settings.ratio, model: settings.model, overlayMode: settings.overlayMode, slots: settings.ingredients, scenes: pack.scenes.map((s, i) => ({ id: `scene-${i + 1}`, seconds: settings.clipSeconds[i], mode: settings.mode, slots: settings.ingredients, prompt: s.prompt, startFramePrompt: s.start_frame_prompt, endFramePrompt: s.end_frame_prompt, overlay: s.overlays, vo: s.voiceover_line })) };
  return `PROMO-KIT v1.3\n${JSON.stringify(kit)}`;
}

export function parseKit(text: string): Kit {
  const lines = text.trim().split(/\n/);
  if (lines[0] !== "PROMO-KIT v1.3") throw new Error("Header Kit tidak sesuai. Harus PROMO-KIT v1.3.");
  try { return KitSchema.parse(JSON.parse(lines.slice(1).join("\n"))); } catch { throw new Error("Isi Kit tidak valid atau JSON rusak."); }
}

export function parseReport(text: string): Report {
  const lines = text.trim().split(/\n/);
  if (lines[0] !== "PROMO-REPORT v1.3") throw new Error("Header laporan tidak sesuai. Harus PROMO-REPORT v1.3.");
  try { return ReportSchema.parse(JSON.parse(lines.slice(1).join("\n"))); } catch { throw new Error("Isi laporan tidak valid. Periksa status, skor 1–5, dan JSON."); }
}
