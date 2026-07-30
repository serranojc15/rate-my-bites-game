const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

let assertions = 0;
const equal = (actual, expected, message) => {
  assertions += 1;
  assert.equal(actual, expected, message);
};
const ok = (value, message) => {
  assertions += 1;
  assert.ok(value, message);
};

const window = {};
window.window = window;
const sandbox = { window, console };
vm.createContext(sandbox);
for (const file of ["worldBible.js", "characterBible.js", "livingEpisode.js", "episodes.js"]) {
  vm.runInContext(fs.readFileSync(file, "utf8"), sandbox, { filename: file });
}

const episode = window.RateMyBitesEpisodes.getEpisode("episode-003");
const titles = Object.fromEntries(episode.gameplay.diners.map(diner => [diner.id, diner.role]));
const partySource = fs.readFileSync("sprint4Party.js", "utf8");

equal(titles.emma, "The Adventurer", "Emma uses her canonical Episode 3 title");
equal(titles.ellis, "The Storyteller", "Ellis uses his canonical Episode 3 title");
equal(titles.grace, "The Quiet Challenger", "Grace uses her canonical Episode 3 title");
ok(partySource.includes('if (id === "pup") return "Host";'), "Pup remains identified as Host");
ok(!partySource.includes('isPup ? "Host" : "The Party"'), "individual cards no longer use The Party as their role label");
ok(partySource.includes("<p>The Party</p>"), "The Party remains the collective group name");
ok(
  partySource.includes("episode.gameplay.diners.find(diner => diner.id === id)?.role"),
  "character labels are read from canonical episode participant data"
);
for (const title of Object.values(titles)) {
  equal(
    partySource.includes(`"${title}"`) || partySource.includes(`'${title}'`),
    false,
    `${title} is not duplicated in the Party presentation layer`
  );
}

console.log(`Party character-title tests passed: ${assertions} assertions`);
