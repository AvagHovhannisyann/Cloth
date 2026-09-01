import type { ColorFamily, GarmentView } from "@/types/garment";

/**
 * Curated pair scores for dominant colour families (0–100).
 * Seeded from the wardrobe's strong formulas (§18); unlisted pairs fall back
 * to a neutral default, and weak-contrast same-family pairs are penalised.
 */
const PAIR_SCORES: Partial<Record<string, number>> = {
  // Very strong formulas
  "navy|white": 100,
  "navy|stone": 98,
  "camel|navy": 98,
  "light-blue|navy": 96,
  "navy|oatmeal": 98,
  // Strong formulas
  "beige|white": 90,
  "cream|white": 82,
  "brown|stone": 92,
  "grey|navy": 90,
  "cream|navy": 92,
  "beige|navy": 92,
  "brown|beige": 78,
  "brown|navy": 85,
  "brown|white": 88,
  "black|grey": 85,
  "black|white": 88,
  "black|oatmeal": 88,
  "black|taupe": 85,
  "black|cream": 86,
  "black|camel": 86,
  "black|light-blue": 82,
  "indigo|white": 88,
  "cream|indigo": 88,
  "beige|indigo": 88,
  "camel|indigo": 88,
  "indigo|oatmeal": 90,
  "indigo|taupe": 85,
  "grey|indigo": 84,
  "indigo|navy": 74,
  "black|indigo": 78,
  "navy|taupe": 92,
  "stone|taupe": 68,
  "beige|taupe": 66,
  "stone|white": 84,
  "grey|white": 84,
  "grey|stone": 70,
  "grey|black": 85,
  "light-blue|stone": 88,
  "beige|light-blue": 88,
  "light-blue|white": 84,
  "black|black": 68,
  "navy|navy": 58,
  "beige|beige": 56,
  "grey|grey": 55,
  "white|white": 80, // deliberate monochrome — dress-code territory
  "stone|stone": 56,
  "brown|brown": 55,
  "brown|camel": 68,
  "beige|camel": 62,
  "camel|stone": 74,
  "beige|stone": 62,
  "cream|stone": 74,
  "cream|beige": 70,
  "cream|oatmeal": 72,
  "beige|oatmeal": 66,
  "oatmeal|stone": 64,
  "oatmeal|white": 80,
  "light-blue|light-blue": 60,
  "blue|navy": 78,
  "blue|stone": 86,
  "blue|white": 86,
  "blue|beige": 86,
};

const NEUTRAL_DEFAULT = 78;

function pairKey(a: ColorFamily, b: ColorFamily): string {
  return [a, b].sort().join("|");
}

/** Score the harmony of two dominant colour families. */
export function scoreColorPair(a: ColorFamily, b: ColorFamily): number {
  return PAIR_SCORES[pairKey(a, b)] ?? NEUTRAL_DEFAULT;
}

function dominant(g: GarmentView): ColorFamily {
  return g.colors.family[0] ?? "grey";
}

/**
 * Colour harmony for a full outfit. The top/bottom relationship carries most
 * of the weight; the shoe modulates the result slightly (white leather goes
 * with nearly everything).
 */
export function scoreColorHarmony(
  top: GarmentView,
  bottom: GarmentView,
  shoe: GarmentView,
): number {
  const core = scoreColorPair(dominant(top), dominant(bottom));

  const shoeFamily = dominant(shoe);
  let shoeAdj = 0;
  if (shoeFamily === "white") {
    shoeAdj = 2; // white sneakers flatter almost every pairing
  } else {
    const st = scoreColorPair(dominant(top), shoeFamily);
    const sb = scoreColorPair(dominant(bottom), shoeFamily);
    shoeAdj = ((st + sb) / 2 - NEUTRAL_DEFAULT) / 8;
  }

  return Math.max(0, Math.min(100, core + shoeAdj));
}

/** Human description of a top/bottom colour pairing quality. */
export function describeColorPairing(top: GarmentView, bottom: GarmentView): {
  score: number;
  strength: "signature" | "strong" | "fine" | "weak";
} {
  const score = scoreColorPair(dominant(top), dominant(bottom));
  if (score >= 95) return { score, strength: "signature" };
  if (score >= 86) return { score, strength: "strong" };
  if (score >= 70) return { score, strength: "fine" };
  return { score, strength: "weak" };
}
