const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('sprint442.js', 'utf8');
const css = fs.readFileSync('sprint442.css', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const releaseSource = fs.readFileSync('release.js', 'utf8');
const appSource = fs.readFileSync('app.js', 'utf8');
const flowSource = fs.readFileSync('sprint441.js', 'utf8');
const polishSource = fs.readFileSync('sprint441Polish.js', 'utf8');
const finalRevealSource = fs.readFileSync('finalReveal.js', 'utf8');
const missionReportSource = fs.readFileSync('missionReport.js', 'utf8');
const progressionSource = fs.readFileSync('progression.js', 'utf8');
const leaderboardSource = fs.readFileSync('groupLeaderboard.js', 'utf8');
const variantsSource = fs.readFileSync('sprint431.js', 'utf8');
const workflowSource = fs.readFileSync('.github/workflows/static-validation.yml', 'utf8');

let assertions = 0;
function ok(value, message) { assert.ok(value, message); assertions += 1; }
function equal(actual, expected, message) { assert.equal(actual, expected, message); assertions += 1; }

function loadApi() {
  const window = {};
  vm.runInNewContext(source, { window, console }, { filename: 'sprint442.js' });
  return window.BiteBuddySprint442;
}

const api = loadApi();
const restaurants = [
  { id: 'luna', name: 'Casa Luna' },
  { id: 'cactus', name: 'Cactus Cantina' }
];
const reasons = [
  { id: 'history', label: 'Dining history' },
  { id: 'gut', label: 'Gut feeling' }
];

// Focused state behavior.
equal(api.version, 'v0.4.4.2', 'Sprint interface falls back to its introduction version');
equal(api.confidenceScale.join(','), '1,2,3,4,5', 'confidence scale remains one through five');
const empty = api.getRestaurantDecisionState(restaurants, null, 0, null, reasons);
equal(empty.status, 'empty', 'no restaurant produces empty state');
equal(empty.restaurantName, 'No restaurant selected', 'empty state names no restaurant');
equal(empty.confidence, 0, 'empty state has no confidence');
equal(empty.ready, false, 'empty state is not ready');
equal(empty.guidance, 'Choose a restaurant to begin.', 'empty state gives first action');
equal(empty.influenceText, 'Influence: Not selected · Optional', 'influence is explicitly optional');

const incomplete = api.getRestaurantDecisionState(restaurants, 'luna', 0, null, reasons);
equal(incomplete.status, 'confidence-required', 'selected restaurant without confidence requests confidence');
equal(incomplete.restaurantName, 'Casa Luna', 'selected restaurant is visible');
equal(incomplete.ready, false, 'missing confidence keeps lock disabled');
equal(incomplete.guidance, 'Now choose how confident you are.', 'incomplete state identifies missing input');
equal(incomplete.confidenceText, 'Confidence: Not selected', 'missing confidence is represented with text');

const ready = api.getRestaurantDecisionState(restaurants, 'luna', 4, null, reasons);
equal(ready.status, 'ready', 'restaurant and confidence produce ready state');
equal(ready.confidence, 4, 'selected confidence is preserved');
equal(ready.confidenceText, 'Confidence: 4 of 5', 'selected confidence has readable summary');
equal(ready.ready, true, 'restaurant and confidence enable lock readiness');
equal(ready.guidance, 'Your prediction is ready to lock.', 'ready state has explicit guidance');
equal(ready.influenceText, 'Influence: Not selected · Optional', 'missing influence does not block readiness');

const withInfluence = api.getRestaurantDecisionState(restaurants, 'cactus', 2, 'history', reasons);
equal(withInfluence.restaurantName, 'Cactus Cantina', 'changing restaurant updates the decision');
equal(withInfluence.confidence, 2, 'changing restaurant does not inherently erase confidence');
equal(withInfluence.influenceText, 'Influence: Dining history', 'selected influence receives readable status');
equal(withInfluence.ready, true, 'influence remains optional for readiness');
equal(api.getRestaurantDecisionState(restaurants, 'luna', 9).confidence, 0, 'out-of-range confidence is rejected');
equal(api.getRestaurantDecisionState(restaurants, 'luna', '3').confidence, 3, 'valid numeric confidence strings normalize safely');

// Single authoritative restaurant confidence control.
ok(source.includes('currentConfidence("group", "restaurant")'), 'dock reads the authoritative restaurant confidence value');
ok(source.includes('state.groupRestaurant'), 'dock reads the authoritative restaurant selection');
ok(source.includes('state.restaurantReason'), 'dock reads the existing optional influence state');
ok(!/restaurantConfidenceV2|dockConfidence|selectedRestaurantConfidence/.test(source), 'no competing confidence state field is introduced');
ok(source.includes('const standalone = root.document.querySelector(".restaurant-confidence-section")'), 'layer locates the historical standalone confidence section');
ok(source.includes('dock.insertBefore(confidenceBox, lockButton)'), 'existing confidence control is moved directly before Lock');
ok(source.includes('standalone?.remove()'), 'old standalone container is removed from the active page');
ok(source.includes('data-restaurant-confidence-control'), 'relocated control has a deliberate integration marker');
ok(source.includes('Restaurant prediction confidence'), 'confidence group has a readable accessible label');
ok(source.includes('aria-pressed'), 'confidence buttons expose selected state');
ok(source.includes('Confidence: ${normalizedConfidence} of 5'), 'confidence selection is represented textually');
ok(source.includes('lock.disabled = !decision.ready'), 'lock enabled state follows restaurant and confidence only');
ok(source.includes('aria-disabled'), 'lock disabled state is exposed accessibly');
ok(source.includes('restaurantDecisionGuidance'), 'lock references explanatory guidance');
ok(source.includes('1 = Mostly guessing · 3 = Reasonably confident · 5 = Certain'), 'confidence scale guidance is concise');
ok(source.includes('[data-reason]'), 'optional influence changes refresh the dock status');
ok(source.includes('baseRestaurantRound442'), 'new layer extends the established restaurant renderer');
ok(source.includes('baseRender442'), 'new layer remains integrated across render wrappers');
ok(!source.includes('awardLatestAttempt'), 'decision polish does not award progression XP');
ok(!source.includes('recordAttempt('), 'decision polish does not record completed attempts');

// Accessibility and mobile presentation.
ok(css.includes('.restaurant-decision-dock'), 'decision dock has focused presentation');
ok(css.includes('grid-template-columns: repeat(5'), 'all five confidence buttons use an explicit grid');
ok(css.includes('min-height: 2.75rem') || css.includes('min-height: 2.7rem'), 'confidence buttons retain useful tap height');
ok(css.includes('[aria-pressed="true"]'), 'selected confidence has a non-color-only structural selector');
ok(css.includes('.confidence-button:focus-visible'), 'confidence buttons have visible keyboard focus');
ok(css.includes('@media (max-width: 520px)'), 'dock stacks for narrow mobile screens');
ok(css.includes('@media (max-width: 360px)'), 'dock supports approximately 320-pixel screens');
ok(css.includes('grid-template-columns: repeat(5, minmax(2.2rem, 1fr))'), 'narrow layout keeps five buttons inside the viewport');
ok(css.includes('width: 100%'), 'Lock action can use available width');
ok(css.includes('text-overflow: ellipsis'), 'long restaurant names are protected from overflow');
ok(css.includes('@media (prefers-reduced-motion: reduce)'), 'decision polish respects reduced motion');
ok(polishSource.includes('opener?.focus?.({ preventScroll: true })'), 'case-file focus restoration remains integrated');
ok(polishSource.includes('root.scrollTo?.(scrollX, scrollY)'), 'case-file scroll restoration remains integrated');

// Existing flow, reveal, progression, leaderboard, and score regressions.
ok(flowSource.indexOf('Where will the group eat?') < flowSource.indexOf('Need More Information?'), 'choice-first question remains before evidence');
ok(flowSource.indexOf('choice-first-grid') < flowSource.indexOf('roomReadMarkup()'), 'restaurant options remain before Live Read');
ok(flowSource.includes('working-prediction'), 'working prediction remains visible');
ok(flowSource.includes('restaurantRevealLockedChoice'), 'cinematic reveal preserves locked restaurant');
ok(flowSource.includes('if (state.restaurantRevealLocked) return false'), 'cinematic reveal starts only once');
ok(flowSource.includes('You read the table correctly'), 'correct result remains explicit');
ok(flowSource.includes('Your restaurant prediction was incorrect'), 'incorrect result remains explicit');
ok(flowSource.includes('${pointsEarned} / ${points.restaurant}'), 'restaurant reveal still shows 120 or 0 out of 120');
ok(flowSource.includes('Continue to Order Predictions'), 'order-prediction transition remains explicit');
ok(!flowSource.includes('awardLatestAttempt'), 'restaurant reveal still awards no XP');
ok(!flowSource.includes('recordAttempt()'), 'restaurant reveal still records no completed attempt');
ok(finalRevealSource.includes('currentConfidence("group", "restaurant")'), 'restaurant confidence reaches Final Reveal');
ok(missionReportSource.includes('currentConfidence("group", "restaurant")'), 'restaurant confidence reaches Mission Report analysis');
ok(progressionSource.includes('awardedAttempts'), 'duplicate-XP protection remains integrated');
ok(leaderboardSource.includes('BiteBuddyProgression'), 'leaderboard local row still uses real progression');
ok(leaderboardSource.includes('Prototype preview:'), 'simulated leaderboard disclosure remains visible');
ok(variantsSource.includes('Pup Voice Studio'), 'Pup Voice Studio remains integrated');
ok(variantsSource.includes('id: "A", title: "The Great Sushi Debate"'), 'Variant A remains available');
ok(variantsSource.includes('id: "B", title: "The Harbor Table"'), 'Variant B remains available');
ok(variantsSource.includes('id: "C", title: "The Garden Celebration"'), 'Variant C remains available');
ok(/const points = \{ restaurant: 120, meal: 30, drink: 20, dessert: 10 \}/.test(appSource), 'authoritative scoring constants remain unchanged');
equal(120 + (30 + 20 + 10) * 3, 300, 'total possible case score remains 300');
ok(appSource.includes('confidenceControl(person.id, stage)'), 'diner confidence controls remain available during order rounds');

// Release and loading integration remains valid for 4.4.2 or any later release.
const releaseSandbox = { window: { document: { title: '', body: { classList: { add() {} } }, querySelector() { return null; }, querySelectorAll() { return []; } } } };
vm.runInNewContext(releaseSource, releaseSandbox, { filename: 'release.js' });
const releaseVersion = releaseSandbox.window.BiteBuddyRelease.version;
const versionParts = require('./version-helpers.cjs').parseVersion(releaseVersion);
ok(Boolean(versionParts), 'current release exposes a valid semantic version');
ok(versionParts[0] > 0 || versionParts[1] > 4 || (versionParts[1] === 4 && (versionParts[2] > 4 || (versionParts[2] === 4 && versionParts[3] >= 2))), 'current release is Restaurant Decision Polish or later');
ok(typeof releaseSandbox.window.BiteBuddyRelease.releaseName === 'string' && releaseSandbox.window.BiteBuddyRelease.releaseName.length > 0, 'current release name is exposed');
ok(html.includes(`<title>Rate My Bites Detective ${releaseVersion}</title>`), 'browser fallback title matches current release');
ok(html.indexOf('sprint442.css') > html.indexOf('sprint441Polish.css'), 'Sprint 4.4.2 CSS loads after Sprint 4.4.1 polish');
ok(html.indexOf('sprint442.js') > html.indexOf('sprint441Polish.js'), 'Sprint 4.4.2 JavaScript loads after Sprint 4.4.1 polish');
ok(workflowSource.includes('node tests/sprint442.test.cjs'), 'Static validation runs Sprint 4.4.2 tests');
ok(workflowSource.includes('node tests/sprint441.test.cjs'), 'Sprint 4.4.1 tests remain enabled');
ok(workflowSource.includes('node tests/sprint441Polish.test.cjs'), 'Sprint 4.4.1 polish tests remain enabled');
ok(workflowSource.includes('node tests/progression.test.cjs'), 'Detective Progression tests remain enabled');

console.log(`Sprint 4.4.2 tests passed: ${assertions} assertions`);
