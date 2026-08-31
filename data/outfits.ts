import type { OccasionId } from "@/types/context";
import type { OutfitDefinition, OutfitTier } from "@/types/outfit";
import { getSeedGarment } from "./garments";

/** Short display fragments used to compose outfit names and explanations. */
export const SHORT_NAMES: Record<string, string> = {
  "top-01": "chocolate tee",
  "top-02": "sky blue tee",
  "top-03": "grey polo",
  "top-04": "navy polo",
  "top-05": "white polo",
  "top-06": "grey crew knit",
  "top-07": "light blue knit",
  "top-08": "navy knit",
  "top-09": "navy USPA polo",
  "top-10": "camel BOSS polo",
  "top-11": "stone polo",
  "top-12": "taupe CK tee",
  "top-13": "cream tee",
  "top-14": "navy tee",
  "top-15": "white Nike tee",
  "top-16": "white USPA polo",
  "top-17": "ink navy tee",
  "top-18": "pale blue Nike tee",
  "top-19": "black hoodie",
  "top-20": "sand Essentials hoodie",
  "top-21": "oatmeal quarter-zip",
  "top-22": "oatmeal full-zip",
  "bot-01": "black trousers",
  "bot-02": "stone trousers",
  "bot-03": "navy trousers A",
  "bot-04": "white trousers",
  "bot-05": "navy trousers B",
  "bot-06": "sand five-pockets",
  "bot-07": "indigo jeans",
  "bot-08": "Essentials joggers A",
  "bot-09": "Nike athletic pants",
  "bot-10": "Essentials joggers B",
  "bot-11": "Nike joggers",
  "shoe-01": "white A|X sneakers",
  "shoe-02": "Air Max 90",
};

export function shortName(garmentId: string): string {
  return SHORT_NAMES[garmentId] ?? garmentId;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

interface OutfitSpec {
  id: string;
  topId: string;
  bottomId: string;
  shoeId: string;
  tier: OutfitTier;
  baseScore: number;
  name?: string;
  explanation?: string;
  occasionTags?: OccasionId[];
  allWhite?: boolean;
}

const CLASSIC_OCCASIONS: OccasionId[] = [
  "school",
  "important-school",
  "presentation",
  "exam",
  "meeting",
  "conference",
  "dinner",
];
const CASUAL_OCCASIONS: OccasionId[] = ["school", "exam", "casual", "weekend", "travel", "dinner"];
const SPORT_OCCASIONS: OccasionId[] = ["sport", "casual", "weekend", "travel"];

function defineOutfit(spec: OutfitSpec): OutfitDefinition {
  const top = getSeedGarment(spec.topId);
  const bottom = getSeedGarment(spec.bottomId);
  const shoe = getSeedGarment(spec.shoeId);
  if (!top || !bottom || !shoe) {
    throw new Error(`Outfit ${spec.id} references an unknown garment`);
  }

  const formality = Math.round(
    0.45 * top.formality + 0.35 * bottom.formality + 0.2 * shoe.formality,
  );

  const min = Math.max(top.weather.minTemp ?? -15, bottom.weather.minTemp ?? -15);
  const max = Math.min(top.weather.maxTemp ?? 38, bottom.weather.maxTemp ?? 38);

  const groups = [top.styleGroup, bottom.styleGroup, shoe.styleGroup];
  const occasionTags =
    spec.occasionTags ??
    (groups.filter((g) => g === "sport").length >= 2
      ? SPORT_OCCASIONS
      : top.styleGroup === "classic-core"
        ? CLASSIC_OCCASIONS
        : CASUAL_OCCASIONS);

  const name =
    spec.name ?? `${capitalize(shortName(spec.topId))}, ${shortName(spec.bottomId)}`;

  const explanation =
    spec.explanation ??
    `${capitalize(shortName(spec.topId))} over ${shortName(spec.bottomId)}, finished with the ${shortName(spec.shoeId)}.`;

  const styleTags = Array.from(new Set([...top.styleTags, ...bottom.styleTags]));

  return {
    id: spec.id,
    name,
    topId: spec.topId,
    bottomId: spec.bottomId,
    shoeId: spec.shoeId,
    tier: spec.tier,
    baseScore: spec.baseScore,
    formality,
    temperatureRange: { min, max },
    occasionTags,
    dressCodeTags: spec.allWhite ? ["all-white"] : [],
    styleTags,
    explanation,
    source: "seed",
  };
}

/* ------------------------------------------------------------------------
 * Signature outfits — the curated core. S01–S20 plus the all-white default.
 * --------------------------------------------------------------------- */

const SIGNATURE: OutfitSpec[] = [
  {
    id: "s01",
    topId: "top-16",
    bottomId: "bot-05",
    shoeId: "shoe-01",
    tier: "signature",
    baseScore: 97,
    name: "White polo, navy trousers",
    explanation:
      "The white embroidered polo against dark navy is the cleanest line in the wardrobe — classic, school-right, timeless.",
  },
  {
    id: "s02",
    topId: "top-10",
    bottomId: "bot-05",
    shoeId: "shoe-01",
    tier: "signature",
    baseScore: 96,
    name: "Camel BOSS polo, navy trousers",
    explanation:
      "Camel over navy is one of the strongest colour pairings you own — refined and quietly distinctive.",
  },
  {
    id: "s03",
    topId: "top-09",
    bottomId: "bot-02",
    shoeId: "shoe-01",
    tier: "signature",
    baseScore: 95,
    name: "Navy polo, stone trousers",
    explanation:
      "Deep navy on light stone reads sophisticated without trying — a natural school uniform.",
  },
  {
    id: "s04",
    topId: "top-04",
    bottomId: "bot-04",
    shoeId: "shoe-01",
    tier: "signature",
    baseScore: 95,
    name: "Navy polo, white trousers",
    explanation:
      "Dark navy over clean white trousers — high contrast handled quietly, with the white sneakers closing the loop.",
  },
  {
    id: "s05",
    topId: "top-03",
    bottomId: "bot-05",
    shoeId: "shoe-01",
    tier: "signature",
    baseScore: 94,
    name: "Grey polo, navy trousers",
    explanation:
      "Silver grey against navy is understated and exact — restrained in the best way.",
  },
  {
    id: "s06",
    topId: "top-05",
    bottomId: "bot-03",
    shoeId: "shoe-01",
    tier: "signature",
    baseScore: 95,
    name: "White polo, navy trousers",
    explanation: "Warm white over dark navy — the timeless formula, done plainly.",
  },
  {
    id: "s07",
    topId: "top-11",
    bottomId: "bot-05",
    shoeId: "shoe-01",
    tier: "signature",
    baseScore: 94,
    name: "Stone polo, navy trousers",
    explanation:
      "Stone beige on navy keeps everything soft and classic, with the collar accent doing the quiet talking.",
  },
  {
    id: "s08",
    topId: "top-10",
    bottomId: "bot-04",
    shoeId: "shoe-01",
    tier: "signature",
    baseScore: 95,
    name: "Camel BOSS polo, white trousers",
    explanation:
      "Camel and white is a warm-weather signature — light, expensive-looking, effortless.",
  },
  {
    id: "s09",
    topId: "top-16",
    bottomId: "bot-02",
    shoeId: "shoe-01",
    tier: "signature",
    baseScore: 95,
    name: "White polo, stone trousers",
    explanation:
      "White over pale stone, tone on tone with just enough contrast — clean and composed.",
  },
  {
    id: "s10",
    topId: "top-09",
    bottomId: "bot-06",
    shoeId: "shoe-01",
    tier: "signature",
    baseScore: 93,
    name: "Navy polo, sand five-pockets",
    explanation:
      "Navy against sand keeps the classic contrast while the five-pockets relax it slightly.",
  },
  {
    id: "s11",
    topId: "top-02",
    bottomId: "bot-05",
    shoeId: "shoe-01",
    tier: "signature",
    baseScore: 93,
    name: "Sky blue tee, navy trousers",
    explanation:
      "Light blue over navy — tonal, fresh, and easy on a warm school morning.",
  },
  {
    id: "s12",
    topId: "top-07",
    bottomId: "bot-05",
    shoeId: "shoe-01",
    tier: "signature",
    baseScore: 94,
    name: "Light blue knit, navy trousers",
    explanation:
      "Cornflower blue over navy is the cooler-weather version of your best colour story.",
  },
  {
    id: "s13",
    topId: "top-08",
    bottomId: "bot-02",
    shoeId: "shoe-01",
    tier: "signature",
    baseScore: 94,
    name: "Navy knit, stone trousers",
    explanation:
      "Navy knit on stone — deep over light, warm enough for the season and completely school-appropriate.",
  },
  {
    id: "s14",
    topId: "top-21",
    bottomId: "bot-05",
    shoeId: "shoe-01",
    tier: "signature",
    baseScore: 96,
    name: "Oatmeal quarter-zip, navy trousers",
    explanation:
      "Oatmeal over navy is an extremely strong cold-weather combination — academic, warm, precise.",
  },
  {
    id: "s15",
    topId: "top-22",
    bottomId: "bot-03",
    shoeId: "shoe-01",
    tier: "signature",
    baseScore: 94,
    name: "Oatmeal full-zip, navy trousers",
    explanation:
      "The full-zip in oatmeal against dark navy — soft texture, sharp contrast, cold-morning ready.",
  },
  {
    id: "s16",
    topId: "top-01",
    bottomId: "bot-02",
    shoeId: "shoe-01",
    tier: "signature",
    baseScore: 93,
    name: "Chocolate tee, stone trousers",
    explanation:
      "Chocolate brown over stone is rich without being loud — an easy, grown-up combination.",
  },
  {
    id: "s17",
    topId: "top-12",
    bottomId: "bot-05",
    shoeId: "shoe-01",
    tier: "signature",
    baseScore: 93,
    name: "Taupe CK tee, navy trousers",
    explanation:
      "Warm taupe over navy — minimal, modern-classic, zero effort visible.",
  },
  {
    id: "s18",
    topId: "top-13",
    bottomId: "bot-05",
    shoeId: "shoe-01",
    tier: "signature",
    baseScore: 93,
    name: "Cream tee, navy trousers",
    explanation: "Cream on navy is a quiet standard — light top, dark base, done.",
  },
  {
    id: "s19",
    topId: "top-14",
    bottomId: "bot-04",
    shoeId: "shoe-01",
    tier: "signature",
    baseScore: 93,
    name: "Navy tee, white trousers",
    explanation:
      "Navy over white trousers — the summer inversion of your core formula.",
  },
  {
    id: "s20",
    topId: "top-06",
    bottomId: "bot-01",
    shoeId: "shoe-01",
    tier: "signature",
    baseScore: 92,
    name: "Grey crew knit, black trousers",
    explanation:
      "Mushroom grey over black — low-key, tonal, and sharp when the weather turns.",
  },
  {
    id: "white-01",
    topId: "top-16",
    bottomId: "bot-04",
    shoeId: "shoe-01",
    tier: "signature",
    baseScore: 96,
    name: "All white",
    allWhite: true,
    explanation:
      "The default all-white outfit: embroidered white polo, white trousers, white sneakers — head-to-toe, no compromise.",
  },
];

/* ------------------------------------------------------------------------
 * Strong secondary school outfits (§22) + remaining all-white options.
 * --------------------------------------------------------------------- */

const STRONG: OutfitSpec[] = [
  { id: "st-05-06", topId: "top-05", bottomId: "bot-06", shoeId: "shoe-01", tier: "strong", baseScore: 88 },
  { id: "st-05-07", topId: "top-05", bottomId: "bot-07", shoeId: "shoe-01", tier: "strong", baseScore: 87 },
  { id: "st-16-01", topId: "top-16", bottomId: "bot-01", shoeId: "shoe-01", tier: "strong", baseScore: 88 },
  { id: "st-16-06", topId: "top-16", bottomId: "bot-06", shoeId: "shoe-01", tier: "strong", baseScore: 88 },
  { id: "st-03-04", topId: "top-03", bottomId: "bot-04", shoeId: "shoe-01", tier: "strong", baseScore: 87 },
  { id: "st-04-06", topId: "top-04", bottomId: "bot-06", shoeId: "shoe-01", tier: "strong", baseScore: 88 },
  { id: "st-04-07", topId: "top-04", bottomId: "bot-07", shoeId: "shoe-01", tier: "strong", baseScore: 87 },
  { id: "st-09-07", topId: "top-09", bottomId: "bot-07", shoeId: "shoe-01", tier: "strong", baseScore: 86 },
  { id: "st-10-01", topId: "top-10", bottomId: "bot-01", shoeId: "shoe-01", tier: "strong", baseScore: 88 },
  { id: "st-10-07", topId: "top-10", bottomId: "bot-07", shoeId: "shoe-01", tier: "strong", baseScore: 87 },
  { id: "st-11-04", topId: "top-11", bottomId: "bot-04", shoeId: "shoe-01", tier: "strong", baseScore: 87 },
  { id: "st-11-07", topId: "top-11", bottomId: "bot-07", shoeId: "shoe-01", tier: "strong", baseScore: 86 },
  { id: "st-02-06", topId: "top-02", bottomId: "bot-06", shoeId: "shoe-01", tier: "strong", baseScore: 87 },
  { id: "st-02-02", topId: "top-02", bottomId: "bot-02", shoeId: "shoe-01", tier: "strong", baseScore: 86 },
  { id: "st-12-04", topId: "top-12", bottomId: "bot-04", shoeId: "shoe-01", tier: "strong", baseScore: 86 },
  { id: "st-13-01", topId: "top-13", bottomId: "bot-01", shoeId: "shoe-01", tier: "strong", baseScore: 86 },
  { id: "st-14-02", topId: "top-14", bottomId: "bot-02", shoeId: "shoe-01", tier: "strong", baseScore: 87 },
  { id: "st-17-04", topId: "top-17", bottomId: "bot-04", shoeId: "shoe-01", tier: "strong", baseScore: 86 },
  { id: "st-18-05", topId: "top-18", bottomId: "bot-05", shoeId: "shoe-01", tier: "strong", baseScore: 85 },
  { id: "st-18-02", topId: "top-18", bottomId: "bot-02", shoeId: "shoe-01", tier: "strong", baseScore: 85 },
  {
    id: "white-02",
    topId: "top-05",
    bottomId: "bot-04",
    shoeId: "shoe-01",
    tier: "strong",
    baseScore: 90,
    name: "All white, plain polo",
    allWhite: true,
    explanation: "Plain white polo with white trousers — the softer all-white option.",
  },
  {
    id: "white-03",
    topId: "top-15",
    bottomId: "bot-04",
    shoeId: "shoe-01",
    tier: "acceptable",
    baseScore: 80,
    name: "All white, Nike tee",
    allWhite: true,
    explanation:
      "White Nike tee with white trousers — all-white at a lower formality, for when the code matters more than polish.",
  },
];

/* ------------------------------------------------------------------------
 * Sport / casual curated outfits (§23). Low priority on smart school days.
 * --------------------------------------------------------------------- */

const CASUAL: OutfitSpec[] = [
  { id: "c01", topId: "top-20", bottomId: "bot-08", shoeId: "shoe-02", tier: "strong", baseScore: 86 },
  { id: "c02", topId: "top-20", bottomId: "bot-10", shoeId: "shoe-02", tier: "strong", baseScore: 85 },
  { id: "c03", topId: "top-20", bottomId: "bot-07", shoeId: "shoe-01", tier: "acceptable", baseScore: 81 },
  { id: "c04", topId: "top-19", bottomId: "bot-11", shoeId: "shoe-02", tier: "strong", baseScore: 84 },
  { id: "c05", topId: "top-19", bottomId: "bot-09", shoeId: "shoe-02", tier: "acceptable", baseScore: 82 },
  { id: "c06", topId: "top-19", bottomId: "bot-07", shoeId: "shoe-02", tier: "acceptable", baseScore: 80 },
  { id: "c07", topId: "top-15", bottomId: "bot-09", shoeId: "shoe-02", tier: "strong", baseScore: 84 },
  { id: "c08", topId: "top-15", bottomId: "bot-11", shoeId: "shoe-02", tier: "acceptable", baseScore: 82 },
  { id: "c09", topId: "top-18", bottomId: "bot-09", shoeId: "shoe-02", tier: "acceptable", baseScore: 82 },
  { id: "c10", topId: "top-18", bottomId: "bot-11", shoeId: "shoe-02", tier: "acceptable", baseScore: 81 },
  { id: "c11", topId: "top-17", bottomId: "bot-07", shoeId: "shoe-02", tier: "acceptable", baseScore: 80 },
  { id: "c12", topId: "top-13", bottomId: "bot-07", shoeId: "shoe-01", tier: "strong", baseScore: 84 },
];

/* ------------------------------------------------------------------------
 * Additional approved combinations generated from the compatibility map
 * (§25) — only pairs the map allows, never the full Cartesian product.
 * --------------------------------------------------------------------- */

const GENERATED: OutfitSpec[] = [
  // TOP-01 chocolate tee
  { id: "g-01-04", topId: "top-01", bottomId: "bot-04", shoeId: "shoe-01", tier: "strong", baseScore: 85 },
  { id: "g-01-03", topId: "top-01", bottomId: "bot-03", shoeId: "shoe-01", tier: "strong", baseScore: 84 },
  { id: "g-01-05", topId: "top-01", bottomId: "bot-05", shoeId: "shoe-01", tier: "strong", baseScore: 84 },
  { id: "g-01-07", topId: "top-01", bottomId: "bot-07", shoeId: "shoe-01", tier: "acceptable", baseScore: 79 },
  // TOP-02 sky blue tee
  { id: "g-02-03", topId: "top-02", bottomId: "bot-03", shoeId: "shoe-01", tier: "strong", baseScore: 86 },
  { id: "g-02-04", topId: "top-02", bottomId: "bot-04", shoeId: "shoe-01", tier: "acceptable", baseScore: 81 },
  // TOP-03 grey polo
  { id: "g-03-03", topId: "top-03", bottomId: "bot-03", shoeId: "shoe-01", tier: "strong", baseScore: 87 },
  { id: "g-03-01", topId: "top-03", bottomId: "bot-01", shoeId: "shoe-01", tier: "acceptable", baseScore: 80 },
  // TOP-04 navy polo
  { id: "g-04-02", topId: "top-04", bottomId: "bot-02", shoeId: "shoe-01", tier: "strong", baseScore: 88 },
  // TOP-05 white polo
  { id: "g-05-05", topId: "top-05", bottomId: "bot-05", shoeId: "shoe-01", tier: "strong", baseScore: 88 },
  { id: "g-05-02", topId: "top-05", bottomId: "bot-02", shoeId: "shoe-01", tier: "strong", baseScore: 86 },
  { id: "g-05-01", topId: "top-05", bottomId: "bot-01", shoeId: "shoe-01", tier: "strong", baseScore: 85 },
  // TOP-06 grey crew knit
  { id: "g-06-03", topId: "top-06", bottomId: "bot-03", shoeId: "shoe-01", tier: "strong", baseScore: 85 },
  { id: "g-06-05", topId: "top-06", bottomId: "bot-05", shoeId: "shoe-01", tier: "strong", baseScore: 85 },
  { id: "g-06-07", topId: "top-06", bottomId: "bot-07", shoeId: "shoe-01", tier: "acceptable", baseScore: 79 },
  { id: "g-06-04", topId: "top-06", bottomId: "bot-04", shoeId: "shoe-01", tier: "acceptable", baseScore: 80 },
  // TOP-07 light blue knit
  { id: "g-07-03", topId: "top-07", bottomId: "bot-03", shoeId: "shoe-01", tier: "strong", baseScore: 87 },
  { id: "g-07-02", topId: "top-07", bottomId: "bot-02", shoeId: "shoe-01", tier: "strong", baseScore: 86 },
  { id: "g-07-01", topId: "top-07", bottomId: "bot-01", shoeId: "shoe-01", tier: "acceptable", baseScore: 79 },
  { id: "g-07-07", topId: "top-07", bottomId: "bot-07", shoeId: "shoe-01", tier: "acceptable", baseScore: 77 },
  // TOP-08 navy knit
  { id: "g-08-04", topId: "top-08", bottomId: "bot-04", shoeId: "shoe-01", tier: "strong", baseScore: 86 },
  { id: "g-08-06", topId: "top-08", bottomId: "bot-06", shoeId: "shoe-01", tier: "strong", baseScore: 86 },
  { id: "g-08-07", topId: "top-08", bottomId: "bot-07", shoeId: "shoe-01", tier: "acceptable", baseScore: 78 },
  // TOP-09 navy USPA polo
  { id: "g-09-04", topId: "top-09", bottomId: "bot-04", shoeId: "shoe-01", tier: "strong", baseScore: 88 },
  // TOP-10 camel BOSS polo
  { id: "g-10-03", topId: "top-10", bottomId: "bot-03", shoeId: "shoe-01", tier: "strong", baseScore: 89 },
  // TOP-11 stone polo
  { id: "g-11-03", topId: "top-11", bottomId: "bot-03", shoeId: "shoe-01", tier: "strong", baseScore: 87 },
  { id: "g-11-01", topId: "top-11", bottomId: "bot-01", shoeId: "shoe-01", tier: "acceptable", baseScore: 80 },
  // TOP-12 taupe CK tee
  { id: "g-12-03", topId: "top-12", bottomId: "bot-03", shoeId: "shoe-01", tier: "strong", baseScore: 85 },
  { id: "g-12-01", topId: "top-12", bottomId: "bot-01", shoeId: "shoe-01", tier: "acceptable", baseScore: 79 },
  { id: "g-12-07", topId: "top-12", bottomId: "bot-07", shoeId: "shoe-01", tier: "acceptable", baseScore: 79 },
  // TOP-13 cream tee
  { id: "g-13-03", topId: "top-13", bottomId: "bot-03", shoeId: "shoe-01", tier: "strong", baseScore: 85 },
  { id: "g-13-02", topId: "top-13", bottomId: "bot-02", shoeId: "shoe-01", tier: "acceptable", baseScore: 78 },
  // TOP-14 navy tee
  { id: "g-14-06", topId: "top-14", bottomId: "bot-06", shoeId: "shoe-01", tier: "strong", baseScore: 85 },
  { id: "g-14-07", topId: "top-14", bottomId: "bot-07", shoeId: "shoe-01", tier: "acceptable", baseScore: 77 },
  // TOP-15 white Nike tee — whitelisted by the compatibility map
  { id: "g-15-03", topId: "top-15", bottomId: "bot-03", shoeId: "shoe-01", tier: "acceptable", baseScore: 79 },
  { id: "g-15-05", topId: "top-15", bottomId: "bot-05", shoeId: "shoe-01", tier: "acceptable", baseScore: 79 },
  { id: "g-15-01", topId: "top-15", bottomId: "bot-01", shoeId: "shoe-01", tier: "acceptable", baseScore: 78 },
  { id: "g-15-06", topId: "top-15", bottomId: "bot-06", shoeId: "shoe-01", tier: "acceptable", baseScore: 79 },
  { id: "g-15-07", topId: "top-15", bottomId: "bot-07", shoeId: "shoe-01", tier: "acceptable", baseScore: 79 },
  // TOP-16 white USPA polo
  { id: "g-16-03", topId: "top-16", bottomId: "bot-03", shoeId: "shoe-01", tier: "strong", baseScore: 89 },
  { id: "g-16-07", topId: "top-16", bottomId: "bot-07", shoeId: "shoe-01", tier: "strong", baseScore: 86 },
  // TOP-17 ink navy tee
  { id: "g-17-02", topId: "top-17", bottomId: "bot-02", shoeId: "shoe-01", tier: "strong", baseScore: 85 },
  { id: "g-17-06", topId: "top-17", bottomId: "bot-06", shoeId: "shoe-01", tier: "strong", baseScore: 84 },
  { id: "g-17-07", topId: "top-17", bottomId: "bot-07", shoeId: "shoe-01", tier: "acceptable", baseScore: 78 },
  // TOP-18 pale blue Nike tee
  { id: "g-18-03", topId: "top-18", bottomId: "bot-03", shoeId: "shoe-01", tier: "acceptable", baseScore: 79 },
  { id: "g-18-01", topId: "top-18", bottomId: "bot-01", shoeId: "shoe-01", tier: "acceptable", baseScore: 77 },
  { id: "g-18-07", topId: "top-18", bottomId: "bot-07", shoeId: "shoe-01", tier: "acceptable", baseScore: 78 },
  // TOP-19 black hoodie
  { id: "g-19-08", topId: "top-19", bottomId: "bot-08", shoeId: "shoe-02", tier: "acceptable", baseScore: 80 },
  { id: "g-19-10", topId: "top-19", bottomId: "bot-10", shoeId: "shoe-02", tier: "acceptable", baseScore: 80 },
  // TOP-21 oatmeal quarter-zip
  { id: "g-21-03", topId: "top-21", bottomId: "bot-03", shoeId: "shoe-01", tier: "strong", baseScore: 89 },
  { id: "g-21-01", topId: "top-21", bottomId: "bot-01", shoeId: "shoe-01", tier: "strong", baseScore: 86 },
  { id: "g-21-07", topId: "top-21", bottomId: "bot-07", shoeId: "shoe-01", tier: "strong", baseScore: 85 },
  { id: "g-21-04", topId: "top-21", bottomId: "bot-04", shoeId: "shoe-01", tier: "acceptable", baseScore: 81 },
  // TOP-22 oatmeal full-zip
  { id: "g-22-05", topId: "top-22", bottomId: "bot-05", shoeId: "shoe-01", tier: "strong", baseScore: 87 },
  { id: "g-22-01", topId: "top-22", bottomId: "bot-01", shoeId: "shoe-01", tier: "strong", baseScore: 85 },
  { id: "g-22-07", topId: "top-22", bottomId: "bot-07", shoeId: "shoe-01", tier: "strong", baseScore: 84 },
  { id: "g-22-04", topId: "top-22", bottomId: "bot-04", shoeId: "shoe-01", tier: "acceptable", baseScore: 80 },
];

export const SEED_OUTFITS: OutfitDefinition[] = [
  ...SIGNATURE,
  ...STRONG,
  ...CASUAL,
  ...GENERATED,
].map(defineOutfit);

export function getSeedOutfit(id: string): OutfitDefinition | undefined {
  return SEED_OUTFITS.find((o) => o.id === id);
}
