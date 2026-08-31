"use client";

import { motion } from "motion/react";
import type { GarmentView } from "@/types/garment";
import { GarmentVisual } from "@/components/wardrobe/GarmentVisual";
import { cn } from "@/lib/utils";

interface StackProps {
  top: GarmentView;
  bottom: GarmentView;
  shoe: GarmentView;
  outfitKey: string;
  onGarmentClick?: (garment: GarmentView) => void;
}

const spring = { type: "spring", stiffness: 320, damping: 30, mass: 0.7 } as const;

function Row({
  garment,
  index,
  align,
  tileClass,
  onClick,
}: {
  garment: GarmentView;
  index: number;
  align: "start" | "end";
  tileClass: string;
  onClick?: (garment: GarmentView) => void;
}) {
  const meta = (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col gap-1 pb-2",
        align === "start" ? "items-start text-left" : "items-end text-right",
      )}
    >
      <span className="label-caps text-ink-faint">
        {garment.category === "shoe" ? "Shoes" : garment.category}
      </span>
      <span className="text-[0.9375rem] font-medium leading-snug tracking-tight">
        {garment.name}
      </span>
      <span className="text-xs text-ink-secondary">
        {garment.brand ??
          garment.texture.charAt(0).toUpperCase() + garment.texture.slice(1)}
      </span>
    </div>
  );

  return (
    <motion.button
      type="button"
      onClick={onClick ? () => onClick(garment) : undefined}
      initial={{ opacity: 0, y: 16, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, transition: { duration: 0.16 } }}
      transition={{ ...spring, delay: index * 0.1 }}
      className={cn(
        "flex w-full items-end gap-4 text-left",
        align === "end" && "flex-row-reverse",
        onClick &&
          "cursor-pointer rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink",
      )}
    >
      <GarmentVisual garment={garment} className={tileClass} />
      {meta}
    </motion.button>
  );
}

/** The editorial top → bottom → shoes composition on the Home screen. */
export function OutfitStack({ top, bottom, shoe, outfitKey, onGarmentClick }: StackProps) {
  return (
    <div key={outfitKey} className="relative mx-auto flex w-full max-w-md flex-col gap-3">
      <div
        aria-hidden
        className="absolute inset-y-6 left-1/2 -z-10 w-px -translate-x-1/2 bg-line"
      />
      <Row
        garment={top}
        index={0}
        align="start"
        tileClass="aspect-[5/4] w-[62%] shrink-0"
        onClick={onGarmentClick}
      />
      <Row
        garment={bottom}
        index={1}
        align="end"
        tileClass="aspect-[4/5] w-[46%] shrink-0"
        onClick={onGarmentClick}
      />
      <Row
        garment={shoe}
        index={2}
        align="start"
        tileClass="aspect-[4/3] w-[44%] shrink-0"
        onClick={onGarmentClick}
      />
    </div>
  );
}
