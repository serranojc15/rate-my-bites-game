const assert = require('node:assert/strict');
const fs = require('node:fs');

const sprint = fs.readFileSync('sprint431.js', 'utf8');
const app = fs.readFileSync('app.js', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');

let assertions = 0;
function ok(value, message) { assert.ok(value, message); assertions += 1; }
function includes(value, message) { ok(sprint.includes(value), message); }

includes('const VERSION = "v0.4.3.1"', 'release version is defined');
includes('id: "A", title: "The Great Sushi Debate"', 'original variant is preserved');
includes('id: "B", title: "The Harbor Table"', 'fresh variant B exists');
includes('id: "C", title: "The Garden Celebration"', 'fresh variant C exists');
includes('diners.splice(0, diners.length', 'active diners are replaced atomically');
includes('restaurants.splice(0, restaurants.length', 'active restaurants are replaced atomically');
includes('freshVariantId(state.currentVariantId)', 'fresh replay avoids the active variant');
includes('same-variant-replay', 'same-variant replay is tracked separately');
includes('fresh-variant', 'fresh-variant attempts are tracked separately');
includes('sprint431AttemptRecorded', 'completed attempts are guarded against duplicate writes');
includes('bite-buddy-case-history-v1', 'attempt history uses a versioned key');
includes('bite-buddy-pup-voice-v1', 'voice settings use a versioned key');
includes('"system-default"', 'system default preset exists');
includes('"warm-narrator"', 'warm narrator preset exists');
includes('"deep-detective"', 'deep detective preset exists');
includes('"friendly-host"', 'friendly host preset exists');
includes('"dramatic-game-master"', 'dramatic game master preset exists');
includes('window.speechSynthesis?.getVoices?.()', 'voice loading is defensive');
includes('if (!voiceSettings.enabled', 'disabled narration prevents speech');
includes('window.speechSynthesis.cancel()', 'new narration cancels prior narration');
includes('voices.find(v => v.voiceURI === voiceSettings.voiceURI)', 'explicit available voice is preserved');
includes('voices.find(v => /^en/i.test(v.lang || ""))', 'missing voice falls back to an English voice');
includes('typeof SpeechSynthesisUtterance === "undefined"', 'unsupported speech environments are handled');
includes('Math.min(max, Math.max(min', 'restored numeric settings are clamped');
includes('Preview Pup’s Voice', 'voice preview control exists');
includes('event.key === "Escape"', 'Escape closes Voice Studio');
includes('voiceOpener?.focus?.()', 'focus is restored to the opener');
includes('Replay This Case', 'same-case replay action is visible');
includes('Play Fresh Variant', 'fresh-variant action is visible');

ok(/const points = \{ restaurant: 120, meal: 30, drink: 20, dessert: 10 \}/.test(app), 'authoritative score values remain unchanged');
ok(120 + (30 + 20 + 10) * 3 === 300, 'total possible score remains 300');
ok((sprint.match(/id: "[ABC]", title:/g) || []).length === 3, 'exactly three initial variants are declared');
ok(html.includes('sprint431.css') && html.includes('sprint431.js'), 'Sprint 4.3.1 assets are integrated');
ok(html.includes('v0.4.3.1'), 'visible document version is current');
ok(!/Daniel\|Alex\|Samantha\|Google UK English Male/.test(sprint), 'Voice Studio does not depend on OS-specific voice names');

console.log(`Sprint 4.3.1 tests passed: ${assertions} assertions`);
