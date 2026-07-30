'use strict';

const VERSION_PATTERN = /^v(\d+)\.(\d+)\.(\d+)(?:\.(\d+))?$/;

function parseVersion(value) {
  if (typeof value !== 'string') return null;
  const match = VERSION_PATTERN.exec(value);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4] || 0)];
}

function compareVersions(left, right) {
  const leftParts = Array.isArray(left) ? left : parseVersion(left);
  const rightParts = Array.isArray(right) ? right : parseVersion(right);
  if (!leftParts || !rightParts) return null;

  for (let index = 0; index < 4; index += 1) {
    if (leftParts[index] > rightParts[index]) return 1;
    if (leftParts[index] < rightParts[index]) return -1;
  }
  return 0;
}

function isVersionAtLeast(value, minimum) {
  const comparison = compareVersions(value, minimum);
  return comparison !== null && comparison >= 0;
}

module.exports = {
  VERSION_PATTERN,
  parseVersion,
  compareVersions,
  isVersionAtLeast
};
