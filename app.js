const players = [
  { name: "Professor Plumb", avatar: "🟣", trait: "Seafood & red wine" },
  { name: "Chef Scarlet", avatar: "🔴", trait: "Bold flavors" },
  { name: "Captain Green", avatar: "🟢", trait: "Healthy choices" },
  { name: "Colonel Mustard", avatar: "🟡", trait: "Comfort food" }
];

const restaurants = [
  { id: "ember", emoji: "🥩", name: "Ember & Oak", meta: "Steakhouse • $$$ • 14 min" },
  { id: "harbor", emoji: "🐟", name: "Harbor House", meta: "Seafood • $$ • 18 min" },
  { id: "luna", emoji: "🌮", name: "Casa Luna", meta: "Mexican • $$ • 9 min" },
  { id: "green", emoji: "🥗", name: "The Green Fork", meta: "Modern American • $$ • 11 min" },
  { id: "napoli", emoji: "🍝", name: "Napoli Table", meta: "Italian • $$ • 16 min" },
  { id: "seoul", emoji: "🔥", name: "Seoul Street", meta: "Korean BBQ • $$ • 21 min" }
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

function renderPlayers() {
  ui.players.innerHTML = players.map((player) => `
    <article class="player-card">
      <div class="player-avatar">${player.avatar}</div>
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
          <div class="small">${restaurant.meta}</div>
        </div>
      </article>
    `;
  }).join("");
}

function addBroadcast(icon, text) {
  ui.feed.insertAdjacentHTML("afterbegin", `
    <div class="feed-item"><span>${icon}</span> ${text}</div>
  `);
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

function resetGame() {
  clearTimers();
  state = {
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
  setPhase("Pregame", "Players are arriving…", "Tonight’s AI competitors are reviewing the restaurant board.", 12);
  ui.message.textContent = "The commissioner is opening the prediction window.";

  players.forEach((player, index) => {
    schedule(() => {
      state.predictions[index] = {
        winner: randomItem(state.active),
        favorite: randomItem(state.active),
        firstOut: randomItem(state.active)
      };
      addBroadcast(player.avatar, `<strong>${player.name}</strong> locked in three private predictions.`);
    }, 500 + index * 550);
  });

  schedule(runFirstElimination, 3400);
}

function runFirstElimination() {
  setPhase("Round One", "The first restaurant is leaving the board.", "Each AI player submits a private elimination vote.", 34);
  ui.message.textContent = "The first elimination votes are being counted…";

  const votes = players.map(() => randomItem(state.active));
  state.firstEliminated = topSelections(tally(votes))[0];
  state.active = state.active.filter((id) => id !== state.firstEliminated);

  schedule(() => {
    const eliminated = restaurantFor(state.firstEliminated);
    renderRestaurants();
    ui.message.textContent = `${eliminated.name} has been eliminated.`;
    addBroadcast("❌", `<strong>${eliminated.name}</strong> is the first restaurant out.`);
  }, 1800);

  schedule(runSecondElimination, 4200);
}

function runSecondElimination() {
  setPhase("Round Two", "Five restaurants become three finalists.", "The pressure rises as two more choices are removed.", 58);
  ui.message.textContent = "Round Two votes are locked.";

  const votes = players.map(() => randomItem(state.active));
  const removed = topSelections(tally(votes), 2);
  state.active = state.active.filter((id) => !removed.includes(id));

  schedule(() => {
    renderRestaurants();
    addBroadcast("🔥", `Tonight’s finalists are <strong>${state.active.map((id) => restaurantFor(id).name).join(", ")}</strong>.`);
    ui.message.textContent = "The championship field is set.";
  }, 1800);

  schedule(runChampionshipVote, 4300);
}

function runChampionshipVote() {
  setPhase("Championship Vote", "The finalists face the last decision.", "Each player chooses where the group should eat tonight.", 78);
  ui.message.textContent = "Championship votes are arriving one by one…";

  const votes = players.map((player, index) => {
    const predictedFavorite = state.predictions[index].favorite;
    return state.active.includes(predictedFavorite) && Math.random() < 0.55
      ? predictedFavorite
      : randomItem(state.active);
  });

  players.forEach((player, index) => {
    schedule(() => addBroadcast(player.avatar, `<strong>${player.name}</strong> submitted a final vote.`), 450 + index * 500);
  });

  schedule(() => {
    state.winner = topSelections(tally(votes))[0];
    renderRestaurants();
    ui.message.textContent = "All votes are locked. The winner is ready.";
  }, 2800);

  schedule(revealWinner, 4300);
}

function revealWinner() {
  const winner = restaurantFor(state.winner);
  setPhase("Winner Reveal", "Tonight’s restaurant has been selected.", "The final result is official.", 92);
  ui.message.textContent = `${winner.name} wins the Rate My Bites Game!`;
  ui.results.innerHTML = `
    <div class="winner-banner">
      <div style="font-size: 4rem">🏆</div>
      <div class="eyebrow" style="color: white">Tonight’s First Pick</div>
      <h2>${winner.name}</h2>
      <p>${winner.meta}</p>
    </div>
  `;
  addBroadcast("🏆", `<strong>${winner.name}</strong> is tonight’s dinner destination.`);
  schedule(revealScores, 3600);
}

function revealScores() {
  setPhase("Final Standings", "The Bite Champion is crowned.", "Players earn points for accurate predictions.", 100);

  const standings = players.map((player, index) => {
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
      <div>${index === 0 ? "🏆" : index + 1}</div>
      <div>
        <strong>${player.avatar} ${player.name}</strong>
        <div class="small">${player.reasons.join(" • ")}</div>
      </div>
      <div class="points">${player.score} pts</div>
    </div>
  `).join("");

  addBroadcast("🎉", `<strong>${standings[0].name}</strong> wins with ${standings[0].score} points.`);
  ui.again.classList.remove("hidden");
}

ui.start.addEventListener("click", startGame);
ui.again.addEventListener("click", startGame);
