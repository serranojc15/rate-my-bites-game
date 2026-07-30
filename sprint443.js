// Bite Buddy League v0.4.4.3 — Order Prediction Clarity & Momentum.
(function (root) {
  "use strict";

  const release = root.BiteBuddyRelease;
  const fallbackLabels = Object.freeze({ meal: "Entrée", drink: "Drink", dessert: "Dessert" });
  const categoryPlural = Object.freeze({ meal: "Entrée", drink: "Drink", dessert: "Dessert" });
  let confirmationOpener = null;

  function normalizeIndex(value) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
  }

  function predictionNumber(stageIndex, dinerIndex, dinerCount = 3) {
    const count = Math.max(1, normalizeIndex(dinerCount));
    return normalizeIndex(stageIndex) * count + normalizeIndex(dinerIndex) + 1;
  }

  function totalPredictions(stageCount = 3, dinerCount = 3) {
    return Math.max(1, normalizeIndex(stageCount)) * Math.max(1, normalizeIndex(dinerCount));
  }

  function categoryLabel(stage, labelMap = {}) {
    return labelMap?.[stage] || fallbackLabels[stage] || "Order";
  }

  function orderDecisionState(options = [], selectedItem = null, confidence = 0) {
    const item = (options || []).find(option => option?.value === selectedItem) || null;
    const normalizedConfidence = Number(confidence) >= 1 && Number(confidence) <= 5 ? Math.round(Number(confidence)) : 0;
    const ready = Boolean(item && normalizedConfidence);
    const status = !item ? "empty" : normalizedConfidence ? "ready" : "confidence-required";
    return {
      item,
      itemName: item?.value || "No item selected",
      confidence: normalizedConfidence,
      confidenceText: normalizedConfidence ? `Confidence: ${normalizedConfidence} of 5` : "Confidence: Not selected",
      ready,
      status,
      guidance: status === "empty"
        ? "Choose an item to begin."
        : status === "confidence-required"
          ? "Now choose how confident you are."
          : "Your prediction is ready to lock."
    };
  }

  function nextPrediction(stageIndex, dinerIndex, people = [], stages = [], labelMap = {}) {
    const safeStage = normalizeIndex(stageIndex);
    const safeDiner = normalizeIndex(dinerIndex);
    const stage = stages[safeStage];
    const category = categoryLabel(stage, labelMap);
    const lastDiner = safeDiner >= Math.max(0, people.length - 1);
    const lastStage = safeStage >= Math.max(0, stages.length - 1);

    if (!lastDiner) {
      const nextPerson = people[safeDiner + 1];
      return {
        type: "person",
        label: `Next Prediction: ${nextPerson?.name || "Next Diner"}’s ${category}`,
        categoryComplete: false,
        final: false
      };
    }

    if (!lastStage) {
      const nextStage = stages[safeStage + 1];
      const nextCategory = categoryLabel(nextStage, labelMap);
      return {
        type: "category",
        label: `Begin ${categoryPlural[nextStage] || nextCategory} Predictions`,
        categoryComplete: true,
        completedCategory: category,
        nextCategory,
        final: false
      };
    }

    return {
      type: "final",
      label: "Lock Final Prediction and Begin the Reveal",
      categoryComplete: true,
      completedCategory: category,
      nextCategory: "Final Reveal",
      final: true
    };
  }

  root.BiteBuddySprint443 = Object.freeze({
    version: release?.version || "v0.4.4.3",
    predictionNumber,
    totalPredictions,
    categoryLabel,
    orderDecisionState,
    nextPrediction
  });

  if (
    typeof root.document === "undefined" ||
    typeof initialState !== "function" ||
    typeof play !== "function" ||
    typeof advancePlay !== "function" ||
    typeof autoPlay !== "function" ||
    typeof render !== "function"
  ) return;

  const baseInitialState443 = initialState;
  initialState = function () {
    return {
      ...baseInitialState443(),
      orderConfirmation: null,
      orderLockInProgress: false,
      orderAdvanceInProgress: false,
      orderConfirmationNarratedKey: null
    };
  };

  state = {
    ...state,
    orderConfirmation: state.orderConfirmation || null,
    orderLockInProgress: Boolean(state.orderLockInProgress),
    orderAdvanceInProgress: false,
    orderConfirmationNarratedKey: state.orderConfirmationNarratedKey || null
  };

  function currentOrderContext() {
    const stage = dinerStages[state.stageIndex];
    const person = diners[state.dinerIndex];
    const restaurant = actualRestaurant();
    const options = availableOptions(stage);
    const selectedItem = state.picks?.[person?.id]?.[stage] || null;
    const confidence = person ? currentConfidence(person.id, stage) : 0;
    return {
      stage,
      person,
      restaurant,
      options,
      selectedItem,
      confidence,
      position: predictionNumber(state.stageIndex, state.dinerIndex, diners.length),
      total: totalPredictions(dinerStages.length, diners.length),
      category: categoryLabel(stage, labels),
      decision: orderDecisionState(options, selectedItem, confidence)
    };
  }

  function orderOptionMarkup(option, context) {
    const selected = context.selectedItem === option.value;
    return `<button class="food-option order-option ${selected ? "selected" : ""}" data-order-value="${escapeHtml(option.value)}" type="button" aria-pressed="${selected}">
      ${photo(option.image, option.value)}
      <span>
        <strong>${escapeHtml(option.value)}</strong>
        <small>${escapeHtml(context.category)} at ${escapeHtml(context.restaurant.name)}</small>
        <em class="order-selection-label">${selected ? "✓ Current prediction" : "Select as working prediction"}</em>
      </span>
    </button>`;
  }

  function orderProgressMarkup(context) {
    const percent = Math.round((context.position / context.total) * 100);
    return `<div class="progress-wrap order-global-progress">
      <div class="progress-meta"><span>${escapeHtml(context.category)} prediction</span><span>${context.position} of ${context.total}</span></div>
      <div class="progress-track" role="progressbar" aria-label="Order predictions" aria-valuemin="1" aria-valuemax="${context.total}" aria-valuenow="${context.position}"><span style="width:${percent}%"></span></div>
    </div>`;
  }

  function dinerClueMarkup(context) {
    return `<button class="order-clue-panel clickable-person" data-person="${escapeHtml(context.person.id)}" type="button" aria-label="Open ${escapeHtml(context.person.name)} case file">
      ${photo(images.people[context.person.id], context.person.name)}
      <span class="order-clue-copy">
        <span class="role-tag">${escapeHtml(context.person.role)}</span>
        <strong>${escapeHtml(context.person.name)}’s current ${escapeHtml(context.category.toLowerCase())} clue</strong>
        <p>${escapeHtml(context.person.clues?.[context.stage] || "No clue is available for this prediction.")}</p>
        <em>Open ${escapeHtml(context.person.name)}’s Case File →</em>
      </span>
    </button>`;
  }

  function orderDockMarkup(context) {
    return `<aside class="order-decision-dock" data-order-status="${context.decision.status}" aria-label="${escapeHtml(context.person.name)} ${escapeHtml(context.category.toLowerCase())} decision center">
      <div class="order-dock-summary">
        <span>Current prediction</span>
        <strong data-order-item>${escapeHtml(context.decision.itemName)}</strong>
        <small data-order-confidence>${escapeHtml(context.decision.confidenceText)}</small>
      </div>
      ${confidenceControl(context.person.id, context.stage)}
      <button class="primary-button" id="lockOrderPrediction" type="button" ${context.decision.ready ? "" : "disabled"}>Lock ${escapeHtml(context.person.name)}’s ${escapeHtml(context.category)}</button>
      <p class="order-lock-guidance" id="orderLockGuidance" data-order-guidance>${escapeHtml(context.decision.guidance)}</p>
    </aside>`;
  }

  function configureOrderConfidence(context) {
    const box = app.querySelector(".order-decision-dock .confidence-box");
    if (!box) return false;
    box.classList.add("order-dock-confidence");
    box.setAttribute("data-order-confidence-control", "true");

    const questionId = `orderConfidenceQuestion-${context.person.id}-${context.stage}`;
    const heading = box.querySelector("strong");
    if (heading) {
      heading.id = questionId;
      heading.textContent = "How confident are you?";
    }
    const scale = box.querySelector("small");
    if (scale) scale.textContent = "1 = Mostly guessing · 3 = Reasonably confident · 5 = Certain";
    const buttons = box.querySelector(".confidence-buttons");
    if (buttons) {
      buttons.setAttribute("role", "group");
      buttons.setAttribute("aria-label", `${context.person.name} ${context.category.toLowerCase()} prediction confidence`);
      buttons.setAttribute("aria-labelledby", questionId);
    }
    box.querySelectorAll("[data-confidence]").forEach(button => {
      const selected = Number(button.dataset.confidence) === context.decision.confidence;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-pressed", String(selected));
      button.setAttribute("aria-label", `${button.dataset.confidence} out of 5 ${context.person.name} ${context.category.toLowerCase()} prediction confidence`);
    });
    return true;
  }

  function syncOrderPredictionUi() {
    if (state.screen !== "play") return null;
    const context = currentOrderContext();

    app.querySelectorAll(".order-option").forEach(card => {
      const selected = card.dataset.orderValue === context.selectedItem;
      card.classList.toggle("selected", selected);
      card.setAttribute("aria-pressed", String(selected));
      const label = card.querySelector(".order-selection-label");
      if (label) label.textContent = selected ? "✓ Current prediction" : "Select as working prediction";
    });

    const dock = app.querySelector(".order-decision-dock");
    if (dock) dock.dataset.orderStatus = context.decision.status;
    const item = app.querySelector("[data-order-item]");
    if (item) item.textContent = context.decision.itemName;
    const confidence = app.querySelector("[data-order-confidence]");
    if (confidence) confidence.textContent = context.decision.confidenceText;
    const guidance = app.querySelector("[data-order-guidance]");
    if (guidance) guidance.textContent = context.decision.guidance;
    const lock = app.querySelector("#lockOrderPrediction");
    if (lock) {
      lock.disabled = !context.decision.ready;
      lock.setAttribute("aria-disabled", String(!context.decision.ready));
      lock.setAttribute("aria-describedby", "orderLockGuidance");
    }
    configureOrderConfidence(context);
    return context;
  }

  function lockOrderPrediction(timedOut = false) {
    if (state.screen !== "play" || state.orderLockInProgress) return false;
    const context = currentOrderContext();
    if (!context.decision.ready) return false;

    stopTimer();
    state.orderLockInProgress = true;
    state.orderConfirmation = {
      stageIndex: state.stageIndex,
      dinerIndex: state.dinerIndex,
      stage: context.stage,
      category: context.category,
      personId: context.person.id,
      personName: context.person.name,
      item: context.selectedItem,
      confidence: context.confidence,
      position: context.position,
      total: context.total,
      timedOut: Boolean(timedOut)
    };
    state.screen = "orderConfirmation";
    render();
    return true;
  }

  const baseAdvancePlay443 = advancePlay;

  function advanceAfterConfirmation() {
    if (!state.orderConfirmation || state.orderAdvanceInProgress) return false;
    state.orderAdvanceInProgress = true;
    state.orderConfirmation = null;
    state.orderLockInProgress = false;
    state.screen = "play";
    baseAdvancePlay443();
    state.orderAdvanceInProgress = false;
    return true;
  }

  function categoryTransitionMarkup(confirmation, transition) {
    if (!transition.categoryComplete) return "";
    const lower = confirmation.category.toLowerCase();
    return `<section class="order-category-transition" aria-label="${escapeHtml(confirmation.category)} round complete">
      <p class="eyebrow">${escapeHtml(confirmation.category)} Round Complete</p>
      <h2>Three ${escapeHtml(lower)} predictions locked.</h2>
      <p>Next: ${escapeHtml(transition.nextCategory)}</p>
    </section>`;
  }

  function narrateOrderTransition(confirmation, transition) {
    if (!transition.categoryComplete) return false;
    const key = `${confirmation.stageIndex}-${confirmation.dinerIndex}`;
    if (state.orderConfirmationNarratedKey === key) return false;
    state.orderConfirmationNarratedKey = key;
    const line = transition.final
      ? "Nine order predictions are locked. The table is ready to tell the truth."
      : confirmation.stage === "meal"
        ? "The main courses are locked. Now let's see what everyone reaches for to drink."
        : "Drinks are in. One final category remains.";
    return Boolean(root.PupVoice?.speak?.(line));
  }

  function renderOrderConfirmation() {
    stopTimer();
    const confirmation = state.orderConfirmation;
    if (!confirmation) {
      state.screen = "play";
      state.orderLockInProgress = false;
      render();
      return;
    }

    const transition = nextPrediction(
      confirmation.stageIndex,
      confirmation.dinerIndex,
      diners,
      dinerStages,
      labels
    );

    app.innerHTML = `<section class="order-lock-confirmation" aria-labelledby="orderConfirmationTitle">
      <div class="order-confirmation-progress"><span>${confirmation.position} of ${confirmation.total}</span><strong>${escapeHtml(confirmation.category)} prediction sealed</strong></div>
      <p class="eyebrow">${confirmation.timedOut ? "Time Expired · Latest Read Locked" : "Order Prediction Locked"}</p>
      <h1 id="orderConfirmationTitle">${escapeHtml(confirmation.personName)}’s ${escapeHtml(confirmation.category.toLowerCase())} prediction is locked.</h1>
      <div class="order-confirmation-choice">
        <span>Your prediction</span>
        <strong>${escapeHtml(confirmation.item)}</strong>
        <small>Confidence: ${confirmation.confidence} of 5</small>
      </div>
      <div class="order-confirmation-pup">${photo(host.image, "Pup, Host")}<p>The deduction is sealed. The answer stays hidden until the Final Reveal.</p></div>
      ${categoryTransitionMarkup(confirmation, transition)}
      <button class="primary-button order-next-button" id="nextOrderPrediction" type="button">${escapeHtml(transition.label)}</button>
    </section>`;

    narrateOrderTransition(confirmation, transition);
    const next = app.querySelector("#nextOrderPrediction");
    confirmationOpener = next;
    next.onclick = () => {
      if (state.orderAdvanceInProgress) return;
      next.disabled = true;
      advanceAfterConfirmation();
    };
  }

  play = function () {
    state.orderConfirmation = null;
    state.orderLockInProgress = false;
    const context = currentOrderContext();

    app.innerHTML = `${timerMarkup()}
      ${orderProgressMarkup(context)}
      <section class="order-prediction-context" aria-labelledby="orderPredictionQuestion">
        <p class="eyebrow">${escapeHtml(context.category)} Prediction · ${context.position} of ${context.total}</p>
        <h1 id="orderPredictionQuestion">What will ${escapeHtml(context.person.name)} order at ${escapeHtml(context.restaurant.name)}?</h1>
        <p>Review the current clue, choose one menu item, then lock your confidence beside the decision.</p>
      </section>
      ${dinerClueMarkup(context)}
      <section class="order-menu-section" aria-labelledby="orderMenuTitle">
        <div class="section-heading"><div><p class="eyebrow">Make Your Deduction</p><h2 id="orderMenuTitle">Choose ${escapeHtml(context.person.name)}’s ${escapeHtml(context.category.toLowerCase())}</h2></div></div>
        <div class="choice-grid order-choice-grid">${context.options.map(option => orderOptionMarkup(option, context)).join("")}</div>
      </section>
      ${orderDockMarkup(context)}`;

    app.querySelectorAll(".order-option").forEach(button => {
      button.onclick = () => {
        state.picks[context.person.id] ||= {};
        state.picks[context.person.id][context.stage] = button.dataset.orderValue;
        syncOrderPredictionUi();
      };
    });
    app.querySelectorAll(".order-decision-dock [data-confidence]").forEach(button => {
      button.onclick = () => {
        state.confidence[confidenceKey(context.person.id, context.stage)] = Number(button.dataset.confidence);
        syncOrderPredictionUi();
      };
    });
    app.querySelector("#lockOrderPrediction").onclick = () => lockOrderPrediction(false);
    syncOrderPredictionUi();
    startTimer(autoPlay);
  };

  autoPlay = function () {
    if (state.screen !== "play" || state.orderLockInProgress) return false;
    const context = currentOrderContext();
    state.picks[context.person.id] ||= {};
    if (!state.picks[context.person.id][context.stage]) {
      state.picks[context.person.id][context.stage] = context.options[0]?.value || "No prediction";
    }
    if (!currentConfidence(context.person.id, context.stage)) {
      state.confidence[confidenceKey(context.person.id, context.stage)] = 1;
    }
    state.timedOut = true;
    return lockOrderPrediction(true);
  };

  const baseRender443 = render;
  render = function () {
    if (state.screen === "orderConfirmation") {
      stopTimer();
      restartButton.classList.remove("hidden");
      app.classList.remove("screen-enter");
      void app.offsetWidth;
      app.classList.add("screen-enter");
      renderOrderConfirmation();
      release?.apply?.();
      return;
    }
    baseRender443();
    release?.apply?.();
  };

  root.BiteBuddySprint443Runtime = Object.freeze({
    currentOrderContext,
    syncOrderPredictionUi,
    lockOrderPrediction,
    advanceAfterConfirmation,
    renderOrderConfirmation
  });

  render();
})(window);
