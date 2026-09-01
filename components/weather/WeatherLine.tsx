"use client";

import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
  Zap,
} from "lucide-react";
import type { WeatherSnapshot } from "@/types/weather";
import type { WeatherStatus } from "@/hooks/useWeather";

function ConditionIcon({ snapshot }: { snapshot: WeatherSnapshot }) {
  const cls = "shrink-0 text-ink-secondary";
  const size = 15;
  switch (snapshot.condition) {
    case "clear":
      return snapshot.isDay ? (
        <Sun size={size} className={cls} aria-hidden />
      ) : (
        <Moon size={size} className={cls} aria-hidden />
      );
    case "partly-cloudy":
      return <CloudSun size={size} className={cls} aria-hidden />;
    case "fog":
      return <CloudFog size={size} className={cls} aria-hidden />;
    case "drizzle":
      return <CloudDrizzle size={size} className={cls} aria-hidden />;
    case "rain":
      return <CloudRain size={size} className={cls} aria-hidden />;
    case "snow":
      return <CloudSnow size={size} className={cls} aria-hidden />;
    case "thunderstorm":
      return <Zap size={size} className={cls} aria-hidden />;
    default:
      return <Cloud size={size} className={cls} aria-hidden />;
  }
}

/** The restrained contextual weather line under the greeting. */
export function WeatherLine({
  weather,
  status,
}: {
  weather: WeatherSnapshot | null;
  status: WeatherStatus;
}) {
  if (!weather) {
    return (
      <p className="text-sm text-ink-secondary">
        {status === "loading" ? "Checking the weather…" : "Weather unavailable"}
      </p>
    );
  }

  const stale = status === "stale";
  const fetchedTime = new Date(weather.fetchedAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-0.5">
      <p className="flex items-center gap-1.5 text-sm text-ink-secondary">
        <ConditionIcon snapshot={weather} />
        <span>
          {Math.round(weather.temperature)}°C · {weather.conditionLabel}
          {weather.precipitationProbability >= 40
            ? ` · ${weather.precipitationProbability}% rain`
            : ""}
        </span>
      </p>
      <p className="text-xs text-ink-faint">
        Feels like {Math.round(weather.feelsLike)}°C · H{Math.round(weather.high)}° L
        {Math.round(weather.low)}°
        {stale ? ` · from ${fetchedTime}` : ""}
      </p>
      {stale ? (
        <p className="text-xs text-ink-faint">
          Weather couldn&apos;t update. Using your last known conditions.
        </p>
      ) : null}
    </div>
  );
}
