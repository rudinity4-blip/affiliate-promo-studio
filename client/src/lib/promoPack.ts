import { z } from "zod";
import { GeminiError, KeyPool, postGemini } from "./geminiClient";
import { FACELESS_RULE, getPreset } from "./motionPresets";

export const PromoPackSchema = z.object({
  observations: z.object({ subject: z.string(), scene: z.string(), product: z.string() }),
  creative_angle: z.string(),
  continuity_block: z.string(),
  product_lock: z.string(),
  segments: z
    .array(
      z.object({
        time: z.string(),
        start_frame_prompt_en: z.string(),
        end_frame_prompt_en: z.string(),
        prompt_en: z.string(),
        prompt_id: z.string(),
        extend_prompt_en: z.string(),
        overlays: z.array(z.object({ time: z.string(), text: z.string() })),
        voiceover_line: z.string(),
      }),
    )
    .min(1),
  negative_prompt: z.string(),
  hooks: z.array(z.string()),
  ctas: z.array(z.string()),
  captions: z.array(z.object({ platform: z.string(), text: z.string() })),
  hashtags: z.array(z.string()),
  voiceover: z.array(z.object({ style: z.string(), script: z.string() })),
  compliance_notes: z.array(z.string()),
});
export type PromoPack = z.infer<typeof PromoPackSchema>;

export type PackOptions = {
  pool: KeyPool; // 1–5 API key
  subjectFile: File; // gambar atau video
  productFile: File;
  productDescription: string;
  brand?: string;
  audience?: string;
  platform: string; // "TikTok Shop" | "Shopee Video" | ...
  totalSeconds: number;
  aspectRatio: string; // "9:16"
  tone: string;
  motionId: string; // id dari MOTION_PRESETS
};

const MODELS = ["gemini-3.5-flash-lite", "gemini-3.5-flash"]; // sama dengan app v0.4
const SEGMENT_SECONDS = 8;
const WORDS_PER_SECOND = 2.5; // perkiraan naskah Bahasa Indonesia

export function planSegments(total: number) {
  const out: { start: number; end: number }[] = [];
  for (let s = 0; s < total; s += SEGMENT_SECONDS) out.push({ start: s, end: Math.min(s + SEGMENT_SECONDS, total) });
  return out;
}

function buildInstruction(o: PackOptions) {
  const preset = getPreset(o.motionId);
  const plan = planSegments(o.totalSeconds)
    .map((p, i) => `Segment ${i + 1}: ${p.start}-${p.end}s | beat: ${preset.beats[i % preset.beats.length]} | max ${Math.round((p.end - p.start) * WORDS_PER_SECOND)} words voiceover`)
    .join("\n");
  return `You create a promo content pack for a short affiliate video. Return ONLY valid JSON, no markdown.
Platform: ${o.platform}. Aspect ratio: ${o.aspectRatio}. Total: ${o.totalSeconds}s. Tone: ${o.tone}.
Motion preset: ${preset.label} - ${preset.description}
${preset.faceless ? `FACELESS RULE: ${FACELESS_RULE}` : ""}
Brand: ${o.brand || "(none)"}. Audience: ${o.audience || "(general)"}.
Product description from user (the ONLY source of product facts): ${o.productDescription || "(none)"}.
Segment plan:\n${plan}
Rules:
- PRODUCT LOCK: from the product image write product_lock = one paragraph of literal visible facts (shape, proportions, named colors, material/finish, printed text and logo exactly as visible, parts/closures). Do not guess unseen sides. Paste product_lock verbatim into every prompt_en, start_frame_prompt_en and end_frame_prompt_en.
- FRAMES (image-to-video): start_frame_prompt_en and end_frame_prompt_en are STILL-image prompts (scene, hands/subject, product placed per product_lock, camera framing, lighting; NO motion words). The end frame of segment N is the start frame of segment N+1, so that next start_frame_prompt_en must describe the same image.
- prompt_en describes ONLY the motion and camera movement from the start frame to the end frame ("the product stays identical to the start frame"), but still opens with continuity_block and product_lock so it also works standalone without frames.
- Video is SILENT: every prompt_en must include "without sound, no dialogue, no music". Text overlays only.
- continuity_block: one detailed paragraph (subject or hands, outfit, set, lighting, camera style), repeated verbatim at the start of every prompt_en.
- extend_prompt_en: only the NEW action continuing the previous segment (for an Extend button), no repeated description.
- Never invent price, size, specs, discounts, certifications, health benefits, or performance claims.
- hooks: 5 options (first 3 seconds). ctas: 3. captions: one per platform (TikTok, Instagram, Facebook, Shopee Video). hashtags: 10-15 mixed broad and niche.
- voiceover: 3 styles (santai, meyakinkan, storytelling) in Bahasa Indonesia, matching the segment word budgets.
- prompt_id, hooks, ctas, captions, overlays, voiceover, compliance_notes in Bahasa Indonesia; all *_en fields in English.
JSON keys: observations{subject,scene,product}, creative_angle, continuity_block, product_lock, segments[{time,start_frame_prompt_en,end_frame_prompt_en,prompt_en,prompt_id,extend_prompt_en,overlays[{time,text}],voiceover_line}], negative_prompt, hooks[], ctas[], captions[{platform,text}], hashtags[], voiceover[{style,script}], compliance_notes[].`;
}

type Inline = { mimeType: string; data: string };

function canvasToInline(src: CanvasImageSource, w: number, h: number): Inline {
  const s = Math.min(1, 1280 / Math.max(w, h));
  const c = document.createElement("canvas");
  c.width = Math.round(w * s);
  c.height = Math.round(h * s);
  c.getContext("2d")!.drawImage(src, 0, 0, c.width, c.height);
  return { mimeType: "image/jpeg", data: c.toDataURL("image/jpeg", 0.85).split(",")[1] };
}

export async function imageToInline(file: File): Promise<Inline> {
  const bmp = await createImageBitmap(file);
  const out = canvasToInline(bmp, bmp.width, bmp.height);
  bmp.close();
  return out;
}

export async function videoToInlineFrames(file: File, count = 4): Promise<Inline[]> {
  const url = URL.createObjectURL(file);
  try {
    const v = document.createElement("video");
    v.muted = true;
    v.preload = "auto";
    v.src = url;
    await new Promise<void>((res, rej) => {
      v.onloadedmetadata = () => res();
      v.onerror = () => rej(new Error("Video tidak dapat dibaca."));
    });
    const frames: Inline[] = [];
    for (let i = 0; i < count; i++) {
      const seeked = new Promise<void>((res) => (v.onseeked = () => res()));
      v.currentTime = (v.duration * (i + 0.5)) / count;
      await seeked;
      frames.push(canvasToInline(v, v.videoWidth, v.videoHeight));
    }
    return frames;
  } finally {
    URL.revokeObjectURL(url);
  }
}

const textOf = (j: { candidates?: { content?: { parts?: { text?: string }[] } }[] }) =>
  (j.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? "").join("");

export async function generatePromoPack(o: PackOptions): Promise<PromoPack> {
  const subject = o.subjectFile.type.startsWith("video/") ? await videoToInlineFrames(o.subjectFile) : [await imageToInline(o.subjectFile)];
  const product = await imageToInline(o.productFile);
  const parts = [
    { text: buildInstruction(o) },
    { text: "SUBJECT / SCENE REFERENCE:" },
    ...subject.map((inlineData) => ({ inlineData })),
    { text: "PRODUCT REFERENCE:" },
    { inlineData: product },
  ];
  let lastErr: unknown;
  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const raw = await o.pool.run(model, async (key) =>
          textOf(await postGemini(model, key, { contents: [{ parts }], generationConfig: { responseMimeType: "application/json", temperature: 0.8 } })),
        );
        return PromoPackSchema.parse(JSON.parse(raw.trim().replace(/^```(?:json)?\s*|\s*```$/g, "")));
      } catch (e) {
        lastErr = e;
        const status = e instanceof GeminiError ? e.status : 0;
        if (status === 404) break; // model tidak tersedia: model berikutnya
        if (status === 400) throw e; // permintaan salah, bukan masalah key
      }
    }
  }
  throw lastErr;
}

// ---------- Frame gambar (opsional) untuk image-to-video ----------
const IMAGE_MODELS = ["gemini-2.5-flash-image", "gemini-3.1-flash-image-preview"]; // verifikasi di AI Studio; nama bisa berubah

export type KeyframeOptions = { pool: KeyPool; subjectFile: File; productFile: File; aspectRatio: string };

async function generateImage(pool: KeyPool, parts: unknown[]): Promise<string> {
  let lastErr: unknown = new Error("Model gambar tidak mengembalikan gambar (mungkin diblokir filter atau kuota habis).");
  for (const model of IMAGE_MODELS) {
    try {
      const j = await pool.run(model, (key) => postGemini(model, key, { contents: [{ parts }], generationConfig: { responseModalities: ["TEXT", "IMAGE"] } }));
      const img = (j.candidates?.[0]?.content?.parts ?? []).find((p: { inlineData?: Inline }) => p.inlineData)?.inlineData as Inline | undefined;
      if (img) return `data:${img.mimeType};base64,${img.data}`;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

/** Hasil: [awal S1, akhir S1 (= awal S2), akhir S2, ...] sebagai data URL. Jumlah = segmen + 1. */
export async function generateKeyframes(pack: PromoPack, o: KeyframeOptions, onFrame?: (i: number, dataUrl: string) => void): Promise<string[]> {
  const subject = o.subjectFile.type.startsWith("video/") ? await videoToInlineFrames(o.subjectFile, 1) : [await imageToInline(o.subjectFile)];
  const product = await imageToInline(o.productFile);
  const prompts = [pack.segments[0].start_frame_prompt_en, ...pack.segments.map((s) => s.end_frame_prompt_en)];
  const frames: string[] = [];
  for (let i = 0; i < prompts.length; i++) {
    const parts: unknown[] = [
      { text: `Create ONE photorealistic still image, aspect ratio ${o.aspectRatio}. The product must match the PRODUCT REFERENCE exactly (shape, color, label text, logo); do not redesign or invent details. ${pack.product_lock}\n${prompts[i]}` },
      { text: "PRODUCT REFERENCE:" },
      { inlineData: product },
      { text: "SUBJECT / SCENE REFERENCE:" },
      ...subject.map((inlineData) => ({ inlineData })),
    ];
    const m = frames[i - 1]?.match(/^data:(.+?);base64,(.+)$/);
    if (m) parts.push({ text: "PREVIOUS FRAME (keep the same scene, subject, lighting):" }, { inlineData: { mimeType: m[1], data: m[2] } });
    frames.push(await generateImage(o.pool, parts));
    onFrame?.(i, frames[i]);
  }
  return frames;
}

export function packToMarkdown(p: PromoPack): string {
  const seg = p.segments
    .map((s, i) => `### Segmen ${i + 1} (${s.time})\n**Frame awal (EN):** ${s.start_frame_prompt_en}\n\n**Frame akhir (EN):** ${s.end_frame_prompt_en}\n\n**Prompt gerak (EN):** ${s.prompt_en}\n\n**Lanjutan/Extend (EN):** ${s.extend_prompt_en}\n\n**Prompt (ID):** ${s.prompt_id}\n\n**Teks overlay:**\n${s.overlays.map((x) => `- ${x.time}: ${x.text}`).join("\n")}\n\n**Voice over:** ${s.voiceover_line}`)
    .join("\n\n");
  return `# Paket Promosi\n\n## Sudut kreatif\n${p.creative_angle}\n\n## Kunci produk\n${p.product_lock}\n\n## Blok kontinuitas\n${p.continuity_block}\n\n## Prompt video\n${seg}\n\n**Negative prompt:** ${p.negative_prompt}\n\n## Hook\n${p.hooks.map((h) => `- ${h}`).join("\n")}\n\n## CTA\n${p.ctas.map((h) => `- ${h}`).join("\n")}\n\n## Caption\n${p.captions.map((c) => `**${c.platform}:** ${c.text}`).join("\n\n")}\n\n## Hashtag\n${p.hashtags.join(" ")}\n\n## Naskah voice over\n${p.voiceover.map((v) => `**${v.style}:** ${v.script}`).join("\n\n")}\n\n## Catatan kepatuhan\n${p.compliance_notes.map((n) => `- ${n}`).join("\n")}\n`;
}
