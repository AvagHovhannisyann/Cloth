import type { ComfortProfile } from "@/types/settings";
import type { WeatherSnapshot } from "@/types/weather";
import { COMFORT_SHIFT } from "@/domain/recommendation/constants";

/**
 * The temperature the engine dresses for: feels-like, shifted by the user's
 * comfort profile. Someone who runs cold is dressed as if it were colder.
 */
export function effectiveTemperature(
  weather: WeatherSnapshot | null,
  comfort: ComfortProfile,
): number | null {
  if (!weather) return null;
  return weather.feelsLike + COMFORT_SHIFT[comfort];
}
