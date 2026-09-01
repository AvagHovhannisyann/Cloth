import type { OutfitCandidate } from "@/types/recommendation";
import { ELITE_MARGIN, ELITE_MAX } from "./constants";

export type Rng = () => number;

/** Rank eligible candidates by total score, descending. Stable on ties. */
export function rankOutfits(candidates: OutfitCandidate[]): OutfitCandidate[] {
  return [...candidates].sort(
    (a, b) =>
      b.breakdown.total - a.breakdown.total || a.outfit.id.localeCompare(b.outfit.id),
  );
}

/** The top-quality band: within ELITE_MARGIN of the best, capped at ELITE_MAX. */
export function eliteBand(ranked: OutfitCandidate[]): OutfitCandidate[] {
  const best = ranked[0];
  if (!best) return [];
  const floor = best.breakdown.total - ELITE_MARGIN;
  return ranked.filter((c) => c.breakdown.total >= floor).slice(0, ELITE_MAX);
}

/**
 * Controlled weighted choice inside the elite band — variation without ever
 * dropping below the quality bar (§27). Weight grows quadratically with the
 * candidate's margin above the band floor.
 */
export function selectFromEliteCandidates(
  elite: OutfitCandidate[],
  rng: Rng,
): OutfitCandidate | null {
  const first = elite[0];
  if (!first) return null;
  if (elite.length === 1) return first;

  const floor = elite[elite.length - 1]!.breakdown.total - 1;
  const weights = elite.map((c) => (c.breakdown.total - floor) ** 2);
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  let roll = rng() * totalWeight;
  for (let i = 0; i < elite.length; i++) {
    roll -= weights[i]!;
    if (roll <= 0) return elite[i]!;
  }
  return first;
}

/**
 * A deliberate alternative to the current pick: stays in the quality band,
 * prefers a different top, then a different colour structure — never chaos.
 */
export function pickAlternative(
  ranked: OutfitCandidate[],
  current: OutfitCandidate,
  rng: Rng,
): OutfitCandidate | null {
  const pool = ranked.filter((c) => c.outfit.id !== current.outfit.id).slice(0, 8);
  if (pool.length === 0) return null;

  const differentTop = pool.filter((c) => c.outfit.topId !== current.outfit.topId);
  const differentBottom = pool.filter(
    (c) => c.outfit.bottomId !== current.outfit.bottomId,
  );

  const candidates =
    differentTop.length > 0 ? differentTop : differentBottom.length > 0 ? differentBottom : pool;

  // Prefer a changed colour structure among the different-top options.
  const currentFamily = current.top.colors.family[0];
  const newColor = candidates.filter((c) => c.top.colors.family[0] !== currentFamily);
  const finalPool = (newColor.length > 0 ? newColor : candidates).slice(0, 4);

  return finalPool[Math.floor(rng() * finalPool.length)] ?? finalPool[0] ?? null;
}

/**
 * "Surprise me": explores lower-frequency approved combinations while still
 * respecting every hard constraint (the input is already filtered).
 */
export function pickSurprise(
  ranked: OutfitCandidate[],
  rng: Rng,
): OutfitCandidate | null {
  if (ranked.length === 0) return null;
  const pool = ranked.slice(Math.min(3, ranked.length - 1), 14);
  if (pool.length === 0) return ranked[0] ?? null;
  return pool[Math.floor(rng() * pool.length)] ?? pool[0] ?? null;
}
