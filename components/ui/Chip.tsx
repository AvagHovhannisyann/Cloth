"use client";

import { cn } from "@/lib/utils";

export function Chip({
  active,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[0.8125rem] font-medium transition-colors",
        active
          ? "border-ink bg-inverse text-inverse-ink"
          : "border-line-strong text-ink-secondary hover:text-ink",
        className,
      )}
      {...props}
    />
  );
}
