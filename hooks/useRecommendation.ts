"use client";

import { useCallback, useState } from "react";
import { useAppStore } from "@/lib/store";
import { useGarmentMap, useOutfitViews } from "@/hooks/useWardrobe";
import { recommend } from "@/domain/recommendation/engine";
import { pickAlternative, pickSurprise } from "@/domain/recommendation/selection";
import { todayISO } from "@/domain/history/dates";
import { uid } from "@/lib/utils";
import type { DressCodeId, OccasionId } from "@/types/context";
import type { OutfitCandidate, RecommendationResult } from "@/types/recommendation";
import type { WearSource } from "@/types/history";

export interface RecommendationController {
  occasion: OccasionId;
  dressCode: DressCodeId;
  setOccasion: (o: OccasionId) => void;
  setDressCode: (d: DressCodeId) => void;
  result: RecommendationResult | null;
  candidate: OutfitCandidate | null;
  source: WearSource;
  plannedToday: boolean;
  generate: (opts?: {
    fresh?: boolean;
    occasion?: OccasionId;
    dressCode?: DressCodeId;
  }) => OutfitCandidate | null;
  alternative: () => void;
  surprise: () => void;
  wearThis: () => void;
  markUnavailable: (garmentId: string) => void;
  clear: () => void;
  wornToday: boolean;
}

export function useRecommendation(): RecommendationController {
  const garments = useGarmentMap();
  const outfits = useOutfitViews();
  const weather = useAppStore((s) => s.weather);
  const history = useAppStore((s) => s.history);
  const settings = useAppStore((s) => s.settings);
  const prefs = useAppStore((s) => s.prefs);
  const plans = useAppStore((s) => s.plans);
  const dailyPick = useAppStore((s) => s.dailyPick);
  const setDailyPick = useAppStore((s) => s.setDailyPick);
  const recordWear = useAppStore((s) => s.recordWear);
  const skipOutfit = useAppStore((s) => s.skipOutfit);
  const setGarmentStatus = useAppStore((s) => s.setGarmentStatus);

  const weatherNow = weather ? weather.now : null;
  const today = todayISO();
  const plan = plans[today];

  // null = follow the locked plan / default — resolves correctly even before
  // the persisted settings hydrate, and tracks a plan created later.
  const [occasionChoice, setOccasionChoice] = useState<OccasionId | null>(null);
  const [dressCodeChoice, setDressCodeChoice] = useState<DressCodeId | null>(null);
  const occasion: OccasionId =
    occasionChoice ?? (plan?.locked ? plan.occasion : settings.defaultOccasion);
  const dressCode: DressCodeId =
    dressCodeChoice ?? (plan?.locked ? plan.dressCode : "none");
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [source, setSource] = useState<WearSource>("recommended");

  const wornToday = history.some((r) => r.dateISO === today);

  const runEngine = useCallback(
    (occ: OccasionId, code: DressCodeId) =>
      recommend({
        garments,
        outfits,
        occasion: occ,
        dressCode: code,
        weather: weatherNow,
        history,
        settings,
        prefs,
        todayIso: today,
      }),
    [garments, outfits, weatherNow, history, settings, prefs, today],
  );

  // Resolve the visible candidate from the last engine run.
  const candidate: OutfitCandidate | null =
    result && candidateId
      ? (result.ranked.find((c) => c.outfit.id === candidateId) ?? result.pick ?? null)
      : null;

  const plannedToday = Boolean(plan?.locked);

  const generate = useCallback((opts?: {
    fresh?: boolean;
    occasion?: OccasionId;
    dressCode?: DressCodeId;
  }): OutfitCandidate | null => {
    const occ = opts?.occasion ?? occasion;
    const code = opts?.dressCode ?? dressCode;
    if (opts?.occasion) setOccasionChoice(opts.occasion);
    if (opts?.dressCode) setDressCodeChoice(opts.dressCode);
    const res = runEngine(occ, code);
    setResult(res);
    // A fresh run (explicit context change) re-evaluates from scratch.
    if (!opts?.fresh) {
      // A locked plan for today surfaces the planned outfit instead.
      if (plan?.locked) {
        const planned = res.ranked.find((c) => c.outfit.id === plan.outfitId);
        if (planned) {
          setCandidateId(planned.outfit.id);
          setSource("planned");
          setDailyPick({ dateISO: today, outfitId: planned.outfit.id });
          return planned;
        }
      }
      // Reuse this morning's pick if one was already generated today.
      if (dailyPick && dailyPick.dateISO === today) {
        const kept = res.ranked.find((c) => c.outfit.id === dailyPick.outfitId);
        if (kept) {
          setCandidateId(kept.outfit.id);
          setSource("recommended");
          return kept;
        }
      }
    }
    setCandidateId(res.pick ? res.pick.outfit.id : null);
    setSource("recommended");
    if (res.pick) setDailyPick({ dateISO: today, outfitId: res.pick.outfit.id });
    return res.pick;
  }, [runEngine, occasion, dressCode, plan, dailyPick, today, setDailyPick]);

  const alternative = useCallback(() => {
    if (!result || !candidate) return;
    skipOutfit(candidate.outfit.id, [
      candidate.top.id,
      candidate.bottom.id,
      candidate.shoe.id,
    ]);
    const next = pickAlternative(result.ranked, candidate, Math.random);
    if (next) {
      setCandidateId(next.outfit.id);
      setSource("alternative");
      setDailyPick({ dateISO: today, outfitId: next.outfit.id });
    }
  }, [result, candidate, skipOutfit, setDailyPick, today]);

  const surprise = useCallback(() => {
    const res = result ?? runEngine(occasion, dressCode);
    setResult(res);
    const next = pickSurprise(res.ranked, Math.random);
    if (next) {
      setCandidateId(next.outfit.id);
      setSource("surprise");
      setDailyPick({ dateISO: today, outfitId: next.outfit.id });
    }
  }, [result, runEngine, occasion, dressCode, setDailyPick, today]);

  const wearThis = useCallback(() => {
    if (!candidate) return;
    recordWear({
      id: uid("wear"),
      dateISO: today,
      outfitId: candidate.outfit.id,
      topId: candidate.top.id,
      bottomId: candidate.bottom.id,
      shoeId: candidate.shoe.id,
      occasion,
      source,
      recordedAt: new Date().toISOString(),
    });
  }, [candidate, recordWear, today, occasion, source]);

  const markUnavailable = useCallback(
    (garmentId: string) => {
      setGarmentStatus(garmentId, "laundry", "Marked from today's outfit");
      // Regenerate around the missing piece.
      const res = recommend({
        garments: new Map(
          Array.from(garments.entries()).map(([id, g]) =>
            id === garmentId ? [id, { ...g, status: "laundry" as const }] : [id, g],
          ),
        ),
        outfits,
        occasion,
        dressCode,
        weather: weatherNow,
        history,
        settings,
        prefs,
        todayIso: today,
      });
      setResult(res);
      setCandidateId(res.pick ? res.pick.outfit.id : null);
      if (res.pick) setDailyPick({ dateISO: today, outfitId: res.pick.outfit.id });
    },
    [
      setGarmentStatus,
      garments,
      outfits,
      occasion,
      dressCode,
      weatherNow,
      history,
      settings,
      prefs,
      today,
      setDailyPick,
    ],
  );

  const clear = useCallback(() => {
    setResult(null);
    setCandidateId(null);
    setDailyPick(null);
  }, [setDailyPick]);

  return {
    occasion,
    dressCode,
    setOccasion: setOccasionChoice,
    setDressCode: setDressCodeChoice,
    result,
    candidate,
    source,
    plannedToday,
    generate,
    alternative,
    surprise,
    wearThis,
    markUnavailable,
    clear,
    wornToday,
  };
}
