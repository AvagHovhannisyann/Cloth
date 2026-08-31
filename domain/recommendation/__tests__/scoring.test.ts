import { describe, expect, it } from "vitest";
import { idealTopWarmth, scoreRecency, scoreWeatherCompatibility } from "../scoring";
import { scoreColorPair } from "../color";
import { garmentViews, makeWeather, outfitViews, settings, TODAY } from "./helpers";
import type { WearRecord } from "@/types/history";

const outfits = outfitViews();
const garments = garmentViews();

function outfit(id: string) {
  return outfits.find((o) => o.id === id)!;
}

describe("weather scoring", () => {
  it("scales ideal top warmth with temperature", () => {
    expect(idealTopWarmth(32)).toBeLessThan(idealTopWarmth(18));
    expect(idealTopWarmth(18)).toBeLessThan(idealTopWarmth(2));
  });

  it("scores the oatmeal knit higher in cold than a summer outfit scores", () => {
    const knitOutfit = outfit("s14");
    const knitTop = garments.get("top-21")!;
    const shoe = garments.get("shoe-01")!;
    const cold = scoreWeatherCompatibility(knitOutfit, knitTop, shoe, 6, makeWeather({ temperature: 6, feelsLike: 6 }));
    const mild = scoreWeatherCompatibility(knitOutfit, knitTop, shoe, 18, makeWeather({ temperature: 18, feelsLike: 18 }));
    expect(cold).toBeGreaterThan(mild);
    expect(cold).toBeGreaterThan(80);
  });

  it("is neutral when weather is unknown", () => {
    const anyOutfit = outfit("s01");
    expect(
      scoreWeatherCompatibility(anyOutfit, garments.get("top-16")!, garments.get("shoe-01")!, null, null),
    ).toBe(70);
  });
});

describe("recency scoring", () => {
  const wornTwoDaysAgo: WearRecord = {
    id: "w",
    dateISO: "2026-08-29",
    outfitId: "s01",
    topId: "top-16",
    bottomId: "bot-05",
    shoeId: "shoe-01",
    occasion: "school",
    source: "recommended",
    recordedAt: "2026-08-29T08:00:00.000Z",
  };

  it("punishes an exact repeat within the cooldown hard", () => {
    const s01 = outfit("s01");
    const score = scoreRecency(s01, [wornTwoDaysAgo], settings, TODAY);
    expect(score).toBeLessThan(30);
  });

  it("gives an untouched outfit a perfect recency score", () => {
    const s02 = outfit("s02");
    expect(scoreRecency(s02, [], settings, TODAY)).toBe(100);
  });

  it("penalises sharing only the top moderately", () => {
    const s09 = outfit("s09"); // same top (top-16), different bottom
    const score = scoreRecency(s09, [wornTwoDaysAgo], settings, TODAY);
    expect(score).toBeLessThan(100);
    expect(score).toBeGreaterThan(60);
  });
});

describe("colour harmony", () => {
  it("rates the wardrobe's strong formulas highly", () => {
    expect(scoreColorPair("navy", "white")).toBeGreaterThanOrEqual(95);
    expect(scoreColorPair("camel", "navy")).toBeGreaterThanOrEqual(95);
    expect(scoreColorPair("oatmeal", "navy")).toBeGreaterThanOrEqual(95);
  });

  it("penalises weak-contrast same-family pairings", () => {
    expect(scoreColorPair("navy", "navy")).toBeLessThan(65);
    expect(scoreColorPair("beige", "beige")).toBeLessThan(65);
  });
});
