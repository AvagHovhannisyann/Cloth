"use client";

import { Sheet } from "@/components/ui/Sheet";
import type { ExplanationLine } from "@/types/recommendation";

export function WhyThisSheet({
  open,
  onOpenChange,
  lines,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lines: ExplanationLine[];
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Why this works">
      <ul className="divide-y divide-line">
        {lines.map((line) => (
          <li key={line.title} className="flex flex-col gap-0.5 py-3.5">
            <span className="text-sm font-semibold tracking-tight">{line.title}</span>
            <span className="text-sm leading-relaxed text-ink-secondary">
              {line.detail}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-5 font-serif text-lg italic text-ink">
        Good choice for today.
      </p>
    </Sheet>
  );
}
