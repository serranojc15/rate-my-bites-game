const buddyRoster = [
  {
    id: "dog",
    name: "Pup",
    image: "assets/buddies/buddy-dog.webp",
    role: "The Loyal Favorite",
    trait: "Prefers familiar, highly rated places",
    style: "loyal"
  },
  {
    id: "cat",
    name: "Whiskers",
    image: "assets/buddies/buddy-cat.webp",
    role: "The Food Critic",
    trait: "Selective and strongly influenced by quality",
    style: "critic"
  },
  {
    id: "bird",
    name: "Sunny",
    image: "assets/buddies/buddy-bird.webp",
    role: "The Social Pick",
    trait: "Likes lively, group-friendly restaurants",
    style: "social"
  },
  {
    id: "bunny",
    name: "Nibbles",
    image: "assets/buddies/buddy-bunny.webp",
    role: "The Adventurer",
    trait: "Always tempted by something new",
    style: "adventurer"
  },
  {
    id: "turtle",
    name: "Shellby",
    image: "assets/buddies/buddy-turtle.webp",
    role: "The Careful Planner",
    trait: "Balances distance, price, and group fit",
    style: "planner"
  },
  {
    id: "hamster",
    name: "Peanut",
    image: "assets/buddies/buddy-hamster.webp",
    role: "The Wild Card",
    trait: "Delightfully unpredictable",
    style: "wildcard"
  }
];

const restaurants = [
  { id: "ember", emoji: "🥩", name: "Ember & Oak", cuisine: "Steakhouse", price: 3, distance: 14, rating: 94, social: 82, novelty: 61 },
  { id: "harbor", emoji: "🐟", name: "Harbor House", cuisine: "Seafood", price: 2, distance: 18, rating: 91, social: 76, novelty: 72 },
  { id: "luna", emoji: "🌮", name: "Casa Luna", cuisine: "Mexican", price: 2, distance: 9, rating: 89, social: 95, novelty: 79 },
  { id: "green", emoji: "🥗", name: "The Green Fork", cuisine: "Modern American", price: 2, distance: 11, rating: 87, social: 74, novelty: 68 },
  { id: "napoli", emoji: "🍝", name: "Napoli Table", cuisine: "Italian", price: 2, distance: 16, rating: 92, social: 88, novelty: 55 },
  { id: "seoul", emoji: "🔥", name: "Seoul Street", cuisine: "Korean BBQ", price: 2, distance: 21, rating: 88, social: 93, novelty: 96 }
];

const ui = {
  welcome: document.querySelector("#welcome"),
  game: document.querySelector("#game"),
  start: document.querySelector("#startGame"),
  again: document.querySelector("#playAgain"),
  phaseLabel: document.querySelector("#phaseLabel"),
  phaseTitle: document.querySelector("#phaseTitle"),
  phaseDescription: document.querySelector("#phaseDescription"),
  progress: document.querySelector("#progressBar"),
  players: document.querySelector("#playerGrid"),
  restaurants: document.querySelector("#restaurantGrid"),
  message: document.querySelector("#commissionerMessage"),
  feed: document.querySelector("#broadcastFeed"),
  results: document.querySelector("#results")
};

let state;
let timers = [];

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffled(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function schedule(callback, delay) {
  timers.push(window.setTimeout(callback, delay));
}

function clearTimers() {
  timers.forEach(window.clearTimeout);
  timers = [];
}

function setPhase(label, title, description, progress) {
  ui.phaseLabel.textContent = label;
  ui.phaseTitle.textContent = title;
  ui.phaseDescription.textContent = description;
  ui.progress.style.width = `${progress}%`;
  ui.results.innerHTML = "";
}

function restaurantFor(id) {
  return restaurants.find((restaurant) => restaurant.id === id);
}

function imageFor(player, className = "buddy-thumb") {
  return `<img class="${className}" src="${player.image}" alt="${player.name}, ${player.role}">`;
}

function renderPlayers() {
  ui.players.innerHTML = state.players.map((player) => `
    <article class="player-card">
      <div class="buddy-stage">${imageFor(player, "buddy-art")}</div>
      <span class="player-role">${player.role}</span>
      <strong>${player.name}</strong>
      <div class="small">${player.trait}</div>
    </article>
  `).join("");
}

function renderRestaurants() {
  ui.restaurants.innerHTML = restaurants.map((restaurant) => {
    const eliminated = !state.active.includes(restaurant.id);
    const winner = state.winner === restaurant.id;
    return `
      <article class="restaurant-card ${eliminated ? "eliminated" : ""} ${winner ? "winner" : ""}">
        <div class="restaurant-visual">${restaurant.emoji}</div>
        <div class="restaurant-copy">
          <strong>${restaurant.name}</strong>
          <div class="small">${restaurant.cuisine} • ${"$".repeat(restaurant.price)} • ${restaurant.distance} min</div>
        </div>
      </article>
    `;
  }).join("");
}

function addBroadcast(playerOrIcon, text) {
  const icon = typeof playerOrIcon === "string"
    ? `<span class="feed-emoji">${playerOrIcon}</span>`
    : imageFor(playerOrIcon, "feed-buddy");
  ui.feed.insertAdjacentHTML("afterbegin", `<div class="feed-item">${icon}<div>${text}</div></div>`);
}

function tally(votes) {
  return votes.reduce((results, vote) => {
    results[vote] = (results[vote] || 0) + 1;
    return results;
  }, {});
}

function topSelections(voteTally, count = 1) {
  return Object.entries(voteTally)
    .sort(() => Math.random() - 0.5)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([id]) => id);
}

function preferenceScore(player, restaurant) {
  const jitter = Math.random() * 20;
  switch (player.style) {
    case "loyal": return restaurant.rating * 1.2 + (restaurant.novelty < 70 ? 22 : 0) + jitter;
    case "critic": return restaurant.rating * 1.45 - restaurant.price * 2 + jitter;
    case "social": return restaurant.social * 1.35 + restaurant.rating * 0.35 + jitter;
    case "adventurer": return restaurant.novelty * 1.45 + restaurant.social * 0.25 + jitter;
    case "planner": return restaurant.rating + (25 - restaurant.distance) * 1.4 - restaurant.price * 4 + jitter;
    default: return Math.random() * 150;
  }
}

function chooseFavorite(player, ids) {
  return ids
    .map((id) => restaurantFor(id))
    .sort((a, b) => preferenceScore(player, b) - preferenceScore(player, a))[0].id;
}

function chooseElimination(player, ids) {
  return ids
    .map((id) => restaurantFor(id))
    .sort((a, b) => preferenceScore(player, a) - preferenceScore(player, b))[0].id;
}

function resetGame() {
  clearTimers();
  state = {
    players: shuffled(buddyRoster).slice(0, 4),
    active: restaurants.map((restaurant) => restaurant.id),
    predictions: {},
    firstEliminated: null,
    winner: null
  };
  ui.feed.innerHTML = "";
  ui.results.innerHTML = "";
  ui.again.classList.add("hidden");
  renderPlayers();
  renderRestaurants();
}

function startGame() {
  ui.welcome.classList.add("hidden");
  ui.game.classList.remove("hidden");
  resetGame();
  runPregame();
}

function runPregame() {
  setPhase("Meet the Bite Buddies", "Tonight’s players are entering the arena.", "Four Buddies were randomly selected from the official Rate My Bites roster.", 12);
  ui.message.textContent = "The AI commissioner is opening the prediction window.";

  state.players.forEach((player, index) => {
    schedule(() => {
      const favorite = chooseFavorite(player, state.active);
      state.predictions[index] = {
        winner: Math.random() < 0.7 ? favorite : randomItem(state.active),
        favorite,
        firstOut: chooseElimination(player, state.active)
      };
      addBroadcast(player, `<strong>${player.name}</strong>, ${player.role.toLowerCase()}, locked in three private predictions.`);
    }, 500 + index * 650);
  });

  schedule(runFirstElimination, 3900);
}

function runFirstElimination() {
  setPhase("Round One", "The first restaurant is leaving the board.", "Each Bite Buddy votes according to its own dining personality.", 34);
  ui.message.textContent = "The first elimination votes are being counted…";

  const votes = state.players.map((player) => chooseElimination(player, state.active));
  state.firstEliminated = topSelections(tally(votes))[0];
  state.active = state.active.filter((id) => id !== state.firstEliminated);

  state.players.forEach((player, index) => {
    schedule(() => addBroadcast(player, `<strong>${player.name}</strong> submitted an elimination vote.`), 350 + index * 450);
  });

  schedule(() => {
    const eliminated = restaurantFor(state.firstEliminated);
    renderRestaurants();
    ui.message.textContent = `${eliminated.name} has been eliminated.`;
    addBroadcast("❌", `<strong>${eliminated.name}</strong> is the first restaurant out.`);
  }, 2400);

  schedule(runSecondElimination, 4700);
}

function runSecondElimination() {
  setPhase("Round Two", "Five restaurants become three finalists.", "The Bite Buddies narrow the field as the pressure rises.", 58);
  ui.message.textContent = "Round Two votes are locked.";

  const votes = state.players.map((player) => chooseElimination(player, state.active));
  const removed = topSelections(tally(votes), 2);
  state.active = state.active.filter((id) => !removed.includes(id));

  schedule(() => {
    renderRestaurants();
    addBroadcast("🔥", `Tonight’s finalists are <strong>${state.active.map((id) => restaurantFor(id).name).join(", ")}</strong>.`);
    ui.message.textContent = "The championship field is set.";
  }, 1900);

  schedule(runChampionshipVote, 4500);
}

function runChampionshipVote() {
  setPhase("Championship Vote", "The finalists face the last decision.", "Every Buddy chooses where the group should eat tonight.", 78);
  ui.message.textContent = "Championship votes are arriving one by one…";

  const votes = state.players.map((player, index) => {
    const favorite = state.predictions[index].favorite;
    return state.active.includes(favorite) && Math.random() < 0.68
      ? favorite
      : chooseFavorite(player, state.active);
  });

  state.players.forEach((player, index) => {
    schedule(() => addBroadcast(player, `<strong>${player.name}</strong> submitted a final vote.`), 450 + index * 550);
  });

  schedule(() => {
    state.winner = topSelections(tally(votes))[0];
    renderRestaurants();
    ui.message.textContent = "All votes are locked. The winner is ready.";
  }, 3100);

  schedule(revealWinner, 4700);
}

function revealWinner() {
  const winner = restaurantFor(state.winner);
  setPhase("Winner Reveal", "Tonight’s restaurant has been selected.", "The final result is official.", 92);
  ui.message.textContent = `${winner.name} wins the Rate My Bites Game!`;
  ui.results.innerHTML = `
    <div class="winner-banner">
      <div class="trophy">🏆</div>
      <div class="eyebrow winner-eyebrow">Tonight’s First Pick</div>
      <h2>${winner.name}</h2>
      <p>${winner.cuisine} • ${"$".repeat(winner.price)} • ${winner.distance} min</p>
    </div>
  `;
  addBroadcast("🏆", `<strong>${winner.name}</strong> is tonight’s dinner destination.`);
  schedule(revealScores, 3700);
}

function revealScores() {
  setPhase("Final Standings", "The Bite Champion is crowned.", "Buddies earn points for accurate predictions.", 100);

  const standings = state.players.map((player, index) => {
    let score = 2;
    const reasons = ["Played +2"];
    const prediction = state.predictions[index];

    if (prediction.winner === state.winner) {
      score += 10;
      reasons.push("Winner +10");
    }
    if (prediction.favorite === state.winner) {
      score += 5;
      reasons.push("Favorite +5");
    }
    if (prediction.firstOut === state.firstEliminated) {
      score += 5;
      reasons.push("First out +5");
    }

    return { ...player, score, reasons };
  }).sort((a, b) => b.score - a.score);

  ui.message.textContent = `${standings[0].name} is tonight’s Bite Champion!`;
  ui.results.innerHTML = standings.map((player, index) => `
    <div class="score-row ${index === 0 ? "champion" : ""}">
      <div class="rank">${index === 0 ? "🏆" : index + 1}</div>
      ${imageFor(player, "score-buddy")}
      <div>
        <strong>${player.name} — ${player.role}</strong>
        <div class="small">${player.reasons.join(" • ")}</div>
      </div>
      <div class="points">${player.score} pts</div>
    </div>
  `).join("");

  addBroadcast(standings[0], `<strong>${standings[0].name}</strong> wins the Bite Champion title with ${standings[0].score} points.`);
  ui.again.classList.remove("hidden");
}

ui.start.addEventListener("click", startGame);
ui.again.addEventListener("click", startGame);
