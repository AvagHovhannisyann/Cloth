"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useHydration } from "@/hooks/useHydration";
import { useGarmentViews } from "@/hooks/useWardrobe";
import { useAppStore } from "@/lib/store";
import { isAvailable } from "@/types/garment";
import type { GarmentCategory, GarmentView } from "@/types/garment";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Chip } from "@/components/ui/Chip";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { GarmentTile } from "./GarmentTile";
import { GarmentDetailSheet } from "./GarmentDetailSheet";

type CategoryFilter = "all" | GarmentCategory;

const CATEGORY_OPTIONS = [
  { value: "all" as const, label: "All" },
  { value: "top" as const, label: "Tops" },
  { value: "bottom" as const, label: "Bottoms" },
  { value: "shoe" as const, label: "Shoes" },
];

export function WardrobeScreen() {
  const hydrated = useHydration();
  const garments = useGarmentViews();
  const target = useAppStore((s) => s.settings.wardrobeTargetCount);

  const [category, setCategory] = useState<CategoryFilter>("all");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const active = useMemo(
    () => garments.filter((g) => g.status !== "archived"),
    [garments],
  );

  const filtered = useMemo(
    () =>
      active.filter(
        (g) =>
          (category === "all" || g.category === category) &&
          (!availableOnly || isAvailable(g)) &&
          (!favoritesOnly || g.favorite),
      ),
    [active, category, availableOnly, favoritesOnly],
  );

  const selected: GarmentView | null =
    garments.find((g) => g.id === selectedId) ?? null;

  if (!hydrated) {
    return (
      <div className="px-6 pb-tabbar pt-safe">
        <div className="space-y-4 pt-10">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[5/6]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-tabbar pt-safe">
      <header className="flex items-end justify-between pt-8 sm:pt-10">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Wardrobe</h1>
          {active.length < target ? (
            <p className="mt-1 text-xs text-ink-faint">
              {active.length} / {target} catalogued
            </p>
          ) : null}
        </div>
        <Link
          href="/wardrobe/new"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-line-strong text-ink-secondary transition-colors hover:text-ink"
          aria-label="Add garment"
        >
          <Plus size={19} aria-hidden />
        </Link>
      </header>

      <div className="top-safe sticky z-10 -mx-6 mt-5 space-y-3 bg-ground/90 px-6 py-3 backdrop-blur-md">
        <SegmentedControl
          ariaLabel="Category"
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={setCategory}
          className="w-full"
        />
        <div className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6">
          <Chip active={availableOnly} onClick={() => setAvailableOnly((v) => !v)}>
            Available
          </Chip>
          <Chip active={favoritesOnly} onClick={() => setFavoritesOnly((v) => !v)}>
            Favourites
          </Chip>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Nothing here"
            detail="No garments match the current filters."
          />
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4">
          {filtered.map((g) => (
            <GarmentTile key={g.id} garment={g} onClick={(v) => setSelectedId(v.id)} />
          ))}
        </div>
      )}

      <GarmentDetailSheet
        garment={selected}
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      />
    </div>
  );
}
