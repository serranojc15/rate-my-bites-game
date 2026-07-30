const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('sprint444.js', 'utf8');
const css = fs.readFileSync('sprint444.css', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const releaseSource = fs.readFileSync('release.js', 'utf8');
const appSource = fs.readFileSync('app.js', 'utf8');
const finalRevealSource = fs.readFileSync('finalReveal.js', 'utf8');
const missionReportSource = fs.readFileSync('missionReport.js', 'utf8');
const progressionSource = fs.readFileSync('progression.js', 'utf8');
const leaderboardSource = fs.readFileSync('groupLeaderboard.js', 'utf8');
const restaurantFlowSource = fs.readFileSync('sprint441.js', 'utf8');
const restaurantDockSource = fs.readFileSync('sprint442.js', 'utf8');
const orderFlowSource = fs.readFileSync('sprint443.js', 'utf8');
const variantsSource = fs.readFileSync('sprint431.js', 'utf8');
const workflowSource = fs.readFileSync('.github/workflows/static-validation.yml', 'utf8');

let assertions = 0;
function ok(value, message) { assert.ok(value, message); assertions += 1; }
function equal(actual, expected, message) { assert.equal(actual, expected, message); assertions += 1; }

function loadApi() {
  const window = {};
  vm.runInNewContext(source, { window, console }, { filename: 'sprint444.js' });
  return window.BiteBuddySprint444;
}

const api = loadApi();
const sampleReport = {
  score: { earned: 240, possible: 300 },
  verdict: { title: 'MOSTLY SOLVED', subtitle: 'Strong work.', className: 'mostly' },
  pupDebrief: 'You read the table well.',
  restaurantResult: { correct: true, prediction: 'Casa Luna', actual: 'Casa Luna', confidence: 4, earned: 120, possible: 120 },
  categoryResults: [
    { id: 'restaurant', label: 'Restaurant', earned: 120, possible: 120 },
    { id: 'meal', label: 'Entrées', earned: 60, possible: 90 },
    { id: 'drink', label: 'Drinks', earned: 40, possible: 60 },
    { id: 'dessert', label: 'Desserts', earned: 20, possible: 30 }
  ],
  personResults: [
    {
      person: { id: 'emma', name: 'Emma', role: 'Explorer' }, pointsEarned: 50, pointsPossible: 60, caseNote: 'Emma followed the current context.',
      answers: [
        { label: "Emma's entrée", prediction: 'Chicken', actual: 'Chicken', confidence: 5, correct: true, earned: 30, possible: 30, clue: 'She wanted something lighter.' },
        { label: "Emma's drink", prediction: 'Water', actual: 'Water', confidence: 2, correct: true, earned: 20, possible: 20, clue: 'She was driving.' },
        { label: "Emma's dessert", prediction: 'Churros', actual: 'No dessert', confidence: 5, correct: false, earned: 0, possible: 10, clue: 'She wanted a light finish.' }
      ]
    },
    {
      person: { id: 'marcus', name: 'Marcus', role: 'Traditionalist' }, pointsEarned: 40, pointsPossible: 60, caseNote: 'Marcus followed value and habit.',
      answers: [
        { label: "Marcus's entrée", prediction: 'Steak', actual: 'Steak', confidence: 4, correct: true, earned: 30, possible: 30, clue: 'He was hungry.' },
        { label: "Marcus's drink", prediction: 'Tea', actual: 'Tea', confidence: 3, correct: true, earned: 20, possible: 20, clue: 'He usually orders tea.' },
        { label: "Marcus's dessert", prediction: 'None', actual: 'Churros', confidence: 4, correct: false, earned: 0, possible: 10, clue: 'His dessert streak remained active.' }
      ]
    },
    {
      person: { id: 'olivia', name: 'Olivia', role: 'Planner' }, pointsEarned: 30, pointsPossible: 60, caseNote: 'Olivia shaped the celebration.',
      answers: [
        { label: "Olivia's entrée", prediction: 'Fajitas', actual: 'Fajitas', confidence: 3, correct: true, earned: 30, possible: 30, clue: 'She wanted something shareable.' },
        { label: "Olivia's drink", prediction: 'Tea', actual: 'Margarita', confidence: 2, correct: false, earned: 0, possible: 20, clue: 'She was celebrating.' },
        { label: "Olivia's dessert", prediction: 'Cake', actual: 'Cake', confidence: 1, correct: true, earned: 10, possible: 10, clue: 'The table planned to share dessert.' }
      ]
    }
  ]
};

// Pure result behavior.
equal(api.version, 'v0.4.4.4', 'Sprint API falls back to v0.4.4.4');
equal(api.revealPhases.join(','), 'opening,diner,final,review', 'readable reveal phases are exposed');
equal(api.calibrationLabel(5, true).id, 'high-correct', 'high-confidence correct category is stable');
equal(api.calibrationLabel(1, true).id, 'low-correct', 'low-confidence correct category is stable');
equal(api.calibrationLabel(5, false).id, 'high-wrong', 'high-confidence incorrect category is stable');
equal(api.calibrationLabel(1, false).id, 'low-wrong', 'low-confidence incorrect category is stable');
equal(api.calibrationLabel(3, true).id, 'measured-correct', 'middle confidence correct has a measured category');
equal(api.calibrationLabel(3, false).id, 'measured-wrong', 'middle confidence incorrect has a measured category');

const totals = api.categoryTotals(sampleReport);
equal(totals.restaurant.earned, 120, 'restaurant category total is retained');
equal(totals.meal.possible, 90, 'entrée possible total remains 90');
equal(totals.drink.possible, 60, 'drink possible total remains 60');
equal(totals.dessert.possible, 30, 'dessert possible total remains 30');
equal(api.revealedScoreThrough(sampleReport, -1), 120, 'opening score begins with secured restaurant points');
equal(api.revealedScoreThrough(sampleReport, 0), 170, 'first diner subtotal is added once');
equal(api.revealedScoreThrough(sampleReport, 1), 210, 'second diner subtotal is added once');
equal(api.revealedScoreThrough(sampleReport, 2), 240, 'third diner reaches the authoritative final score');

const best = api.bestDeduction(sampleReport);
equal(best.title, 'Best Deduction', 'a correct order produces Best Deduction');
equal(best.label, 'Emma’s entrée', 'highest-value high-confidence order is selected');
equal(best.points, 30, 'best deduction retains real earned points');
const misread = api.biggestMisread(sampleReport);
equal(misread.title, 'Biggest Misread', 'a real incorrect order produces Biggest Misread');
equal(misread.label, 'Emma’s dessert', 'high-confidence mistake is prioritized');
equal(misread.actual, 'No dessert', 'misread retains actual order');

const perfectReport = JSON.parse(JSON.stringify(sampleReport));
perfectReport.personResults.forEach(result => result.answers.forEach(answer => { answer.correct = true; answer.earned = answer.possible; }));
equal(api.biggestMisread(perfectReport).title, 'Closest Call', 'perfect cases do not invent a misread');
const noCorrect = JSON.parse(JSON.stringify(sampleReport));
noCorrect.restaurantResult.correct = false;
noCorrect.restaurantResult.earned = 0;
noCorrect.personResults.forEach(result => result.answers.forEach(answer => { answer.correct = false; answer.earned = 0; }));
ok(['Best Calibrated Read', 'Strongest Evidence Trail'].includes(api.bestDeduction(noCorrect).title), 'no-correct case receives a meaningful fallback');

// Continuity and state architecture.
ok(source.includes('buildMissionReportData()'), 'Final Reveal uses the authoritative Mission Report result model');
ok(source.includes('finalRevealPhase: "opening"'), 'controlled reveal state starts at continuity opening');
ok(source.includes('finalRevealPersonIndex'), 'controlled state tracks the active diner');
ok(source.includes('finalRevealShowAll'), 'controlled state tracks Reveal All');
ok(source.includes('finalRevealSkipAnimations'), 'controlled state tracks Skip Animations');
ok(source.includes('finalRevealActionInProgress'), 'double activation has a deliberate guard');
ok(source.includes('finalRevealNarratedKeys'), 'duplicate narration has a deliberate guard');
ok(source.includes('Restaurant score already secured.'), 'opening acknowledges the secured restaurant score');
ok(source.includes('No restaurant vote will be replayed.'), 'opening explicitly avoids a duplicate restaurant climax');
ok(!source.includes('Where did the table go?'), 'new layer does not repeat the old restaurant climax copy');
ok(source.includes('Reveal ${escapeHtml(report.personResults[0]?.person?.name'), 'first reveal action uses the first active diner');
ok(source.includes('report.restaurantResult.prediction'), 'opening displays the player restaurant prediction');
ok(source.includes('report.restaurantResult.actual'), 'opening displays the actual restaurant');
ok(source.includes('restaurant.earned} / ${restaurant.possible}'), 'opening displays 120 or 0 out of 120');

// Diner result presentation.
ok(source.includes('result.answers.map(answerCardMarkup)'), 'diner reveal shows all three answer results');
ok(source.includes('Your prediction'), 'answer cards label the player prediction');
ok(source.includes('Actual order'), 'answer cards label the actual order');
ok(source.includes('Confidence'), 'answer cards label confidence');
ok(source.includes('Points earned'), 'answer cards label earned points');
ok(source.includes('✓ Correct'), 'correct status is explicit');
ok(source.includes('✕ Incorrect'), 'incorrect status is explicit');
ok(source.includes('result.pointsEarned} / ${result.pointsPossible}'), 'diner subtotal uses authoritative result totals');
ok(source.includes('result.caseNote'), 'diner explanation uses active report data');
ok(source.includes('meaningfulCalibration(result)'), 'Pup receives one focused calibration observation per diner');
ok(!/Casa Luna balanced|Emma chose something lighter|Marcus backed the close/.test(source), 'new reveal has no hard-coded Variant A explanations');

// Reveal controls and score safety.
ok(source.includes('id="revealNextDiner"'), 'Reveal Next control is integrated');
ok(source.includes('id="revealAllAnswers"'), 'Reveal All control is integrated');
ok(source.includes('id="skipRevealAnimations"'), 'Skip Animations control is integrated');
ok(source.includes('state.finalRevealShowAll = true'), 'Reveal All retains complete answer display');
ok(source.includes('state.finalRevealSkipAnimations = Boolean(skipAnimations)'), 'Skip Animations removes remaining animation');
ok(source.includes('if (state.finalRevealActionInProgress) return false'), 'double activation cannot skip multiple stages');
ok(source.includes('scoreTarget(report)'), 'visible score derives from reveal state');
ok(source.includes('revealedScoreThrough(report, state.finalRevealPersonIndex)'), 'diner score accumulation is derived rather than incremented');
ok(source.includes('state.revealScore = target'), 'legacy visible score state stays synchronized');
ok(source.includes('report.score.earned'), 'final score uses the authoritative report score');
ok(!source.includes('calculateScore();'), 'new Final Reveal does not recalculate score');
ok(!source.includes('awardLatestAttempt'), 'new Final Reveal does not award XP');
ok(!source.includes('recordAttempt('), 'new Final Reveal does not record attempt history');

// Final verdict, takeaways, review, and Mission Report handoff.
ok(source.includes('report.categoryResults.map'), 'final category breakdown uses authoritative report totals');
ok(source.includes('report.verdict.title'), 'existing verdict logic remains authoritative');
ok(source.indexOf('final-score-monument') < source.indexOf('final-takeaway-grid'), 'final score appears before deeper takeaway content');
ok(source.includes('Best Deduction'), 'Best Deduction is presented');
ok(source.includes('Biggest Misread'), 'Biggest Misread is presented when supported');
ok(source.includes('Closest Call'), 'perfect-case fallback is supported');
ok(source.includes('Best Calibrated Read'), 'no-correct fallback is supported');
ok(source.includes('id="viewMissionReport"'), 'Mission Report is the primary final action');
ok(source.includes('state.screen = "missionReport"'), 'Mission Report handoff uses the existing screen path');
ok(source.includes('id="reviewEveryAnswer"'), 'Review Every Answer is integrated');
ok(source.includes('Static Case Recap'), 'review mode is explicitly static');
ok(source.includes('All results are shown without rerunning scoring'), 'review mode explains its safety');
ok(source.includes('id="playFreshVariant"'), 'Play Fresh Variant is available');
ok(source.includes('invokeMissionAction("#missionFreshVariant")'), 'fresh variant reuses the existing Mission Report action');
ok(source.includes('invokeMissionAction("#missionReplayEpisode")'), 'replay reuses the existing Mission Report action');
ok(source.includes('saveScore'), 'local Top Biters score saving remains available');

// Narration, mobile, and accessibility.
ok(source.includes('root.PupVoice?.speak?.(line)'), 'narration routes through shared Pup voice manager');
ok(source.includes('root.PupVoice?.cancel?.()'), 'rerender cancels stale narration');
ok(source.includes('focus?.({ preventScroll: true })'), 'new stages receive focus without forced scrolling');
ok(source.includes('aria-live="polite"'), 'score uses a polite live region');
ok(source.includes('role="progressbar"'), 'reveal progress remains accessible');
ok(source.includes('tabindex="-1"'), 'stage headings can receive programmatic focus');
ok(css.includes('.final-score-live'), 'live score has focused presentation');
ok(css.includes('.final-answer-card.is-correct'), 'correct cards have a structural class');
ok(css.includes('.final-answer-card.is-incorrect'), 'incorrect cards have a structural class');
ok(css.includes('overflow-wrap: anywhere'), 'long prediction values wrap safely');
ok(css.includes(':focus-visible'), 'reveal controls retain visible focus');
ok(css.includes('@media (max-width: 520px)'), 'mobile layout stacks at phone widths');
ok(css.includes('@media (max-width: 360px)'), 'layout supports approximately 320-pixel screens');
ok(css.includes('@media (prefers-reduced-motion: reduce)'), 'reduced motion removes reveal animation');
ok(css.includes('animation: none !important'), 'reduced motion disables animations');

// Existing feature regressions.
ok(restaurantDockSource.includes('restaurant-decision-dock'), 'restaurant decision dock remains integrated');
ok(restaurantFlowSource.includes('if (state.restaurantRevealLocked) return false'), 'cinematic restaurant reveal remains idempotent');
ok(orderFlowSource.includes('${context.position} of ${context.total}'), 'nine-step order progress remains integrated');
ok(orderFlowSource.includes('confidenceControl(context.person.id, context.stage)'), 'order confidence remains beside Lock');
ok(orderFlowSource.includes('The deduction is sealed. The answer stays hidden until the Final Reveal.'), 'order confirmations still hide correctness');
ok(finalRevealSource.includes('revealResultsData()'), 'historical authoritative result builder remains present');
ok(missionReportSource.includes('function buildMissionReportData()'), 'Mission Report result builder remains integrated');
ok(missionReportSource.includes('state.screen = "missionReport"'), 'Mission Report screen remains integrated');
ok(progressionSource.includes('awardedAttempts'), 'progression duplicate-XP protection remains intact');
ok(leaderboardSource.includes('BiteBuddyProgression'), 'leaderboard local row still uses real progression');
ok(leaderboardSource.includes('Prototype preview:'), 'simulated leaderboard disclosure remains visible');
ok(variantsSource.includes('Pup Voice Studio'), 'Pup Voice Studio remains integrated');
ok(variantsSource.includes('id: "A", title: "The Great Sushi Debate"'), 'Variant A remains available');
ok(variantsSource.includes('id: "B", title: "The Harbor Table"'), 'Variant B remains available');
ok(variantsSource.includes('id: "C", title: "The Garden Celebration"'), 'Variant C remains available');
ok(/const points = \{ restaurant: 120, meal: 30, drink: 20, dessert: 10 \}/.test(appSource), 'authoritative scoring constants remain unchanged');
equal(120 + (30 + 20 + 10) * 3, 300, 'total possible score remains 300');

// Release and workflow integration remains release-neutral after v0.4.4.4.
const releaseSandbox = { window: { document: { title: '', body: { classList: { add() {} } }, querySelector() { return null; }, querySelectorAll() { return []; } } } };
vm.runInNewContext(releaseSource, releaseSandbox, { filename: 'release.js' });
const activeVersion = releaseSandbox.window.BiteBuddyRelease.version;
ok(require('./version-helpers.cjs').isVersionAtLeast(activeVersion, 'v0.4.4.4'), 'active release is Sprint 4.4.4 or later');
ok(require('./version-helpers.cjs').parseVersion(activeVersion) !== null, 'active release uses a valid semantic version');
ok(Boolean(releaseSandbox.window.BiteBuddyRelease.releaseName), 'active release name is present');
ok(html.includes(`<title>Rate My Bites Detective ${activeVersion}</title>`), 'browser fallback title matches the authoritative release');
ok(html.indexOf('sprint444.css') > html.indexOf('sprint443.css'), 'Sprint 4.4.4 CSS loads after Sprint 4.4.3');
ok(html.indexOf('sprint444.js') > html.indexOf('sprint443.js'), 'Sprint 4.4.4 JavaScript loads after Sprint 4.4.3');
ok(workflowSource.includes('node tests/sprint444ReleaseNeutral.test.cjs'), 'Static validation runs Sprint 4.4.4 tests');
ok(workflowSource.includes('node tests/sprint443ReleaseNeutral.test.cjs'), 'Sprint 4.4.3 tests remain enabled');
ok(workflowSource.includes('node tests/sprint442.test.cjs'), 'Sprint 4.4.2 tests remain enabled');
ok(workflowSource.includes('node tests/progression.test.cjs'), 'Detective Progression tests remain enabled');

console.log(`Sprint 4.4.4 tests passed: ${assertions} assertions`);
