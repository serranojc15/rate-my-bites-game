// Sprint 2 follow-up — restaurant prediction pacing, reveal control, and scene positioning.
(function (root) {
  "use strict";

  const STANDARD_DELAYS = Object.freeze({ locked: 2000, counting: 3000 });
  const REDUCED_DELAYS = Object.freeze({ locked: 500, counting: 700 });
  let revealTimer = null;
  let scheduledKey = "";
  let lastSceneKey = "";

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

  function appRoot() {
    return root.document?.querySelector?.("#app") || null;
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function reducedMotion() {
    try {
      return Boolean(root.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
    } catch {
      return false;
    }
  }

  function selectedRestaurant() {
    const current = activeState();
    try {
      if (typeof restaurantFor === "function") {
        return restaurantFor(current?.restaurantRevealLockedChoice || current?.groupRestaurant) || null;
      }
    } catch {}
    return null;
  }

  function clearRevealTimer() {
    if (revealTimer) root.clearTimeout?.(revealTimer);
    revealTimer = null;
    scheduledKey = "";
  }

  function stageDelay(stage) {
    const delays = reducedMotion() ? REDUCED_DELAYS : STANDARD_DELAYS;
    return Number(delays[stage]) || 0;
  }

  function suspenseMarkup(stage, predicted) {
    if (stage === "locked") {
      return `<section class="restaurant-reveal-stage stage-locked sprint2-prediction-polish" aria-live="polite">
        <p class="eyebrow">Restaurant Prediction Locked</p>
        <h1>Your choice is ${escapeHtml(predicted?.name || "locked")}.</h1>
        <p>The table’s final vote is opening.</p>
        <div class="reveal-pulse" aria-hidden="true"><span></span><span></span><span></span></div>
      </section>`;
    }
    if (stage === "counting") {
      return `<section class="restaurant-reveal-stage stage-counting sprint2-prediction-polish" aria-live="polite">
        <p class="eyebrow">Counting the Table’s Votes…</p>
        <h1>Three diners. One shared table.</h1>
        <ol class="vote-count-list">${activeDiners().map(person => `<li><span>✓</span>${escapeHtml(person.name)} has decided.</li>`).join("")}</ol>
      </section>`;
    }
    return `<section class="restaurant-reveal-stage stage-incoming sprint2-prediction-polish" aria-live="polite">
      <p class="eyebrow">The Final Vote</p>
      <h1>The group has chosen…</h1>
      <div class="reveal-pulse" aria-hidden="true"><span></span><span></span><span></span></div>
      <div class="actions"><button class="primary-button" id="revealGroupChoice" type="button">Reveal the Group’s Choice</button></div>
    </section>`;
  }

  function scheduleNextStage(stage) {
    if (stage === "incoming") return false;
    const current = activeState();
    const next = stage === "locked" ? "counting" : stage === "counting" ? "incoming" : null;
    if (!current || !next) return false;
    const key = `${current.currentVariantId || "A"}:${current.attemptNumber || "attempt"}:${stage}`;
    if (revealTimer && scheduledKey === key) return false;
    clearRevealTimer();
    scheduledKey = key;
    revealTimer = root.setTimeout?.(() => {
      revealTimer = null;
      scheduledKey = "";
      const latest = activeState();
      if (latest?.screen !== "restaurantReveal" || latest?.restaurantRevealStage !== stage) return;
      latest.restaurantRevealStage = next;
      root.PupVoice?.cancel?.();
      root.render?.();
    }, stageDelay(stage));
    return Boolean(revealTimer);
  }

  function bindManualReveal() {
    const button = root.document?.querySelector?.("#revealGroupChoice");
    if (!button) return false;
    button.onclick = () => {
      const current = activeState();
      if (!current || current.screen !== "restaurantReveal" || current.restaurantRevealStage !== "incoming") return;
      clearRevealTimer();
      current.restaurantRevealStage = "revealed";
      root.PupVoice?.cancel?.();
      root.render?.();
    };
    return true;
  }

  function sceneKey(current = activeState()) {
    if (!current?.screen) return "";
    if (current.screen === "restaurantReveal") return `${current.screen}:${current.restaurantRevealStage || "locked"}`;
    if (current.screen === "play") return `${current.screen}:${current.stageIndex || 0}:${current.dinerIndex || 0}`;
    if (current.screen === "intro") return `${current.screen}:${current.introIndex || 0}`;
    if (current.screen === "conversation") return `${current.screen}:${current.conversationIndex || 0}`;
    return current.screen;
  }

  function restoreTop() {
    const run = () => {
      const container = appRoot();
      if (container) {
        if (typeof container.scrollTo === "function") container.scrollTo({ top: 0, left: 0, behavior: "auto" });
        else container.scrollTop = 0;
      }
      if (typeof root.scrollTo === "function") root.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };
    if (typeof root.requestAnimationFrame === "function") root.requestAnimationFrame(run);
    else run();
  }

  function polishTerminology() {
    const document = root.document;
    if (!document?.querySelector) return;

    const finaleLabel = document.querySelector(".finale-read > span");
    if (finaleLabel) finaleLabel.textContent = "Restaurant Prediction";

    const dockLabel = document.querySelector(".restaurant-lock-dock > div > span");
    if (dockLabel) dockLabel.textContent = "Current prediction";

    const confidenceHeading = document.querySelector(".restaurant-confidence-section h2");
    if (confidenceHeading) confidenceHeading.textContent = "How confident are you in this prediction?";

    const outcomeTitle = document.querySelector(".restaurant-outcome-banner strong");
    const outcomeCopy = document.querySelector(".restaurant-outcome-banner p");
    if (outcomeTitle?.textContent?.trim() === "You read the table correctly") {
      outcomeTitle.textContent = "You predicted the group’s choice";
    }
    if (outcomeCopy?.textContent?.trim() === "Your working read matched the group compromise.") {
      outcomeCopy.textContent = "Your restaurant prediction matched the group compromise.";
    }
  }

  function installRevealControl() {
    const baseReveal = root.restaurantReveal;
    if (typeof baseReveal !== "function" || baseReveal.sprint2PredictionPolishWrapped) return false;

    const wrappedReveal = function () {
      const current = activeState();
      const stage = ["locked", "counting", "incoming", "revealed"].includes(current?.restaurantRevealStage)
        ? current.restaurantRevealStage
        : "locked";
      current.restaurantRevealStage = stage;

      if (stage === "revealed") {
        clearRevealTimer();
        baseReveal();
        polishTerminology();
        return;
      }

      const container = appRoot();
      if (!container) {
        baseReveal();
        return;
      }

      container.innerHTML = suspenseMarkup(stage, selectedRestaurant());
      if (stage === "incoming") bindManualReveal();
      else scheduleNextStage(stage);
      root.BiteBuddyRelease?.apply?.();
    };

    wrappedReveal.sprint2PredictionPolishWrapped = true;
    wrappedReveal.sprint2PredictionPolishBase = baseReveal;
    root.restaurantReveal = wrappedReveal;
    try { restaurantReveal = wrappedReveal; } catch {}
    return true;
  }

  function installRenderPolish() {
    const baseRender = root.render;
    if (typeof baseRender !== "function" || baseRender.sprint2PredictionPolishWrapped) return false;
    lastSceneKey = sceneKey();

    const wrappedRender = function () {
      const previousKey = lastSceneKey;
      baseRender();
      const current = activeState();
      const nextKey = sceneKey(current);
      if (nextKey && nextKey !== previousKey && current?.screen !== "conversation") restoreTop();
      if (current?.screen !== "restaurantReveal") clearRevealTimer();
      lastSceneKey = nextKey;
      polishTerminology();
      root.BiteBuddyRelease?.apply?.();
    };

    wrappedRender.sprint2PredictionPolishWrapped = true;
    wrappedRender.sprint2PredictionPolishBase = baseRender;
    root.render = wrappedRender;
    try { render = wrappedRender; } catch {}
    return true;
  }

  root.BiteBuddySprint2PredictionPolish = Object.freeze({
    standardDelays: STANDARD_DELAYS,
    reducedDelays: REDUCED_DELAYS,
    stageDelay,
    sceneKey,
    restoreTop,
    polishTerminology,
    install() {
      installRevealControl();
      installRenderPolish();
      return true;
    }
  });

  if (typeof root.document === "undefined") return;
  root.BiteBuddySprint2PredictionPolish.install();
  root.render?.();
})(window);
