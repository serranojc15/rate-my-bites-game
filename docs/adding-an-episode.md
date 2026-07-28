# Adding an Episode

The episode engine is intentionally small. A new episode should require one definition, one catalog registration, approved assets when needed, and validation—not a copy of the game engine.

## File locations

- Episode definitions and the centralized catalog: `episodes.js`
- Series, Season, Character, Restaurant, and artwork Bibles: `worldBible.js`
- Catalog validation: `episodes.js`
- Build-time artwork validation: `scripts/validate-assets.cjs`
- Browser progress schema: `episodeProgress.js`
- Episode selection and runtime loading: `multiEpisode.js`
- Focused tests: `tests/episodes.test.cjs` and `tests/sprint31.test.cjs`
- Story standards: `docs/story-bible.md`
- Content hierarchy: `docs/story-architecture.md`

## Authoring workflow

1. Add or update canonical characters and restaurants in `worldBible.js`. Reuse existing IDs for returning people and places.
2. Register every portrait, restaurant, food, scene, and background asset with a stable artwork ID. Production definitions may not use remote URLs or placeholders.
3. Add the episode to the intended Season timeline.
4. Copy an approved playable episode definition in `episodes.js`.
5. Assign a stable ID such as `episode-003`. Never use the title as a persistence key.
6. Write metadata, story, gameplay truth, reveal copy, completion copy, and optional continuity.
7. Register the definition once in the `catalog` array.
8. Run artwork, catalog, and regression validation.
9. Play the entire episode at desktop, narrow/mobile, and landscape sizes.

## Required fields

A playable definition requires:

- `metadata.id`, `title`, `subtitle`, `destination`, `seasonId`, `artworkId`, `artwork`, `status`, and `order`
- `story.host`, `castIds`, `briefing.opening`, `briefing.people`, `scenes`, `missionText`, `finaleClues`, `ending`, and `completion`
- `gameplay.assetIds`, `images`, `restaurants`, `actualRestaurantId`, `diners`, `stages`, `points`, and `labels`
- `reveal.order`, `restaurantExplanation`, `correctRestaurant`, `incorrectRestaurant`, and `endingCelebration`

Tags, `metadata.future`, and `story.continuity` are optional and do not affect gameplay.

## Story versus gameplay truth

Story data controls what the player sees and hears: personalities, relationships, dialogue, clues, memories, humor, observations, scene order, and emotional payoff.

Gameplay data is the answer key: restaurant choices, menus, the correct restaurant, each diner’s correct meal/drink/dessert, score values, and labels. Do not hide gameplay truth inside dialogue parsing.

Each diner’s correct answers live at:

```js
diner.actual = {
  meal: "Menu item",
  drink: "Menu item",
  dessert: "Menu item"
};
```

Every correct item must appear on the actual restaurant’s matching menu. The validator rejects mismatches.

## Reveal content

`reveal.order` describes the intended restaurant-to-diners-to-celebration sequence. Character-specific explanations live in each diner’s `why` field. Restaurant and ending commentary live in `reveal`.

Keep the established score model unless a future approved sprint explicitly changes it:

- restaurant: 120
- meal: 30 per diner
- drink: 20 per diner
- dessert: 10 per diner
- maximum: 300

## Assets

Reference only IDs registered in `worldBible.js`. Every actual-restaurant meal, drink, and dessert requires its own semantically correct food artwork. Every diner portrait must equal that person’s Character Bible `portraitId`; every restaurant image must equal its Restaurant Bible `artworkId`; the episode cover must depict the actual restaurant.

The build rejects:

- missing or unknown artwork IDs
- remote URLs, placeholders, empty files, and invalid image files
- portrait swaps or a portrait shared by two people
- one image assigned to different foods or restaurants
- episode images that do not resolve from their registered IDs
- a cover image that does not depict the answer restaurant

Do not import copyrighted characters, logos, entertainment footage, scripts, dialogue, or music. Do not imply official affiliation with a third party.

## Optional continuity

Continuity must have a newcomer-safe branch:

```js
continuity: [{
  previousEpisodeId: "episode-002",
  optional: true,
  affectsGameplay: false,
  returning: "A warm callback returning players will recognize.",
  standalone: "The same current-story idea with no prior knowledge required."
}]
```

Previous episodes are never prerequisites and continuity never carries puzzle-critical evidence.

## Episode Complete copy

Every episode provides:

```js
completion: {
  mascotMessage: "Pup’s high-score congratulations.",
  funFact: "An optional character or restaurant payoff.",
  teaser: { speakerId: "canonical-character-id", text: "A short next-time button." }
}
```

The shared ending renderer calculates score, restaurant, meals identified, and accuracy. Do not duplicate those calculations in episode data.

## Register and validate

Add one playable catalog entry:

```js
{ ...episode3.metadata, episode: episode3 }
```

Then run:

```bash
node scripts/validate-assets.cjs
node --check episodes.js
node tests/episodes.test.cjs
node tests/sprint31.test.cjs
```

Run the repository’s complete static validation commands from `.github/workflows/static-validation.yml` before committing.

## Manual play-test

Verify:

- the card shows the correct Play or Replay state
- the episode launches from the library
- every briefing, diner, scene, restaurant, menu item, answer, reveal, and ending belongs to Episode 3
- switching away and back does not leak state or content
- scoring still totals 300
- completion and best score survive refresh
- lower replay scores do not replace the best
- click/tap/Space controls work
- the continuation instruction appears only on the first briefing screen
- desktop and narrow/mobile layouts remain usable
- no console errors occur
- Episode Complete offers Next, Replay, Library, and Home without horizontal overflow
- browser Back from an active episode returns to the Episode Library

## Common mistakes

- reusing a title as an ID
- forgetting to add the episode to the catalog
- placing a correct answer outside the actual restaurant’s menu
- mixing story prose into gameplay truth
- adding a switch statement or copied game component for one episode
- leaving a previous episode’s person ID in dialogue influence keys
- adding an unavailable catalog card that can still launch
- writing clues that reveal the answer directly
- shipping generic dialogue with no relationship, humor, memory, or payoff

Read the Story Bible before authoring. Human review and approval are required even when AI helps draft content.
