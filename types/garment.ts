export type GarmentCategory = "top" | "bottom" | "shoe" | "outerwear" | "accessory";

export type BrandConfidence = "confirmed" | "probable" | "unverified";

export type MaterialConfidence = "confirmed" | "probable" | "visual-estimate";

export type GarmentWeight =
  | "very-light"
  | "light"
  | "light-medium"
  | "medium"
  | "medium-heavy"
  | "heavy";

export type Season = "spring" | "summer" | "autumn" | "winter";

/**
 * Closed set of colour families used by the harmony scorer.
 * `colors.primary` stays free-form for display; families drive logic.
 */
export type ColorFamily =
  | "white"
  | "cream"
  | "beige"
  | "stone"
  | "camel"
  | "taupe"
  | "oatmeal"
  | "brown"
  | "grey"
  | "black"
  | "navy"
  | "blue"
  | "light-blue"
  | "indigo";

/** Coarse style branch. Drives coherence scoring and the hard mixing rules. */
export type StyleGroup = "classic-core" | "clean-casual" | "sport";

export type AvailabilityStatus =
  | "available"
  | "laundry"
  | "dirty"
  | "dry-cleaner"
  | "unavailable"
  | "archived";

export interface GarmentColors {
  /** Display colour, e.g. "Deep chocolate brown". */
  primary: string;
  secondary?: string[];
  /** Machine-readable families used by colour-harmony logic. First entry is dominant. */
  family: ColorFamily[];
  /** Representative hex for placeholder tiles until photography is supplied. */
  swatch: string;
}

export interface GarmentWeather {
  /** Below this °C the garment is thermally wrong. */
  minTemp?: number;
  /** Above this °C the garment is thermally wrong. */
  maxTemp?: number;
  rainFriendly?: boolean;
}

/** Static, curated garment facts. Mutable state lives in {@link GarmentState}. */
export interface Garment {
  id: string;
  name: string;
  category: GarmentCategory;
  subtype: string;

  brand?: string;
  brandConfidence: BrandConfidence;
  logoDescription?: string;

  colors: GarmentColors;

  materialDescription: string;
  materialConfidence: MaterialConfidence;
  texture: string;

  weight: GarmentWeight;
  /** 1–10, how warm the piece wears. */
  warmth: number;
  /** 1–10, dressiness. */
  formality: number;

  styleGroup: StyleGroup;
  styleTags: string[];

  fit?: string;
  sleeveLength?: "short" | "long" | "sleeveless";

  weather: GarmentWeather;
  seasons: Season[];

  /** Path under /wardrobe/ once real photography is supplied. */
  image?: string;

  notes?: string;
}

/** Per-garment mutable state, persisted separately from the seed catalogue. */
export interface GarmentState {
  status: AvailabilityStatus;
  availabilityReason?: string;
  favorite: boolean;
  lastWornAt?: string;
  wearCount: number;
  skipCount: number;
  manualSelections: number;
}

export const DEFAULT_GARMENT_STATE: GarmentState = {
  status: "available",
  favorite: false,
  wearCount: 0,
  skipCount: 0,
  manualSelections: 0,
};

/** Merged view the engine and UI operate on. */
export type GarmentView = Garment & GarmentState;

export function isAvailable(g: Pick<GarmentState, "status">): boolean {
  return g.status === "available";
}
