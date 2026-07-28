const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('sprint443.js', 'utf8');
const css = fs.readFileSync('sprint443.css', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const releaseSource = fs.readFileSync('release.js', 'utf8');
const appSource = fs.readFileSync('app.js', 'utf8');
const restaurantFlowSource = fs.readFileSync('sprint441.js', 'utf8');
const restaurantDockSource = fs.readFileSync('sprint442.js', 'utf8');
const focusSource = fs.readFileSync('sprint441Polish.js', 'utf8');
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
  vm.runInNewContext(source, { window, console }, { filename: 'sprint443.js' });
  return window.BiteBuddySprint443;
}

const api = loadApi();
const people = [{ id: 'a', name: 'Emma' }, { id: 'b', name: 'Marcus' }, { id: 'c', name: 'Olivia' }];
const stages = ['meal', 'drink', 'dessert'];
const labels = { meal: 'Entrée', drink: 'Drink', dessert: 'Dessert' };
const options = [{ value: 'Chicken enchiladas' }, { value: 'Steak fajitas' }, { value: 'Fish tacos' }];

// Pure progress and state behavior.
equal(api.version, 'v0.4.4.3', 'Sprint interface falls back to v0.4.4.3');
equal(api.predictionNumber(0, 0, 3), 1, 'first entrée is prediction 1');
equal(api.predictionNumber(0, 1, 3), 2, 'second entrée is prediction 2');
equal(api.predictionNumber(0, 2, 3), 3, 'third entrée is prediction 3');
equal(api.predictionNumber(1, 0, 3), 4, 'first drink is prediction 4');
equal(api.predictionNumber(1, 2, 3), 6, 'third drink is prediction 6');
equal(api.predictionNumber(2, 0, 3), 7, 'first dessert is prediction 7');
equal(api.predictionNumber(2, 2, 3), 9, 'final dessert is prediction 9');
equal(api.totalPredictions(3, 3), 9, 'three stages and three diners produce nine predictions');
equal(api.categoryLabel('meal', labels), 'Entrée', 'meal uses Entrée label');
equal(api.categoryLabel('drink', labels), 'Drink', 'drink uses Drink label');
equal(api.categoryLabel('dessert', labels), 'Dessert', 'dessert uses Dessert label');

const empty = api.orderDecisionState(options, null, 0);
equal(empty.status, 'empty', 'no item creates empty state');
equal(empty.itemName, 'No item selected', 'empty state names no item');
equal(empty.ready, false, 'empty state is not ready');
equal(empty.guidance, 'Choose an item to begin.', 'empty state gives first action');

const incomplete = api.orderDecisionState(options, 'Chicken enchiladas', 0);
equal(incomplete.status, 'confidence-required', 'item without confidence requests confidence');
equal(incomplete.itemName, 'Chicken enchiladas', 'working item is visible');
equal(incomplete.ready, false, 'missing confidence keeps lock disabled');
equal(incomplete.guidance, 'Now choose how confident you are.', 'incomplete state identifies missing input');
equal(incomplete.confidenceText, 'Confidence: Not selected', 'missing confidence is textual');

const ready = api.orderDecisionState(options, 'Chicken enchiladas', 4);
equal(ready.status, 'ready', 'item and confidence produce ready state');
equal(ready.confidence, 4, 'confidence is preserved');
equal(ready.confidenceText, 'Confidence: 4 of 5', 'confidence summary is readable');
equal(ready.ready, true, 'item and confidence enable readiness');
equal(ready.guidance, 'Your prediction is ready to lock.', 'ready state is explicit');
equal(api.orderDecisionState(options, 'Chicken enchiladas', 9).confidence, 0, 'out-of-range confidence is rejected');
equal(api.orderDecisionState(options, 'Steak fajitas', 4).confidence, 4, 'changing item does not inherently erase confidence');

const nextPerson = api.nextPrediction(0, 0, people, stages, labels);
equal(nextPerson.type, 'person', 'first lock proceeds to next diner');
equal(nextPerson.label, 'Next Prediction: Marcus’s Entrée', 'next-diner action is specific');
equal(nextPerson.categoryComplete, false, 'category is not complete after first diner');
const nextCategory = api.nextPrediction(0, 2, people, stages, labels);
equal(nextCategory.type, 'category', 'third entrée reaches category transition');
equal(nextCategory.label, 'Begin Drink Predictions', 'entrée boundary starts drinks');
equal(nextCategory.completedCategory, 'Entrée', 'completed category is identified');
equal(nextCategory.nextCategory, 'Drink', 'next category is identified');
const nextDessert = api.nextPrediction(1, 2, people, stages, labels);
equal(nextDessert.label, 'Begin Dessert Predictions', 'drink boundary starts desserts');
const final = api.nextPrediction(2, 2, people, stages, labels);
equal(final.type, 'final', 'ninth lock reaches final transition');
equal(final.final, true, 'ninth transition is final');
equal(final.label, 'Lock Final Prediction and Begin the Reveal', 'final action explicitly begins reveal');

// Active context, menu, and clue integration.
ok(source.includes('state.stageIndex'), 'active stageIndex remains authoritative');
ok(source.includes('state.dinerIndex'), 'active dinerIndex remains authoritative');
ok(source.includes('state.picks'), 'existing picks state remains authoritative');
ok(source.includes('state.confidence'), 'existing confidence state remains authoritative');
ok(source.includes('availableOptions(stage)'), 'menu options use the established active-restaurant helper');
ok(source.includes('actualRestaurant()'), 'active restaurant is displayed from established data');
ok(source.includes('context.person.clues?.[context.stage]'), 'active-stage clue is used');
ok(source.includes('What will ${escapeHtml(context.person.name)} order at ${escapeHtml(context.restaurant.name)}?'), 'question uses active diner and restaurant');
ok(source.includes('${escapeHtml(context.category)} Prediction · ${context.position} of ${context.total}'), 'category and global progress are displayed');
ok(source.includes('data-person="${escapeHtml(context.person.id)}"'), 'case-file action uses active diner');
ok(focusSource.includes('opener?.focus?.({ preventScroll: true })'), 'case-file focus restoration remains integrated');
ok(focusSource.includes('root.scrollTo?.(scrollX, scrollY)'), 'case-file scroll restoration remains integrated');

// Menu-card behavior.
ok(source.includes('data-order-value'), 'menu cards carry the selected item value');
ok(source.includes('aria-pressed="${selected}"'), 'menu cards expose selected state');
ok(source.includes('✓ Current prediction'), 'selected card has textual feedback');
ok(source.includes('Select as working prediction'), 'unselected card explains working-choice behavior');
ok(source.includes('state.picks[context.person.id][context.stage] = button.dataset.orderValue'), 'selection updates existing picks state');
ok(source.includes('syncOrderPredictionUi();'), 'selection updates in place without rerendering');
ok(!/orderPickV2|orderSelectionV2|selectedOrderItem/.test(source), 'no competing item-state system is introduced');

// Decision dock and confidence integration.
ok(source.includes('class="order-decision-dock"'), 'order decision dock is rendered');
ok(source.includes('confidenceControl(context.person.id, context.stage)'), 'existing confidence renderer is reused once inside dock');
equal((source.match(/confidenceControl\(context\.person\.id, context\.stage\)/g) || []).length, 1, 'only one order confidence control is rendered');
ok(source.indexOf('confidenceControl(context.person.id, context.stage)') < source.indexOf('id="lockOrderPrediction"'), 'confidence appears before Lock');
ok(source.includes('confidenceKey(context.person.id, context.stage)'), 'existing confidenceKey is reused');
ok(source.includes('currentConfidence(person.id, stage)'), 'existing currentConfidence is reused');
ok(!/orderConfidenceV2|dinerDockConfidence|selectedOrderConfidence/.test(source), 'no competing confidence field is introduced');
ok(source.includes('data-order-confidence-control'), 'single dock confidence control has integration marker');
ok(source.includes('aria-pressed'), 'confidence buttons expose selected state');
ok(source.includes('1 = Mostly guessing · 3 = Reasonably confident · 5 = Certain'), 'confidence scale is concise');
ok(source.includes('lock.disabled = !context.decision.ready'), 'Lock readiness depends on item and confidence');
ok(source.includes('aria-describedby'), 'disabled Lock references guidance');
ok(source.includes('Lock ${escapeHtml(context.person.name)}’s ${escapeHtml(context.category)}'), 'Lock copy uses active diner and category');
ok(finalRevealSource.includes('currentConfidence(person.id, stage)'), 'diner confidence reaches Final Reveal');
ok(missionReportSource.includes('answer.confidence'), 'diner confidence reaches Mission Report analysis');

// Lock confirmation, momentum, and safety.
ok(source.includes('state.orderLockInProgress'), 'manual and timed locks share one guard');
ok(source.includes('state.orderAdvanceInProgress'), 'next transition is guarded against double activation');
ok(source.includes('state.orderConfirmation = {'), 'locked prediction creates one confirmation record');
ok(source.includes('item: context.selectedItem'), 'confirmation preserves selected item');
ok(source.includes('confidence: context.confidence'), 'confirmation preserves confidence');
ok(source.includes('The deduction is sealed. The answer stays hidden until the Final Reveal.'), 'confirmation preserves suspense');
ok(source.includes('Next Prediction: ${nextPerson?.name'), 'next-diner action names the next person');
ok(source.includes('Begin ${categoryPlural[nextStage]'), 'category transition names the next category');
ok(source.includes('Lock Final Prediction and Begin the Reveal'), 'ninth confirmation explicitly begins Final Reveal');
ok(source.includes('baseAdvancePlay443();'), 'established advancePlay remains authoritative');
ok(source.includes('if (state.orderAdvanceInProgress) return;'), 'double activation cannot advance twice');
ok(source.includes('stopTimer();'), 'locking stops the active timer before confirmation');
ok(!source.includes('calculateScore();'), 'confirmation does not calculate score early');
ok(!source.includes('awardLatestAttempt'), 'confirmation awards no XP');
ok(!source.includes('recordAttempt('), 'confirmation records no completed attempt');
const confirmationBlock = source.slice(source.indexOf('function renderOrderConfirmation'), source.indexOf('play = function'));
ok(!/actual order|correct|incorrect|points earned|\+\d+/i.test(confirmationBlock), 'confirmation does not reveal outcome or points');
ok(source.includes('Entrée Round Complete') || source.includes('${escapeHtml(confirmation.category)} Round Complete'), 'category completion presentation exists');
ok(source.includes('The main courses are locked.'), 'entrée transition has Pup commentary');
ok(source.includes('Drinks are in.'), 'drink transition has Pup commentary');
ok(source.includes('Nine order predictions are locked.'), 'final transition has Pup commentary');
ok(source.includes('root.PupVoice?.speak?.(line)'), 'transition narration routes through shared Pup voice manager');
ok(source.includes('state.orderConfirmationNarratedKey'), 'transition narration prevents duplicate speech');

// Timer behavior.
ok(source.includes('startTimer(autoPlay)'), 'established timer starts once for active order screen');
ok(source.includes('autoPlay = function'), 'timer fallback is deliberately wrapped');
ok(source.includes('context.options[0]?.value'), 'timer fallback chooses a valid menu item');
ok(source.includes('confidenceKey(context.person.id, context.stage)] = 1'), 'timer fallback chooses valid confidence');
ok(source.includes('return lockOrderPrediction(true)'), 'timer expiration uses the same guarded lock path');
ok(!source.includes('setInterval('), 'Sprint layer does not create a second timer');

// Mobile and accessibility presentation.
ok(css.includes('.order-prediction-context'), 'order context has focused styling');
ok(css.includes('.order-clue-panel'), 'diner clue panel has focused styling');
ok(css.includes('.order-decision-dock'), 'order dock has focused styling');
ok(css.includes('position: sticky'), 'order dock remains accessible during investigation');
ok(css.includes('env(safe-area-inset-bottom)'), 'order dock respects mobile safe area');
ok(css.includes('grid-template-columns: repeat(5'), 'all five confidence buttons use an explicit grid');
ok(css.includes('min-height: 2.75rem') || css.includes('min-height: 2.7rem'), 'confidence buttons retain useful tap height');
ok(css.includes('[aria-pressed="true"]'), 'selected state has a structural selector');
ok(css.includes(':focus-visible'), 'interactive controls retain visible focus');
ok(css.includes('overflow-wrap: anywhere'), 'long menu names can wrap safely');
ok(css.includes('text-overflow: ellipsis'), 'long dock item names are protected');
ok(css.includes('@media (max-width: 520px)'), 'mobile layout stacks near phone widths');
ok(css.includes('@media (max-width: 360px)'), 'layout supports approximately 320-pixel screens');
ok(css.includes('grid-template-columns: repeat(5, minmax(2.2rem, 1fr))'), 'five confidence buttons remain within narrow viewport');
ok(css.includes('@media (prefers-reduced-motion: reduce)'), 'order flow respects reduced motion');

// Regression protections.
ok(restaurantDockSource.includes('restaurant-decision-dock'), 'restaurant decision dock remains integrated');
ok(restaurantDockSource.includes('dock.insertBefore(confidenceBox, lockButton)'), 'restaurant confidence remains beside restaurant Lock');
ok(restaurantFlowSource.includes('if (state.restaurantRevealLocked) return false'), 'cinematic restaurant reveal remains idempotent');
ok(restaurantFlowSource.includes('${pointsEarned} / ${points.restaurant}'), 'restaurant reveal still shows 120 or 0 out of 120');
ok(restaurantFlowSource.includes('Continue to Order Predictions'), 'restaurant-to-order transition remains explicit');
ok(finalRevealSource.includes('revealResultsData()'), 'Final Reveal remains authoritative for order outcomes');
ok(missionReportSource.includes('buildMissionReportData'), 'Mission Report remains integrated');
ok(progressionSource.includes('awardedAttempts'), 'progression duplicate-XP protection remains intact');
ok(leaderboardSource.includes('BiteBuddyProgression'), 'leaderboard local row still uses real progression');
ok(leaderboardSource.includes('Prototype preview:'), 'simulated leaderboard disclosure remains visible');
ok(variantsSource.includes('Pup Voice Studio'), 'Pup Voice Studio remains integrated');
ok(variantsSource.includes('id: "A", title: "The Great Sushi Debate"'), 'Variant A remains available');
ok(variantsSource.includes('id: "B", title: "The Harbor Table"'), 'Variant B remains available');
ok(variantsSource.includes('id: "C", title: "The Garden Celebration"'), 'Variant C remains available');
ok(/const points = \{ restaurant: 120, meal: 30, drink: 20, dessert: 10 \}/.test(appSource), 'authoritative scoring constants remain unchanged');
equal(120 + (30 + 20 + 10) * 3, 300, 'total possible score remains 300');

// Release and workflow integration.
const releaseSandbox = { window: { document: { title: '', body: { classList: { add() {} } }, querySelector() { return null; }, querySelectorAll() { return []; } } } };
vm.runInNewContext(releaseSource, releaseSandbox, { filename: 'release.js' });
const releaseVersion = releaseSandbox.window.BiteBuddyRelease.version;
ok(require('./version-helpers.cjs').isVersionAtLeast(releaseVersion, 'v0.4.4.3'), 'current release is Sprint 4.4.3 or later');
ok(typeof releaseSandbox.window.BiteBuddyRelease.releaseName === 'string' && releaseSandbox.window.BiteBuddyRelease.releaseName.length > 0, 'current release name is present');
ok(html.includes(`<title>Rate My Bites — Bite Buddy League ${releaseVersion}</title>`), 'browser fallback title is current');
ok(html.indexOf('sprint443.css') > html.indexOf('sprint442.css'), 'Sprint 4.4.3 CSS loads after Sprint 4.4.2');
ok(html.indexOf('sprint443.js') > html.indexOf('sprint442.js'), 'Sprint 4.4.3 JavaScript loads after Sprint 4.4.2');
ok(workflowSource.includes('node tests/sprint443ReleaseNeutral.test.cjs'), 'Static validation runs Sprint 4.4.3 tests');
ok(workflowSource.includes('node tests/sprint442.test.cjs'), 'Sprint 4.4.2 tests remain enabled');
ok(workflowSource.includes('node tests/sprint441.test.cjs'), 'Sprint 4.4.1 tests remain enabled');
ok(workflowSource.includes('node tests/progression.test.cjs'), 'Detective Progression tests remain enabled');

console.log(`Sprint 4.4.3 tests passed: ${assertions} assertions`);
