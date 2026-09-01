"use client";

import { useMemo, useState } from "react";
import { useHydration } from "@/hooks/useHydration";
import { useGarmentMap, useOutfitViews } from "@/hooks/useWardrobe";
import { useAppStore } from "@/lib/store";
import { recommend } from "@/domain/recommendation/engine";
import { todayISO } from "@/domain/history/dates";
import { OCCASIONS, OCCASION_ORDER, DRESS_CODES, DRESS_CODE_ORDER } from "@/data/presets";
import type { DressCodeId, OccasionId } from "@/types/context";
import { Chip } from "@/components/ui/Chip";

/**
 * Development-only recommendation inspector (§48). Not linked from the
 * product UI — raw candidates, rejections, and scoring components.
 */
export function DebugScreen() {
  const hydrated = useHydration();
  const garments = useGarmentMap();
  const outfits = useOutfitViews();
  const weather = useAppStore((s) => s.weather);
  const history = useAppStore((s) => s.history);
  const settings = useAppStore((s) => s.settings);
  const prefs = useAppStore((s) => s.prefs);

  const [occasion, setOccasion] = useState<OccasionId>("school");
  const [dressCode, setDressCode] = useState<DressCodeId>("none");

  const result = useMemo(() => {
    if (!hydrated) return null;
    return recommend({
      garments,
      outfits,
      occasion,
      dressCode,
      weather: weather ? weather.now : null,
      history,
      settings,
      prefs,
      todayIso: todayISO(),
      rng: () => 0, // deterministic: always the top of the elite band
    });
  }, [hydrated, garments, outfits, occasion, dressCode, weather, history, settings, prefs]);

  if (!hydrated || !result) return null;

  return (
    <div className="px-6 pb-tabbar pt-safe font-mono text-xs">
      <h1 className="pt-8 font-sans text-2xl font-semibold tracking-tight">
        Recommendation inspector
      </h1>
      <p className="mt-1 font-sans text-ink-secondary">
        Development view — raw scoring, never product UI.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {OCCASION_ORDER.map((o) => (
          <Chip key={o} active={occasion === o} onClick={() => setOccasion(o)}>
            {OCCASIONS[o].label}
          </Chip>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {DRESS_CODE_ORDER.map((d) => (
          <Chip key={d} active={dressCode === d} onClick={() => setDressCode(d)}>
            {DRESS_CODES[d].label}
          </Chip>
        ))}
      </div>

      <h2 className="mt-6 font-sans text-sm font-semibold">
        Eligible ({result.ranked.length}) · elite band {result.elite.length} · pick:{" "}
        {result.pick?.outfit.id ?? "none"}
        {result.relaxedConstraint ? ` · relaxed: ${result.relaxedConstraint}` : ""}
      </h2>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[44rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-line-strong text-ink-secondary">
              <th className="py-1.5 pr-3">outfit</th>
              <th className="pr-3">total</th>
              <th className="pr-3">base</th>
              <th className="pr-3">weather</th>
              <th className="pr-3">formal</th>
              <th className="pr-3">style</th>
              <th className="pr-3">color</th>
              <th className="pr-3">recency</th>
              <th className="pr-3">pref</th>
              <th className="pr-3">bonus</th>
            </tr>
          </thead>
          <tbody>
            {result.ranked.slice(0, 30).map((c) => (
              <tr key={c.outfit.id} className="border-b border-line">
                <td className="py-1.5 pr-3">
                  {c.outfit.id} <span className="text-ink-faint">{c.outfit.tier}</span>
                </td>
                <td className="pr-3 font-semibold">{c.breakdown.total.toFixed(1)}</td>
                <td className="pr-3">{c.breakdown.base.toFixed(0)}</td>
                <td className="pr-3">{c.breakdown.weather.toFixed(0)}</td>
                <td className="pr-3">{c.breakdown.formality.toFixed(0)}</td>
                <td className="pr-3">{c.breakdown.style.toFixed(0)}</td>
                <td className="pr-3">{c.breakdown.color.toFixed(0)}</td>
                <td className="pr-3">{c.breakdown.recency.toFixed(0)}</td>
                <td className="pr-3">{c.breakdown.preference.toFixed(0)}</td>
                <td className="pr-3">
                  {(
                    c.breakdown.signatureBonus +
                    c.breakdown.favoriteBonus +
                    c.breakdown.occasionBias
                  ).toFixed(0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-6 font-sans text-sm font-semibold">
        Rejected ({result.rejected.length})
      </h2>
      <ul className="mt-2 space-y-1">
        {result.rejected.slice(0, 60).map((r) => (
          <li key={r.outfit.id}>
            <span className="text-ink">{r.outfit.id}</span>{" "}
            <span className="text-ink-faint">
              — {r.reasons.map((x) => `${x.kind}: ${x.detail}`).join("; ")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
