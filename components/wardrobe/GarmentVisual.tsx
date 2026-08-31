import Image from "next/image";
import type { Garment } from "@/types/garment";
import { cn } from "@/lib/utils";
import { GarmentGlyph, glyphKind } from "./GarmentGlyph";

/**
 * The single way a garment is rendered anywhere in the app. Uses supplied
 * photography (object-contain, never cropped) when present; otherwise a
 * fabric-tone technical flat on a woven paper tile.
 */
export function GarmentVisual({
  garment,
  className,
  glyphClassName,
  sizes,
  priority,
}: {
  garment: Pick<Garment, "name" | "category" | "subtype" | "colors" | "image">;
  className?: string;
  glyphClassName?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={cn(
        "tile-weave relative flex items-center justify-center overflow-hidden rounded-md",
        className,
      )}
    >
      {garment.image ? (
        <Image
          src={garment.image}
          alt={garment.name}
          fill
          sizes={sizes ?? "(max-width: 768px) 50vw, 300px"}
          priority={priority}
          className="object-contain p-2"
        />
      ) : (
        <GarmentGlyph
          kind={glyphKind(garment.category, garment.subtype)}
          fill={garment.colors.swatch}
          className={cn("h-[72%] w-[72%]", glyphClassName)}
        />
      )}
    </div>
  );
}
