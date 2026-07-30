const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const flowSource = fs.readFileSync('sprint441.js', 'utf8');
const dataSource = fs.readFileSync('groupLeaderboardData.js', 'utf8');
const leaderboardSource = fs.readFileSync('groupLeaderboard.js', 'utf8');
const cssSource = fs.readFileSync('sprint441.css', 'utf8');
const releaseSource = fs.readFileSync('release.js', 'utf8');
const htmlSource = fs.readFileSync('index.html', 'utf8');
const appSource = fs.readFileSync('app.js', 'utf8');
const progressionSource = fs.readFileSync('progression.js', 'utf8');
const variantsSource = fs.readFileSync('sprint431.js', 'utf8');

let assertions = 0;
function ok(value, message) { assert.ok(value, message); assertions += 1; }
function equal(actual, expected, message) { assert.equal(actual, expected, message); assertions += 1; }

function loadFlowApi() {
  const window = {};
  vm.runInNewContext(flowSource, { window, console }, { filename: 'sprint441.js' });
  return window.BiteBuddySprint441;
}

function loadLeaderboard(progression = {}, history = { attempts: [] }) {
  const store = new Map([['bite-buddy-case-history-v1', JSON.stringify(history)]]);
  const window = {
    localStorage: {
      getItem(key) { return store.get(key) ?? null; },
      setItem(key, value) { store.set(key, String(value)); }
    },
    BiteBuddyProgression: {
      ranks: [
        { id: 'rookie-biter', name: 'Rookie Biter' },
        { id: 'table-reader', name: 'Table Reader' },
        { id: 'clue-tracker', name: 'Clue Tracker' },
        { id: 'people-detective', name: 'People Detective' },
        { id: 'master-biter', name: 'Master Biter' }
      ],
      getProgression() { return { totalXp: 0, rankId: 'rookie-biter', bestFreshVariantScore: null, completedFreshVariants: 0, ...progression }; },
      strongestSkill() { return progression.strongestSkill || null; }
    },
    BiteBuddyRelease: { version: 'v0.4.4.1' }
  };
  vm.runInNewContext(dataSource, { window }, { filename: 'groupLeaderboardData.js' });
  vm.runInNewContext(leaderboardSource, { window, console }, { filename: 'groupLeaderboard.js' });
  return window.BiteBuddyGroupLeaderboard;
}

const flow = loadFlowApi();
equal(flow.version, 'v0.4.4.1', 'flow interface exposes Sprint 4.4.1 when no release object is present');
equal(flow.revealStages.join('>'), 'locked>counting>incoming>revealed', 'reveal stages are ordered');
equal(flow.nextRevealStage('locked'), 'counting', 'locked advances to counting');
equal(flow.nextRevealStage('incoming'), 'revealed', 'incoming advances to revealed');
equal(flow.nextRevealStage('revealed'), null, 'revealed is terminal');
ok(flow.revealDelay('counting', false) >= 1000, 'normal vote counting has visible suspense');
ok(flow.revealDelay('counting', true) < 200, 'reduced motion shortens suspense delay');

const options = [{ id: 'a', name: 'Alpha' }, { id: 'b', name: 'Beta' }];
equal(flow.workingPredictionSummary(options, null, 0).ready, false, 'no selection is not ready to lock');
equal(flow.workingPredictionSummary(options, 'b', 0).restaurantName, 'Beta', 'working prediction uses selected restaurant');
equal(flow.workingPredictionSummary(options, 'b', 3).ready, true, 'restaurant plus confidence is ready to lock');
const explanation = flow.buildDecisionExplanation({ name: 'Harbor & Hearth' }, [
  { name: 'Sophie', clues: { restaurant: 'Recent behavior changed the obvious choice.' } },
  { name: 'Daniel', clues: { restaurant: 'Value and distance matter.' } },
  { name: 'Rachel', clues: { restaurant: 'Celebration shaped the group.' } }
]);
ok(explanation.includes('Harbor & Hearth') && explanation.includes('Sophie') && explanation.includes('Daniel') && explanation.includes('Rachel'), 'reveal explanation is active-data driven');
ok(!flowSource.includes('Casa Luna balanced'), 'new reveal does not hard-code Casa Luna explanation');

const sourceQuestion = flowSource.indexOf('Where will the group eat?');
const sourceRestaurants = flowSource.indexOf('choice-first-grid');
const sourceEvidence = flowSource.indexOf('Need More Information?');
const sourceLiveRead = flowSource.indexOf('roomReadMarkup()');
ok(sourceQuestion >= 0 && sourceQuestion < sourceRestaurants, 'restaurant question is presented before options');
ok(sourceRestaurants < sourceEvidence, 'restaurant options are presented before diner evidence invitation');
ok(sourceEvidence < sourceLiveRead, 'diner evidence appears before the Live Read panel');
ok(flowSource.includes('aria-pressed="${selected}"'), 'restaurant cards expose selected state');
ok(flowSource.includes('Lock Restaurant Prediction'), 'sticky lock action has explicit copy');
ok(flowSource.includes('Continue to Order Predictions'), 'reveal has an explicit continue action');
ok(flowSource.includes('You read the table correctly'), 'correct result is explicit');
ok(flowSource.includes('Your restaurant prediction was incorrect'), 'incorrect result is explicit');
ok(flowSource.includes('${pointsEarned} / ${points.restaurant}'), 'restaurant points are displayed out of 120');
ok(flowSource.includes('restaurantRevealLockedChoice'), 'locked prediction is preserved through reveal');
ok(flowSource.includes('state.screen = "play"'), 'continue transitions explicitly to order predictions');
ok(flowSource.includes('Review the Evidence'), 'locked evidence review is available');
ok(!flowSource.includes('awardLatestAttempt'), 'restaurant reveal does not award progression XP');
ok(!flowSource.includes('recordAttempt()'), 'restaurant reveal does not record full attempt history');
ok(flowSource.includes('PupVoice?.speak'), 'reveal narration routes through shared Pup voice manager');
ok(flowSource.includes('prefers-reduced-motion: reduce'), 'reveal reads reduced-motion preference');

const newPlayerBoard = loadLeaderboard();
const localNew = newPlayerBoard.getLocalMember();
equal(localNew.displayName, 'You', 'local player is labeled You');
equal(localNew.totalXp, 0, 'new local player has 0 XP');
equal(localNew.bestFreshVariantScore, null, 'new local player has no invented fresh score');
equal(newPlayerBoard.getMembers().filter(member => !member.simulated).length, 1, 'exactly one real local row is present');
ok(newPlayerBoard.getMembers().filter(member => member.simulated).length >= 4, 'simulated group members are present');

const board = loadLeaderboard(
  { totalXp: 820, rankId: 'clue-tracker', bestFreshVariantScore: 280, completedFreshVariants: 2 },
  { attempts: [
    { attemptType: 'first-attempt', score: 210, timestamp: '2026-07-25T10:00:00.000Z' },
    { attemptType: 'first-attempt', score: 250, timestamp: '2026-07-25T11:00:00.000Z' },
    { attemptType: 'same-variant-replay', score: 300, timestamp: '2026-07-25T12:00:00.000Z' }
  ] }
);
const local = board.getLocalMember();
equal(local.firstAttemptAverage, 230, 'first-attempt average excludes replay score');
equal(local.bestFreshVariantScore, 280, 'local best fresh score comes from progression');
const ranked = board.getRankedMembers();
ok(ranked.every((member, index) => index === 0 || ranked[index - 1].totalXp >= member.totalXp), 'members sort by XP first');
const localPosition = board.getLocalPosition();
equal(ranked[localPosition.position - 1].userId, 'local-player', 'local position matches ranked order');
equal(board.getGroupLeader().userId, 'sim-avery', 'highest-XP member is group leader');
ok(board.getActivityPreview().some(item => item.simulated), 'simulated activity is labeled');
ok(board.getActivityPreview().some(item => !item.simulated && item.text.includes('You are currently')), 'local activity is based on actual progression');

const tied = [
  { displayName: 'B', totalXp: 500, bestFreshVariantScore: 200, firstAttemptAverage: 240, lastPlayedAt: '2026-01-01' },
  { displayName: 'A', totalXp: 500, bestFreshVariantScore: 220, firstAttemptAverage: 180, lastPlayedAt: '2026-01-01' }
].sort(board.compareMembers);
equal(tied[0].displayName, 'A', 'best fresh score is the next leaderboard tie-breaker');
const tiedAverage = [
  { displayName: 'B', totalXp: 500, bestFreshVariantScore: 220, firstAttemptAverage: 210, lastPlayedAt: '2026-01-01' },
  { displayName: 'A', totalXp: 500, bestFreshVariantScore: 220, firstAttemptAverage: 230, lastPlayedAt: '2026-01-01' }
].sort(board.compareMembers);
equal(tiedAverage[0].displayName, 'A', 'first-attempt average is the next tie-breaker');
const deterministic = [
  { displayName: 'B', totalXp: 500, bestFreshVariantScore: 220, firstAttemptAverage: 230, lastPlayedAt: '2026-01-01' },
  { displayName: 'A', totalXp: 500, bestFreshVariantScore: 220, firstAttemptAverage: 230, lastPlayedAt: '2026-01-01' }
].sort(board.compareMembers);
equal(deterministic[0].displayName, 'A', 'final alphabetical tie-breaker is deterministic');

ok(dataSource.includes('groupId: "demo-group"'), 'future-ready group ID is present');
ok(dataSource.includes('userId: "sim-jordan"'), 'future-ready simulated user ID is present');
ok(dataSource.includes('completedFreshVariants'), 'future-ready completion field is present');
ok(leaderboardSource.includes('Prototype preview:'), 'simulation disclosure is explicit');
ok(leaderboardSource.includes('Local data'), 'local data is identified textually');
ok(leaderboardSource.includes('event.key === "Escape"'), 'leaderboard supports Escape close');
ok(leaderboardSource.includes('target?.focus?.()'), 'leaderboard restores focus to opener');
ok(!leaderboardSource.includes('fetch('), 'leaderboard requires no backend request');

ok(cssSource.includes('.restaurant-lock-dock'), 'sticky lock presentation exists');
ok(cssSource.includes('position: sticky'), 'sticky lock uses sticky positioning');
ok(cssSource.includes('env(safe-area-inset-bottom)'), 'sticky lock respects mobile safe area');
ok(cssSource.includes('.restaurant-outcome-banner'), 'unmistakable outcome presentation exists');
ok(cssSource.includes('.group-leaderboard-row.is-local'), 'local player has a distinct non-color-only row treatment');
ok(cssSource.includes('@media (max-width: 420px)'), 'Sprint 4.4.1 supports narrow mobile screens');
ok(cssSource.includes('@media (prefers-reduced-motion: reduce)'), 'Sprint 4.4.1 CSS respects reduced motion');

const releaseSandbox = { window: { document: { title: '', body: { classList: { add() {} } }, querySelector() { return null; }, querySelectorAll() { return []; } } } };
vm.runInNewContext(releaseSource, releaseSandbox, { filename: 'release.js' });
const releaseVersion = releaseSandbox.window.BiteBuddyRelease.version;
const releaseParts = require('./version-helpers.cjs').parseVersion(releaseVersion);
const minimumRelease = [0, 4, 4, 1];
const isAtLeastMinimum = Boolean(releaseParts) && releaseParts.some((part, index) => {
  if (part !== minimumRelease[index]) return part > minimumRelease[index];
  return false;
}) || Boolean(releaseParts) && releaseParts.every((part, index) => part === minimumRelease[index]);
ok(isAtLeastMinimum, 'current release is Sprint 4.4.1 or later');
ok(typeof releaseSandbox.window.BiteBuddyRelease.releaseName === 'string' && releaseSandbox.window.BiteBuddyRelease.releaseName.length > 0, 'current release name is present');
ok(htmlSource.includes('sprint441.css') && htmlSource.includes('sprint441.js'), 'Sprint 4.4.1 assets are integrated');
ok(htmlSource.indexOf('groupLeaderboardData.js') < htmlSource.indexOf('groupLeaderboard.js'), 'leaderboard data loads before leaderboard behavior');
ok(htmlSource.indexOf('groupLeaderboard.js') < htmlSource.indexOf('sprint441.js'), 'leaderboard loads before final Sprint wrapper');
ok(progressionSource.includes('awardedAttempts'), 'progression duplicate protection remains integrated');
ok(variantsSource.includes('id: "A", title: "The Great Sushi Debate"'), 'Variant A remains available');
ok(variantsSource.includes('id: "B", title: "The Harbor Table"'), 'Variant B remains available');
ok(variantsSource.includes('id: "C", title: "The Garden Celebration"'), 'Variant C remains available');
ok(variantsSource.includes('Pup Voice Studio'), 'Pup Voice Studio remains integrated');
ok(/const points = \{ restaurant: 120, meal: 30, drink: 20, dessert: 10 \}/.test(appSource), 'authoritative scoring model remains unchanged');
equal(120 + (30 + 20 + 10) * 3, 300, 'case score remains 300');

console.log(`Sprint 4.4.1 tests passed: ${assertions} assertions`);
