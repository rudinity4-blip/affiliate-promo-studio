import { z } from "zod";
import { GeminiError, KeyPool, postGemini } from "./geminiClient";
import { videoToInlineFrames } from "./promoPack";

export const ReferenceAnalysisSchema = z.object({
  duration_seconds: z.number(),
  pacing: z.string(),
  setting: z.string(),
  lighting: z.string(),
  color_style: z.string(),
  shots: z
    .array(
      z.object({
        start: z.number(),
        end: z.number(),
        shot_type: z.string(),
        camera: z.string(),
        action: z.string(),
        composition: z.string(),
        transition_out: z.string(),
      }),
    )
    .min(1),
  text_overlay_style: z.string(),
  summary: z.string(),
});
export type ReferenceAnalysis = z.infer<typeof ReferenceAnalysisSchema>;

const ANALYSIS_MODELS = ["gemini-3.5-flash", "gemini-3.5-flash-lite"]; // sama dengan app v0.4; verifikasi di AI Studio
const INLINE_VIDEO_MAX = 15 * 1024 * 1024; // di atas ini dikirim sebagai frame bertimestamp
const FRAME_COUNT = 10;

const INSTRUCTION = `You analyze a reference short video ONLY to extract its scene format so another video can imitate the format. Return ONLY valid JSON.
Describe structure and style: shot list with timing, shot type (wide/medium/close-up/top-down/macro), camera movement (static/handheld/push-in/pull-out/pan/orbit), subject action beats, composition, transition between shots, setting, lighting, color style, pacing (cuts per ~5 seconds), and the STYLE of on-screen text (position, size, animation), not the words.
Rules: describe people generically (e.g. "a woman in casual clothes"); never name or identify anyone; do not read out brand names, logos, lyrics, music, or claims; do not transcribe speech. Max 12 shots; merge very short cuts. Times in seconds.
JSON keys: duration_seconds, pacing, setting, lighting, color_style, shots[{start,end,shot_type,camera,action,composition,transition_out}], text_overlay_style, summary.`;

function readDuration(file: File): Promise<number> {
  const url = URL.createObjectURL(file);
  return new Promise((res, rej) => {
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      res(v.duration);
    };
    v.onerror = () => {
      URL.revokeObjectURL(url);
      rej(new Error("Video referensi tidak dapat dibaca."));
    };
    v.src = url;
  });
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res((r.result as string).split(",")[1]);
    r.onerror = () => rej(r.error);
    r.readAsDataURL(file);
  });
}

export async function analyzeReference(file: File, pool: KeyPool): Promise<ReferenceAnalysis> {
  const duration = await readDuration(file);
  const parts: unknown[] = [{ text: `${INSTRUCTION}\nVideo duration: ${duration.toFixed(1)}s.` }];
  if (file.size <= INLINE_VIDEO_MAX) {
    parts.push({ inlineData: { mimeType: file.type || "video/mp4", data: await fileToBase64(file) } });
  } else {
    const frames = await videoToInlineFrames(file, FRAME_COUNT);
    frames.forEach((f, i) => parts.push({ text: `Frame at ${(((i + 0.5) * duration) / FRAME_COUNT).toFixed(1)}s:` }, { inlineData: f }));
  }
  let lastErr: unknown;
  for (const model of ANALYSIS_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const raw = await pool.run(model, async (key) => {
          const j = await postGemini(model, key, { contents: [{ parts }], generationConfig: { responseMimeType: "application/json", temperature: 0.3 } });
          return (j.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? "").join("");
        });
        const parsed = ReferenceAnalysisSchema.parse(JSON.parse(raw.trim().replace(/^```(?:json)?\s*|\s*```$/g, "")));
        return { ...parsed, duration_seconds: duration };
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
