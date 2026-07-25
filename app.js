const buddyRoster = [
  {
    id: "dog",
    name: "Pup",
    emoji: "🐶",
    image: "assets/buddies/buddy-dog.webp",
    role: "The Loyal Favorite",
    trait: "Trusts familiar places with strong ratings",
    style: "loyal"
  },
  {
    id: "cat",
    name: "Whiskers",
    emoji: "🐱",
    image: "assets/buddies/buddy-cat.webp",
    role: "The Food Critic",
    trait: "Quality matters more than almost anything",
    style: "critic"
  },
  {
    id: "bird",
    name: "Sunny",
    emoji: "🐦",
    image: "assets/buddies/buddy-bird.webp",
    role: "The Social Pick",
    trait: "Looks for lively places the whole group will enjoy",
    style: "social"
  },
  {
    id: "bunny",
    name: "Nibbles",
    emoji: "🐰",
    image: "assets/buddies/buddy-bunny.webp",
    role: "The Adventurer",
    trait: "Always tempted by somewhere new",
    style: "adventurer"
  },
  {
    id: "turtle",
    name: "Shellby",
    emoji: "🐢",
    image: "assets/buddies/buddy-turtle.webp",
    role: "The Careful Planner",
    trait: "Balances ratings, distance, price, and group fit",
    style: "planner"
  },
  {
    id: "hamster",
    name: "Peanut",
    emoji: "🐹",
    image: "assets/buddies/buddy-hamster.webp",
    role: "The Wild Card",
    trait: "Delightfully unpredictable from round to round",
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
  welcome: document.querySelector("#welcomeScreen"),
  broadcast: document.querySelector("#broadcastScreen"),
  start: document.querySelector("#startButton"),
  pause: document.querySelector("#pauseButton"),
  pauseLabel: document.querySelector("#pauseLabel"),
  pauseOverlay: document.querySelector("#pauseOverlay"),
  stage: document.querySelector("#broadcastStage"),
  round: document.querySelector("#roundLabel"),
  remaining: document.querySelector("#remainingLabel"),
  progress: document.querySelector("#progressBar"),
  commissioner: document.querySelector("#commissionerLine"),
  finalActions: document.querySelector("#finalActions"),
  recap: document.querySelector("#recapDialog"),
  recapContent: document.querySelector("#recapContent"),
  recapButton: document.querySelector("#recapButton"),
  closeRecap: document.querySelector("#closeRecapButton"),
  replay: document.querySelector("#replayButton")
};

let runId = 0;
let paused = false;
let state = null;

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffled(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function restaurantFor(id) {
  return restaurants.find((restaurant) => restaurant.id === id);
}

function preferenceScore(player, restaurant) {
  const jitter = Math.random() * 18;
  switch (player.style) {
    case "loyal":
      return restaurant.rating * 1.2 + (restaurant.novelty < 70 ? 22 : 0) + jitter;
    case "critic":
      return restaurant.rating * 1.45 - restaurant.price * 2 + jitter;
    case "social":
      return restaurant.social * 1.35 + restaurant.rating * 0.35 + jitter;
    case "adventurer":
      return restaurant.novelty * 1.45 + restaurant.social * 0.25 + jitter;
    case "planner":
      return restaurant.rating + (25 - restaurant.distance) * 1.4 - restaurant.price * 4 + jitter;
    default:
      return Math.random() * 150;
  }
}

function rankedRestaurants(player, ids, highestFirst = true) {
  return ids
    .map((id) => {
      const restaurant = restaurantFor(id);
      return { id, score: preferenceScore(player, restaurant) };
    })
    .sort((a, b) => highestFirst ? b.score - a.score : a.score - b.score)
    .map((entry) => entry.id);
}

function chooseFavorite(player, ids) {
  return rankedRestaurants(player, ids, true)[0];
}

function chooseElimination(player, ids) {
  return rankedRestaurants(player, ids, false)[0];
}

function tally(votes) {
  return votes.reduce((results, vote) => {
    results[vote] = (results[vote] || 0) + 1;
    return results;
  }, {});
}

function rankedByVotes(voteTally, eligibleIds) {
  return eligibleIds
    .map((id) => ({ id, votes: voteTally[id] || 0, tie: Math.random() }))
    .sort((a, b) => b.votes - a.votes || b.tie - a.tie)
    .map((entry) => entry.id);
}

function isCurrent(token) {
  return token === runId;
}

async function wait(duration, token) {
  let remaining = duration;
  while (remaining > 0 && isCurrent(token)) {
    await new Promise((resolve) => window.setTimeout(resolve, 100));
    if (!paused) remaining -= 100;
  }
  return isCurrent(token);
}

function setStatus(round, progress, message) {
  ui.round.textContent = round;
  ui.progress.style.width = `${progress}%`;
  ui.remaining.textContent = `${state.active.length} restaurant${state.active.length === 1 ? "" : "s"}`;
  ui.commissioner.textContent = message;
}

function buddyPortrait(player, extraClass = "") {
  return `
    <div class="buddy-portrait ${extraClass}" data-buddy-image>
      <span class="buddy-fallback" aria-hidden="true">${player.emoji}</span>
      <img class="buddy-image" src="${player.image}" alt="${player.name}, ${player.role}">
    </div>
  `;
}

function buddyMini(player) {
  return `
    <div class="buddy-mini" data-buddy-image>
      <span aria-hidden="true">${player.emoji}</span>
      <img src="${player.image}" alt="">
    </div>
  `;
}

function activateBuddyImages(container = document) {
  container.querySelectorAll("[data-buddy-image]").forEach((wrapper) => {
    const image = wrapper.querySelector("img");
    if (!image) return;

    const showImage = () => wrapper.classList.add("has-image");
    const keepFallback = () => wrapper.classList.remove("has-image");

    if (image.complete) {
      image.naturalWidth > 0 ? showImage() : keepFallback();
    } else {
      image.addEventListener("load", showImage, { once: true });
      image.addEventListener("error", keepFallback, { once: true });
    }
  });
}

function showMoment(markup) {
  ui.stage.innerHTML = markup;
  activateBuddyImages(ui.stage);
}

function dots(current, total) {
  return `<div class="counter-dots" aria-label="${current + 1} of ${total}">${Array.from({ length: total }, (_, index) => `<span class="${index === current ? "active" : ""}"></span>`).join("")}</div>`;
}

function restaurantLineup(ids) {
  return `
    <div class="restaurant-lineup">
      ${ids.map((id) => {
        const restaurant = restaurantFor(id);
        return `
          <article class="mini-restaurant">
            <div class="restaurant-emoji" aria-hidden="true">${restaurant.emoji}</div>
            <div class="restaurant-details">
              <strong>${restaurant.name}</strong>
              <small>${restaurant.cuisine} · ${"$".repeat(restaurant.price)} · ${restaurant.distance} min</small>
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function voteRows(detail = "Making a private decision…") {
  return `
    <div class="vote-list">
      ${state.players.map((player, index) => `
        <div class="vote-row" data-voter="${index}">
          ${buddyMini(player)}
          <div>
            <strong>${player.name}</strong>
            <small>${detail}</small>
          </div>
          <span class="vote-state thinking">Thinking…</span>
        </div>
      `).join("")}
    </div>
  `;
}

function lockVote(index, detail = "Private vote submitted") {
  const row = ui.stage.querySelector(`[data-voter="${index}"]`);
  if (!row) return;
  const detailNode = row.querySelector("small");
  const stateNode = row.querySelector(".vote-state");
  detailNode.textContent = detail;
  stateNode.textContent = "✓ Locked";
  stateNode.classList.remove("thinking");
  stateNode.classList.add("locked");
}

function buildInitialState() {
  const players = shuffled(buddyRoster).slice(0, 4);
  const active = restaurants.map((restaurant) => restaurant.id);
  const predictions = players.map((player) => {
    const favorite = chooseFavorite(player, active);
    return {
      favorite,
      winner: Math.random() < 0.72 ? favorite : randomItem(active),
      firstOut: chooseElimination(player, active)
    };
  });

  return {
    players,
    active,
    predictions,
    firstEliminated: null,
    secondEliminated: [],
    finalists: [],
    finalVotes: [],
    finalTally: {},
    winner: null,
    standings: [],
    timeline: []
  };
}

async function introducePlayers(token) {
  setStatus("Meet the Bite Buddies", 8, "Tonight’s four AI players are entering the game.");

  for (let index = 0; index < state.players.length; index += 1) {
    if (!isCurrent(token)) return false;
    const player = state.players[index];
    showMoment(`
      <article class="moment">
        <p class="moment-kicker">Player ${index + 1} of ${state.players.length}</p>
        ${buddyPortrait(player)}
        <h2>${player.name}</h2>
        <span class="role-pill">${player.role}</span>
        <p class="moment-copy">${player.trait}</p>
        ${dots(index, state.players.length)}
      </article>
    `);
    ui.commissioner.textContent = `${player.name} joins tonight’s Rate My Bites Game.`;
    if (!await wait(1500, token)) return false;
  }
  return true;
}

async function revealLineup(token) {
  setStatus("Restaurant Lineup", 18, "Six restaurants enter. Only one will win tonight.");
  showMoment(`
    <article class="moment">
      <p class="moment-kicker">Tonight’s Restaurant Board</p>
      <h2>Six choices enter the game.</h2>
      <p class="moment-copy">The Bite Buddies are studying ratings, distance, price, group fit, and their own personalities.</p>
      ${restaurantLineup(state.active)}
    </article>
  `);
  return wait(3000, token);
}

async function lockPredictions(token) {
  setStatus("Private Predictions", 29, "Every Buddy is predicting the winner and the first restaurant out.");
  showMoment(`
    <article class="moment">
      <p class="moment-kicker">Prediction Window</p>
      <h2>Secret picks are being locked.</h2>
      <p class="moment-copy">Predictions stay hidden until the final scoring reveal.</p>
      ${voteRows("Predicting the winner and first elimination…")}
    </article>
  `);

  for (let index = 0; index < state.players.length; index += 1) {
    if (!await wait(650, token)) return false;
    lockVote(index, "Three predictions locked");
    ui.commissioner.textContent = `${state.players[index].name} has submitted all three predictions.`;
  }

  return wait(900, token);
}

async function firstElimination(token) {
  setStatus("Round 1 of 3", 42, "The first elimination vote is underway.");
  showMoment(`
    <article class="moment">
      <p class="moment-kicker">First Elimination</p>
      <h2>Which restaurant leaves first?</h2>
      <p class="moment-copy">Each Buddy votes according to its own dining personality.</p>
      ${voteRows()}
    </article>
  `);

  const votes = state.players.map((player) => chooseElimination(player, state.active));
  for (let index = 0; index < state.players.length; index += 1) {
    if (!await wait(700, token)) return false;
    lockVote(index);
    ui.commissioner.textContent = `${state.players[index].name} has voted.`;
  }

  const voteTally = tally(votes);
  state.firstEliminated = rankedByVotes(voteTally, state.active)[0];
  state.active = state.active.filter((id) => id !== state.firstEliminated);
  const eliminated = restaurantFor(state.firstEliminated);
  state.timeline.push({ icon: "❌", title: "First eliminated", detail: eliminated.name });

  if (!await wait(600, token)) return false;
  setStatus("Round 1 Result", 49, `${eliminated.name} is the first restaurant out.`);
  showMoment(`
    <article class="moment elimination-card">
      <p class="moment-kicker">Eliminated</p>
      <div class="big-emoji" aria-hidden="true">${eliminated.emoji}</div>
      <h2>${eliminated.name}</h2>
      <p class="moment-copy">${eliminated.cuisine} leaves the board with ${voteTally[eliminated.id] || 0} elimination vote${(voteTally[eliminated.id] || 0) === 1 ? "" : "s"}.</p>
      <span class="result-pill">5 restaurants remain</span>
    </article>
  `);
  return wait(2400, token);
}

async function secondElimination(token) {
  setStatus("Round 2 of 3", 61, "Five restaurants are being narrowed to three finalists.");
  showMoment(`
    <article class="moment">
      <p class="moment-kicker">Double Elimination</p>
      <h2>Two more choices must go.</h2>
      <p class="moment-copy">The pressure rises as every Buddy submits another private vote.</p>
      ${voteRows()}
    </article>
  `);

  const votes = state.players.map((player) => chooseElimination(player, state.active));
  for (let index = 0; index < state.players.length; index += 1) {
    if (!await wait(700, token)) return false;
    lockVote(index);
    ui.commissioner.textContent = `${state.players[index].name} has locked a Round 2 vote.`;
  }

  const voteTally = tally(votes);
  state.secondEliminated = rankedByVotes(voteTally, state.active).slice(0, 2);
  state.active = state.active.filter((id) => !state.secondEliminated.includes(id));
  state.finalists = [...state.active];
  const removed = state.secondEliminated.map(restaurantFor);
  state.timeline.push({ icon: "✂️", title: "Double elimination", detail: removed.map((restaurant) => restaurant.name).join(" and ") });

  if (!await wait(600, token)) return false;
  setStatus("Finalists Revealed", 69, "The championship field is set.");
  showMoment(`
    <article class="moment">
      <p class="moment-kicker">Final Three</p>
      <h2>The finalists are set.</h2>
      <p class="moment-copy">Only these three restaurants can win tonight’s game.</p>
      <div class="finalist-row">
        ${state.finalists.map((id) => {
          const restaurant = restaurantFor(id);
          return `<div class="finalist-card"><span aria-hidden="true">${restaurant.emoji}</span><strong>${restaurant.name}</strong></div>`;
        }).join("")}
      </div>
    </article>
  `);
  return wait(2600, token);
}

async function championshipVote(token) {
  setStatus("Round 3 of 3", 79, "The final restaurant vote is arriving one Buddy at a time.");
  showMoment(`
    <article class="moment">
      <p class="moment-kicker">Championship Vote</p>
      <h2>Where will the group eat?</h2>
      <p class="moment-copy">The final decision is private until all four votes are locked.</p>
      ${voteRows("Choosing among the final three…")}
    </article>
  `);

  state.finalVotes = state.players.map((player, index) => {
    const predictedFavorite = state.predictions[index].favorite;
    return state.active.includes(predictedFavorite) && Math.random() < .68
      ? predictedFavorite
      : chooseFavorite(player, state.active);
  });

  for (let index = 0; index < state.players.length; index += 1) {
    if (!await wait(800, token)) return false;
    lockVote(index, "Championship vote locked");
    ui.commissioner.textContent = `${state.players[index].name} has made a final decision.`;
  }

  state.finalTally = tally(state.finalVotes);
  state.winner = rankedByVotes(state.finalTally, state.active)[0];
  const winner = restaurantFor(state.winner);
  state.timeline.push({ icon: "🏆", title: "Restaurant winner", detail: winner.name });

  return wait(900, token);
}

async function revealWinner(token) {
  const winner = restaurantFor(state.winner);
  setStatus("Winner Reveal", 91, `${winner.name} wins tonight’s restaurant vote.`);
  showMoment(`
    <article class="moment winner-card">
      <p class="moment-kicker">Tonight’s Winner</p>
      <div class="big-emoji" aria-hidden="true">${winner.emoji}</div>
      <h2>${winner.name}</h2>
      <p class="moment-copy">${winner.cuisine} · ${"$".repeat(winner.price)} · ${winner.distance} minutes away</p>
      <span class="role-pill">${state.finalTally[winner.id] || 0} final vote${(state.finalTally[winner.id] || 0) === 1 ? "" : "s"}</span>
    </article>
  `);
  return wait(3200, token);
}

function calculateStandings() {
  return state.players.map((player, index) => {
    const prediction = state.predictions[index];
    let score = 2;
    const reasons = ["Played +2"];

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

    return { ...player, score, reasons, prediction };
  }).sort((a, b) => b.score - a.score || Math.random() - .5);
}

function buildRecap() {
  const winner = restaurantFor(state.winner);
  ui.recapContent.innerHTML = `
    <section class="recap-section">
      <div class="recap-winner">
        <strong>${winner.emoji} ${winner.name}</strong>
        <span>${winner.cuisine} · ${state.finalTally[winner.id] || 0} final votes</span>
      </div>
    </section>

    <section class="recap-section">
      <h3>Final Standings</h3>
      ${state.standings.map((player, index) => `
        <div class="score-row ${index === 0 ? "champion" : ""}">
          <div class="rank">${index === 0 ? "🏆" : index + 1}</div>
          ${buddyMini(player)}
          <div>
            <div class="score-name">${player.name} · ${player.role}</div>
            <div class="score-reasons">${player.reasons.join(" · ")}</div>
          </div>
          <div class="score-points">${player.score} pts</div>
        </div>
      `).join("")}
    </section>

    <section class="recap-section">
      <h3>Game Timeline</h3>
      ${state.timeline.map((item) => `
        <div class="timeline-row">
          <span aria-hidden="true">${item.icon}</span>
          <div><strong>${item.title}</strong><small>${item.detail}</small></div>
        </div>
      `).join("")}
    </section>
  `;
  activateBuddyImages(ui.recapContent);
}

function revealChampion() {
  state.standings = calculateStandings();
  const champion = state.standings[0];
  state.timeline.push({ icon: "⭐", title: "Bite Champion", detail: `${champion.name} with ${champion.score} points` });

  setStatus("Final Standings", 100, `${champion.name} is tonight’s Bite Champion.`);
  showMoment(`
    <article class="moment champion-card">
      <p class="moment-kicker">Bite Champion</p>
      ${buddyPortrait(champion, "champion-avatar")}
      <h2>${champion.name}</h2>
      <span class="role-pill">${champion.role}</span>
      <div class="points-total">${champion.score} points</div>
      <p class="moment-copy">${champion.reasons.join(" · ")}</p>
    </article>
  `);

  buildRecap();
  ui.finalActions.classList.remove("hidden");
  ui.pause.classList.add("hidden");
}

async function runGame() {
  const token = ++runId;
  paused = false;
  state = buildInitialState();

  ui.welcome.classList.add("hidden");
  ui.broadcast.classList.remove("hidden");
  ui.pause.classList.remove("hidden");
  ui.finalActions.classList.add("hidden");
  ui.pauseOverlay.classList.add("hidden");
  ui.pause.setAttribute("aria-pressed", "false");
  ui.pauseLabel.textContent = "Pause";

  const steps = [
    introducePlayers,
    revealLineup,
    lockPredictions,
    firstElimination,
    secondElimination,
    championshipVote,
    revealWinner
  ];

  for (const step of steps) {
    const completed = await step(token);
    if (!completed || !isCurrent(token)) return;
  }

  revealChampion();
}

function togglePause(forceValue) {
  if (ui.pause.classList.contains("hidden")) return;
  paused = typeof forceValue === "boolean" ? forceValue : !paused;
  ui.pause.setAttribute("aria-pressed", String(paused));
  ui.pauseLabel.textContent = paused ? "Resume" : "Pause";
  ui.pauseOverlay.classList.toggle("hidden", !paused);
}

function openRecap() {
  if (typeof ui.recap.showModal === "function") {
    ui.recap.showModal();
  } else {
    ui.recap.setAttribute("open", "");
  }
}

function closeRecap() {
  if (typeof ui.recap.close === "function" && ui.recap.open) {
    ui.recap.close();
  } else {
    ui.recap.removeAttribute("open");
  }
}

ui.start.addEventListener("click", runGame);
ui.replay.addEventListener("click", runGame);
ui.pause.addEventListener("click", () => togglePause());
ui.pauseOverlay.addEventListener("click", () => togglePause(false));
ui.recapButton.addEventListener("click", openRecap);
ui.closeRecap.addEventListener("click", closeRecap);
ui.recap.addEventListener("click", (event) => {
  if (event.target === ui.recap) closeRecap();
});
