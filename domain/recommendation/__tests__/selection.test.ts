import { describe, expect, it } from "vitest";
import { eliteBand, pickAlternative, rankOutfits, selectFromEliteCandidates } from "../selection";
import type { OutfitCandidate } from "@/types/recommendation";
import { garmentViews, outfitViews } from "./helpers";

function candidate(id: string, total: number, topId = "top-01"): OutfitCandidate {
  const garments = garmentViews();
  const outfit = outfitViews()[0]!;
  return {
    outfit: { ...outfit, id, topId },
    top: garments.get(topId)!,
    bottom: garments.get("bot-02")!,
    shoe: garments.get("shoe-01")!,
    breakdown: {
      base: 0,
      weather: 0,
      formality: 0,
      style: 0,
      color: 0,
      recency: 0,
      preference: 0,
      signatureBonus: 0,
      favoriteBonus: 0,
      occasionBias: 0,
      total,
    },
  };
}

describe("elite band selection", () => {
  const scores = [96, 95, 94, 93, 81, 75];
  const candidates = scores.map((s, i) => candidate(`o${i}`, s));

  it("keeps only the top-quality band", () => {
    const ranked = rankOutfits(candidates);
    const elite = eliteBand(ranked);
    expect(elite.map((c) => c.breakdown.total)).toEqual([96, 95, 94, 93]);
  });

  it("never selects a clearly inferior candidate", () => {
    const ranked = rankOutfits(candidates);
    const elite = eliteBand(ranked);
    // Sweep the rng across its range: every selection stays inside the band.
    for (let r = 0; r < 1; r += 0.05) {
      const pick = selectFromEliteCandidates(elite, () => r);
      expect(pick).not.toBeNull();
      expect(pick!.breakdown.total).toBeGreaterThanOrEqual(93);
    }
  });

  it("produces variation across rng values", () => {
    const ranked = rankOutfits(candidates);
    const elite = eliteBand(ranked);
    const picks = new Set(
      [0.05, 0.35, 0.65, 0.95].map(
        (r) => selectFromEliteCandidates(elite, () => r)!.outfit.id,
      ),
    );
    expect(picks.size).toBeGreaterThan(1);
  });
});

describe("alternative", () => {
  it("prefers a different top within the quality band", () => {
    const ranked = rankOutfits([
      candidate("a", 96, "top-01"),
      candidate("b", 95, "top-02"),
      candidate("c", 94, "top-01"),
    ]);
    const alt = pickAlternative(ranked, ranked[0]!, () => 0);
    expect(alt).not.toBeNull();
    expect(alt!.outfit.topId).not.toBe("top-01");
  });
});
