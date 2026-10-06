export class GeminiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
export async function postGemini(model: string, key: string, body: unknown) {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": key }, body: JSON.stringify(body) });
  if (!r.ok) { const t = (await r.text()).split(key).join("[REDACTED]"); throw new GeminiError(`Gemini ${r.status}: ${t.slice(0, 300)}`, r.status); }
  return r.json();
}
type Slot = { key: string; dead: boolean; until: Record<string, number> };
export class KeyPool {
  private slots: Slot[]; private next = 0;
  constructor(keys: string[]) { const uniq = Array.from(new Set(keys.map((k) => k.trim()).filter(Boolean))).slice(0, 5); if (!uniq.length) throw new Error("Masukkan minimal 1 API key."); this.slots = uniq.map((key) => ({ key, dead: false, until: {} })); }
  get status() { const now = Date.now(); return this.slots.map((s, i) => ({ slot: i + 1, tail: s.key.slice(-4), state: s.dead ? "mati" : Object.values(s.until).some((t) => t > now) ? "cooldown" : "siap" })); }
  private pick(scope: string): Slot | null { const now = Date.now(); for (let i = 0; i < this.slots.length; i++) { const j = (this.next + i) % this.slots.length; const s = this.slots[j]; if (!s.dead && (s.until[scope] ?? 0) <= now) { this.next = (j + 1) % this.slots.length; return s; } } return null; }
  async run<T>(scope: string, fn: (key: string) => Promise<T>): Promise<T> { let lastErr: unknown; for (let n = 0; n < this.slots.length; n++) { const s = this.pick(scope); if (!s) break; try { return await fn(s.key); } catch (e) { lastErr = e; const st = e instanceof GeminiError ? e.status : 0; const badKey = st === 401 || st === 403 || (st === 400 && /api key/i.test((e as Error).message)); if (badKey) s.dead = true; else if (st === 429) s.until[scope] = Date.now() + 60_000; else if (st === 0 || st >= 500) s.until[scope] = Date.now() + 10_000; else throw e; } } throw lastErr ?? new Error("Semua API key sedang cooldown atau tidak valid."); }
}
