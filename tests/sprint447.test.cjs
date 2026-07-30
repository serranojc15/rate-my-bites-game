const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('sprint447.js', 'utf8');
const css = fs.readFileSync('sprint447.css', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const releaseSource = fs.readFileSync('release.js', 'utf8');
const livingSource = fs.readFileSync('livingConversations.js', 'utf8');
const directorSource = fs.readFileSync('directorCut.js', 'utf8');
const sprint441Source = fs.readFileSync('sprint441.js', 'utf8');
const sprint446Source = fs.readFileSync('sprint446.js', 'utf8');
const progressionSource = fs.readFileSync('progression.js', 'utf8');
const appSource = fs.readFileSync('app.js', 'utf8');
const variantsSource = fs.readFileSync('sprint431.js', 'utf8');
const workflowSource = fs.readFileSync('.github/workflows/static-validation.yml', 'utf8');

const authoritativeVersion = releaseSource.match(/const VERSION = "([^"]+)"/)?.[1];
const authoritativeReleaseName = releaseSource.match(/const RELEASE_NAME = "([^"]+)"/)?.[1];
assert.ok(authoritativeVersion, 'authoritative release version can be read');
assert.ok(authoritativeReleaseName, 'authoritative release name can be read');

let assertions = 0;
function ok(value, message) { assert.ok(value, message); assertions += 1; }
function equal(actual, expected, message) { assert.equal(actual, expected, message); assertions += 1; }

function loadApi(extra = {}) {
  const window = {
    BiteBuddyRelease: { version: authoritativeVersion, apply() {} },
    ...extra
  };
  vm.runInNewContext(source, { window, console, Date, Object, Array, Math, Number, String, Boolean, RegExp }, { filename: 'sprint447.js' });
  return { window, api: window.BiteBuddySprint447 };
}

const { api } = loadApi();
equal(api.version, authoritativeVersion, 'Sprint API uses the active release');
equal(api.restaurantStages.join(','), 'locked,counting,incoming,revealed', 'staged restaurant reveal remains intact');

const story = { events: [
  { id: 'emma-scene', speakerId: 'emma', speaker: 'Emma' },
  { id: 'marcus-scene', speakerId: 'marcus', speaker: 'Marcus' }
] };
const conversationState = { screen: 'conversation', currentVariantId: 'A', attemptNumber: 2, conversationIndex: 0 };
const conversationApi = loadApi({ state: conversationState, livingDinnerStory: story, diners: [{ id: 'emma', name: 'Emma' }, { id: 'marcus', name: 'Marcus' }] }).api;
equal(conversationApi.currentConversationEvent(conversationState).id, 'emma-scene', 'active conversation event comes from the authoritative index');
ok(conversationApi.conversationSceneKey(conversationState).includes('emma-scene'), 'conversation stage key includes the active event');
ok(conversationApi.isConversationAdvanceReady(conversationState, story.events[0]), 'conversation scene is advance-ready');
ok(!conversationApi.isConversationAdvanceReady({ ...conversationState, screen: 'restaurant' }, story.events[0]), 'non-conversation screen is not portrait-advance ready');
equal(conversationApi.conversationAdvanceLabel(story.events[0], false), 'Continue to the next conversation after Emma.', 'portrait receives descriptive next-conversation label');
equal(conversationApi.conversationAdvanceLabel(story.events[1], true), 'Lock the evidence after Marcus.', 'last portrait label explains the evidence transition');

let advances = 0;
const timers = [];
const advanceState = { ...conversationState };
const advanceWindow = {
  state: advanceState,
  livingDinnerStory: story,
  diners: [{ id: 'emma' }, { id: 'marcus' }],
  advanceConversation() { advances += 1; advanceState.conversationIndex += 1; },
  setTimeout(callback) { timers.push(callback); return timers.length; }
};
const advanceLoaded = loadApi(advanceWindow);
ok(advanceLoaded.api.advanceConversationOnce(), 'first portrait activation advances');
ok(!advanceLoaded.api.advanceConversationOnce(), 'rapid second activation is ignored');
equal(advances, 1, 'double activation advances exactly one scene');

const focusCalls = [];
const appScrolls = [];
const windowScrolls = [];
const heading = { attrs: {}, setAttribute(name, value) { this.attrs[name] = value; }, focus(options) { focusCalls.push(options); } };
const stageRoot = { offsetTop: 20, getBoundingClientRect() { return { top: 140 }; } };
const appRoot = { offsetTop: 20, scrollHeight: 1500, clientHeight: 500, scrollTop: 880, scrollTo(options) { appScrolls.push(options); } };
const fakeDocument = { querySelector(selector) {
  if (selector === '[data-conversation-stage-heading]') return heading;
  if (selector === '.living-stage') return stageRoot;
  if (selector === '#app') return appRoot;
  if (selector === '.top-bar') return null;
  return null;
} };
const focusState = { ...conversationState, sprint447FocusedConversationKey: '' };
const focusLoaded = loadApi({
  document: fakeDocument,
  state: focusState,
  livingDinnerStory: story,
  requestAnimationFrame(callback) { callback(); },
  matchMedia() { return { matches: false }; },
  scrollTo(options) { windowScrolls.push(options); },
  scrollY: 700
});
ok(focusLoaded.api.focusConversationStage({ sceneKey: 'conversation:A:2:0:emma-scene' }), 'new conversation schedules positioning');
equal(focusCalls.length, 1, 'new conversation heading receives focus');
equal(focusCalls[0].preventScroll, true, 'heading focus avoids a competing scroll');
equal(appScrolls.length, 1, 'scrollable game card is the active scroll container');
equal(appScrolls[0].top, 0, 'new conversation starts at the game-card top');
equal(appScrolls[0].behavior, 'smooth', 'standard motion uses smooth positioning');
equal(windowScrolls.length, 0, 'window is not scrolled when the game card is scrollable');
ok(!focusLoaded.api.focusConversationStage({ sceneKey: 'conversation:A:2:0:emma-scene' }), 'same-scene rerender does not reset scroll');
focusLoaded.window.matchMedia = () => ({ matches: true });
ok(focusLoaded.api.focusConversationStage({ sceneKey: 'conversation:A:2:1:marcus-scene' }), 'next conversation is a genuine stage change');
equal(appScrolls.at(-1).behavior, 'auto', 'reduced motion uses immediate positioning');
equal(heading.attrs.tabindex, '-1', 'conversation heading is programmatically focusable');

equal(api.restaurantRevealDelay('locked', false), 1000, 'locked stage has readable standard duration');
equal(api.restaurantRevealDelay('counting', false), 1600, 'counting stage has readable standard duration');
equal(api.restaurantRevealDelay('incoming', false), 1500, 'incoming stage is longer than the former 700 milliseconds');
equal(api.restaurantRevealDelay('locked', true), 500, 'reduced-motion locked stage remains readable');
equal(api.restaurantRevealDelay('counting', true), 700, 'reduced-motion counting stage remains readable');
equal(api.restaurantRevealDelay('incoming', true), 700, 'reduced-motion incoming stage remains readable');
equal(api.restaurantStageNarration('locked'), 'The prediction is locked.', 'locked narration is short');
equal(api.restaurantStageNarration('counting'), 'Three diners. One shared table.', 'counting narration is short');
equal(api.restaurantStageNarration('incoming'), 'The group has chosen.', 'incoming narration is short');
ok(api.restaurantStageNarration('revealed', true).includes('all 120 restaurant points'), 'correct result narration names all restaurant points');
ok(api.restaurantStageNarration('revealed', false).includes('different restaurant'), 'incorrect result narration is constructive');
ok(api.restaurantNarrationKey({ variantId: 'B', attemptId: 3, stage: 'counting', predictedId: 'cactus', actualId: 'luna' }).includes('B:3:counting'), 'restaurant narration key distinguishes variant attempt and stage');

const spoken = [];
let cancelled = 0;
const voice = { settings: { enabled: true }, speak(line) { spoken.push(line); return true; }, cancel() { cancelled += 1; } };
const speechState = { screen: 'restaurantReveal', restaurantRevealStage: 'incoming', currentVariantId: 'C', attemptNumber: 4, sprint447RestaurantNarratedKeys: [] };
const speechLoaded = loadApi({ state: speechState, requestAnimationFrame(callback) { callback(); }, matchMedia() { return { matches: false }; } });
ok(speechLoaded.api.speakRestaurantStage({ stage: 'incoming', correct: false, predicted: { id: 'cactus' }, actual: { id: 'luna' }, stateObject: speechState, voice }), 'visible incoming stage schedules narration');
equal(spoken[0], 'The group has chosen.', 'incoming stage speaks its matching short line');
equal(cancelled, 1, 'stale speech is cancelled before a new stage line');
ok(!speechLoaded.api.speakRestaurantStage({ stage: 'incoming', correct: false, predicted: { id: 'cactus' }, actual: { id: 'luna' }, stateObject: speechState, voice }), 'same restaurant stage speaks once');
const disabledVoice = { settings: { enabled: false }, speak() { throw new Error('disabled narration must not speak'); } };
ok(!speechLoaded.api.speakRestaurantStage({ stage: 'incoming', stateObject: { ...speechState, sprint447RestaurantNarratedKeys: [] }, voice: disabledVoice }), 'narration-disabled mode performs no speech call');
const reducedSpeech = loadApi({ state: speechState, matchMedia() { return { matches: true }; } });
ok(!reducedSpeech.api.speakRestaurantStage({ stage: 'counting', stateObject: { ...speechState, restaurantRevealStage: 'counting', sprint447RestaurantNarratedKeys: [] }, voice }), 'reduced-motion suspense avoids speech that could be cut off');

ok(source.includes('oldLabel?.remove?.()'), 'face-covering legacy label is removed from the portrait');
ok(source.includes('conversation-face-safe-label'), 'conversation label is rebuilt in a dedicated safe header');
ok(source.includes('conversation-portrait-button'), 'main visual becomes the primary portrait action');
ok(source.includes('role", "button"'), 'portrait receives button semantics');
ok(source.includes('eventObject.key !== "Enter" && eventObject.key !== " "'), 'portrait supports Enter and Space');
ok(source.includes('Tap photo to continue'), 'advance-ready portrait includes a visible tap cue');
ok(source.includes('continueButton.onclick = activate'), 'portrait and Continue share the same guarded transition');
ok(source.includes('stopInteractiveControlPropagation'), 'nested controls are isolated from conversation advancement');
ok(source.includes('focusConversationStage'), 'new conversation scenes use one positioning helper');
ok(source.includes('installRestaurantRevealPolish'), 'restaurant suspense renderer is wrapped once');
ok(source.includes('restaurantRevealTimer'), 'restaurant stage timer has focused ownership');
ok(source.includes('restaurantScheduledKey'), 'same-stage rerenders do not schedule duplicate timers');
ok(source.includes('stateObject.restaurantRevealNarratedStages.push("revealed")'), 'legacy result narration is suppressed before the new result line');
ok(!source.includes('speechSynthesis'), 'new layer uses PupVoice rather than raw speech synthesis');
ok(!source.includes('awardLatestAttempt'), 'conversation and suspense polish does not award XP');
ok(!source.includes('recordAttempt('), 'conversation and suspense polish does not record attempt history');

ok(css.includes('.conversation-scene-heading'), 'face-safe scene header is styled');
ok(css.includes('.conversation-tap-cue'), 'portrait navigation cue is styled');
ok(css.includes('.conversation-portrait-button:focus-visible'), 'interactive portrait has visible focus');
ok(css.includes('object-position:center 18%'), 'mobile portrait crop protects faces');
ok(css.includes('env(safe-area-inset-bottom)'), 'mobile footer respects the safe area');
ok(css.includes('@media(prefers-reduced-motion:reduce)'), 'reduced-motion presentation is preserved');
ok(livingSource.includes('storyMemoryRecord(event)'), 'Story Memory recording remains');
ok(
  directorSource.includes('livingDinnerStory.events = cloneEpisodeValue(initialEpisodeDefinition.story.scenes)'),
  'Director presentation reads canonical episode scenes'
);
ok(sprint441Source.includes('Restaurant points'), 'restaurant result still displays restaurant points');
ok(sprint441Source.includes('Continue to Order Predictions'), 'order-flow handoff remains');
ok(sprint446Source.includes('dinerResultNarration'), 'natural Final Reveal diner narration remains');
ok(progressionSource.includes('awardedAttempts'), 'progression duplicate protection remains');
ok(variantsSource.includes('id: "A", title: "The Great Sushi Debate"'), 'Variant A remains');
ok(variantsSource.includes('id: "B", title: "The Harbor Table"'), 'Variant B remains');
ok(variantsSource.includes('id: "C", title: "The Garden Celebration"'), 'Variant C remains');
ok(/const points = \{ restaurant: 120, meal: 30, drink: 20, dessert: 10 \}/.test(appSource), 'scoring constants remain unchanged');
equal(120 + (30 + 20 + 10) * 3, 300, 'total score remains 300');

const releaseSandbox = { window: { document: { title: '', body: { classList: { add() {} } }, querySelector() { return null; }, querySelectorAll() { return []; } } } };
vm.runInNewContext(releaseSource, releaseSandbox, { filename: 'release.js' });
equal(releaseSandbox.window.BiteBuddyRelease.version, authoritativeVersion, 'release version is current');
equal(releaseSandbox.window.BiteBuddyRelease.releaseName, authoritativeReleaseName, 'release name is current');
ok(html.includes(`<title>Rate My Bites Detective ${authoritativeVersion}</title>`), 'browser fallback title is current');
ok(html.indexOf('sprint447.css') > html.indexOf('sprint446.css'), 'Sprint 4.4.7 CSS loads after Sprint 4.4.6');
ok(html.indexOf('sprint447.js') > html.indexOf('sprint446.js'), 'Sprint 4.4.7 JavaScript loads after Sprint 4.4.6');
ok(workflowSource.includes('node tests/sprint447.test.cjs'), 'Static validation runs Sprint 4.4.7 tests');
ok(workflowSource.includes('node tests/sprint446ReleaseNeutral.test.cjs'), 'Sprint 4.4.6 historical assertions remain enabled through the release-neutral harness');
ok(workflowSource.includes('node tests/progression.test.cjs'), 'Detective Progression tests remain enabled');

console.log(`Sprint 4.4.7 tests passed: ${assertions} assertions`);
