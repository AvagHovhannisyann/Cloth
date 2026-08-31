"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useAppStore } from "@/lib/store";

/**
 * Rehydrates the persisted store on the client after first paint, avoiding
 * SSR hydration mismatches. Render skeletons until this returns true.
 */
export function useHydration(): boolean {
  const hydrated = useSyncExternalStore(
    (onChange) => useAppStore.persist.onFinishHydration(onChange),
    () => useAppStore.persist.hasHydrated(),
    () => false,
  );

  useEffect(() => {
    if (!useAppStore.persist.hasHydrated()) {
      void useAppStore.persist.rehydrate();
    }
  }, []);

  return hydrated;
}
