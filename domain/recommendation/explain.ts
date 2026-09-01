import type { OccasionId } from "@/types/context";
import type { WearRecord } from "@/types/history";
import type { ExplanationLine, OutfitCandidate } from "@/types/recommendation";
import type { WeatherSnapshot } from "@/types/weather";
import { OCCASIONS } from "@/data/presets";
import { daysSinceGarmentWorn } from "@/domain/history/wear";
import { describeColorPairing } from "./color";

export interface ExplainContext {
  weather: WeatherSnapshot | null;
  occasion: OccasionId;
  history: WearRecord[];
  todayIso: string;
}

/** Human explanation lines for the "Why this?" sheet. No raw scores. */
export function explainRecommendation(
  candidate: OutfitCandidate,
  ctx: ExplainContext,
): ExplanationLine[] {
  const lines: ExplanationLine[] = [];
  const { top, bottom, outfit } = candidate;

  if (ctx.weather) {
    const t = Math.round(ctx.weather.temperature);
    const wet =
      ctx.weather.rainExpected || ctx.weather.precipitationProbability >= 55;
    const fabric =
      top.warmth >= 6
        ? "warm enough for the knit"
        : top.warmth >= 4
          ? "right for a long sleeve"
          : "comfortable in lightweight fabrics";
    lines.push({
      title: `${t}°C ${wet ? "with rain likely" : "and dry"}`,
      detail: `Feels like ${Math.round(ctx.weather.feelsLike)}°C — ${fabric}.`,
    });
  }

  const occasion = OCCASIONS[ctx.occasion];
  lines.push({
    title: occasion.label,
    detail:
      outfit.formality >= 7
        ? "Polished enough without overreaching."
        : outfit.formality >= 5
          ? "Appropriate formality, nothing forced."
          : "Relaxed, still put together.",
  });

  const pairing = describeColorPairing(top, bottom);
  const topColor = top.colors.primary.split(",")[0]?.toLowerCase() ?? "the top";
  const bottomColor =
    bottom.colors.primary.split(",")[0]?.toLowerCase() ?? "the bottom";
  if (pairing.strength === "signature") {
    lines.push({
      title: `${capitalize(topColor)} + ${bottomColor}`,
      detail: "One of your strongest colour combinations.",
    });
  } else if (pairing.strength === "strong") {
    lines.push({
      title: `${capitalize(topColor)} + ${bottomColor}`,
      detail: "A colour pairing that reliably works.",
    });
  } else {
    lines.push({
      title: "Colour",
      detail: `${capitalize(topColor)} over ${bottomColor} keeps things quiet.`,
    });
  }

  const topDays = daysSinceGarmentWorn(top.id, ctx.history, ctx.todayIso);
  if (topDays === null) {
    lines.push({ title: "Rotation", detail: `You haven't worn the ${shortLabel(top.name)} yet.` });
  } else if (topDays >= 5) {
    lines.push({
      title: "Rotation",
      detail: `You haven't worn the ${shortLabel(top.name)} for ${topDays} days.`,
    });
  }

  if (outfit.tier === "signature") {
    lines.push({ title: "Signature", detail: "A curated signature combination." });
  }

  return lines;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function shortLabel(name: string): string {
  return name
    .replace(/Crew-Neck |Long-Sleeve |Short-Sleeve /gi, "")
    .toLowerCase()
    .replace(/t-shirt/i, "tee");
}
