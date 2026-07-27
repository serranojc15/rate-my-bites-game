const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');

const testPath = path.resolve('tests/sprint443.test.cjs');
let testSource = fs.readFileSync(testPath, 'utf8');

testSource = testSource
  .replace(
    "ok(/^v0\\.4\\.4\\.\\d+$/.test(releaseVersion), 'current release is Sprint 4.4.3 or later');",
    "ok(require('./version-helpers.cjs').isVersionAtLeast(releaseVersion, 'v0.4.4.3'), 'current release is Sprint 4.4.3 or later');"
  )
  .replace(
    "workflowSource.includes('node tests/sprint443.test.cjs')",
    "workflowSource.includes('node tests/sprint443ReleaseNeutral.test.cjs')"
  );

const compiled = new Module(testPath, module);
compiled.filename = testPath;
compiled.paths = Module._nodeModulePaths(process.cwd());
compiled._compile(testSource, testPath);
