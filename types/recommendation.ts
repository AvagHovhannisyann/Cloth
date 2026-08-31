import type { GarmentView } from "./garment";
import type { OutfitView } from "./outfit";

/** Component scores on a 0–100 scale, pre-weighting. */
export interface ScoreBreakdown {
  base: number;
  weather: number;
  formality: number;
  style: number;
  color: number;
  recency: number;
  preference: number;
  /** Flat additive bonuses (already applied to total). */
  signatureBonus: number;
  favoriteBonus: number;
  occasionBias: number;
  total: number;
}

export type RejectionReason =
  | { kind: "unavailable"; garmentId: string; detail: string }
  | { kind: "dress-code"; detail: string }
  | { kind: "temperature"; detail: string }
  | { kind: "formality"; detail: string }
  | { kind: "banned-condition"; detail: string }
  | { kind: "style-clash"; detail: string };

export interface OutfitCandidate {
  outfit: OutfitView;
  top: GarmentView;
  bottom: GarmentView;
  shoe: GarmentView;
  breakdown: ScoreBreakdown;
}

export interface RejectedCandidate {
  outfit: OutfitView;
  reasons: RejectionReason[];
}

export interface RecommendationResult {
  pick: OutfitCandidate | null;
  /** Top-quality band the pick was drawn from. */
  elite: OutfitCandidate[];
  /** All eligible candidates, ranked. */
  ranked: OutfitCandidate[];
  rejected: RejectedCandidate[];
  /** Set when constraints had to be relaxed to find anything. */
  relaxedConstraint?: "recency" | "occasion-ceiling" | null;
}

export interface ExplanationLine {
  title: string;
  detail: string;
}
