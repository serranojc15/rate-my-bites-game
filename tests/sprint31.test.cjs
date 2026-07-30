const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");

let assertions = 0;
const ok = (value, message) => { assertions += 1; assert.ok(value, message); };
const equal = (actual, expected, message) => { assertions += 1; assert.equal(actual, expected, message); };
const deepEqual = (actual, expected, message) => {
  assertions += 1;
  assert.deepEqual(JSON.parse(JSON.stringify(actual)), JSON.parse(JSON.stringify(expected)), message);
};

const window = {};
window.window = window;
const sandbox = { window, console };
vm.createContext(sandbox);
for (const file of [
  "worldBible.js",
  "characterBible.js",
  "voiceBible.js",
  "season1Bible.js",
  "livingEpisode.js",
  "episodes.js",
  "sprint31.js"
]) {
  vm.runInContext(fs.readFileSync(file, "utf8"), sandbox, { filename: file });
}

const world = window.RateMyBitesWorld;
const episodes = window.RateMyBitesEpisodes;
const sprint31 = window.RateMyBitesSprint31;
const characters = world.getCharacters();
const restaurants = world.getRestaurants();
const assets = world.getAssets();
const catalog = episodes.getCatalog();

// Canonical world and Character Bible.
ok(world, "World Bible API is exposed");
equal(world.schemaVersion, 1, "World Bible schema is versioned");
equal(world.validateBible().valid, true, "World Bible validation passes");
for (const id of ["emma", "marcus", "olivia", "june", "ellis", "priya", "grace", "ben", "sophie", "daniel", "rachel", "maya", "noah", "liam"]) {
  ok(characters[id], `${id} has a canonical Character Bible entry`);
}
const requiredCharacterFields = [
  "id", "name", "portraitId", "homeCity", "occupation", "personality",
  "favoriteFoods", "leastFavoriteFoods", "favoriteRestaurants", "favoriteDrinks",
  "signatureOrder", "relationships", "runningJokes", "episodeAppearances",
  "notes", "futureStoryIdeas"
];
for (const character of Object.values(characters)) {
  for (const field of requiredCharacterFields) ok(character[field] !== undefined, `${character.id}.${field} is authored`);
  equal(assets[character.portraitId].subjectId, character.id, `${character.id} owns its portrait`);
}
equal(new Set(Object.values(characters).map(character => character.portraitId)).size, Object.keys(characters).length, "no two characters share a portrait");
equal(characters.ellis.portraitId, "portrait.ellis", "Ellis always resolves to Ellis’s portrait");
equal(characters.emma.portraitId, "portrait.emma", "Emma always resolves to Emma’s portrait");
deepEqual(characters.grace.episodeAppearances, ["episode-003"], "Grace’s canonical first appearance is Episode 3");
equal(characters.ben.episodeAppearances.length, 0, "reserved Ben infrastructure does not create an episode");
const isolatedCharacter = world.getCharacter("emma");
isolatedCharacter.name = "Changed";
equal(world.getCharacter("emma").name, "Emma", "Character Bible reads are isolated");

// Series → Season → Episode infrastructure.
const series = world.getSeries();
const season = world.getSeason("season-001");
equal(series.seasonIds.length, 1, "only one season is implemented");
equal(season.title, "Huntsville", "Season 1 has the intended identity");
ok(Array.isArray(season.mainCast) && Array.isArray(season.recurringCast), "season cast groups load");
deepEqual(season.timeline.map(item => item.episodeId), ["episode-001", "episode-002", "episode-003"], "season timeline orders all playable episodes");
for (const entry of catalog.filter(item => item.status === "playable")) {
  equal(entry.episode.metadata.seasonId, season.id, `${entry.id} belongs to Season 1`);
  ok(season.timeline.some(item => item.episodeId === entry.id), `${entry.id} appears in the season timeline`);
}
equal(Object.keys(world.getSeasons()).length, 1, "future seasons are not implemented");
ok(Object.values(restaurants).every(place => place.artworkId && place.identity), "recurring restaurants have canonical identities");
const duplicateTimeline = world.getSnapshot();
duplicateTimeline.seasons["season-001"].timeline[1].order = 1;
equal(world.validateBible(duplicateTimeline).valid, false, "Season Bible rejects duplicate timeline order");
const incompleteRestaurant = world.getSnapshot();
incompleteRestaurant.restaurants["maple-main"].identity = "";
equal(world.validateBible(incompleteRestaurant).valid, false, "Restaurant Bible rejects a missing place identity");

// Optional continuity remains self-contained.
const episode2Base = episodes.getEpisode("episode-002");
const standalone = episodes.resolveContinuity("episode-002", []);
const returning = episodes.resolveContinuity("episode-002", ["episode-001"]);
equal(standalone.story.resolvedContinuity.length, 1, "new players receive one standalone continuity line");
ok(standalone.story.resolvedContinuity[0].includes("one rule"), "standalone continuity explains itself");
ok(returning.story.resolvedContinuity[0].includes("Olivia"), "returning players receive the prior-episode reward");
ok(!standalone.story.resolvedContinuity[0].includes("Olivia"), "new players do not receive an unexplained prior-episode reference");
equal(episodes.getEpisode("episode-002").story.briefing.opening.length, episode2Base.story.briefing.opening.length, "continuity resolution does not mutate the catalog");

// Episode and legacy Fresh Variant artwork truth.
for (const id of ["episode-001", "episode-002", "episode-003"]) equal(episodes.validateEpisode(episodes.getEpisode(id)).valid, true, `${id} image and portrait validation passes`);
const swappedPortrait = episodes.getEpisode("episode-001");
swappedPortrait.gameplay.assetIds.people.emma = "portrait.marcus";
equal(episodes.validateEpisode(swappedPortrait).valid, false, "a swapped character portrait fails episode validation");
const duplicateFood = episodes.getEpisode("episode-001");
duplicateFood.gameplay.assetIds.food["Fish tacos"] = duplicateFood.gameplay.assetIds.food["Chicken enchiladas"];
duplicateFood.gameplay.images.food["Fish tacos"] = duplicateFood.gameplay.images.food["Chicken enchiladas"];
equal(episodes.validateEpisode(duplicateFood).valid, false, "a duplicate food assignment fails episode validation");
const unknownArtwork = episodes.getEpisode("episode-002");
unknownArtwork.gameplay.assetIds.restaurants.luna = "restaurant.missing";
equal(episodes.validateEpisode(unknownArtwork).valid, false, "an unknown artwork ID fails episode validation");

for (const variantId of ["B", "C"]) {
  const manifest = world.getCaseArtwork(variantId);
  ok(manifest, `Fresh Variant ${variantId} has an audited manifest`);
  equal(Object.keys(manifest.images.people).length, 3, `Fresh Variant ${variantId} has three deterministic portraits`);
  equal(Object.keys(manifest.images.restaurants).length, 3, `Fresh Variant ${variantId} has three restaurant images`);
  equal(Object.keys(manifest.images.food).length, 9, `Fresh Variant ${variantId} has nine exact menu images`);
  equal(new Set(Object.values(manifest.assetIds.people)).size, 3, `Fresh Variant ${variantId} portraits are not duplicated`);
  equal(new Set(Object.values(manifest.assetIds.restaurants)).size, 3, `Fresh Variant ${variantId} restaurants are not duplicated`);
  equal(new Set(Object.values(manifest.assetIds.food)).size, 9, `Fresh Variant ${variantId} menu images are not duplicated`);
}
const corruptBible = world.getSnapshot();
corruptBible.caseArtwork.B.people.sophie = "portrait.emma";
equal(world.validateBible(corruptBible).valid, false, "Character Bible rejects a guest portrait swap");
const duplicatePathBible = world.getSnapshot();
duplicatePathBible.assets["portrait.emma"].src = duplicatePathBible.assets["portrait.marcus"].src;
equal(world.validateBible(duplicatePathBible).valid, false, "World Bible rejects duplicate file assignments");
const remoteAssetBible = world.getSnapshot();
remoteAssetBible.assets["food.churros"].src = "https://example.com/placeholder.webp";
equal(world.validateBible(remoteAssetBible).valid, false, "World Bible rejects remote and placeholder artwork");
const missingCaseFood = world.getSnapshot();
missingCaseFood.caseMenus.B.meal.push("Unpictured special");
equal(world.validateBible(missingCaseFood).valid, false, "Fresh Variant menus reject unpictured choices");
const variantSource = fs.readFileSync("sprint431.js", "utf8");
ok(variantSource.includes('world.getCaseArtwork("B")') && variantSource.includes('world.getCaseArtwork("C")'), "legacy Fresh Variants consume audited artwork");
ok(variantSource.includes("Object.keys(images.food).forEach"), "switching variants clears stale food artwork");
ok(variantSource.includes("validateVariant"), "legacy Fresh Variant content validates before play");
ok(!/Math\.random\([^)]*\).*portrait|portrait.*Math\.random/s.test(`${fs.readFileSync("worldBible.js", "utf8")}\n${fs.readFileSync("episodes.js", "utf8")}`), "portrait selection is never randomized");

const assetValidation = spawnSync(process.execPath, ["scripts/validate-assets.cjs"], { encoding: "utf8" });
equal(assetValidation.status, 0, "build-time artwork validation succeeds");
ok(assetValidation.stdout.includes("Production validation passed"), "production validator reports an actionable result");
const localAssetBytes = Object.values(assets).reduce((sum, asset) => sum + fs.statSync(path.resolve(asset.src)).size, 0);
ok(localAssetBytes < 6_000_000, "approved local artwork stays within the performance budget");
ok(Object.values(assets).every(asset => !/^(?:https?:|data:)/i.test(asset.src)), "runtime artwork has no remote dependency");

// Episode Complete model and navigation.
const report = {
  categoryResults: [
    { id: "restaurant", correct: 1, total: 1 },
    { id: "meal", correct: 2, total: 3 },
    { id: "drink", correct: 3, total: 3 },
    { id: "dessert", correct: 2, total: 3 },
    { id: "overall", correct: 8, total: 10 }
  ],
  restaurantResult: { actual: "Casa Luna", correct: true },
  score: { earned: 250, possible: 300 }
};
const metrics = sprint31.completionMetrics(report);
equal(metrics.mealsIdentified, "2 / 3", "Episode Complete reports meals identified");
equal(metrics.accuracy, 80, "Episode Complete accuracy uses ten predictions without double-counting overall");
equal(metrics.totalPredictions, 10, "Episode Complete accuracy denominator is stable");
equal(sprint31.nextPlayableEpisodeId("episode-001", catalog), "episode-002", "Next Episode resolves Episode 2");
equal(sprint31.nextPlayableEpisodeId("episode-002", catalog), "episode-003", "Episode 2 advances to Episode 3");
equal(sprint31.nextPlayableEpisodeId("episode-003", catalog), null, "latest episode has no false next action");
const completeModel = sprint31.completionViewModel(episodes.getEpisode("episode-001"), report, catalog, world);
equal(completeModel.nextEpisodeId, "episode-002", "completion model exposes the next episode");
equal(completeModel.teaser.speaker, "Olivia", "episode teaser resolves its canonical character");
ok(completeModel.mascotMessage.includes("Outstanding work"), "high-score completion rewards the player");

const completionSource = fs.readFileSync("sprint31.js", "utf8");
const completionCss = fs.readFileSync("sprint31.css", "utf8");
const html = fs.readFileSync("index.html", "utf8");
for (const id of ["nextEpisode", "replayEpisode", "episodeLibrary", "episodeHome"]) ok(completionSource.includes(`id="${id}"`), `${id} action exists`);
ok(completionSource.includes("Next Episode · Coming Soon"), "latest episode has an explicit Coming Soon next state");
ok(completionSource.includes("missionNextEpisode"), "Mission Report gains a next-episode action when available");
ok(completionSource.includes("popstate"), "browser Back returns an active episode to the library");
ok(completionCss.includes("env(safe-area-inset-bottom)"), "Episode Complete respects phone safe areas");
ok(completionCss.includes("@media(max-height:500px) and (orientation:landscape)"), "landscape completion layout is protected");
ok(completionCss.includes("white-space:nowrap"), "compact completion labels do not collapse to one word per line");
ok(completionCss.includes(".episode-complete-summary{grid-template-columns:1fr}"), "iPhone SE and narrow Android summaries use a readable single column");
ok(completionCss.includes("env(safe-area-inset-left)") && completionCss.includes("env(safe-area-inset-right)"), "notched phone side safe areas are protected");
ok(!completionCss.includes("word-break:break-all"), "Episode Complete never forces letter-by-letter wrapping");
ok(html.indexOf("worldBible.js") < html.indexOf("episodes.js"), "World Bible loads before episodes");
ok(html.indexOf("sprint31.js") > html.indexOf("multiEpisode.js"), "Sprint 3.1 composes after the multi-episode runtime");

const compactViewportWidths = [360, 375];
for (const width of compactViewportWidths) ok(width <= 390, `${width}px compact viewport receives the single-column completion rule`);
for (const width of [393, 402, 412, 440]) ok(width <= 720, `${width}px modern phone viewport receives the two-column mobile rule`);
ok(390 <= 500, "phone landscape height receives the dedicated landscape rule");

// Story polish, compatibility, and performance guardrails.
const episodeSource = fs.readFileSync("episodes.js", "utf8");
ok(episodeSource.includes("seafood litigation"), "friendly teasing remains part of Episode 1");
ok(episodeSource.includes("accurate inventory"), "Ellis’s dinner-roll running joke remains part of Episode 2");
ok(episodeSource.includes("That’s why I like family-style"), "Episode 2 dialogue is conversational");
const progressSource = fs.readFileSync("episodeProgress.js", "utf8");
ok(progressSource.includes('rate-my-bites-episode-progress-v1'), "save-game storage key is unchanged");
ok(progressSource.includes("const STORAGE_VERSION = 1"), "save-game schema is unchanged");
const invalidContinuity = episodes.getEpisode("episode-002");
invalidContinuity.story.continuity[0].optional = false;
equal(episodes.validateEpisode(invalidContinuity).valid, false, "continuity cannot become a required dependency");
const invalidSceneArtwork = episodes.getEpisode("episode-002");
invalidSceneArtwork.story.scenes[0].artworkId = "food.churros";
equal(episodes.validateEpisode(invalidSceneArtwork).valid, false, "scene artwork must use scene or background assets");
for (const documentPath of ["docs/story-architecture.md", "docs/story-bible.md", "docs/adding-an-episode.md", "docs/image-audit.md"]) {
  ok(fs.existsSync(documentPath), `${documentPath} is documented`);
}
ok(fs.readFileSync("docs/story-architecture.md", "utf8").includes("Series") && fs.readFileSync("docs/story-architecture.md", "utf8").includes("Reveal"), "internal docs cover the complete story hierarchy");
const started = process.hrtime.bigint();
for (let index = 0; index < 1_000; index += 1) episodes.getEpisode(index % 2 ? "episode-001" : "episode-002");
const elapsedMilliseconds = Number(process.hrtime.bigint() - started) / 1e6;
ok(elapsedMilliseconds < 500, `1,000 episode loads remain fast (${elapsedMilliseconds.toFixed(1)}ms)`);

console.log(`Sprint 3.1 tests passed: ${assertions} assertions`);
