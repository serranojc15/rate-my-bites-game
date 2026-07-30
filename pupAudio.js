// Sprint 4 — packaged Pup recordings with caption-first, failure-safe playback.
(function (root) {
  "use strict";

  const STORAGE_KEY = "rate-my-bites-pup-audio-v1";
  const EPISODE_ID = "episode-003";
  let activeAudio = null;
  let currentClipId = null;
  let lastClipId = null;
  let lastError = null;

  function media() {
    return root.RateMyBitesEpisodes?.getEpisode?.(EPISODE_ID)?.production?.media || {
      audioClips: {},
      captions: {}
    };
  }

  function loadPreference(storage = root.localStorage) {
    try {
      const value = JSON.parse(storage?.getItem?.(STORAGE_KEY) || "null");
      return { muted: value?.muted === true };
    } catch {
      return { muted: false };
    }
  }

  let preference = loadPreference();

  function savePreference(storage = root.localStorage) {
    try { storage?.setItem?.(STORAGE_KEY, JSON.stringify({ muted: preference.muted })); } catch {}
    return { ...preference };
  }

  function emit(status, clipId, error = null) {
    try {
      root.dispatchEvent?.(new CustomEvent("pup-audio-status", {
        detail: { status, clipId, caption: caption(clipId), error: error ? String(error.message || error) : null }
      }));
    } catch {}
  }

  function stop() {
    if (activeAudio) {
      try {
        activeAudio.pause();
        activeAudio.currentTime = 0;
      } catch {}
    }
    activeAudio = null;
    currentClipId = null;
    emit("stopped", lastClipId);
    return true;
  }

  function caption(clipId) {
    return media().captions?.[clipId] || "";
  }

  function source(clipId) {
    return media().audioClips?.[clipId] || "";
  }

  async function play(clipId) {
    stop();
    lastClipId = clipId;
    lastError = null;
    if (preference.muted) {
      emit("muted", clipId);
      return false;
    }
    const src = source(clipId);
    if (!src || typeof root.Audio !== "function") {
      lastError = new Error(src ? "Audio playback is unavailable" : `Unknown Pup clip: ${clipId}`);
      emit("unavailable", clipId, lastError);
      return false;
    }
    const audio = new root.Audio(src);
    audio.preload = "auto";
    audio.volume = 0.82;
    activeAudio = audio;
    currentClipId = clipId;
    audio.addEventListener?.("ended", () => {
      if (activeAudio !== audio) return;
      activeAudio = null;
      currentClipId = null;
      emit("ended", clipId);
    }, { once: true });
    audio.addEventListener?.("error", () => {
      if (activeAudio !== audio) return;
      lastError = new Error(`Pup audio could not load: ${src}`);
      activeAudio = null;
      currentClipId = null;
      emit("error", clipId, lastError);
    }, { once: true });
    try {
      await audio.play();
      if (activeAudio === audio) emit("playing", clipId);
      return true;
    } catch (error) {
      if (activeAudio === audio) {
        activeAudio = null;
        currentClipId = null;
      }
      lastError = error;
      emit("blocked", clipId, error);
      return false;
    }
  }

  function replay() {
    return lastClipId ? play(lastClipId) : Promise.resolve(false);
  }

  function setMuted(muted, storage = root.localStorage) {
    preference = { muted: Boolean(muted) };
    savePreference(storage);
    if (preference.muted) stop();
    emit(preference.muted ? "muted" : "ready", lastClipId);
    return { ...preference };
  }

  root.RateMyBitesPupAudio = Object.freeze({
    schemaVersion: 1,
    storageKey: STORAGE_KEY,
    get muted() { return preference.muted; },
    get currentClipId() { return currentClipId; },
    get lastClipId() { return lastClipId; },
    get lastError() { return lastError; },
    get clips() { return { ...media().audioClips }; },
    get captions() { return { ...media().captions }; },
    loadPreference,
    savePreference,
    caption,
    source,
    play,
    replay,
    stop,
    setMuted
  });
})(window);
