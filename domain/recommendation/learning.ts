import type { PreferenceState } from "@/types/settings";

/**
 * Transparent preference drift — no fake AI. Skips gently reduce a garment's
 * standing; wears gently raise it. Bounded so preference can never override
 * weather, dress code, or availability.
 */

const AFFINITY_MIN = -0.6;
const AFFINITY_MAX = 0.6;

const SKIP_GARMENT_DELTA = -0.05;
const SKIP_OUTFIT_DELTA = -0.08;
const WEAR_GARMENT_DELTA = 0.02;
const WEAR_OUTFIT_DELTA = 0.03;
const FAVORITE_OUTFIT_DELTA = 0.1;
const MANUAL_PICK_DELTA = 0.04;

function clamp(v: number): number {
  return Math.max(AFFINITY_MIN, Math.min(AFFINITY_MAX, v));
}

function bump(map: Record<string, number>, id: string, delta: number): Record<string, number> {
  return { ...map, [id]: clamp((map[id] ?? 0) + delta) };
}

export function applySkip(
  prefs: PreferenceState,
  outfitId: string,
  garmentIds: string[],
): PreferenceState {
  let garmentAffinity = prefs.garmentAffinity;
  for (const id of garmentIds) garmentAffinity = bump(garmentAffinity, id, SKIP_GARMENT_DELTA);
  return {
    garmentAffinity,
    outfitAffinity: bump(prefs.outfitAffinity, outfitId, SKIP_OUTFIT_DELTA),
  };
}

export function applyWear(
  prefs: PreferenceState,
  outfitId: string | undefined,
  garmentIds: string[],
): PreferenceState {
  let garmentAffinity = prefs.garmentAffinity;
  for (const id of garmentIds) garmentAffinity = bump(garmentAffinity, id, WEAR_GARMENT_DELTA);
  return {
    garmentAffinity,
    outfitAffinity: outfitId
      ? bump(prefs.outfitAffinity, outfitId, WEAR_OUTFIT_DELTA)
      : prefs.outfitAffinity,
  };
}

export function applyFavoriteOutfit(prefs: PreferenceState, outfitId: string): PreferenceState {
  return {
    ...prefs,
    outfitAffinity: bump(prefs.outfitAffinity, outfitId, FAVORITE_OUTFIT_DELTA),
  };
}

export function applyManualSelection(
  prefs: PreferenceState,
  garmentIds: string[],
): PreferenceState {
  let garmentAffinity = prefs.garmentAffinity;
  for (const id of garmentIds) garmentAffinity = bump(garmentAffinity, id, MANUAL_PICK_DELTA);
  return { ...prefs, garmentAffinity };
}

export const EMPTY_PREFERENCES: PreferenceState = {
  garmentAffinity: {},
  outfitAffinity: {},
};
