#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");

const projectRoot = path.resolve(__dirname, "..");
const sandbox = { window: {} };
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);

for (const file of [
  "worldBible.js",
  "characterBible.js",
  "voiceBible.js",
  "season1Bible.js",
  "livingEpisode.js",
  "episodes.js"
]) {
  vm.runInContext(fs.readFileSync(path.join(projectRoot, file), "utf8"), sandbox, { filename: file });
}

const world = sandbox.window.RateMyBitesWorld;
const episodes = sandbox.window.RateMyBitesEpisodes;
const characterBible = sandbox.window.RateMyBitesCharacterBible;
const voiceBible = sandbox.window.RateMyBitesVoiceBible;
const seasonBible = sandbox.window.RateMyBitesSeason1Bible;
const livingEpisode = sandbox.window.RateMyBitesLivingEpisode;
const failures = [];
const bibleValidation = world.validateBible();
const catalogValidation = episodes.validateCatalog();
if (!bibleValidation.valid) failures.push(...bibleValidation.errors.map(error => `World Bible: ${error}`));
if (!catalogValidation.valid) failures.push(...catalogValidation.errors.map(error => `Episode catalog: ${error}`));
for (const [label, result] of [
  ["Character Bible", characterBible.validate()],
  ["Voice Bible", voiceBible.validate()],
  ["Season 1 Bible", seasonBible.validate()],
  ["Living Episode", livingEpisode.validateEpisode(episodes.getEpisode("episode-003"))]
]) {
  if (!result.valid) failures.push(...result.errors.map(error => `${label}: ${error}`));
}

const assets = world.getAssets();
const counts = {};
const hashes = new Map();
const registeredPaths = new Set();
let totalBytes = 0;
for (const [id, asset] of Object.entries(assets)) {
  counts[asset.kind] = (counts[asset.kind] || 0) + 1;
  if (/(?:placeholder|temporary|todo|tbd)/i.test(`${id} ${asset.src} ${asset.status}`)) {
    failures.push(`${id}: placeholder artwork is forbidden`);
  }
  if (/^(?:https?:|data:)/i.test(asset.src)) {
    failures.push(`${id}: production artwork must be local, not ${asset.src}`);
    continue;
  }
  const absolutePath = path.resolve(projectRoot, asset.src);
  if (!absolutePath.startsWith(`${projectRoot}${path.sep}`)) {
    failures.push(`${id}: asset path escapes the project`);
    continue;
  }
  if (!fs.existsSync(absolutePath)) {
    failures.push(`${id}: missing file ${asset.src}`);
    continue;
  }
  const contents = fs.readFileSync(absolutePath);
  registeredPaths.add(path.relative(projectRoot, absolutePath).split(path.sep).join("/"));
  totalBytes += contents.length;
  if (!contents.length) {
    failures.push(`${id}: empty file ${asset.src}`);
    continue;
  }
  if (contents.length > 250_000) failures.push(`${id}: image exceeds the 250 KB performance budget`);
  const hash = crypto.createHash("sha256").update(contents).digest("hex");
  if (hashes.has(hash)) failures.push(`${id}: duplicates the image bytes assigned to ${hashes.get(hash)}`);
  hashes.set(hash, id);
  if (path.extname(asset.src).toLowerCase() === ".webp") {
    const isWebp = contents.length >= 12
      && contents.subarray(0, 4).toString("ascii") === "RIFF"
      && contents.subarray(8, 12).toString("ascii") === "WEBP";
    if (!isWebp) failures.push(`${id}: invalid WebP file ${asset.src}`);
    if (contents.length < 4_096) failures.push(`${id}: suspiciously small image ${asset.src}`);
  } else if (path.extname(asset.src).toLowerCase() === ".svg") {
    if (!/<svg[\s>]/i.test(contents.toString("utf8"))) failures.push(`${id}: invalid SVG file ${asset.src}`);
  } else {
    failures.push(`${id}: unsupported production image format ${asset.src}`);
  }
}

for (const directory of ["assets/characters", "assets/food", "assets/restaurants", "assets/scenes"]) {
  for (const filename of fs.readdirSync(path.join(projectRoot, directory))) {
    const relativePath = `${directory}/${filename}`;
    if (!registeredPaths.has(relativePath)) failures.push(`${relativePath}: content artwork is not registered`);
  }
}

for (const entry of episodes.getCatalog()) {
  if (/^(?:https?:|data:)/i.test(entry.artwork || "")) failures.push(`${entry.id}: remote catalog artwork is forbidden`);
  if (entry.status !== "playable") continue;
  const episode = episodes.getEpisode(entry.id);
  for (const [group, mappings] of Object.entries(episode.gameplay.images)) {
    for (const [label, src] of Object.entries(mappings)) {
      if (/^(?:https?:|data:)/i.test(src)) failures.push(`${entry.id} ${group}.${label}: remote artwork is forbidden`);
    }
  }
}

const episode3Media = episodes.getEpisode("episode-003").production.media;
const audioEntries = Object.entries(episode3Media.audioClips);
if (audioEntries.length < 3 || audioEntries.length > 5) {
  failures.push(`Episode 3 requires 3–5 Pup audio clips; found ${audioEntries.length}`);
}
for (const [clipId, relativePath] of audioEntries) {
  if (!episode3Media.captions[clipId]?.trim()) failures.push(`${clipId}: visible caption is required`);
  if (/^(?:https?:|data:)/i.test(relativePath)) {
    failures.push(`${clipId}: Pup audio must be packaged locally`);
    continue;
  }
  const absolutePath = path.resolve(projectRoot, relativePath);
  if (!absolutePath.startsWith(`${projectRoot}${path.sep}`) || !fs.existsSync(absolutePath)) {
    failures.push(`${clipId}: missing packaged audio ${relativePath}`);
    continue;
  }
  const contents = fs.readFileSync(absolutePath);
  const mp3Header = contents.subarray(0, 3).toString("ascii") === "ID3"
    || (contents[0] === 0xff && (contents[1] & 0xe0) === 0xe0);
  if (!mp3Header) failures.push(`${clipId}: invalid MP3 file ${relativePath}`);
  if (!contents.length || contents.length > 250_000) failures.push(`${clipId}: audio file exceeds its 250 KB budget`);
}

const productionSourceFiles = fs.readdirSync(projectRoot)
  .filter(file => /\.(?:css|html|js)$/i.test(file));
const registeredAssetPaths = new Set(Object.values(assets).map(asset => asset.src));
for (const file of productionSourceFiles) {
  const source = fs.readFileSync(path.join(projectRoot, file), "utf8");
  const remoteImagePattern = /https?:\/\/(?!www\.w3\.org\/2000\/svg)[^"'`\s)]+\.(?:avif|gif|jpe?g|png|svg|webp)(?:\?[^"'`\s)]*)?/gi;
  for (const reference of source.match(remoteImagePattern) || []) {
    failures.push(`${file}: remote production image reference is forbidden (${reference})`);
  }
  const localImagePattern = /assets\/[a-z0-9_./-]+\.(?:avif|gif|jpe?g|png|svg|webp)/gi;
  for (const reference of source.match(localImagePattern) || []) {
    if (!registeredAssetPaths.has(reference)) {
      failures.push(`${file}: runtime artwork reference is not registered (${reference})`);
    }
  }
}

if (totalBytes > 6_000_000) failures.push(`approved artwork exceeds the 6 MB aggregate performance budget`);

if (failures.length) {
  console.error(`Artwork validation failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

const summary = Object.entries(counts)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([kind, count]) => `${count} ${kind}`)
  .join(", ");
console.log(`Production validation passed: ${Object.keys(assets).length} approved assets (${summary}); ${(totalBytes / 1_000_000).toFixed(2)} MB; ${episodes.getCatalog().filter(entry => entry.status === "playable").length} playable episodes; ${audioEntries.length} packaged Pup clips; 2 Fresh Variants.`);
