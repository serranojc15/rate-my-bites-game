# Sprint 3.1 Artwork Audit

## Result

All playable catalog episodes and preserved Episode 1 Fresh Variants resolve through `worldBible.js` to approved local artwork. The production registry currently contains:

- 15 fixed portraits, including Pup, current cast, preserved Fresh Variant guests, and reserved Grace/Ben identities
- 18 restaurant identities
- 28 food, drink, and dessert assets
- 1 Coming Soon scene

Remote runtime image dependencies, placeholder assignments, and invalid catalog references were removed.

## Corrected mappings

- Episode 2 no longer reuses Emma, Marcus, and Olivia portraits for June, Ellis, and Priya.
- Episode 2’s six restaurants no longer reuse unrelated Episode 1 restaurant images.
- Chicken enchiladas no longer display a tamale photograph, and the remaining Episode 1 answer images were visually rechecked against their labels.
- Herb roast chicken, Sunday pot pie, smoked meatloaf, sparkling lemonade, root beer, peach cobbler, and chocolate chess pie now have exact artwork instead of unrelated tacos, cocktails, tea, or generic cake.
- “No dessert” uses a deliberate local empty-plate illustration.
- The Coming Soon card uses dedicated Midnight Breakfast scene artwork.
- Fresh Variants B and C use fixed guest portraits, their own restaurant identities, and exact nine-item menu manifests. Switching variants clears stale food artwork.

## Automated gate

Run:

```bash
node scripts/validate-assets.cjs
```

The build fails for unknown IDs, missing files, invalid WebP/SVG files, remote URLs, placeholder markers, duplicate file/subject assignments, portrait ownership conflicts, wrong artwork kinds, mismatched restaurant/food subjects, or an episode cover that does not depict its answer restaurant.

GitHub’s Static validation workflow runs this before the regression suites.

## Responsive QA

The audit contact sheets were visually inspected for:

- distinct character identity and face consistency
- restaurant-to-name plausibility
- meal/drink/dessert semantic accuracy
- crop quality and legibility at card size
- broken or empty images

The Episode Complete CSS, safe-area rules, compact breakpoints, landscape rule, and automated viewport matrix cover:

- 375 × 667 (iPhone SE)
- 393 × 852 (iPhone 16)
- 402 × 874 (iPhone 16 Pro)
- 440 × 956 (iPhone 16 Pro Max)
- 360 × 800 and 412 × 915 (common Android)
- 844 × 390 (phone landscape)
- 1280 × 900 (desktop)
