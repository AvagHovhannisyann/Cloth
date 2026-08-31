import type { DressCodeId, OccasionPreset } from "@/types/context";
import type { GarmentView } from "@/types/garment";
import type { OutfitView } from "@/types/outfit";
import type { RejectionReason } from "@/types/recommendation";
import { isAvailable } from "@/types/garment";

export interface HardFilterContext {
  occasion: OccasionPreset;
  dressCode: DressCodeId;
  /** Comfort-adjusted feels-like °C; null when weather is unknown. */
  effectiveTemp: number | null;
  rainExpected: boolean;
  snowExpected: boolean;
}

const DARK_FAMILIES = new Set(["black", "navy", "brown", "indigo"]);

function dominantFamily(g: GarmentView): string {
  return g.colors.family[0] ?? "grey";
}

function violatesDressCode(g: GarmentView, code: DressCodeId): string | null {
  switch (code) {
    case "all-white":
      return dominantFamily(g) === "white" ? null : `${g.name} is not white`;
    case "dark-colors":
      return DARK_FAMILIES.has(dominantFamily(g))
        ? null
        : `${g.name} is not a dark colour`;
    case "no-sportswear":
    case "smart-casual":
    case "formal":
      return g.styleGroup === "sport" ? `${g.name} is sportswear` : null;
    default:
      return null;
  }
}

const isPolo = (g: GarmentView) => g.subtype.toLowerCase().includes("polo");
const isHoodie = (g: GarmentView) => g.subtype.toLowerCase().includes("hoodie");
const isTailored = (g: GarmentView) => g.subtype.toLowerCase().includes("tailored");

/**
 * Hard constraints (§26). Returns every reason the outfit is invalid today;
 * an empty array means the outfit is eligible for scoring.
 */
export function applyHardConstraints(
  outfit: OutfitView,
  top: GarmentView,
  bottom: GarmentView,
  shoe: GarmentView,
  ctx: HardFilterContext,
): RejectionReason[] {
  const reasons: RejectionReason[] = [];
  const garments = [top, bottom, shoe];

  // 1. Availability — unavailable garments are never recommended.
  for (const g of garments) {
    if (!isAvailable(g)) {
      reasons.push({
        kind: "unavailable",
        garmentId: g.id,
        detail: `${g.name} is ${g.status === "laundry" ? "in the laundry" : g.status}`,
      });
    }
  }

  // 2. Dress code is a hard filter.
  for (const g of garments) {
    const violation = violatesDressCode(g, ctx.dressCode);
    if (violation) reasons.push({ kind: "dress-code", detail: violation });
  }
  if (ctx.dressCode === "formal" && outfit.formality < 7) {
    reasons.push({ kind: "dress-code", detail: "Not formal enough for the dress code" });
  }
  if (ctx.dressCode === "smart-casual" && outfit.formality < 5) {
    reasons.push({ kind: "dress-code", detail: "Below smart-casual formality" });
  }

  // 3. Impossible temperature.
  if (ctx.effectiveTemp !== null) {
    const { min, max } = outfit.temperatureRange;
    if (ctx.effectiveTemp < min) {
      reasons.push({
        kind: "temperature",
        detail: `Too light for ${Math.round(ctx.effectiveTemp)}°C (needs ${min}°C+)`,
      });
    } else if (ctx.effectiveTemp > max) {
      reasons.push({
        kind: "temperature",
        detail: `Too warm for ${Math.round(ctx.effectiveTemp)}°C (works up to ${max}°C)`,
      });
    }
  }

  // 4. Occasion formality window.
  if (outfit.formality < ctx.occasion.formalityMin) {
    reasons.push({
      kind: "formality",
      detail: `Too casual for ${ctx.occasion.label.toLowerCase()}`,
    });
  } else if (outfit.formality > ctx.occasion.formalityMax) {
    reasons.push({
      kind: "formality",
      detail: `Overdressed for ${ctx.occasion.label.toLowerCase()}`,
    });
  }

  // 5. Banned style mixes (§19) — defence in depth over the curated catalogue.
  if (isPolo(top) && bottom.styleGroup === "sport") {
    reasons.push({ kind: "style-clash", detail: "Polo with athletic bottoms" });
  }
  if (isTailored(bottom) && isHoodie(top)) {
    reasons.push({ kind: "style-clash", detail: "Hoodie with tailored trousers" });
  }
  if (isTailored(bottom) && shoe.formality <= 2) {
    reasons.push({ kind: "style-clash", detail: "Athletic shoes with tailored trousers" });
  }
  if (top.warmth >= 8 && bottom.formality >= 7 && bottom.warmth <= 3) {
    reasons.push({
      kind: "style-clash",
      detail: "Heavy fleece with light formal trousers",
    });
  }

  // 6. Explicit banned conditions on the outfit definition.
  if (outfit.bannedConditions?.includes("rain") && ctx.rainExpected) {
    reasons.push({ kind: "banned-condition", detail: "Not for rainy days" });
  }
  if (outfit.bannedConditions?.includes("snow") && ctx.snowExpected) {
    reasons.push({ kind: "banned-condition", detail: "Not for snow" });
  }

  return reasons;
}
