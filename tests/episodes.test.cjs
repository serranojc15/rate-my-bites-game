const assert = require("node:assert/strict");
const fs = require("node:fs");
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

const window = { localStorage: new MemoryStorage() };
window.window = window;
const sandbox = { window, console };
vm.createContext(sandbox);
for (const file of ["worldBible.js", "episodes.js", "episodeProgress.js", "multiEpisode.js"]) {
  vm.runInContext(fs.readFileSync(file, "utf8"), sandbox, { filename: file });
}

const episodes = window.RateMyBitesEpisodes;
const progressApi = window.RateMyBitesEpisodeProgress;
const runtime = window.RateMyBitesMultiEpisode;
const catalog = episodes.getCatalog();
const playable = catalog.filter(entry => entry.status === "playable");
const comingSoon = catalog.filter(entry => entry.status === "coming-soon");
const episode1 = episodes.getEpisode("episode-001");
const episode2 = episodes.getEpisode("episode-002");

// Catalog and validation.
ok(episodes, "episode API is exposed");
equal(episodes.schemaVersion, 2, "episode schema is versioned");
equal(playable.length, 2, "catalog exposes two playable episodes");
deepEqual(playable.map(entry => entry.id), ["episode-001", "episode-002"], "playable episodes keep catalog order");
equal(comingSoon.length, 1, "catalog exposes one Coming Soon entry");
equal(comingSoon[0].episode, null, "Coming Soon has no playable definition");
equal(new Set(catalog.map(entry => entry.id)).size, catalog.length, "catalog IDs are unique");
equal(episodes.validateCatalog().valid, true, "catalog validation passes");
equal(episodes.validateEpisode(episode1).valid, true, "Episode 1 passes validation");
equal(episodes.validateEpisode(episode2).valid, true, "Episode 2 passes validation");
equal(episodes.assertValidEpisode(episode1), true, "Episode 1 assertion passes");
equal(episodes.assertValidEpisode(episode2), true, "Episode 2 assertion passes");
equal(episodes.validateEpisode({}).valid, false, "an incomplete episode fails validation");
ok(episodes.validateEpisode({}).errors.length >= 8, "invalid definitions fail with useful field errors");

// Episode 1 migration and unchanged scoring truth.
equal(episode1.metadata.title, "The Great Sushi Debate", "Episode 1 title is preserved");
equal(episode1.gameplay.actualRestaurantId, "luna", "Episode 1 restaurant answer is preserved");
equal(episode1.gameplay.restaurants.find(item => item.id === "luna").name, "Casa Luna", "Episode 1 restaurant identity is preserved");
deepEqual(episode1.gameplay.points, { restaurant: 120, meal: 30, drink: 20, dessert: 10 }, "scoring values are unchanged");
equal(episode1.gameplay.diners.length, 3, "Episode 1 keeps all diners");
deepEqual(
  Object.fromEntries(episode1.gameplay.diners.map(person => [person.id, person.actual])),
  {
    emma: { meal: "Chicken enchiladas", drink: "Sparkling water", dessert: "No dessert" },
    marcus: { meal: "Steak fajitas", drink: "Sweet tea", dessert: "Churros" },
    olivia: { meal: "Steak fajitas", drink: "Lime margarita", dessert: "Tres leches" }
  },
  "Episode 1 answer data is preserved"
);
ok(episode1.story.scenes.length >= 9, "Episode 1 cinematic scene sequence is preserved");
equal(episode1.story.briefing.people.marcus.confessional, "Honestly, I’m mostly here for dessert.", "Episode 1 briefing dialogue is preserved");
equal(episode1.story.scenes[0].id, "wide-open", "Episode 1 production cinematic opening is preserved");
equal(
  episode1.story.scenes[0].text,
  "Before anybody says sushi, I had fish yesterday. I want something completely different tonight.",
  "Episode 1 production opening dialogue is preserved"
);

// Episode 2 uses the same engine with genuinely separate content.
equal(episode2.metadata.title, "The Lantern Table", "Episode 2 has its own title");
equal(episode2.metadata.destination, "Willow Lake · Maple & Main", "Episode 2 has a distinct setting");
equal(episode2.gameplay.restaurants.find(item => item.id === "luna").name, "Maple & Main", "Episode 2 has its own restaurant");
deepEqual(episode2.gameplay.stages, episode1.gameplay.stages, "both episodes use the same prediction stages");
deepEqual(episode2.gameplay.points, episode1.gameplay.points, "both episodes use the same score engine");
ok(episode2.story.scenes.some(scene => scene.memory?.type === "humor"), "Episode 2 includes a humorous moment");
ok(episode2.story.scenes.some(scene => scene.memory?.type === "warmth"), "Episode 2 includes a warm memory");
ok(episode2.story.scenes.some(scene => scene.memory?.type === "learning"), "Episode 2 includes a food-related observation");
ok(/Case closed/.test(episode2.reveal.endingCelebration), "Episode 2 has a satisfying celebration");

// Selection and isolation.
const payload1 = runtime.episodePayload("episode-001");
const payload2 = runtime.episodePayload("episode-002");
equal(payload1.title, "The Great Sushi Debate", "selecting Episode 1 resolves Episode 1 content");
equal(payload2.title, "The Lantern Table", "selecting Episode 2 resolves Episode 2 content");
ok(!payload2.dinerIds.some(id => payload1.dinerIds.includes(id)), "diner identity does not leak between episodes");
ok(!payload2.answers.emma, "Episode 1 answers do not leak into Episode 2");
ok(!payload1.answers.june, "Episode 2 answers do not leak into Episode 1");
equal(runtime.canLaunch("episode-001"), true, "Episode 1 can launch");
equal(runtime.canLaunch("episode-002"), true, "Episode 2 can launch");
equal(runtime.canLaunch("episode-003"), false, "Coming Soon cannot launch");
equal(runtime.canLaunch("unknown"), false, "unknown episodes cannot launch");
const isolated = episodes.getEpisode("episode-002");
isolated.gameplay.diners[0].name = "Changed";
equal(episodes.getEpisode("episode-002").gameplay.diners[0].name, "June", "catalog reads return isolated definitions");

// Versioned local progress, replay bests, and safe parsing.
const storage = new MemoryStorage();
deepEqual(progressApi.load(storage), progressApi.emptyProgress(), "missing progress initializes safely");
let progress = progressApi.markStarted("episode-001", storage);
equal(progress.hasVisited, true, "starting an episode marks the player as returning");
equal(progress.lastPlayedEpisodeId, "episode-001", "last-played episode persists");
progress = progressApi.recordCompletion("episode-001", 210, storage);
deepEqual(progress.completedEpisodeIds, ["episode-001"], "completion persists by stable episode ID");
equal(progress.bestScores["episode-001"], 210, "best score persists");
equal(progressApi.load(storage).bestScores["episode-001"], 210, "completion survives storage reload");
equal(progressApi.recordCompletion("episode-001", 180, storage).bestScores["episode-001"], 210, "a lower replay does not replace the best");
equal(progressApi.recordCompletion("episode-001", 260, storage).bestScores["episode-001"], 260, "a higher replay replaces the best");
progress = progressApi.recordCompletion("episode-002", 190, storage);
equal(progress.bestScores["episode-001"], 260, "Episode 2 does not overwrite Episode 1's best");
equal(progress.bestScores["episode-002"], 190, "Episode 2 keeps its own best");
equal(progress.lastPlayedEpisodeId, "episode-002", "completion updates last played");

const malformed = new MemoryStorage({ [progressApi.storageKey]: "{broken" });
deepEqual(progressApi.load(malformed), progressApi.emptyProgress(), "malformed JSON fails safely");
const partial = new MemoryStorage({
  [progressApi.storageKey]: JSON.stringify({
    version: 1,
    hasVisited: true,
    completedEpisodeIds: ["episode-001", "missing", 7],
    bestScores: { "episode-001": 200, missing: 999, "episode-002": "bad" },
    lastPlayedEpisodeId: "missing"
  })
});
progress = progressApi.load(partial);
deepEqual(progress.completedEpisodeIds, ["episode-001"], "partial completion data is normalized");
deepEqual(progress.bestScores, { "episode-001": 200 }, "partial scores are normalized");
equal(progress.lastPlayedEpisodeId, null, "unknown last-played IDs are discarded");
equal(
  progressApi.normalize({ version: 1, bestScores: { "episode-001": 999 } }).bestScores["episode-001"],
  300,
  "out-of-range saved scores are safely bounded"
);
deepEqual(
  progressApi.normalize({ version: 99, completedEpisodeIds: ["episode-001"] }),
  progressApi.emptyProgress(),
  "unknown storage versions fail safely"
);
deepEqual(progressApi.recordCompletion("unknown", 300, storage), progressApi.load(storage), "unknown IDs cannot corrupt progress");

// First-time and returning acknowledgment.
equal(progressApi.acknowledgment(progressApi.emptyProgress()), "Welcome, Detective! Choose tonight’s mystery.", "first-time acknowledgment is correct");
equal(
  progressApi.acknowledgment({ ...progressApi.emptyProgress(), hasVisited: true }),
  "Welcome back, Detective! Ready for another mystery?",
  "returning acknowledgment is correct before completion"
);
equal(
  progressApi.acknowledgment(progress),
  "Welcome back! Ready to solve another mystery?",
  "completed-player acknowledgment is correct"
);

// Continuation instruction, compatibility, and deployment safeguards.
const sprint4Source = fs.readFileSync("sprint4.js", "utf8");
const cinematicSource = fs.readFileSync("cinematicSprint1.js", "utf8");
const allJavaScript = fs.readdirSync(".").filter(file => file.endsWith(".js")).map(file => fs.readFileSync(file, "utf8")).join("\n");
equal((allJavaScript.match(/Tap anywhere or press Space to continue/g) || []).length, 1, "continuation instruction exists only once");
ok(sprint4Source.includes("state.briefingIndex === 0"), "continuation instruction is gated to the first briefing screen");
ok(!cinematicSource.includes('cue.textContent = "Tap Anywhere"'), "later cinematic scenes do not add a repeated cue");
ok(cinematicSource.includes('keyboardEvent.key !== "Enter" && keyboardEvent.key !== " "'), "later cinematic Space and Enter controls remain");
ok(fs.readFileSync("sprint431.js", "utf8").includes("Pup Voice Studio"), "existing developer voice controls remain");
ok(fs.readFileSync("sprint431.js", "utf8").includes('state.selectedEpisodeId = "episode-001"'), "legacy fresh variants remain isolated to Episode 1");
ok(fs.readFileSync("sprint431.js", "utf8").includes('state.selectedEpisodeId !== "episode-001"'), "Episode 2 skips Episode 1-only replay reporting");
ok(fs.readFileSync("sprint445.js", "utf8").includes("activeCatalogEpisode.metadata.title"), "mission reports use the selected catalog episode title");
ok(fs.readFileSync(".github/workflows/static-validation.yml", "utf8").includes("push:\n    branches: [main]"), "GitHub Pages validation trigger remains on main");
ok(!fs.existsSync("package.json"), "the static deployment remains dependency-free");
ok(fs.readFileSync("index.html", "utf8").indexOf("episodes.js") < fs.readFileSync("index.html", "utf8").indexOf("app.js"), "episode definitions load before the engine");
ok(fs.readFileSync("index.html", "utf8").indexOf("multiEpisode.js") > fs.readFileSync("index.html", "utf8").indexOf("sprint2OrderRevealPolish.js"), "episode runtime composes after historical safeguards");

console.log(`Multi-Episode Foundation tests passed: ${assertions} assertions`);
