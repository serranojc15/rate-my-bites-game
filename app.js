const host = { name: "Pup", image: "assets/buddies/buddy-dog.webp" };

const images = {
  people: {
    emma: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=82",
    marcus: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=82",
    olivia: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=700&q=82"
  },
  restaurants: {
    luna: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=82",
    cactus: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1000&q=82",
    azul: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1000&q=82",
    abuela: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=82",
    rojo: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1000&q=82",
    plaza: "https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=1000&q=82"
  },
  food: {
    "Fish tacos": "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=800&q=82",
    "Chicken enchiladas": "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?auto=format&fit=crop&w=800&q=82",
    "Steak fajitas": "https://images.unsplash.com/photo-1611250188496-e966043a0629?auto=format&fit=crop&w=800&q=82",
    "Lime margarita": "https://images.unsplash.com/photo-1556855810-ac404aa91e85?auto=format&fit=crop&w=800&q=82",
    "Sweet tea": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=82",
    "Sparkling water": "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=800&q=82",
    "Churros": "https://images.unsplash.com/photo-1624371414361-e670edf4898d?auto=format&fit=crop&w=800&q=82",
    "Tres leches": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=82",
    "No dessert": "https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&w=800&q=82"
  }
};

const restaurants = [
  { id: "luna", name: "Casa Luna", distance: "3.2 mi", price: "$$", style: "Modern Mexican", atmosphere: "Warm lights · social patio", description: "A polished neighborhood favorite with modern plates and a lively bar.", menu: { meal: ["Fish tacos", "Chicken enchiladas", "Steak fajitas"], drink: ["Lime margarita", "Sweet tea", "Sparkling water"], dessert: ["Churros", "Tres leches", "No dessert"] } },
  { id: "cactus", name: "Cactus Cantina", distance: "1.8 mi", price: "$", style: "Fast & casual", atmosphere: "Bright · energetic · quick", description: "A casual counter-service spot known for bold flavors and easy prices.", menu: { meal: ["Spicy chicken burrito", "Carne asada tacos", "Veggie bowl"], drink: ["Horchata", "Mexican Coke", "Water"], dessert: ["Cinnamon sopapillas", "Flan", "No dessert"] } },
  { id: "azul", name: "Azul Mar", distance: "7.4 mi", price: "$$$", style: "Coastal Mexican", atmosphere: "Upscale · date-night", description: "Seafood-forward Mexican cooking in a sophisticated coastal dining room.", menu: { meal: ["Grilled mahi tacos", "Shrimp enchiladas", "Chicken mole"], drink: ["Cucumber agua fresca", "Paloma", "Sparkling water"], dessert: ["Coconut flan", "Tres leches", "No dessert"] } },
  { id: "abuela", name: "Abuela’s Table", distance: "5.1 mi", price: "$$", style: "Traditional family recipes", atmosphere: "Cozy · familiar · relaxed", description: "Comforting recipes, generous portions, and the feeling of a family table.", menu: { meal: ["Beef tamales", "Cheese enchiladas", "Chicken tortilla soup"], drink: ["Sweet tea", "Horchata", "Water"], dessert: ["Flan", "Churros", "No dessert"] } },
  { id: "rojo", name: "Rojo Taco Lab", distance: "6.6 mi", price: "$$", style: "Creative street tacos", atmosphere: "Trendy · loud · adventurous", description: "Unexpected taco combinations in a colorful, high-energy room.", menu: { meal: ["Korean beef tacos", "Hot honey chicken tacos", "Avocado tostadas"], drink: ["Mango agua fresca", "Spicy margarita", "Mexican Coke"], dessert: ["Churro bites", "Mexican chocolate cookie", "No dessert"] } },
  { id: "plaza", name: "Plaza Fiesta", distance: "4.0 mi", price: "$$", style: "Lively neighborhood favorite", atmosphere: "Festive · group-friendly", description: "A dependable celebration spot with big tables and familiar favorites.", menu: { meal: ["Steak fajitas", "Combo enchiladas", "Fish tacos"], drink: ["House margarita", "Sweet tea", "Water"], dessert: ["Fried ice cream", "Sopapillas", "No dessert"] } }
];

const actualRestaurantId = "luna";

const diners = [
  { id: "emma", name: "Emma", role: "The Adventurer", intro: "Curious, social, and usually ready to try something new.", favorite: "Seafood & modern Mexican", funFact: "She photographs almost every memorable meal.", facts: ["Orders seafood often", "Usually stays within 10 miles", "Dessert about half the time"], clues: { restaurant: "Emma ate fried catfish yesterday, so another seafood-focused restaurant may be less appealing.", meal: "She wants something lighter than fajitas and is willing to move away from fish tonight.", drink: "She is driving tonight.", dessert: "She skipped lunch, but says she does not want a heavy finish." }, actual: { meal: "Chicken enchiladas", drink: "Sparkling water", dessert: "No dessert" }, why: "Emma chose something lighter after yesterday’s fish, ordered sparkling water because she was driving, and skipped dessert." },
  { id: "marcus", name: "Marcus", role: "The Traditionalist", intro: "Budget-minded, dependable, and always arrives hungry.", favorite: "Beef, comfort food & sweet tea", funFact: "His current dessert streak is six dinners.", facts: ["Favors familiar places", "Usually orders beef", "Almost always gets dessert"], clues: { restaurant: "Marcus paid for an expensive dinner last night and wants somewhere nearby at a moderate price.", meal: "He ran five miles this afternoon and wants the most filling option.", drink: "He orders sweet tea with most casual dinners.", dessert: "His dessert streak is currently six dinners." }, actual: { meal: "Steak fajitas", drink: "Sweet tea", dessert: "Churros" }, why: "Marcus backed the close, moderately priced choice, went with the filling beef option, stayed loyal to sweet tea, and protected his dessert streak." },
  { id: "olivia", name: "Olivia", role: "The Social Planner", intro: "She values atmosphere, celebration, and keeping the whole table happy.", favorite: "Shareable plates & margaritas", funFact: "She remembers everyone’s favorite restaurant.", facts: ["Likes lively rooms", "Often orders margaritas", "Returns to trusted favorites"], clues: { restaurant: "Olivia is celebrating a promotion, but she also wants a place that works for everyone in the group.", meal: "She wants something the table can easily share.", drink: "She is not driving and called this a celebration dinner.", dessert: "The group mentioned sharing one dessert for the table." }, actual: { meal: "Steak fajitas", drink: "Lime margarita", dessert: "Tres leches" }, why: "Olivia chose shareable fajitas, celebrated with a margarita, and finished with a dessert that worked for the table." }
];

const dinerStages = ["meal", "drink", "dessert"];
const points = { restaurant: 120, meal: 30, drink: 20, dessert: 10 };
const labels = { restaurant: "Restaurant", meal: "Entrée", drink: "Drink", dessert: "Dessert" };
const app = document.querySelector("#app");
const restartButton = document.querySelector("#restartButton");
let state = initialState();

function initialState() { return { screen: "welcome", introIndex: 0, stageIndex: 0, dinerIndex: 0, groupRestaurant: null, picks: {}, score: 0 }; }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]); }
function restaurantFor(id) { return restaurants.find(item => item.id === id); }
function actualRestaurant() { return restaurantFor(actualRestaurantId); }
function photo(url, alt, className = "") { return `<img class="${className}" src="${url}" alt="${escapeHtml(alt)}" loading="lazy">`; }
function hostCard(text) { return `<div class="host-card">${photo(host.image, "Pup, Bite Buddy League host")}<div><strong>${host.name}, League Host</strong><p>${text}</p></div></div>`; }
function getBoard() { try { return JSON.parse(localStorage.getItem("rmb-taco-board-v2") || "[]"); } catch { return []; } }
function getStats() { try { return JSON.parse(localStorage.getItem("rmb-taco-stats-v2") || "null") || { games: 0, highScore: 0, streak: 0, restaurantCorrect: 0, correct: { meal: 0, drink: 0, dessert: 0 }, attempts: { meal: 0, drink: 0, dessert: 0 } }; } catch { return { games: 0, highScore: 0, streak: 0, restaurantCorrect: 0, correct: { meal: 0, drink: 0, dessert: 0 }, attempts: { meal: 0, drink: 0, dessert: 0 } }; } }
function percent(correct, total) { return total ? `${Math.round((correct / total) * 100)}%` : "—"; }
function hallOfFame() { const stats = getStats(); return `<section class="hall"><div class="section-heading"><div><p class="eyebrow">Your Hall of Fame</p><h2>League history</h2></div><span>${stats.games} game${stats.games === 1 ? "" : "s"}</span></div><div class="stat-grid"><div><strong>${stats.highScore}</strong><span>High score</span></div><div><strong>${percent(stats.restaurantCorrect, stats.games)}</strong><span>Restaurant</span></div><div><strong>${percent(stats.correct.meal, stats.attempts.meal)}</strong><span>Entrées</span></div><div><strong>${percent(stats.correct.drink, stats.attempts.drink)}</strong><span>Drinks</span></div><div><strong>${percent(stats.correct.dessert, stats.attempts.dessert)}</strong><span>Desserts</span></div><div><strong>${stats.streak}</strong><span>Streak</span></div></div></section>`; }
function progress() { const complete = state.stageIndex * diners.length + state.dinerIndex; const total = dinerStages.length * diners.length; const stage = dinerStages[state.stageIndex]; return `<div class="progress-wrap"><div class="progress-meta"><span>${labels[stage]} round</span><span>${complete + 1} of ${total}</span></div><div class="progress-track"><span style="width:${25 + Math.round((complete / total) * 75)}%"></span></div></div>`; }

function render() {
  restartButton.classList.toggle("hidden", state.screen === "welcome");
  app.classList.remove("screen-enter"); void app.offsetWidth; app.classList.add("screen-enter");
  if (state.screen === "welcome") welcome();
  if (state.screen === "intro") intro();
  if (state.screen === "restaurant") restaurantRound();
  if (state.screen === "restaurantReveal") restaurantReveal();
  if (state.screen === "play") play();
  if (state.screen === "results") results();
}

function welcome() {
  app.innerHTML = `<div class="hero"><p class="eyebrow">Bite Buddy League · Taco Tuesday</p><div class="show-logo"><span>🌮</span><div><strong>Bite Buddy League</strong><small>Powered by Rate My Bites</small></div></div><h1>Know the person.<br>Predict the meal.</h1><p class="lead">Three people are planning one dinner. Study who they are, predict where the group goes, then prove how well you know each order.</p><div class="mantra">One table. Three personalities. Twelve predictions.</div><button class="primary-button wide" id="start">Meet Tonight’s People</button>${hallOfFame()}</div>`;
  document.querySelector("#start").onclick = () => { state.screen = "intro"; state.introIndex = 0; render(); };
}

function intro() {
  const person = diners[state.introIndex];
  app.innerHTML = `<div class="intro-stage"><div class="intro-top"><p class="eyebrow">Meet Tonight’s People</p><button class="text-button" id="skip">Skip intro</button></div>${hostCard(state.introIndex === 0 ? "Welcome back, Biters! Tonight, three people are planning dinner together. Pay attention—every detail could matter." : `Next up is ${person.name}. What do their habits tell you about tonight?`)}<article class="person-feature">${photo(images.people[person.id], person.name, "person-hero")}<div class="person-copy"><span class="role-tag">${person.role}</span><h1>${person.name}</h1><p>${person.intro}</p><div class="profile-lines"><div><span>Favorite</span><strong>${person.favorite}</strong></div><div><span>Fun fact</span><strong>${person.funFact}</strong></div></div><div class="fact-list">${person.facts.map(fact => `<div class="fact">${fact}</div>`).join("")}</div></div></article><div class="intro-dots">${diners.map((_, i) => `<span class="${i === state.introIndex ? "active" : ""}"></span>`).join("")}</div><div class="actions"><button class="primary-button" id="nextIntro">${state.introIndex === diners.length - 1 ? "Predict the Group Restaurant" : "Meet the Next Person"}</button></div></div>`;
  document.querySelector("#skip").onclick = () => { state.screen = "restaurant"; render(); };
  document.querySelector("#nextIntro").onclick = () => { if (state.introIndex < diners.length - 1) state.introIndex += 1; else state.screen = "restaurant"; render(); };
}

function personMini(person, clue) { return `<article class="person-mini">${photo(images.people[person.id], person.name)}<div><strong>${person.name}</strong><small>${clue}</small></div></article>`; }
function restaurantCard(r) { return `<button class="restaurant-card ${state.groupRestaurant === r.id ? "selected" : ""}" data-value="${r.id}">${photo(images.restaurants[r.id], `${r.name} restaurant`)}<span class="restaurant-copy"><span class="restaurant-meta">${r.style} · ${r.price} · ${r.distance}</span><strong>${r.name}</strong><small>${r.description}</small><em>${r.atmosphere}</em></span></button>`; }

function restaurantRound() {
  app.innerHTML = `<div class="progress-wrap"><div class="progress-meta"><span>Group restaurant round</span><span>1 shared choice</span></div><div class="progress-track"><span style="width:12%"></span></div></div>${hostCard("All three people must agree on one restaurant. Look for the strongest group compromise—not just one person’s favorite.")}<div class="people-strip">${diners.map(person => personMini(person, person.clues.restaurant)).join("")}</div><div class="section-heading"><div><p class="eyebrow">Make Your Prediction</p><h2>Where will the group eat?</h2></div></div><div class="restaurant-grid">${restaurants.map(restaurantCard).join("")}</div><p class="lock-note">This is one prediction for the entire group.</p><div class="actions"><button class="primary-button" id="lockRestaurant" ${state.groupRestaurant ? "" : "disabled"}>Lock Group Restaurant</button></div>`;
  app.querySelectorAll(".restaurant-card").forEach(button => button.onclick = () => { state.groupRestaurant = button.dataset.value; render(); });
  document.querySelector("#lockRestaurant").onclick = () => { if (state.groupRestaurant) { state.screen = "restaurantReveal"; render(); } };
}

function restaurantReveal() {
  const restaurant = actualRestaurant(); const correct = state.groupRestaurant === actualRestaurantId;
  app.innerHTML = `<p class="eyebrow">The Votes Are In</p><h1 class="screen-title">The group chose ${restaurant.name}.</h1>${hostCard(correct ? "You read the room perfectly. This was the best match for the entire group." : "The group found a different compromise. Here’s what tipped the decision.")}<article class="reveal-card photo-reveal">${photo(images.restaurants[restaurant.id], restaurant.name)}<div class="reveal-content"><div class="reveal-head"><strong>${restaurant.name}</strong><span class="score-pill">${correct ? "+120" : "0"}</span></div><div class="answer-row ${correct ? "correct" : "wrong"}"><span>Your prediction: ${restaurantFor(state.groupRestaurant).name}</span><span>${correct ? "✓ Correct" : "✕ Incorrect"}</span></div><p class="explanation">Casa Luna balanced Marcus’s price and distance concerns, Olivia’s celebration mood, and Emma’s desire for something modern without another seafood-heavy meal.</p></div></article><div class="actions"><button class="primary-button" id="orders">Predict Their Orders</button></div>`;
  document.querySelector("#orders").onclick = () => { state.screen = "play"; render(); };
}

function optionImage(value, stage) { return images.food[value] || images.food[stage === "meal" ? "Fish tacos" : stage === "drink" ? "Lime margarita" : "Churros"]; }
function availableOptions(stage) { return actualRestaurant().menu[stage].map(value => ({ value, image: optionImage(value, stage) })); }

function play() {
  const stage = dinerStages[state.stageIndex]; const person = diners[state.dinerIndex]; const selected = state.picks[person.id]?.[stage]; const restaurant = actualRestaurant();
  app.innerHTML = `${progress()}${hostCard(person.clues[stage])}<div class="round-person">${photo(images.people[person.id], person.name)}<div><span class="role-tag">${person.role}</span><h2>${person.name}</h2><p>What will ${person.name} order at ${restaurant.name}?</p></div></div><div class="choice-grid">${availableOptions(stage).map(option => `<button class="food-option ${selected === option.value ? "selected" : ""}" data-value="${option.value}">${photo(option.image, option.value)}<span><strong>${option.value}</strong><small>${labels[stage]} at ${restaurant.name}</small></span></button>`).join("")}</div><p class="lock-note">You may change this prediction until you continue.</p><div class="actions"><button class="primary-button" id="continue" ${selected ? "" : "disabled"}>${state.dinerIndex === diners.length - 1 ? `Finish ${labels[stage]} Round` : `Lock ${person.name}`}</button></div>`;
  app.querySelectorAll(".food-option").forEach(button => button.onclick = () => { state.picks[person.id] ??= {}; state.picks[person.id][stage] = button.dataset.value; render(); });
  document.querySelector("#continue").onclick = () => { if (!state.picks[person.id]?.[stage]) return; if (state.dinerIndex < diners.length - 1) state.dinerIndex += 1; else if (state.stageIndex < dinerStages.length - 1) { state.stageIndex += 1; state.dinerIndex = 0; } else { calculateScore(); updateStats(); state.screen = "results"; } render(); };
}

function calculateScore() { state.score = state.groupRestaurant === actualRestaurantId ? points.restaurant : 0; diners.forEach(person => dinerStages.forEach(stage => { if (state.picks[person.id]?.[stage] === person.actual[stage]) state.score += points[stage]; })); }
function updateStats() { const stats = getStats(); stats.games += 1; stats.highScore = Math.max(stats.highScore, state.score); const restaurantCorrect = state.groupRestaurant === actualRestaurantId; stats.restaurantCorrect += restaurantCorrect ? 1 : 0; stats.streak = restaurantCorrect ? stats.streak + 1 : 0; diners.forEach(person => dinerStages.forEach(stage => { stats.attempts[stage] += 1; if (state.picks[person.id]?.[stage] === person.actual[stage]) stats.correct[stage] += 1; })); localStorage.setItem("rmb-taco-stats-v2", JSON.stringify(stats)); }
function saveScore() { const input = document.querySelector("#nickname"); const name = (input.value || "Player").trim().slice(0, 18) || "Player"; const board = [...getBoard(), { name, score: state.score, date: new Date().toLocaleDateString("en-US") }].sort((a, b) => b.score - a.score).slice(0, 5); localStorage.setItem("rmb-taco-board-v2", JSON.stringify(board)); render(); }

function results() {
  const board = getBoard(); const restaurant = actualRestaurant(); const restaurantCorrect = state.groupRestaurant === actualRestaurantId; const title = state.score >= 250 ? "People Whisperer" : state.score >= 180 ? "Dinner Detective" : state.score >= 100 ? "Clue Chaser" : "Rookie Biter";
  app.innerHTML = `<p class="eyebrow">Final Reveal</p><h1 class="screen-title">${title}</h1><div class="total-score"><strong>${state.score}</strong><span>out of 300 points</span></div><article class="reveal-card"><div class="reveal-head"><strong>Shared Restaurant · ${restaurant.name}</strong><span class="score-pill">${restaurantCorrect ? "120/120" : "0/120"}</span></div><div class="answer-row ${restaurantCorrect ? "correct" : "wrong"}"><span>Your pick: ${restaurantFor(state.groupRestaurant).name}</span><span>${restaurantCorrect ? "✓ +120" : `✕ ${restaurant.name}`}</span></div></article>${diners.map(person => { let personScore = 0; const rows = dinerStages.map(stage => { const pick = state.picks[person.id]?.[stage]; const correct = pick === person.actual[stage]; if (correct) personScore += points[stage]; return `<div class="answer-row ${correct ? "correct" : "wrong"}"><span>${labels[stage]}: ${pick || "—"}</span><span>${correct ? `✓ +${points[stage]}` : `✕ ${person.actual[stage]}`}</span></div>`; }).join(""); return `<article class="reveal-card person-result"><div class="person-result-head">${photo(images.people[person.id], person.name)}<div><strong>${person.name}</strong><small>${person.role}</small></div><span class="score-pill">${personScore}/60</span></div>${rows}<p class="explanation">${person.why}</p></article>`; }).join("")}<h2>Top Biters</h2><div class="name-entry"><input id="nickname" maxlength="18" placeholder="Your nickname" aria-label="Your nickname"><button class="secondary-button" id="save">Save Score</button></div>${board.length ? `<table class="leaderboard"><thead><tr><th>Player</th><th>Date</th><th>Score</th></tr></thead><tbody>${board.map((row, index) => `<tr><td>${index + 1}. ${escapeHtml(row.name)}</td><td>${escapeHtml(row.date)}</td><td>${row.score}</td></tr>`).join("")}</tbody></table>` : `<p class="lead">No saved scores yet. Be the first league leader.</p>`}<div class="actions"><button class="primary-button" id="again">Play Again</button></div>`;
  document.querySelector("#save").onclick = saveScore; document.querySelector("#again").onclick = reset;
}

function reset() { state = initialState(); render(); }
restartButton.onclick = reset;
render();