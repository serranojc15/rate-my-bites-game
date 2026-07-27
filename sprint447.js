// Bite Buddy League v0.4.4.7 — Conversation Flow & Restaurant Suspense Polish.
(function (root) {
  "use strict";

  const release = root.BiteBuddyRelease;
  const RESTAURANT_STAGES = Object.freeze(["locked", "counting", "incoming", "revealed"]);
  const STANDARD_REVEAL_DELAYS = Object.freeze({ locked: 1000, counting: 1600, incoming: 1500 });
  const REDUCED_REVEAL_DELAYS = Object.freeze({ locked: 500, counting: 700, incoming: 700 });
  let conversationAdvanceLockedUntil = 0;
  let conversationAdvanceKey = "";
  let conversationFocusRequest = 0;
  let pendingConversationKey = "";
  let restaurantRevealTimer = null;
  let restaurantScheduledKey = "";

  function finite(value, fallback = 0) {
    return Number.isFinite(Number(value)) ? Number(value) : fallback;
  }

  function activeState() {
    try {
      if (typeof state !== "undefined") return state;
    } catch {}
    return root.state;
  }

  function activeDiners() {
    try {
      if (typeof diners !== "undefined") return diners;
    } catch {}
    return root.diners || [];
  }

  function activeStory() {
    try {
      if (typeof livingDinnerStory !== "undefined") return livingDinnerStory;
    } catch {}
    return root.livingDinnerStory || { events: [] };
  }

  function prefersReducedMotion() {
    try {
      return Boolean(root.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
    } catch {
      return false;
    }
  }

  function safeEscape(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function currentConversationEvent(stateObject = activeState()) {
    const events = activeStory()?.events || [];
    const index = Math.max(0, Math.min(events.length - 1, Math.floor(finite(stateObject?.conversationIndex, 0))));
    return events[index] || null;
  }

  function conversationSceneKey(stateObject = activeState(), event = currentConversationEvent(stateObject)) {
    if (!stateObject || stateObject.screen !== "conversation" || !event) return "";
    return [
      "conversation",
      stateObject.currentVariantId || "A",
      stateObject.attemptNumber || stateObject.attemptType || "attempt",
      Math.floor(finite(stateObject.conversationIndex, 0)),
      event.id || event.speakerId || event.speaker || "scene"
    ].join(":");
  }

  function isConversationAdvanceReady(stateObject = activeState(), event = currentConversationEvent(stateObject)) {
    return Boolean(stateObject?.screen === "conversation" && event);
  }

  function conversationAdvanceLabel(event, isLast = false) {
    const speaker = String(event?.speaker || "this scene");
    return isLast
      ? `Lock the evidence after ${speaker}.`
      : `Continue to the next conversation after ${speaker}.`;
  }

  function restaurantRevealDelay(stage, reducedMotion = false) {
    const delays = reducedMotion ? REDUCED_REVEAL_DELAYS : STANDARD_REVEAL_DELAYS;
    return finite(delays[stage], 0);
  }

  function restaurantStageNarration(stage, correct = false) {
    if (stage === "locked") return "The prediction is locked.";
    if (stage === "counting") return "Three diners. One shared table.";
    if (stage === "incoming") return "The group has chosen.";
    if (stage === "revealed") {
      return correct
        ? "You read the table correctly and earned all 120 restaurant points."
        : "The table chose a different restaurant this time. Let’s see which clues shaped the decision.";
    }
    return "";
  }

  function restaurantNarrationKey({ variantId, attemptId, stage, predictedId, actualId } = {}) {
    return [
      "restaurant-reveal",
      variantId || "variant",
      attemptId || "attempt",
      stage || "stage",
      predictedId || "prediction",
      actualId || "actual"
    ].join(":");
  }

  function clearRestaurantRevealTimer() {
    if (restaurantRevealTimer) root.clearTimeout?.(restaurantRevealTimer);
    restaurantRevealTimer = null;
    restaurantScheduledKey = "";
  }

  function conversationHeaderOffset() {
    const header = root.document?.querySelector?.(".top-bar");
    if (!header || typeof root.getComputedStyle !== "function") return 12;
    try {
      const position = root.getComputedStyle(header)?.position;
      if (position === "fixed" || position === "sticky") {
        return Math.max(12, finite(header.getBoundingClientRect?.().height, 0) + 12);
      }
    } catch {}
    return 12;
  }

  function focusConversationStage({ sceneKey, behavior } = {}) {
    const document = root.document;
    const stateObject = activeState();
    const resolvedKey = sceneKey || conversationSceneKey(stateObject);
    if (!document?.querySelector || !resolvedKey) return false;
    if (stateObject?.sprint447FocusedConversationKey === resolvedKey || pendingConversationKey === resolvedKey) return false;

    const requestId = ++conversationFocusRequest;
    pendingConversationKey = resolvedKey;
    const run = () => {
      if (requestId !== conversationFocusRequest) return false;
      const heading = document.querySelector("[data-conversation-stage-heading]");
      const stageRoot = document.querySelector(".living-stage");
      if (!heading || !stageRoot) {
        pendingConversationKey = "";
        return false;
      }

      heading.setAttribute?.("tabindex", "-1");
      try {
        heading.focus?.({ preventScroll: true });
      } catch {
        heading.focus?.();
      }

      const motion = behavior || (prefersReducedMotion() ? "auto" : "smooth");
      const appRoot = document.querySelector("#app");
      const appIsScrollable = Boolean(
        appRoot &&
        (finite(appRoot.scrollHeight, 0) > finite(appRoot.clientHeight, 0) + 1 || finite(appRoot.scrollTop, 0) > 0)
      );

      if (appIsScrollable) {
        const top = Math.max(0, finite(stageRoot.offsetTop, 0) - finite(appRoot.offsetTop, 0) - 8);
        if (typeof appRoot.scrollTo === "function") appRoot.scrollTo({ top, behavior: motion });
        else appRoot.scrollTop = top;
      } else if (typeof root.scrollTo === "function") {
        const rectTop = finite(stageRoot.getBoundingClientRect?.().top, 0);
        const top = Math.max(0, finite(root.scrollY, 0) + rectTop - conversationHeaderOffset());
        root.scrollTo({ top, behavior: motion });
      }

      if (stateObject) stateObject.sprint447FocusedConversationKey = resolvedKey;
      pendingConversationKey = "";
      return true;
    };

    if (typeof root.requestAnimationFrame === "function") root.requestAnimationFrame(run);
    else root.setTimeout?.(run, 0) || run();
    return true;
  }

  function authoritativeConversationAdvance() {
    if (typeof root.advanceConversation === "function") return root.advanceConversation;
    try {
      if (typeof advanceConversation === "function") return advanceConversation;
    } catch {}
    return null;
  }

  function advanceConversationOnce({ stateObject = activeState(), event = currentConversationEvent(stateObject) } = {}) {
    if (!isConversationAdvanceReady(stateObject, event)) return false;
    const key = conversationSceneKey(stateObject, event);
    const now = Date.now();
    if (!key || now < conversationAdvanceLockedUntil) return false;

    const advance = authoritativeConversationAdvance();
    if (typeof advance !== "function") return false;
    conversationAdvanceKey = key;
    conversationAdvanceLockedUntil = now + 450;
    advance();
    root.setTimeout?.(() => {
      if (Date.now() >= conversationAdvanceLockedUntil) {
        conversationAdvanceKey = "";
        conversationAdvanceLockedUntil = 0;
      }
    }, 475);
    return true;
  }

  function element(tagName, className, text) {
    const node = root.document.createElement(tagName);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function stopInteractiveControlPropagation(section) {
    section.querySelectorAll?.("button, a, input, select, textarea").forEach(control => {
      control.addEventListener?.("click", event => event.stopPropagation());
      control.addEventListener?.("keydown", event => {
        if (event.key === " " || event.key === "ArrowRight") event.stopPropagation();
      });
    });
  }

  function installConversationScene() {
    const document = root.document;
    const stateObject = activeState();
    const event = currentConversationEvent(stateObject);
    const section = document?.querySelector?.(".living-stage");
    if (!section || !isConversationAdvanceReady(stateObject, event) || section.dataset.sprint447Installed === "true") return false;
    section.dataset.sprint447Installed = "true";

    const frame = section.querySelector(".living-frame");
    const visual = section.querySelector(".living-visual");
    const oldLabel = section.querySelector(".camera-label");
    const continueButton = section.querySelector("#nextLiving");
    if (!frame || !visual || !continueButton) return false;

    const people = activeDiners();
    const person = people.find(item => item.id === event.speakerId);
    const labelText = oldLabel?.textContent?.trim() || "LIVE MOMENT";
    oldLabel?.remove?.();

    const header = element("div", "conversation-scene-heading");
    const headingCopy = element("div", "conversation-scene-heading-copy");
    const label = element("p", "conversation-face-safe-label", labelText);
    const heading = element("h2", "conversation-scene-title");
    heading.setAttribute("data-conversation-stage-heading", "");
    heading.setAttribute("tabindex", "-1");
    heading.textContent = person
      ? `${event.speaker} · ${person.role || "Diner"}`
      : `${event.speaker || "Living Conversation"} · ${labelText}`;
    headingCopy.append(label, heading);

    const actions = element("div", "conversation-scene-actions");
    continueButton.classList.add("conversation-visible-continue");
    continueButton.textContent = stateObject.conversationIndex === activeStory().events.length - 1
      ? "Lock the Evidence"
      : "Next Conversation";
    actions.append(continueButton);
    header.append(headingCopy, actions);
    frame.before(header);

    const isLast = stateObject.conversationIndex === activeStory().events.length - 1;
    visual.classList.add("conversation-portrait-button");
    visual.setAttribute("role", "button");
    visual.setAttribute("tabindex", "0");
    visual.setAttribute("aria-label", conversationAdvanceLabel(event, isLast));

    const cue = element("span", "conversation-tap-cue", visual.querySelector("img")
      ? (isLast ? "Tap photo to lock evidence" : "Tap photo to continue")
      : (isLast ? "Tap scene to lock evidence" : "Tap scene to continue"));
    cue.setAttribute("aria-hidden", "true");
    visual.append(cue);

    const activate = activationEvent => {
      activationEvent?.preventDefault?.();
      activationEvent?.stopPropagation?.();
      advanceConversationOnce({ stateObject: activeState(), event: currentConversationEvent() });
    };
    visual.addEventListener("click", eventObject => {
      const nested = eventObject.target?.closest?.("button, a, input, select, textarea");
      if (nested && nested !== visual) return;
      activate(eventObject);
    });
    visual.addEventListener("keydown", eventObject => {
      if (eventObject.key !== "Enter" && eventObject.key !== " ") return;
      activate(eventObject);
    });
    continueButton.onclick = activate;

    const footer = section.querySelector(".living-footer");
    if (footer && !footer.querySelector("button")) footer.classList.add("conversation-memory-footer");
    stopInteractiveControlPropagation(section);
    focusConversationStage({ sceneKey: conversationSceneKey(stateObject, event) });
    return true;
  }

  function selectedRestaurantSafe() {
    try {
      if (typeof restaurantFor === "function") return restaurantFor(activeState()?.restaurantRevealLockedChoice || activeState()?.groupRestaurant) || null;
    } catch {}
    return null;
  }

  function actualRestaurantSafe() {
    try {
      if (typeof actualRestaurant === "function") return actualRestaurant();
    } catch {}
    return null;
  }

  function restaurantStageKey(stateObject, stage, predicted, actual) {
    return restaurantNarrationKey({
      variantId: stateObject?.currentVariantId,
      attemptId: stateObject?.attemptNumber || stateObject?.attemptType,
      stage,
      predictedId: predicted?.id,
      actualId: actual?.id
    });
  }

  function speakRestaurantStage({ stage, correct, predicted, actual, stateObject = activeState(), voice = root.PupVoice } = {}) {
    if (!stateObject || !voice || voice.settings?.enabled === false || typeof voice.speak !== "function") return false;
    if (prefersReducedMotion() && stage !== "revealed") return false;
    const line = restaurantStageNarration(stage, correct);
    if (!line) return false;
    const key = restaurantStageKey(stateObject, stage, predicted, actual);
    stateObject.sprint447RestaurantNarratedKeys = Array.isArray(stateObject.sprint447RestaurantNarratedKeys)
      ? stateObject.sprint447RestaurantNarratedKeys
      : [];
    if (stateObject.sprint447RestaurantNarratedKeys.includes(key)) return false;

    const speak = () => {
      if (activeState()?.screen !== "restaurantReveal" || activeState()?.restaurantRevealStage !== stage) return false;
      if (voice.settings?.enabled === false || stateObject.sprint447RestaurantNarratedKeys.includes(key)) return false;
      voice.cancel?.();
      stateObject.sprint447RestaurantNarratedKeys.push(key);
      return Boolean(voice.speak(line));
    };
    if (typeof root.requestAnimationFrame === "function") root.requestAnimationFrame(speak);
    else root.setTimeout?.(speak, 0) || speak();
    return true;
  }

  function suspenseMarkup(stage, predicted, people) {
    if (stage === "locked") {
      return `<section class="restaurant-reveal-stage stage-locked sprint447-suspense" aria-live="polite">
        <p class="eyebrow">Restaurant Prediction Locked</p>
        <h1>Your choice is ${safeEscape(predicted?.name || "locked")}.</h1>
        <p>The table’s final vote is opening.</p>
        <div class="reveal-pulse" aria-hidden="true"><span></span><span></span><span></span></div>
      </section>`;
    }
    if (stage === "counting") {
      return `<section class="restaurant-reveal-stage stage-counting sprint447-suspense" aria-live="polite">
        <p class="eyebrow">Counting the Table’s Votes…</p>
        <h1>Three diners. One shared table.</h1>
        <ol class="vote-count-list">${(people || []).map(person => `<li><span>✓</span>${safeEscape(person.name)} has decided.</li>`).join("")}</ol>
      </section>`;
    }
    return `<section class="restaurant-reveal-stage stage-incoming sprint447-suspense" aria-live="polite">
      <p class="eyebrow">The Final Vote</p>
      <h1>The group has chosen…</h1>
      <div class="reveal-pulse" aria-hidden="true"><span></span><span></span><span></span></div>
    </section>`;
  }

  function scheduleRestaurantStage({ stage, stateObject, predicted, actual } = {}) {
    const nextIndex = RESTAURANT_STAGES.indexOf(stage) + 1;
    const next = RESTAURANT_STAGES[nextIndex];
    if (!next) return false;
    const key = restaurantStageKey(stateObject, stage, predicted, actual);
    if (restaurantRevealTimer && restaurantScheduledKey === key) return false;
    clearRestaurantRevealTimer();
    restaurantScheduledKey = key;
    restaurantRevealTimer = root.setTimeout?.(() => {
      restaurantRevealTimer = null;
      restaurantScheduledKey = "";
      const current = activeState();
      if (current?.screen !== "restaurantReveal" || current?.restaurantRevealStage !== stage) return;
      current.restaurantRevealStage = next;
      root.PupVoice?.cancel?.();
      root.render?.();
    }, restaurantRevealDelay(stage, prefersReducedMotion()));
    return Boolean(restaurantRevealTimer);
  }

  function installRestaurantRevealPolish() {
    const baseRestaurantReveal = root.restaurantReveal;
    if (typeof baseRestaurantReveal !== "function" || baseRestaurantReveal.sprint447Wrapped) return false;

    const wrappedRestaurantReveal = function () {
      const stateObject = activeState();
      const stage = RESTAURANT_STAGES.includes(stateObject?.restaurantRevealStage)
        ? stateObject.restaurantRevealStage
        : "locked";
      stateObject.restaurantRevealStage = stage;
      const predicted = selectedRestaurantSafe();
      const actual = actualRestaurantSafe();
      const correct = Boolean(predicted && actual && predicted.id === actual.id);

      if (stage === "revealed") {
        clearRestaurantRevealTimer();
        stateObject.restaurantRevealNarratedStages = Array.isArray(stateObject.restaurantRevealNarratedStages)
          ? stateObject.restaurantRevealNarratedStages
          : [];
        if (!stateObject.restaurantRevealNarratedStages.includes("revealed")) {
          stateObject.restaurantRevealNarratedStages.push("revealed");
        }
        baseRestaurantReveal();
        speakRestaurantStage({ stage, correct, predicted, actual, stateObject });
        release?.apply?.();
        return;
      }

      const appRoot = root.document?.querySelector?.("#app");
      if (!appRoot) {
        baseRestaurantReveal();
        return;
      }
      appRoot.innerHTML = suspenseMarkup(stage, predicted, activeDiners());
      speakRestaurantStage({ stage, correct, predicted, actual, stateObject });
      scheduleRestaurantStage({ stage, stateObject, predicted, actual });
      release?.apply?.();
    };
    wrappedRestaurantReveal.sprint447Wrapped = true;
    wrappedRestaurantReveal.sprint447Base = baseRestaurantReveal;
    root.restaurantReveal = wrappedRestaurantReveal;
    try { restaurantReveal = wrappedRestaurantReveal; } catch {}
    return true;
  }

  function installRenderPolish() {
    const baseRender = root.render;
    if (typeof baseRender !== "function" || baseRender.sprint447Wrapped) return false;
    const wrappedRender = function () {
      baseRender();
      const stateObject = activeState();
      if (stateObject?.screen === "conversation") installConversationScene();
      if (stateObject?.screen !== "restaurantReveal") clearRestaurantRevealTimer();
      release?.apply?.();
    };
    wrappedRender.sprint447Wrapped = true;
    wrappedRender.sprint447Base = baseRender;
    root.render = wrappedRender;
    try { render = wrappedRender; } catch {}
    return true;
  }

  root.BiteBuddySprint447 = Object.freeze({
    version: release?.version || "v0.4.4.7",
    restaurantStages: RESTAURANT_STAGES,
    standardRevealDelays: STANDARD_REVEAL_DELAYS,
    reducedRevealDelays: REDUCED_REVEAL_DELAYS,
    prefersReducedMotion,
    currentConversationEvent,
    conversationSceneKey,
    isConversationAdvanceReady,
    conversationAdvanceLabel,
    restaurantRevealDelay,
    restaurantStageNarration,
    restaurantNarrationKey,
    focusConversationStage,
    advanceConversationOnce,
    installConversationScene,
    speakRestaurantStage,
    scheduleRestaurantStage,
    installConversationAndSuspensePolish() {
      installRestaurantRevealPolish();
      installRenderPolish();
      return true;
    }
  });

  if (typeof root.initialState === "function") {
    const baseInitialState447 = root.initialState;
    root.initialState = function () {
      return {
        ...baseInitialState447(),
        sprint447FocusedConversationKey: "",
        sprint447RestaurantNarratedKeys: []
      };
    };
  }

  const stateObject = activeState();
  if (stateObject) {
    stateObject.sprint447FocusedConversationKey = stateObject.sprint447FocusedConversationKey || "";
    stateObject.sprint447RestaurantNarratedKeys = Array.isArray(stateObject.sprint447RestaurantNarratedKeys)
      ? stateObject.sprint447RestaurantNarratedKeys
      : [];
  }

  if (typeof root.document === "undefined") return;
  root.BiteBuddySprint447.installConversationAndSuspensePolish();
  release?.apply?.();
  root.render?.();
})(window);
