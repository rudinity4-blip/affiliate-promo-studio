import { z } from "zod";

export const PromoPackSchema = z.object({
  observations: z.object({ subject: z.string(), scene: z.string(), product: z.string() }),
  creative_angle: z.string(),
  continuity_block: z.string(),
  segments: z.array(z.object({
    time: z.string(), prompt_en: z.string(), prompt_id: z.string(), extend_prompt_en: z.string(),
    overlays: z.array(z.object({ time: z.string(), text: z.string() })), voiceover_line: z.string(),
  })).min(1),
  negative_prompt: z.string(), hooks: z.array(z.string()), ctas: z.array(z.string()),
  captions: z.array(z.object({ platform: z.string(), text: z.string() })), hashtags: z.array(z.string()),
  voiceover: z.array(z.object({ style: z.string(), script: z.string() })), compliance_notes: z.array(z.string()),
});
export type PromoPack = z.infer<typeof PromoPackSchema>;
export type PackOptions = {
  apiKey: string; subjectFile: File; productFile: File; productDescription: string; brand?: string;
  audience?: string; platform: string; totalSeconds: number; aspectRatio: string; tone: string; motion: string;
  promotionStrategy?: { category: string; title: string; noAudioStrategy: string; audience: string };
};
const MODELS = ["gemini-3.5-flash-lite", "gemini-3.5-flash"];
const SEGMENT_SECONDS = 8;
const WORDS_PER_SECOND = 2.5;
export function planSegments(total: number) { const out: { start: number; end: number }[] = []; for (let s = 0; s < total; s += SEGMENT_SECONDS) out.push({ start: s, end: Math.min(s + SEGMENT_SECONDS, total) }); return out; }
function buildInstruction(o: PackOptions) {
  const strategy = o.promotionStrategy ? `Strategi tambahan: ${o.promotionStrategy.category} — ${o.promotionStrategy.title}. ${o.promotionStrategy.noAudioStrategy}. Target: ${o.promotionStrategy.audience}.` : "Tidak ada strategi tambahan.";
  const plan = planSegments(o.totalSeconds).map((p, i) => `Segment ${i + 1}: ${p.start}-${p.end}s, max ${Math.round((p.end - p.start) * WORDS_PER_SECOND)} words voiceover`).join("\n");
  return `You create a promo content pack for a short affiliate video. Return ONLY valid JSON, no markdown.
Platform: ${o.platform}. Aspect ratio: ${o.aspectRatio}. Total: ${o.totalSeconds}s. Tone: ${o.tone}. Motion: ${o.motion}.
Brand: ${o.brand || "(none)"}. Audience: ${o.audience || "(general)"}.
Product description from user (the ONLY source of product facts): ${o.productDescription || "(none)"}.
${strategy}
Segment plan:\n${plan}
Rules:
- Video is SILENT: every prompt_en must include "without sound, no dialogue, no music". Text overlays only.
- continuity_block: one detailed paragraph (subject appearance, outfit, set, lighting, camera style). REPEAT it verbatim at the start of every segment prompt_en.
- extend_prompt_en: only the NEW action continuing the previous segment, no repeated description.
- Preserve subject identity and product shape/color/logo. Product-first, polite commercial framing.
- Never invent price, size, specs, discounts, certifications, health benefits, or performance claims.
- hooks: 5 options (first 3 seconds). ctas: 3. captions: one per platform (TikTok, Instagram, Facebook, Shopee Video). hashtags: 10-15 mixed broad and niche.
- voiceover: 3 styles (santai, meyakinkan, storytelling) in Bahasa Indonesia, matching segment word budgets.
- prompt_id, hooks, ctas, captions, overlays, voiceover_line, voiceover, compliance_notes in Bahasa Indonesia; prompt_en in English.
JSON keys: observations{subject,scene,product}, creative_angle, continuity_block, segments[{time,prompt_en,prompt_id,extend_prompt_en,overlays[{time,text}],voiceover_line}], negative_prompt, hooks[], ctas[], captions[{platform,text}], hashtags[], voiceover[{style,script}], compliance_notes[].`;
}
type Inline = { mimeType: string; data: string };
function canvasToInline(src: CanvasImageSource, w: number, h: number): Inline { const s = Math.min(1, 1280 / Math.max(w, h)); const c = document.createElement("canvas"); c.width = Math.round(w * s); c.height = Math.round(h * s); c.getContext("2d")!.drawImage(src, 0, 0, c.width, c.height); return { mimeType: "image/jpeg", data: c.toDataURL("image/jpeg", 0.85).split(",")[1] }; }
export async function imageToInline(file: File): Promise<Inline> { const bmp = await createImageBitmap(file); const out = canvasToInline(bmp, bmp.width, bmp.height); bmp.close(); return out; }
export async function videoToInlineFrames(file: File, count = 4): Promise<Inline[]> { const url = URL.createObjectURL(file); try { const v = document.createElement("video"); v.muted = true; v.preload = "auto"; v.src = url; await new Promise<void>((res, rej) => { v.onloadedmetadata = () => res(); v.onerror = () => rej(new Error("Video tidak dapat dibaca.")); }); const frames: Inline[] = []; for (let i = 0; i < count; i++) { await new Promise<void>((res) => { v.onseeked = () => res(); v.currentTime = (v.duration * (i + 0.5)) / count; }); frames.push(canvasToInline(v, v.videoWidth, v.videoHeight)); } return frames; } finally { URL.revokeObjectURL(url); } }
class GeminiError extends Error { constructor(message: string, public status: number) { super(message); } }
async function callGemini(model: string, apiKey: string, parts: unknown[]) { const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey }, body: JSON.stringify({ contents: [{ parts }], generationConfig: { responseMimeType: "application/json", temperature: 0.8 } }) }); if (!r.ok) { const t = (await r.text()).split(apiKey).join("[REDACTED]"); throw new GeminiError(`Gemini ${r.status}: ${t.slice(0, 300)}`, r.status); } const j = await r.json(); return (j.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? "").join(""); }
function friendlyGeminiError(error: unknown) { const raw = error instanceof Error ? error.message : String(error); if (/401|403|key|permission|unauthenticated/i.test(raw)) return "API key Gemini tidak valid atau belum memiliki izin. Periksa key di Google AI Studio."; if (/404|model/i.test(raw)) return "Model Gemini tidak tersedia untuk key ini. Coba key atau model lain."; return `Gemini belum dapat digunakan: ${raw.replace(/AIza[\w-]+/g, "[REDACTED]")}`; }
export async function checkGeminiConnection(apiKey: string): Promise<{ modelUsed: string; message: string }> { if (!apiKey.trim()) throw new Error("API key Gemini belum diisi."); let last: unknown; for (const model of MODELS) { try { const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}`, { headers: { "x-goog-api-key": apiKey } }); if (r.ok) return { modelUsed: model, message: "Koneksi Gemini siap." }; last = new Error(`Gemini ${r.status}`); if (r.status !== 404) break; } catch (e) { last = e; } } throw new Error(friendlyGeminiError(last)); }
export async function generatePromoPack(o: PackOptions): Promise<PromoPack> { try { const subject = o.subjectFile.type.startsWith("video/") ? await videoToInlineFrames(o.subjectFile) : [await imageToInline(o.subjectFile)]; const product = await imageToInline(o.productFile); const parts = [{ text: buildInstruction(o) }, { text: "SUBJECT / SCENE REFERENCE:" }, ...subject.map((inlineData) => ({ inlineData })), { text: "PRODUCT REFERENCE:" }, { inlineData: product }]; let lastErr: unknown; for (const model of MODELS) for (let attempt = 0; attempt < 2; attempt++) { try { const raw = await callGemini(model, o.apiKey, parts); return PromoPackSchema.parse(JSON.parse(raw.trim().replace(/^```(?:json)?\s*|\s*```$/g, ""))); } catch (e) { lastErr = e; const status = e instanceof GeminiError ? e.status : 0; if ([400, 401, 403].includes(status)) throw e; if (status === 404) break; } } throw lastErr; } catch (e) { throw new Error(friendlyGeminiError(e)); } }
export function packToMarkdown(p: PromoPack): string { const seg = p.segments.map((s, i) => `### Segmen ${i + 1} (${s.time})\n**Prompt (EN):** ${s.prompt_en}\n\n**Lanjutan/Extend (EN):** ${s.extend_prompt_en}\n\n**Prompt (ID):** ${s.prompt_id}\n\n**Teks overlay:**\n${s.overlays.map((x) => `- ${x.time}: ${x.text}`).join("\n")}\n\n**Voice over:** ${s.voiceover_line}`).join("\n\n"); return `# Paket Promosi\n\n## Observasi\n- Subjek: ${p.observations.subject}\n- Adegan: ${p.observations.scene}\n- Produk: ${p.observations.product}\n\n## Sudut kreatif\n${p.creative_angle}\n\n## Blok kontinuitas\n${p.continuity_block}\n\n## Prompt video\n${seg}\n\n**Negative prompt:** ${p.negative_prompt}\n\n## Hook\n${p.hooks.map((h) => `- ${h}`).join("\n")}\n\n## CTA\n${p.ctas.map((h) => `- ${h}`).join("\n")}\n\n## Caption\n${p.captions.map((c) => `**${c.platform}:** ${c.text}`).join("\n\n")}\n\n## Hashtag\n${p.hashtags.join(" ")}\n\n## Naskah voice over\n${p.voiceover.map((v) => `**${v.style}:** ${v.script}`).join("\n\n")}\n\n## Catatan kepatuhan\n${p.compliance_notes.map((n) => `- ${n}`).join("\n")}\n`; }
