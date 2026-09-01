# Atelier

A private daily wardrobe instrument. It answers one question well:

**"What should I wear today?"**

Open it from your Home Screen, see the weather, tap once, and get an outfit
drawn from your real wardrobe — weather-appropriate, occasion-appropriate,
colour-coherent, and different enough from what you wore recently.

## What's inside

- **Curated engine, not a randomiser.** 35 audited garments, ~115 approved
  combinations across four tiers (invalid / acceptable / strong / signature),
  a compatibility map, and hard style rules (no polo with joggers, no hoodie
  over tailored trousers, dress codes as hard filters).
- **Context-aware scoring.** Weather (Open-Meteo, no API key), feels-like and
  comfort profile, occasion formality, colour harmony, style coherence,
  rotation cooldowns, and a small transparent preference model — weighted per
  the product brief, with controlled selection inside the elite band so
  mornings vary without ever dropping in quality.
- **Explainable.** "Why this?" gives human reasons, never raw scores.
- **Local-first.** Everything persists in the browser (Zustand + localStorage)
  with export/import; the storage layer is isolated so cloud sync (e.g.
  Supabase) can be added behind the same interface later.
- **PWA.** Manifest, icons, service worker, safe-area handling — installs to
  an iPhone/iPad Home Screen and keeps the wardrobe usable offline.

## Screens

| Route | Purpose |
| --- | --- |
| `/` | Today: greeting, weather line, one-tap recommendation, Wear this / Alternative / Why this? / Surprise me |
| `/wardrobe` | Visual wardrobe with filters, availability, favourites, add/edit (35 / 45 catalogued indicator) |
| `/history` | Worn outfits by day, with "actually wore something else" |
| `/planner` | Lock an outfit for a coming day; it surfaces next morning |
| `/settings` | Weather source, comfort profile, cooldowns, theme, data export/import/reset |
| `/debug` | Dev-only recommendation inspector (404s in production) |

## Development

```bash
npm install
npm run dev        # start dev server
npm run test       # vitest — engine test suite
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm run build      # production build
```

## Deployment

Deploys to Vercel as-is — no environment variables or external services
required. Weather comes from the key-free Open-Meteo API on the client.

## Wardrobe photography

Real garment photos go in `public/wardrobe/` (see the README there). Until an
item has a photo, the app renders it as a technical-flat silhouette in the
garment's fabric tone — never a fake image.

## Architecture

```
app/          routes (App Router)
components/   ui primitives, wardrobe, outfit, home, planner, history, settings
data/         seed wardrobe, outfit catalogue, occasion & dress-code presets
domain/       pure logic: recommendation engine, weather, history
hooks/        store selectors, weather, recommendation controller
lib/          zustand store, utils, colour helpers
types/        strict domain types
```

The recommendation engine (`domain/recommendation/`) is pure and fully
testable: hard filters → component scores → weighted total → elite band →
controlled selection, with an injectable RNG.
