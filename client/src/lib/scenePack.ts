import { z } from "zod";
import { GeminiError, KeyPool, postGemini } from "./geminiClient";
import { FACELESS_RULE, getPreset } from "./motionPresets";
import { actionRule, effectiveOverlay, overlayRule, planIngredients, presetToFormat } from "./adFormats";
import type { AdFormat, OverlayMode, ProductAngle } from "./adFormats";
import { imageToInline, videoToInlineFrames } from "./promoPack";

export type FlowModel = "veo-3.1-lite" | "omni-flash-1.1";
export type SceneMode = "ingredients" | "frames-first" | "frames-first-last" | "text";

// Sumber: halaman bantuan resmi Google Flow "models & supported features" (Okt 2026). Periksa lagi; bisa berubah.
const VEO: Record<SceneMode, number[]> = { text: [4, 6, 8], "frames-first": [4, 6, 8], "frames-first-last": [4, 6, 8], ingredients: [8] };
const OMNI: Record<SceneMode, number[]> = { text: [4, 6, 8, 10], "frames-first": [4, 6, 8, 10], "frames-first-last": [4, 6, 8, 10], ingredients: [4, 6, 8, 10] };

export const MODEL_LABEL: Record<FlowModel, string> = { "veo-3.1-lite": "Veo 3.1 - Lite", "omni-flash-1.1": "Omni Flash" };
export const allowedSeconds = (m: FlowModel, mode: SceneMode) => (m === "veo-3.1-lite" ? VEO : OMNI)[mode];
/** Extend: hanya klip Veo 8 detik dan harus Veo 3.1 Lite; Omni: belum tersedia. Scene Pack tidak membuat langkah Extend. */
export const extendSupported = (m: FlowModel) => m === "veo-3.1-lite";

/** Jumlah maksimum gambar referensi per generate menurut diagnostik SDK Flow (Okt 2026). */
export const MAX_REFS: Record<FlowModel, number> = { "veo-3.1-lite": 3, "omni-flash-1.1": 7 };

export type Delivery = "720p" | "1080p" | "4k";
export type Resolution = "360p" | "720p";

/** Kredit Omni per klip menurut halaman bantuan kredit Flow (perkiraan; cek akun). Veo: tidak dihitung di sini. */
const OMNI_CREDITS: Record<Resolution, Record<number, number>> = { "720p": { 4: 7, 6: 10, 8: 12, 10: 15 }, "360p": { 4: 4, 6: 5, 8: 6, 10: 7 } };
export const omniCredits = (seconds: number, res: Resolution): number | null => OMNI_CREDITS[res][seconds] ?? null;
export function creditEstimate(model: FlowModel, clipSeconds: number[], res: Resolution): number | null {
  if (model !== "omni-flash-1.1") return null;
  const parts = clipSeconds.map((s) => omniCredits(s, res));
  return parts.some((x) => x === null) ? null : (parts as number[]).reduce((a, b) => a + b, 0);
}

export function deliveryNote(d: Delivery): string {
  if (d === "720p") return "Unduh langsung 720p.";
  if (d === "1080p") return "Upscale ke 1080p di Flow: 0 kredit untuk pelanggan Plus, Pro, dan Ultra; tidak tersedia untuk akun tanpa langganan.";
  return "Upscale ke 4K di Flow: hanya paket Ultra, 50 kredit per upscale; hasil upscale dari 720p, bukan generate 4K asli. Lakukan di antarmuka Flow setelah klip disetujui.";
}

/** Penamaan file/folder dari templat buatan pengguna. Token: {proyek} {no} {model} {durasi} {tanggal}. */
export function applyNaming(tpl: string, v: { proyek: string; no?: number; model?: string; durasi?: number; tanggal?: string }): string {
  const map: Record<string, string> = {
    proyek: v.proyek,
    no: v.no !== undefined ? String(v.no).padStart(2, "0") : "",
    model: v.model ?? "",
    durasi: v.durasi !== undefined ? `${v.durasi}s` : "",
    tanggal: v.tanggal ?? new Date().toISOString().slice(0, 10),
  };
  const out = tpl
    .replace(/\{(\w+)\}/g, (_, k: string) => map[k] ?? "")
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^[_\-.]+|[_\-.]+$/g, "");
  return out || "proyek";
}

export function checkClip(m: FlowModel, mode: SceneMode, seconds: number): string | null {
  const ok = allowedSeconds(m, mode);
  return ok.includes(seconds) ? null : `${MODEL_LABEL[m]} dengan mode ${mode} hanya mendukung ${ok.join("/")} detik.`;
}

export type DurationPattern = "seimbang" | "maks";

/** Bagi durasi total menjadi klip yang sah. "seimbang": klip sama panjang (Omni 16 => [8,8]); "maks": isi klip terpanjang dulu (Omni 16 => [10,6]). */
export function planClipSeconds(m: FlowModel, mode: SceneMode, total: number, pattern: DurationPattern = "seimbang", maxClips = 4): number[] {
  const opts = allowedSeconds(m, mode);
  const max = Math.max(...opts);
  const t = Math.max(total, Math.min(...opts));
  if (pattern === "seimbang") {
    const n = Math.min(Math.ceil(t / max), maxClips);
    const each = t / n;
    return Array.from({ length: n }, () => opts.find((s) => s >= each) ?? max);
  }
  const out: number[] = [];
  let left = t;
  while (left > 0 && out.length < maxClips) {
    const take = Math.min(left, max);
    out.push(opts.find((s) => s >= take) ?? max);
    left -= take;
  }
  return out;
}

const Overlay = z.object({ t: z.string(), text: z.string() });
export const ScenePackSchema = z.object({
  observations: z.object({ subject: z.string(), scene: z.string(), product: z.string() }),
  creative_angle: z.string(),
  continuity_block: z.string(),
  product_lock: z.string(),
  scenes: z
    .array(
      z.object({
        role: z.string(),
        shot: z.string(),
        prompt: z.string(),
        start_frame_prompt: z.string().default(""),
        end_frame_prompt: z.string().default(""),
        overlays: z.array(Overlay),
        voiceover_line: z.string(),
      }),
    )
    .min(1),
  assembly_notes: z.string(),
  negative_prompt: z.string(),
  hooks: z.array(z.string()),
  ctas: z.array(z.string()),
  captions: z.array(z.object({ platform: z.string(), text: z.string() })),
  hashtags: z.array(z.string()),
  voiceover: z.array(z.object({ style: z.string(), script: z.string() })),
  compliance_notes: z.array(z.string()),
});
export type ScenePack = z.infer<typeof ScenePackSchema>;

export type SceneOptions = {
  pool: KeyPool;
  subjectFile: File; // gambar/video subjek atau ruang
  subjectRole: "aktor" | "ruang";
  productFile: File; // sisi depan
  angleFiles?: { samping?: File; atas?: File }; // sisi produk tambahan (mis. tumbler)
  productDescription: string;
  brand?: string;
  audience?: string;
  platform: string;
  ratio: string; // "9:16"
  totalSeconds: number;
  tone: string;
  model: FlowModel;
  mode: SceneMode;
  format?: AdFormat; // format iklan; bila kosong dipakai motionId
  motionId?: string; // preset lama
  overlayMode?: OverlayMode; // default "space"
  pattern?: DurationPattern; // default "seimbang"
  promptLang?: "id" | "en"; // bahasa prompt; default "id"
  delivery?: Delivery; // target unduhan; default "720p"
  draft?: boolean; // Omni: draf 360p dulu
  project?: string; // nama proyek untuk penamaan
  namingFolder?: string; // default "{proyek}_{tanggal}"
  namingFile?: string; // default "{proyek}_scene-{no}"
};

export type SceneSettings = {
  model: FlowModel;
  mode: SceneMode;
  ratio: string;
  clipSeconds: number[];
  ingredients: string[];
  dropped: string[];
  sideAllowed: boolean;
  overlayMode: OverlayMode;
  formatLabel: string;
  promptLang: "id" | "en";
  delivery: Delivery;
  draft: boolean;
  project: string;
  naming: { folder: string; file: string };
};

const TEXT_MODELS = ["gemini-3.5-flash-lite", "gemini-3.5-flash"];
const WPS = 2.5; // kata per detik, Bahasa Indonesia

function buildInstruction(o: SceneOptions, secs: number[], sideAllowed: boolean, overlay: OverlayMode) {
  const lang = o.promptLang ?? "id";
  const f = o.format ?? presetToFormat(getPreset(o.motionId ?? ""));
  const plan = secs.map((s, i) => `Scene ${i + 1}: ${s}s | beat: ${f.beats[i % f.beats.length]} | max ${Math.round(s * WPS)} words voiceover`).join("\n");
  const style =
    o.model === "omni-flash-1.1"
      ? "MODEL STYLE (Omni Flash): write SHORT focused prompts (max ~60 words). Rely on the reference images for appearance: say 'the product from the product reference' and 'the room from the room reference' instead of re-describing them. No long adjective lists."
      : "MODEL STYLE (Veo 3.1 Lite): write detailed prompts. Each prompt opens with the continuity_block (environment, lighting, camera) and includes the product_lock text, then the motion and camera.";
  const frames =
    o.mode === "frames-first"
      ? "FRAMES: fill start_frame_prompt (a STILL-image prompt, no motion words); leave end_frame_prompt empty."
      : o.mode === "frames-first-last"
        ? "FRAMES: fill start_frame_prompt and end_frame_prompt (STILL-image prompts, no motion words)."
        : "FRAMES: leave start_frame_prompt and end_frame_prompt empty strings.";
  return `You create a scene pack for short affiliate videos that will be generated clip by clip in Google Flow and assembled in Flow's Scenebuilder. Return ONLY valid JSON, no markdown.
Platform: ${o.platform}. Aspect ratio: ${o.ratio}. Tone: ${o.tone}. Generation mode: ${o.mode}.
AD FORMAT: ${f.label} - ${f.description}
${f.faceless ? `FACELESS RULE: ${FACELESS_RULE}` : "The actor's face may be visible and follows the subject reference."}
${actionRule(sideAllowed)}
${overlayRule(overlay)}
Brand: ${o.brand || "(none)"}. Audience: ${o.audience || "(general)"}.
Product description from user (the ONLY source of product facts): ${o.productDescription || "(none)"}.
Scene plan (exactly ${secs.length} scenes):\n${plan}
Rules:
- Scenes are SEPARATE SHOTS joined by cuts in Scenebuilder, not one continuous action. Each scene must work standalone, with different framing per scene, but the same environment, lighting, and product.
- ${style}
- ${frames}
- product_lock: one paragraph of literal visible facts from the product images (shape, proportions, named colors, material/finish, printed text/logo exactly as visible, parts). Do not guess unseen sides.
- continuity_block: one paragraph (environment, lighting, camera style, hands/subject), identical across scenes.
- Prefer a static or very slow camera; avoid complex camera moves.
- Every prompt must say ${lang === "id" ? '"tanpa suara, tanpa dialog, tanpa musik"' : '"without sound, no dialogue, no music"'} and ${overlay === "prompt" ? (lang === "id" ? '"tanpa watermark"' : '"no watermark"') : lang === "id" ? '"tanpa teks, tanpa watermark"' : '"no text, no watermark"'}.
- Never invent price, size, specs, discounts, certifications, health benefits, or performance claims.
- assembly_notes: how to order the scenes and what to trim at the cuts (Bahasa Indonesia).
- hooks: 5 (first 3 seconds). ctas: 3. captions: TikTok, Instagram, Facebook, Shopee Video. hashtags: 10-15. voiceover: 3 styles (santai, meyakinkan, storytelling) in Bahasa Indonesia within the per-scene word budgets.
- ${lang === "id" ? "Write ALL fields, including prompt, start_frame_prompt, end_frame_prompt, negative_prompt, continuity_block, and product_lock, in natural, simple Bahasa Indonesia with short sentences, because the user will edit them. Refer to the reference images as 'foto produk', 'foto ruang' or 'foto aktor', never as 'ingredients'." : "shot, overlays, voiceover_line, assembly_notes, hooks, ctas, captions, voiceover, compliance_notes in Bahasa Indonesia; prompt, start_frame_prompt, end_frame_prompt, negative_prompt, continuity_block, product_lock in English."}
JSON keys: observations{subject,scene,product}, creative_angle, continuity_block, product_lock, scenes[{role,shot,prompt,start_frame_prompt,end_frame_prompt,overlays[{t,text}],voiceover_line}], assembly_notes, negative_prompt, hooks[], ctas[], captions[{platform,text}], hashtags[], voiceover[{style,script}], compliance_notes[].`;
}

export async function generateScenePack(o: SceneOptions): Promise<{ pack: ScenePack; settings: SceneSettings }> {
  const f = o.format ?? presetToFormat(getPreset(o.motionId ?? ""));
  const clipSeconds = planClipSeconds(o.model, o.mode, o.totalSeconds, o.pattern ?? "seimbang");
  const angles: ProductAngle[] = ["depan", ...(o.angleFiles?.samping ? (["samping"] as const) : []), ...(o.angleFiles?.atas ? (["atas"] as const) : [])];
  const ing = planIngredients(angles, o.subjectRole, MAX_REFS[o.model]);
  const overlay = effectiveOverlay(o.overlayMode ?? "space", o.model);
  const extra = [
    ...(o.angleFiles?.samping ? [{ text: "PRODUCT SIDE REFERENCE:" }, { inlineData: await imageToInline(o.angleFiles.samping) }] : []),
    ...(o.angleFiles?.atas ? [{ text: "PRODUCT TOP REFERENCE:" }, { inlineData: await imageToInline(o.angleFiles.atas) }] : []),
  ];
  const subject = o.subjectFile.type.startsWith("video/") ? await videoToInlineFrames(o.subjectFile) : [await imageToInline(o.subjectFile)];
  const product = await imageToInline(o.productFile);
  const parts = [
    { text: buildInstruction(o, clipSeconds, ing.sideAllowed, overlay) },
    { text: `${o.subjectRole.toUpperCase()} / ROOM REFERENCE:` },
    ...subject.map((inlineData) => ({ inlineData })),
    { text: "PRODUCT REFERENCE:" },
    { inlineData: product },
    ...extra,
  ];
  let lastErr: unknown;
  for (const model of TEXT_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const raw = await o.pool.run(model, async (key) => {
          const j = await postGemini(model, key, { contents: [{ parts }], generationConfig: { responseMimeType: "application/json", temperature: 0.7 } });
          return (j.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? "").join("");
        });
        const pack = ScenePackSchema.parse(JSON.parse(raw.trim().replace(/^```(?:json)?\s*|\s*```$/g, "")));
        if (pack.scenes.length !== clipSeconds.length) throw new Error(`Jumlah scene ${pack.scenes.length} tidak sama dengan rencana ${clipSeconds.length}.`);
        return { pack, settings: { model: o.model, mode: o.mode, ratio: o.ratio, clipSeconds, ingredients: ing.slots, dropped: ing.dropped, sideAllowed: ing.sideAllowed, overlayMode: overlay, formatLabel: f.label, promptLang: o.promptLang ?? "id", delivery: o.delivery ?? "720p", draft: !!o.draft && o.model === "omni-flash-1.1", project: o.project ?? "proyek", naming: { folder: o.namingFolder ?? "{proyek}_{tanggal}", file: o.namingFile ?? "{proyek}_scene-{no}" } } };
      } catch (e) {
        lastErr = e;
        const status = e instanceof GeminiError ? e.status : 0;
        if (status === 404) break;
        if (status === 400) throw e;
      }
    }
  }
  throw lastErr;
}

/** Langkah demi langkah untuk dikerjakan di antarmuka Flow, lalu perakitan di Scenebuilder. */
export function scenePackToMarkdown(p: ScenePack, s: SceneSettings): string {
  const steps = p.scenes
    .map((sc, i) => {
      const sec = s.clipSeconds[i];
      const warn = checkClip(s.model, s.mode, sec);
      const frames = s.mode.startsWith("frames")
        ? `\n**Frame awal (buat di Flow mode gambar, lalu pakai sebagai Start frame):** ${sc.start_frame_prompt}${s.mode === "frames-first-last" ? `\n**Frame akhir:** ${sc.end_frame_prompt}` : ""}\n`
        : "";
      return `### Scene ${i + 1} - ${sc.role} (${sec} detik)\n${warn ? `PERINGATAN: ${warn}\n` : ""}**Setelan Flow:** model ${MODEL_LABEL[s.model]}, ${s.ratio}, ${sec} detik, mode ${s.mode}${s.mode === "ingredients" ? `, lampirkan: ${s.ingredients.join(", ")}` : ""}\n**Shot:** ${sc.shot}${frames}\n**Prompt (${s.promptLang === "id" ? "Bahasa Indonesia, bebas diedit" : "English"}):**\n${sc.prompt}\n\n**Cek hasil:** bentuk, warna, dan label produk sama dengan foto; tidak ada teks atau watermark; durasi ${sec} detik.\n**Lalu:** More > Add to Scene.\n\n**Overlay:** ${sc.overlays.map((x) => `${x.t} "${x.text}"`).join("; ")} (${s.overlayMode === "prompt" ? "diminta lewat prompt; cek ejaan, jika salah tambahkan di editor" : s.overlayMode === "space" ? "tambahkan di editor; ruang kosong atas 15% dan bawah 25% sudah disiapkan" : "tambahkan di editor"})\n**Voice over:** ${sc.voiceover_line}`;
    })
    .join("\n\n");
  return `# Scene Pack\n\n**Format:** ${s.formatLabel}. **Aset yang dilampirkan:** ${s.ingredients.join(", ")}.${s.dropped.length ? ` Tidak muat batas lampiran: ${s.dropped.join(", ")}.` : ""}${s.sideAllowed ? "" : " Tanpa foto sisi tambahan: produk tidak diputar atau dimiringkan."}\n\n## Sudut kreatif\n${p.creative_angle}\n\n## Kunci produk\n${p.product_lock}\n\n## Blok kontinuitas\n${p.continuity_block}\n\n## Langkah di Flow\n${steps}\n\n## Kualitas dan unduhan\n${s.draft ? `Mode draf: generate 360p dulu${creditEstimate(s.model, s.clipSeconds, "360p") !== null ? ` (perkiraan ${creditEstimate(s.model, s.clipSeconds, "360p")} kredit untuk semua scene)` : ""}, setujui, lalu generate ulang 720p${creditEstimate(s.model, s.clipSeconds, "720p") !== null ? ` (perkiraan ${creditEstimate(s.model, s.clipSeconds, "720p")} kredit)` : ""}.\n` : ""}${deliveryNote(s.delivery)} Angka kredit perkiraan; cek akunmu.\n\n## Penamaan\nFolder: ${applyNaming(s.naming.folder, { proyek: s.project })}\n${p.scenes.map((_, i) => `- ${applyNaming(s.naming.file, { proyek: s.project, no: i + 1, model: MODEL_LABEL[s.model], durasi: s.clipSeconds[i] })}.mp4`).join("\n")}\n\n## Perakitan di Scenebuilder\nUrutkan scene sesuai nomor, potong sambungan seperlunya, pratinjau, lalu unduh scene. ${p.assembly_notes}\n\n**Negative prompt:** ${p.negative_prompt}\n\n## Hook\n${p.hooks.map((h) => `- ${h}`).join("\n")}\n\n## CTA\n${p.ctas.map((h) => `- ${h}`).join("\n")}\n\n## Caption\n${p.captions.map((c) => `**${c.platform}:** ${c.text}`).join("\n\n")}\n\n## Hashtag\n${p.hashtags.join(" ")}\n\n## Naskah voice over\n${p.voiceover.map((v) => `**${v.style}:** ${v.script}`).join("\n\n")}\n\nCatatan: audio bawaan model harus dibisukan di editor.\n\n## Catatan kepatuhan\n${p.compliance_notes.map((n) => `- ${n}`).join("\n")}\n`;
}
