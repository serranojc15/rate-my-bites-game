const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync('sprint441Polish.js', 'utf8');
const css = fs.readFileSync('sprint441Polish.css', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');

let assertions = 0;
function ok(value, message) { assert.ok(value, message); assertions += 1; }

ok(source.includes('working.insertAdjacentElement("afterend", dock)'), 'lock dock is moved directly after working prediction');
ok(source.includes('state.screen !== "restaurant"'), 'dock polish is limited to restaurant prediction');
ok(source.includes('event.key === "Escape"'), 'case-file focus restoration handles Escape');
ok(source.includes('opener?.focus?.({ preventScroll: true })'), 'case-file opener receives focus without forced scrolling');
ok(source.includes('root.scrollTo?.(scrollX, scrollY)'), 'case-file close restores the prior scroll position');
ok(source.includes('root.document.removeEventListener("keydown", onKey, true)'), 'temporary Escape listener is removed');
ok(css.includes('top: max(0.55rem, env(safe-area-inset-top))'), 'sticky dock uses safe top spacing');
ok(css.includes('bottom: auto'), 'polished dock no longer waits at the end of the page');
ok(html.indexOf('sprint441Polish.css') > html.indexOf('sprint441.css'), 'polish CSS loads after base Sprint CSS');
ok(html.indexOf('sprint441Polish.js') > html.indexOf('sprint441.js'), 'polish behavior loads after base Sprint behavior');

console.log(`Sprint 4.4.1 polish tests passed: ${assertions} assertions`);
