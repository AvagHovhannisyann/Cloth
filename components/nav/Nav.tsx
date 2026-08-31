"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, CalendarRange, Settings2, Shirt, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Today", icon: Sun },
  { href: "/wardrobe", label: "Wardrobe", icon: Shirt },
  { href: "/history", label: "History", icon: CalendarDays },
  { href: "/planner", label: "Planner", icon: CalendarRange },
  { href: "/settings", label: "Settings", icon: Settings2 },
] as const;

export function Nav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/90 backdrop-blur-md"
    >
      <div className="mx-auto flex w-full max-w-3xl items-stretch justify-around pb-safe">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-w-14 flex-col items-center gap-1 px-3 pb-2 pt-2.5 transition-colors",
                active ? "text-ink" : "text-ink-faint hover:text-ink-secondary",
              )}
            >
              <Icon size={20} strokeWidth={active ? 2 : 1.6} aria-hidden />
              <span className="text-[0.625rem] font-medium tracking-wide">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
