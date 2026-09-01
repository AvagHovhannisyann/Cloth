import type { DressCodeId, OccasionId } from "./context";

export type OutfitTier = "acceptable" | "strong" | "signature";

/**
 * Conditions under which an otherwise-approved outfit must not surface.
 * Kept as a closed union so filters stay testable.
 */
export type BannedCondition = "rain" | "snow" | "heat" | "cold";

export interface OutfitDefinition {
  id: string;
  name: string;

  topId: string;
  bottomId: string;
  shoeId: string;

  tier: OutfitTier;
  /** Curated quality on a 0–100 scale before context scoring. */
  baseScore: number;

  /** 1–10 combined dressiness of the outfit. */
  formality: number;

  /** °C band the combination genuinely works in. */
  temperatureRange: { min: number; max: number };

  occasionTags: OccasionId[];
  dressCodeTags: DressCodeId[];
  styleTags: string[];

  explanation: string;

  bannedConditions?: BannedCondition[];

  source: "seed" | "generated" | "user";
}

/** Per-outfit mutable state, persisted separately from the catalogue. */
export interface OutfitState {
  favorite: boolean;
  timesWorn: number;
  lastWornAt?: string;
  skipCount: number;
}

export const DEFAULT_OUTFIT_STATE: OutfitState = {
  favorite: false,
  timesWorn: 0,
  skipCount: 0,
};

export type OutfitView = OutfitDefinition & OutfitState;
