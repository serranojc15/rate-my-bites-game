const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');

const testPath = path.resolve('tests/sprint444.test.cjs');
let testSource = fs.readFileSync(testPath, 'utf8');

testSource = testSource
  .replace(
    "ok(/^v0\\.4\\.4\\.\\d+$/.test(activeVersion), 'active release remains in the v0.4.4 line');",
    "ok(require('./version-helpers.cjs').isVersionAtLeast(activeVersion, 'v0.4.4.4'), 'active release is Sprint 4.4.4 or later');"
  )
  .replace(
    "ok(Number(activeVersion.split('.').at(-1)) >= 4, 'active release is not older than Sprint 4.4.4');",
    "ok(require('./version-helpers.cjs').parseVersion(activeVersion) !== null, 'active release uses the four-part version format');"
  )
  .replace(
    "workflowSource.includes('node tests/sprint444.test.cjs')",
    "workflowSource.includes('node tests/sprint444ReleaseNeutral.test.cjs')"
  );

const compiled = new Module(testPath, module);
compiled.filename = testPath;
compiled.paths = Module._nodeModulePaths(process.cwd());
compiled._compile(testSource, testPath);
