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
    const conversation = root.document?.querySelector?.(".living-stage");
    if (!conversation) return;

    conversation.querySelectorAll(
      ".director-caption, .scene-direction, .conversation-atmosphere, .director-beat, .scene-beat"
    ).forEach(node => node.remove());

    const phrases = [
      "The table settles in.",
      "The music falls away.",
      "The room goes quiet.",
      "The camera moves closer.",
      "A beat. Olivia laughs."
    ];
    conversation.querySelectorAll("em, small, p, span").forEach(node => {
      if (phrases.includes(node.textContent?.trim())) node.remove();
    });
  }

  function removeObsoleteConversationHud() {
    const conversation = root.document?.querySelector?.(".living-stage");
    if (!conversation) return;

    // Sprint 4.4.7 created a second production header. Sprint 1's
    // .cinematic-hud is now the single authoritative conversation HUD.
    conversation.querySelectorAll([
      ".conversation-scene-heading",
      ".conversation-scene-heading-copy",
      ".conversation-face-safe-label",
      ".conversation-scene-title",
      ".conversation-scene-actions",
      ".camera-label",
      ".briefing-progress"
    ].join(", ")).forEach(node => node.remove());

    // Remove any older camera-direction element that survives under a
    // different presentation class, without touching dialogue or names.
    const cameraTerms = /^(?:[●•]\s*)?(?:REC|CLOSE-UP|CLOSE UP|WIDE SHOT|SLOW PUSH-IN|SLOW PUSH IN|MEDIUM SHOT|LIVE MOMENT|DINNER CONVERSATION|PUP COMMENTARY|OFF-CAMERA QUESTION|CONFESSIONAL|NEW EVIDENCE)$/i;
    conversation.querySelectorAll("header, [class*='camera'], [class*='scene-heading'], [class*='face-safe']").forEach(node => {
      if (node.closest(".cinematic-hud")) return;
      const text = node.textContent?.trim() || "";
      if (cameraTerms.test(text) || /(?:CLOSE-UP|WIDE SHOT|SLOW PUSH-IN)/i.test(text)) node.remove();
    });
  }

  function cleanConversationPresentation() {
    removeObsoleteConversationHud();
    removeScreenplayDirections();
    root.document?.querySelector?.(".cinematic-mode")?.remove();
  }

  function polishGameMasterFlow() {
    const current = activeState();
    if (!current || !root.document) return false;

    if (current.screen === "conversation") {
      cleanConversationPresentation();
      // Older presentation wrappers can finish work later in the same frame.
      // Repeat the structural cleanup once after layout rather than masking it.
      root.requestAnimationFrame?.(cleanConversationPresentation);
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

  root.BiteBuddySprint2GameMaster = Object.freeze({
    install,
    polishGameMasterFlow,
    removeObsoleteConversationHud,
    removeScreenplayDirections
  });
  if (typeof root.document !== "undefined") install();
})(window);