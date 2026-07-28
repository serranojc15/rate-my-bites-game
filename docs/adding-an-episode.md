# Adding Episode 3

The episode engine is intentionally small. A new episode should require one definition, one catalog registration, approved assets when needed, and validation—not a copy of the game engine.

## File locations

- Episode definitions and the centralized catalog: `episodes.js`
- Catalog validation: `episodes.js`
- Browser progress schema: `episodeProgress.js`
- Episode selection and runtime loading: `multiEpisode.js`
- Focused tests: `tests/episodes.test.cjs`
- Story standards: `docs/story-bible.md`

## Authoring workflow

1. Copy an approved playable episode definition in `episodes.js`.
2. Assign a new stable ID such as `episode-003`. Never use the title as a persistence key.
3. Write metadata: title, subtitle, destination, artwork reference, playable status, order, and optional tags.
4. Write story content: briefing, character voices, ordered scenes, meaningful clues, humor, a memory or emotional moment, finale clues, and an ending.
5. Define gameplay choices, correct answers, the correct restaurant, scoring inputs, and labels.
6. Define reveal order, restaurant commentary, encouragement, and the ending celebration.
7. Register the definition once in the `catalog` array.
8. Run validation and the focused tests.
9. Play the entire episode at desktop and narrow/mobile sizes.

## Required fields

A playable definition requires:

- `metadata.id`, `title`, `subtitle`, `destination`, `artwork`, `status`, and `order`
- `story.host`, `briefing.opening`, `briefing.people`, `scenes`, `missionText`, `finaleClues`, and `ending`
- `gameplay.images`, `restaurants`, `actualRestaurantId`, `diners`, `stages`, `points`, and `labels`
- `reveal.order`, `restaurantExplanation`, `correctRestaurant`, `incorrectRestaurant`, and `endingCelebration`

Tags and `metadata.future` are optional and do not affect gameplay.

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

Reference local approved assets or existing approved neutral artwork. Add a food image entry for every actual-restaurant menu choice where practical. The runtime has a neutral fallback, but an intentional asset is better.

Do not import copyrighted characters, logos, entertainment footage, scripts, dialogue, or music. Do not imply official affiliation with a third party.

## Register and validate

Add one playable catalog entry:

```js
{ ...episode3.metadata, episode: episode3 }
```

Then run:

```bash
node --check episodes.js
node tests/episodes.test.cjs
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
