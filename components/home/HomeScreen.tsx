"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useHydration } from "@/hooks/useHydration";
import { useWeather } from "@/hooks/useWeather";
import { useRecommendation } from "@/hooks/useRecommendation";
import { useGarmentMap } from "@/hooks/useWardrobe";
import { explainRecommendation } from "@/domain/recommendation/explain";
import { daysSinceGarmentWorn } from "@/domain/history/wear";
import { todayISO } from "@/domain/history/dates";
import { OCCASIONS, DRESS_CODES } from "@/data/presets";
import { greetingForHour } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { OutfitStack } from "@/components/outfit/OutfitStack";
import { WhyThisSheet } from "@/components/outfit/WhyThisSheet";
import { ContextSheet } from "@/components/outfit/ContextSheet";
import { GarmentDetailSheet } from "@/components/wardrobe/GarmentDetailSheet";
import { WeatherLine } from "@/components/weather/WeatherLine";
import { WelcomeCard } from "@/components/home/WelcomeCard";
import type { GarmentView } from "@/types/garment";
import type { WearRecord } from "@/types/history";

export function HomeScreen() {
  const hydrated = useHydration();
  const { weather, status, refresh } = useWeather(hydrated);
  const rec = useRecommendation();
  const garmentMap = useGarmentMap();
  const history = useAppStore((s) => s.history);
  const dailyPick = useAppStore((s) => s.dailyPick);
  const plans = useAppStore((s) => s.plans);
  const introSeen = useAppStore((s) => s.settings.introSeen);
  const updateSettings = useAppStore((s) => s.updateSettings);

  const [whyOpen, setWhyOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [inspecting, setInspecting] = useState<GarmentView | null>(null);
  const [worn, setWorn] = useState(false);

  const candidate = rec.candidate;
  const weatherNow = weather ? weather.now : null;
  const occasion = rec.occasion;
  const today = todayISO();
  const now = new Date();
  const greeting = greetingForHour(now.getHours());
  const dateLine = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Morning experience: a locked plan or this morning's pick surfaces itself.
  const autoRan = useRef(false);
  useEffect(() => {
    if (!hydrated || autoRan.current || rec.candidate) return;
    const hasPlan = plans[today]?.locked;
    const hasPick = dailyPick?.dateISO === today;
    if (hasPlan || hasPick) {
      autoRan.current = true;
      rec.generate();
    }
  }, [hydrated, plans, dailyPick, today, rec]);

  const wornRecord = useMemo(
    () => history.find((r) => r.dateISO === today),
    [history, today],
  );

  const explanation = useMemo(
    () =>
      candidate
        ? explainRecommendation(candidate, {
            weather: weatherNow,
            occasion,
            history,
            todayIso: today,
          })
        : [],
    [candidate, weatherNow, occasion, history, today],
  );

  if (!hydrated) {
    return (
      <div className="px-6 pb-tabbar pt-safe">
        <div className="space-y-3 pt-10">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-52" />
          <Skeleton className="mt-10 h-72 w-full" />
        </div>
      </div>
    );
  }

  const contextLabel =
    OCCASIONS[rec.occasion].label +
    (rec.dressCode !== "none" ? ` · ${DRESS_CODES[rec.dressCode].label}` : "");

  const showRecommendation = candidate !== null;
  const wornToday = Boolean(wornRecord) || worn;

  return (
    <div className="px-6 pb-tabbar pt-safe">
      {/* Header */}
      <header className="pt-8 sm:pt-10">
        <h1 className="font-serif text-[1.75rem] italic leading-tight tracking-tight">
          {greeting}
        </h1>
        <div className="mt-2.5 space-y-1.5">
          <p className="text-sm text-ink-secondary">
            {dateLine}
            {weatherNow ? ` · ${weatherNow.locationName}` : ""}
          </p>
          <WeatherLine weather={weatherNow} status={status} />
          <button
            type="button"
            onClick={() => setContextOpen(true)}
            className="mt-1 inline-flex h-8 items-center gap-1.5 rounded-full border border-line-strong px-3 text-[0.8125rem] font-medium text-ink-secondary transition-colors hover:text-ink"
          >
            {contextLabel}
            {rec.plannedToday ? " · Planned" : ""}
          </button>
        </div>
      </header>

      {/* Body */}
      <section className="mt-8 min-h-[24rem]">
        <AnimatePresence mode="wait">
          {candidate ? (
            <motion.div
              key={candidate.outfit.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
            >
              <div className="mb-5 flex items-baseline justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">
                    {candidate.outfit.name}
                  </h2>
                  <p className="mt-0.5 text-xs text-ink-faint">
                    {candidate.outfit.tier === "signature"
                      ? "Signature"
                      : candidate.outfit.tier === "strong"
                        ? "Strong pairing"
                        : "Approved pairing"}
                    {topWornCaption(candidate.top.id, history, today)}
                  </p>
                </div>
              </div>

              <OutfitStack
                outfitKey={candidate.outfit.id}
                top={candidate.top}
                bottom={candidate.bottom}
                shoe={candidate.shoe}
                onGarmentClick={setInspecting}
              />

              {rec.result?.relaxedConstraint ? (
                <p className="mt-4 text-center text-xs text-ink-faint">
                  Loosened the formality window to find this.
                </p>
              ) : null}
            </motion.div>
          ) : rec.result && !rec.result.pick ? (
            <motion.div key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <EmptyState
                title="No approved combination matches all of today's constraints."
                detail="Try relaxing the dress code, changing the occasion, or freeing something from the laundry."
                action={
                  <Button onClick={() => setContextOpen(true)}>
                    Relax one constraint
                  </Button>
                }
              />
            </motion.div>
          ) : !introSeen ? (
            <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <WelcomeCard onUseLocation={() => void refresh()} />
            </motion.div>
          ) : (
            <motion.div
              key="invite"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              className="flex min-h-[22rem] flex-col items-center justify-center gap-3 text-center"
            >
              <p className="font-serif text-xl italic text-ink-secondary">
                What should I wear today?
              </p>
              <p className="max-w-[16rem] text-sm text-ink-faint">
                One tap. Weather, occasion and rotation considered.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Actions */}
      <section className="mx-auto mt-8 w-full max-w-md space-y-3">
        {wornToday && showRecommendation ? (
          <div className="flex h-[3.25rem] items-center justify-center gap-2 rounded-md border border-line text-[0.9375rem] font-medium text-ink-secondary">
            <Check size={17} aria-hidden /> Worn today
          </div>
        ) : showRecommendation ? (
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => {
              rec.wearThis();
              setWorn(true);
              toast("Recorded for today");
            }}
          >
            Wear this
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => {
              if (!introSeen) updateSettings({ introSeen: true });
              const pick = rec.generate();
              if (!pick) toast("Nothing matches today's constraints yet");
            }}
          >
            Choose my outfit
          </Button>
        )}

        {showRecommendation && !wornToday ? (
          <div className="flex items-center justify-center gap-1">
            <Button variant="ghost" size="sm" onClick={rec.alternative}>
              Alternative
            </Button>
            <span className="text-line-strong">·</span>
            <Button variant="ghost" size="sm" onClick={() => setWhyOpen(true)}>
              Why this?
            </Button>
            <span className="text-line-strong">·</span>
            <Button variant="ghost" size="sm" onClick={rec.surprise}>
              Surprise me
            </Button>
          </div>
        ) : null}
      </section>

      {/* Sheets */}
      <WhyThisSheet open={whyOpen} onOpenChange={setWhyOpen} lines={explanation} />
      <ContextSheet
        open={contextOpen}
        onOpenChange={setContextOpen}
        occasion={rec.occasion}
        dressCode={rec.dressCode}
        onOccasionChange={rec.setOccasion}
        onDressCodeChange={rec.setDressCode}
        onApply={() => {
          // Re-run with the new context on next tick so state has settled.
          setTimeout(() => rec.generate({ fresh: true }), 0);
        }}
      />
      <GarmentDetailSheet
        garment={inspecting ? (garmentMap.get(inspecting.id) ?? inspecting) : null}
        open={inspecting !== null}
        onOpenChange={(open) => {
          if (!open) setInspecting(null);
        }}
      />
    </div>
  );
}

function topWornCaption(
  topId: string,
  history: WearRecord[],
  today: string,
): string {
  const days = daysSinceGarmentWorn(topId, history, today);
  if (days === null || days < 1) return "";
  return ` · Top last worn ${days === 1 ? "yesterday" : `${days} days ago`}`;
}
