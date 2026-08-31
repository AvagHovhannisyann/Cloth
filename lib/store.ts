"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Garment, GarmentState, GarmentView, AvailabilityStatus } from "@/types/garment";
import type { OutfitDefinition, OutfitState, OutfitView } from "@/types/outfit";
import type { OutfitPlan, WearRecord } from "@/types/history";
import type { AppSettings, PreferenceState } from "@/types/settings";
import type { WeatherBundle } from "@/domain/weather/openMeteo";
import { DEFAULT_GARMENT_STATE } from "@/types/garment";
import { DEFAULT_OUTFIT_STATE } from "@/types/outfit";
import { DEFAULT_SETTINGS } from "@/types/settings";
import { SEED_GARMENTS } from "@/data/garments";
import { SEED_OUTFITS } from "@/data/outfits";
import {
  applyFavoriteOutfit,
  applySkip,
  applyWear,
  EMPTY_PREFERENCES,
} from "@/domain/recommendation/learning";

export interface DailyPick {
  dateISO: string;
  outfitId: string;
}

interface PersistedState {
  garmentState: Record<string, GarmentState>;
  customGarments: Garment[];
  outfitState: Record<string, OutfitState>;
  customOutfits: OutfitDefinition[];
  history: WearRecord[];
  plans: Record<string, OutfitPlan>;
  settings: AppSettings;
  prefs: PreferenceState;
  weather: WeatherBundle | null;
  dailyPick: DailyPick | null;
}

interface AppActions {
  setGarmentStatus: (id: string, status: AvailabilityStatus, reason?: string) => void;
  toggleGarmentFavorite: (id: string) => void;
  addGarment: (garment: Garment) => void;
  updateGarment: (garment: Garment) => void;
  toggleOutfitFavorite: (id: string) => void;
  recordWear: (record: WearRecord) => void;
  removeWear: (recordId: string) => void;
  skipOutfit: (outfitId: string, garmentIds: string[]) => void;
  setPlan: (plan: OutfitPlan) => void;
  removePlan: (dateISO: string) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  setWeather: (bundle: WeatherBundle | null) => void;
  setDailyPick: (pick: DailyPick | null) => void;
  importState: (state: PersistedState) => void;
  resetAll: () => void;
}

export type AppStore = PersistedState & AppActions;

const EMPTY_STATE: PersistedState = {
  garmentState: {},
  customGarments: [],
  outfitState: {},
  customOutfits: [],
  history: [],
  plans: {},
  settings: DEFAULT_SETTINGS,
  prefs: EMPTY_PREFERENCES,
  weather: null,
  dailyPick: null,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...EMPTY_STATE,

      setGarmentStatus: (id, status, reason) =>
        set((s) => ({
          garmentState: {
            ...s.garmentState,
            [id]: {
              ...(s.garmentState[id] ?? DEFAULT_GARMENT_STATE),
              status,
              availabilityReason: reason,
            },
          },
        })),

      toggleGarmentFavorite: (id) =>
        set((s) => {
          const prev = s.garmentState[id] ?? DEFAULT_GARMENT_STATE;
          return {
            garmentState: {
              ...s.garmentState,
              [id]: { ...prev, favorite: !prev.favorite },
            },
          };
        }),

      addGarment: (garment) =>
        set((s) => ({ customGarments: [...s.customGarments, garment] })),

      updateGarment: (garment) =>
        set((s) => ({
          customGarments: s.customGarments.some((g) => g.id === garment.id)
            ? s.customGarments.map((g) => (g.id === garment.id ? garment : g))
            : [...s.customGarments, garment],
        })),

      toggleOutfitFavorite: (id) =>
        set((s) => {
          const prev = s.outfitState[id] ?? DEFAULT_OUTFIT_STATE;
          const nowFavorite = !prev.favorite;
          return {
            outfitState: {
              ...s.outfitState,
              [id]: { ...prev, favorite: nowFavorite },
            },
            prefs: nowFavorite ? applyFavoriteOutfit(s.prefs, id) : s.prefs,
          };
        }),

      recordWear: (record) =>
        set((s) => {
          const garmentState = { ...s.garmentState };
          for (const id of [record.topId, record.bottomId, record.shoeId]) {
            const prev = garmentState[id] ?? DEFAULT_GARMENT_STATE;
            garmentState[id] = {
              ...prev,
              lastWornAt: record.dateISO,
              wearCount: prev.wearCount + 1,
              manualSelections:
                record.source === "manual"
                  ? prev.manualSelections + 1
                  : prev.manualSelections,
            };
          }
          let outfitState = s.outfitState;
          if (record.outfitId) {
            const prev = s.outfitState[record.outfitId] ?? DEFAULT_OUTFIT_STATE;
            outfitState = {
              ...s.outfitState,
              [record.outfitId]: {
                ...prev,
                timesWorn: prev.timesWorn + 1,
                lastWornAt: record.dateISO,
              },
            };
          }
          return {
            history: [record, ...s.history.filter((r) => r.id !== record.id)],
            garmentState,
            outfitState,
            prefs: applyWear(s.prefs, record.outfitId, [
              record.topId,
              record.bottomId,
              record.shoeId,
            ]),
          };
        }),

      removeWear: (recordId) =>
        set((s) => ({ history: s.history.filter((r) => r.id !== recordId) })),

      skipOutfit: (outfitId, garmentIds) =>
        set((s) => {
          const prev = s.outfitState[outfitId] ?? DEFAULT_OUTFIT_STATE;
          return {
            outfitState: {
              ...s.outfitState,
              [outfitId]: { ...prev, skipCount: prev.skipCount + 1 },
            },
            prefs: applySkip(s.prefs, outfitId, garmentIds),
          };
        }),

      setPlan: (plan) => set((s) => ({ plans: { ...s.plans, [plan.dateISO]: plan } })),

      removePlan: (dateISO) =>
        set((s) => {
          const plans = { ...s.plans };
          delete plans[dateISO];
          return { plans };
        }),

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      setWeather: (bundle) => set({ weather: bundle }),

      setDailyPick: (pick) => set({ dailyPick: pick }),

      importState: (state) => set({ ...EMPTY_STATE, ...state }),

      resetAll: () => set({ ...EMPTY_STATE }),
    }),
    {
      name: "atelier-store-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);

/* ------------------------------------------------------------------ views */

export function buildGarmentViews(
  garmentState: Record<string, GarmentState>,
  customGarments: Garment[],
): GarmentView[] {
  // Custom entries override a seed garment with the same id (edited copies).
  const byId = new Map<string, Garment>();
  for (const g of SEED_GARMENTS) byId.set(g.id, g);
  for (const g of customGarments) byId.set(g.id, g);
  return Array.from(byId.values()).map((g) => ({
    ...g,
    ...(garmentState[g.id] ?? DEFAULT_GARMENT_STATE),
  }));
}

export function buildOutfitViews(
  outfitState: Record<string, OutfitState>,
  customOutfits: OutfitDefinition[],
): OutfitView[] {
  return [...SEED_OUTFITS, ...customOutfits].map((o) => ({
    ...o,
    ...(outfitState[o.id] ?? DEFAULT_OUTFIT_STATE),
  }));
}

export function exportStateToJSON(state: PersistedState): string {
  const snapshot: PersistedState = {
    garmentState: state.garmentState,
    customGarments: state.customGarments,
    outfitState: state.outfitState,
    customOutfits: state.customOutfits,
    history: state.history,
    plans: state.plans,
    settings: state.settings,
    prefs: state.prefs,
    weather: state.weather,
    dailyPick: state.dailyPick,
  };
  return JSON.stringify(snapshot, null, 2);
}

export type { PersistedState };
