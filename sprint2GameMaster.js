// Sprint 2 — The Game Master
(function (root) {
  "use strict";

  function activeState() {
    try { if (typeof state !== "undefined") return state; } catch {}
    return root.state;
  }

  function setHostCopy(text, label) {
    const card = root.document?.querySelector?.(".host-card");
    const paragraph = card?.querySelector?.("p");
    const heading = card?.querySelector?.("strong");
    if (!card || !paragraph) return false;
    card.classList.add("game-master-card");
    if (heading && label) heading.textContent = label;
    paragraph.textContent = text;
    return true;
  }

  function removeScreenplayDirections() {
    const phrases = [
      "The table settles in.",
      "The music falls away.",
      "The room goes quiet.",
      "The camera moves closer."
    ];
    root.document?.querySelectorAll?.(".director-caption, .scene-direction, .conversation-atmosphere, em").forEach(node => {
      if (phrases.includes(node.textContent?.trim())) node.remove();
    });
  }

  function polishGameMasterFlow() {
    const current = activeState();
    if (!current || !root.document) return false;

    removeScreenplayDirections();

    if (current.screen === "conversation") {
      root.document.querySelector(".briefing-progress")?.remove();
      root.document.querySelector(".cinematic-mode")?.remove();
    }

    if (current.screen === "conversationFinale") {
      const pupLine = root.document.querySelector(".finale-pup p");
      if (pupLine) pupLine.innerHTML = "<strong>Pup:</strong> You’ve heard the table. Trust your instincts. Where will they eat?";
    }

    if (current.screen === "restaurant") {
      setHostCopy(
        "You’ve heard everyone’s perspective. Now trust your instincts. Where do you think this group will choose for dinner?",
        "Pup, Game Master"
      );
      root.document.querySelector(".section-heading")?.classList.add("game-master-question");
    }

    if (current.screen === "restaurantReveal") {
      const title = root.document.querySelector(".screen-title");
      if (title && !root.document.querySelector(".game-master-reveal-cue")) {
        const cue = root.document.createElement("p");
        cue.className = "game-master-reveal-cue";
        cue.textContent = "Pup says: Let’s see what the table decided.";
        title.before(cue);
      }
      root.document.querySelector(".host-card")?.classList.add("game-master-card", "game-master-result");
    }

    return true;
  }

  function install() {
    const baseRender = root.render;
    if (typeof baseRender !== "function" || baseRender.sprint2GameMasterWrapped) return false;
    const wrappedRender = function () {
      baseRender();
      polishGameMasterFlow();
    };
    wrappedRender.sprint2GameMasterWrapped = true;
    wrappedRender.sprint2GameMasterBase = baseRender;
    root.render = wrappedRender;
    try { render = wrappedRender; } catch {}
    root.render();
    return true;
  }

  root.BiteBuddySprint2GameMaster = Object.freeze({ install, polishGameMasterFlow });
  if (typeof root.document !== "undefined") install();
})(window);
