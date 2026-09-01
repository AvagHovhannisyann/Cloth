import type { GarmentView, GarmentState, AvailabilityStatus } from "@/types/garment";
import type { OutfitView } from "@/types/outfit";
import type { WeatherSnapshot } from "@/types/weather";
import type { AppSettings, PreferenceState } from "@/types/settings";
import { DEFAULT_GARMENT_STATE } from "@/types/garment";
import { DEFAULT_OUTFIT_STATE } from "@/types/outfit";
import { DEFAULT_SETTINGS } from "@/types/settings";
import { SEED_GARMENTS } from "@/data/garments";
import { SEED_OUTFITS } from "@/data/outfits";

export function garmentViews(
  overrides: Record<string, Partial<GarmentState>> = {},
): Map<string, GarmentView> {
  return new Map(
    SEED_GARMENTS.map((g) => [
      g.id,
      { ...g, ...DEFAULT_GARMENT_STATE, ...(overrides[g.id] ?? {}) },
    ]),
  );
}

export function outfitViews(): OutfitView[] {
  return SEED_OUTFITS.map((o) => ({ ...o, ...DEFAULT_OUTFIT_STATE }));
}

export function markStatus(
  views: Map<string, GarmentView>,
  id: string,
  status: AvailabilityStatus,
): Map<string, GarmentView> {
  const next = new Map(views);
  const g = next.get(id);
  if (g) next.set(id, { ...g, status });
  return next;
}

export function makeWeather(patch: Partial<WeatherSnapshot> = {}): WeatherSnapshot {
  const temperature = patch.temperature ?? 23;
  return {
    temperature,
    feelsLike: temperature,
    high: temperature + 2,
    low: temperature - 6,
    precipitationProbability: 5,
    rainExpected: false,
    snowExpected: false,
    windSpeed: 8,
    condition: "clear",
    conditionLabel: "Clear",
    isDay: true,
    fetchedAt: "2026-08-31T08:00:00.000Z",
    locationName: "Yerevan",
    latitude: 40.1872,
    longitude: 44.5152,
    ...patch,
  };
}

export const settings: AppSettings = { ...DEFAULT_SETTINGS };

export const emptyPrefs: PreferenceState = { garmentAffinity: {}, outfitAffinity: {} };

export const TODAY = "2026-08-31";

/** Deterministic rng: always selects the top of the elite band. */
export const rngTop = () => 0;
