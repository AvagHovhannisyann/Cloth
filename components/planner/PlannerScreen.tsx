"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { useHydration } from "@/hooks/useHydration";
import { useGarmentMap, useOutfitViews } from "@/hooks/useWardrobe";
import { useAppStore } from "@/lib/store";
import { recommend } from "@/domain/recommendation/engine";
import { addDays, formatDayLabel, formatShortDate, todayISO } from "@/domain/history/dates";
import { OCCASIONS, OCCASION_ORDER, DRESS_CODES, DRESS_CODE_ORDER } from "@/data/presets";
import type { DailyForecast, WeatherSnapshot } from "@/types/weather";
import type { DressCodeId, OccasionId } from "@/types/context";
import type { OutfitCandidate } from "@/types/recommendation";
import { Skeleton } from "@/components/ui/Skeleton";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { OutfitTriptych } from "@/components/outfit/OutfitTriptych";

function forecastSnapshot(
  forecast: DailyForecast,
  base: WeatherSnapshot,
): WeatherSnapshot {
  const daytime = forecast.high - 1;
  return {
    ...base,
    temperature: daytime,
    feelsLike: daytime,
    high: forecast.high,
    low: forecast.low,
    precipitationProbability: forecast.precipitationProbability,
    rainExpected:
      forecast.condition === "rain" ||
      forecast.condition === "drizzle" ||
      forecast.condition === "thunderstorm" ||
      forecast.precipitationProbability >= 60,
    snowExpected: forecast.condition === "snow",
    condition: forecast.condition,
    conditionLabel: forecast.conditionLabel,
  };
}

export function PlannerScreen() {
  const hydrated = useHydration();
  const garments = useGarmentMap();
  const outfits = useOutfitViews();
  const weather = useAppStore((s) => s.weather);
  const history = useAppStore((s) => s.history);
  const settings = useAppStore((s) => s.settings);
  const prefs = useAppStore((s) => s.prefs);
  const plans = useAppStore((s) => s.plans);
  const setPlan = useAppStore((s) => s.setPlan);
  const removePlan = useAppStore((s) => s.removePlan);

  const today = todayISO();
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(today, i + 1)),
    [today],
  );

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [occasion, setOccasion] = useState<OccasionId>(settings.defaultOccasion);
  const [dressCode, setDressCode] = useState<DressCodeId>("none");
  const [candidate, setCandidate] = useState<OutfitCandidate | null>(null);

  const forecastFor = (dateISO: string): DailyForecast | undefined =>
    weather?.forecast.find((f) => f.dateISO === dateISO);

  const openDay = (dateISO: string) => {
    const plan = plans[dateISO];
    setSelectedDay(dateISO);
    setOccasion(plan?.occasion ?? settings.defaultOccasion);
    setDressCode(plan?.dressCode ?? "none");
    setCandidate(null);
  };

  const runRecommend = () => {
    if (!selectedDay) return;
    const forecast = forecastFor(selectedDay);
    const snapshot =
      forecast && weather ? forecastSnapshot(forecast, weather.now) : null;
    const result = recommend({
      garments,
      outfits,
      occasion,
      dressCode,
      weather: snapshot,
      history,
      settings,
      prefs,
      todayIso: selectedDay,
    });
    setCandidate(result.pick);
    if (!result.pick) toast("No approved combination for that day's constraints");
  };

  const lock = () => {
    if (!selectedDay || !candidate) return;
    setPlan({
      dateISO: selectedDay,
      occasion,
      dressCode,
      outfitId: candidate.outfit.id,
      topId: candidate.top.id,
      bottomId: candidate.bottom.id,
      shoeId: candidate.shoe.id,
      locked: true,
      createdAt: new Date().toISOString(),
    });
    setSelectedDay(null);
    toast("Outfit locked for " + formatDayLabel(selectedDay, today).toLowerCase());
  };

  if (!hydrated) {
    return (
      <div className="px-6 pb-tabbar pt-safe">
        <div className="space-y-4 pt-10">
          <Skeleton className="h-8 w-32" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-tabbar pt-safe">
      <header className="pt-8 sm:pt-10">
        <h1 className="text-2xl font-semibold tracking-tight">Planner</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Lock an outfit for a coming day — it will be waiting in the morning.
        </p>
      </header>

      <ul className="mt-6 divide-y divide-line border-y border-line">
        {days.map((dateISO) => {
          const plan = plans[dateISO];
          const forecast = forecastFor(dateISO);
          const top = plan ? garments.get(plan.topId) : undefined;
          const bottom = plan ? garments.get(plan.bottomId) : undefined;
          const shoe = plan ? garments.get(plan.shoeId) : undefined;
          return (
            <li key={dateISO}>
              <button
                type="button"
                onClick={() => openDay(dateISO)}
                className="flex w-full items-center gap-4 py-3.5 text-left"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium tracking-tight">
                    {formatShortDate(dateISO)}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-faint">
                    {forecast
                      ? `${Math.round(forecast.high)}° / ${Math.round(forecast.low)}° · ${forecast.conditionLabel}`
                      : "No forecast"}
                    {plan ? ` · ${OCCASIONS[plan.occasion].label}` : ""}
                  </p>
                </div>
                {plan ? (
                  <>
                    <OutfitTriptych top={top} bottom={bottom} shoe={shoe} />
                    <Lock size={14} className="shrink-0 text-ink-faint" aria-label="Locked" />
                  </>
                ) : (
                  <span className="text-xs text-ink-faint">Plan</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <Sheet
        open={selectedDay !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedDay(null);
        }}
        title={selectedDay ? formatDayLabel(selectedDay, today) : ""}
      >
        {selectedDay ? (
          <div className="space-y-6">
            <section className="space-y-2.5">
              <h3 className="label-caps text-ink-secondary">Occasion</h3>
              <div className="flex flex-wrap gap-2">
                {OCCASION_ORDER.map((id) => (
                  <Chip key={id} active={occasion === id} onClick={() => setOccasion(id)}>
                    {OCCASIONS[id].label}
                  </Chip>
                ))}
              </div>
            </section>
            <section className="space-y-2.5">
              <h3 className="label-caps text-ink-secondary">Dress code</h3>
              <div className="flex flex-wrap gap-2">
                {DRESS_CODE_ORDER.map((id) => (
                  <Chip key={id} active={dressCode === id} onClick={() => setDressCode(id)}>
                    {DRESS_CODES[id].label}
                  </Chip>
                ))}
              </div>
            </section>

            {candidate ? (
              <div className="rounded-lg border border-line bg-surface p-4">
                <div className="flex items-center gap-4">
                  <OutfitTriptych
                    top={candidate.top}
                    bottom={candidate.bottom}
                    shoe={candidate.shoe}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium tracking-tight">
                      {candidate.outfit.name}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-faint">
                      {candidate.outfit.tier === "signature"
                        ? "Signature"
                        : candidate.outfit.tier === "strong"
                          ? "Strong pairing"
                          : "Approved pairing"}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex gap-2.5">
              {plans[selectedDay] ? (
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={() => {
                    removePlan(selectedDay);
                    setSelectedDay(null);
                    toast("Plan removed");
                  }}
                >
                  Unlock
                </Button>
              ) : null}
              <Button className="flex-1" onClick={runRecommend}>
                {candidate ? "Try another" : "Recommend"}
              </Button>
              {candidate ? (
                <Button variant="primary" className="flex-1" onClick={lock}>
                  Lock outfit
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </Sheet>
    </div>
  );
}
