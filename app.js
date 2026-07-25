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
    abuela: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5f?auto=format&fit=crop&w=1000&q=82",
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
  {
    id: "emma", name: "Emma", role: "The Adventurer", intro: "Curious, social, and usually ready to try something new.", favorite: "Seafood & modern Mexican", funFact: "She photographs almost every memorable meal.", facts: ["Orders seafood often", "Usually stays within 10 miles", "Dessert about half the time"], permission: "full", permissionLabel: "Full case file shared",
    preferences: ["Seafood", "Spicy food", "Modern Mexican", "Mocktails", "Outdoor patios"], dislikes: ["Heavy lunches", "Repeating the same cuisine two days in a row"],
    places: ["Casa Luna · 4.8★", "Azul Mar · 4.6★", "Rojo Taco Lab · Must Try"],
    activity: [
      { icon: "🍽️", title: "Recent meal", text: "Rated fried catfish 4.7★ yesterday" },
      { icon: "🔖", title: "Must Try", text: "Saved Rojo Taco Lab’s hot honey tacos" },
      { icon: "🚻", title: "Restrooms", text: "Cleanliness matters · average rating 4.8★" },
      { icon: "🎟️", title: "Deal", text: "Viewed Casa Luna happy hour twice" },
      { icon: "📅", title: "Event", text: "Interested in Patio Music Thursday" }
    ],
    clues: { restaurant: "Emma ate fried catfish yesterday, so another seafood-focused restaurant may be less appealing.", meal: "She wants something lighter than fajitas and is willing to move away from fish tonight.", drink: "She is driving tonight.", dessert: "She skipped lunch, but says she does not want a heavy finish." },
    actual: { meal: "Chicken enchiladas", drink: "Sparkling water", dessert: "No dessert" }, why: "Emma chose something lighter after yesterday’s fish, ordered sparkling water because she was driving, and skipped dessert."
  },
  {
    id: "marcus", name: "Marcus", role: "The Traditionalist", intro: "Budget-minded, dependable, and always arrives hungry.", favorite: "Beef, comfort food & sweet tea", funFact: "His current dessert streak is six dinners.", facts: ["Favors familiar places", "Usually orders beef", "Almost always gets dessert"], permission: "limited", permissionLabel: "Some evidence shared",
    preferences: ["Beef entrées", "Sweet tea", "Familiar restaurants"], dislikes: [],
    places: ["Plaza Fiesta · frequent visit", "Abuela’s Table · 4.5★"],
    activity: [
      { icon: "🎟️", title: "Deals · summary", text: "Regularly saves weekday specials" },
      { icon: "🔖", title: "Must Try", text: "Saved Casa Luna’s fajitas for two" },
      { icon: "🚻", title: "Restrooms", text: "Private" },
      { icon: "📅", title: "Events · summary", text: "Prefers quieter group events" }
    ],
    clues: { restaurant: "Marcus paid for an expensive dinner last night and wants somewhere nearby at a moderate price.", meal: "He ran five miles this afternoon and wants the most filling option.", drink: "He orders sweet tea with most casual dinners.", dessert: "His dessert streak is currently six dinners." },
    actual: { meal: "Steak fajitas", drink: "Sweet tea", dessert: "Churros" }, why: "Marcus backed the close, moderately priced choice, went with the filling beef option, stayed loyal to sweet tea, and protected his dessert streak."
  },
  {
    id: "olivia", name: "Olivia", role: "The Social Planner", intro: "She values atmosphere, celebration, and keeping the whole table happy.", favorite: "Shareable plates & margaritas", funFact: "She remembers everyone’s favorite restaurant.", facts: ["Likes lively rooms", "Often orders margaritas", "Returns to trusted favorites"], permission: "none", permissionLabel: "Detailed history private",
    preferences: [], dislikes: [], places: [],
    activity: [
      { icon: "🔒", title: "Dining history", text: "Olivia has not shared this category" },
      { icon: "🔒", title: "Restrooms", text: "Private" },
      { icon: "📅", title: "Event clue", text: "Shared for this game: celebrating a promotion" }
    ],
    clues: { restaurant: "Olivia is celebrating a promotion, but she also wants a place that works for everyone in the group.", meal: "She wants something the table can easily share.", drink: "She is not driving and called this a celebration dinner.", dessert: "The group mentioned sharing one dessert for the table." },
    actual: { meal: "Steak fajitas", drink: "Lime margarita", dessert: "Tres leches" }, why: "Olivia chose shareable fajitas, celebrated with a margarita, and finished with a dessert that worked for the table."
  }
];

const dinerStages = ["meal", "drink", "dessert"];
const points = { restaurant: 120, meal: 30, drink: 20, dessert: 10 };
const labels = { restaurant: "Restaurant", meal: "Entrée", drink: "Drink", dessert: "Dessert" };
const app = document.querySelector("#app");
const restartButton = document.querySelector("#restartButton");
let timerHandle = null;
let state = initialState();

function initialState() { return { screen: "welcome", introIndex: 0, stageIndex: 0, dinerIndex: 0, groupRestaurant: null, picks: {}, confidence: {}, score: 0, timerSeconds: 60, timeLeft: 60, timedOut: false }; }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]); }
function restaurantFor(id) { return restaurants.find(item => item.id === id); }
function actualRestaurant() { return restaurantFor(actualRestaurantId); }
function photo(url, alt, className = "") { return `<img class="${className}" src="${url}" alt="${escapeHtml(alt)}" loading="lazy">`; }
function hostCard(text) { return `<div class="host-card">${photo(host.image, "Pup, Bite Buddy League host")}<div><strong>${host.name}, League Host</strong><p>${text}</p></div></div>`; }
function getBoard() { try { return JSON.parse(localStorage.getItem("rmb-taco-board-v2") || "[]"); } catch { return []; } }
function getStats() { try { return JSON.parse(localStorage.getItem("rmb-taco-stats-v2") || "null") || { games: 0, highScore: 0, streak: 0, restaurantCorrect: 0, correct: { meal: 0, drink: 0, dessert: 0 }, attempts: { meal: 0, drink: 0, dessert: 0 } }; } catch { return { games: 0, highScore: 0, streak: 0, restaurantCorrect: 0, correct: { meal: 0, drink: 0, dessert: 0 }, attempts: { meal: 0, drink: 0, dessert: 0 } }; } }
function percent(correct, total) { return total ? `${Math.round((correct / total) * 100)}%` : "—"; }
function hallOfFame() { const s = getStats(); return `<section class="hall"><div class="section-heading"><div><p class="eyebrow">Your Hall of Fame</p><h2>League history</h2></div><span>${s.games} game${s.games === 1 ? "" : "s"}</span></div><div class="stat-grid"><div><strong>${s.highScore}</strong><span>High score</span></div><div><strong>${percent(s.restaurantCorrect, s.games)}</strong><span>Restaurant</span></div><div><strong>${percent(s.correct.meal, s.attempts.meal)}</strong><span>Entrées</span></div><div><strong>${percent(s.correct.drink, s.attempts.drink)}</strong><span>Drinks</span></div><div><strong>${percent(s.correct.dessert, s.attempts.dessert)}</strong><span>Desserts</span></div><div><strong>${s.streak}</strong><span>Streak</span></div></div></section>`; }
function progress() { const complete = state.stageIndex * diners.length + state.dinerIndex; const total = dinerStages.length * diners.length; const stage = dinerStages[state.stageIndex]; return `<div class="progress-wrap"><div class="progress-meta"><span>${labels[stage]} round</span><span>${complete + 1} of ${total}</span></div><div class="progress-track"><span style="width:${25 + Math.round((complete / total) * 75)}%"></span></div></div>`; }
function confidenceKey(personId, stage) { return `${personId}-${stage}`; }
function currentConfidence(personId, stage) { return state.confidence[confidenceKey(personId, stage)] || 0; }
function confidenceControl(personId, stage) { const selected = currentConfidence(personId, stage); return `<div class="confidence-box"><div><strong>How confident are you?</strong><small>This becomes part of your final read.</small></div><div class="confidence-buttons" aria-label="Confidence level">${[1,2,3,4,5].map(value => `<button type="button" class="confidence-button ${selected === value ? "selected" : ""}" data-confidence="${value}" aria-label="${value} out of 5 confidence">${value}</button>`).join("")}</div></div>`; }
function timerMarkup() { if (!state.timerSeconds) return `<div class="timer-bar untimed"><span>∞</span><div><strong>Untimed investigation</strong><small>Take as long as you need</small></div></div>`; const urgent = state.timeLeft <= 10; return `<div class="timer-bar ${urgent ? "urgent" : ""}"><span id="timerValue">${state.timeLeft}</span><div><strong>${urgent ? "Make your final read" : "Prediction clock"}</strong><small>${state.timedOut ? "Time expired · latest selection locked" : "The clock keeps running while case files are open"}</small></div></div>`; }
function stopTimer() { if (timerHandle) clearInterval(timerHandle); timerHandle = null; }
function startTimer(onExpire) { stopTimer(); state.timedOut = false; state.timeLeft = state.timerSeconds; if (!state.timerSeconds) return; timerHandle = setInterval(() => { state.timeLeft -= 1; const value = document.querySelector("#timerValue"); if (value) { value.textContent = state.timeLeft; value.closest(".timer-bar")?.classList.toggle("urgent", state.timeLeft <= 10); } if (state.timeLeft <= 0) { stopTimer(); state.timedOut = true; onExpire(); } }, 1000); }

function bindPeopleCards() {
  app.querySelectorAll("[data-person]").forEach(el => {
    el.onclick = event => { if (event.target.closest("button") && !event.target.closest("[data-person]")) return; openPersonCard(diners.find(person => person.id === el.dataset.person)); };
    el.onkeydown = event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openPersonCard(diners.find(person => person.id === el.dataset.person)); } };
  });
}

function evidenceList(items) { return `<div class="evidence-list">${items.map(item => `<div class="evidence-item"><span>${item.icon}</span><div><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.text)}</p></div></div>`).join("")}</div>`; }
function tabPanel(person, tab) {
  if (tab === "profile") return `<div class="case-section"><div class="profile-lines"><div><span>Favorite</span><strong>${person.favorite}</strong></div><div><span>Fun fact</span><strong>${person.funFact}</strong></div></div><div class="fact-list">${person.facts.map(fact => `<div class="fact">${fact}</div>`).join("")}</div></div>`;
  if (tab === "preferences") {
    if (person.permission === "none") return `<div class="privacy-message"><strong>🔒 Preferences are private</strong><p>${person.name} has not given permission to share detailed food or drink preferences. Game-specific clues may still appear.</p></div>`;
    return `<div class="case-section"><div class="privacy-banner ${person.permission === "limited" ? "limited" : "shared"}"><strong>${person.permission === "limited" ? "◐ Limited sharing" : "✓ Shared with this group"}</strong><span>${person.permission === "limited" ? "Only selected categories are visible." : "Permission granted for this game."}</span></div><h3>Food & drink</h3><div class="preference-chips">${person.preferences.map(item => `<span>${escapeHtml(item)}</span>`).join("")}</div>${person.dislikes.length ? `<h3>Usually avoids</h3><div class="preference-chips avoid">${person.dislikes.map(item => `<span>${escapeHtml(item)}</span>`).join("")}</div>` : ""}</div>`;
  }
  if (tab === "places") return person.places.length ? `<div class="case-section"><h3>Places evidence</h3>${person.places.map(place => `<div class="place-evidence">📍 ${escapeHtml(place)}</div>`).join("")}${person.permission === "limited" ? `<p class="privacy-footnote">Only selected place history is shared.</p>` : ""}</div>` : `<div class="privacy-message"><strong>🔒 Place history is private</strong><p>No restaurant history is available to this league.</p></div>`;
  return `<div class="case-section"><h3>Recent activity & evidence</h3>${evidenceList(person.activity)}<p class="data-note">Future live games will replace these simulation clues with permission-approved Rate My Bites data.</p></div>`;
}

function openPersonCard(person) {
  document.querySelector(".person-modal")?.remove();
  const modal = document.createElement("div");
  modal.className = "person-modal";
  modal.innerHTML = `<div class="modal-backdrop" data-close></div><section class="person-modal-card" role="dialog" aria-modal="true" aria-label="${escapeHtml(person.name)} case file"><button class="modal-close" data-close aria-label="Close">×</button>${photo(images.people[person.id], person.name, "modal-person-photo")}<div class="modal-person-content"><p class="eyebrow">Case File · Evidence Available</p><span class="role-tag">${person.role}</span><h2>${person.name}</h2><p>${person.intro}</p><div class="permission-row"><span class="permission-badge ${person.permission}">${person.permission === "full" ? "✓" : person.permission === "limited" ? "◐" : "🔒"} ${person.permissionLabel}</span></div><div class="case-tabs" role="tablist">${["profile","preferences","places","activity"].map((tab, index) => `<button class="case-tab ${index === 0 ? "active" : ""}" data-tab="${tab}" type="button">${tab[0].toUpperCase() + tab.slice(1)}</button>`).join("")}</div><div class="case-panel">${tabPanel(person, "profile")}</div></div></section>`;
  document.body.appendChild(modal); document.body.classList.add("modal-open");
  const close = () => { modal.remove(); document.body.classList.remove("modal-open"); };
  modal.querySelectorAll("[data-close]").forEach(el => el.onclick = close);
  modal.querySelectorAll(".case-tab").forEach(button => button.onclick = () => { modal.querySelectorAll(".case-tab").forEach(tab => tab.classList.remove("active")); button.classList.add("active"); modal.querySelector(".case-panel").innerHTML = tabPanel(person, button.dataset.tab); });
  document.addEventListener("keydown", function onKey(event) { if (event.key === "Escape") { close(); document.removeEventListener("keydown", onKey); } });
}

function render() {
  stopTimer();
  restartButton.classList.toggle("hidden", state.screen === "welcome");
  app.classList.remove("screen-enter"); void app.offsetWidth; app.classList.add("screen-enter");
  if (state.screen === "welcome") welcome();
  if (state.screen === "planner") planner();
  if (state.screen === "intro") intro();
  if (state.screen === "restaurant") restaurantRound();
  if (state.screen === "restaurantReveal") restaurantReveal();
  if (state.screen === "play") play();
  if (state.screen === "results") results();
  bindPeopleCards();
}

function welcome() {
  app.innerHTML = `<div class="hero"><p class="eyebrow">Bite Buddy League · Sprint 3</p><div class="show-logo"><span>🕵️</span><div><strong>The Investigation Update</strong><small>Powered by Rate My Bites</small></div></div><h1>Know the person.<br>Read the evidence.</h1><p class="lead">Study permission-approved case files, predict one shared restaurant, then prove how well you understand each person’s order.</p><div class="mantra">People are the game. Food is the evidence.</div><button class="primary-button wide" id="start">Create Simulation Game</button>${hallOfFame()}</div>`;
  document.querySelector("#start").onclick = () => { state.screen = "planner"; render(); };
}

function planner() {
  app.innerHTML = `<p class="eyebrow">Planner Mode</p><h1 class="screen-title">Set the prediction clock.</h1>${hostCard("For live Rate My Bites games, the planner will choose a real deadline. This simulation uses a timer for each prediction.")}<section class="planner-card"><h2>Time per prediction</h2><p>Opening a case file does not pause the clock.</p><div class="timer-options">${[{v:30,l:"30 sec",s:"Fast"},{v:60,l:"60 sec",s:"Recommended"},{v:120,l:"120 sec",s:"Investigate"},{v:0,l:"Unlimited",s:"Untimed"}].map(option => `<button class="timer-option ${state.timerSeconds === option.v ? "selected" : ""}" data-timer="${option.v}"><strong>${option.l}</strong><span>${option.s}</span></button>`).join("")}</div><div class="planner-summary"><span>League</span><strong>Simulation · Taco Tuesday</strong><span>Players</span><strong>Emma, Marcus & Olivia</strong><span>Deadline behavior</span><strong>Lock latest selection when time expires</strong></div></section><div class="actions"><button class="primary-button" id="begin">Meet Tonight’s People</button></div>`;
  app.querySelectorAll(".timer-option").forEach(button => button.onclick = () => { state.timerSeconds = Number(button.dataset.timer); state.timeLeft = state.timerSeconds; render(); });
  document.querySelector("#begin").onclick = () => { state.screen = "intro"; state.introIndex = 0; render(); };
}

function intro() {
  const person = diners[state.introIndex];
  app.innerHTML = `<div class="intro-stage"><div class="intro-top"><p class="eyebrow">Meet Tonight’s People</p><button class="text-button" id="skip">Skip intro</button></div>${hostCard(state.introIndex === 0 ? "Welcome, Biters. Tap each person to inspect their permission-aware case file." : `Next up is ${person.name}. Their habits, activity, deals, events, and privacy choices may matter.`)}<article class="person-feature clickable-person" data-person="${person.id}" tabindex="0" role="button">${photo(images.people[person.id], person.name, "person-hero")}<div class="person-copy"><span class="role-tag">${person.role}</span><h1>${person.name}</h1><p>${person.intro}</p><div class="tap-hint">Open ${person.name}’s case file</div><div class="profile-lines"><div><span>Favorite</span><strong>${person.favorite}</strong></div><div><span>Permission</span><strong>${person.permissionLabel}</strong></div></div><div class="fact-list">${person.facts.map(fact => `<div class="fact">${fact}</div>`).join("")}</div></div></article><div class="intro-dots">${diners.map((_, i) => `<span class="${i === state.introIndex ? "active" : ""}"></span>`).join("")}</div><div class="actions"><button class="primary-button" id="nextIntro">${state.introIndex === diners.length - 1 ? "Start Restaurant Prediction" : "Meet the Next Person"}</button></div></div>`;
  document.querySelector("#skip").onclick = () => { state.screen = "restaurant"; render(); };
  document.querySelector("#nextIntro").onclick = () => { if (state.introIndex < diners.length - 1) state.introIndex += 1; else state.screen = "restaurant"; render(); };
}

function personMini(person, clue) { return `<article class="person-mini clickable-person" data-person="${person.id}" tabindex="0" role="button" aria-label="Open ${person.name} case file">${photo(images.people[person.id], person.name)}<div><strong>${person.name}</strong><small>${clue}</small><span class="view-card">Open case file →</span></div></article>`; }
function restaurantCard(r) { return `<button class="restaurant-card ${state.groupRestaurant === r.id ? "selected" : ""}" data-value="${r.id}">${photo(images.restaurants[r.id], `${r.name} restaurant`)}<span class="restaurant-copy"><span class="restaurant-meta">${r.style} · ${r.price} · ${r.distance}</span><strong>${r.name}</strong><small>${r.description}</small><em>${r.atmosphere}</em></span></button>`; }
function autoRestaurant() { if (!state.groupRestaurant) state.groupRestaurant = restaurants[0].id; state.screen = "restaurantReveal"; render(); }

function restaurantRound() {
  app.innerHTML = `${timerMarkup()}<div class="progress-wrap"><div class="progress-meta"><span>Group restaurant round</span><span>1 shared choice</span></div><div class="progress-track"><span style="width:12%"></span></div></div>${hostCard("Investigate all three people. Then predict the one restaurant they will agree on.")}<div class="people-strip">${diners.map(person => personMini(person, person.clues.restaurant)).join("")}</div><div class="section-heading"><div><p class="eyebrow">Make Your Prediction</p><h2>Where will the group eat?</h2></div></div><div class="restaurant-grid">${restaurants.map(restaurantCard).join("")}</div>${confidenceControl("group", "restaurant")}<p class="lock-note">Time expiration locks your latest selection. If none is selected, the first option is used.</p><div class="actions"><button class="primary-button" id="lockRestaurant" ${state.groupRestaurant && currentConfidence("group", "restaurant") ? "" : "disabled"}>Lock Group Restaurant</button></div>`;
  app.querySelectorAll(".restaurant-card").forEach(button => button.onclick = () => { state.groupRestaurant = button.dataset.value; render(); });
  app.querySelectorAll("[data-confidence]").forEach(button => button.onclick = () => { state.confidence[confidenceKey("group", "restaurant")] = Number(button.dataset.confidence); render(); });
  document.querySelector("#lockRestaurant").onclick = () => { if (state.groupRestaurant && currentConfidence("group", "restaurant")) { state.screen = "restaurantReveal"; render(); } };
  startTimer(autoRestaurant);
}

function restaurantReveal() {
  const restaurant = actualRestaurant(); const correct = state.groupRestaurant === actualRestaurantId; const confidence = currentConfidence("group", "restaurant");
  app.innerHTML = `<p class="eyebrow">The Votes Are In</p><h1 class="screen-title">The group chose ${restaurant.name}.</h1>${hostCard(correct ? `You read the room perfectly with ${confidence}/5 confidence.` : `You were ${confidence}/5 confident, but the group found a different compromise.`)}<article class="reveal-card photo-reveal">${photo(images.restaurants[restaurant.id], restaurant.name)}<div class="reveal-content"><div class="reveal-head"><strong>${restaurant.name}</strong><span class="score-pill">${correct ? "+120" : "0"}</span></div><div class="answer-row ${correct ? "correct" : "wrong"}"><span>Your prediction: ${restaurantFor(state.groupRestaurant).name}</span><span>${correct ? "✓ Correct" : "✕ Incorrect"}</span></div><p class="explanation">Casa Luna balanced Marcus’s price and distance concerns, Olivia’s celebration mood, and Emma’s desire for something modern without another seafood-heavy meal.</p></div></article><div class="people-strip">${diners.map(person => personMini(person, "Review evidence before predicting the order.")).join("")}</div><div class="actions"><button class="primary-button" id="orders">Predict Their Orders</button></div>`;
  document.querySelector("#orders").onclick = () => { state.screen = "play"; render(); };
}

function optionImage(value, stage) { return images.food[value] || images.food[stage === "meal" ? "Fish tacos" : stage === "drink" ? "Lime margarita" : "Churros"]; }
function availableOptions(stage) { return actualRestaurant().menu[stage].map(value => ({ value, image: optionImage(value, stage) })); }
function advancePlay() { if (state.dinerIndex < diners.length - 1) state.dinerIndex += 1; else if (state.stageIndex < dinerStages.length - 1) { state.stageIndex += 1; state.dinerIndex = 0; } else { calculateScore(); updateStats(); state.screen = "results"; } render(); }
function autoPlay() { const stage = dinerStages[state.stageIndex]; const person = diners[state.dinerIndex]; state.picks[person.id] ??= {}; if (!state.picks[person.id][stage]) state.picks[person.id][stage] = availableOptions(stage)[0].value; if (!currentConfidence(person.id, stage)) state.confidence[confidenceKey(person.id, stage)] = 1; advancePlay(); }

function play() {
  const stage = dinerStages[state.stageIndex]; const person = diners[state.dinerIndex]; const selected = state.picks[person.id]?.[stage]; const restaurant = actualRestaurant(); const confidence = currentConfidence(person.id, stage);
  app.innerHTML = `${timerMarkup()}${progress()}${hostCard(person.clues[stage])}<div class="round-person clickable-person" data-person="${person.id}" tabindex="0" role="button">${photo(images.people[person.id], person.name)}<div><span class="role-tag">${person.role}</span><h2>${person.name}</h2><p>What will ${person.name} order at ${restaurant.name}?</p><span class="view-card">Review case file & evidence →</span></div></div><div class="choice-grid">${availableOptions(stage).map(option => `<button class="food-option ${selected === option.value ? "selected" : ""}" data-value="${option.value}">${photo(option.image, option.value)}<span><strong>${option.value}</strong><small>${labels[stage]} at ${restaurant.name}</small></span></button>`).join("")}</div>${confidenceControl(person.id, stage)}<p class="lock-note">Select an answer and confidence level before locking.</p><div class="actions"><button class="primary-button" id="continue" ${selected && confidence ? "" : "disabled"}>${state.dinerIndex === diners.length - 1 ? `Finish ${labels[stage]} Round` : `Lock ${person.name}`}</button></div>`;
  app.querySelectorAll(".food-option").forEach(button => button.onclick = () => { state.picks[person.id] ??= {}; state.picks[person.id][stage] = button.dataset.value; render(); });
  app.querySelectorAll("[data-confidence]").forEach(button => button.onclick = () => { state.confidence[confidenceKey(person.id, stage)] = Number(button.dataset.confidence); render(); });
  document.querySelector("#continue").onclick = () => { if (!state.picks[person.id]?.[stage] || !currentConfidence(person.id, stage)) return; advancePlay(); };
  startTimer(autoPlay);
}

function calculateScore() { state.score = state.groupRestaurant === actualRestaurantId ? points.restaurant : 0; diners.forEach(person => dinerStages.forEach(stage => { if (state.picks[person.id]?.[stage] === person.actual[stage]) state.score += points[stage]; })); }
function updateStats() { const s = getStats(); s.games += 1; s.highScore = Math.max(s.highScore, state.score); const rc = state.groupRestaurant === actualRestaurantId; s.restaurantCorrect += rc ? 1 : 0; s.streak = rc ? s.streak + 1 : 0; diners.forEach(person => dinerStages.forEach(stage => { s.attempts[stage] += 1; if (state.picks[person.id]?.[stage] === person.actual[stage]) s.correct[stage] += 1; })); localStorage.setItem("rmb-taco-stats-v2", JSON.stringify(s)); }
function saveScore() { const input = document.querySelector("#nickname"); const name = (input.value || "Player").trim().slice(0, 18) || "Player"; const board = [...getBoard(), { name, score: state.score, date: new Date().toLocaleDateString("en-US") }].sort((a, b) => b.score - a.score).slice(0, 5); localStorage.setItem("rmb-taco-board-v2", JSON.stringify(board)); render(); }

function results() {
  const board = getBoard(); const restaurant = actualRestaurant(); const restaurantCorrect = state.groupRestaurant === actualRestaurantId; const title = state.score >= 250 ? "People Whisperer" : state.score >= 180 ? "Dinner Detective" : state.score >= 100 ? "Clue Chaser" : "Rookie Biter";
  app.innerHTML = `<p class="eyebrow">Final Reveal</p><h1 class="screen-title">${title}</h1><div class="total-score"><strong>${state.score}</strong><span>out of 300 points</span></div><article class="reveal-card"><div class="reveal-head"><strong>Shared Restaurant · ${restaurant.name}</strong><span class="score-pill">${restaurantCorrect ? "120/120" : "0/120"}</span></div><div class="answer-row ${restaurantCorrect ? "correct" : "wrong"}"><span>Your pick: ${restaurantFor(state.groupRestaurant).name} · Confidence ${currentConfidence("group", "restaurant")}/5</span><span>${restaurantCorrect ? "✓ +120" : `✕ ${restaurant.name}`}</span></div></article>${diners.map(person => { let personScore = 0; const rows = dinerStages.map(stage => { const pick = state.picks[person.id]?.[stage]; const correct = pick === person.actual[stage]; if (correct) personScore += points[stage]; return `<div class="answer-row ${correct ? "correct" : "wrong"}"><span>${labels[stage]}: ${pick || "—"} · Confidence ${currentConfidence(person.id, stage)}/5</span><span>${correct ? `✓ +${points[stage]}` : `✕ ${person.actual[stage]}`}</span></div>`; }).join(""); return `<article class="reveal-card person-result clickable-person" data-person="${person.id}"><div class="person-result-head">${photo(images.people[person.id], person.name)}<div><strong>${person.name}</strong><small>${person.role} · Tap to reopen case file</small></div><span class="score-pill">${personScore}/60</span></div>${rows}<p class="explanation">${person.why}</p></article>`; }).join("")}<h2>Top Biters</h2><div class="name-entry"><input id="nickname" maxlength="18" placeholder="Your nickname" aria-label="Your nickname"><button class="secondary-button" id="save">Save Score</button></div>${board.length ? `<table class="leaderboard"><thead><tr><th>Player</th><th>Date</th><th>Score</th></tr></thead><tbody>${board.map((row, index) => `<tr><td>${index + 1}. ${escapeHtml(row.name)}</td><td>${escapeHtml(row.date)}</td><td>${row.score}</td></tr>`).join("")}</tbody></table>` : `<p class="lead">No saved scores yet. Be the first league leader.</p>`}<div class="actions"><button class="primary-button" id="again">Play Again</button></div>`;
  document.querySelector("#save").onclick = saveScore; document.querySelector("#again").onclick = reset;
}

function reset() { stopTimer(); document.querySelector(".person-modal")?.remove(); document.body.classList.remove("modal-open"); state = initialState(); render(); }
restartButton.onclick = reset;
render();