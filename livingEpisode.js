// Sprint 4 — deterministic, authored Living Episode selection.
(function (root) {
  "use strict";

  const clone = value => JSON.parse(JSON.stringify(value));

  function numericSeed(value) {
    const number = Number(value);
    if (Number.isFinite(number)) return (Math.abs(Math.floor(number)) || 1) >>> 0;
    let hash = 2166136261;
    for (const character of String(value || "rate-my-bites")) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0) || 1;
  }

  function generator(seed) {
    let value = numericSeed(seed);
    // Warm the generator once so nearby integer replay seeds do not cluster on
    // the same first authored option. The sequence remains fully deterministic.
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    return () => {
      value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
      return value / 4294967296;
    };
  }

  function pick(items, random) {
    if (!Array.isArray(items) || !items.length) return null;
    return items[Math.floor(random() * items.length) % items.length];
  }

  function signature(set) {
    return [
      set.greetingId,
      set.banterId,
      set.specialId,
      set.environmentId,
      set.observationId,
      set.clueOrderId
    ].join("|");
  }

  function select(episode, seed, recentSignatures = []) {
    const living = episode?.production?.living;
    if (!living) throw new Error("Living Episode selection requires episode.production.living");
    const recent = new Set(Array.isArray(recentSignatures) ? recentSignatures : []);
    let candidateSeed = numericSeed(seed);
    let chosen = null;
    for (let attempt = 0; attempt < 64; attempt += 1) {
      const random = generator(candidateSeed);
      chosen = {
        seed: candidateSeed,
        greetingId: pick(living.greetings, random)?.id,
        banterId: pick(living.banter, random)?.id,
        specialId: pick(living.restaurantSpecials, random)?.id,
        environmentId: pick(living.environments, random)?.id,
        observationId: pick(living.optionalObservations, random)?.id,
        clueOrderId: pick(living.clueOrders, random)?.id
      };
      chosen.signature = signature(chosen);
      if (!recent.has(chosen.signature)) return chosen;
      candidateSeed = (candidateSeed + 1) >>> 0 || 1;
    }
    return chosen;
  }

  function byId(items, id, label) {
    const item = items?.find(entry => entry.id === id);
    if (!item) throw new Error(`Unknown ${label} variation: ${id}`);
    return clone(item);
  }

  function materialize(episode, set) {
    const output = clone(episode);
    const living = output.production.living;
    const greeting = byId(living.greetings, set.greetingId, "greeting");
    const banter = byId(living.banter, set.banterId, "banter");
    const special = byId(living.restaurantSpecials, set.specialId, "restaurant special");
    const environment = byId(living.environments, set.environmentId, "environment");
    const observation = byId(living.optionalObservations, set.observationId, "optional observation");
    const clueOrder = byId(living.clueOrders, set.clueOrderId, "clue order");
    const canonicalScenes = new Map(output.story.scenes.map(scene => [scene.id, scene]));
    const openingId = output.production.canonical.openingSceneId;
    const closingId = output.production.canonical.closingSceneId;
    const orderedClues = clueOrder.sceneIds.map(id => {
      const scene = canonicalScenes.get(id);
      if (!scene) throw new Error(`Clue order references unknown canonical scene ${id}`);
      return scene;
    });
    output.story.scenes = [
      canonicalScenes.get(openingId),
      greeting.scene,
      ...orderedClues.slice(0, 2),
      banter.scene,
      ...orderedClues.slice(2),
      observation.scene,
      canonicalScenes.get(closingId)
    ].filter(Boolean);
    output.story.livingState = {
      variationSet: clone(set),
      greeting,
      banter,
      restaurantSpecial: special,
      environment,
      optionalObservation: observation,
      clueOrder
    };
    output.metadata.future.selectedVariationSignature = set.signature;
    return output;
  }

  function validateEpisode(episode) {
    const errors = [];
    const production = episode?.production;
    if (!production?.canonical) errors.push("production.canonical is required");
    if (!production?.living) errors.push("production.living is required");
    if (!production?.media) errors.push("production.media is required");
    const canonical = production?.canonical || {};
    for (const field of [
      "episodeTitle", "restaurantId", "partyIds", "centralMystery", "requiredClueSceneIds",
      "solution", "ending", "continuityChanges", "openingSceneId", "closingSceneId"
    ]) {
      if (canonical[field] === undefined || canonical[field] === null) errors.push(`production.canonical.${field} is required`);
    }
    const living = production?.living || {};
    for (const [field, minimum] of [
      ["greetings", 3],
      ["banter", 3],
      ["restaurantSpecials", 2],
      ["environments", 2],
      ["optionalObservations", 2],
      ["clueOrders", 2]
    ]) {
      if (!Array.isArray(living[field]) || living[field].length < minimum) {
        errors.push(`production.living.${field} requires at least ${minimum} authored options`);
      }
      const ids = (living[field] || []).map(item => item?.id);
      if (new Set(ids).size !== ids.length) errors.push(`production.living.${field} ids must be unique`);
    }
    const required = new Set(canonical.requiredClueSceneIds || []);
    for (const order of living.clueOrders || []) {
      if (order.sceneIds?.length !== required.size || order.sceneIds?.some(id => !required.has(id))) {
        errors.push(`${order.id || "clue order"} must contain every required clue exactly once`);
      }
    }
    const media = production?.media || {};
    for (const field of ["characterPortraitIds", "restaurantImageIds", "foodImageIds", "audioClips", "captions", "fallbackText"]) {
      if (media[field] === undefined || media[field] === null) errors.push(`production.media.${field} is required`);
    }
    return { valid: errors.length === 0, errors };
  }

  root.RateMyBitesLivingEpisode = Object.freeze({
    schemaVersion: 1,
    numericSeed,
    signature,
    select,
    materialize,
    validateEpisode
  });
})(window);
