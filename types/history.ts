import type { DressCodeId, OccasionId } from "./context";

export type WearSource =
  | "recommended"
  | "alternative"
  | "surprise"
  | "manual"
  | "planned";

/** One worn outfit on one day. Created only when the user confirms "Wear this". */
export interface WearRecord {
  id: string;
  dateISO: string;
  /** Present when the worn combination matches a catalogue outfit. */
  outfitId?: string;
  topId: string;
  bottomId: string;
  shoeId: string;
  occasion: OccasionId;
  source: WearSource;
  recordedAt: string;
}

/** A locked plan for a future day. */
export interface OutfitPlan {
  dateISO: string;
  occasion: OccasionId;
  dressCode: DressCodeId;
  outfitId?: string;
  topId: string;
  bottomId: string;
  shoeId: string;
  locked: boolean;
  createdAt: string;
}
