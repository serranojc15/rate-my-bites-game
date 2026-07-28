// Multi-Episode Foundation — small, versioned, local-only progress storage.
(function (root) {
  "use strict";

  const STORAGE_KEY = "rate-my-bites-episode-progress-v1";
  const STORAGE_VERSION = 1;
  const MAX_SCORE = 300;

  function emptyProgress() {
    return {
      version: STORAGE_VERSION,
      hasVisited: false,
      completedEpisodeIds: [],
      bestScores: {},
      lastPlayedEpisodeId: null
    };
  }

  function playableIds() {
    try {
      return new Set(
        root.RateMyBitesEpisodes
          .getCatalog()
          .filter(entry => entry.status === "playable")
          .map(entry => entry.id)
      );
    } catch {
      return new Set();
    }
  }

  function normalize(value) {
    const safe = emptyProgress();
    const knownIds = playableIds();
    if (!value || typeof value !== "object" || Array.isArray(value)) return safe;
    if (value.version !== STORAGE_VERSION) return safe;

    safe.hasVisited = value.hasVisited === true;
    if (Array.isArray(value.completedEpisodeIds)) {
      safe.completedEpisodeIds = [...new Set(
        value.completedEpisodeIds.filter(id => typeof id === "string" && knownIds.has(id))
      )];
    }
    if (value.bestScores && typeof value.bestScores === "object" && !Array.isArray(value.bestScores)) {
      for (const [id, score] of Object.entries(value.bestScores)) {
        const numeric = Number(score);
        if (knownIds.has(id) && Number.isFinite(numeric) && numeric >= 0) {
          safe.bestScores[id] = Math.min(numeric, MAX_SCORE);
        }
      }
    }
    if (typeof value.lastPlayedEpisodeId === "string" && knownIds.has(value.lastPlayedEpisodeId)) {
      safe.lastPlayedEpisodeId = value.lastPlayedEpisodeId;
    }
    return safe;
  }

  function load(storage = root.localStorage) {
    try {
      const raw = storage?.getItem?.(STORAGE_KEY);
      if (!raw) return emptyProgress();
      return normalize(JSON.parse(raw));
    } catch {
      return emptyProgress();
    }
  }

  function save(progress, storage = root.localStorage) {
    const normalized = normalize(progress);
    try {
      storage?.setItem?.(STORAGE_KEY, JSON.stringify(normalized));
    } catch {}
    return normalized;
  }

  function markStarted(episodeId, storage = root.localStorage) {
    const progress = load(storage);
    if (!playableIds().has(episodeId)) return progress;
    progress.hasVisited = true;
    progress.lastPlayedEpisodeId = episodeId;
    return save(progress, storage);
  }

  function recordCompletion(episodeId, score, storage = root.localStorage) {
    const progress = load(storage);
    const numericScore = Number(score);
    if (!playableIds().has(episodeId) || !Number.isFinite(numericScore) || numericScore < 0) return progress;
    if (!progress.completedEpisodeIds.includes(episodeId)) progress.completedEpisodeIds.push(episodeId);
    const boundedScore = Math.min(numericScore, MAX_SCORE);
    progress.bestScores[episodeId] = Math.max(Number(progress.bestScores[episodeId]) || 0, boundedScore);
    progress.hasVisited = true;
    progress.lastPlayedEpisodeId = episodeId;
    return save(progress, storage);
  }

  function acknowledgment(progress = load()) {
    if (!progress.hasVisited) return "Welcome, Detective! Choose tonight’s mystery.";
    if (progress.completedEpisodeIds.length) return "Welcome back! Ready to solve another mystery?";
    return "Welcome back, Detective! Ready for another mystery?";
  }

  root.RateMyBitesEpisodeProgress = Object.freeze({
    storageKey: STORAGE_KEY,
    storageVersion: STORAGE_VERSION,
    emptyProgress,
    normalize,
    load,
    save,
    markStarted,
    recordCompletion,
    acknowledgment
  });
})(window);
