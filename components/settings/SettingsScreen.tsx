"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";
import { useHydration } from "@/hooks/useHydration";
import { useWeather } from "@/hooks/useWeather";
import { useAppStore, exportStateToJSON, type PersistedState } from "@/lib/store";
import { searchLocations } from "@/domain/weather/openMeteo";
import { OCCASIONS, OCCASION_ORDER } from "@/data/presets";
import type { GeoLocation } from "@/types/weather";
import type { OccasionId } from "@/types/context";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Button } from "@/components/ui/Button";
import { Field, Select, TextInput } from "@/components/ui/Field";
import { Skeleton } from "@/components/ui/Skeleton";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="label-caps text-ink-secondary">{title}</h2>
      {children}
    </section>
  );
}

export function SettingsScreen() {
  const hydrated = useHydration();
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const resetAll = useAppStore((s) => s.resetAll);
  const importState = useAppStore((s) => s.importState);
  const { refresh } = useWeather(hydrated);

  const [cityQuery, setCityQuery] = useState("");
  const [cityResults, setCityResults] = useState<GeoLocation[]>([]);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!hydrated) {
    return (
      <div className="px-6 pb-tabbar pt-safe">
        <div className="space-y-4 pt-10">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  const searchCity = async () => {
    try {
      const results = await searchLocations(cityQuery);
      setCityResults(results);
      if (results.length === 0) toast("No matching places found");
    } catch {
      toast("Couldn't search places right now");
    }
  };

  const exportData = () => {
    const json = exportStateToJSON(useAppStore.getState());
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `atelier-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as PersistedState;
        if (!parsed.settings) throw new Error("bad file");
        importState(parsed);
        toast("Data imported");
      } catch {
        toast("That file doesn't look like an Atelier export");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="px-6 pb-tabbar pt-safe">
      <header className="pt-8 sm:pt-10">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      </header>

      <div className="mx-auto mt-6 max-w-xl space-y-8">
        <Section title="Weather">
          <SegmentedControl
            ariaLabel="Weather source"
            className="w-full"
            options={[
              { value: "auto", label: "Automatic location" },
              { value: "manual", label: "Manual" },
            ]}
            value={settings.weatherMode}
            onChange={(v) => {
              updateSettings({ weatherMode: v });
              setTimeout(() => void refresh(), 0);
            }}
          />
          {settings.weatherMode === "manual" ? (
            <div className="space-y-2.5">
              <div className="flex gap-2">
                <TextInput
                  value={cityQuery}
                  onChange={(e) => setCityQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && void searchCity()}
                  placeholder="Search city"
                  aria-label="Search city"
                />
                <Button onClick={() => void searchCity()}>Search</Button>
              </div>
              {cityResults.length > 0 ? (
                <ul className="divide-y divide-line rounded-md border border-line">
                  {cityResults.map((r) => (
                    <li key={`${r.name}-${r.latitude}`}>
                      <button
                        type="button"
                        className="flex w-full items-baseline justify-between px-4 py-3 text-left text-sm hover:bg-surface"
                        onClick={() => {
                          updateSettings({ manualLocation: r });
                          setCityResults([]);
                          setCityQuery("");
                          toast(`Weather set to ${r.name}`);
                          setTimeout(() => void refresh(), 0);
                        }}
                      >
                        <span>{r.name}</span>
                        <span className="text-xs text-ink-faint">{r.country}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              {settings.manualLocation ? (
                <p className="text-xs text-ink-faint">
                  Current: {settings.manualLocation.name}
                </p>
              ) : null}
            </div>
          ) : null}
        </Section>

        <Section title="Comfort">
          <SegmentedControl
            ariaLabel="Comfort profile"
            className="w-full"
            options={[
              { value: "runs-cold", label: "Runs cold" },
              { value: "balanced", label: "Balanced" },
              { value: "runs-warm", label: "Runs warm" },
            ]}
            value={settings.comfort}
            onChange={(v) => updateSettings({ comfort: v })}
          />
        </Section>

        <Section title="Default context">
          <Field label="Occasion">
            {(id) => (
              <Select
                id={id}
                value={settings.defaultOccasion}
                onChange={(e) =>
                  updateSettings({ defaultOccasion: e.target.value as OccasionId })
                }
              >
                {OCCASION_ORDER.map((o) => (
                  <option key={o} value={o}>
                    {OCCASIONS[o].label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </Section>

        <Section title="Rotation">
          <div className="flex items-center justify-between rounded-md border border-line px-4 py-3">
            <div>
              <p className="text-sm font-medium">Exact outfit cooldown</p>
              <p className="text-xs text-ink-faint">
                Days before the same complete outfit repeats
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                aria-label="Decrease cooldown"
                onClick={() =>
                  updateSettings({
                    exactOutfitCooldownDays: Math.max(
                      3,
                      settings.exactOutfitCooldownDays - 1,
                    ),
                  })
                }
              >
                <Minus size={14} aria-hidden />
              </Button>
              <span className="w-6 text-center text-sm font-semibold tabular-nums">
                {settings.exactOutfitCooldownDays}
              </span>
              <Button
                size="sm"
                aria-label="Increase cooldown"
                onClick={() =>
                  updateSettings({
                    exactOutfitCooldownDays: Math.min(
                      30,
                      settings.exactOutfitCooldownDays + 1,
                    ),
                  })
                }
              >
                <Plus size={14} aria-hidden />
              </Button>
            </div>
          </div>
        </Section>

        <Section title="Theme">
          <SegmentedControl
            ariaLabel="Theme"
            className="w-full"
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
              { value: "system", label: "System" },
            ]}
            value={settings.theme}
            onChange={(v) => updateSettings({ theme: v })}
          />
        </Section>

        <Section title="Data">
          <div className="flex gap-2.5">
            <Button className="flex-1" onClick={exportData}>
              Export
            </Button>
            <Button className="flex-1" onClick={() => fileRef.current?.click()}>
              Import
            </Button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            aria-hidden
            tabIndex={-1}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importData(file);
              e.target.value = "";
            }}
          />
          {confirmReset ? (
            <div className="flex items-center justify-between rounded-md border border-danger/40 px-4 py-3">
              <p className="text-sm text-danger">Erase all local data?</p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setConfirmReset(false)}>
                  Keep
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    resetAll();
                    setConfirmReset(false);
                    toast("All data reset");
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="danger" className="w-full" onClick={() => setConfirmReset(true)}>
              Reset all data
            </Button>
          )}
        </Section>

        <footer className="pb-4 pt-2 text-center">
          <p className="font-serif text-lg italic text-ink-faint">Atelier</p>
          <p className="mt-1 text-xs text-ink-faint">A private daily wardrobe instrument</p>
        </footer>
      </div>
    </div>
  );
}
