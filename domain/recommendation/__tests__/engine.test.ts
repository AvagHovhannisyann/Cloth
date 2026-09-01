import { describe, expect, it } from "vitest";
import { recommend, type EngineInput } from "../engine";
import {
  emptyPrefs,
  garmentViews,
  makeWeather,
  markStatus,
  outfitViews,
  rngTop,
  settings,
  TODAY,
} from "./helpers";
import type { WearRecord } from "@/types/history";

function baseInput(patch: Partial<EngineInput> = {}): EngineInput {
  return {
    garments: garmentViews(),
    outfits: outfitViews(),
    occasion: "school",
    dressCode: "none",
    weather: makeWeather(),
    history: [],
    settings,
    prefs: emptyPrefs,
    todayIso: TODAY,
    rng: rngTop,
    ...patch,
  };
}

describe("all-white dress code", () => {
  it("only head-to-toe white outfits survive", () => {
    const result = recommend(baseInput({ dressCode: "all-white" }));
    expect(result.ranked.length).toBeGreaterThan(0);
    for (const c of result.ranked) {
      expect(c.top.colors.family[0]).toBe("white");
      expect(c.bottom.colors.family[0]).toBe("white");
      expect(c.shoe.colors.family[0]).toBe("white");
    }
    const ids = result.ranked.map((c) => c.outfit.id);
    expect(ids).toContain("white-01");
    expect(ids).not.toContain("s01");
  });

  it("recommends the signature all-white outfit first", () => {
    const result = recommend(baseInput({ dressCode: "all-white" }));
    expect(result.pick?.outfit.id).toBe("white-01");
  });

  it("falls back to the plain white polo when the embroidered polo is in laundry", () => {
    const garments = markStatus(garmentViews(), "top-16", "laundry");
    const result = recommend(baseInput({ dressCode: "all-white", garments }));
    expect(result.pick?.outfit.id).toBe("white-02");
  });
});

describe("temperature hard limits", () => {
  it("rejects the heavy Essentials hoodie at 30°C", () => {
    const result = recommend(
      baseInput({
        occasion: "casual",
        weather: makeWeather({ temperature: 30, feelsLike: 31 }),
      }),
    );
    for (const c of result.ranked) {
      expect(c.top.id).not.toBe("top-20");
    }
    const hoodieRejections = result.rejected.filter(
      (r) => r.outfit.topId === "top-20",
    );
    expect(hoodieRejections.length).toBeGreaterThan(0);
    expect(
      hoodieRejections.every((r) =>
        r.reasons.some((reason) => reason.kind === "temperature"),
      ),
    ).toBe(true);
  });

  it("never picks a knit on a cool morning before a hot afternoon", () => {
    const result = recommend(
      baseInput({
        weather: makeWeather({ temperature: 14, feelsLike: 14, high: 28 }),
      }),
    );
    expect(result.pick).not.toBeNull();
    for (const c of result.ranked) {
      expect(c.top.warmth).toBeLessThanOrEqual(4);
    }
    const knitRejections = result.rejected.filter((r) => r.outfit.id === "s13");
    expect(knitRejections.length).toBe(1);
    expect(
      knitRejections[0]!.reasons.some((reason) => reason.kind === "temperature"),
    ).toBe(true);
  });

  it("prefers warm knits in cold weather and drops short sleeves", () => {
    const result = recommend(
      baseInput({ weather: makeWeather({ temperature: 5, feelsLike: 3 }) }),
    );
    expect(result.pick).not.toBeNull();
    expect(result.pick!.top.warmth).toBeGreaterThanOrEqual(6);
    for (const c of result.ranked) {
      expect(c.top.sleeveLength).not.toBe("short");
    }
    // The oatmeal quarter-zip signature should sit in the elite band.
    expect(result.elite.map((c) => c.outfit.id)).toContain("s14");
  });
});

describe("occasion formality", () => {
  it("suppresses athletic outfits for a presentation", () => {
    const result = recommend(baseInput({ occasion: "presentation" }));
    expect(result.ranked.length).toBeGreaterThan(0);
    for (const c of result.ranked) {
      expect(c.outfit.formality).toBeGreaterThanOrEqual(7);
      expect(c.top.styleGroup).not.toBe("sport");
    }
  });

  it("makes the sport branch eligible and preferred in a sports context", () => {
    const result = recommend(
      baseInput({
        occasion: "sport",
        weather: makeWeather({ temperature: 14, feelsLike: 13 }),
      }),
    );
    expect(result.ranked.length).toBeGreaterThan(0);
    for (const c of result.ranked) {
      expect(c.outfit.formality).toBeLessThanOrEqual(4);
    }
    expect(result.pick!.top.styleGroup).toBe("sport");
    expect(result.pick!.shoe.id).toBe("shoe-02");
  });

  it("lets the classic wardrobe dominate a normal school day", () => {
    const result = recommend(baseInput());
    expect(result.pick!.top.styleGroup).toBe("classic-core");
    expect(result.pick!.outfit.tier).toBe("signature");
    for (const c of result.elite) {
      expect(c.top.styleGroup).not.toBe("sport");
    }
  });
});

describe("availability", () => {
  it("never recommends a garment that is in the laundry", () => {
    const garments = markStatus(garmentViews(), "bot-05", "laundry");
    const result = recommend(baseInput({ garments }));
    for (const c of result.ranked) {
      expect(c.bottom.id).not.toBe("bot-05");
    }
  });

  it("never surfaces archived garments", () => {
    const garments = markStatus(garmentViews(), "shoe-01", "archived");
    const result = recommend(baseInput({ garments }));
    for (const c of result.ranked) {
      expect(c.shoe.id).not.toBe("shoe-01");
    }
  });
});

describe("repetition", () => {
  it("applies a large penalty to an exact outfit worn recently", () => {
    const worn: WearRecord = {
      id: "w1",
      dateISO: "2026-08-29",
      outfitId: "s01",
      topId: "top-16",
      bottomId: "bot-05",
      shoeId: "shoe-01",
      occasion: "school",
      source: "recommended",
      recordedAt: "2026-08-29T08:00:00.000Z",
    };
    const fresh = recommend(baseInput());
    const repeated = recommend(baseInput({ history: [worn] }));
    const freshS01 = fresh.ranked.find((c) => c.outfit.id === "s01")!;
    const repeatedS01 = repeated.ranked.find((c) => c.outfit.id === "s01")!;
    expect(repeatedS01.breakdown.recency).toBeLessThan(30);
    expect(repeatedS01.breakdown.total).toBeLessThan(freshS01.breakdown.total - 5);
    expect(repeated.pick!.outfit.id).not.toBe("s01");
  });

  it("still dresses correctly when variety is impossible", () => {
    // Everything in laundry except one school-appropriate outfit, worn yesterday.
    let garments = garmentViews();
    for (const id of Array.from(garments.keys())) {
      if (!["top-16", "bot-05", "shoe-01"].includes(id)) {
        garments = markStatus(garments, id, "laundry");
      }
    }
    const worn: WearRecord = {
      id: "w2",
      dateISO: "2026-08-30",
      outfitId: "s01",
      topId: "top-16",
      bottomId: "bot-05",
      shoeId: "shoe-01",
      occasion: "school",
      source: "recommended",
      recordedAt: "2026-08-30T08:00:00.000Z",
    };
    const result = recommend(baseInput({ garments, history: [worn] }));
    expect(result.pick?.outfit.id).toBe("s01");
  });
});

describe("graceful failure", () => {
  it("returns no pick with reasons when constraints cannot be satisfied", () => {
    // All-white requires bot-04; send it to the dry cleaner.
    const garments = markStatus(garmentViews(), "bot-04", "dry-cleaner");
    const result = recommend(baseInput({ dressCode: "all-white", garments }));
    expect(result.pick).toBeNull();
    expect(result.ranked).toHaveLength(0);
    expect(result.rejected.length).toBeGreaterThan(0);
  });

  it("widens the occasion window rather than failing outright", () => {
    // Conference (min formality 7) at 5°C: knit outfits at formality 7 exist,
    // so first check a harsher case — sport occasion in heavy heat where only
    // lighter sport outfits survive relaxation.
    const result = recommend(
      baseInput({
        occasion: "conference",
        weather: makeWeather({ temperature: 5, feelsLike: 4 }),
      }),
    );
    // Either eligible directly or via relaxation — never a silent bad pick.
    expect(result.pick).not.toBeNull();
    expect(result.pick!.outfit.formality).toBeGreaterThanOrEqual(5);
  });
});

describe("style hard rules", () => {
  it("never pairs tailored trousers with the Air Max or hoodies", () => {
    const result = recommend(baseInput({ occasion: "custom" }));
    for (const c of result.ranked) {
      const tailored = c.bottom.subtype.toLowerCase().includes("tailored");
      if (tailored) {
        expect(c.shoe.formality).toBeGreaterThan(2);
        expect(c.top.subtype.toLowerCase()).not.toContain("hoodie");
      }
    }
  });
});
