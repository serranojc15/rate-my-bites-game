// Sprint v0.4.3.2 — Release Consistency & Variant Polish
(function () {
  "use strict";

  const release = window.BiteBuddyRelease;
  const HISTORY_KEY = "bite-buddy-case-history-v1";
  const validAttemptTypes = new Set(["first-attempt", "same-variant-replay", "fresh-variant"]);

  function applyIdentity() {
    return release?.apply?.() || false;
  }

  function normalizeHistoryValue(value) {
    const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    const attempts = Array.isArray(source.attempts) ? source.attempts : [];
    const normalizedAttempts = attempts.flatMap(entry => {
      if (!entry || typeof entry !== "object") return [];
      const score = Number(entry.score);
      if (!Number.isFinite(score)) return [];
      const attemptType = validAttemptTypes.has(entry.attemptType) ? entry.attemptType : "first-attempt";
      const timestamp = Number.isNaN(Date.parse(entry.timestamp || "")) ? null : entry.timestamp;
      return [{
        ...entry,
        variantId: typeof entry.variantId === "string" && entry.variantId ? entry.variantId : "A",
        attemptType,
        score: Math.max(0, Math.min(300, score)),
        verdict: typeof entry.verdict === "string" && entry.verdict ? entry.verdict : "Completed",
        timestamp
      }];
    });
    return { ...source, attempts: normalizedAttempts };
  }

  function normalizeHistoryStorage() {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      const parsed = raw ? JSON.parse(raw) : { attempts: [] };
      const normalized = normalizeHistoryValue(parsed);
      if (JSON.stringify(parsed) !== JSON.stringify(normalized)) {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(normalized));
      }
      return normalized;
    } catch {
      const fallback = { attempts: [] };
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(fallback)); } catch {}
      return fallback;
    }
  }

  function masteryMessage(firstScore, freshScore) {
    if (freshScore === null || freshScore === undefined || firstScore === null || firstScore === undefined) {
      return "A fresh variant is the best test of whether the reasoning transfers beyond familiar names and answers.";
    }
    if (freshScore > firstScore) {
      return "You improved after the people and restaurants changed. That suggests the reasoning transferred beyond the original answers.";
    }
    if (freshScore === firstScore) {
      return "You held your score after the surface details changed. Your read remained consistent.";
    }
    return "The new names and context changed the challenge. Review which clues carried the most weight.";
  }

  function polishMastery() {
    const message = document.querySelector(".mastery-message");
    if (!message) return;
    const attempts = normalizeHistoryStorage().attempts;
    const firstEntry = attempts.find(item => item.attemptType === "first-attempt") || attempts[0] || null;
    const freshScores = attempts.filter(item => item.attemptType === "fresh-variant").map(item => item.score);
    const bestFresh = freshScores.length ? Math.max(...freshScores) : null;
    message.innerHTML = `<strong>Pup:</strong> ${escapeHtml(masteryMessage(firstEntry?.score ?? null, bestFresh))}`;

    const metrics = document.querySelectorAll(".mastery-grid > div strong");
    if (metrics[2]) metrics[2].textContent = `${firstEntry?.score ?? "—"} / 300`;
    if (metrics[3]) metrics[3].textContent = `${bestFresh ?? "—"} / 300`;
    if (metrics[4]) metrics[4].textContent = String(attempts.length);
  }

  // The Final Reveal's historical helper named Casa Luna directly. Keep its
  // scoring authority but make the displayed deduction use the active variant.
  if (typeof bestDeduction === "function") {
    const baseBestDeduction = bestDeduction;
    bestDeduction = function (data) {
      const result = baseBestDeduction(data);
      if (data?.restaurantCorrect && result?.label === "Shared restaurant") {
        return { ...result, detail: `${actualRestaurant().name} · +${points.restaurant}` };
      }
      return result;
    };
  }

  // Replace active release writers while preserving each module's historical
  // metadata constants for diagnostics and historical tests.
  if (typeof missionReportInstallVersion === "function") missionReportInstallVersion = applyIdentity;
  if (typeof installFinalRevealVersion === "function") installFinalRevealVersion = applyIdentity;

  if (typeof finalRevealVersionMarkup === "function") {
    finalRevealVersionMarkup = function () {
      return `<div class="final-reveal-version" aria-label="Bite Buddy League ${release.version}, The Final Reveal"><strong>${release.version}</strong><span>The Final Reveal</span></div>`;
    };
  }

  if (typeof directorCutVersionMarkup === "function") {
    directorCutVersionMarkup = function (compact = false) {
      return `<div class="director-version ${compact ? "compact" : ""}" aria-label="Bite Buddy League ${release.version}, Director's Cut"><strong>${release.version}</strong><span>Director's Cut</span></div>`;
    };
  }

  // Voice settings belong to the player, not to a single game-state object.
  // Every future reset receives the persisted setting from Pup Voice Studio.
  if (typeof initialState === "function" && window.PupVoice) {
    const baseInitialState432 = initialState;
    initialState = function () {
      return { ...baseInitialState432(), voiceEnabled: window.PupVoice.settings.enabled };
    };
  }

  let lastSpeechText = "";
  let lastSpeechAt = 0;
  function speakOnce(text) {
    const value = String(text || "");
    const now = Date.now();
    if (value === lastSpeechText && now - lastSpeechAt < 900) return false;
    lastSpeechText = value;
    lastSpeechAt = now;
    return window.PupVoice?.speak?.(value) || false;
  }

  if (window.PupVoice) {
    speakBriefing = speakOnce;
    speakConversation = speakOnce;
  }

  function setNarration(enabled) {
    window.PupVoice?.set?.({ enabled });
    state.voiceEnabled = enabled;
    if (!enabled) window.PupVoice?.cancel?.();
    render();
  }

  function syncVoiceControls() {
    if (!window.PupVoice) return;
    const enabled = window.PupVoice.settings.enabled;
    state.voiceEnabled = enabled;
    [document.querySelector("#voiceToggle"), document.querySelector("#livingVoice")].filter(Boolean).forEach(button => {
      button.textContent = enabled ? "🔊" : "🔇";
      button.setAttribute("aria-label", enabled ? "Mute narration" : "Turn on narration");
      button.onclick = event => {
        event.stopPropagation();
        setNarration(!window.PupVoice.settings.enabled);
      };
    });
  }

  function activeVoiceName() {
    const settings = window.PupVoice?.settings;
    if (!settings?.voiceURI) return "Automatic English voice";
    return window.PupVoice.voices.find(voice => voice.voiceURI === settings.voiceURI)?.name || "Automatic English voice";
  }

  function polishVoiceStudio() {
    const card = document.querySelector(".pup-voice-card");
    if (!card || !window.PupVoice) return;
    let summary = card.querySelector(".voice-current-summary");
    if (!summary) {
      summary = document.createElement("div");
      summary.className = "voice-current-summary";
      summary.setAttribute("aria-live", "polite");
      card.querySelector("h2")?.insertAdjacentElement("afterend", summary);
    }

    const update = () => {
      const settings = window.PupVoice.settings;
      const preset = window.PupVoice.presets[settings.preset];
      summary.innerHTML = `<span>Narration: <strong>${settings.enabled ? "On" : "Off"}</strong></span><span>Style: <strong>${escapeHtml(preset?.label || "System Default")}</strong></span><span>Voice: <strong>${escapeHtml(activeVoiceName())}</strong></span>`;
    };

    [["#voiceRate", "#voiceRateOut"], ["#voicePitch", "#voicePitchOut"], ["#voiceVolume", "#voiceVolumeOut"]].forEach(([controlSelector, outputSelector]) => {
      const control = card.querySelector(controlSelector);
      const output = card.querySelector(outputSelector);
      if (control && output) {
        if (!output.id) output.id = outputSelector.slice(1);
        control.setAttribute("aria-describedby", output.id);
      }
    });

    card.addEventListener("input", update);
    card.addEventListener("change", update);
    card.addEventListener("click", () => setTimeout(update, 0));
    update();
  }

  document.addEventListener("click", event => {
    if (event.target.closest?.("#pupVoiceStudioButton")) setTimeout(polishVoiceStudio, 0);
  });

  if (typeof renderMissionReport === "function") {
    const baseRenderMissionReport432 = renderMissionReport;
    renderMissionReport = function () {
      normalizeHistoryStorage();
      baseRenderMissionReport432();
      polishMastery();
      applyIdentity();
      syncVoiceControls();
    };
  }

  if (typeof render === "function") {
    const baseRender432 = render;
    render = function () {
      normalizeHistoryStorage();
      baseRender432();
      applyIdentity();
      polishMastery();
      syncVoiceControls();
    };
  }

  window.BiteBuddyPolish432 = Object.freeze({
    version: release.version,
    normalizeHistoryValue,
    masteryMessage,
    applyIdentity
  });

  normalizeHistoryStorage();
  state.voiceEnabled = window.PupVoice?.settings.enabled ?? state.voiceEnabled;
  applyIdentity();
  render();
})();
