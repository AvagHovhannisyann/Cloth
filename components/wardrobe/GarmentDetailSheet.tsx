"use client";

import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { GarmentVisual } from "@/components/wardrobe/GarmentVisual";
import { useAppStore } from "@/lib/store";
import { daysBetween, todayISO } from "@/domain/history/dates";
import type { AvailabilityStatus, GarmentView } from "@/types/garment";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Array<{ value: AvailabilityStatus; label: string }> = [
  { value: "available", label: "Available" },
  { value: "laundry", label: "In laundry" },
  { value: "dirty", label: "Dirty" },
  { value: "dry-cleaner", label: "Dry cleaner" },
  { value: "unavailable", label: "Unavailable" },
];

export function statusLabel(status: AvailabilityStatus): string {
  if (status === "archived") return "Archived";
  return STATUS_LABELS.find((s) => s.value === status)?.label ?? status;
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-2.5">
      <dt className="label-caps shrink-0 text-ink-faint">{label}</dt>
      <dd className="text-right text-sm text-ink">{value}</dd>
    </div>
  );
}

const CONFIDENCE_SUFFIX = {
  confirmed: "",
  probable: " (probable)",
  unverified: " (unverified)",
  "visual-estimate": " (visual estimate)",
} as const;

export function GarmentDetailSheet({
  garment,
  open,
  onOpenChange,
  onCantWear,
}: {
  garment: GarmentView | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set (outfit screen), shows the fast "Can't wear this" action. */
  onCantWear?: (garmentId: string) => void;
}) {
  const router = useRouter();
  const setGarmentStatus = useAppStore((s) => s.setGarmentStatus);
  const toggleFavorite = useAppStore((s) => s.toggleGarmentFavorite);

  if (!garment) return null;

  const lastWorn = garment.lastWornAt
    ? `${daysBetween(garment.lastWornAt, todayISO())} days ago`
    : "Not yet";

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={garment.name} hideTitle>
      <div className="space-y-5">
        <GarmentVisual garment={garment} className="mx-auto aspect-[5/4] w-full max-w-xs" />

        {onCantWear ? (
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => {
              onCantWear(garment.id);
              toast(`Choosing around the ${garment.name.toLowerCase()}`);
              onOpenChange(false);
            }}
          >
            Can&apos;t wear this today
          </Button>
        ) : null}

        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold leading-snug tracking-tight">
              {garment.name}
            </h2>
            <p className="mt-0.5 text-sm text-ink-secondary">
              {garment.brand
                ? `${garment.brand}${CONFIDENCE_SUFFIX[garment.brandConfidence]}`
                : "Brand unverified"}
            </p>
          </div>
          <button
            type="button"
            aria-pressed={garment.favorite}
            aria-label={garment.favorite ? "Remove favourite" : "Favourite"}
            onClick={() => toggleFavorite(garment.id)}
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-all active:scale-90",
              garment.favorite
                ? "border-ink bg-inverse text-inverse-ink"
                : "border-line-strong text-ink-secondary",
            )}
          >
            <Heart size={17} fill={garment.favorite ? "currentColor" : "none"} />
          </button>
        </div>

        <section className="space-y-2">
          <h3 className="label-caps text-ink-secondary">Availability</h3>
          <div className="flex flex-wrap gap-2">
            {STATUS_LABELS.map((s) => (
              <Chip
                key={s.value}
                active={garment.status === s.value}
                onClick={() => {
                  setGarmentStatus(garment.id, s.value);
                  if (s.value !== "available") {
                    toast(`${garment.name} marked ${s.label.toLowerCase()}`);
                  }
                }}
              >
                {s.label}
              </Chip>
            ))}
          </div>
        </section>

        <dl className="divide-y divide-line border-y border-line">
          <MetaRow label="Colour" value={garment.colors.primary} />
          <MetaRow
            label="Material"
            value={`${garment.materialDescription}${CONFIDENCE_SUFFIX[garment.materialConfidence]}`}
          />
          <MetaRow label="Texture" value={garment.texture} />
          <MetaRow label="Warmth" value={`${garment.warmth} / 10`} />
          <MetaRow label="Formality" value={`${garment.formality} / 10`} />
          <MetaRow label="Last worn" value={lastWorn} />
          <MetaRow label="Times worn" value={String(garment.wearCount)} />
        </dl>

        <div className="flex gap-2.5">
          <Button
            className="flex-1"
            onClick={() => {
              onOpenChange(false);
              router.push(`/wardrobe/edit?id=${garment.id}`);
            }}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => {
              setGarmentStatus(garment.id, "archived");
              toast(`${garment.name} archived`);
              onOpenChange(false);
            }}
          >
            Archive
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
