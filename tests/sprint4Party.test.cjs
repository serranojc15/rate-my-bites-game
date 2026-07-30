const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

let assertions = 0;
const ok = (value, message) => { assertions += 1; assert.ok(value, message); };
const equal = (actual, expected, message) => { assertions += 1; assert.equal(actual, expected, message); };
const deepEqual = (actual, expected, message) => {
  assertions += 1;
  assert.deepEqual(JSON.parse(JSON.stringify(actual)), JSON.parse(JSON.stringify(expected)), message);
};

class MemoryStorage {
  constructor(seed = {}) { this.values = new Map(Object.entries(seed)); }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}

class FakeAudio {
  static instances = [];
  static rejectNext = false;

  constructor(src) {
    this.src = src;
    this.currentTime = 0;
    this.volume = 1;
    this.paused = false;
    this.listeners = {};
    FakeAudio.instances.push(this);
  }

  addEventListener(type, callback) { this.listeners[type] = callback; }
  pause() { this.paused = true; }
  play() {
    if (FakeAudio.rejectNext) {
      FakeAudio.rejectNext = false;
      return Promise.reject(new Error("autoplay blocked"));
    }
    return Promise.resolve();
  }
}

function loadCore({ audio = false, storage = new MemoryStorage() } = {}) {
  const window = { localStorage: storage };
  if (audio) window.Audio = FakeAudio;
  window.window = window;
  const sandbox = { window, console };
  vm.createContext(sandbox);
  const files = [
    "release.js",
    "worldBible.js",
    "characterBible.js",
    "voiceBible.js",
    "season1Bible.js",
    "livingEpisode.js",
    "episodes.js",
    "storyMemory.js"
  ];
  if (audio) files.push("pupAudio.js");
  for (const file of files) {
    vm.runInContext(fs.readFileSync(file, "utf8"), sandbox, { filename: file });
  }
  return { window, storage };
}

async function main() {
  const { window, storage } = loadCore({ audio: true });
  const release = window.BiteBuddyRelease;
  const world = window.RateMyBitesWorld;
  const characters = window.RateMyBitesCharacterBible;
  const voices = window.RateMyBitesVoiceBible;
  const season = window.RateMyBitesSeason1Bible;
  const living = window.RateMyBitesLivingEpisode;
  const episodes = window.RateMyBitesEpisodes;
  const memory = window.RateMyBitesStoryMemory;
  const audio = window.RateMyBitesPupAudio;
  const episode1 = episodes.getEpisode("episode-001");
  const episode2 = episodes.getEpisode("episode-002");
  const episode3 = episodes.getEpisode("episode-003");

  // Release identity and integration.
  equal(release.version, "v0.5.0", "Sprint 4 exposes the approved version");
  equal(release.releaseName, "The Party", "Sprint 4 exposes the approved release name");
  equal(release.displayLabel, "Rate My Bites Detective · v0.5.0", "series label uses the Sprint 4 identity");
  const html = fs.readFileSync("index.html", "utf8");
  const partySource = fs.readFileSync("sprint4Party.js", "utf8");
  const partyCss = fs.readFileSync("sprint4Party.css", "utf8");
  const episodeSource = fs.readFileSync("episodes.js", "utf8");
  const audioSource = fs.readFileSync("pupAudio.js", "utf8");
  for (const file of [
    "characterBible.js", "voiceBible.js", "season1Bible.js", "livingEpisode.js",
    "episodes.js", "storyMemory.js", "pupAudio.js", "sprint4Party.js"
  ]) {
    ok(html.includes(`src="${file}"`), `${file} is loaded by production`);
  }
  ok(html.indexOf("livingEpisode.js") < html.indexOf("episodes.js"), "Living Episode validation loads before the catalog");
  ok(html.indexOf("storyMemory.js") < html.indexOf("sprint4Party.js"), "story memory loads before the Sprint 4 runtime");
  ok(html.includes("sprint4Party.css"), "The Party responsive styles ship");

  const productionText = fs.readdirSync(".")
    .filter(file => /\.(?:html|css|js)$/i.test(file))
    .map(file => fs.readFileSync(file, "utf8"))
    .join("\n");
  ok(!/meet the cast/i.test(productionText), "old Meet the Cast terminology is removed");
  ok(partySource.includes('data-screen="the-party"'), "The Party has a permanent destination");
  ok(partySource.includes("Your standing dinner reservation"), "The Party reads as a real reservation");
  ok(partySource.includes("<h1>The Party</h1>"), "The Party name is prominent");

  // Character Bible and The Party.
  equal(characters.validate().valid, true, "Character Bible validates");
  const profiles = characters.getProfiles();
  deepEqual(season.get().partyRoster, ["pup", "emma", "marcus", "olivia", "june", "ellis", "priya", "grace"], "Season 1 owns the permanent Party roster");
  for (const id of season.get().partyRoster) {
    const profile = profiles[id];
    ok(profile, `${id} has a Party profile`);
    for (const field of [
      "fullName", "portrait", "personalitySummary", "favoriteMeals", "favoriteDrinks",
      "foodPreferences", "relationshipToParty", "episodeAppearances", "memorableQuote",
      "dislikes", "humorStyle", "conversationStyle", "relationships", "runningJokes",
      "recurringHabits", "characterGoals", "storyHooks", "continuityNotes",
      "futureGrowthOpportunities"
    ]) {
      ok(profile[field] !== undefined && profile[field] !== null, `${id}.${field} is canonical`);
    }
    equal(profile.portrait.subjectId, id, `${id} keeps the correct portrait`);
  }
  equal(world.getCharacter("pup").occupation, "Host", "Pup’s canonical occupation is Host");
  equal(profiles.pup.relationshipToParty, "Host and trusted dinner companion.", "Pup’s Party relationship is Host");
  ok(profiles.pup.continuityNotes.some(note => /not the detective/i.test(note)), "Pup is explicitly not the detective");
  ok(profiles.pup.continuityNotes.some(note => /not the narrator/i.test(note)), "Pup is explicitly not the narrator");
  ok(partySource.includes("Helping everyone find the perfect meal."), "Pup’s approved Host description is displayed");
  deepEqual(profiles.emma.episodeAppearances, ["episode-001", "episode-003"], "Emma’s return is canonical");
  deepEqual(profiles.ellis.episodeAppearances, ["episode-002", "episode-003"], "Ellis’s return is canonical");
  deepEqual(profiles.grace.episodeAppearances, ["episode-003"], "Grace’s first playable appearance is canonical");
  deepEqual(profiles.june.episodeAppearances, ["episode-002"], "June is not incorrectly assigned to Episode 3");

  // Voice Bible and packaged Pup voice.
  equal(voices.validate().valid, true, "Voice Bible validates");
  const voiceProfiles = voices.getProfiles();
  deepEqual(Object.keys(voiceProfiles).sort(), Object.keys(profiles).sort(), "every canonical character has a voice profile");
  equal(voiceProfiles.pup.implementationStatus, "recorded-sprint-4", "only Pup has implemented Sprint 4 voice");
  for (const [id, profile] of Object.entries(voiceProfiles)) {
    for (const field of [
      "speakingRhythm", "vocabulary", "humorStyle", "emotionalRange",
      "typicalExpressions", "neverUses", "exampleDialogue",
      "performanceDirection", "futureElevenLabsVoiceId", "implementationStatus"
    ]) {
      ok(profile[field] !== undefined, `${id}.${field} is documented`);
    }
    if (id !== "pup") equal(profile.implementationStatus, "profile-only", `${id} remains unvoiced`);
  }
  const approvedOpening = "Hey! I’m Pup. Ready for another dinner adventure? Let’s see who’s joining The Party tonight!";
  equal(episode3.production.media.captions.opening, approvedOpening, "Episode 3 uses the exact approved Pup introduction");
  ok(voiceProfiles.pup.exampleDialogue.includes(approvedOpening), "Pup’s Voice Bible includes the exact approved introduction");
  equal(Object.keys(episode3.production.media.audioClips).length, 5, "Episode 3 ships five restrained Pup clips");
  deepEqual(
    Object.keys(episode3.production.media.audioClips).sort(),
    Object.keys(episode3.production.media.captions).sort(),
    "every packaged clip has a visible caption"
  );
  for (const [clipId, relativePath] of Object.entries(episode3.production.media.audioClips)) {
    ok(fs.existsSync(relativePath), `${clipId} audio is packaged`);
    const bytes = fs.readFileSync(relativePath);
    ok(bytes.length > 4_096 && bytes.length < 250_000, `${clipId} audio meets the file budget`);
    ok(bytes.subarray(0, 3).toString("ascii") === "ID3" || bytes[0] === 0xff, `${clipId} is an MP3`);
    ok(episode3.production.media.captions[clipId].trim().length > 0, `${clipId} caption is readable`);
  }
  ok(!/fetch\s*\(|XMLHttpRequest|elevenlabs/i.test(`${audioSource}\n${partySource}`), "gameplay makes no runtime voice-generation request");
  ok(!/speechSynthesis/.test(audioSource), "Episode 3 audio does not use browser speech synthesis");
  ok(partySource.includes('class="pup-visible-caption" role="status"'), "spoken introductions have visible captions");
  ok(partySource.includes("pup-completion-caption"), "the ending voice has a visible caption");

  // Episode 3 canonical story and reusable production layers.
  equal(episodes.validateEpisode(episode3).valid, true, "Episode 3 validates");
  equal(episode3.metadata.status, "playable", "Episode 3 is playable");
  equal(episode3.metadata.artworkId, "restaurant.copper-table", "Episode 3 introduces The Copper Table");
  deepEqual(episode3.production.canonical.partyIds, ["pup", "emma", "ellis", "grace"], "Episode 3 attending Party is fixed");
  equal(episode3.production.canonical.restaurantId, "copper-table", "canonical restaurant is fixed");
  equal(episode3.gameplay.mystery.correctId, "emma-called-ahead", "central mystery answer is fixed");
  ok(/Emma called/.test(episode3.production.canonical.solution), "canonical solution is complete");
  ok(/four forks/.test(episode3.production.canonical.ending), "Episode 3 ending resolves the dinner warmly");
  ok(episode3.story.continuity.some(item => item.previousEpisodeId === "episode-001"), "Episode 3 calls back to Episode 1");
  ok(episode3.story.continuity.some(item => item.previousEpisodeId === "episode-002"), "Episode 3 calls back to Episode 2");
  ok(episode3.story.completion.teaser.text.includes("Next dinner"), "Episode 4 teaser is present");
  ok(episode3.reveal.endingCelebration.includes("Mystery solved"), "Episode 3 has a satisfying complete reveal");
  equal(episode3.production.media.fallbackText.length > 0, true, "media layer defines text fallback");
  for (const layer of ["canonical", "living", "media"]) ok(episode3.production[layer], `Episode 3 separates ${layer} content`);
  for (const id of ["episode-001", "episode-002"]) {
    const episode = episodes.getEpisode(id);
    equal(episodes.validateEpisode(episode).valid, true, `${id} remains valid`);
    ok(episode.production.canonical && episode.production.living && episode.production.media, `${id} conforms to the reusable production shape`);
    equal(episode.production.living.enabled, false, `${id} remains unchanged rather than gaining random variation`);
  }
  equal(episode1.gameplay.actualRestaurantId, "luna", "Episode 1 answer remains unchanged");
  equal(episode2.gameplay.actualRestaurantId, "luna", "Episode 2 answer remains unchanged");
  equal(episode1.gameplay.diners.length, 3, "Episode 1 keeps three diners");
  equal(episode2.gameplay.diners.length, 3, "Episode 2 keeps three diners");

  // Living Episode reachability, safety, and replay behavior.
  equal(living.validateEpisode(episode3).valid, true, "Living Episode definition validates");
  const livingData = episode3.production.living;
  equal(livingData.greetings.length, 3, "three opening greeting variants are authored");
  equal(livingData.banter.length, 3, "three banter variants are authored");
  equal(livingData.restaurantSpecials.length, 2, "two restaurant specials are authored");
  equal(livingData.environments.length, 2, "two environmental states are authored");
  equal(livingData.optionalObservations.length, 2, "two optional observations are authored");
  equal(livingData.clueOrders.length, 2, "limited clue-order variation is authored");

  const reached = {
    greetingId: new Set(),
    banterId: new Set(),
    specialId: new Set(),
    environmentId: new Set(),
    observationId: new Set(),
    clueOrderId: new Set()
  };
  const requiredClues = new Set(episode3.production.canonical.requiredClueSceneIds);
  const fixedTruth = {
    restaurantId: episode3.production.canonical.restaurantId,
    solution: episode3.production.canonical.solution,
    ending: episode3.production.canonical.ending,
    mysteryAnswer: episode3.gameplay.mystery.correctId
  };
  for (let playthrough = 0; playthrough < 64; playthrough += 1) {
    const seed = 6000 + (playthrough * 997);
    const set = living.select(episode3, seed);
    for (const field of Object.keys(reached)) reached[field].add(set[field]);
    const materialized = living.materialize(episode3, set);
    const sceneIds = materialized.story.scenes.map(scene => scene.id);
    for (const clueId of requiredClues) equal(sceneIds.filter(id => id === clueId).length, 1, `seed ${seed} preserves required clue ${clueId}`);
    equal(materialized.production.canonical.restaurantId, fixedTruth.restaurantId, `seed ${seed} preserves restaurant truth`);
    equal(materialized.production.canonical.solution, fixedTruth.solution, `seed ${seed} preserves solution`);
    equal(materialized.production.canonical.ending, fixedTruth.ending, `seed ${seed} preserves ending`);
    equal(materialized.gameplay.mystery.correctId, fixedTruth.mysteryAnswer, `seed ${seed} preserves mystery answer`);
    equal(new Set(sceneIds).size, sceneIds.length, `seed ${seed} creates no duplicate scenes`);
  }
  equal(reached.greetingId.size, 3, "every greeting is reachable");
  equal(reached.banterId.size, 3, "every banter option is reachable");
  equal(reached.specialId.size, 2, "every restaurant special is reachable");
  equal(reached.environmentId.size, 2, "every environment is reachable");
  equal(reached.observationId.size, 2, "every optional observation is reachable");
  equal(reached.clueOrderId.size, 2, "every clue order is reachable");

  const firstSet = living.select(episode3, 6000);
  const replaySet = living.select(episode3, 6000, [firstSet.signature]);
  ok(replaySet.signature !== firstSet.signature, "a replay avoids the recent complete variation set");
  const changedFields = [
    "greetingId", "banterId", "specialId", "environmentId", "observationId", "clueOrderId"
  ].filter(field => replaySet[field] !== firstSet[field]);
  ok(changedFields.length >= 1, "every new replay contains at least one noticeable surprise");
  const repeatedReplay = living.select(episode3, 6000, [firstSet.signature, replaySet.signature]);
  ok(![firstSet.signature, replaySet.signature].includes(repeatedReplay.signature), "recent variation sets do not repeat excessively");
  const isolatedEpisode = episodes.getEpisode("episode-003");
  living.materialize(isolatedEpisode, firstSet);
  deepEqual(episodes.getEpisode("episode-003").story.scenes, episode3.story.scenes, "materialization never mutates canonical catalog content");

  // Story memory, player memory, and stable resume.
  deepEqual(memory.loadPlayer(storage), memory.emptyPlayerMemory(), "new player memory starts safely");
  let player = memory.recordEpisodeStart("episode-003", firstSet.signature, storage);
  equal(player.episodePlayCounts["episode-003"], 1, "Episode 3 play count persists");
  deepEqual(player.recentVariationSignatures["episode-003"], [firstSet.signature], "recent variation signature persists");
  player = memory.recordCompletion("episode-003", {
    emma: { meal: "Grilled chicken salad", dessert: "Berry tart" },
    grace: { meal: "Vegetable risotto", drink: "Berry fizz" }
  }, storage);
  ok(player.previousEpisodesCompleted.includes("episode-003"), "player memory records Episode 3 completion");
  ok(player.dessertSelections >= 1, "dessert preference signal is gentle and persisted");
  ok(player.healthierSelections >= 2, "healthier preference signals are tracked");
  ok(player.adventurousSelections >= 2, "adventurous preference signals are tracked");
  memory.recordCompletion("episode-002", { ellis: { dessert: "Chocolate torte" } }, storage);
  ok(/Dessert again/.test(memory.callbackFor(memory.loadPlayer(storage))), "a curated nonjudgmental dessert callback becomes available");
  ok(!/wrong|bad|should|punish/i.test(memory.callbackFor(memory.loadPlayer(storage))), "player callback never judges the choice");

  const savedState = { screen: "conversation", conversationIndex: 4, picks: { emma: { meal: "Grilled chicken salad" } }, voiceEnabled: false };
  const savedSession = memory.saveSession("episode-003", firstSet, savedState, storage);
  deepEqual(savedSession.variationSet, firstSet, "active variation set is saved");
  deepEqual(memory.loadSession(storage).variationSet, firstSet, "resume restores the exact variation set");
  equal(memory.loadSession(storage).state.conversationIndex, 4, "resume restores the current scene");
  equal(memory.loadSession(storage).state.voiceEnabled, false, "resume preserves the state needed for muted play");
  const restoredEpisode = living.materialize(episode3, memory.loadSession(storage).variationSet);
  equal(restoredEpisode.metadata.future.selectedVariationSignature, firstSet.signature, "resume materializes the same dinner");
  deepEqual(memory.clearSession(storage), memory.emptySession(), "clearing active progress resets only the active session");
  equal(memory.loadPlayer(storage).episodePlayCounts["episode-003"], 1, "clearing session preserves permanent player memory");
  equal(memory.normalizeSession({ version: 1, episodeId: "bad", variationSet: {}, state: {} }).episodeId, null, "invalid sessions fail safely");

  // Pup playback: enabled, muted, blocked, unavailable, rapid, repeated, and non-overlapping.
  FakeAudio.instances.length = 0;
  equal(audio.muted, false, "Pup audio begins enabled when no mute preference exists");
  equal(audio.caption("opening"), approvedOpening, "audio API exposes the visible caption");
  equal(await audio.play("opening"), true, "approved opening audio can play");
  equal(audio.currentClipId, "opening", "playing clip is tracked");
  const openingAudio = FakeAudio.instances[0];
  equal(await audio.play("mystery"), true, "rapid navigation can start the next approved clip");
  equal(openingAudio.paused, true, "rapid navigation stops the prior clip");
  equal(openingAudio.currentTime, 0, "stopped clips rewind");
  equal(audio.currentClipId, "mystery", "only the latest clip remains active");
  const mysteryAudio = FakeAudio.instances[1];
  audio.setMuted(true, storage);
  equal(audio.muted, true, "mute preference changes immediately");
  equal(mysteryAudio.paused, true, "muting stops active speech");
  equal(await audio.play("ending"), false, "muted playback never starts");
  equal(FakeAudio.instances.length, 2, "muted playback creates no audio element");
  equal(JSON.parse(storage.getItem(audio.storageKey)).muted, true, "mute preference persists");
  audio.setMuted(false, storage);
  FakeAudio.rejectNext = true;
  equal(await audio.play("ending"), false, "browser autoplay rejection never blocks progress");
  ok(audio.lastError instanceof Error, "autoplay rejection is available for diagnostics");
  equal(audio.currentClipId, null, "blocked audio leaves no active clip");
  equal(await audio.play("missing-clip"), false, "unknown or unavailable audio falls back cleanly");
  equal(audio.caption("missing-clip"), "", "unavailable audio has no misleading caption");
  equal(await audio.play("ending"), true, "playback can recover after a blocked attempt");
  const unavailableAudio = FakeAudio.instances.at(-1);
  unavailableAudio.listeners.error();
  equal(audio.currentClipId, null, "audio file errors clear active playback");
  ok(/could not load/i.test(audio.lastError.message), "audio file failure is recorded without throwing");
  equal(await audio.play("encouragement"), true, "playback remains usable after a file failure");
  const encouragementAudio = FakeAudio.instances.at(-1);
  encouragementAudio.listeners.ended();
  equal(audio.currentClipId, null, "ended clips release playback state");
  equal(typeof audio.replay().then, "function", "replay is always non-blocking");
  audio.stop();

  // Accessibility and responsive safeguards.
  ok(partyCss.includes("@media(max-width:760px)"), "The Party supports mobile layouts");
  ok(partyCss.includes("@media(max-width:390px)"), "The Party supports narrow iPhones");
  ok(partyCss.includes("@media(max-height:500px) and (orientation:landscape)"), "The Party supports phone landscape");
  ok(partyCss.includes("@media(prefers-reduced-motion:reduce)"), "The Party respects reduced motion");
  ok(partyCss.includes("min-width:0"), "Party cards protect long text from overflow");
  ok(partyCss.includes("overflow-wrap:break-word"), "long character content wraps safely");
  ok(partyCss.includes("safe-area-inset-bottom"), "Sprint 4 controls respect phone safe areas");
  ok(!partyCss.includes("word-break:break-all"), "Sprint 4 never breaks words letter by letter");
  ok(partySource.includes("pupAudio.stop()"), "navigation stops voice before advancing");
  ok(partySource.includes("voice playback") === false, "voice is not presented as a progression requirement");
  ok(partySource.includes('button class="primary-button" id="partyOpeningNext"'), "Episode 3 progression remains a normal usable control");
  ok(partySource.includes('id="replayEpisode"') === false, "Sprint 4 reuses rather than duplicates the shared completion control");
  ok(episodeSource.includes("fallbackText"), "the entire story has a no-audio fallback");

  // Permanent production documentation.
  for (const documentPath of [
    "docs/character-bible.md",
    "docs/voice-bible.md",
    "docs/season-1-bible.md",
    "docs/episode-production-framework.md"
  ]) {
    ok(fs.existsSync(documentPath), `${documentPath} exists`);
    ok(fs.statSync(documentPath).size > 500, `${documentPath} contains substantive guidance`);
  }
  ok(fs.readFileSync("docs/episode-production-framework.md", "utf8").includes("Canonical"), "production framework documents the canonical layer");
  ok(fs.readFileSync("docs/episode-production-framework.md", "utf8").includes("Living"), "production framework documents the living layer");
  ok(fs.readFileSync("docs/episode-production-framework.md", "utf8").includes("Media"), "production framework documents the media layer");
  ok(fs.readFileSync(".github/workflows/static-validation.yml", "utf8").includes("node tests/sprint4Party.test.cjs"), "CI runs Sprint 4 tests");

  console.log(`Sprint 4 — The Party tests passed: ${assertions} assertions`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
