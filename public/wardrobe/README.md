# Wardrobe photography

Place isolated garment photographs here, named by garment id:

```
/public/wardrobe/top-01.png
/public/wardrobe/bot-04.png
/public/wardrobe/shoe-01.png
```

Then set the garment's `image` field (e.g. `/wardrobe/top-01.png`) in
`data/garments.ts` — or via Edit garment in the app for custom pieces.

Guidelines:

- Prefer transparent-background PNG or WebP; the app renders with
  `object-contain` and never crops the garment.
- One garment per file. If a source photo contains several garments, crop it
  properly first — the app deliberately shows an elegant fabric-tone
  placeholder until a real per-item asset exists.
