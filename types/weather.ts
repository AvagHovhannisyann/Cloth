export type WeatherCondition =
  | "clear"
  | "partly-cloudy"
  | "cloudy"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "thunderstorm";

export interface WeatherSnapshot {
  /** Current air temperature, °C. */
  temperature: number;
  /** Apparent temperature, °C. */
  feelsLike: number;
  high: number;
  low: number;
  /** 0–100. */
  precipitationProbability: number;
  rainExpected: boolean;
  snowExpected: boolean;
  humidity?: number;
  /** km/h. */
  windSpeed: number;
  uvIndex?: number;
  condition: WeatherCondition;
  conditionLabel: string;
  isDay: boolean;
  fetchedAt: string;
  locationName: string;
  latitude: number;
  longitude: number;
}

export interface DailyForecast {
  dateISO: string;
  high: number;
  low: number;
  precipitationProbability: number;
  condition: WeatherCondition;
  conditionLabel: string;
}

export interface GeoLocation {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
}
