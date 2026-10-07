
export const FACELESS_RULE =
  "Faceless: never show a face. Frame only hands/forearms, or crop below the chin, or show the subject from behind or as a silhouette. No eyes, nose, or mouth visible.";

export type MotionPreset = {
  id: string;
  label: string;
  description: string;
  beats: string[]; // segmen ke-i memakai beats[i % beats.length]
  faceless: boolean;
};

export const MOTION_PRESETS: MotionPreset[] = [
  {
    id: "joget",
    label: "Joget - product pulse (dengan aktor)",
    description:
      "Light commercial dance: weight shift left-right, subtle knee bounce, then a rhythmic product pulse toward the camera; hands hold the product edge so key details stay visible; smooth eye-level camera; no complex footwork and nothing that upstages the product. The actor's face may be visible and follows the subject reference.",
    beats: ["weight shift left-right, product held at chest height", "subtle knee bounce, product pulses toward the camera", "product pulse held toward the camera, key label visible"],
    faceless: false,
  },
  {
    id: "unboxing",
    label: "Unboxing tangan (POV)",
    description: "Top-down or first-person view; hands open the package and reveal the product on a clean surface.",
    beats: ["sealed package on the surface, hands enter frame", "package opened, packaging details shown", "product lifted out and placed center, label facing camera"],
    faceless: true,
  },
  {
    id: "asmr_packing",
    label: "Packing order ASMR",
    description: "Hands neatly pack the product into a parcel; tactile close-ups of tape, wrap, and label.",
    beats: ["product placed on packing table", "wrapping and sealing, close-up on hands", "finished parcel with label toward camera"],
    faceless: true,
  },
  {
    id: "desk_reveal",
    label: "Reveal meja minimalis",
    description: "Minimal desk or room; a hand places the product and the setup comes together.",
    beats: ["empty minimal desk, soft light", "hand places the product in position", "slow push-in on the finished arrangement"],
    faceless: true,
  },
  {
    id: "hands_demo",
    label: "Demo pemakaian (tangan saja)",
    description: "Hands demonstrate how the product is used step by step, no face.",
    beats: ["product in hands, key feature visible", "using the product, close-up on the action", "result shown, product returned to center"],
    faceless: true,
  },
  {
    id: "macro_orbit",
    label: "Close-up macro + orbit",
    description: "Cinematic macro of materials and details with a slow orbit around the product; no people needed.",
    beats: ["macro on texture and finish", "slow orbit around the product", "pull back to the full product with soft highlights"],
    faceless: true,
  },
  {
    id: "before_after",
    label: "Sebelum–sesudah (tangan)",
    description: "Hands show the problem state, apply the product, then reveal the improved state; claims only as given by the user.",
    beats: ["before state, hands in frame", "applying or using the product", "after state, product beside the result"],
    faceless: true,
  },
  {
    id: "flatlay_stopmotion",
    label: "Flatlay stop-motion",
    description: "Top-down flatlay where items appear or rearrange in stop-motion rhythm around the product.",
    beats: ["empty flatlay surface, product pops in", "props appear one by one around the product", "final composition, product centered"],
    faceless: true,
  },
  {
    id: "backview_lifestyle",
    label: "Gaya hidup dari belakang",
    description: "Subject shown from behind or in silhouette using the product in a daily routine; face never visible.",
    beats: ["subject from behind in a minimal space", "using the product, shot over the shoulder or hands only", "product resting on a nearby surface, soft light"],
    faceless: true,
  },
];

export const getPreset = (id: string) => MOTION_PRESETS.find((p) => p.id === id) ?? MOTION_PRESETS[0];
