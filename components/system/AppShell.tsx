"use client";

import { useEffect } from "react";
import { MotionConfig } from "motion/react";
import { Toaster } from "sonner";
import { useAppStore } from "@/lib/store";
import { useHydration } from "@/hooks/useHydration";
import { Nav } from "@/components/nav/Nav";

function useThemeSync(hydrated: boolean) {
  const theme = useAppStore((s) => s.settings.theme);

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && media.matches);
      root.classList.toggle("dark", dark);
      // Keep the browser chrome / status bar in step with a forced theme.
      document
        .querySelectorAll('meta[name="theme-color"]')
        .forEach((m) => m.setAttribute("content", dark ? "#171512" : "#f4f1ea"));
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme, hydrated]);
}

function useServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js");
  }, []);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const hydrated = useHydration();
  useThemeSync(hydrated);
  useServiceWorker();

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col">
        <main className="flex-1">{children}</main>
        <Nav />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "var(--color-raised)",
              color: "var(--color-ink)",
              border: "1px solid var(--color-line)",
              borderRadius: "0.625rem",
              fontSize: "0.875rem",
            },
          }}
        />
      </div>
    </MotionConfig>
  );
}
