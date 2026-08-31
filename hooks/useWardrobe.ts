"use client";

import { useMemo } from "react";
import { useAppStore, buildGarmentViews, buildOutfitViews } from "@/lib/store";
import type { GarmentView } from "@/types/garment";
import type { OutfitView } from "@/types/outfit";

export function useGarmentViews(): GarmentView[] {
  const garmentState = useAppStore((s) => s.garmentState);
  const customGarments = useAppStore((s) => s.customGarments);
  return useMemo(
    () => buildGarmentViews(garmentState, customGarments),
    [garmentState, customGarments],
  );
}

export function useGarmentMap(): Map<string, GarmentView> {
  const views = useGarmentViews();
  return useMemo(() => new Map(views.map((g) => [g.id, g])), [views]);
}

export function useOutfitViews(): OutfitView[] {
  const outfitState = useAppStore((s) => s.outfitState);
  const customOutfits = useAppStore((s) => s.customOutfits);
  return useMemo(
    () => buildOutfitViews(outfitState, customOutfits),
    [outfitState, customOutfits],
  );
}
