const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

let assertions = 0;
const ok = (value, message) => { assertions += 1; assert.ok(value, message); };
const equal = (actual, expected, message) => { assertions += 1; assert.equal(actual, expected, message); };

const rendererSource = fs.readFileSync("revealResultCard.js", "utf8");
const rendererCss = fs.readFileSync("revealResultCard.css", "utf8");
const episode12Source = fs.readFileSync("sprint441.js", "utf8");
const episode3Source = fs.readFileSync("sprint4Party.js", "utf8");
const episode3Data = fs.readFileSync("episodes.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");

const window = {};
vm.runInNewContext(rendererSource, { window }, { filename: "revealResultCard.js" });
const renderer = window.RateMyBitesRevealResultCard;

const episode12Explanation = "The group chose Casa Luna because Emma wanted something modern.";
const episode12Markup = renderer.markup({
  imageSrc: "assets/restaurants/casa-luna.webp",
  imageAlt: "Casa Luna",
  score: "120 / 120",
  title: "Why the table landed here",
  playerAnswer: "Casa Luna",
  explanation: episode12Explanation,
  success: true
});
const episode3Explanation = "Emma called The Copper Table before service.";
const episode3Markup = renderer.markup({
  imageSrc: "assets/restaurants/copper-table.webp",
  imageAlt: "The Copper Table",
  score: "+120 points",
  title: "Emma called before service.",
  playerAnswer: "Emma called ahead",
  explanation: episode3Explanation,
  success: true
});

for (const markup of [episode12Markup, episode3Markup]) {
  const imageEnd = markup.indexOf("</div>");
  const panelStart = markup.indexOf('<div class="reveal-result-panel">');
  ok(imageEnd < panelStart, "image area closes before the result panel begins");
  ok(markup.slice(0, imageEnd).includes("reveal-result-score"), "score badge remains attached to the image area");
  ok(!markup.slice(0, imageEnd).includes("reveal-result-explanation"), "explanation is not rendered over the image");
  ok(markup.slice(panelStart).includes("reveal-result-answer"), "player answer is rendered inside the result panel");
  equal((markup.match(/reveal-result-explanation/g) || []).length, 1, "explanation has one canonical location");
}

equal((episode12Markup.match(new RegExp(episode12Explanation, "g")) || []).length, 1, "Episodes 1–2 wording is unchanged and rendered once");
equal((episode3Markup.match(new RegExp(episode3Explanation, "g")) || []).length, 1, "Episode 3 wording is unchanged and rendered once");
ok(episode12Source.includes("RateMyBitesRevealResultCard.markup({"), "Episodes 1–2 use the shared renderer");
ok(episode3Source.includes("RateMyBitesRevealResultCard.markup({"), "Episode 3 uses the shared renderer");
equal((episode3Source.match(/restaurantExplanation/g) || []).length, 1, "Episode 3 passes its explanation to one rendering location");
ok(!episode12Source.includes("restaurant-reveal-photo-card"), "Episodes 1–2 no longer own reveal-card markup");
ok(!episode3Source.includes("mystery-answer-card"), "Episode 3 no longer owns reveal-card markup");
ok(!episode3Source.includes("episode3-solution"), "Episode 3 no longer renders a second explanation");
ok(episode3Data.includes('restaurantExplanation: "Emma called The Copper Table before service. The restaurant removed the mushroom card and held a custom risotto—not to choose for Grace, but to give her a choice."'), "canonical Episode 3 wording remains unchanged");
ok(rendererCss.includes("background: #2c2421"), "shared result panel uses the cinematic high-contrast background");
ok(rendererCss.includes(".reveal-result-image") && rendererCss.includes("position: relative"), "shared image area anchors the score badge");
ok(html.indexOf("revealResultCard.js") < html.indexOf("sprint441.js"), "shared renderer loads before the first active consumer");
ok(html.indexOf("revealResultCard.js") < html.indexOf("sprint4Party.js"), "shared renderer loads before the Episode 3 consumer");
ok(html.includes("revealResultCard.css"), "shared reveal-card styling ships in production");

console.log(`Shared reveal result card tests passed: ${assertions} assertions`);
