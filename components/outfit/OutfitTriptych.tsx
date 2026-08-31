import type { GarmentView } from "@/types/garment";
import { GarmentVisual } from "@/components/wardrobe/GarmentVisual";
import { cn } from "@/lib/utils";

/** Compact three-piece composition used in history rows and the planner. */
export function OutfitTriptych({
  top,
  bottom,
  shoe,
  className,
}: {
  top?: GarmentView;
  bottom?: GarmentView;
  shoe?: GarmentView;
  className?: string;
}) {
  return (
    <div className={cn("flex shrink-0 items-center gap-1", className)}>
      {[top, bottom, shoe].map((g, i) =>
        g ? (
          <GarmentVisual key={g.id} garment={g} className="h-12 w-12" glyphClassName="h-[78%] w-[78%]" />
        ) : (
          <div key={i} className="tile-weave h-12 w-12 rounded-md" />
        ),
      )}
    </div>
  );
}
