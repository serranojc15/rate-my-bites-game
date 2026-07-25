const host = { name: "Pup", image: "assets/buddies/buddy-dog.webp" };

const restaurants = [
  {
    id: "luna",
    emoji: "🌮",
    name: "Casa Luna",
    distance: "3.2 mi",
    price: "$$",
    style: "Modern Mexican",
    traits: ["seafood", "margaritas", "light", "social"],
    menu: {
      meal: ["Fish tacos", "Chicken enchiladas", "Steak fajitas"],
      drink: ["Lime margarita", "Sweet tea", "Sparkling water"],
      dessert: ["Churros", "Tres leches", "No dessert"]
    }
  },
  {
    id: "cactus",
    emoji: "🌵",
    name: "Cactus Cantina",
    distance: "1.8 mi",
    price: "$",
    style: "Fast & casual",
    traits: ["cheap", "quick", "spicy"],
    menu: {
      meal: ["Spicy chicken burrito", "Carne asada tacos", "Veggie bowl"],
      drink: ["Horchata", "Mexican Coke", "Water"],
      dessert: ["Cinnamon sopapillas", "Flan", "No dessert"]
    }
  },
  {
    id: "azul",
    emoji: "🐟",
    name: "Azul Mar",
    distance: "7.4 mi",
    price: "$$$",
    style: "Coastal Mexican",
    traits: ["seafood", "upscale", "novel"],
    menu: {
      meal: ["Grilled mahi tacos", "Shrimp enchiladas", "Chicken mole"],
      drink: ["Cucumber agua fresca", "Paloma", "Sparkling water"],
      dessert: ["Coconut flan", "Tres leches", "No dessert"]
    }
  },
  {
    id: "abuela",
    emoji: "🫔",
    name: "Abuela’s Table",
    distance: "5.1 mi",
    price: "$$",
    style: "Traditional family recipes",
    traits: ["familiar", "comfort", "dessert"],
    menu: {
      meal: ["Beef tamales", "Cheese enchiladas", "Chicken tortilla soup"],
      drink: ["Sweet tea", "Horchata", "Water"],
      dessert: ["Flan", "Churros", "No dessert"]
    }
  },
  {
    id: "rojo",
    emoji: "🔥",
    name: "Rojo Taco Lab",
    distance: "6.6 mi",
    price: "$$",
    style: "Creative street tacos",
    traits: ["novel", "spicy", "social"],
    menu: {
      meal: ["Korean beef tacos", "Hot honey chicken tacos", "Avocado tostadas"],
      drink: ["Mango agua fresca", "Spicy margarita", "Mexican Coke"],
      dessert: ["Churro bites", "Mexican chocolate cookie", "No dessert"]
    }
  },
  {
    id: "plaza",
    emoji: "🎉",
    name: "Plaza Fiesta",
    distance: "4.0 mi",
    price: "$$",
    style: "Lively neighborhood favorite",
    traits: ["social", "familiar", "margaritas"],
    menu: {
      meal: ["Steak fajitas", "Combo enchiladas", "Fish tacos"],
      drink: ["House margarita", "Sweet tea", "Water"],
      dessert: ["Fried ice cream", "Sopapillas", "No dessert"]
    }
  }
];

const actualRestaurantId = "luna";

const diners = [
  {
    id: "emma",
    name: "Emma",
    emoji: "👩🏽",
    intro: "Adventurous, loves fish and spicy food.",
    facts: ["Orders seafood often", "Usually stays within 10 miles", "Dessert about half the time"],
    clues: {
      restaurant: "Emma ate fried catfish yesterday, so another seafood-focused restaurant may be less appealing.",
      meal: "She wants something lighter than fajitas and is willing to move away from fish tonight.",
      drink: "She is driving tonight.",
      dessert: "She skipped lunch, but says she does not want a heavy finish."
    },
    actual: {
      meal: "Chicken enchiladas",
      drink: "Sparkling water",
      dessert: "No dessert"
    },
    why: "Emma agreed to the nearby modern option, moved away from seafood after yesterday’s catfish, chose sparkling water because she was driving, and skipped dessert."
  },
  {
    id: "marcus",
    name: "Marcus",
    emoji: "👨🏾",
    intro: "Predictable, budget-minded, and always hungry.",
    facts: ["Favors familiar places", "Usually orders beef", "Almost always gets dessert"],
    clues: {
      restaurant: "Marcus paid for an expensive dinner last night and wants somewhere nearby at a moderate price.",
      meal: "He ran five miles this afternoon and wants the most filling option.",
      drink: "He orders sweet tea with most casual dinners.",
      dessert: "His dessert streak is currently six dinners."
    },
    actual: {
      meal: "Steak fajitas",
      drink: "Sweet tea",
      dessert: "Churros"
    },
    why: "Marcus supported the close, moderately priced group choice, ordered the filling beef option, stayed with sweet tea, and protected his dessert streak."
  },
  {
    id: "olivia",
    name: "Olivia",
    emoji: "👩🏻",
    intro: "Social planner who values atmosphere and group favorites.",
    facts: ["Likes lively rooms", "Often orders margaritas", "Returns to trusted favorites"],
    clues: {
      restaurant: "Olivia is celebrating a promotion, but she also wants a place that works for everyone in the group.",
      meal: "She wants something the table can easily share.",
      drink: "She is not driving and called this a celebration dinner.",
      dessert: "The group mentioned sharing one dessert for the table."
    },
    actual: {
      meal: "Steak fajitas",
      drink: "Lime margarita",
      dessert: "Tres leches"
    },
    why: "Olivia accepted the lively group compromise, chose shareable fajitas, celebrated with a margarita, and finished with a dessert suitable for sharing."
  }
];

const dinerStages = ["meal", "drink", "dessert"];
const points = { restaurant: 120, meal: 30, drink: 20, dessert: 10 };
const labels = { restaurant: "Restaurant", meal: "Entrée", drink: "Drink", dessert: "Dessert" };
const app = document.querySelector("#app");
const restartButton = document.querySelector("#restartButton");

let state = initialState();

function initialState() {
  return {
    screen: "welcome",
    stageIndex: 0,
    dinerIndex: 0,
    groupRestaurant: null,
    picks: {},
    score: 0
  };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  })[char]);
}

function restaurantFor(id) {
  return restaurants.find((restaurant) => restaurant.id === id);
}

function actualRestaurant() {
  return restaurantFor(actualRestaurantId);
}

function hostCard(text) {
  return `<div class="host-card"><img src="${host.image}" alt="Pup, Bite Buddy League host"><div><strong>${host.name}, League Host</strong><p>${text}</p></div></div>`;
}

function progress() {
  const completedDinerPicks = state.stageIndex * diners.length + state.dinerIndex;
  const totalDinerPicks = dinerStages.length * diners.length;
  const percent = 25 + Math.round((completedDinerPicks / totalDinerPicks) * 75);
  const stage = dinerStages[state.stageIndex];
  return `<div class="progress-wrap"><div class="progress-meta"><span>${labels[stage]} round</span><span>${completedDinerPicks + 1} of ${totalDinerPicks}</span></div><div class="progress-track"><span style="width:${percent}%"></span></div></div>`;
}

function render() {
  restartButton.classList.toggle("hidden", state.screen === "welcome");
  if (state.screen === "welcome") welcome();
  if (state.screen === "intro") intro();
  if (state.screen === "restaurant") restaurantRound();
  if (state.screen === "restaurantReveal") restaurantReveal();
  if (state.screen === "play") play();
  if (state.screen === "results") results();
}

function welcome() {
  app.innerHTML = `<div class="hero">
    <p class="eyebrow">Taco Tuesday Prediction Challenge</p>
    <div class="hero-art">🌮🏆</div>
    <h1>Know the people.<br>Predict the night.</h1>
    <p class="lead">Three diners are going out together. Predict the one restaurant the group chooses, then predict what each person orders.</p>
    <div class="mantra">One table. Three personalities. Twelve predictions.</div>
    <button class="primary-button wide" id="start">Enter the Bite Buddy League</button>
  </div>`;
  document.querySelector("#start").onclick = () => {
    state.screen = "intro";
    render();
  };
}

function intro() {
  app.innerHTML = `<p class="eyebrow">Tonight’s Dining Group</p>
    <h1 class="screen-title">They are all eating at the same restaurant.</h1>
    ${hostCard("First predict where the group agrees to eat. Once the restaurant is revealed, predict each diner’s entrée, drink, and dessert.")}
    <div class="diner-grid">${diners.map((diner) => `<article class="diner-card">
      <div class="diner-avatar">${diner.emoji}</div>
      <strong>${diner.name}</strong>
      <small>${diner.intro}</small>
      <div class="fact-list">${diner.facts.map((fact) => `<div class="fact">${fact}</div>`).join("")}</div>
    </article>`).join("")}</div>
    <div class="actions"><button class="primary-button" id="begin">Predict the Group Restaurant</button></div>`;
  document.querySelector("#begin").onclick = () => {
    state.screen = "restaurant";
    render();
  };
}

function restaurantRound() {
  app.innerHTML = `<div class="progress-wrap">
      <div class="progress-meta"><span>Group restaurant round</span><span>1 shared choice</span></div>
      <div class="progress-track"><span style="width:12%"></span></div>
    </div>
    ${hostCard("All three diners must agree on one restaurant. Use everyone’s clues and look for the best group compromise.")}
    <div class="diner-grid compact">${diners.map((diner) => `<article class="diner-card">
      <div class="diner-avatar">${diner.emoji}</div>
      <strong>${diner.name}</strong>
      <small>${diner.clues.restaurant}</small>
    </article>`).join("")}</div>
    <h2 class="section-title">Where will the group eat?</h2>
    <div class="restaurant-grid">${restaurants.map((restaurant) => `<button class="option ${state.groupRestaurant === restaurant.id ? "selected" : ""}" data-value="${restaurant.id}">
      <span class="option-emoji">${restaurant.emoji}</span>
      <span><strong>${restaurant.name}</strong><small>${restaurant.style} · ${restaurant.distance} · ${restaurant.price}</small></span>
    </button>`).join("")}</div>
    <p class="lock-note">This is one prediction for the entire group.</p>
    <div class="actions"><button class="primary-button" id="lockRestaurant" ${state.groupRestaurant ? "" : "disabled"}>Lock Group Restaurant</button></div>`;

  app.querySelectorAll(".option").forEach((button) => {
    button.onclick = () => {
      state.groupRestaurant = button.dataset.value;
      render();
    };
  });

  const lockButton = document.querySelector("#lockRestaurant");
  if (lockButton) {
    lockButton.onclick = () => {
      if (!state.groupRestaurant) return;
      state.screen = "restaurantReveal";
      render();
    };
  }
}

function restaurantReveal() {
  const restaurant = actualRestaurant();
  const correct = state.groupRestaurant === actualRestaurantId;
  app.innerHTML = `<p class="eyebrow">Restaurant Reveal</p>
    <h1 class="screen-title">The group chose ${restaurant.name}.</h1>
    ${hostCard("The restaurant is now locked for everyone. Next, predict each diner’s order from the same menu.")}
    <article class="reveal-card">
      <div class="reveal-head"><strong>${restaurant.emoji} ${restaurant.name}</strong><span class="score-pill">${correct ? "+120" : "0"}</span></div>
      <div class="answer-row ${correct ? "correct" : "wrong"}"><span>Your prediction: ${restaurantFor(state.groupRestaurant).name}</span><span>${correct ? "✓ Correct" : "✕ Incorrect"}</span></div>
      <p class="explanation">Casa Luna balanced Marcus’s price and distance concerns, Olivia’s desire for a lively celebration, and Emma’s preference for something modern without forcing another seafood-heavy meal.</p>
    </article>
    <div class="actions"><button class="primary-button" id="orders">Predict Their Orders</button></div>`;
  document.querySelector("#orders").onclick = () => {
    state.screen = "play";
    render();
  };
}

function availableOptions(stage) {
  const restaurant = actualRestaurant();
  return restaurant.menu[stage].map((value) => ({
    value,
    title: value,
    subtitle: restaurant.name,
    emoji: stage === "meal" ? "🍽️" : stage === "drink" ? "🥤" : "🍰"
  }));
}

function play() {
  const stage = dinerStages[state.stageIndex];
  const diner = diners[state.dinerIndex];
  const selected = state.picks[diner.id]?.[stage];
  const restaurant = actualRestaurant();

  app.innerHTML = `${progress()}
    ${hostCard(diner.clues[stage])}
    <div class="round-diner">
      <div class="diner-avatar">${diner.emoji}</div>
      <div><h2>${diner.name}</h2><p>What will ${diner.name} order at ${restaurant.name}?</p></div>
    </div>
    <div class="choice-grid">${availableOptions(stage).map((option) => `<button class="option ${selected === option.value ? "selected" : ""}" data-value="${option.value}">
      <span class="option-emoji">${option.emoji}</span>
      <span><strong>${option.title}</strong><small>${option.subtitle}</small></span>
    </button>`).join("")}</div>
    <p class="lock-note">You may change this pick until you continue.</p>
    <div class="actions"><button class="primary-button" id="continue" ${selected ? "" : "disabled"}>${state.dinerIndex === diners.length - 1 ? `Finish ${labels[stage]} Round` : `Lock ${diner.name}`}</button></div>`;

  app.querySelectorAll(".option").forEach((button) => {
    button.onclick = () => {
      state.picks[diner.id] ??= {};
      state.picks[diner.id][stage] = button.dataset.value;
      render();
    };
  });

  const continueButton = document.querySelector("#continue");
  if (continueButton) {
    continueButton.onclick = () => {
      if (!state.picks[diner.id]?.[stage]) return;
      if (state.dinerIndex < diners.length - 1) {
        state.dinerIndex += 1;
      } else if (state.stageIndex < dinerStages.length - 1) {
        state.stageIndex += 1;
        state.dinerIndex = 0;
      } else {
        calculateScore();
        state.screen = "results";
      }
      render();
    };
  }
}

function calculateScore() {
  state.score = state.groupRestaurant === actualRestaurantId ? points.restaurant : 0;
  diners.forEach((diner) => {
    dinerStages.forEach((stage) => {
      if (state.picks[diner.id]?.[stage] === diner.actual[stage]) {
        state.score += points[stage];
      }
    });
  });
}

function getBoard() {
  try {
    return JSON.parse(localStorage.getItem("rmb-taco-board-v2") || "[]");
  } catch {
    return [];
  }
}

function saveScore() {
  const input = document.querySelector("#nickname");
  const name = (input.value || "Player").trim().slice(0, 18) || "Player";
  const board = [...getBoard(), {
    name,
    score: state.score,
    date: new Date().toLocaleDateString("en-US")
  }].sort((a, b) => b.score - a.score).slice(0, 5);
  localStorage.setItem("rmb-taco-board-v2", JSON.stringify(board));
  render();
}

function results() {
  const board = getBoard();
  const restaurant = actualRestaurant();
  const restaurantCorrect = state.groupRestaurant === actualRestaurantId;

  app.innerHTML = `<p class="eyebrow">Final Reveal</p>
    <h1 class="screen-title">How well did you know the group?</h1>
    <div class="total-score"><strong>${state.score}</strong><span>out of 300 points</span></div>
    <article class="reveal-card">
      <div class="reveal-head"><strong>${restaurant.emoji} Shared Restaurant</strong><span class="score-pill">${restaurantCorrect ? "120/120" : "0/120"}</span></div>
      <div class="answer-row ${restaurantCorrect ? "correct" : "wrong"}"><span>Your pick: ${restaurantFor(state.groupRestaurant).name}</span><span>${restaurantCorrect ? "✓ +120" : `✕ ${restaurant.name}`}</span></div>
    </article>
    ${diners.map((diner) => {
      let dinerScore = 0;
      const rows = dinerStages.map((stage) => {
        const pick = state.picks[diner.id]?.[stage];
        const correct = pick === diner.actual[stage];
        if (correct) dinerScore += points[stage];
        return `<div class="answer-row ${correct ? "correct" : "wrong"}"><span>${labels[stage]}: ${pick || "—"}</span><span>${correct ? `✓ +${points[stage]}` : `✕ ${diner.actual[stage]}`}</span></div>`;
      }).join("");
      return `<article class="reveal-card"><div class="reveal-head"><strong>${diner.emoji} ${diner.name}</strong><span class="score-pill">${dinerScore}/60</span></div>${rows}<p class="explanation">${diner.why}</p></article>`;
    }).join("")}
    <h2>Local Leaderboard</h2>
    <div class="name-entry"><input id="nickname" maxlength="18" placeholder="Your nickname" aria-label="Your nickname"><button class="secondary-button" id="save">Save Score</button></div>
    ${board.length ? `<table class="leaderboard"><thead><tr><th>Player</th><th>Date</th><th>Score</th></tr></thead><tbody>${board.map((row, index) => `<tr><td>${index + 1}. ${escapeHtml(row.name)}</td><td>${escapeHtml(row.date)}</td><td>${row.score}</td></tr>`).join("")}</tbody></table>` : `<p class="lead">No saved scores yet. Be the first league leader.</p>`}
    <div class="actions"><button class="primary-button" id="again">Play Again</button></div>
    <p class="feedback-prompt">Did the shared restaurant feel like a believable compromise? Which diner was easiest to predict?</p>`;

  document.querySelector("#save").onclick = saveScore;
  document.querySelector("#again").onclick = reset;
}

function reset() {
  state = initialState();
  render();
}

restartButton.onclick = reset;
render();
