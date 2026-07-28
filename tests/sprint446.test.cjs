const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('sprint446.js', 'utf8');
const css = fs.readFileSync('sprint446.css', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const releaseSource = fs.readFileSync('release.js', 'utf8');
const sprint444Source = fs.readFileSync('sprint444.js', 'utf8');
const sprint445Source = fs.readFileSync('sprint445.js', 'utf8');
const progressionSource = fs.readFileSync('progression.js', 'utf8');
const appSource = fs.readFileSync('app.js', 'utf8');
const variantsSource = fs.readFileSync('sprint431.js', 'utf8');
const workflowSource = fs.readFileSync('.github/workflows/static-validation.yml', 'utf8');

let assertions = 0;
function ok(value, message) { assert.ok(value, message); assertions += 1; }
function equal(actual, expected, message) { assert.equal(actual, expected, message); assertions += 1; }

function loadApi(extra = {}) {
  const window = {
    BiteBuddyRelease: { version: 'v0.4.4.6', apply() {} },
    ...extra
  };
  vm.runInNewContext(source, { window, console, Proxy, Object, Array, Math, Number, String, Boolean, RegExp }, { filename: 'sprint446.js' });
  return { window, api: window.BiteBuddySprint446 };
}

const { api } = loadApi();
equal(api.version, 'v0.4.4.6', 'Sprint API uses the active release');

// Natural diner narration.
equal(api.dinerResultNarration({ dinerName: 'Emma', correctCount: 3, earned: 60, possible: 60 }), 'You read Emma perfectly and earned all 60 points.', 'perfect result uses natural perfect-read wording');
equal(api.dinerResultNarration({ dinerName: 'Sophie', correctCount: 2, earned: 40, possible: 60 }), 'You correctly predicted two of Sophie’s three choices and earned 40 out of 60 points.', 'two-correct result uses active name and actual subtotal');
equal(api.dinerResultNarration({ dinerName: 'Maya', correctCount: 1, earned: 10, possible: 60 }), 'You correctly predicted one of Maya’s three choices and earned 10 out of 60 points.', 'one-correct result uses active name and actual subtotal');
equal(api.dinerResultNarration({ dinerName: 'Daniel', correctCount: 0, earned: 0, possible: 60 }), 'Daniel’s order went in a different direction this time. Let’s look at which clues mattered most.', 'zero-correct result is constructive');
ok(!api.dinerResultNarration({ dinerName: 'Rachel', correctCount: 2, earned: 50 }).includes('meal'), 'diner narration refers to choices or order rather than only meal');
ok(api.dinerResultNarration({ dinerName: 'Noah', correctCount: 3, earned: 60 }).includes('Noah'), 'Variant C diner names work');
ok(api.dinerResultNarration({ dinerName: 'Liam', correctCount: 1, earned: 30 }).includes('one of Liam’s three choices'), 'one-choice grammar is correct');
equal(api.dinerNarrationKey({ variantId: 'B', attemptId: 2, dinerId: 'sophie' }), 'B:2:diner:sophie:result', 'narration key distinguishes variant attempt diner and phase');
ok(api.isRevealStageChange('diner-emma', 'diner-marcus'), 'different diner is a true stage change');
ok(!api.isRevealStageChange('diner-emma', 'diner-emma'), 'same stage is not treated as navigation');

// Scroll container, focus, and reduced motion.
const focusCalls = [];
const appScrolls = [];
const windowScrolls = [];
const heading = {
  attrs: {},
  setAttribute(name, value) { this.attrs[name] = value; },
  focus(options) { focusCalls.push(options); }
};
const stageRoot = {
  offsetTop: 0,
  attrs: {},
  setAttribute(name, value) { this.attrs[name] = value; },
  getBoundingClientRect() { return { top: 120 }; }
};
const appRoot = {
  scrollHeight: 1200,
  clientHeight: 500,
  scrollTop: 900,
  scrollTo(options) { appScrolls.push(options); }
};
const fakeDocument = {
  querySelector(selector) {
    if (selector === '[data-final-reveal-heading]') return heading;
    if (selector === '.final-reveal-444') return stageRoot;
    if (selector === '#app') return appRoot;
    if (selector === '.top-bar') return null;
    return null;
  }
};
const stageState = { screen: 'results', currentVariantId: 'A', attemptNumber: 1, finalRevealPhase: 'diner', finalRevealPersonIndex: 0 };
const focusLoaded = loadApi({
  document: fakeDocument,
  state: stageState,
  diners: [{ id: 'emma' }],
  requestAnimationFrame(callback) { callback(); },
  matchMedia() { return { matches: false }; },
  scrollTo(options) { windowScrolls.push(options); },
  scrollY: 600
});
ok(focusLoaded.api.focusNewRevealStage({ stageKey: 'results:A:1:diner:emma' }), 'new diner schedules stage navigation');
equal(focusCalls.length, 1, 'new stage heading receives focus once');
equal(focusCalls[0].preventScroll, true, 'heading focus prevents a competing browser scroll');
equal(appScrolls.length, 1, 'scrollable app card is used as the active scroll container');
equal(appScrolls[0].top, 0, 'new reveal stage starts at the top of the app card');
equal(appScrolls[0].behavior, 'smooth', 'standard motion uses smooth scrolling');
equal(windowScrolls.length, 0, 'window is not scrolled when the app card is the active container');
ok(!focusLoaded.api.focusNewRevealStage({ stageKey: 'results:A:1:diner:emma' }), 'same-stage rerender does not reset scroll');
equal(appScrolls.length, 1, 'same-stage rerender produces no second scroll');

focusLoaded.window.matchMedia = () => ({ matches: true });
ok(focusLoaded.api.focusNewRevealStage({ stageKey: 'results:A:1:final' }), 'final score is a new stage');
equal(appScrolls.at(-1).behavior, 'auto', 'reduced motion uses immediate scrolling');
equal(heading.attrs.tabindex, '-1', 'stage heading is programmatically focusable');
ok('data-reveal-stage-heading' in heading.attrs, 'stage heading receives deliberate navigation marker');
ok('data-reveal-stage-root' in stageRoot.attrs, 'stage root receives deliberate navigation marker');

const missing = loadApi({ document: { querySelector() { return null; } }, state: stageState, requestAnimationFrame(callback) { callback(); } });
ok(missing.api.focusNewRevealStage({ stageKey: 'missing-stage' }), 'missing heading is scheduled safely');

// Narration timing, duplicate prevention, and voice settings.
const spoken = [];
let cancelled = 0;
const voice = {
  settings: { enabled: true },
  speak(line) { spoken.push(line); return true; },
  cancel() { cancelled += 1; }
};
const narrationState = {
  currentVariantId: 'B', attemptNumber: 2, finalRevealPhase: 'diner', finalRevealPersonIndex: 0,
  finalRevealShowAll: false, finalRevealNaturalNarratedKeys: []
};
const result = {
  person: { id: 'sophie', name: 'Sophie' }, pointsEarned: 40, pointsPossible: 60,
  answers: [{ correct: true }, { correct: true }, { correct: false }]
};
const narrationLoaded = loadApi({ requestAnimationFrame(callback) { callback(); } });
ok(narrationLoaded.api.speakDinerResult({ result, stateObject: narrationState, voice }), 'visible diner result schedules natural narration');
equal(spoken[0], 'You correctly predicted two of Sophie’s three choices and earned 40 out of 60 points.', 'spoken line uses active result data');
equal(cancelled, 1, 'stale speech is cancelled before the new diner line');
ok(!narrationLoaded.api.speakDinerResult({ result, stateObject: narrationState, voice }), 'same diner result is spoken once');
equal(spoken.length, 1, 'rerender does not duplicate narration');

const disabledVoice = { settings: { enabled: false }, speak() { throw new Error('disabled narration must not speak'); } };
ok(!narrationLoaded.api.speakDinerResult({ result, stateObject: { ...narrationState, finalRevealNaturalNarratedKeys: [] }, voice: disabledVoice }), 'narration-disabled mode does not invoke speak');
ok(!narrationLoaded.api.speakDinerResult({ result, stateObject: { ...narrationState, finalRevealPhase: 'review', finalRevealNaturalNarratedKeys: [] }, voice }), 'review mode does not replay diner narration');
ok(!narrationLoaded.api.speakDinerResult({ result, stateObject: { ...narrationState, finalRevealShowAll: true, finalRevealNaturalNarratedKeys: [] }, voice }), 'Reveal All does not queue overlapping diner narration');
ok(!narrationLoaded.api.speakDinerResult({ result, stateObject: narrationState, voice: null }), 'missing PupVoice fails safely');

const queued = [];
const delayedVoice = { settings: { enabled: true }, speak(line) { spoken.push(line); return true; }, cancel() {} };
const delayedState = { ...narrationState, currentVariantId: 'C', attemptNumber: 3, finalRevealNaturalNarratedKeys: [] };
const delayed = loadApi({ requestAnimationFrame(callback) { queued.push(callback); } });
ok(delayed.api.speakDinerResult({ result: { ...result, person: { id: 'maya', name: 'Maya' } }, stateObject: delayedState, voice: delayedVoice }), 'narration waits for the rendered frame');
delayedState.finalRevealPhase = 'final';
queued.shift()();
ok(!spoken.some(line => line.includes('Maya')), 'stale diner narration is abandoned after rapid navigation');

// Runtime integration and safety.
ok(source.includes('installRevealNavigationPolish'), 'focused runtime installer exists');
ok(source.includes('baseResults446'), 'active Final Reveal renderer is wrapped once');
ok(source.includes('baseRenderMissionReport446'), 'Mission Report handoff receives stage positioning');
ok(source.includes('createLegacyNarrationProxy'), 'legacy mechanical diner narration is intercepted');
ok(source.includes("/^Let['’]s see how well you read"), 'only the mechanical legacy line is suppressed');
ok(source.includes('focusNewRevealStage()'), 'Final Reveal stage changes use the shared navigation helper');
ok(source.includes('heading.focus?.({ preventScroll: true })'), 'focus avoids a second unwanted scroll');
ok(source.includes('appRoot.scrollTo({ top, behavior: motion })'), 'scrollable game card is deliberately reset');
ok(source.includes('prefersReducedMotion() ? "auto" : "smooth"'), 'scroll behavior respects reduced motion');
ok(source.includes('stateObject.finalRevealNaturalNarratedKeys'), 'natural narration has a persistent duplicate guard');
ok(source.includes('voice.settings?.enabled === false'), 'narration-disabled guard occurs before speak');
ok(!source.includes('speechSynthesis'), 'new layer uses PupVoice rather than raw speech synthesis');
ok(!source.includes('awardLatestAttempt'), 'reveal polish does not award XP');
ok(!source.includes('recordAttempt('), 'reveal polish does not record attempt history');
ok(sprint444Source.includes('Reveal All Answers'), 'Reveal All remains available');
ok(sprint444Source.includes('Skip Animations'), 'Skip Animations remains available');
ok(sprint444Source.includes('Review Every Answer'), 'Review Every Answer remains available');
ok(sprint444Source.includes('No restaurant vote will be replayed.'), 'Final Reveal continuity remains');
ok(sprint445Source.includes('MISSION COMPLETE'), 'Mission Report progression payoff remains');
ok(progressionSource.includes('awardedAttempts'), 'progression duplicate protection remains');
ok(variantsSource.includes('id: "A", title: "The Great Sushi Debate"'), 'Variant A remains available');
ok(variantsSource.includes('id: "B", title: "The Harbor Table"'), 'Variant B remains available');
ok(variantsSource.includes('id: "C", title: "The Garden Celebration"'), 'Variant C remains available');
ok(/const points = \{ restaurant: 120, meal: 30, drink: 20, dessert: 10 \}/.test(appSource), 'scoring constants remain unchanged');
equal(120 + (30 + 20 + 10) * 3, 300, 'total possible score remains 300');

// CSS, release, loading order, and workflow.
ok(css.includes('scroll-margin-top'), 'stage headings have mobile-safe scroll margin');
ok(css.includes('[data-reveal-stage-heading]:focus'), 'programmatic stage focus remains visible');
ok(css.includes('@media (prefers-reduced-motion: reduce)'), 'reduced-motion CSS is present');
const releaseSandbox = { window: { document: { title: '', body: { classList: { add() {} } }, querySelector() { return null; }, querySelectorAll() { return []; } } } };
vm.runInNewContext(releaseSource, releaseSandbox, { filename: 'release.js' });
const activeRelease = releaseSandbox.window.BiteBuddyRelease;
ok(require('./version-helpers.cjs').isVersionAtLeast(activeRelease.version, 'v0.4.4.6'), 'release version is Sprint 4.4.6 or later');
ok(typeof activeRelease.releaseName === 'string' && activeRelease.releaseName.length > 0, 'release name is current');
ok(html.includes(`<title>Rate My Bites — Bite Buddy League ${activeRelease.version}</title>`), 'browser fallback title is current');
ok(html.indexOf('sprint446.css') > html.indexOf('sprint445.css'), 'Sprint 4.4.6 CSS loads after Sprint 4.4.5');
ok(html.indexOf('sprint446.js') > html.indexOf('sprint445.js'), 'Sprint 4.4.6 JavaScript loads after Sprint 4.4.5');
ok(workflowSource.includes('node tests/sprint446ReleaseNeutral.test.cjs'), 'Static validation runs Sprint 4.4.6 tests');
ok(workflowSource.includes('node tests/sprint445ReleaseNeutral.test.cjs'), 'Sprint 4.4.5 tests remain enabled');
ok(workflowSource.includes('node tests/progression.test.cjs'), 'Detective Progression tests remain enabled');

console.log(`Sprint 4.4.6 tests passed: ${assertions} assertions`);
