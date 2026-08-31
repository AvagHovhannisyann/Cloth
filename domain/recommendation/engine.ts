import type { DressCodeId, OccasionId } from "@/types/context";
import type { GarmentView } from "@/types/garment";
import type { WearRecord } from "@/types/history";
import type { OutfitView } from "@/types/outfit";
import type {
  OutfitCandidate,
  RecommendationResult,
  RejectedCandidate,
} from "@/types/recommendation";
import type { AppSettings, PreferenceState } from "@/types/settings";
import type { WeatherSnapshot } from "@/types/weather";
import { OCCASIONS } from "@/data/presets";
import { effectiveTemperature } from "@/domain/weather/comfort";
import { applyHardConstraints, type HardFilterContext } from "./filters";
import { computeBreakdown, type ScoringContext } from "./scoring";
import { eliteBand, rankOutfits, selectFromEliteCandidates, type Rng } from "./selection";

export interface EngineInput {
  garments: Map<string, GarmentView>;
  outfits: OutfitView[];
  occasion: OccasionId;
  dressCode: DressCodeId;
  weather: WeatherSnapshot | null;
  history: WearRecord[];
  settings: AppSettings;
  prefs: PreferenceState;
  todayIso: string;
  rng?: Rng;
}

interface ResolvedOutfit {
  outfit: OutfitView;
  top: GarmentView;
  bottom: GarmentView;
  shoe: GarmentView;
}

function resolve(outfit: OutfitView, garments: Map<string, GarmentView>): ResolvedOutfit | null {
  const top = garments.get(outfit.topId);
  const bottom = garments.get(outfit.bottomId);
  const shoe = garments.get(outfit.shoeId);
  if (!top || !bottom || !shoe) return null;
  return { outfit, top, bottom, shoe };
}

/**
 * Determine eligible outfits and score them. Pure and deterministic given an
 * injected rng — the full pipeline of §6 minus presentation.
 */
export function recommend(input: EngineInput): RecommendationResult {
  const rng = input.rng ?? Math.random;
  const occasion = OCCASIONS[input.occasion];
  const effectiveTemp = effectiveTemperature(input.weather, input.settings.comfort);

  const filterCtx: HardFilterContext = {
    occasion,
    dressCode: input.dressCode,
    effectiveTemp,
    rainExpected: input.weather?.rainExpected ?? false,
    snowExpected: input.weather?.snowExpected ?? false,
  };

  const scoringCtx: ScoringContext = {
    occasion,
    effectiveTemp,
    weather: input.weather,
    history: input.history,
    settings: input.settings,
    prefs: input.prefs,
    todayIso: input.todayIso,
  };

  const eligible: OutfitCandidate[] = [];
  const rejected: RejectedCandidate[] = [];

  const evaluate = (ctx: HardFilterContext) => {
    eligible.length = 0;
    rejected.length = 0;
    for (const outfit of input.outfits) {
      const resolved = resolve(outfit, input.garments);
      if (!resolved) continue;
      const reasons = applyHardConstraints(
        resolved.outfit,
        resolved.top,
        resolved.bottom,
        resolved.shoe,
        ctx,
      );
      if (reasons.length > 0) {
        rejected.push({ outfit, reasons });
      } else {
        eligible.push({
          ...resolved,
          breakdown: computeBreakdown(
            resolved.outfit,
            resolved.top,
            resolved.bottom,
            resolved.shoe,
            scoringCtx,
          ),
        });
      }
    }
  };

  evaluate(filterCtx);
  let relaxedConstraint: RecommendationResult["relaxedConstraint"] = null;

  // Graceful degradation: widen the occasion formality window before failing.
  if (eligible.length === 0) {
    const relaxedOccasion = {
      ...occasion,
      formalityMin: Math.max(1, occasion.formalityMin - 2),
      formalityMax: Math.min(10, occasion.formalityMax + 2),
    };
    evaluate({ ...filterCtx, occasion: relaxedOccasion });
    if (eligible.length > 0) relaxedConstraint = "occasion-ceiling";
  }

  const ranked = rankOutfits(eligible);
  const elite = eliteBand(ranked);
  const pick = selectFromEliteCandidates(elite, rng);

  return { pick, elite, ranked, rejected, relaxedConstraint };
}
