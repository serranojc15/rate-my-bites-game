const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const missionReportSource = fs.readFileSync(path.join(root, "missionReport.js"), "utf8");
const missionAnalysisSource = fs.readFileSync(path.join(root, "missionReportAnalysis.js"), "utf8");

const diners = [
  {
    id: "john",
    name: "John",
    role: "The Runner",
    why: "John avoided dairy-heavy choices and stayed with a familiar drink.",
    clues: {
      restaurant: "John wants somewhere close after his run.",
      meal: "John is lactose intolerant and rarely chooses cream-heavy entrées.",
      drink: "John usually orders unsweet tea.",
      dessert: "John rarely orders dairy-heavy desserts."
    },
    actual: { meal: "Grilled Chicken", drink: "Unsweet Tea", dessert: "No Dessert" }
  },
  {
    id: "christie",
    name: "Christie",
    role: "The Seasonal Diner",
    why: "The hot weather shifted Christie toward a lighter entrée.",
    clues: {
      restaurant: "Christie wants a comfortable restaurant for the group.",
      meal: "It is 98 degrees outside, making hot soup less appealing.",
      drink: "Christie wants sparkling water tonight.",
      dessert: "Christie is in the mood for sorbet."
    },
    actual: { meal: "Summer Salad", drink: "Sparkling Water", dessert: "Fruit Sorbet" }
  },
  {
    id: "megan",
    name: "Megan",
    role: "The Celebrator",
    why: "Megan chose a favorite entrée and shared dessert for the celebration.",
    clues: {
      restaurant: "Megan is celebrating and wants somewhere the whole table will enjoy.",
      meal: "Megan has been talking about steak all week.",
      drink: "Megan is driving tonight.",
      dessert: "The table plans to share chocolate cake."
    },
    actual: { meal: "Steak", drink: "Water", dessert: "Chocolate Cake" }
  }
];

const restaurants = [
  { id: "luna", name: "Casa Luna" },
  { id: "plaza", name: "Plaza Fiesta" }
];

const points = { restaurant: 120, meal: 30, drink: 20, dessert: 10 };
const labels = { restaurant: "Restaurant", meal: "Entrée", drink: "Drink", dessert: "Dessert" };
const dinerStages = ["meal", "drink", "dessert"];

const baseState = {
  screen: "results",
  groupRestaurant: "luna",
  picks: {
    john: { meal: "Fettuccine Alfredo", drink: "Unsweet Tea", dessert: "Ice Cream" },
    christie: { meal: "Tomato Soup", drink: "Sparkling Water", dessert: "Fruit Sorbet" },
    megan: { meal: "Steak", drink: "Lemonade", dessert: "Chocolate Cake" }
  },
  confidence: {
    "group-restaurant": 4,
    "john-meal": 5,
    "john-drink": 4,
    "john-dessert": 4,
    "christie-meal": 4,
    "christie-drink": 3,
    "christie-dessert": 2,
    "megan-meal": 5,
    "megan-drink": 2,
    "megan-dessert": 3
  },
  score: 210,
  storyMemory: [
    { eventId: "weather-clue", type: "context", label: "The heat changed the expected order" }
  ]
};

const sandbox = {
  console,
  Date,
  Math,
  Number,
  String,
  Boolean,
  Object,
  Array,
  RegExp,
  JSON,
  Set,
  Map,
  document: {
    querySelector: () => null,
    body: { classList: { add() {}, remove() {} } }
  },
  window: {},
  localStorage: { getItem: () => null, setItem() {} },
  state: { ...baseState },
  initialState: () => ({ ...baseState }),
  render() {},
  reset() {},
  revealFinale() {},
  stopTimer() {},
  app: { innerHTML: "", classList: { add() {}, remove() {} }, offsetWidth: 0 },
  restartButton: { classList: { add() {}, remove() {}, toggle() {} } },
  host: { name: "Pup", image: "pup.webp" },
  images: { people: {} },
  diners,
  restaurants,
  actualRestaurantId: "luna",
  points,
  labels,
  dinerStages,
  sprint4Episode: { number: 1, title: "Context Test" },
  livingDinnerStory: {
    events: [
      { id: "weather-clue", text: "The temperature changed the dinner conversation." }
    ]
  },
  escapeHtml: value => String(value),
  photo: () => ""
};

sandbox.restaurantFor = id => restaurants.find(item => item.id === id);
sandbox.actualRestaurant = () => sandbox.restaurantFor(sandbox.actualRestaurantId);
sandbox.currentConfidence = (personId, stage) => sandbox.state.confidence[`${personId}-${stage}`] || 0;
sandbox.revealVerdict = score => {
  if (score >= 270) return { title: "CASE SOLVED", subtitle: "Solved", className: "solved" };
  if (score >= 210) return { title: "MOSTLY SOLVED", subtitle: "Mostly", className: "mostly" };
  if (score >= 120) return { title: "PARTIALLY SOLVED", subtitle: "Partial", className: "partial" };
  return { title: "COLD CASE", subtitle: "Cold", className: "cold" };
};
sandbox.revealResultsData = () => {
  const restaurantCorrect = sandbox.state.groupRestaurant === sandbox.actualRestaurantId;
  const people = diners.map(person => {
    let total = 0;
    const answers = dinerStages.map(stage => {
      const pick = sandbox.state.picks[person.id]?.[stage];
      const correct = pick === person.actual[stage];
      const earned = correct ? points[stage] : 0;
      total += earned;
      return {
        stage,
        label: labels[stage],
        pick,
        actual: person.actual[stage],
        confidence: sandbox.currentConfidence(person.id, stage),
        correct,
        earned
      };
    });
    return { person, answers, total };
  });
  return {
    restaurantCorrect,
    restaurantPoints: restaurantCorrect ? points.restaurant : 0,
    people
  };
};

const context = vm.createContext(sandbox);
vm.runInContext(missionReportSource, context, { filename: "missionReport.js" });
vm.runInContext(missionAnalysisSource, context, { filename: "missionReportAnalysis.js" });

function evaluate(expression) {
  return vm.runInContext(expression, context);
}

assert.equal(evaluate('missionReportContext("lactose intolerant").id'), "permanent");
assert.equal(evaluate('missionReportContext("98 degree summer weather").id'), "environmental");
assert.equal(evaluate('missionReportContext("ate seafood yesterday").id'), "recent");
assert.equal(evaluate('missionReportContext("driving tonight for a celebration").id'), "social");
assert.equal(evaluate('missionReportContext("breaking the usual routine").id'), "intentional");

const confidence = evaluate(`missionReportConfidence([
  { confidence: 5, correct: false },
  { confidence: 4, correct: false },
  { confidence: 2, correct: true }
])`);
assert.equal(confidence.summary, "Mixed confidence");
assert.equal(confidence.groups.find(group => group.id === "high-wrong").items.length, 2);
assert.equal(confidence.groups.find(group => group.id === "low-correct").items.length, 1);

const report = evaluate("buildMissionReportData()");
assert.equal(report.version, "v0.4.3.0");
assert.equal(report.score.earned, 210);
assert.equal(report.score.possible, 300);
assert.equal(report.verdict.title, "MOSTLY SOLVED");
assert.equal(report.restaurantResult.correct, true);
assert.equal(report.restaurantResult.earned, 120);
assert.equal(report.personResults.length, 3);
assert.equal(report.categoryResults.find(item => item.id === "meal").earned, 30);
assert.equal(report.categoryResults.find(item => item.id === "drink").earned, 40);
assert.equal(report.categoryResults.find(item => item.id === "dessert").earned, 20);
assert.deepEqual(
  report.categoryResults.find(item => item.id === "overall"),
  { id: "overall", label: "Overall", correct: 6, total: 10, earned: 210, possible: 300 }
);
assert.equal(report.missedContext.personName, "John");
assert.equal(report.missedContext.context.id, "permanent");
assert.equal(report.storyMemory.length, 1);
assert.match(report.pupDebrief, /Casa Luna/);
assert.equal(sandbox.window.BiteBuddyMissionReport.version, "v0.4.3.0");

console.log("Mission Report tests passed: 23 assertions");
