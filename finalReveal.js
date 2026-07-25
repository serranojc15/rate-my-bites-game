// Bite Buddy League v0.4.2.4 — The Final Reveal
// Additive reveal presentation. Scoring, predictions, planner, evidence,
// permissions, profiles, and persistence remain unchanged.

const FINAL_REVEAL_VERSION = "v0.4.2.4";
const FINAL_REVEAL_NAME = "The Final Reveal";

const finalRevealBaseInitialState = initialState;
initialState = function () {
  return {
    ...finalRevealBaseInitialState(),
    revealStep: 0,
    revealScore: 0,
    revealComplete: false
  };
};

function finalRevealVersionMarkup() {
  return `<div class="final-reveal-version" aria-label="Bite Buddy League ${FINAL_REVEAL_VERSION}, ${FINAL_REVEAL_NAME}"><strong>${FINAL_REVEAL_VERSION}</strong><span>${FINAL_REVEAL_NAME}</span></div>`;
}

function installFinalRevealVersion() {
  document.title = `Rate My Bites — Bite Buddy League ${FINAL_REVEAL_VERSION}`;
  const badge = document.querySelector("#directorCutBuild");
  if (badge) badge.innerHTML = `<span>Bite Buddy League</span><strong>${FINAL_REVEAL_VERSION}</strong>`;
}

function revealResultsData() {
  const restaurantCorrect = state.groupRestaurant === actualRestaurantId;
  const restaurantPoints = restaurantCorrect ? points.restaurant : 0;
  const people = diners.map(person => {
    let total = 0;
    const answers = dinerStages.map(stage => {
      const pick = state.picks[person.id]?.[stage];
      const correct = pick === person.actual[stage];
      const earned = correct ? points[stage] : 0;
      total += earned;
      return {
        stage,
        label: labels[stage],
        pick: pick || "No prediction",
        actual: person.actual[stage],
        confidence: currentConfidence(person.id, stage),
        correct,
        earned
      };
    });
    return { person, answers, total };
  });
  return { restaurantCorrect, restaurantPoints, people };
}

function revealVerdict(score) {
  if (score >= 270) return { title: "CASE SOLVED", subtitle: "You read the table almost perfectly.", className: "solved" };
  if (score >= 210) return { title: "MOSTLY SOLVED", subtitle: "The big picture was clear. A few details stayed hidden.", className: "mostly" };
  if (score >= 120) return { title: "PARTIALLY SOLVED", subtitle: "You found important truths, but the table kept some secrets.", className: "partial" };
  return { title: "COLD CASE", subtitle: "The evidence was there. Tonight, the people were harder to read.", className: "cold" };
}

function pupLineForPerson(result) {
  if (result.total === 60) return `You understood ${result.person.name} completely. Every clue landed.`;
  if (result.total >= 30) return `You caught part of ${result.person.name}'s pattern, but one choice changed the story.`;
  if (result.total > 0) return `${result.person.name} gave you one clean read and several convincing distractions.`;
  return `${result.person.name} kept the whole order hidden. That is what makes people interesting.`;
}

function personReaction(result) {
  if (result.total === 60) return `${result.person.name} smiles. “Okay, that was impressive.”`;
  if (result.total >= 30) return `${result.person.name} nods. “You know me... mostly.”`;
  if (result.total > 0) return `${result.person.name} laughs. “You got one.”`;
  return `${result.person.name} grins. “Not even close.”`;
}

function bestDeduction(data) {
  const wins = [];
  if (data.restaurantCorrect) wins.push({ label: "Shared restaurant", detail: `Casa Luna · +${points.restaurant}`, value: points.restaurant });
  data.people.forEach(result => result.answers.forEach(answer => {
    if (answer.correct) wins.push({ label: `${result.person.name}'s ${answer.label.toLowerCase()}`, detail: `${answer.actual} · +${answer.earned}`, value: answer.earned });
  }));
  return wins.sort((a, b) => b.value - a.value)[0] || { label: "The courage to make a call", detail: "Every investigation teaches you something.", value: 0 };
}

function biggestSurprise(data) {
  for (const result of data.people) {
    const miss = result.answers.find(answer => !answer.correct && answer.confidence >= 3);
    if (miss) return { label: `${result.person.name}'s ${miss.label.toLowerCase()}`, detail: `You chose ${miss.pick}. The answer was ${miss.actual}.` };
  }
  return { label: "No major surprise", detail: "Your confidence generally matched your accuracy." };
}

function trustedEvidenceLabel() {
  const labelsByReason = {
    conversation: "Something someone said",
    history: "Dining history",
    deal: "The happy-hour deal",
    event: "The celebration",
    gut: "Your gut feeling",
    guess: "A pure guess"
  };
  return labelsByReason[state.restaurantReason] || "Your combined read of the room";
}

function updateRevealScore(target) {
  const scoreNode = document.querySelector("#liveRevealScore");
  if (!scoreNode) return;
  const start = Number(state.revealScore || 0);
  state.revealScore = target;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    scoreNode.textContent = target;
    return;
  }
  const duration = 700;
  const started = performance.now();
  function tick(now) {
    const progress = Math.min(1, (now - started) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    scoreNode.textContent = Math.round(start + (target - start) * eased);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function finalRevealShell(content, options = {}) {
  const progress = Math.min(100, Math.round((state.revealStep / 6) * 100));
  return `<section class="final-reveal-stage ${options.className || ""}">
    <div class="final-reveal-top">
      ${finalRevealVersionMarkup()}
      <div class="final-score-live" aria-live="polite"><span>CASE SCORE</span><strong id="liveRevealScore">${state.revealScore || 0}</strong><small>/ 300</small></div>
    </div>
    <div class="final-reveal-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><span style="width:${progress}%"></span></div>
    ${content}
  </section>`;
}

function revealOpening() {
  app.innerHTML = finalRevealShell(`<div class="reveal-curtain">
    <div class="reveal-lock">🔒</div>
    <p class="eyebrow">Predictions Locked</p>
    <h1>The investigation<br>is complete.</h1>
    <div class="reveal-opening-lines">
      <p>The evidence has been reviewed.</p>
      <p>The table has made its choices.</p>
      <strong>There is only one question left.</strong>
    </div>
    <div class="reveal-pup-spotlight">${photo(host.image, "Pup, Game Master")}<div><span>GAME MASTER</span><p>Were you right?</p></div></div>
    <button class="primary-button reveal-primary" id="beginReveal">BEGIN THE REVEAL</button>
  </div>`, { className: "opening" });
  speakConversation?.("The investigation is complete. The evidence has been reviewed. There is only one question left. Were you right?");
  document.querySelector("#beginReveal").onclick = () => { state.revealStep = 1; render(); };
}

function revealRestaurant(data) {
  const restaurant = actualRestaurant();
  const chosen = restaurantFor(state.groupRestaurant);
  const target = data.restaurantPoints;
  app.innerHTML = finalRevealShell(`<div class="restaurant-climax">
    <p class="eyebrow">First Decision</p>
    <h1>Where did the table go?</h1>
    <div class="suspense-copy">You predicted <strong>${escapeHtml(chosen.name)}</strong> with ${currentConfidence("group", "restaurant")}/5 confidence.</div>
    <article class="cinematic-restaurant-card ${data.restaurantCorrect ? "correct" : "wrong"}">
      ${photo(images.restaurants[restaurant.id], restaurant.name)}
      <div class="cinematic-restaurant-overlay"><span>THE TABLE CHOSE</span><strong>${escapeHtml(restaurant.name)}</strong></div>
    </article>
    <div class="reveal-outcome ${data.restaurantCorrect ? "correct" : "wrong"}">
      <strong>${data.restaurantCorrect ? "CASE BREAKTHROUGH" : "MISREAD"}</strong>
      <span>${data.restaurantCorrect ? `+${points.restaurant} points` : "0 points"}</span>
    </div>
    <div class="pup-verdict">${photo(host.image, "Pup")}<p>${data.restaurantCorrect ? "Excellent deduction. You read the whole room, not just the loudest clue." : "Interesting. You followed a believable trail, but the group found a different compromise."}</p></div>
    <button class="primary-button reveal-primary" id="nextReveal">REVEAL THE PEOPLE</button>
  </div>`, { className: "restaurant-reveal-climax" });
  updateRevealScore(target);
  speakConversation?.(`${restaurant.name}. ${data.restaurantCorrect ? `Correct. ${points.restaurant} points.` : "That was not your prediction."}`);
  document.querySelector("#nextReveal").onclick = () => { state.revealStep = 2; render(); };
}

function revealPerson(data, personIndex) {
  const result = data.people[personIndex];
  const previous = data.restaurantPoints + data.people.slice(0, personIndex).reduce((sum, item) => sum + item.total, 0);
  const target = previous + result.total;
  const correctCount = result.answers.filter(answer => answer.correct).length;
  app.innerHTML = finalRevealShell(`<div class="person-reveal-scene">
    <p class="eyebrow">Diner ${personIndex + 1} of ${diners.length}</p>
    <div class="person-reveal-title">
      ${photo(images.people[result.person.id], result.person.name)}
      <div><span>${escapeHtml(result.person.role)}</span><h1>${escapeHtml(result.person.name)}</h1></div>
    </div>
    <p class="character-reaction">${escapeHtml(personReaction(result))}</p>
    <div class="answer-reveal-stack">
      ${result.answers.map((answer, index) => `<article class="answer-reveal-card ${answer.correct ? "correct" : "wrong"}" style="--reveal-delay:${index * 140}ms">
        <div><span>${escapeHtml(answer.label)}</span><small>Confidence ${answer.confidence}/5</small></div>
        <p>Your call: <strong>${escapeHtml(answer.pick)}</strong></p>
        <div class="actual-answer"><span>ACTUAL ORDER</span><strong>${escapeHtml(answer.actual)}</strong></div>
        <em>${answer.correct ? `✓ +${answer.earned}` : "✕ MISREAD"}</em>
      </article>`).join("")}
    </div>
    <div class="person-total"><span>${correctCount} of 3 reads correct</span><strong>+${result.total}</strong><small>/ 60</small></div>
    <div class="pup-verdict">${photo(host.image, "Pup")}<p>${escapeHtml(pupLineForPerson(result))}</p></div>
    <details class="why-reveal"><summary>Why did ${escapeHtml(result.person.name)} choose this?</summary><p>${escapeHtml(result.person.why)}</p></details>
    <button class="primary-button reveal-primary" id="nextReveal">${personIndex === diners.length - 1 ? "SEE THE VERDICT" : `REVEAL ${diners[personIndex + 1].name.toUpperCase()}`}</button>
  </div>`, { className: "person-climax" });
  updateRevealScore(target);
  speakConversation?.(`${result.person.name}. ${correctCount} of three reads correct. ${pupLineForPerson(result)}`);
  document.querySelector("#nextReveal").onclick = () => { state.revealStep += 1; render(); };
}

function revealFinale(data) {
  const verdict = revealVerdict(state.score);
  const best = bestDeduction(data);
  const surprise = biggestSurprise(data);
  const board = getBoard();
  const perfect = state.score >= 270;
  app.innerHTML = finalRevealShell(`<div class="episode-verdict ${verdict.className}">
    <div class="verdict-burst" aria-hidden="true">${perfect ? "✦ ✦ ✦" : "◆"}</div>
    <p class="eyebrow">Episode Verdict</p>
    <h1>${verdict.title}</h1>
    <p class="verdict-subtitle">${verdict.subtitle}</p>
    <div class="final-score-monument"><strong>${state.score}</strong><span>out of 300</span></div>
    <div class="episode-recap-grid">
      <article><span>BEST DEDUCTION</span><strong>${escapeHtml(best.label)}</strong><p>${escapeHtml(best.detail)}</p></article>
      <article><span>BIGGEST SURPRISE</span><strong>${escapeHtml(surprise.label)}</strong><p>${escapeHtml(surprise.detail)}</p></article>
      <article><span>EVIDENCE YOU TRUSTED</span><strong>${escapeHtml(trustedEvidenceLabel())}</strong><p>${state.storyMemory?.length || 0} story moments were captured before your prediction.</p></article>
    </div>
    <div class="final-pup-speech">${photo(host.image, "Pup, Game Master")}<div><span>FINAL WORD</span><p>${state.score >= 270 ? "You did not just predict dinner. You understood the people choosing it." : data.restaurantCorrect ? "You found the restaurant. But the people still kept a few secrets." : "Sometimes the strongest clue is not the truest clue. Watch the people, then watch them again."}</p></div></div>
    <div class="final-actions">
      <button class="primary-button" id="playAnother">PLAY ANOTHER EPISODE</button>
      <button class="secondary-button" id="reviewCases">REVIEW CASE FILES</button>
      <button class="secondary-button" id="replayConversation">REPLAY CONVERSATIONS</button>
      <button class="ghost-button mission-disabled" type="button" disabled title="Coming in a future sprint">MISSION REPORT · COMING SOON</button>
    </div>
    <section class="score-save-panel">
      <h2>Top Biters</h2>
      <div class="name-entry"><input id="nickname" maxlength="18" placeholder="Your nickname" aria-label="Your nickname"><button class="secondary-button" id="save">Save Score</button></div>
      ${board.length ? `<table class="leaderboard"><thead><tr><th>Player</th><th>Date</th><th>Score</th></tr></thead><tbody>${board.map((row, index) => `<tr><td>${index + 1}. ${escapeHtml(row.name)}</td><td>${escapeHtml(row.date)}</td><td>${row.score}</td></tr>`).join("")}</tbody></table>` : `<p>No saved scores yet. Be the first league leader.</p>`}
    </section>
  </div>`, { className: "final-verdict-stage" });
  state.revealComplete = true;
  updateRevealScore(state.score);
  speakConversation?.(`${verdict.title}. ${state.score} out of 300. ${verdict.subtitle}`);
  document.querySelector("#save").onclick = saveScore;
  document.querySelector("#playAnother").onclick = reset;
  document.querySelector("#reviewCases").onclick = () => openPersonCard(diners[0]);
  document.querySelector("#replayConversation").onclick = () => {
    state.screen = "conversation";
    state.conversationIndex = 0;
    state.storyMemory = [];
    state.appliedInfluence = [];
    render();
  };
}

results = function () {
  stopTimer();
  const data = revealResultsData();
  if (state.revealStep <= 0) revealOpening();
  else if (state.revealStep === 1) revealRestaurant(data);
  else if (state.revealStep >= 2 && state.revealStep <= 4) revealPerson(data, state.revealStep - 2);
  else revealFinale(data);
};

const finalRevealBaseRender = render;
render = function () {
  finalRevealBaseRender();
  installFinalRevealVersion();
};

installFinalRevealVersion();
render();
