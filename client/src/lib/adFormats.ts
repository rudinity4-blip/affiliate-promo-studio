import type { MotionPreset } from "./motionPresets";
import type { FlowModel } from "./scenePack";

export type SubjectKind = "aktor" | "ruang";
export type ProductKind = "fashion" | "umum";
export type ProductAngle = "depan" | "samping" | "atas";

export type AdFormat = {
  id: string;
  label: string;
  subject: SubjectKind;
  product: ProductKind | "any";
  faceless: boolean;
  description: string;
  beats: string[]; // scene ke-i memakai beats[i % beats.length]
};

export const AD_FORMATS: AdFormat[] = [
  {
    id: "aktor-cermin",
    label: "Memakai di depan cermin",
    subject: "aktor",
    product: "fashion",
    faceless: false,
    description:
      "The actor wears the garment in front of a full-length mirror in a minimal room, front-facing, with small natural posing movements; fit and details of the garment stay visible. Turns or back views only if a side/back reference is provided.",
    beats: ["actor wearing the garment stands in front of a full-length mirror, front-facing", "actor adjusts the garment and makes small poses, garment details visible", "actor settles into a relaxed pose, full outfit visible"],
  },
  {
    id: "aktor-ruang",
    label: "Memakai di ruang minimalis",
    subject: "aktor",
    product: "fashion",
    faceless: false,
    description:
      "The actor wears the garment in a minimal room with soft daylight, front-facing, with small natural movements (adjusting a sleeve, light sway); fit and details stay visible. Turns or back views only if a side/back reference is provided.",
    beats: ["actor wearing the garment stands in a minimal room, front-facing", "actor makes small natural movements, fit and details visible", "actor ends in a relaxed pose, full outfit visible"],
  },
  {
    id: "aktor-pakai-umum",
    label: "Aktor menggunakan produk",
    subject: "aktor",
    product: "umum",
    faceless: false,
    description: "The actor uses the product in a simple natural way in a minimal setting (for example drinks from it or applies it), with the product visible and mostly facing the camera.",
    beats: ["actor picks up the product and starts using it naturally", "actor continues the use with relaxed movements, product clearly visible", "actor shows the product toward the camera after using it"],
  },
  {
    id: "aktor-pegang",
    label: "Aktor memegang produk",
    subject: "aktor",
    product: "any",
    faceless: false,
    description: "The actor simply holds the product at chest height facing the camera with small natural movements (slight sway, nod, glance at the camera); no complex actions.",
    beats: ["actor stands holding the product at chest height, label facing the camera", "actor lifts the product slightly toward the camera and lowers it again", "actor holds the product steady and looks at the camera"],
  },
  {
    id: "tangan-meja",
    label: "Tangan memegang produk di atas meja minimalis",
    subject: "ruang",
    product: "any",
    faceless: true,
    description: "Only hands are visible: they hold the product above a minimal table and set it down, with the front of the product facing the camera at all times.",
    beats: ["hands bring the product into the frame and hold it above the table, front facing the camera", "hands hold the product steady and adjust the grip without turning it", "hands set the product down on the table, front facing the camera"],
  },
  {
    id: "unboxing-meja",
    label: "Unboxing tangan di meja minimalis",
    subject: "ruang",
    product: "any",
    faceless: true,
    description: "Only hands are visible: they open a plain unprinted box on a minimal table and reveal the product, front facing the camera.",
    beats: ["plain sealed box on the table, hands enter the frame", "box opened, product revealed", "product set upright on the table, front facing the camera"],
  },
];

/** Format yang cocok untuk kombinasi input; yang spesifik produk lebih dulu. */
export function suggestFormats(subject: SubjectKind, product: ProductKind): AdFormat[] {
  const list = AD_FORMATS.filter((f) => f.subject === subject && (f.product === "any" || f.product === product));
  return [...list.filter((f) => f.product !== "any"), ...list.filter((f) => f.product === "any")];
}

/** Preset motion lama dijadikan format agar tetap bisa dipakai. */
export const presetToFormat = (p: MotionPreset): AdFormat => ({
  id: p.id,
  label: p.label,
  subject: p.faceless ? "ruang" : "aktor",
  product: "any",
  faceless: p.faceless,
  description: p.description,
  beats: p.beats,
});

// ---------- Overlay ----------
export type OverlayMode = "space" | "prompt" | "none";

export const SAFE_SPACE_RULE =
  "Composition for overlays: keep the top 15% and the bottom 25% of the frame empty of the subject and the product (plain background only); place the subject and the product within the middle 60% of the frame.";

/** Teks lewat prompt hanya diandalkan di Omni; di Veo dialihkan ke ruang kosong. */
export const effectiveOverlay = (mode: OverlayMode, model: FlowModel): OverlayMode => (mode === "prompt" && model !== "omni-flash-1.1" ? "space" : mode);

export function overlayRule(mode: OverlayMode): string {
  if (mode === "prompt")
    return `OVERLAY IN PROMPT: each scene prompt must also ask for ONE short on-screen text (max 4 words, taken from that scene's overlays[0].text, spelled exactly inside quotes), in clean white sans-serif with a soft shadow, placed in the top safe area, visible for about 2 seconds, nothing else written. ${SAFE_SPACE_RULE}`;
  if (mode === "space") return `OVERLAY SPACE: ${SAFE_SPACE_RULE} Do not render any text.`;
  return "Do not render any text.";
}

// ---------- Slot sudut produk / ingredients ----------
export const MAX_INGREDIENTS = 3; // gambar referensi per generate; sumber berbeda menyebut 3-7, periksa di Flow

export function planIngredients(angles: ProductAngle[], subject: SubjectKind, max = MAX_INGREDIENTS) {
  const order = ["produk-depan", subject, "produk-samping", "produk-atas"];
  const have = new Set<string>(["produk-depan", subject, ...angles.filter((a) => a !== "depan").map((a) => `produk-${a}`)]);
  const wanted = order.filter((s) => have.has(s));
  const slots = wanted.slice(0, max);
  return { slots, dropped: wanted.slice(max), sideAllowed: slots.includes("produk-samping") || slots.includes("produk-atas") };
}

export const actionRule = (sideAllowed: boolean) =>
  sideAllowed
    ? "ACTION RULE: you may turn or tilt the product only to show the sides given in the additional product references; never invent any other side."
    : "ACTION RULE: show only the side of the product that is visible in the front product reference. Never rotate, tilt, flip, open, or turn the product to reveal unseen sides; keep its front facing the camera.";
