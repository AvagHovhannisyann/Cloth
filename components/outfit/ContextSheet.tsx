"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { DRESS_CODES, DRESS_CODE_ORDER, OCCASIONS, OCCASION_ORDER } from "@/data/presets";
import type { DressCodeId, OccasionId } from "@/types/context";

/**
 * Context picker. Selections are staged locally and committed only on Apply —
 * dismissing the sheet leaves the current recommendation's context untouched.
 * The form remounts on every open so staging always starts from live values.
 */
export function ContextSheet({
  open,
  onOpenChange,
  occasion,
  dressCode,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  occasion: OccasionId;
  dressCode: DressCodeId;
  onApply: (occasion: OccasionId, dressCode: DressCodeId) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Today's context">
      <ContextForm
        key={open ? "open" : "closed"}
        initialOccasion={occasion}
        initialDressCode={dressCode}
        onApply={(o, d) => {
          onApply(o, d);
          onOpenChange(false);
        }}
      />
    </Sheet>
  );
}

function ContextForm({
  initialOccasion,
  initialDressCode,
  onApply,
}: {
  initialOccasion: OccasionId;
  initialDressCode: DressCodeId;
  onApply: (occasion: OccasionId, dressCode: DressCodeId) => void;
}) {
  const [stagedOccasion, setStagedOccasion] = useState<OccasionId>(initialOccasion);
  const [stagedDressCode, setStagedDressCode] = useState<DressCodeId>(initialDressCode);

  return (
    <div className="space-y-6">
      <section className="space-y-2.5">
        <h3 className="label-caps text-ink-secondary">Occasion</h3>
        <div className="flex flex-wrap gap-2">
          {OCCASION_ORDER.map((id) => (
            <Chip
              key={id}
              active={stagedOccasion === id}
              onClick={() => setStagedOccasion(id)}
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
              active={stagedDressCode === id}
              onClick={() => setStagedDressCode(id)}
            >
              {DRESS_CODES[id].label}
            </Chip>
          ))}
        </div>
        <p className="text-xs leading-relaxed text-ink-faint">
          {DRESS_CODES[stagedDressCode].description}
        </p>
      </section>

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={() => onApply(stagedOccasion, stagedDressCode)}
      >
        Apply
      </Button>
    </div>
  );
}
