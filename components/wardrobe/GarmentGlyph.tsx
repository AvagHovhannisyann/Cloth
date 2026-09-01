import type { GarmentCategory } from "@/types/garment";
import { contrastStroke, shade } from "@/lib/color";

/**
 * Minimal "technical flat" silhouettes, filled with the garment's fabric
 * tone. Used wherever real photography hasn't been supplied yet.
 */

export type GlyphKind =
  | "tee"
  | "polo"
  | "knit"
  | "quarter-zip"
  | "full-zip"
  | "hoodie"
  | "trousers"
  | "jeans"
  | "joggers"
  | "athletic-pants"
  | "sneaker"
  | "runner";

export function glyphKind(category: GarmentCategory, subtype: string): GlyphKind {
  const s = subtype.toLowerCase();
  if (category === "shoe") {
    return s.includes("retro") || s.includes("running") ? "runner" : "sneaker";
  }
  if (category === "bottom") {
    if (s.includes("jogger")) return "joggers";
    if (s.includes("athletic")) return "athletic-pants";
    if (s.includes("jeans") || s.includes("five-pocket")) return "jeans";
    return "trousers";
  }
  if (s.includes("hoodie")) return "hoodie";
  if (s.includes("quarter-zip")) return "quarter-zip";
  if (s.includes("full-zip")) return "full-zip";
  if (s.includes("polo")) return "polo";
  if (s.includes("knit") || s.includes("long-sleeve")) return "knit";
  return "tee";
}

const TEE_BODY =
  "M38 16 C43 23 57 23 62 16 L79 23 L88 44 L71 49 L68 40 L68 84 Q68 89 63 89 L37 89 Q32 89 32 84 L32 40 L29 49 L12 44 L21 23 Z";

const KNIT_BODY =
  "M38 16 C43 23 57 23 62 16 L79 23 L87 72 Q88 78 82 78 L76 77 Q73 77 73 72 L71 42 L71 84 Q71 89 66 89 L34 89 Q29 89 29 84 L29 42 L27 72 Q27 77 24 77 L18 78 Q12 78 13 72 L21 23 Z";

const ZIP_BODY =
  "M38 16 L38 8 Q38 5 42 5 L58 5 Q62 5 62 8 L62 16 L79 23 L87 72 Q88 78 82 78 L76 77 Q73 77 73 72 L71 42 L71 84 Q71 89 66 89 L34 89 Q29 89 29 84 L29 42 L27 72 Q27 77 24 77 L18 78 Q12 78 13 72 L21 23 Z";

const TROUSER_BODY =
  "M33 8 L67 8 L70 18 L72 87 Q72 91 68 91 L62 91 Q59 91 59 87 L51 47 Q50 45 49 47 L41 87 Q41 91 38 91 L32 91 Q28 91 28 87 L30 18 Z";

const JOGGER_BODY =
  "M33 8 L67 8 L70 18 L66 78 L65 78 L65 88 Q65 91 63 91 L59 91 Q57 91 57 88 L57 78 L52 47 Q50 45 48 47 L43 78 L43 88 Q43 91 41 91 L37 91 Q35 91 35 88 L35 78 L34 78 L30 18 Z";

const ATHLETIC_BODY =
  "M33 8 L67 8 L70 18 L69 87 Q69 91 66 91 L60 91 Q57 91 57 87 L52 47 Q50 45 48 47 L43 87 Q43 91 40 91 L34 91 Q31 91 31 87 L30 18 Z";

const SNEAKER_BODY =
  "M8 72 Q8 62 20 58 L38 44 Q44 39 50 42 L55 45 L57 38 Q58 36 61 36 L67 36 Q70 36 70 39 L70 45 Q78 49 85 53 Q91 57 91 66 L91 74 Q91 80 84 80 L15 80 Q8 80 8 74 Z";

const RUNNER_BODY =
  "M8 70 Q8 60 20 56 L34 43 Q40 37 47 40 L52 43 L54 36 Q55 34 58 34 L64 34 Q67 34 67 37 L67 43 Q77 48 84 52 Q91 56 91 64 L91 74 Q91 81 83 81 L16 81 Q8 81 8 74 Z";

interface Detail {
  d: string;
  width?: number;
}

const DETAILS: Record<GlyphKind, Detail[]> = {
  tee: [
    { d: "M38 16 C43 23 57 23 62 16" },
    { d: "M33 84 L67 84", width: 0.8 },
    { d: "M85 41 L72 45", width: 0.8 },
    { d: "M15 41 L28 45", width: 0.8 },
  ],
  polo: [
    { d: "M50 21 L50 36" },
    { d: "M33 84 L67 84", width: 0.8 },
    { d: "M85 41 L72 45", width: 0.8 },
    { d: "M15 41 L28 45", width: 0.8 },
  ],
  knit: [
    { d: "M38 16 C43 23 57 23 62 16" },
    { d: "M30 83 L70 83", width: 0.8 },
    { d: "M74 71 L86 71", width: 0.8 },
    { d: "M14 71 L26 71", width: 0.8 },
  ],
  "quarter-zip": [
    { d: "M38 16 C43 20 57 20 62 16" },
    { d: "M50 6 L50 36" },
    { d: "M30 83 L70 83", width: 0.8 },
    { d: "M74 71 L86 71", width: 0.8 },
    { d: "M14 71 L26 71", width: 0.8 },
  ],
  "full-zip": [
    { d: "M38 16 C43 20 57 20 62 16" },
    { d: "M50 6 L50 88" },
    { d: "M38 68 L43 78", width: 0.8 },
    { d: "M62 68 L57 78", width: 0.8 },
    { d: "M74 71 L86 71", width: 0.8 },
    { d: "M14 71 L26 71", width: 0.8 },
  ],
  hoodie: [
    { d: "M40 15 C44 11 56 11 60 15" },
    { d: "M46 18 L45 27" },
    { d: "M54 18 L55 27" },
    { d: "M38 68 L42 84 L58 84 L62 68", width: 0.8 },
  ],
  trousers: [
    { d: "M32 13 L68 13", width: 0.8 },
    { d: "M63 24 L65.5 85", width: 0.6 },
    { d: "M37 24 L34.5 85", width: 0.6 },
  ],
  jeans: [
    { d: "M32 13 L68 13", width: 0.8 },
    { d: "M31 17 Q39 23 44 15", width: 0.8 },
    { d: "M69 17 Q61 23 56 15", width: 0.8 },
    { d: "M50 13 Q46 17 47.5 23", width: 0.6 },
    { d: "M29 86 L41 86", width: 0.6 },
    { d: "M59 86 L71 86", width: 0.6 },
  ],
  joggers: [
    { d: "M33 12 L67 12", width: 0.8 },
    { d: "M46 13 L45 20" },
    { d: "M54 13 L55 20" },
    { d: "M57 80 L65 80", width: 0.8 },
    { d: "M35 80 L43 80", width: 0.8 },
  ],
  "athletic-pants": [
    { d: "M33 12 L67 12", width: 0.8 },
    { d: "M68 22 L66 86", width: 0.8 },
  ],
  sneaker: [
    { d: "M9 71 L90 71", width: 0.9 },
    { d: "M44 49 L55 53", width: 0.9 },
    { d: "M41 54 L52 58", width: 0.9 },
    { d: "M38 59 L49 63", width: 0.9 },
    { d: "M78 54 Q84 60 85 70", width: 0.7 },
  ],
  runner: [
    { d: "M9 68 L90 66", width: 0.9 },
    { d: "M9 74 L90 74", width: 0.7 },
    { d: "M42 47 L52 51", width: 0.9 },
    { d: "M39 52 L49 56", width: 0.9 },
    { d: "M58 55 Q70 60 86 58", width: 0.8 },
  ],
};

const BODIES: Record<GlyphKind, string> = {
  tee: TEE_BODY,
  polo: TEE_BODY,
  knit: KNIT_BODY,
  "quarter-zip": ZIP_BODY,
  "full-zip": ZIP_BODY,
  hoodie: KNIT_BODY,
  trousers: TROUSER_BODY,
  jeans: TROUSER_BODY,
  joggers: JOGGER_BODY,
  "athletic-pants": ATHLETIC_BODY,
  sneaker: SNEAKER_BODY,
  runner: RUNNER_BODY,
};

const HOOD_PATH = "M36 18 C33 5 44 2 50 2 C56 2 67 5 64 18 C59 13 41 13 36 18 Z";
const POLO_COLLAR =
  "M36 14 C42 20 58 20 64 14 L61 9 C55 14 45 14 39 9 Z M36 14 L46 18 L40 26 Z M64 14 L54 18 L60 26 Z";

export function GarmentGlyph({
  kind,
  fill,
  className,
}: {
  kind: GlyphKind;
  fill: string;
  className?: string;
}) {
  const stroke = contrastStroke(fill);
  const edge = shade(fill, luminanceEdge(fill));
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden focusable="false">
      <path d={BODIES[kind]} fill={fill} stroke={edge} strokeWidth="1.1" strokeLinejoin="round" />
      {kind === "hoodie" ? (
        <path d={HOOD_PATH} fill={fill} stroke={edge} strokeWidth="1.1" strokeLinejoin="round" />
      ) : null}
      {kind === "polo" ? (
        <path d={POLO_COLLAR} fill={shade(fill, -0.08)} stroke={edge} strokeWidth="0.9" strokeLinejoin="round" />
      ) : null}
      {DETAILS[kind].map((detail, i) => (
        <path
          key={i}
          d={detail.d}
          fill="none"
          stroke={stroke}
          strokeWidth={detail.width ?? 1}
          strokeLinecap="round"
          opacity="0.55"
        />
      ))}
    </svg>
  );
}

function luminanceEdge(fill: string): number {
  // Light fabrics get a slightly stronger dark edge; dark ones a soft lift.
  return contrastStroke(fill) === shade(fill, -0.38) ? -0.22 : 0.18;
}
