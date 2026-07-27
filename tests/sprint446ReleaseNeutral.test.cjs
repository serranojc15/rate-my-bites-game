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

const testPath = path.resolve('tests/sprint446.test.cjs');
let testSource = fs.readFileSync(testPath, 'utf8');
testSource = testSource
  .replaceAll('v0.4.4.6', current.version)
  .replaceAll('Reveal Navigation & Narration Polish', current.releaseName)
  .replace(
    "workflowSource.includes('node tests/sprint446.test.cjs')",
    "workflowSource.includes('node tests/sprint446ReleaseNeutral.test.cjs')"
  )
  .replace(
    "workflowSource.includes('node tests/sprint445.test.cjs')",
    "workflowSource.includes('node tests/sprint445ReleaseNeutral.test.cjs')"
  );

const compiled = new Module(testPath, module);
compiled.filename = testPath;
compiled.paths = Module._nodeModulePaths(process.cwd());
compiled._compile(testSource, testPath);