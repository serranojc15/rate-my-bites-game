const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const releaseSource = fs.readFileSync('release.js', 'utf8');
const polish = fs.readFileSync('sprint432.js', 'utf8');
const css = fs.readFileSync('sprint432.css', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const app = fs.readFileSync('app.js', 'utf8');
const variants = fs.readFileSync('sprint431.js', 'utf8');
const variantPolish = fs.readFileSync('sprint431Polish.js', 'utf8');
const mission = fs.readFileSync('missionReport.js', 'utf8');
const finalReveal = fs.readFileSync('finalReveal.js', 'utf8');

let assertions = 0;
function ok(value, message) { assert.ok(value, message); assertions += 1; }
function equal(actual, expected, message) { assert.equal(actual, expected, message); assertions += 1; }
function contains(source, value, message) { ok(source.includes(value), message); }

function element(text = '') {
  return {
    textContent: text,
    innerHTML: '',
    attributes: {},
    setAttribute(name, value) { this.attributes[name] = value; },
    querySelector() { return null; }
  };
}

const badge = element();
const finalVersion = element();
const directorVersion = element();
directorVersion.querySelector = selector => selector === 'span' ? element("Director's Cut") : null;
const missionVersion = element();
const heroVersion = element();
const historyVersion = element();
const livingVersion = element();
const finalContainer = element();
const directorContainer = element();
directorContainer.querySelector = selector => selector === 'span' ? element("Director's Cut") : null;
const selectorMap = new Map([
  ['.final-reveal-version strong', [finalVersion]],
  ['.director-version strong', [directorVersion]],
  ['.mission-classification strong', [missionVersion]],
  ['.hero > .eyebrow', [heroVersion]],
  ['.hall .eyebrow', [historyVersion]],
  ['.living-toolbar > div:first-child > span', [livingVersion]],
  ['.final-reveal-version', [finalContainer]],
  ['.director-version', [directorContainer]]
]);
const bodyClasses = new Set();
const document = {
  title: '',
  body: { classList: { add(value) { bodyClasses.add(value); } } },
  querySelector(selector) { return selector === '#directorCutBuild' ? badge : null; },
  querySelectorAll(selector) { return selectorMap.get(selector) || []; }
};
const sandbox = { window: { document } };
vm.runInNewContext(releaseSource, sandbox, { filename: 'release.js' });
const release = sandbox.window.BiteBuddyRelease;

// Authoritative release identity — behavior remains valid for later releases.
ok(/^v\d+\.\d+\.\d+(?:\.\d+)?$/.test(release.version), 'authoritative release exposes a valid current version');
ok(typeof release.releaseName === 'string' && release.releaseName.length > 0, 'release name is exposed');
equal(release.displayLabel, `Rate My Bites Detective · ${release.version}`, 'display label follows current release');
equal(release.apply(), true, 'release identity applies successfully');
equal(document.title, `Rate My Bites Detective ${release.version}`, 'browser title uses current release');
ok(badge.innerHTML.includes(release.version), 'floating badge uses current release');
equal(badge.attributes['aria-hidden'], 'true', 'decorative floating badge is hidden from screen readers');
equal(finalVersion.textContent, release.version, 'Final Reveal version is current');
equal(directorVersion.textContent, release.version, 'Director presentation version is current');
equal(missionVersion.textContent, release.version, 'Mission Report version is current');
equal(heroVersion.textContent, release.displayLabel, 'welcome release label is current');
equal(historyVersion.textContent, release.displayLabel, 'League History release label is current');
equal(livingVersion.textContent, `${release.version} · Living Conversations`, 'Living Conversations release label is current');
ok(bodyClasses.has('release-ready'), 'release-ready state is installed');
equal(release.apply(), true, 'repeated release installation is idempotent');
equal(badge.innerHTML, `<span>Rate My Bites Detective</span><strong>${release.version}</strong>`, 'idempotent install does not duplicate badge content');

// Script order and loading presentation.
ok(html.includes(`<title>Rate My Bites Detective ${release.version}</title>`), 'document fallback title is current');
ok(html.indexOf('release.js') < html.indexOf('app.js'), 'release identity loads before feature modules');
ok(html.indexOf('sprint432.js') > html.indexOf('sprint431Polish.js'), 'Sprint 4.3.2 protection loads after Sprint 4.3.1');
ok(html.includes('sprint432.css') && html.includes('sprint432.js'), 'Sprint 4.3.2 assets remain integrated');
ok(html.includes('Preparing tonight’s case'), 'minimal branded loading state is present');
ok(!html.includes('MISSION_REPORT_VERSION'), 'index does not bind active release UI to Mission Report metadata');
contains(css, 'visibility: hidden', 'stale floating badge is hidden before current identity is ready');
contains(css, 'body.release-ready .director-build-badge', 'floating badge appears only after release installation');
contains(css, 'max-height: calc(100dvh - 1rem)', 'Voice Studio has narrow mobile viewport protection');

// Legacy overwrite protection while historical metadata remains honest.
contains(mission, 'const MISSION_REPORT_VERSION = "v0.4.3.0"', 'Mission Report retains historical module metadata');
contains(finalReveal, 'const FINAL_REVEAL_VERSION = "v0.4.2.4"', 'Final Reveal retains historical module metadata');
contains(polish, 'missionReportInstallVersion = applyIdentity', 'Mission Report cannot leave a stale active release');
contains(polish, 'installFinalRevealVersion = applyIdentity', 'Final Reveal cannot leave a stale active release');
contains(polish, 'finalRevealVersionMarkup = function', 'Final Reveal markup is supplied by current release');
contains(polish, 'directorCutVersionMarkup = function', 'Director markup is supplied by current release');
contains(polish, 'applyIdentity();\n      polishMastery();', 'current identity is reapplied after layered renders');

// Variant and score consistency.
contains(variants, 'id: "A", title: "The Great Sushi Debate"', 'Variant A remains available');
contains(variants, 'id: "B", title: "The Harbor Table"', 'Variant B remains available');
contains(variants, 'id: "C", title: "The Garden Celebration"', 'Variant C remains available');
contains(variants, 'Sophie', 'Variant B has its own people');
contains(variants, 'Maya', 'Variant C has its own people');
contains(variants, 'Harbor & Hearth', 'Variant B has its own restaurant');
contains(variants, 'The Garden Room', 'Variant C has its own restaurant');
contains(variants, 'livingDinnerStory.events.splice', 'story events are replaced for the active variant');
contains(variantPolish, 'restaurant.name', 'restaurant explanation reads active restaurant data');
ok(!variantPolish.includes('Casa Luna'), 'fresh-variant explanation polish is not hard-coded to Casa Luna');
contains(polish, 'actualRestaurant().name', 'best restaurant deduction uses the active restaurant');
ok(/const points = \{ restaurant: 120, meal: 30, drink: 20, dessert: 10 \}/.test(app), 'authoritative scoring values remain unchanged');
equal(120 + (30 + 20 + 10) * 3, 300, 'total possible score remains 300');

// Attempt history and mastery wording.
contains(polish, 'Array.isArray(source.attempts)', 'malformed history attempts fail safely');
contains(polish, 'Math.max(0, Math.min(300, score))', 'stored scores are normalized to valid bounds');
contains(polish, 'first-attempt', 'first attempts remain distinct');
contains(polish, 'same-variant-replay', 'same-case replays remain distinct');
contains(polish, 'fresh-variant', 'fresh variants remain distinct');
contains(polish, 'attempts.find(item => item.attemptType === "first-attempt")', 'first attempt is selected without being overwritten');
contains(polish, 'You held your score after the surface details changed.', 'equal-score mastery message is evidence-based');
contains(polish, 'The new names and context changed the challenge.', 'lower fresh score receives accurate guidance');
contains(polish, 'reasoning transferred beyond the original answers', 'improved fresh score receives careful transfer wording');

// Voice persistence and synchronization.
contains(polish, 'voiceEnabled: window.PupVoice.settings.enabled', 'voice settings survive game-state resets');
contains(polish, 'window.PupVoice?.set?.({ enabled })', 'speaker controls persist narration changes');
contains(polish, 'window.PupVoice?.cancel?.()', 'turning narration off cancels active speech');
contains(polish, 'now - lastSpeechAt < 900', 'rapid duplicate automatic narration is suppressed');
contains(polish, 'Automatic English voice', 'automatic fallback voice is communicated clearly');
contains(polish, 'voice-current-summary', 'Voice Studio shows current settings');
contains(polish, 'aria-describedby', 'Voice Studio sliders are associated with readable outputs');
contains(polish, 'setTimeout(polishVoiceStudio, 0)', 'Voice Studio polish follows modal creation without reopening narration');

console.log(`Sprint 4.3.2 tests passed: ${assertions} assertions`);
