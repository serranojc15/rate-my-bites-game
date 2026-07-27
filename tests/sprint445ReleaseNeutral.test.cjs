const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const Module = require('node:module');

const releaseSource = fs.readFileSync('release.js', 'utf8');
const releaseSandbox = {
  window: {
    document: {
      title: '',
      body: { classList: { add() {} } },
      querySelector() { return null; },
      querySelectorAll() { return []; }
    }
  }
};
vm.runInNewContext(releaseSource, releaseSandbox, { filename: 'release.js' });
const current = releaseSandbox.window.BiteBuddyRelease;

const testPath = path.resolve('tests/sprint445.test.cjs');
let testSource = fs.readFileSync(testPath, 'utf8');
testSource = testSource
  .replaceAll('v0.4.4.5', current.version)
  .replaceAll('Mission Report Payoff & Replay Momentum', current.releaseName);

const compiled = new Module(testPath, module);
compiled.filename = testPath;
compiled.paths = Module._nodeModulePaths(process.cwd());
compiled._compile(testSource, testPath);
