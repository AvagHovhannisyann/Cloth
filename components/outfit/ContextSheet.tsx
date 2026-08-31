"use client";

import { Sheet } from "@/components/ui/Sheet";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { DRESS_CODES, DRESS_CODE_ORDER, OCCASIONS, OCCASION_ORDER } from "@/data/presets";
import type { DressCodeId, OccasionId } from "@/types/context";

export function ContextSheet({
  open,
  onOpenChange,
  occasion,
  dressCode,
  onOccasionChange,
  onDressCodeChange,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  occasion: OccasionId;
  dressCode: DressCodeId;
  onOccasionChange: (o: OccasionId) => void;
  onDressCodeChange: (d: DressCodeId) => void;
  onApply: () => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Today's context">
      <div className="space-y-6">
        <section className="space-y-2.5">
          <h3 className="label-caps text-ink-secondary">Occasion</h3>
          <div className="flex flex-wrap gap-2">
            {OCCASION_ORDER.map((id) => (
              <Chip
                key={id}
                active={occasion === id}
                onClick={() => onOccasionChange(id)}
              >
                {OCCASIONS[id].label}
              </Chip>
            ))}
          </div>
        </section>

        <section className="space-y-2.5">
          <h3 className="label-caps text-ink-secondary">Dress code</h3>
          <div className="flex flex-wrap gap-2">
            {DRESS_CODE_ORDER.map((id) => (
              <Chip
                key={id}
                active={dressCode === id}
                onClick={() => onDressCodeChange(id)}
              >
                {DRESS_CODES[id].label}
              </Chip>
            ))}
          </div>
          <p className="text-xs leading-relaxed text-ink-faint">
            {DRESS_CODES[dressCode].description}
          </p>
        </section>

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => {
            onApply();
            onOpenChange(false);
          }}
        >
          Apply
        </Button>
      </div>
    </Sheet>
  );
}
