// Sprint 3 — Multi-Episode Foundation runtime and Episode Library.
(function (root) {
  "use strict";

  const episodes = root.RateMyBitesEpisodes;
  const progressStore = root.RateMyBitesEpisodeProgress;
  if (!episodes || !progressStore) throw new Error("Episode catalog and progress storage must load before the multi-episode runtime.");

  const clone = value => JSON.parse(JSON.stringify(value));

  function replaceArray(target, values) {
    target.splice(0, target.length, ...clone(values));
  }

  function replaceObject(target, values) {
    Object.keys(target).forEach(key => delete target[key]);
    Object.assign(target, clone(values));
  }

  function activeEpisodeId(stateObject) {
    const id = stateObject?.selectedEpisodeId;
    return episodes.isPlayable(id) ? id : episodes.defaultEpisodeId;
  }

  function episodePayload(id) {
    const episode = episodes.getEpisode(id);
    if (!episode) return null;
    return {
      id: episode.metadata.id,
      title: episode.metadata.title,
      dinerIds: episode.gameplay.diners.map(person => person.id),
      restaurantIds: episode.gameplay.restaurants.map(restaurant => restaurant.id),
      actualRestaurantId: episode.gameplay.actualRestaurantId,
      answers: Object.fromEntries(episode.gameplay.diners.map(person => [person.id, clone(person.actual)])),
      sceneIds: episode.story.scenes.map(scene => scene.id),
      revealOrder: clone(episode.reveal.order)
    };
  }

  function applyEpisode(id) {
    const completedEpisodeIds = progressStore.load().completedEpisodeIds;
    const episode = episodes.resolveContinuity(id, completedEpisodeIds);
    if (!episode) return false;
    episodes.assertValidEpisode(episode);

    replaceObject(host, episode.story.host);
    replaceObject(images, episode.gameplay.images);
    replaceArray(restaurants, episode.gameplay.restaurants);
    actualRestaurantId = episode.gameplay.actualRestaurantId;
    replaceArray(diners, episode.gameplay.diners);
    replaceArray(dinerStages, episode.gameplay.stages);
    replaceObject(points, episode.gameplay.points);
    replaceObject(labels, episode.gameplay.labels);
    replaceObject(sprint4Episode, episode.story.briefing);

    livingDinnerStory.title = episode.metadata.title;
    replaceArray(livingDinnerStory.events, episode.story.scenes);
    livingDinnerStory.missionText = episode.story.missionText;
    livingDinnerStory.finaleClues = clone(episode.story.finaleClues);
    livingDinnerStory.ending = episode.story.ending;
    delete livingDinnerStory.cinematicMissionPrepared;
    return true;
  }

  function libraryViewModel(progress = progressStore.load()) {
    return episodes.getCatalog().map(entry => ({
      id: entry.id,
      title: entry.title,
      subtitle: entry.subtitle,
      destination: entry.destination,
      artwork: entry.artwork,
      artworkAlt: root.RateMyBitesWorld?.getAsset?.(entry.artworkId)?.alt || `${entry.title} artwork`,
      status: entry.status,
      completed: progress.completedEpisodeIds.includes(entry.id),
      bestScore: Number.isFinite(progress.bestScores[entry.id]) ? progress.bestScores[entry.id] : null,
      lastPlayed: progress.lastPlayedEpisodeId === entry.id,
      action: entry.status === "playable"
        ? (progress.completedEpisodeIds.includes(entry.id) ? "Replay" : "Play")
        : "Coming Soon"
    }));
  }

  function canLaunch(id) {
    return episodes.isPlayable(id);
  }

  function freshEpisodeState(episodeId) {
    const next = initialState();
    next.selectedEpisodeId = episodeId;
    next.currentCaseId = episodeId;
    next.currentVariantId = episodeId === "episode-001" ? "A" : "catalog";
    next.previousVariantId = null;
    next.attemptType = progressStore.load().completedEpisodeIds.includes(episodeId) ? "episode-replay" : "first-attempt";
    next.screen = "welcome";
    next.introIndex = 0;
    next.briefingIndex = 0;
    next.conversationIndex = 0;
    next.stageIndex = 0;
    next.dinerIndex = 0;
    next.groupRestaurant = null;
    next.picks = {};
    next.confidence = {};
    next.score = 0;
    next.storyMemory = [];
    next.appliedInfluence = [];
    next.livingConfidence = { "group-restaurant": 3 };
    const episode = episodes.getEpisode(episodeId);
    episode.gameplay.diners.forEach(person => {
      episode.gameplay.stages.forEach(stage => {
        next.livingConfidence[`${person.id}-${stage}`] = 3;
      });
    });
    return next;
  }

  function startEpisode(id) {
    if (!canLaunch(id) || !applyEpisode(id)) return false;
    progressStore.markStarted(id);
    stopTimer?.();
    root.PupVoice?.cancel?.();
    state = freshEpisodeState(id);
    render();
    return true;
  }

  function returnToLibrary() {
    stopTimer?.();
    root.PupVoice?.cancel?.();
    document.querySelector(".person-modal")?.remove();
    document.body.classList.remove("modal-open");
    const selectedEpisodeId = activeEpisodeId(state);
    state = initialState();
    state.selectedEpisodeId = selectedEpisodeId;
    state.screen = "episodeLibrary";
    render();
    return true;
  }

  function cardMarkup(item) {
    const unavailable = item.status !== "playable";
    return `<article class="episode-library-card ${unavailable ? "episode-unavailable" : ""}" data-episode-card="${item.id}">
      <div class="episode-library-art">
        <img src="${item.artwork}" alt="${item.artworkAlt}" loading="lazy">
        <span>${unavailable ? "Coming Soon" : item.completed ? "Completed" : `Episode ${Number(item.id.split("-").at(-1))}`}</span>
      </div>
      <div class="episode-library-copy">
        <p>${item.destination}</p>
        <h2>${item.title}</h2>
        <span>${item.subtitle}</span>
        <div class="episode-library-status">
          ${item.completed ? "<strong>✓ Mystery solved</strong>" : unavailable ? "<strong>In production</strong>" : "<strong>New mystery</strong>"}
          ${item.bestScore !== null ? `<small>Personal best: ${item.bestScore} / 300</small>` : ""}
        </div>
        <button class="${unavailable ? "ghost-button" : "primary-button"}" type="button" data-play-episode="${item.id}" ${unavailable ? "disabled aria-disabled=\"true\"" : ""}>${item.action}</button>
      </div>
    </article>`;
  }

  function renderEpisodeLibrary() {
    const progress = progressStore.load();
    const items = libraryViewModel(progress);
    const lastPlayed = items.find(item => item.lastPlayed && item.status === "playable");
    app.innerHTML = `<section class="episode-library" data-screen="episode-library">
      <header class="episode-library-header">
        <p class="eyebrow">Bite Buddy League · Episode Library</p>
        <h1>Every table<br>has a story.</h1>
        <p class="episode-welcome">${progressStore.acknowledgment(progress)}</p>
        ${lastPlayed ? `<p class="episode-last-played">Last played: <strong>${lastPlayed.title}</strong></p>` : ""}
      </header>
      <div class="episode-library-grid">${items.map(cardMarkup).join("")}</div>
      <p class="episode-library-note">Progress and personal bests are saved only on this device.</p>
    </section>`;
    restartButton.classList.add("hidden");
    app.querySelectorAll("[data-play-episode]").forEach(button => {
      button.onclick = () => startEpisode(button.dataset.playEpisode);
    });
    root.BiteBuddyRelease?.apply?.();
  }

  function recordCompletionIfNeeded() {
    if (state.screen !== "results" && state.screen !== "missionReport") return false;
    const id = activeEpisodeId(state);
    if (!Number.isFinite(Number(state.score))) return false;
    progressStore.recordCompletion(id, Number(state.score));
    return true;
  }

  function addEpisodeEnding() {
    if (state.screen !== "results" || state.finalRevealPhase !== "final") return false;
    const speech = document.querySelector(".final-pup-speech");
    if (!speech || speech.querySelector(".episode-ending-celebration")) return false;
    const episode = episodes.getEpisode(activeEpisodeId(state));
    const line = document.createElement("p");
    line.className = "episode-ending-celebration";
    line.textContent = episode.reveal.endingCelebration;
    speech.append(line);
    return true;
  }

  function bindEpisodeNavigation() {
    const id = activeEpisodeId(state);
    const homeButtons = [
      document.querySelector("#missionHome"),
      document.querySelector("#missionHomeSlot button")
    ].filter(Boolean);
    homeButtons.forEach(button => {
      button.textContent = "Return to Episode Library";
      button.onclick = returnToLibrary;
    });

    [
      document.querySelector("#replayThisCase"),
      document.querySelector("#missionReplayEpisode")
    ].filter(Boolean).forEach(button => {
      button.textContent = "Replay This Episode";
      button.onclick = () => startEpisode(id);
    });
    if (id !== "episode-002") return;
    [
      document.querySelector("#playFreshVariant"),
      document.querySelector("#missionFreshVariant")
    ].filter(Boolean).forEach(button => {
      button.textContent = "Choose Another Episode";
      button.onclick = returnToLibrary;
    });
  }

  root.RateMyBitesMultiEpisode = Object.freeze({
    version: 1,
    activeEpisodeId,
    episodePayload,
    libraryViewModel,
    canLaunch,
    applyEpisode,
    freshEpisodeState,
    startEpisode,
    returnToLibrary,
    renderEpisodeLibrary,
    recordCompletionIfNeeded
  });

  if (typeof root.document === "undefined") return;

  const baseInitialState = initialState;
  initialState = function () {
    const next = baseInitialState();
    const saved = progressStore.load();
    return {
      ...next,
      selectedEpisodeId: episodes.isPlayable(saved.lastPlayedEpisodeId)
        ? saved.lastPlayedEpisodeId
        : episodes.defaultEpisodeId
    };
  };
  root.initialState = initialState;

  const baseRender = render;
  render = function () {
    if (state.screen === "episodeLibrary") {
      renderEpisodeLibrary();
      return;
    }
    baseRender();
    recordCompletionIfNeeded();
    addEpisodeEnding();
    bindEpisodeNavigation();
  };
  root.render = render;

  reset = returnToLibrary;
  root.reset = reset;
  restartButton.onclick = returnToLibrary;

  state.selectedEpisodeId = activeEpisodeId(state);
  if (state.screen === "welcome") state.screen = "episodeLibrary";
  render();
})(window);
