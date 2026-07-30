const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const progressionSource = fs.readFileSync('progression.js', 'utf8');
const releaseSource = fs.readFileSync('release.js', 'utf8');
const uiSource = fs.readFileSync('progressionUI.js', 'utf8');
const cssSource = fs.readFileSync('progression.css', 'utf8');
const htmlSource = fs.readFileSync('index.html', 'utf8');
const appSource = fs.readFileSync('app.js', 'utf8');
const variantsSource = fs.readFileSync('sprint431.js', 'utf8');

let assertions = 0;
function ok(value, message) { assert.ok(value, message); assertions += 1; }
function equal(actual, expected, message) { assert.equal(actual, expected, message); assertions += 1; }

function createRuntime(seed = {}) {
  const store = new Map(Object.entries(seed));
  const localStorage = {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(key, String(value)); },
    removeItem(key) { store.delete(key); }
  };
  const window = { localStorage };
  vm.runInNewContext(progressionSource, { window, console }, { filename: 'progression.js' });
  return { api: window.BiteBuddyProgression, store, localStorage };
}

function entry(type, contextId, correct = true, confidence = 5) {
  return { id: type === 'restaurant' ? 'group-restaurant' : `entry-${type}-${contextId}`, type, correct, confidence, context: { id: contextId } };
}

function perfectReport() {
  return {
    restaurantResult: entry('restaurant', 'social', true, 5),
    personResults: [
      { answers: [entry('meal', 'recent'), entry('drink', 'permanent'), entry('dessert', 'intentional')] },
      { answers: [entry('meal', 'environmental'), entry('drink', 'recent'), entry('dessert', 'social')] },
      { answers: [entry('meal', 'preference'), entry('drink', 'intentional'), entry('dessert', 'permanent')] }
    ]
  };
}

// Storage and migration.
{
  const { api } = createRuntime();
  const progression = api.getProgression();
  equal(progression.version, 1, 'new progression initializes with version 1');
  equal(progression.totalXp, 0, 'new progression starts at 0 XP');
  equal(progression.rankId, 'rookie-biter', 'new progression starts as Rookie Biter');
  equal(progression.unlocks.introductory, true, 'introductory is unlocked by default');
  equal(progression.unlocks.intermediate, false, 'intermediate is locked for new players');
  equal(api.storageKey, 'bite-buddy-progression-v1', 'progression uses a versioned storage key');
}
{
  const { api } = createRuntime({ 'bite-buddy-progression-v1': '{bad json' });
  equal(api.getProgression().totalXp, 0, 'malformed progression storage falls back safely');
}
{
  const { api } = createRuntime();
  const normalized = api.normalizeProgression({ totalXp: 'bad', rankId: 'master-biter', skills: { recentBehavior: { correct: -2, attempted: '4' } } });
  equal(normalized.totalXp, 0, 'invalid XP is normalized');
  equal(normalized.rankId, 'master-biter', 'stored higher rank is not reduced');
  equal(normalized.skills.recentBehavior.correct, 0, 'negative skill correct count is normalized');
  equal(normalized.skills.recentBehavior.attempted, 4, 'valid numeric strings are restored');
  equal(Object.keys(normalized.skills).length, 6, 'all six missing skill fields are restored');
}
{
  const history = { attempts: [
    { variantId: 'A', attemptType: 'first-attempt', score: 180, verdict: 'PARTIAL', timestamp: '2026-07-26T10:00:00.000Z' },
    { variantId: 'B', attemptType: 'fresh-variant', score: 220, verdict: 'MOSTLY', timestamp: '2026-07-26T11:00:00.000Z' }
  ] };
  const { api } = createRuntime({ 'bite-buddy-case-history-v1': JSON.stringify(history) });
  const progression = api.getProgression();
  equal(progression.completedFirstAttempts, 1, 'existing first-attempt history is preserved');
  equal(progression.completedFreshVariants, 1, 'existing fresh-variant history is preserved');
  equal(progression.firstAttemptScore, 180, 'first-attempt score is migrated from history');
  equal(progression.bestFreshVariantScore, 220, 'best fresh score is migrated from history');
  const normalizedHistory = api.normalizeHistory(history);
  ok(Boolean(normalizedHistory.attempts[0].attemptId), 'completed attempts receive stable identifiers');
  equal(normalizedHistory.attempts[0].attemptId, api.stableAttemptId(normalizedHistory.attempts[0], 0), 'stable attempt identifier is reproducible');
}

// XP calculations.
{
  const { api } = createRuntime();
  const report = perfectReport();
  const first = { attemptId: 'first', variantId: 'A', attemptType: 'first-attempt', score: 300 };
  const firstXp = api.calculateAttemptXp(first, report, api.normalizeProgression({}), { attempts: [first] });
  equal(firstXp.total, 196, 'first-attempt XP follows the defined breakdown');
  equal(firstXp.breakdown.reduce((sum, item) => sum + item.xp, 0), firstXp.total, 'XP breakdown equals the awarded total');
  ok(firstXp.breakdown.some(item => item.label === 'Correct Restaurant' && item.xp === 30), 'correct restaurant awards 30 XP');
  ok(firstXp.breakdown.some(item => item.label.includes('Correct Entrée') && item.xp === 30), 'three correct entrées award 30 XP');
  ok(firstXp.breakdown.some(item => item.label.includes('Correct Drinks') && item.xp === 21), 'three correct drinks award 21 XP');
  ok(firstXp.breakdown.some(item => item.label.includes('Correct Desserts') && item.xp === 15), 'three correct desserts award 15 XP');
  ok(firstXp.breakdown.some(item => item.label === 'Confidence Calibration' && item.xp === 40), 'high-confidence correct predictions award calibration XP');
  ok(firstXp.breakdown.some(item => item.label === 'Near-Perfect Investigation' && item.xp === 20), 'near-perfect first attempt receives bonus XP');

  const progression = api.normalizeProgression({ firstAttemptScore: 200, completedFreshVariants: 0 });
  const freshImproved = api.calculateAttemptXp({ attemptId: 'fresh1', variantId: 'B', attemptType: 'fresh-variant', score: 300 }, report, progression, { attempts: [] });
  equal(freshImproved.total, 256, 'improved first fresh variant receives transfer, milestone, and near-perfect bonuses');
  ok(freshImproved.breakdown.some(item => item.label === 'Fresh-Variant Improvement' && item.xp === 25), 'fresh improvement awards 25 XP');
  ok(freshImproved.breakdown.some(item => item.label === 'First Fresh Variant Milestone' && item.xp === 20), 'first fresh variant awards milestone XP');

  const freshEqual = api.calculateAttemptXp({ attemptId: 'fresh2', variantId: 'B', attemptType: 'fresh-variant', score: 200 }, report, progression, { attempts: [] });
  ok(freshEqual.breakdown.some(item => item.label === 'Fresh-Variant Consistency' && item.xp === 15), 'equal fresh score awards consistency XP');
  const freshLower = api.calculateAttemptXp({ attemptId: 'fresh3', variantId: 'C', attemptType: 'fresh-variant', score: 150 }, report, progression, { attempts: [] });
  ok(freshLower.breakdown.some(item => item.label === 'Fresh-Variant Completion' && item.xp === 8), 'lower fresh score receives completion rather than improvement XP');
  ok(!freshLower.breakdown.some(item => item.label === 'Near-Perfect Investigation'), 'lower fresh score receives no near-perfect bonus');

  const replay = api.calculateAttemptXp({ attemptId: 'replay1', variantId: 'A', attemptType: 'same-variant-replay', score: 300 }, report, progression, { attempts: [] });
  equal(replay.total, 10, 'first same-variant replay receives only the small practice award');
  equal(replay.breakdown.length, 1, 'same-variant replay receives no performance or transfer bonuses');
  const replayProgression = api.normalizeProgression({ awards: [{ attemptId: 'old-replay', variantId: 'A', attemptType: 'same-variant-replay', xp: 10, breakdown: [], awardedAt: null }] });
  const repeatReplay = api.calculateAttemptXp({ attemptId: 'replay2', variantId: 'A', attemptType: 'same-variant-replay', score: 300 }, report, replayProgression, { attempts: [] });
  equal(repeatReplay.total, 0, 'repeated same-variant replays cannot farm XP');
}

// Idempotent awarding, ranks, notices, and unlocks.
{
  const history = { attempts: [{ variantId: 'A', attemptType: 'first-attempt', score: 300, verdict: 'CASE SOLVED', timestamp: '2026-07-26T10:00:00.000Z' }] };
  const runtime = createRuntime({ 'bite-buddy-case-history-v1': JSON.stringify(history) });
  const { api, localStorage } = runtime;
  const attempt = api.normalizeHistory(history).attempts[0];
  const firstAward = api.awardAttempt(attempt, perfectReport());
  equal(firstAward.awarded, true, 'completed first attempt awards XP');
  equal(firstAward.award.xp, 196, 'first award stores exact XP');
  const duplicate = api.awardAttempt(attempt, perfectReport());
  equal(duplicate.awarded, false, 'same attempt cannot award XP twice');
  equal(duplicate.reason, 'duplicate', 'duplicate Mission Report review is identified');
  equal(duplicate.progression.totalXp, 196, 'reviewing Mission Report does not change XP');
  const incomplete = api.awardAttempt(null, perfectReport());
  equal(incomplete.reason, 'incomplete', 'incomplete attempts award no XP');

  const updatedHistory = api.normalizeHistory({ attempts: [...history.attempts, { variantId: 'B', attemptType: 'fresh-variant', score: 300, verdict: 'CASE SOLVED', timestamp: '2026-07-26T11:00:00.000Z' }] });
  localStorage.setItem('bite-buddy-case-history-v1', JSON.stringify(updatedHistory));
  const freshAward = api.awardAttempt(updatedHistory.attempts[1], perfectReport());
  equal(freshAward.awarded, true, 'fresh variant awards XP once');
  equal(freshAward.progression.rankId, 'table-reader', 'crossing 250 XP advances to Table Reader');
  equal(freshAward.progression.unlocks.intermediate, true, 'intermediate unlocks when all requirements are met');
  const notices = api.consumeNotices();
  equal(notices.rankUps.length, 1, 'rank-up notification is recorded once');
  equal(notices.rankUps[0].to, 'table-reader', 'rank-up notification names the new rank');
  ok(notices.unlocks.includes('intermediate'), 'intermediate unlock notification is emitted once');
  const secondNotices = api.consumeNotices();
  equal(secondNotices.rankUps.length, 0, 'rank-up celebration does not repeat');
  equal(secondNotices.unlocks.length, 0, 'unlock celebration does not repeat');
}

// Ranks and rank progress.
{
  const { api } = createRuntime();
  const thresholds = api.ranks.map(rank => rank.minimumXp);
  ok(thresholds.every((value, index) => index === 0 || value > thresholds[index - 1]), 'rank thresholds are strictly ordered');
  equal(api.getRank(0).id, 'rookie-biter', '0 XP produces Rookie Biter');
  equal(api.getRank(250).id, 'table-reader', '250 XP produces Table Reader');
  equal(api.getRank(650).id, 'clue-tracker', '650 XP produces Clue Tracker');
  equal(api.getRank(1200).id, 'people-detective', '1200 XP produces People Detective');
  equal(api.getRank(2000).id, 'master-biter', '2000 XP produces Master Biter');
  const progress = api.getRankProgress(api.normalizeProgression({ totalXp: 400 }));
  ok(progress.percent >= 0 && progress.percent <= 100, 'rank progress remains within bounds');
  equal(progress.current.id, 'table-reader', 'rank progress uses current rank');
  equal(progress.next.id, 'clue-tracker', 'rank progress identifies next rank');
}

// Skills and unlock rules.
{
  const history = { attempts: [{ variantId: 'A', attemptType: 'first-attempt', score: 300, verdict: 'CASE SOLVED', timestamp: '2026-07-26T10:00:00.000Z' }] };
  const { api } = createRuntime({ 'bite-buddy-case-history-v1': JSON.stringify(history) });
  const attempt = api.normalizeHistory(history).attempts[0];
  const awarded = api.awardAttempt(attempt, perfectReport());
  const skills = api.getSkillSummary(awarded.progression);
  equal(skills.length, 6, 'all six skill categories exist');
  ok(skills.find(skill => skill.id === 'recentBehavior').attempted > 0, 'recent clues update Recent Behavior');
  ok(skills.find(skill => skill.id === 'permanentConstraints').attempted > 0, 'permanent clues update Permanent Constraints');
  ok(skills.find(skill => skill.id === 'groupDynamics').attempted > 0, 'social clues update Group Dynamics');
  ok(skills.find(skill => skill.id === 'patternChanges').attempted > 0, 'intentional clues update Pattern Changes');
  ok(skills.find(skill => skill.id === 'contextualFactors').attempted > 0, 'environmental and preference clues update Contextual Factors');
  equal(skills.find(skill => skill.id === 'confidenceCalibration').attempted, 10, 'confidence outcomes update Confidence Calibration');
  equal(api.skillLevel({ correct: 0, attempted: 0 }).label, 'New', 'zero possible skill values are handled safely');
  equal(api.skillLevel({ correct: 1, attempted: 1 }).label, 'New', 'one correct result cannot produce Expert');
  equal(api.skillLevel({ correct: 6, attempted: 6 }).label, 'Expert', 'Expert requires sufficient evidence and high accuracy');
  equal(api.strongestSkill(api.normalizeProgression({ skills: { recentBehavior: { correct: 1, attempted: 1 } } })), null, 'strongest skill ignores insufficiently tested categories');

  const newPlayer = api.normalizeProgression({});
  equal(api.getUnlockState(newPlayer).intermediate.unlocked, false, 'intermediate remains locked for new player');
  const perfectOnly = api.normalizeProgression({ totalXp: 500, completedFirstAttempts: 1, completedFreshVariants: 0, bestFreshVariantScore: 300 });
  equal(api.getUnlockState(perfectOnly).intermediate.unlocked, false, 'perfect score alone cannot bypass fresh-variant requirement');
  const intermediate = api.normalizeProgression({ totalXp: 300, completedFirstAttempts: 1, completedFreshVariants: 1, bestFreshVariantScore: 180 });
  equal(api.getUnlockState(intermediate).intermediate.unlocked, true, 'intermediate unlocks only when all requirements are met');
  const advanced = api.normalizeProgression({ totalXp: 1200, rankId: 'people-detective', completedFreshVariants: 3, bestFreshVariantScore: 225, skills: { confidenceCalibration: { correct: 2, attempted: 3 } } });
  equal(api.getUnlockState(advanced).advanced.unlocked, true, 'advanced framework unlocks when every stated requirement is met');
}

// Release, UI, accessibility, and regression integration.
{
  const doc = { title: '', body: { classList: { add() {} } }, querySelector() { return null; }, querySelectorAll() { return []; } };
  const sandbox = { window: { document: doc } };
  vm.runInNewContext(releaseSource, sandbox, { filename: 'release.js' });
  const versionParts = require('./version-helpers.cjs').parseVersion(sandbox.window.BiteBuddyRelease.version);
  ok(Boolean(versionParts), 'release exposes a valid semantic version');
  ok(versionParts[0] > 0 || versionParts[1] > 4 || (versionParts[1] === 4 && versionParts[2] >= 4), 'current release is Detective Progression or later');
  ok(typeof sandbox.window.BiteBuddyRelease.releaseName === 'string' && sandbox.window.BiteBuddyRelease.releaseName.length > 0, 'current release name is exposed');
  ok(uiSource.includes('detective-profile-panel'), 'home detective profile panel is implemented');
  ok(uiSource.includes('XP earned this case'), 'Mission Report displays XP earned');
  ok(uiSource.includes('detective-development'), 'Mission Report progression section has a single deliberate class');
  ok(uiSource.includes('aria-valuemin') && uiSource.includes('aria-valuemax') && uiSource.includes('aria-valuenow'), 'rank progress exposes accessible ARIA values');
  ok(uiSource.includes('case is planned for a future sprint'), 'locked and unlocked previews do not falsely start unavailable episodes');
  ok(uiSource.includes('The game does not claim to know which clue you consciously used.'), 'skill presentation preserves evidence honesty');
  ok(cssSource.includes('@media (max-width: 420px)'), 'progression layout supports narrow mobile screens');
  ok(cssSource.includes('@media (prefers-reduced-motion: reduce)'), 'progression respects reduced motion');
  equal(120 + (30 + 20 + 10) * 3, 300, 'case score remains 300');
  ok(htmlSource.includes('progression.css') && htmlSource.includes('progression.js') && htmlSource.includes('progressionUI.js'), 'progression assets are integrated');
  ok(htmlSource.indexOf('progression.js') > htmlSource.indexOf('sprint432.js'), 'progression core loads after established game modules');
  ok(htmlSource.indexOf('progressionUI.js') > htmlSource.indexOf('progression.js'), 'progression UI loads after progression rules');
  ok(/const points = \{ restaurant: 120, meal: 30, drink: 20, dessert: 10 \}/.test(appSource), 'authoritative scoring model remains unchanged');
  ok(variantsSource.includes('id: "A", title: "The Great Sushi Debate"'), 'Variant A remains available');
  ok(variantsSource.includes('id: "B", title: "The Harbor Table"'), 'Variant B remains available');
  ok(variantsSource.includes('id: "C", title: "The Garden Celebration"'), 'Variant C remains available');
  ok(variantsSource.includes('Pup Voice Studio'), 'Pup Voice Studio remains integrated');
}

console.log(`Detective Progression tests passed: ${assertions} assertions`);
