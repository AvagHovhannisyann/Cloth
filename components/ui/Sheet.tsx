"use client";

import { Drawer } from "vaul";
import { cn } from "@/lib/utils";

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Visually hide the title while keeping it for screen readers. */
  hideTitle?: boolean;
  children: React.ReactNode;
  contentClassName?: string;
}

/** Polished bottom sheet used for all mobile overlays. */
export function Sheet({
  open,
  onOpenChange,
  title,
  hideTitle,
  children,
  contentClassName,
}: SheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/35" />
        <Drawer.Content
          aria-describedby={undefined}
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92dvh] w-full max-w-3xl flex-col",
            "rounded-t-lg border-t border-line bg-ground shadow-sheet outline-none",
          )}
        >
          <div
            aria-hidden
            className="mx-auto mt-2.5 h-1 w-9 shrink-0 rounded-full bg-line-strong"
          />
          <Drawer.Title
            className={cn(
              "px-6 pt-4 text-base font-semibold tracking-tight",
              hideTitle && "sr-only",
            )}
          >
            {title}
          </Drawer.Title>
          <div
            className={cn(
              "flex-1 overflow-y-auto overscroll-contain px-6 pb-safe",
              contentClassName,
            )}
          >
            <div className="pb-6 pt-3">{children}</div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
