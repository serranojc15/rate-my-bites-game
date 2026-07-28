// Sprint 1 — The Cinematic Experience
(function (root) {
  "use strict";

  let transitionLocked = false;
  let lastSceneKey = "";

  function stateObject() {
    try { if (typeof state !== "undefined") return state; } catch {}
    return root.state;
  }

  function storyObject() {
    try { if (typeof livingDinnerStory !== "undefined") return livingDinnerStory; } catch {}
    return root.livingDinnerStory;
  }

  function reducedMotion() {
    try { return Boolean(root.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches); } catch { return false; }
  }

  function currentEvent() {
    const story = storyObject();
    const current = stateObject();
    return story?.events?.[current?.conversationIndex || 0] || null;
  }

  function prepareMissionOpening() {
    const story = storyObject();
    if (!story?.events?.length || story.cinematicMissionPrepared) return;
    const missionIndex = story.events.findIndex(event => event.id === "pup-read");
    if (missionIndex < 0) return;
    const mission = story.events.splice(missionIndex, 1)[0];
    mission.text = story.missionText || mission.text;
    mission.emotion = "decisive";
    story.events.unshift(mission);
    story.cinematicMissionPrepared = true;
  }

  function sceneKey() {
    const current = stateObject();
    const event = currentEvent();
    return `${current?.currentVariantId || "A"}:${current?.attemptNumber || 1}:${current?.conversationIndex || 0}:${event?.id || "scene"}`;
  }

  function buildHud(section, event, index, total) {
    section.querySelector(".cinematic-hud")?.remove();
    const hud = root.document.createElement("div");
    hud.className = "cinematic-hud";
    hud.innerHTML = `
      <div class="cinematic-rec-row">
        <span class="cinematic-rec"><i aria-hidden="true"></i> REC</span>
        ${event?.kind === "confessional" ? '<span class="cinematic-mode">CONFESSIONAL</span>' : ""}
      </div>
      <div class="cinematic-recording-line" aria-label="Episode progress">
        <span style="width:${Math.max(0, Math.min(100, ((index + 1) / total) * 100))}%"></span>
      </div>
      <div class="cinematic-dots" aria-hidden="true">
        ${Array.from({ length: total }, (_, dotIndex) => `<i class="${dotIndex < index ? "complete" : dotIndex === index ? "active" : ""}"></i>`).join("")}
      </div>`;
    section.prepend(hud);
  }

  function removeApplicationChrome(section) {
    section.querySelector(".living-toolbar")?.remove();
    section.querySelector(".conversation-scene-heading")?.remove();
    section.querySelector(".camera-label")?.remove();
    section.querySelector(".living-speaker")?.remove();
    section.querySelector(".confidence-pulses")?.remove();
    section.querySelector(".living-footer")?.remove();
    section.querySelector("#nextLiving")?.remove();
    section.querySelectorAll(".conversation-tap-cue").forEach(node => node.remove());
  }

  function makeSceneInteractive(section, event, index) {
    section.classList.add("cinematic-stage");
    section.setAttribute("role", "button");
    section.setAttribute("tabindex", "0");
    section.setAttribute("aria-label", index === 0
      ? "Begin the episode. Tap anywhere or press Enter."
      : `Continue after ${event?.speaker || "this scene"}.`);

    const visual = section.querySelector(".living-visual");
    if (visual) {
      visual.removeAttribute("role");
      visual.removeAttribute("tabindex");
      visual.removeAttribute("aria-label");
      visual.classList.remove("conversation-portrait-button");
    }

    const activate = eventObject => {
      if (eventObject?.target?.closest?.("button, a, input, select, textarea")) return;
      if (transitionLocked) return;
      transitionLocked = true;
      section.classList.add("cinematic-leaving");
      const delay = reducedMotion() ? 0 : 180;
      root.setTimeout(() => {
        root.BiteBuddySprint447?.advanceConversationOnce?.();
        root.setTimeout(() => { transitionLocked = false; }, reducedMotion() ? 0 : 260);
      }, delay);
    };

    section.onclick = activate;
    section.onkeydown = keyboardEvent => {
      if (keyboardEvent.key !== "Enter" && keyboardEvent.key !== " ") return;
      keyboardEvent.preventDefault();
      activate(keyboardEvent);
    };
  }

  function polishConversation() {
    const current = stateObject();
    const story = storyObject();
    const event = currentEvent();
    const section = root.document?.querySelector?.(".living-stage");
    if (!section || current?.screen !== "conversation" || !event || !story?.events?.length) return false;

    const key = sceneKey();
    removeApplicationChrome(section);
    buildHud(section, event, current.conversationIndex, story.events.length);
    makeSceneInteractive(section, event, current.conversationIndex);

    const dialogue = section.querySelector(".living-dialogue blockquote");
    if (dialogue) dialogue.setAttribute("aria-label", `${event.speaker}: ${event.text}`);

    if (lastSceneKey !== key) {
      section.classList.remove("cinematic-entered");
      void section.offsetWidth;
      section.classList.add("cinematic-entered");
      lastSceneKey = key;
    }
    return true;
  }

  function install() {
    prepareMissionOpening();
    const baseRender = root.render;
    if (typeof baseRender !== "function" || baseRender.cinematicSprint1Wrapped) return false;
    const wrappedRender = function () {
      prepareMissionOpening();
      baseRender();
      polishConversation();
    };
    wrappedRender.cinematicSprint1Wrapped = true;
    wrappedRender.cinematicSprint1Base = baseRender;
    root.render = wrappedRender;
    try { render = wrappedRender; } catch {}
    root.render();
    return true;
  }

  root.BiteBuddyCinematicSprint1 = Object.freeze({
    prepareMissionOpening,
    polishConversation,
    install
  });

  if (typeof root.document !== "undefined") install();
})(window);
