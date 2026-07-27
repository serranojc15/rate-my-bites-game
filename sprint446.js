// Bite Buddy League v0.4.4.6 — Reveal Navigation & Narration Polish.
(function (root) {
  "use strict";

  const release = root.BiteBuddyRelease;
  const numberWords = Object.freeze({ 1: "one", 2: "two", 3: "three" });
  let pendingStageKey = "";
  let navigationRequest = 0;

  function finite(value, fallback = 0) {
    return Number.isFinite(Number(value)) ? Number(value) : fallback;
  }

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, finite(value, minimum)));
  }

  function prefersReducedMotion() {
    try {
      return Boolean(root.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
    } catch {
      return false;
    }
  }

  function dinerResultNarration({ dinerName, correctCount, earned, possible = 60 } = {}) {
    const name = String(dinerName || "This diner");
    const correct = clamp(Math.floor(finite(correctCount, 0)), 0, 3);
    const maximum = Math.max(0, Math.floor(finite(possible, 60)));
    const subtotal = clamp(Math.floor(finite(earned, 0)), 0, maximum);

    if (correct === 3 && subtotal === maximum) {
      return `You read ${name} perfectly and earned all ${maximum} points.`;
    }
    if (correct === 3) {
      return `You correctly predicted ${name}’s entire order and earned ${subtotal} out of ${maximum} points.`;
    }
    if (correct === 2) {
      return `You correctly predicted two of ${name}’s three choices and earned ${subtotal} out of ${maximum} points.`;
    }
    if (correct === 1) {
      return `You correctly predicted one of ${name}’s three choices and earned ${subtotal} out of ${maximum} points.`;
    }
    return `${name}’s order went in a different direction this time. Let’s look at which clues mattered most.`;
  }

  function dinerNarrationKey({ variantId, attemptId, dinerId, phase = "diner" } = {}) {
    return [
      String(variantId || "variant"),
      String(attemptId || "attempt"),
      String(phase || "diner"),
      String(dinerId || "diner"),
      "result"
    ].join(":");
  }

  function isRevealStageChange(previousKey, nextKey) {
    return Boolean(nextKey && previousKey !== nextKey);
  }

  function currentStageKey(stateObject = root.state) {
    if (!stateObject) return "";
    const variant = stateObject.currentVariantId || "variant";
    const attempt = stateObject.attemptNumber || stateObject.attemptType || "attempt";
    if (stateObject.screen === "missionReport") return `mission:${variant}:${attempt}`;
    if (stateObject.screen !== "results") return "";
    const phase = stateObject.finalRevealPhase || "opening";
    if (phase === "diner") {
      const index = clamp(stateObject.finalRevealPersonIndex, 0, Math.max(0, (root.diners?.length || 1) - 1));
      const diner = root.diners?.[index];
      return `results:${variant}:${attempt}:diner:${diner?.id || index}`;
    }
    return `results:${variant}:${attempt}:${phase}`;
  }

  function revealHeaderOffset() {
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

  function focusNewRevealStage({
    stageKey,
    headingSelector = "[data-final-reveal-heading]",
    rootSelector = ".final-reveal-444",
    behavior
  } = {}) {
    const document = root.document;
    const resolvedKey = stageKey || currentStageKey();
    const stateObject = root.state;
    if (!document?.querySelector || !resolvedKey) return false;

    const previousKey = stateObject?.sprint446FocusedStageKey || "";
    if (!isRevealStageChange(previousKey, resolvedKey) || pendingStageKey === resolvedKey) return false;

    const requestId = ++navigationRequest;
    pendingStageKey = resolvedKey;
    const run = () => {
      if (requestId !== navigationRequest) return false;
      const heading = document.querySelector(headingSelector);
      const stageRoot = document.querySelector(rootSelector) || heading;
      if (!heading || !stageRoot) {
        pendingStageKey = "";
        return false;
      }

      heading.setAttribute?.("tabindex", "-1");
      heading.setAttribute?.("data-reveal-stage-heading", "");
      stageRoot.setAttribute?.("data-reveal-stage-root", "");
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
        const top = Math.max(0, finite(stageRoot.offsetTop, 0) - 8);
        if (typeof appRoot.scrollTo === "function") appRoot.scrollTo({ top, behavior: motion });
        else appRoot.scrollTop = top;
      } else if (typeof root.scrollTo === "function") {
        const rectTop = finite(stageRoot.getBoundingClientRect?.().top, 0);
        const top = Math.max(0, finite(root.scrollY, 0) + rectTop - revealHeaderOffset());
        root.scrollTo({ top, behavior: motion });
      }

      if (stateObject) stateObject.sprint446FocusedStageKey = resolvedKey;
      pendingStageKey = "";
      return true;
    };

    if (typeof root.requestAnimationFrame === "function") root.requestAnimationFrame(run);
    else root.setTimeout?.(run, 0) || run();
    return true;
  }

  function speakDinerResult({ result, stateObject = root.state, voice = root.PupVoice } = {}) {
    if (!result?.person || !stateObject || stateObject.finalRevealPhase !== "diner") return false;
    if (stateObject.finalRevealShowAll || stateObject.finalRevealPhase === "review") return false;
    if (!voice || voice.settings?.enabled === false || typeof voice.speak !== "function") return false;

    const correctCount = (result.answers || []).filter(answer => answer.correct).length;
    const key = dinerNarrationKey({
      variantId: stateObject.currentVariantId,
      attemptId: stateObject.attemptNumber || stateObject.attemptType,
      dinerId: result.person.id,
      phase: stateObject.finalRevealPhase
    });
    const narrated = Array.isArray(stateObject.finalRevealNaturalNarratedKeys)
      ? stateObject.finalRevealNaturalNarratedKeys
      : [];
    if (narrated.includes(key)) return false;

    const line = dinerResultNarration({
      dinerName: result.person.name,
      correctCount,
      earned: result.pointsEarned,
      possible: result.pointsPossible || 60
    });

    const speak = () => {
      const currentKey = dinerNarrationKey({
        variantId: stateObject.currentVariantId,
        attemptId: stateObject.attemptNumber || stateObject.attemptType,
        dinerId: result.person.id,
        phase: stateObject.finalRevealPhase
      });
      if (currentKey !== key || stateObject.finalRevealPhase !== "diner") return false;
      if (stateObject.finalRevealShowAll || voice.settings?.enabled === false) return false;
      if (stateObject.finalRevealNaturalNarratedKeys?.includes?.(key)) return false;
      voice.cancel?.();
      stateObject.finalRevealNaturalNarratedKeys = [...(stateObject.finalRevealNaturalNarratedKeys || []), key];
      return Boolean(voice.speak(line));
    };

    if (typeof root.requestAnimationFrame === "function") root.requestAnimationFrame(speak);
    else root.setTimeout?.(speak, 0) || speak();
    return true;
  }

  function createLegacyNarrationProxy(voice) {
    if (!voice) return null;
    return {
      get settings() { return voice.settings; },
      get voices() { return voice.voices; },
      speak(text) {
        const line = String(text || "");
        if (/^Let['’]s see how well you read .+\. \d+ of \d+ points\.$/i.test(line)) return false;
        return voice.speak?.(text);
      },
      cancel() { return voice.cancel?.(); },
      preview() { return voice.preview?.(); },
      set(next) { return voice.set?.(next); },
      reset() { return voice.reset?.(); }
    };
  }

  function installRevealNavigationPolish() {
    if (typeof root.results === "function" && !root.results.sprint446Wrapped) {
      const baseResults446 = root.results;
      const wrappedResults = function () {
        const voice = root.PupVoice;
        const suppressLegacy = root.state?.finalRevealPhase === "diner" && voice;
        if (suppressLegacy) root.PupVoice = createLegacyNarrationProxy(voice);
        try {
          baseResults446();
        } finally {
          if (suppressLegacy) root.PupVoice = voice;
        }

        focusNewRevealStage();
        if (root.state?.finalRevealPhase === "diner" && !root.state?.finalRevealShowAll) {
          const report = root.buildMissionReportData?.();
          const index = clamp(root.state.finalRevealPersonIndex, 0, Math.max(0, (report?.personResults?.length || 1) - 1));
          speakDinerResult({ result: report?.personResults?.[index] });
        }
        release?.apply?.();
      };
      wrappedResults.sprint446Wrapped = true;
      root.results = wrappedResults;
    }

    if (typeof root.renderMissionReport === "function" && !root.renderMissionReport.sprint446Wrapped) {
      const baseRenderMissionReport446 = root.renderMissionReport;
      const wrappedMissionReport = function () {
        baseRenderMissionReport446();
        focusNewRevealStage({
          stageKey: currentStageKey(),
          headingSelector: "#missionPayoffTitle",
          rootSelector: ".mission-payoff-report"
        });
      };
      wrappedMissionReport.sprint446Wrapped = true;
      root.renderMissionReport = wrappedMissionReport;
    }
    return true;
  }

  root.BiteBuddySprint446 = Object.freeze({
    version: release?.version || "v0.4.4.6",
    prefersReducedMotion,
    dinerResultNarration,
    dinerNarrationKey,
    isRevealStageChange,
    currentStageKey,
    focusNewRevealStage,
    speakDinerResult,
    installRevealNavigationPolish
  });

  if (typeof root.initialState === "function") {
    const baseInitialState446 = root.initialState;
    root.initialState = function () {
      return {
        ...baseInitialState446(),
        sprint446FocusedStageKey: "",
        finalRevealNaturalNarratedKeys: []
      };
    };
  }

  if (root.state) {
    root.state = {
      ...root.state,
      sprint446FocusedStageKey: root.state.sprint446FocusedStageKey || "",
      finalRevealNaturalNarratedKeys: Array.isArray(root.state.finalRevealNaturalNarratedKeys)
        ? root.state.finalRevealNaturalNarratedKeys
        : []
    };
  }

  installRevealNavigationPolish();
  release?.apply?.();
  if (typeof root.render === "function") root.render();
})(window);
