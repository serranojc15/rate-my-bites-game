// Sprint 4 — safe, local-only character continuity and gentle player memory.
(function (root) {
  "use strict";

  const PLAYER_KEY = "rate-my-bites-player-memory-v1";
  const SESSION_KEY = "rate-my-bites-episode-session-v1";
  const VERSION = 1;
  const clone = value => JSON.parse(JSON.stringify(value));

  const canonicalCharacterFacts = Object.freeze({
    pup: ["Pup loves helping everyone find the right table.", "Pup is the Host, not the detective or narrator."],
    emma: ["Emma is trying to eat healthier.", "Emma likes seafood but does not want the same cuisine every day."],
    ellis: ["Ellis loves dessert.", "Ellis calls dinner rolls the warm-up course."],
    grace: ["Grace enjoys trying new foods when the choice remains hers.", "Grace dislikes mushrooms ordered on her behalf."]
  });

  function emptyPlayerMemory() {
    return {
      version: VERSION,
      dessertSelections: 0,
      seafoodSelections: 0,
      healthierSelections: 0,
      adventurousSelections: 0,
      previousEpisodesCompleted: [],
      episodePlayCounts: {},
      recentVariationSignatures: {}
    };
  }

  function nonNegativeInteger(value) {
    const number = Number(value);
    return Number.isInteger(number) && number >= 0 ? number : 0;
  }

  function normalizePlayer(value) {
    const safe = emptyPlayerMemory();
    if (!value || typeof value !== "object" || Array.isArray(value) || value.version !== VERSION) return safe;
    for (const field of ["dessertSelections", "seafoodSelections", "healthierSelections", "adventurousSelections"]) {
      safe[field] = nonNegativeInteger(value[field]);
    }
    if (Array.isArray(value.previousEpisodesCompleted)) {
      safe.previousEpisodesCompleted = [...new Set(value.previousEpisodesCompleted.filter(id => /^episode-\d{3}$/.test(id)))];
    }
    if (value.episodePlayCounts && typeof value.episodePlayCounts === "object" && !Array.isArray(value.episodePlayCounts)) {
      for (const [id, count] of Object.entries(value.episodePlayCounts)) {
        if (/^episode-\d{3}$/.test(id)) safe.episodePlayCounts[id] = nonNegativeInteger(count);
      }
    }
    if (value.recentVariationSignatures && typeof value.recentVariationSignatures === "object" && !Array.isArray(value.recentVariationSignatures)) {
      for (const [id, signatures] of Object.entries(value.recentVariationSignatures)) {
        if (/^episode-\d{3}$/.test(id) && Array.isArray(signatures)) {
          safe.recentVariationSignatures[id] = signatures.filter(item => typeof item === "string" && item.length <= 160).slice(-5);
        }
      }
    }
    return safe;
  }

  function loadPlayer(storage = root.localStorage) {
    try {
      return normalizePlayer(JSON.parse(storage?.getItem?.(PLAYER_KEY) || "null"));
    } catch {
      return emptyPlayerMemory();
    }
  }

  function savePlayer(value, storage = root.localStorage) {
    const safe = normalizePlayer(value);
    try { storage?.setItem?.(PLAYER_KEY, JSON.stringify(safe)); } catch {}
    return safe;
  }

  function recordEpisodeStart(episodeId, signature, storage = root.localStorage) {
    const memory = loadPlayer(storage);
    memory.episodePlayCounts[episodeId] = nonNegativeInteger(memory.episodePlayCounts[episodeId]) + 1;
    if (signature) {
      const recent = memory.recentVariationSignatures[episodeId] || [];
      memory.recentVariationSignatures[episodeId] = [...recent.filter(item => item !== signature), signature].slice(-5);
    }
    return savePlayer(memory, storage);
  }

  function recordCompletion(episodeId, choices = {}, storage = root.localStorage) {
    const memory = loadPlayer(storage);
    if (!memory.previousEpisodesCompleted.includes(episodeId)) memory.previousEpisodesCompleted.push(episodeId);
    const selected = Object.values(choices || {}).flatMap(value => (
      value && typeof value === "object" ? Object.values(value) : [value]
    )).filter(value => typeof value === "string");
    memory.dessertSelections += selected.filter(value => /tart|torte|pie|cake|churro|cobbler|dessert/i.test(value) && !/no dessert/i.test(value)).length;
    memory.seafoodSelections += selected.filter(value => /fish|salmon|shrimp|seafood|mahi/i.test(value)).length;
    memory.healthierSelections += selected.filter(value => /salad|sparkling water|vegetable risotto|no dessert/i.test(value)).length;
    memory.adventurousSelections += selected.filter(value => /risotto|tart|fizz|special/i.test(value)).length;
    return savePlayer(memory, storage);
  }

  function emptySession() {
    return { version: VERSION, episodeId: null, variationSet: null, state: null, updatedAt: null };
  }

  function normalizeSession(value) {
    if (!value || typeof value !== "object" || Array.isArray(value) || value.version !== VERSION) return emptySession();
    if (!/^episode-\d{3}$/.test(value.episodeId || "")) return emptySession();
    if (!value.variationSet || typeof value.variationSet !== "object" || !value.state || typeof value.state !== "object") return emptySession();
    return {
      version: VERSION,
      episodeId: value.episodeId,
      variationSet: clone(value.variationSet),
      state: clone(value.state),
      updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : null
    };
  }

  function loadSession(storage = root.localStorage) {
    try {
      return normalizeSession(JSON.parse(storage?.getItem?.(SESSION_KEY) || "null"));
    } catch {
      return emptySession();
    }
  }

  function saveSession(episodeId, variationSet, stateSnapshot, storage = root.localStorage) {
    const safe = normalizeSession({
      version: VERSION,
      episodeId,
      variationSet,
      state: stateSnapshot,
      updatedAt: new Date().toISOString()
    });
    try { storage?.setItem?.(SESSION_KEY, JSON.stringify(safe)); } catch {}
    return safe;
  }

  function clearSession(storage = root.localStorage) {
    try { storage?.removeItem?.(SESSION_KEY); } catch {}
    return emptySession();
  }

  function callbackFor(memory = loadPlayer()) {
    if (memory.dessertSelections >= 2) return "Dessert again? I’m starting to notice a pattern.";
    if (memory.adventurousSelections >= 2) return "You keep making room for something new. I like that.";
    if (memory.healthierSelections >= 2) return "You’ve been noticing the lighter choices without judging the table.";
    return "";
  }

  root.RateMyBitesStoryMemory = Object.freeze({
    schemaVersion: VERSION,
    playerStorageKey: PLAYER_KEY,
    sessionStorageKey: SESSION_KEY,
    canonicalCharacterFacts,
    emptyPlayerMemory,
    normalizePlayer,
    loadPlayer,
    savePlayer,
    recordEpisodeStart,
    recordCompletion,
    emptySession,
    normalizeSession,
    loadSession,
    saveSession,
    clearSession,
    callbackFor
  });
})(window);
