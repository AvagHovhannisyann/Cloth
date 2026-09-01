import type {
  DailyForecast,
  GeoLocation,
  WeatherCondition,
  WeatherSnapshot,
} from "@/types/weather";

/**
 * Weather via Open-Meteo — reliable, key-free, and CORS-friendly, so it works
 * from the browser after a plain Vercel deployment.
 */

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";

export const DEFAULT_LOCATION: GeoLocation = {
  name: "Yerevan",
  latitude: 40.1872,
  longitude: 44.5152,
  country: "Armenia",
};

interface WmoInfo {
  condition: WeatherCondition;
  label: string;
}

function mapWmoCode(code: number): WmoInfo {
  if (code === 0) return { condition: "clear", label: "Clear" };
  if (code === 1) return { condition: "clear", label: "Mostly clear" };
  if (code === 2) return { condition: "partly-cloudy", label: "Partly cloudy" };
  if (code === 3) return { condition: "cloudy", label: "Overcast" };
  if (code === 45 || code === 48) return { condition: "fog", label: "Fog" };
  if (code >= 51 && code <= 57) return { condition: "drizzle", label: "Drizzle" };
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82))
    return { condition: "rain", label: "Rain" };
  if ((code >= 71 && code <= 77) || code === 85 || code === 86)
    return { condition: "snow", label: "Snow" };
  if (code >= 95) return { condition: "thunderstorm", label: "Thunderstorm" };
  return { condition: "cloudy", label: "Cloudy" };
}

interface OpenMeteoResponse {
  current?: {
    temperature_2m?: number;
    apparent_temperature?: number;
    relative_humidity_2m?: number;
    weather_code?: number;
    wind_speed_10m?: number;
    is_day?: number;
  };
  daily?: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_probability_max?: number[];
    weather_code?: number[];
    uv_index_max?: number[];
  };
}

export interface WeatherBundle {
  /** Named `now` (not `current`) so React Compiler doesn't read it as a ref. */
  now: WeatherSnapshot;
  forecast: DailyForecast[];
}

export async function fetchWeather(location: GeoLocation): Promise<WeatherBundle> {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current:
      "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day",
    daily:
      "temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code,uv_index_max",
    timezone: "auto",
    forecast_days: "8",
  });

  const res = await fetch(`${FORECAST_URL}?${params.toString()}`);
  if (!res.ok) throw new Error(`Weather request failed (${res.status})`);
  const data = (await res.json()) as OpenMeteoResponse;

  const current = data.current ?? {};
  const daily = data.daily ?? {};
  const code = current.weather_code ?? 3;
  const info = mapWmoCode(code);
  const todayCode = daily.weather_code?.[0] ?? code;
  const todayInfo = mapWmoCode(todayCode);
  const precip = daily.precipitation_probability_max?.[0] ?? 0;

  const rainToday =
    todayInfo.condition === "rain" ||
    todayInfo.condition === "drizzle" ||
    todayInfo.condition === "thunderstorm" ||
    precip >= 60;
  const snowToday = todayInfo.condition === "snow";

  const snapshot: WeatherSnapshot = {
    temperature: current.temperature_2m ?? 20,
    feelsLike: current.apparent_temperature ?? current.temperature_2m ?? 20,
    high: daily.temperature_2m_max?.[0] ?? current.temperature_2m ?? 20,
    low: daily.temperature_2m_min?.[0] ?? current.temperature_2m ?? 20,
    precipitationProbability: precip,
    rainExpected: rainToday,
    snowExpected: snowToday,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m ?? 0,
    uvIndex: daily.uv_index_max?.[0],
    condition: info.condition,
    conditionLabel: info.label,
    isDay: (current.is_day ?? 1) === 1,
    fetchedAt: new Date().toISOString(),
    locationName: location.name,
    latitude: location.latitude,
    longitude: location.longitude,
  };

  const forecast: DailyForecast[] = (daily.time ?? []).map((dateISO, i) => {
    const dayInfo = mapWmoCode(daily.weather_code?.[i] ?? 3);
    return {
      dateISO,
      high: daily.temperature_2m_max?.[i] ?? 20,
      low: daily.temperature_2m_min?.[i] ?? 10,
      precipitationProbability: daily.precipitation_probability_max?.[i] ?? 0,
      condition: dayInfo.condition,
      conditionLabel: dayInfo.label,
    };
  });

  return { now: snapshot, forecast };
}

interface GeocodeResult {
  results?: Array<{
    name?: string;
    latitude?: number;
    longitude?: number;
    country?: string;
    admin1?: string;
  }>;
}

export async function searchLocations(query: string): Promise<GeoLocation[]> {
  if (query.trim().length < 2) return [];
  const params = new URLSearchParams({ name: query.trim(), count: "6", language: "en" });
  const res = await fetch(`${GEOCODE_URL}?${params.toString()}`);
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`);
  const data = (await res.json()) as GeocodeResult;
  return (data.results ?? [])
    .filter((r) => r.latitude !== undefined && r.longitude !== undefined && r.name)
    .map((r) => ({
      name: r.name!,
      latitude: r.latitude!,
      longitude: r.longitude!,
      country: r.country,
    }));
}

/** Browser geolocation wrapped in a promise; null when unavailable/denied. */
export function getBrowserPosition(): Promise<{ latitude: number; longitude: number } | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 8000, maximumAge: 30 * 60 * 1000 },
    );
  });
}

/** Best-effort reverse geocode for a display name; never throws. */
export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
    );
    if (!res.ok) return "Current location";
    const data = (await res.json()) as { city?: string; locality?: string };
    return data.city || data.locality || "Current location";
  } catch {
    return "Current location";
  }
}
