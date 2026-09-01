"use client";

import { Heart } from "lucide-react";
import type { GarmentView } from "@/types/garment";
import { isAvailable } from "@/types/garment";
import { GarmentVisual } from "./GarmentVisual";
import { statusLabel } from "./GarmentDetailSheet";
import { cn } from "@/lib/utils";

export function GarmentTile({
  garment,
  onClick,
}: {
  garment: GarmentView;
  onClick: (garment: GarmentView) => void;
}) {
  const available = isAvailable(garment);

  return (
    <button
      type="button"
      onClick={() => onClick(garment)}
      className="group flex flex-col gap-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
    >
      <div className="relative">
        <GarmentVisual
          garment={garment}
          className={cn(
            "aspect-[5/6] w-full transition-opacity duration-300",
            !available && "opacity-40",
          )}
        />
        {garment.favorite ? (
          <span className="absolute right-2 top-2 text-ink" aria-label="Favourite">
            <Heart size={13} fill="currentColor" aria-hidden />
          </span>
        ) : null}
        {!available ? (
          <span className="label-caps absolute bottom-2 left-2 rounded-sm bg-ground/85 px-1.5 py-0.5 text-ink-secondary backdrop-blur-sm">
            {statusLabel(garment.status)}
          </span>
        ) : null}
      </div>
      <div className="min-w-0 px-0.5">
        <p className="truncate text-[0.8125rem] font-medium leading-snug tracking-tight">
          {garment.name}
        </p>
        <p className="truncate text-xs text-ink-faint">
          {garment.brand ?? garment.subtype}
        </p>
      </div>
    </button>
  );
}
