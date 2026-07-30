// Rate My Bites Detective v0.5.0 — Sprint 4: The Party.
(function (root) {
  "use strict";

  const EPISODE_ID = "episode-003";
  const episodes = root.RateMyBitesEpisodes;
  const runtime = root.RateMyBitesMultiEpisode;
  const world = root.RateMyBitesWorld;
  const characters = root.RateMyBitesCharacterBible;
  const season = root.RateMyBitesSeason1Bible;
  const living = root.RateMyBitesLivingEpisode;
  const memory = root.RateMyBitesStoryMemory;
  const pupAudio = root.RateMyBitesPupAudio;
  if (!episodes || !runtime || !world || !characters || !season || !living || !memory || !pupAudio) {
    throw new Error("Sprint 4 Party dependencies must load before sprint4Party.js");
  }

  const clone = value => JSON.parse(JSON.stringify(value));
  const safe = value => escapeHtml(value ?? "");
  const baseRender = render;
  const baseRestaurantRound = restaurantRound;
  const baseRestaurantReveal = restaurantReveal;
  const baseMissionReportRestaurantCandidate = missionReportRestaurantCandidate;
  const baseSpeakConversation = speakConversation;
  const baseStopConversationMedia = stopConversationMedia;
  const baseStopBriefingMedia = stopBriefingMedia;
  const legacyPupVoice = root.PupVoice;
  let launchMode = null;
  let applyingRestoredState = false;

  function isEpisode3(stateObject = state) {
    return stateObject?.selectedEpisodeId === EPISODE_ID;
  }

  function replaceArray(target, values) {
    target.splice(0, target.length, ...clone(values));
  }

  function replaceObject(target, values) {
    Object.keys(target).forEach(key => delete target[key]);
    Object.assign(target, clone(values));
  }

  function materializeVariation(variationSet) {
    const completed = root.RateMyBitesEpisodeProgress.load().completedEpisodeIds;
    const resolved = episodes.resolveContinuity(EPISODE_ID, completed);
    const episode = living.materialize(resolved, variationSet);
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
    livingDinnerStory.livingState = clone(episode.story.livingState);
    livingDinnerStory.cinematicMissionPrepared = false;
    state.episode3VariationSet = clone(variationSet);
    state.episode3LivingState = clone(episode.story.livingState);
    state.currentVariantId = variationSet.signature;
    return episode;
  }

  function newVariationSet() {
    const player = memory.loadPlayer();
    const playCount = Number(player.episodePlayCounts[EPISODE_ID]) || 0;
    const recent = player.recentVariationSignatures[EPISODE_ID] || [];
    return living.select(episodes.getEpisode(EPISODE_ID), 5003 + ((playCount + 1) * 997), recent);
  }

  function initializeNewEpisode3() {
    const variationSet = newVariationSet();
    materializeVariation(variationSet);
    memory.recordEpisodeStart(EPISODE_ID, variationSet.signature);
    Object.assign(state, {
      selectedEpisodeId: EPISODE_ID,
      currentCaseId: EPISODE_ID,
      attemptType: root.RateMyBitesEpisodeProgress.load().completedEpisodeIds.includes(EPISODE_ID)
        ? "episode-replay"
        : "first-attempt",
      screen: "partyOpening",
      partyOpeningStep: 0,
      conversationIndex: 0,
      groupRestaurant: null,
      episode3MysteryChoice: null,
      episode3CompletionRecorded: false,
      episode3EndingPlayed: false,
      sprint4EncouragementPlayed: false,
      picks: {},
      confidence: {},
      score: 0,
      storyMemory: [],
      appliedInfluence: [],
      livingConfidence: {
        "group-restaurant": 3,
        "emma-meal": 3,
        "ellis-dessert": 3,
        "grace-meal": 3
      }
    });
    memory.clearSession();
  }

  function restoreEpisode3(session) {
    applyingRestoredState = true;
    try {
      Object.assign(state, clone(session.state), {
        selectedEpisodeId: EPISODE_ID,
        episode3VariationSet: clone(session.variationSet)
      });
      materializeVariation(session.variationSet);
    } finally {
      applyingRestoredState = false;
    }
  }

  function prepareEpisode3IfNeeded() {
    if (!isEpisode3() || state.screen === "episodeLibrary" || state.screen === "party") return;
    if (state.episode3VariationSet) {
      materializeVariation(state.episode3VariationSet);
      return;
    }
    const session = memory.loadSession();
    if (launchMode === "resume" && session.episodeId === EPISODE_ID) restoreEpisode3(session);
    else initializeNewEpisode3();
    launchMode = null;
  }

  function stateSnapshot() {
    const snapshot = clone(state);
    for (const key of Object.keys(snapshot)) {
      if (/NarratedKeys|Focused|Timer|Scheduled/i.test(key)) delete snapshot[key];
    }
    return snapshot;
  }

  function persistEpisode3() {
    if (applyingRestoredState || !isEpisode3() || !state.episode3VariationSet) return;
    if (state.screen === "episodeLibrary" || state.screen === "party") return;
    if (state.revealComplete && state.finalRevealPhase === "final") {
      if (!state.episode3CompletionRecorded) {
        state.episode3CompletionRecorded = true;
        memory.recordCompletion(EPISODE_ID, state.picks);
      }
      memory.clearSession();
      return;
    }
    memory.saveSession(EPISODE_ID, state.episode3VariationSet, stateSnapshot());
  }

  function launchEpisode3(mode = "new") {
    launchMode = mode;
    runtime.startEpisode(EPISODE_ID);
    return true;
  }

  function episodeTitle(id) {
    return episodes.getCatalog().find(entry => entry.id === id)?.title || id.replace("episode-", "Episode ");
  }

  function appearanceText(profile) {
    if (!profile.episodeAppearances.length) return "Future reservation";
    return profile.episodeAppearances.map(episodeTitle).join(" · ");
  }

  function profileCard(profile) {
    const hostProfile = profile.id === "pup";
    return `<article class="party-profile ${hostProfile ? "party-host-profile" : ""}" data-party-member="${safe(profile.id)}">
      <div class="party-profile-portrait">
        ${photo(profile.portrait.src, profile.fullName)}
        <span>${hostProfile ? "Host" : "Diner"}</span>
      </div>
      <div class="party-profile-copy">
        <header><h2>${safe(profile.fullName)}</h2><p>${safe(profile.personalitySummary)}</p></header>
        ${hostProfile ? `<p class="party-host-line"><strong>Host</strong>Helping everyone find the perfect meal.</p>` : ""}
        <dl class="party-profile-facts">
          <div><dt>Favorite meals</dt><dd>${safe(profile.favoriteMeals.join(" · "))}</dd></div>
          <div><dt>Favorite drinks</dt><dd>${safe(profile.favoriteDrinks.join(" · "))}</dd></div>
          <div><dt>Food preferences</dt><dd>${safe(profile.foodPreferences.slice(0, 3).join(" · "))}</dd></div>
          <div><dt>Relationship to The Party</dt><dd>${safe(profile.relationshipToParty)}</dd></div>
          <div><dt>Episode appearances</dt><dd>${safe(appearanceText(profile))}</dd></div>
        </dl>
        <blockquote>“${safe(profile.memorableQuote)}”</blockquote>
      </div>
    </article>`;
  }

  function renderParty() {
    const roster = season.get().partyRoster.map(id => characters.getProfile(id)).filter(Boolean);
    app.innerHTML = `<section class="party-home" data-screen="the-party">
      <header class="party-home-header">
        <p class="eyebrow">Your standing dinner reservation</p>
        <h1>The Party</h1>
        <p>Familiar friends, favorite orders, and another open seat at the table.</p>
        <button class="secondary-button" id="partyBack" type="button">Episode Library</button>
      </header>
      <div class="party-profile-list">${roster.map(profileCard).join("")}</div>
    </section>`;
    restartButton.classList.add("hidden");
    app.querySelector("#partyBack").onclick = runtime.returnToLibrary;
    root.BiteBuddyRelease?.apply?.();
  }

  function audioControls(clipId, compact = false) {
    return `<div class="pup-audio-controls ${compact ? "compact" : ""}">
      <button class="briefing-icon-button" type="button" data-pup-mute aria-label="${pupAudio.muted ? "Turn on Pup’s voice" : "Mute Pup’s voice"}">${pupAudio.muted ? "🔇" : "🔊"}</button>
      <button class="text-button" type="button" data-pup-replay="${safe(clipId)}">Replay Pup</button>
    </div>`;
  }

  function bindAudioControls(scope = app) {
    scope.querySelectorAll?.("[data-pup-mute]").forEach(button => {
      button.onclick = () => {
        pupAudio.setMuted(!pupAudio.muted);
        state.voiceEnabled = !pupAudio.muted;
        render();
      };
    });
    scope.querySelectorAll?.("[data-pup-replay]").forEach(button => {
      button.onclick = () => pupAudio.play(button.dataset.pupReplay);
    });
  }

  function partySeat(id) {
    const profile = characters.getProfile(id);
    const isPup = id === "pup";
    return `<article class="party-seat ${isPup ? "party-seat-host" : ""}">
      ${photo(profile.portrait.src, profile.fullName)}
      <div><span>${isPup ? "Host" : "The Party"}</span><strong>${safe(profile.fullName)}</strong>${isPup ? "<p>Helping everyone find the perfect meal.</p>" : ""}</div>
    </article>`;
  }

  function renderPartyOpening() {
    const episode = episodes.getEpisode(EPISODE_ID);
    const live = state.episode3LivingState;
    const step = Number(state.partyOpeningStep) || 0;
    const restaurant = world.getRestaurant("copper-table");
    const environment = live.environment;
    const special = live.restaurantSpecial;
    const playerCallback = memory.callbackFor(memory.loadPlayer());
    const voicedCallback = playerCallback === pupAudio.caption("memory");
    if (step === 0) {
      app.innerHTML = `<section class="party-opening party-opening-roster" data-screen="party-opening">
        <header><p class="eyebrow">Episode 3</p><h1>${safe(episode.metadata.title)}</h1><p>The Party</p></header>
        <div class="party-seat-grid">${["emma", "ellis", "grace", "pup"].map(partySeat).join("")}</div>
        <button class="primary-button" id="partyOpeningNext" type="button">Tonight’s Restaurant</button>
      </section>`;
    } else if (step === 1) {
      app.innerHTML = `<section class="party-opening party-opening-restaurant ${safe(environment.className)}" data-screen="party-opening">
        <header><p class="eyebrow">Tonight’s Restaurant</p><h1>${safe(restaurant.name)}</h1></header>
        <figure>${photo(world.assetSrc(restaurant.artworkId), restaurant.name)}<figcaption>${safe(environment.text)}</figcaption></figure>
        <aside class="party-special"><span>${safe(special.title)}</span><strong>${safe(special.text)}</strong></aside>
        ${playerCallback ? `<blockquote class="pup-visible-caption party-memory-callback" role="status"><strong>Pup:</strong> “${safe(playerCallback)}”</blockquote>${voicedCallback ? audioControls("memory", true) : ""}` : ""}
        <button class="primary-button" id="partyOpeningNext" type="button">Meet Your Host</button>
      </section>`;
    } else {
      const caption = pupAudio.caption("opening");
      const playerCallback = memory.callbackFor();
      app.innerHTML = `<section class="party-opening party-opening-pup" data-screen="party-opening">
        <header><p class="eyebrow">Your Host</p><h1>Pup</h1><p>Helping everyone find the perfect meal.</p></header>
        <div class="party-pup-stage">${photo(world.assetSrc("portrait.pup"), "Pup, Host")}<span>Host</span></div>
        <blockquote class="pup-visible-caption" role="status"><strong>Pup:</strong> “${safe(caption)}”</blockquote>
        ${playerCallback ? `<p class="party-memory-callback"><strong>Pup remembers:</strong> ${safe(playerCallback)}</p>` : ""}
        ${audioControls("opening")}
        <button class="primary-button" id="partyOpeningNext" type="button">Begin Dinner</button>
      </section>`;
    }
    restartButton.classList.remove("hidden");
    const next = app.querySelector("#partyOpeningNext");
    next.onclick = () => {
      if (step < 2) {
        state.partyOpeningStep = step + 1;
        render();
        if (step === 0 && voicedCallback) pupAudio.play("memory");
        if (step === 1) pupAudio.play("opening");
      } else {
        pupAudio.stop();
        state.screen = "conversation";
        state.conversationIndex = 0;
        render();
      }
    };
    bindAudioControls();
    root.BiteBuddyRelease?.apply?.();
  }

  function mysteryOption(option) {
    return `<button class="mystery-option ${state.episode3MysteryChoice === option.id ? "selected" : ""}" type="button" data-mystery-choice="${safe(option.id)}">
      <span aria-hidden="true">?</span><strong>${safe(option.label)}</strong><small>${safe(option.detail)}</small>
    </button>`;
  }

  function mysteryChoice() {
    return episodes.getEpisode(EPISODE_ID).gameplay.mystery.options
      .find(option => option.id === state.episode3MysteryChoice);
  }

  function lockMystery() {
    const mystery = episodes.getEpisode(EPISODE_ID).gameplay.mystery;
    const option =
      mysteryChoice() ||
      mystery.options.find((candidate) => candidate.id !== mystery.correctId) ||
      mystery.options[0];
    state.episode3MysteryChoice = option.id;
    state.groupRestaurant = option.id === mystery.correctId ? actualRestaurantId : "cactus";
    state.restaurantRevealLockedChoice = state.groupRestaurant;
    if (!currentConfidence("group", "restaurant")) state.confidence[confidenceKey("group", "restaurant")] = 1;
    state.screen = "restaurantReveal";
    render();
  }

  function episode3MysteryRound() {
    const mystery = episodes.getEpisode(EPISODE_ID).gameplay.mystery;
    const confidence = currentConfidence("group", "restaurant");
    app.innerHTML = `${timerMarkup()}<section class="episode3-mystery" data-screen="central-mystery">
      <div class="progress-wrap"><div class="progress-meta"><span>Central mystery</span><span>One answer</span></div><div class="progress-track"><span style="width:12%"></span></div></div>
      <p class="eyebrow">Make Your Read</p>
      <h1>${safe(mystery.prompt)}</h1>
      <p>The restaurant is known. The reason behind the missing card is not.</p>
      <div class="mystery-options">${mystery.options.map(mysteryOption).join("")}</div>
      ${confidenceControl("group", "restaurant")}
      <div class="actions"><button class="primary-button" id="lockMystery" type="button" ${state.episode3MysteryChoice && confidence ? "" : "disabled"}>Lock the Mystery</button></div>
    </section>`;
    app.querySelectorAll("[data-mystery-choice]").forEach(button => {
      button.onclick = () => {
        state.episode3MysteryChoice = button.dataset.mysteryChoice;
        render();
      };
    });
    app.querySelectorAll("[data-confidence]").forEach(button => {
      button.onclick = () => {
        state.confidence[confidenceKey("group", "restaurant")] = Number(button.dataset.confidence);
        render();
      };
    });
    app.querySelector("#lockMystery").onclick = lockMystery;
    startTimer(lockMystery);
  }

  function episode3MysteryReveal() {
    stopTimer();
    const episode = episodes.getEpisode(EPISODE_ID);
    const mystery = episode.gameplay.mystery;
    const choice = mysteryChoice();
    const correct = choice?.id === mystery.correctId;
    const caption = correct ? pupAudio.caption("encouragement") : "";
    app.innerHTML = `<section class="episode3-mystery-reveal" data-screen="mystery-reveal">
      <p class="eyebrow">The Missing Card</p>
      <h1>${correct ? "You noticed the careful plan." : "The phone call came first."}</h1>
      <article class="mystery-answer-card ${correct ? "correct" : "wrong"}">
        ${photo(world.assetSrc("restaurant.copper-table"), "The Copper Table")}
        <div><span>${correct ? "+120" : "0"} points</span><strong>${safe(mystery.solution)}</strong><p>Your answer: ${safe(choice?.label || "No answer")}</p></div>
      </article>
      <p class="episode3-solution">${safe(episode.reveal.restaurantExplanation)}</p>
      ${caption ? `<blockquote class="pup-visible-caption" role="status"><strong>Pup:</strong> “${safe(caption)}”</blockquote>${audioControls("encouragement", true)}` : ""}
      <div class="actions"><button class="primary-button" id="orders" type="button">Predict Their Orders</button></div>
    </section>`;
    app.querySelector("#orders").onclick = () => {
      pupAudio.stop();
      state.screen = "play";
      render();
    };
    bindAudioControls();
    if (correct && !state.sprint4EncouragementPlayed) {
      state.sprint4EncouragementPlayed = true;
      pupAudio.play("encouragement");
    }
  }

  restaurantRound = function () {
    if (isEpisode3()) {
      episode3MysteryRound();
      return;
    }
    baseRestaurantRound();
  };
  root.restaurantRound = restaurantRound;

  restaurantReveal = function () {
    if (isEpisode3()) {
      episode3MysteryReveal();
      return;
    }
    baseRestaurantReveal();
  };
  root.restaurantReveal = restaurantReveal;

  missionReportRestaurantCandidate = function (revealData) {
    if (!isEpisode3()) return baseMissionReportRestaurantCandidate(revealData);
    const episode = episodes.getEpisode(EPISODE_ID);
    const choice = mysteryChoice();
    const actual = episode.gameplay.mystery.options.find(option => option.id === episode.gameplay.mystery.correctId);
    const correct = choice?.id === actual?.id;
    return {
      id: "group-mystery",
      personId: "group",
      personName: "The Party",
      type: "mystery",
      label: "Central mystery",
      prediction: choice?.label || "No prediction",
      actual: actual?.label || "Emma called ahead",
      confidence: Number(currentConfidence("group", "restaurant")) || 0,
      correct,
      earned: correct ? Number(points.restaurant) || 120 : 0,
      possible: Number(points.restaurant) || 120,
      clue: episode.story.finaleClues.map(item => item.text).join(" "),
      clues: episode.story.finaleClues.map(item => item.text),
      context: {
        id: "social",
        label: "People first",
        lesson: "The strongest clue was the person who listened before choosing for the table."
      }
    };
  };
  root.missionReportRestaurantCandidate = missionReportRestaurantCandidate;

  function fixedClipForText(text) {
    const captions = pupAudio.captions;
    return Object.keys(captions).find(id => captions[id] === String(text)) || null;
  }

  const recordedPupVoice = Object.freeze({
    get settings() {
      return isEpisode3()
        ? { enabled: !pupAudio.muted, preset: "recorded-pup", volume: 0.82 }
        : legacyPupVoice.settings;
    },
    get voices() { return isEpisode3() ? [] : legacyPupVoice.voices; },
    speak(text) {
      if (!isEpisode3()) return legacyPupVoice.speak(text);
      const clipId = fixedClipForText(text);
      if (!clipId) return false;
      pupAudio.play(clipId);
      return true;
    },
    cancel() {
      pupAudio.stop();
      return legacyPupVoice.cancel();
    },
    preview() {
      return isEpisode3() ? pupAudio.play("opening") : legacyPupVoice.preview();
    },
    set(next) {
      if (typeof next?.enabled === "boolean") pupAudio.setMuted(!next.enabled);
      legacyPupVoice.set(next);
    },
    reset() {
      pupAudio.setMuted(false);
      legacyPupVoice.reset();
    }
  });
  root.PupVoice = recordedPupVoice;

  speakConversation = function (text) {
    if (!isEpisode3()) return baseSpeakConversation(text);
    const clipId = fixedClipForText(text);
    if (clipId) return pupAudio.play(clipId);
    return false;
  };
  root.speakConversation = speakConversation;

  stopConversationMedia = function () {
    baseStopConversationMedia();
    pupAudio.stop();
  };
  root.stopConversationMedia = stopConversationMedia;

  stopBriefingMedia = function () {
    baseStopBriefingMedia();
    pupAudio.stop();
  };
  root.stopBriefingMedia = stopBriefingMedia;

  function installLibraryPartyEntry() {
    const header = app.querySelector(".episode-library-header");
    if (!header || header.querySelector("#openParty")) return;
    const button = document.createElement("button");
    button.id = "openParty";
    button.type = "button";
    button.className = "secondary-button party-library-button";
    button.textContent = "The Party";
    button.onclick = () => {
      state.screen = "party";
      render();
    };
    header.append(button);

    const session = memory.loadSession();
    const episode3Button = app.querySelector(`[data-play-episode="${EPISODE_ID}"]`);
    if (episode3Button) {
      if (session.episodeId === EPISODE_ID) episode3Button.textContent = "Resume";
      episode3Button.onclick = () => launchEpisode3(session.episodeId === EPISODE_ID ? "resume" : "new");
    }
  }

  function polishEpisode3Screen() {
    if (!isEpisode3()) return;
    document.querySelectorAll(".living-name span").forEach(label => {
      if (label.parentElement?.querySelector("strong")?.textContent === "Pup") label.textContent = "Host";
    });
    if (state.screen === "conversation") {
      const current = livingDinnerStory.events[state.conversationIndex];
      if (current?.speaker === "Pup") {
        const blockquote = app.querySelector(".living-dialogue blockquote");
        blockquote?.classList.add("pup-visible-caption");
        const clipId = fixedClipForText(current.text);
        if (clipId && !app.querySelector("[data-pup-replay]")) {
          app.querySelector(".living-dialogue")?.insertAdjacentHTML("beforeend", audioControls(clipId, true));
          bindAudioControls();
        }
      }
    }
    if (state.screen === "missionReport") {
      const title = app.querySelector("#missionRestaurantTitle");
      if (title) title.textContent = "Central Mystery Finding";
      const labels = app.querySelectorAll(".mission-restaurant-card > div > span");
      if (labels[0]) labels[0].textContent = "Your answer";
      if (labels[1]) labels[1].textContent = "Solution";
    }
    if (state.revealComplete && state.finalRevealPhase === "final") {
      const summaryCards = app.querySelectorAll(".episode-complete-summary article");
      if (summaryCards[2]) {
        summaryCards[2].querySelector("span").textContent = "Central Mystery";
        summaryCards[2].querySelector("strong").textContent = "Emma called ahead";
        const small = summaryCards[2].querySelector("small");
        if (small) small.textContent = state.episode3MysteryChoice === "emma-called-ahead" ? "Correctly solved" : "Solution revealed";
      }
      const pupPanel = app.querySelector(".episode-complete-pup");
      if (pupPanel && !pupPanel.querySelector(".pup-completion-caption")) {
        const caption = pupAudio.caption("ending");
        pupPanel.insertAdjacentHTML("afterend", `<blockquote class="pup-visible-caption pup-completion-caption" role="status"><strong>Pup:</strong> “${safe(caption)}”</blockquote>${audioControls("ending", true)}`);
        bindAudioControls(app);
      }
      const replay = app.querySelector("#replayEpisode");
      if (replay) replay.onclick = () => launchEpisode3("new");
      if (!state.episode3EndingPlayed) {
        state.episode3EndingPlayed = true;
        pupAudio.play("ending");
      }
    }
  }

  function renderSprint4() {
    prepareEpisode3IfNeeded();
    if (state.screen === "party") {
      renderParty();
      return;
    }
    if (state.screen === "partyOpening") {
      renderPartyOpening();
      persistEpisode3();
      return;
    }
    baseRender();
    installLibraryPartyEntry();
    polishEpisode3Screen();
    persistEpisode3();
    root.BiteBuddyRelease?.apply?.();
  }

  render = renderSprint4;
  root.render = renderSprint4;

  root.RateMyBitesSprint4Party = Object.freeze({
    version: "v0.5.0",
    isEpisode3,
    materializeVariation,
    newVariationSet,
    stateSnapshot,
    launchEpisode3,
    renderParty,
    renderPartyOpening,
    episode3MysteryRound,
    episode3MysteryReveal
  });

  render();
})(window);
