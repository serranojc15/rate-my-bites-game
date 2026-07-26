// Bite Buddy League v0.4.4.1 — Choice-First Flow and Cinematic Reveal.
(function (root) {
  "use strict";

  const release = root.BiteBuddyRelease;
  const revealStages = Object.freeze(["locked", "counting", "incoming", "revealed"]);
  let revealTimer = null;
  let evidenceOpener = null;
  let evidenceEscapeHandler = null;

  function buildDecisionExplanation(restaurant, people) {
    const clues = (people || []).map(person => `${person.name}: ${person.clues?.restaurant || "No restaurant clue available."}`);
    return `The group chose ${restaurant?.name || "this restaurant"} because ${clues.join(" ")} Together, those clues made it the strongest group compromise.`;
  }

  function nextRevealStage(stage) {
    const index = revealStages.indexOf(stage);
    return index >= 0 && index < revealStages.length - 1 ? revealStages[index + 1] : null;
  }

  function revealDelay(stage, reducedMotion = false) {
    if (reducedMotion) return stage === "incoming" ? 90 : 70;
    return { locked: 700, counting: 1200, incoming: 700 }[stage] || 0;
  }

  function workingPredictionSummary(options, selectedId, confidence) {
    const restaurant = (options || []).find(option => option.id === selectedId) || null;
    return {
      restaurant,
      restaurantName: restaurant?.name || "No restaurant selected",
      confidence: Number(confidence) || 0,
      ready: Boolean(restaurant && Number(confidence))
    };
  }

  root.BiteBuddySprint441 = Object.freeze({
    version: release?.version || "v0.4.4.1",
    revealStages,
    buildDecisionExplanation,
    nextRevealStage,
    revealDelay,
    workingPredictionSummary
  });

  if (typeof root.document === "undefined" || typeof initialState !== "function" || typeof render !== "function") return;

  function reducedMotion() {
    return Boolean(root.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
  }

  function selectedRestaurant() {
    return restaurantFor(state.groupRestaurant) || null;
  }

  function lockedRestaurant() {
    return restaurantFor(state.restaurantRevealLockedChoice || state.groupRestaurant) || null;
  }

  function compactRestaurantStatusMarkup() {
    if (!state.timerSeconds) {
      return `<div class="timer-bar restaurant-compact-status untimed"><span>∞</span><div><strong>Restaurant Prediction</strong><small>Untimed · 1 shared choice</small></div></div>`;
    }
    const urgent = state.timeLeft <= 10;
    return `<div class="timer-bar restaurant-compact-status ${urgent ? "urgent" : ""}"><span id="timerValue">${state.timeLeft}</span><div><strong>Restaurant Prediction</strong><small>${state.timedOut ? "Time expired · latest selection locked" : "seconds remaining · 1 shared choice"}</small></div></div>`;
  }

  function restaurantOptionMarkup(restaurant) {
    const selected = state.groupRestaurant === restaurant.id;
    return `<button class="restaurant-card choice-first-restaurant ${selected ? "selected" : ""}" data-value="${restaurant.id}" type="button" aria-pressed="${selected}">
      ${photo(images.restaurants[restaurant.id], `${restaurant.name} restaurant`)}
      <span class="restaurant-copy">
        <span class="restaurant-meta">${escapeHtml(restaurant.style)} · ${escapeHtml(restaurant.price)} · ${escapeHtml(restaurant.distance)}</span>
        <strong>${escapeHtml(restaurant.name)}</strong>
        <small>${escapeHtml(restaurant.description)}</small>
        <em>${escapeHtml(restaurant.atmosphere)}</em>
        <span class="restaurant-selection-label">${selected ? "✓ Current prediction" : "Select as working prediction"}</span>
      </span>
    </button>`;
  }

  function workingPredictionMarkup() {
    const summary = workingPredictionSummary(restaurants, state.groupRestaurant, currentConfidence("group", "restaurant"));
    return `<section class="working-prediction" aria-live="polite" aria-label="Current working prediction">
      <div><span>Current prediction</span><strong data-working-restaurant>${escapeHtml(summary.restaurantName)}</strong></div>
      <p data-working-guidance>${summary.restaurant ? "You may keep investigating and change this choice before locking it in." : "Select a restaurant to create your working prediction."}</p>
    </section>`;
  }

  function stickyLockMarkup() {
    const summary = workingPredictionSummary(restaurants, state.groupRestaurant, currentConfidence("group", "restaurant"));
    return `<aside class="restaurant-lock-dock" aria-label="Lock restaurant prediction">
      <div><span>Current read</span><strong data-dock-restaurant>${escapeHtml(summary.restaurantName)}</strong><small data-dock-confidence>Confidence: ${summary.confidence ? `${summary.confidence} / 5` : "Not selected"}</small></div>
      <button class="primary-button" id="lockRestaurant" type="button" ${summary.ready ? "" : "disabled"}>Lock Restaurant Prediction</button>
      <p class="lock-requirement" data-lock-requirement>${summary.ready ? "Your restaurant and confidence are ready to lock." : "Select a restaurant and confidence level before locking."}</p>
    </aside>`;
  }

  function syncRestaurantRoundUi() {
    const summary = workingPredictionSummary(restaurants, state.groupRestaurant, currentConfidence("group", "restaurant"));
    app.querySelectorAll(".choice-first-restaurant").forEach(card => {
      const selected = card.dataset.value === state.groupRestaurant;
      card.classList.toggle("selected", selected);
      card.setAttribute("aria-pressed", String(selected));
      const label = card.querySelector(".restaurant-selection-label");
      if (label) label.textContent = selected ? "✓ Current prediction" : "Select as working prediction";
    });
    app.querySelectorAll("[data-confidence]").forEach(button => {
      const selected = Number(button.dataset.confidence) === summary.confidence;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    const working = app.querySelector("[data-working-restaurant]");
    if (working) working.textContent = summary.restaurantName;
    const guidance = app.querySelector("[data-working-guidance]");
    if (guidance) guidance.textContent = summary.restaurant ? "You may keep investigating and change this choice before locking it in." : "Select a restaurant to create your working prediction.";
    const dockRestaurant = app.querySelector("[data-dock-restaurant]");
    if (dockRestaurant) dockRestaurant.textContent = summary.restaurantName;
    const dockConfidence = app.querySelector("[data-dock-confidence]");
    if (dockConfidence) dockConfidence.textContent = `Confidence: ${summary.confidence ? `${summary.confidence} / 5` : "Not selected"}`;
    const lock = app.querySelector("#lockRestaurant");
    if (lock) lock.disabled = !summary.ready;
    const requirement = app.querySelector("[data-lock-requirement]");
    if (requirement) requirement.textContent = summary.ready ? "Your restaurant and confidence are ready to lock." : "Select a restaurant and confidence level before locking.";
  }

  function stopRevealSequence() {
    if (revealTimer) clearTimeout(revealTimer);
    revealTimer = null;
  }

  function narrateRevealStage(stage, correct) {
    state.restaurantRevealNarratedStages ||= [];
    if (state.restaurantRevealNarratedStages.includes(stage)) return;
    state.restaurantRevealNarratedStages.push(stage);
    if (stage === "locked") root.PupVoice?.speak?.("The prediction is locked. Three diners. One shared table. Let's open the final vote.");
    if (stage === "revealed") root.PupVoice?.speak?.(correct
      ? "You read the room. Different preferences, one compromise, and you found it."
      : "The evidence pointed somewhere else. Let's see which clues moved the table.");
  }

  function beginCinematicReveal() {
    if (state.restaurantRevealLocked) return false;
    const summary = workingPredictionSummary(restaurants, state.groupRestaurant, currentConfidence("group", "restaurant"));
    if (!summary.ready) return false;
    stopTimer();
    state.restaurantRevealLocked = true;
    state.restaurantRevealLockedChoice = state.groupRestaurant;
    state.restaurantRevealStage = "locked";
    state.restaurantRevealNarratedStages = [];
    state.screen = "restaurantReveal";
    render();
    return true;
  }

  autoRestaurant = function () {
    if (!state.groupRestaurant) state.groupRestaurant = restaurants[0]?.id || actualRestaurantId;
    if (!currentConfidence("group", "restaurant")) state.confidence[confidenceKey("group", "restaurant")] = 1;
    state.timedOut = true;
    beginCinematicReveal();
  };

  restaurantRound = function () {
    state.restaurantRevealLocked = false;
    state.restaurantRevealStage = null;
    state.restaurantRevealLockedChoice = null;
    state.restaurantRevealNarratedStages = [];
    app.innerHTML = `${compactRestaurantStatusMarkup()}
      <div class="progress-wrap restaurant-choice-progress"><div class="progress-meta"><span>Group restaurant round</span><span>1 shared choice</span></div><div class="progress-track"><span style="width:12%"></span></div></div>
      <section class="choice-first-question" aria-labelledby="restaurantQuestion">
        <p class="eyebrow">Make Your Prediction</p>
        <h1 id="restaurantQuestion">Where will the group eat?</h1>
        <p>Choose your current best answer. You can investigate the diners before locking it in.</p>
      </section>
      <div class="restaurant-grid choice-first-grid">${restaurants.map(restaurantOptionMarkup).join("")}</div>
      ${workingPredictionMarkup()}
      <section class="evidence-invitation" aria-labelledby="evidenceInvitationTitle">
        <p class="eyebrow">Need More Information?</p>
        <h2 id="evidenceInvitationTitle">Investigate tonight’s diners before making your final call.</h2>
        <p>The case files below are evidence for the restaurant decision—not a separate task.</p>
      </section>
      <div class="people-strip choice-first-people">${diners.map(person => personMini(person, person.clues.restaurant)).join("")}</div>
      ${typeof roomReadMarkup === "function" ? roomReadMarkup() : ""}
      <section class="restaurant-confidence-section"><h2>How confident is your current read?</h2>${confidenceControl("group", "restaurant")}</section>
      ${stickyLockMarkup()}`;

    app.querySelectorAll(".choice-first-restaurant").forEach(button => {
      button.onclick = () => {
        state.groupRestaurant = button.dataset.value;
        syncRestaurantRoundUi();
      };
    });
    app.querySelectorAll("[data-confidence]").forEach(button => {
      button.onclick = () => {
        state.confidence[confidenceKey("group", "restaurant")] = Number(button.dataset.confidence);
        syncRestaurantRoundUi();
      };
    });
    app.querySelectorAll("[data-reason]").forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.reason === state.restaurantReason));
      button.onclick = () => {
        state.restaurantReason = button.dataset.reason;
        app.querySelectorAll("[data-reason]").forEach(reason => {
          const selected = reason.dataset.reason === state.restaurantReason;
          reason.classList.toggle("selected", selected);
          reason.setAttribute("aria-pressed", String(selected));
        });
      };
    });
    app.querySelector("#lockRestaurant").onclick = beginCinematicReveal;
    syncRestaurantRoundUi();
    startTimer(autoRestaurant);
  };

  function closeEvidenceReview() {
    root.document.querySelector(".restaurant-evidence-modal")?.remove();
    root.document.body.classList.remove("modal-open");
    if (evidenceEscapeHandler) root.document.removeEventListener("keydown", evidenceEscapeHandler);
    evidenceEscapeHandler = null;
    const target = evidenceOpener;
    evidenceOpener = null;
    target?.focus?.();
  }

  function openEvidenceReview(openingElement) {
    evidenceOpener = openingElement || root.document.activeElement;
    closeEvidenceReview();
    evidenceOpener = openingElement || root.document.activeElement;
    const restaurant = actualRestaurant();
    const modal = root.document.createElement("div");
    modal.className = "restaurant-evidence-modal";
    modal.innerHTML = `<div class="modal-backdrop" data-evidence-close></div><section class="restaurant-evidence-card" role="dialog" aria-modal="true" aria-labelledby="restaurantEvidenceTitle">
      <button class="modal-close" type="button" data-evidence-close aria-label="Close restaurant evidence">×</button>
      <p class="eyebrow">Locked Evidence Review</p>
      <h2 id="restaurantEvidenceTitle">Why ${escapeHtml(restaurant.name)} won the table</h2>
      <p>${escapeHtml(buildDecisionExplanation(restaurant, diners))}</p>
      <div class="restaurant-evidence-list">${diners.map(person => `<article><strong>${escapeHtml(person.name)}</strong><p>${escapeHtml(person.clues.restaurant)}</p></article>`).join("")}</div>
      <p class="locked-answer-note">Your restaurant prediction is locked and cannot be changed from this review.</p>
      <button class="secondary-button" type="button" data-evidence-close>Return to Reveal</button>
    </section>`;
    root.document.body.appendChild(modal);
    root.document.body.classList.add("modal-open");
    modal.querySelectorAll("[data-evidence-close]").forEach(element => { element.onclick = closeEvidenceReview; });
    evidenceEscapeHandler = event => { if (event.key === "Escape") closeEvidenceReview(); };
    root.document.addEventListener("keydown", evidenceEscapeHandler);
    modal.querySelector(".modal-close")?.focus();
  }

  function suspenseMarkup(stage, predicted) {
    if (stage === "locked") {
      return `<section class="restaurant-reveal-stage stage-locked" aria-live="polite"><p class="eyebrow">Restaurant Prediction Locked</p><h1>Your choice is ${escapeHtml(predicted.name)}.</h1><p>Pup is opening the table’s final vote.</p><div class="reveal-pulse" aria-hidden="true"><span></span><span></span><span></span></div></section>`;
    }
    if (stage === "counting") {
      return `<section class="restaurant-reveal-stage stage-counting" aria-live="polite"><p class="eyebrow">Counting the Table’s Votes…</p><h1>Three diners. One shared table.</h1><ol class="vote-count-list">${diners.map(person => `<li><span>✓</span>${escapeHtml(person.name)} has decided.</li>`).join("")}</ol></section>`;
    }
    return `<section class="restaurant-reveal-stage stage-incoming" aria-live="polite"><p class="eyebrow">The Final Vote</p><h1>The group has chosen…</h1><div class="reveal-pulse" aria-hidden="true"><span></span><span></span><span></span></div></section>`;
  }

  function finalRestaurantRevealMarkup(predicted, restaurant, correct) {
    const pointsEarned = correct ? points.restaurant : 0;
    return `<section class="cinematic-restaurant-result ${correct ? "is-correct" : "is-incorrect"}" aria-labelledby="restaurantRevealTitle">
      <p class="eyebrow">The Group Chose</p>
      <h1 id="restaurantRevealTitle">${escapeHtml(restaurant.name)}</h1>
      <div class="restaurant-outcome-banner" role="status">
        <span aria-hidden="true">${correct ? "✓" : "✕"}</span>
        <div><strong>${correct ? "You read the table correctly" : "Your restaurant prediction was incorrect"}</strong><p>${correct ? "Your working read matched the group compromise." : "The group followed a different set of clues."}</p></div>
      </div>
      <div class="restaurant-result-comparison">
        <div><span>Your prediction</span><strong>${escapeHtml(predicted.name)}</strong></div>
        <div><span>The group chose</span><strong>${escapeHtml(restaurant.name)}</strong></div>
        <div class="restaurant-points"><span>Restaurant points</span><strong>${pointsEarned} / ${points.restaurant}</strong></div>
      </div>
      <div class="restaurant-reveal-actions">
        <button class="secondary-button" id="reviewRestaurantEvidence" type="button">Review the Evidence</button>
        <button class="primary-button" id="continueOrderPredictions" type="button">Continue to Order Predictions</button>
      </div>
      <article class="restaurant-reveal-photo-card">${photo(images.restaurants[restaurant.id], restaurant.name)}<div><h2>Why the table landed here</h2><p>${escapeHtml(buildDecisionExplanation(restaurant, diners))}</p></div></article>
    </section>`;
  }

  function scheduleNextRevealStage(stage) {
    const next = nextRevealStage(stage);
    if (!next || revealTimer) return;
    revealTimer = setTimeout(() => {
      revealTimer = null;
      if (state.screen !== "restaurantReveal" || state.restaurantRevealStage !== stage) return;
      state.restaurantRevealStage = next;
      render();
    }, revealDelay(stage, reducedMotion()));
  }

  restaurantReveal = function () {
    stopTimer();
    const predicted = lockedRestaurant() || selectedRestaurant() || restaurants[0];
    const restaurant = actualRestaurant();
    const correct = predicted.id === restaurant.id;
    const stage = revealStages.includes(state.restaurantRevealStage) ? state.restaurantRevealStage : "locked";
    state.restaurantRevealStage = stage;
    narrateRevealStage(stage, correct);
    if (stage !== "revealed") {
      app.innerHTML = suspenseMarkup(stage, predicted);
      scheduleNextRevealStage(stage);
      return;
    }
    stopRevealSequence();
    app.innerHTML = finalRestaurantRevealMarkup(predicted, restaurant, correct);
    app.querySelector("#reviewRestaurantEvidence").onclick = event => openEvidenceReview(event.currentTarget);
    app.querySelector("#continueOrderPredictions").onclick = () => {
      stopRevealSequence();
      root.PupVoice?.cancel?.();
      state.screen = "play";
      state.stageIndex = 0;
      state.dinerIndex = 0;
      render();
    };
  };

  const baseInitialState441 = initialState;
  initialState = function () {
    return {
      ...baseInitialState441(),
      restaurantRevealLocked: false,
      restaurantRevealLockedChoice: null,
      restaurantRevealStage: null,
      restaurantRevealNarratedStages: []
    };
  };

  const baseReset441 = reset;
  reset = function () {
    stopRevealSequence();
    closeEvidenceReview();
    root.BiteBuddyGroupLeaderboard?.close?.();
    baseReset441();
  };
  restartButton.onclick = reset;

  const baseRender441 = render;
  render = function () {
    baseRender441();
    root.BiteBuddyGroupLeaderboard?.installHomeAccess?.();
    release?.apply?.();
  };

  state = {
    ...state,
    restaurantRevealLocked: Boolean(state.restaurantRevealLocked),
    restaurantRevealLockedChoice: state.restaurantRevealLockedChoice || null,
    restaurantRevealStage: revealStages.includes(state.restaurantRevealStage) ? state.restaurantRevealStage : null,
    restaurantRevealNarratedStages: Array.isArray(state.restaurantRevealNarratedStages) ? state.restaurantRevealNarratedStages : []
  };

  render();
})(window);
