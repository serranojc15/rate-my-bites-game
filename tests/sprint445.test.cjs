const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('sprint445.js', 'utf8');
const css = fs.readFileSync('sprint445.css', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const releaseSource = fs.readFileSync('release.js', 'utf8');
const appSource = fs.readFileSync('app.js', 'utf8');
const progressionSource = fs.readFileSync('progression.js', 'utf8');
const progressionUiSource = fs.readFileSync('progressionUI.js', 'utf8');
const missionReportSource = fs.readFileSync('missionReport.js', 'utf8');
const finalRevealSource = fs.readFileSync('sprint444.js', 'utf8');
const orderFlowSource = fs.readFileSync('sprint443.js', 'utf8');
const restaurantDockSource = fs.readFileSync('sprint442.js', 'utf8');
const leaderboardSource = fs.readFileSync('groupLeaderboard.js', 'utf8');
const variantsSource = fs.readFileSync('sprint431.js', 'utf8');
const workflowSource = fs.readFileSync('.github/workflows/static-validation.yml', 'utf8');

let assertions = 0;
function ok(value, message) { assert.ok(value, message); assertions += 1; }
function equal(actual, expected, message) { assert.equal(actual, expected, message); assertions += 1; }

const ranks = [
  { id: 'rookie-biter', name: 'Rookie Biter', minimumXp: 0 },
  { id: 'table-reader', name: 'Table Reader', minimumXp: 250 },
  { id: 'clue-tracker', name: 'Clue Tracker', minimumXp: 650 },
  { id: 'people-detective', name: 'People Detective', minimumXp: 1200 },
  { id: 'master-biter', name: 'Master Biter', minimumXp: 2000 }
];
const skillDefinitions = {
  recentBehavior: { label: 'Recent Behavior', contextIds: ['recent'] },
  permanentConstraints: { label: 'Permanent Constraints', contextIds: ['permanent'] },
  groupDynamics: { label: 'Group Dynamics', contextIds: ['social'] },
  patternChanges: { label: 'Pattern Changes', contextIds: ['intentional'] },
  contextualFactors: { label: 'Contextual Factors', contextIds: ['environmental', 'preference'] },
  confidenceCalibration: { label: 'Confidence Calibration', contextIds: [] }
};
function skillLevel(skill = {}) {
  const attempted = Number(skill.attempted) || 0;
  const correct = Number(skill.correct) || 0;
  if (attempted < 2) return { id: 'new', label: 'New', percent: attempted ? Math.round((correct / attempted) * 100) : 0 };
  const percent = Math.round((correct / attempted) * 100);
  if (percent < 50) return { id: 'developing', label: 'Developing', percent };
  if (percent < 70) return { id: 'reliable', label: 'Reliable', percent };
  if (percent < 85 || attempted < 6) return { id: 'strong', label: 'Strong', percent };
  return { id: 'expert', label: 'Expert', percent };
}
function getRank(totalXp) { return [...ranks].reverse().find(rank => totalXp >= rank.minimumXp) || ranks[0]; }
function getSkillSummary(progression) {
  return Object.entries(skillDefinitions).map(([id, definition]) => {
    const skill = progression.skills[id] || { attempted: 0, correct: 0 };
    return { id, label: definition.label, attempted: skill.attempted || 0, correct: skill.correct || 0, level: skillLevel(skill) };
  });
}
function strongestSkill(progression) {
  return getSkillSummary(progression).filter(skill => skill.attempted >= 3).sort((a, b) => (b.level.percent - a.level.percent) || (b.attempted - a.attempted))[0] || null;
}
function getUnlockState(progression) {
  const confidence = skillLevel(progression.skills.confidenceCalibration || {});
  return {
    introductory: { unlocked: true, label: 'Introductory' },
    intermediate: { unlocked: progression.completedFirstAttempts >= 1 && progression.completedFreshVariants >= 1 && progression.totalXp >= 250 && (progression.bestFreshVariantScore || 0) >= 180, requirements: [
      { label: 'Complete one first attempt', met: progression.completedFirstAttempts >= 1 },
      { label: 'Complete one fresh variant', met: progression.completedFreshVariants >= 1 },
      { label: 'Earn 250 XP', met: progression.totalXp >= 250 },
      { label: 'Score at least 180 on a fresh variant', met: (progression.bestFreshVariantScore || 0) >= 180 }
    ] },
    advanced: { unlocked: progression.totalXp >= 1200 && progression.completedFreshVariants >= 3 && (progression.bestFreshVariantScore || 0) >= 225 && ['reliable','strong','expert'].includes(confidence.id), requirements: [] }
  };
}
const reportEntries = report => report.entries || [];

const progressionApi = { ranks, skillDefinitions, getRank, getSkillSummary, strongestSkill, skillLevel, getUnlockState, reportEntries };
const window = { BiteBuddyProgression: progressionApi, BiteBuddyRelease: { version: 'v0.4.4.5' } };
vm.runInNewContext(source, { window, console }, { filename: 'sprint445.js' });
const api = window.BiteBuddySprint445;

// Attempt labels and XP grouping.
equal(api.version, 'v0.4.4.5', 'Sprint API uses the current release');
equal(api.attemptTypeLabel('first-attempt'), 'First Attempt', 'first attempt label is player friendly');
equal(api.attemptTypeLabel('fresh-variant'), 'Fresh Variant', 'fresh attempt label is player friendly');
equal(api.attemptTypeLabel('same-variant-replay'), 'Practice Replay', 'replay label is player friendly');
const award = { xp: 179, breakdown: [
  { label: 'Fresh Variant Completed', xp: 55 },
  { label: 'Correct Restaurant', xp: 30 },
  { label: '2 Correct Entrées', xp: 20 },
  { label: '2 Correct Drinks', xp: 14 },
  { label: '1 Correct Dessert', xp: 5 },
  { label: 'Confidence Calibration', xp: 10 },
  { label: 'Fresh-Variant Improvement', xp: 25 },
  { label: 'First Fresh Variant Milestone', xp: 20 }
] };
const grouped = api.groupedXpBreakdown(award);
equal(grouped.total, 179, 'grouped XP retains authoritative total');
equal(grouped.rows.reduce((sum, row) => sum + row.xp, 0), 179, 'grouped XP rows sum to authoritative total');
equal(grouped.rows.find(row => row.key === 'meal').xp, 20, 'entrée XP is grouped correctly');
equal(grouped.rows.find(row => row.key === 'drink').xp, 14, 'drink XP is grouped correctly');
equal(grouped.rows.find(row => row.key === 'dessert').xp, 5, 'dessert XP is grouped correctly');
equal(grouped.rows.find(row => row.key === 'confidence').xp, 10, 'confidence XP is grouped correctly');
equal(grouped.rows.find(row => row.key === 'fresh-milestone').xp, 20, 'first fresh milestone retains the 20 XP rule');
ok(!api.groupedXpBreakdown({ xp: 10, breakdown: [{ label: 'Replay Practice Completed', xp: 10 }] }).rows.some(row => row.key === 'restaurant'), 'replay does not invent restaurant XP');

// Before/after reconstruction and honest comparison.
const progression = {
  totalXp: 300,
  rankId: 'table-reader',
  completedFirstAttempts: 1,
  completedFreshVariants: 1,
  completedReplays: 0,
  bestFreshVariantScore: 220,
  skills: {
    recentBehavior: { attempted: 3, correct: 2 },
    permanentConstraints: { attempted: 2, correct: 1 },
    groupDynamics: { attempted: 3, correct: 2 },
    patternChanges: { attempted: 1, correct: 1 },
    contextualFactors: { attempted: 2, correct: 1 },
    confidenceCalibration: { attempted: 10, correct: 7 }
  }
};
const current = { attemptId: 'current', attemptType: 'fresh-variant', variantId: 'B', score: 220 };
const history = { attempts: [
  { attemptId: 'first', attemptType: 'first-attempt', variantId: 'A', score: 190 },
  current
] };
const report = { score: { earned: 220 }, entries: [
  { correct: true, confidence: 5, context: { id: 'recent' } },
  { correct: false, confidence: 2, context: { id: 'social' } }
] };
const currentAward = { xp: 110, breakdown: [] };
const before = api.progressionBeforeAttempt(progression, report, currentAward, current, history);
equal(before.totalXp, 190, 'before snapshot removes only current XP award');
equal(before.completedFreshVariants, 0, 'before snapshot removes current fresh completion');
equal(before.bestFreshVariantScore, null, 'before snapshot does not claim current fresh score existed earlier');
equal(before.skills.recentBehavior.attempted, 2, 'before snapshot removes current skill evidence');
const comparison = api.previousInvestigationComparison(report, history, current, progression, before, currentAward);
equal(comparison.find(row => row.label === 'Case score').value, '+30', 'score improvement uses stored comparable attempt');
equal(comparison.find(row => row.label === 'Best fresh score').value, 'New baseline', 'first fresh case establishes a baseline');
equal(comparison.find(row => row.label === 'Total XP').value, '+110 XP', 'comparison reports authoritative awarded XP');
const replayComparison = api.previousInvestigationComparison(report, { attempts: [{ attemptType: 'first-attempt', variantId: 'A', score: 190 }, { attemptType: 'same-variant-replay', variantId: 'A', score: 250 }] }, { attemptType: 'same-variant-replay', variantId: 'A', score: 250 }, progression, before, { xp: 10 });
equal(replayComparison.find(row => row.label === 'Transfer evidence').value, 'Practice only', 'same-case replay is not presented as fresh mastery');

// Development summary.
const development = api.detectiveDevelopment(progression, before);
ok(development.strongest && development.strongest.id !== undefined, 'strongest skill derives from progression');
ok(development.needsEvidence && development.needsEvidence.id !== undefined, 'needs-more-evidence skill derives from progression');
equal(development.skills.length, 6, 'all six detective skills remain available');
ok(!development.skills.some(skill => skill.level.id === 'expert' && skill.attempted < 6), 'Expert still requires sufficient evidence');

// Deterministic recommendations.
const newPlayer = { completedFirstAttempts: 0, completedFreshVariants: 0, totalXp: 0, bestFreshVariantScore: null, skills: { confidenceCalibration: { attempted: 0, correct: 0 } } };
equal(api.nextMissionRecommendation(newPlayer, 'first-attempt', getUnlockState(newPlayer), getSkillSummary(newPlayer)).id, 'first', 'new player receives first-investigation guidance');
const noFresh = { ...progression, completedFreshVariants: 0 };
equal(api.nextMissionRecommendation(noFresh, 'first-attempt', getUnlockState(noFresh), getSkillSummary(noFresh)).id, 'fresh', 'player without fresh case is recommended a fresh variant');
const weakCalibration = { ...progression, completedFreshVariants: 2, totalXp: 800, bestFreshVariantScore: 220, skills: { ...progression.skills, confidenceCalibration: { attempted: 5, correct: 1 } } };
equal(api.nextMissionRecommendation(weakCalibration, 'fresh-variant', getUnlockState(weakCalibration), getSkillSummary(weakCalibration)).id, 'calibration', 'weak calibration produces calibration guidance');
const practiceReady = { ...progression, completedFreshVariants: 3, totalXp: 900, bestFreshVariantScore: 240, skills: { ...progression.skills, confidenceCalibration: { attempted: 10, correct: 8 } } };
const practiceRecommendation = api.nextMissionRecommendation(practiceReady, 'fresh-variant', getUnlockState(practiceReady), getSkillSummary(practiceReady));
equal(practiceRecommendation.id, 'replay', 'established transfer and calibration can trigger focused practice');
equal(practiceRecommendation.action, 'Replay This Case', 'practice recommendation reuses the replay action');
ok(practiceRecommendation.reason.includes('practice XP is limited'), 'practice recommendation does not present replay as renewable mastery');
ok(!api.nextMissionRecommendation(progression, 'fresh-variant', getUnlockState(progression), getSkillSummary(progression)).reason.includes('Episode 002'), 'recommendation never claims Episode 002 is playable');

// Leaderboard uses existing API instead of sorting locally.
let rankedCalls = 0;
const groupApi = {
  getRankedMembers() { rankedCalls += 1; return [
    { userId: 'sim-taylor', displayName: 'Taylor', totalXp: 500 },
    { userId: 'local-player', displayName: 'You', totalXp: 300 },
    { userId: 'sim-casey', displayName: 'Casey', totalXp: 190 }
  ]; },
  getLocalPosition() { return { position: 2, total: 3 }; },
  getGroupLeader() { return { displayName: 'Taylor', totalXp: 500 }; }
};
const group = api.groupUpdate(groupApi);
equal(group.position, 2, 'group position comes from leaderboard API');
equal(group.gap, 200, 'XP gap to adjacent higher member is calculated correctly');
equal(group.above.displayName, 'Taylor', 'adjacent higher member is identified');
equal(rankedCalls, 1, 'Mission Report requests ranked members once and does not duplicate sorting');

// Source architecture and safety.
ok(source.includes('baseRenderMissionReport445'), 'new layer preserves the established Mission Report wrapper chain');
ok(source.includes('captureExistingActions()'), 'existing replay and fresh actions are reused');
ok(source.includes('captureCelebrations()'), 'one-time notices are captured after established notice consumption');
ok(source.includes('progressionApi.getProgression()'), 'current progression is authoritative');
ok(source.includes('currentAward(progression, attempt)'), 'existing award is displayed on rerender');
ok(source.includes('progressionBeforeAttempt'), 'before-and-after snapshot is deliberate');
ok(source.includes('BiteBuddyGroupLeaderboard'), 'existing leaderboard interface is used');
ok(source.includes('missionPayoffNarrated'), 'duplicate narration has a state guard');
ok(source.includes('Practice mode · Limited XP'), 'practice replay is labeled honestly');
ok(source.includes('Same-case replays provide limited practice XP'), 'limited replay XP is explained');
ok(source.includes('practice credit for this variant was already awarded'), 'zero-XP replay is explained');
ok(source.includes('state.finalRevealPhase = "review"'), 'Review Every Answer uses established Final Reveal recap mode');
ok(!source.includes('awardAttempt('), 'new layer does not introduce another XP award path');
ok(!source.includes('recordAttempt('), 'new layer does not introduce another attempt recording path');
ok(!source.includes('.sort(compareMembers'), 'new layer does not duplicate leaderboard sorting');

// Information hierarchy, accessibility, and mobile.
ok(source.includes('MISSION COMPLETE'), 'Mission Complete is the primary heading');
ok(source.includes('Case Score'), 'case score has a distinct label');
ok(source.includes('XP Earned'), 'XP earned has a distinct label');
ok(source.includes('Current Rank'), 'current rank is above the fold');
ok(source.includes('XP Breakdown'), 'XP breakdown is integrated');
ok(source.includes('Since Your Last Investigation'), 'comparison section is integrated');
ok(source.includes('Detective Development'), 'development section is integrated');
ok(source.includes('Pup’s Next Mission'), 'next mission is integrated');
ok(source.includes('Group Update'), 'group update is integrated');
ok(source.includes('Prototype preview:'), 'simulated-member disclosure remains explicit');
ok(source.includes('role="progressbar"'), 'rank progress is accessible');
ok(source.includes('aria-valuemin'), 'rank progress exposes minimum');
ok(source.includes('aria-valuemax'), 'rank progress exposes maximum');
ok(source.includes('aria-valuenow'), 'rank progress exposes current value');
ok(source.includes('focus?.({ preventScroll: true })'), 'Mission Report heading focus avoids forced scrolling');
ok(css.includes('.mission-payoff-primary-metrics'), 'score, XP, and rank have a dedicated visual hierarchy');
ok(css.includes('overflow-wrap: anywhere'), 'long values wrap safely');
ok(css.includes(':focus-visible'), 'keyboard focus remains visible');
ok(css.includes('@media (max-width: 520px)'), 'phone layout is supported');
ok(css.includes('@media (max-width: 360px)'), 'approximately 320-pixel layout is supported');
ok(css.includes('env(safe-area-inset-bottom)'), 'action hub respects mobile safe area');
ok(css.includes('@media (prefers-reduced-motion: reduce)'), 'reduced-motion presentation is supported');
ok(css.includes('animation: none !important'), 'reduced motion removes animations');

// Existing feature regressions.
ok(restaurantDockSource.includes('dock.insertBefore(confidenceBox, lockButton)'), 'restaurant confidence remains beside Lock');
ok(orderFlowSource.includes('confidenceControl(context.person.id, context.stage)'), 'order confidence remains beside Lock');
ok(orderFlowSource.includes('The deduction is sealed. The answer stays hidden until the Final Reveal.'), 'order confirmation still hides correctness');
ok(finalRevealSource.includes('No restaurant vote will be replayed.'), 'Final Reveal continuity remains integrated');
ok(finalRevealSource.includes('result.answers.map(answerCardMarkup)'), 'diner-by-diner results remain integrated');
ok(missionReportSource.includes('function buildMissionReportData()'), 'Mission Report and Final Reveal share authoritative score data');
ok(progressionSource.includes('awardedAttempts'), 'duplicate-XP protection remains intact');
ok(progressionSource.includes('if (existing || progression.awardedAttempts.includes'), 'duplicate award guard remains active');
ok(progressionUiSource.includes('awardLatestAttempt(report)'), 'established progression award boundary remains active');
ok(leaderboardSource.includes('Prototype preview:'), 'leaderboard simulation disclosure remains');
ok(variantsSource.includes('id: "A", title: "The Great Sushi Debate"'), 'Variant A remains available');
ok(variantsSource.includes('id: "B", title: "The Harbor Table"'), 'Variant B remains available');
ok(variantsSource.includes('id: "C", title: "The Garden Celebration"'), 'Variant C remains available');
ok(/const points = \{ restaurant: 120, meal: 30, drink: 20, dessert: 10 \}/.test(appSource), 'scoring constants remain unchanged');
equal(120 + (30 + 20 + 10) * 3, 300, 'total possible score remains 300');

// Release and workflow integration.
const releaseSandbox = { window: { document: { title: '', body: { classList: { add() {} } }, querySelector() { return null; }, querySelectorAll() { return []; } } } };
vm.runInNewContext(releaseSource, releaseSandbox, { filename: 'release.js' });
const activeRelease = releaseSandbox.window.BiteBuddyRelease;
ok(require('./version-helpers.cjs').isVersionAtLeast(activeRelease.version, 'v0.4.4.5'), 'release version is Sprint 4.4.5 or later');
ok(typeof activeRelease.releaseName === 'string' && activeRelease.releaseName.length > 0, 'release name is current');
ok(html.includes(`<title>Rate My Bites — Bite Buddy League ${activeRelease.version}</title>`), 'browser fallback title is current');
ok(html.indexOf('sprint445.css') > html.indexOf('sprint444.css'), 'Sprint 4.4.5 CSS loads after Sprint 4.4.4');
ok(html.indexOf('sprint445.js') > html.indexOf('sprint444.js'), 'Sprint 4.4.5 JavaScript loads after Sprint 4.4.4');
ok(workflowSource.includes('node tests/sprint445ReleaseNeutral.test.cjs'), 'Static validation runs Sprint 4.4.5 tests');
ok(workflowSource.includes('node tests/sprint444ReleaseNeutral.test.cjs'), 'Sprint 4.4.4 tests remain enabled');
ok(workflowSource.includes('node tests/progression.test.cjs'), 'Detective Progression tests remain enabled');

console.log(`Sprint 4.4.5 tests passed: ${assertions} assertions`);
