"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
import {
  DEFAULT_LOCATION,
  fetchWeather,
  getBrowserPosition,
  reverseGeocode,
} from "@/domain/weather/openMeteo";
import type { GeoLocation } from "@/types/weather";

const STALE_AFTER_MS = 30 * 60 * 1000;

export type WeatherStatus = "idle" | "loading" | "fresh" | "stale" | "error";

/**
 * Keeps the cached weather bundle fresh. Never throws — offline or blocked
 * requests fall back to the last known conditions with a stale flag.
 */
export function useWeather(hydrated: boolean) {
  const weather = useAppStore((s) => s.weather);
  const setWeather = useAppStore((s) => s.setWeather);
  const settings = useAppStore((s) => s.settings);
  const [status, setStatus] = useState<WeatherStatus>("idle");
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setStatus("loading");
    try {
      let location: GeoLocation;
      if (settings.weatherMode === "manual" && settings.manualLocation) {
        location = settings.manualLocation;
      } else {
        const pos = await getBrowserPosition();
        if (pos) {
          const name = await reverseGeocode(pos.latitude, pos.longitude);
          location = { name, latitude: pos.latitude, longitude: pos.longitude };
        } else {
          location = settings.manualLocation ?? DEFAULT_LOCATION;
        }
      }
      const bundle = await fetchWeather(location);
      setWeather(bundle);
      setStatus("fresh");
    } catch {
      setStatus(useAppStore.getState().weather ? "stale" : "error");
    } finally {
      inFlight.current = false;
    }
  }, [settings.weatherMode, settings.manualLocation, setWeather]);

  useEffect(() => {
    if (!hydrated) return;
    // Deferred so the state updates happen in a scheduled callback,
    // not synchronously inside the effect body.
    const t = setTimeout(() => {
      const cached = useAppStore.getState().weather;
      const age = cached
        ? Date.now() - new Date(cached.now.fetchedAt).getTime()
        : Infinity;
      if (age > STALE_AFTER_MS) {
        void refresh();
      } else {
        setStatus("fresh");
      }
    }, 0);
    return () => clearTimeout(t);
  }, [hydrated, refresh]);

  return { weather, status, refresh };
}
