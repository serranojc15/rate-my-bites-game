// Bite Buddy League v0.4.4.2 — Restaurant Decision Polish.
(function (root) {
  "use strict";

  const release = root.BiteBuddyRelease;
  const fallbackReasons = Object.freeze({
    conversation: "Something someone said",
    history: "Dining history",
    deal: "Deal or happy hour",
    event: "Celebration or event",
    gut: "Gut feeling",
    guess: "Just guessing"
  });

  function normalizeConfidence(value) {
    const number = Number(value);
    return Number.isFinite(number) && number >= 1 && number <= 5 ? Math.round(number) : 0;
  }

  function reasonLabel(reasonId, reasons) {
    if (!reasonId) return "Not selected · Optional";
    const match = (reasons || []).find(reason => reason?.id === reasonId);
    return match?.label || fallbackReasons[reasonId] || String(reasonId);
  }

  function getRestaurantDecisionState(options = [], selectedId = null, confidence = 0, influence = null, reasons = []) {
    const restaurant = options.find(option => option?.id === selectedId) || null;
    const normalizedConfidence = normalizeConfidence(confidence);
    const ready = Boolean(restaurant && normalizedConfidence);
    const status = !restaurant ? "empty" : normalizedConfidence ? "ready" : "confidence-required";
    const guidance = status === "empty"
      ? "Choose a restaurant to begin."
      : status === "confidence-required"
        ? "Now choose how confident you are."
        : "Your prediction is ready to lock.";

    return {
      restaurant,
      restaurantName: restaurant?.name || "No restaurant selected",
      confidence: normalizedConfidence,
      confidenceText: normalizedConfidence ? `Confidence: ${normalizedConfidence} of 5` : "Confidence: Not selected",
      influence,
      influenceText: `Influence: ${reasonLabel(influence, reasons)}`,
      ready,
      status,
      guidance
    };
  }

  function currentDecisionState() {
    if (typeof state === "undefined" || typeof restaurants === "undefined") {
      return getRestaurantDecisionState();
    }
    const confidence = typeof currentConfidence === "function" ? currentConfidence("group", "restaurant") : 0;
    const reasons = typeof sprint42Reasons !== "undefined" ? sprint42Reasons : [];
    return getRestaurantDecisionState(restaurants, state.groupRestaurant, confidence, state.restaurantReason, reasons);
  }

  function configureConfidenceControl(confidenceBox, decision) {
    if (!confidenceBox) return false;
    confidenceBox.classList.add("restaurant-dock-confidence");
    confidenceBox.setAttribute("data-restaurant-confidence-control", "true");

    const heading = confidenceBox.querySelector("strong");
    if (heading) {
      heading.id = "restaurantConfidenceQuestion";
      heading.textContent = "How confident are you?";
    }

    const scale = confidenceBox.querySelector("small");
    if (scale) scale.textContent = "1 = Mostly guessing · 3 = Reasonably confident · 5 = Certain";

    const buttons = confidenceBox.querySelector(".confidence-buttons");
    if (buttons) {
      buttons.setAttribute("role", "group");
      buttons.setAttribute("aria-label", "Restaurant prediction confidence");
      buttons.setAttribute("aria-labelledby", "restaurantConfidenceQuestion");
    }

    confidenceBox.querySelectorAll("[data-confidence]").forEach(button => {
      const selected = Number(button.dataset.confidence) === decision.confidence;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-pressed", String(selected));
      button.setAttribute("aria-label", `${button.dataset.confidence} out of 5 restaurant prediction confidence`);
    });
    return true;
  }

  function syncDecisionDock() {
    if (typeof state === "undefined" || state.screen !== "restaurant") return null;
    const dock = root.document?.querySelector?.(".restaurant-decision-dock");
    if (!dock) return null;

    const decision = currentDecisionState();
    dock.dataset.status = decision.status;

    const restaurantName = dock.querySelector("[data-dock-restaurant]");
    if (restaurantName) restaurantName.textContent = decision.restaurantName;

    const confidenceText = dock.querySelector("[data-dock-confidence]");
    if (confidenceText) confidenceText.textContent = decision.confidenceText;

    const influenceText = dock.querySelector("[data-dock-influence]");
    if (influenceText) influenceText.textContent = decision.influenceText;

    const requirement = dock.querySelector("[data-lock-requirement]");
    if (requirement) requirement.textContent = decision.guidance;

    const lock = dock.querySelector("#lockRestaurant");
    if (lock) {
      lock.disabled = !decision.ready;
      lock.setAttribute("aria-disabled", String(!decision.ready));
      lock.setAttribute("aria-describedby", "restaurantDecisionGuidance");
    }

    configureConfidenceControl(dock.querySelector(".restaurant-dock-confidence"), decision);
    return decision;
  }

  function bindDecisionRefresh(element) {
    if (!element || element.dataset.sprint442Bound === "true") return;
    element.dataset.sprint442Bound = "true";
    element.addEventListener("click", () => root.setTimeout?.(syncDecisionDock, 0));
  }

  function installDecisionDock() {
    if (typeof state === "undefined" || state.screen !== "restaurant") return false;
    const dock = root.document?.querySelector?.(".restaurant-lock-dock");
    if (!dock) return false;

    const standalone = root.document.querySelector(".restaurant-confidence-section");
    const confidenceBox = standalone?.querySelector(".confidence-box") || dock.querySelector(".restaurant-dock-confidence");
    const lockButton = dock.querySelector("#lockRestaurant");
    if (!confidenceBox || !lockButton) return false;

    dock.classList.add("restaurant-decision-dock");
    dock.setAttribute("aria-label", "Restaurant decision center");

    const summary = dock.firstElementChild;
    summary?.classList?.add("restaurant-dock-summary");
    if (summary && !summary.querySelector("[data-dock-influence]")) {
      const influence = root.document.createElement("small");
      influence.setAttribute("data-dock-influence", "");
      summary.appendChild(influence);
    }

    if (confidenceBox.parentElement !== dock) dock.insertBefore(confidenceBox, lockButton);
    standalone?.remove();

    const requirement = dock.querySelector("[data-lock-requirement]");
    if (requirement) requirement.id = "restaurantDecisionGuidance";

    root.document.querySelectorAll(".choice-first-restaurant, .restaurant-decision-dock [data-confidence], [data-reason]")
      .forEach(bindDecisionRefresh);

    syncDecisionDock();
    return true;
  }

  root.BiteBuddySprint442 = Object.freeze({
    version: release?.version || "v0.4.4.2",
    confidenceScale: Object.freeze([1, 2, 3, 4, 5]),
    getRestaurantDecisionState,
    currentDecisionState,
    syncDecisionDock,
    installDecisionDock
  });

  if (typeof root.document === "undefined" || typeof restaurantRound !== "function" || typeof render !== "function") return;

  const baseRestaurantRound442 = restaurantRound;
  restaurantRound = function () {
    baseRestaurantRound442();
    installDecisionDock();
  };

  const baseRender442 = render;
  render = function () {
    baseRender442();
    installDecisionDock();
    release?.apply?.();
  };

  render();
})(window);
