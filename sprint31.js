// Sprint 3.1 — series polish, episode completion, and navigation safeguards.
(function (root) {
  "use strict";

  const clone = value => JSON.parse(JSON.stringify(value));

  function completionMetrics(report) {
    const scoredCategoryIds = new Set(["restaurant", "meal", "drink", "dessert"]);
    const categories = (Array.isArray(report?.categoryResults) ? report.categoryResults : [])
      .filter(item => scoredCategoryIds.has(item?.id));
    const totalCorrect = categories.reduce((sum, item) => sum + (Number(item.correct) || 0), 0);
    const totalPredictions = categories.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
    const meal = categories.find(item => item.id === "meal") || { correct: 0, total: 0 };
    return {
      mysterySolved: "Complete",
      mealsIdentified: `${Number(meal.correct) || 0} / ${Number(meal.total) || 0}`,
      restaurant: report?.restaurantResult?.actual || "Mystery restaurant",
      restaurantCorrect: Boolean(report?.restaurantResult?.correct),
      accuracy: totalPredictions ? Math.round((totalCorrect / totalPredictions) * 100) : 0,
      correctPredictions: totalCorrect,
      totalPredictions,
      score: Number(report?.score?.earned) || 0,
      possibleScore: Number(report?.score?.possible) || 300
    };
  }

  function nextPlayableEpisodeId(currentId, catalog) {
    const playable = (Array.isArray(catalog) ? catalog : [])
      .filter(entry => entry?.status === "playable")
      .sort((a, b) => Number(a.order) - Number(b.order));
    const index = playable.findIndex(entry => entry.id === currentId);
    return index >= 0 ? playable[index + 1]?.id || null : null;
  }

  function completionMessage(episode, score) {
    if (score >= 240) return episode?.story?.completion?.mascotMessage || "Outstanding work! You read the whole table.";
    if (score >= 120) return `Case closed! ${episode?.story?.castIds?.length || 3} friends left plenty of good clues—and a few excellent distractions.`;
    return "Mystery filed, Detective. This table kept you guessing, but every case makes the next read sharper.";
  }

  function completionViewModel(episode, report, catalog, world) {
    const metrics = completionMetrics(report);
    const teaser = episode?.story?.completion?.teaser || {};
    const teaserCharacter = world?.getCharacter?.(teaser.speakerId) || { name: "Pup", portraitId: "portrait.pup" };
    const teaserPortrait = world?.getAsset?.(teaserCharacter.portraitId);
    return {
      episodeId: episode?.metadata?.id || "",
      title: episode?.metadata?.title || "Episode",
      ending: episode?.story?.ending || "",
      celebration: episode?.reveal?.endingCelebration || "",
      funFact: episode?.story?.completion?.funFact || "",
      mascotMessage: completionMessage(episode, metrics.score),
      metrics,
      nextEpisodeId: nextPlayableEpisodeId(episode?.metadata?.id, catalog),
      teaser: {
        speaker: teaserCharacter.name,
        text: teaser.text || "Same table next time?",
        portrait: teaserPortrait?.src || ""
      }
    };
  }

  root.RateMyBitesSprint31 = Object.freeze({
    version: 1,
    completionMetrics,
    nextPlayableEpisodeId,
    completionMessage,
    completionViewModel
  });

  const episodes = root.RateMyBitesEpisodes;
  const world = root.RateMyBitesWorld;
  const runtime = root.RateMyBitesMultiEpisode;
  const revealRuntime = root.BiteBuddySprint444Runtime;
  if (
    typeof root.document === "undefined" ||
    !episodes ||
    !world ||
    !runtime ||
    !revealRuntime ||
    typeof results !== "function" ||
    typeof render !== "function"
  ) return;

  const safe = value => escapeHtml(value ?? "");

  function currentEpisode() {
    return episodes.getEpisode(runtime.activeEpisodeId(state));
  }

  function invokeMissionAction(selector) {
    state.screen = "missionReport";
    render();
    document.querySelector(selector)?.click();
  }

  function leaderboardMarkup() {
    const board = getBoard();
    return `<details class="score-save-panel final-local-board episode-complete-board">
      <summary>Local Top Biters</summary>
      <div class="name-entry">
        <input id="nickname" maxlength="18" placeholder="Your nickname" aria-label="Your nickname">
        <button class="secondary-button" id="save" type="button">Save Score</button>
      </div>
      ${board.length ? `<table class="leaderboard"><thead><tr><th>Player</th><th>Date</th><th>Score</th></tr></thead><tbody>${board.map((row, index) => `<tr><td>${index + 1}. ${safe(row.name)}</td><td>${safe(row.date)}</td><td>${Number(row.score) || 0}</td></tr>`).join("")}</tbody></table>` : `<p>No saved scores yet. Be the first local league leader.</p>`}
    </details>`;
  }

  function renderEpisodeComplete(report) {
    const episode = currentEpisode();
    const model = completionViewModel(episode, report, episodes.getCatalog(), world);
    const { metrics } = model;
    app.innerHTML = `<section class="episode-complete-31" data-screen="episode-complete" data-episode-id="${safe(model.episodeId)}">
      <div class="episode-complete-stars" aria-hidden="true">✦ ✦ ✦</div>
      <header class="episode-complete-header">
        <p class="eyebrow">Season 1 · ${safe(world.getSeason(episode.metadata.seasonId)?.title || "Huntsville")}</p>
        <h1 data-final-reveal-heading tabindex="-1"><span aria-hidden="true">★</span> Episode Complete</h1>
        <p>${safe(model.title)}</p>
        <div class="episode-complete-score" aria-label="${metrics.score} out of ${metrics.possibleScore} points">
          <strong>${metrics.score}</strong><span>/ ${metrics.possibleScore}</span>
        </div>
      </header>

      <section class="episode-complete-pup" aria-label="Pup congratulates the player">
        ${photo(host.image, "Pup, Host")}
        <div><span>Pup</span><p>${safe(model.mascotMessage)}</p></div>
      </section>

      <section class="episode-complete-summary" aria-label="Episode results">
        <article><span>Mystery Solved</span><strong>✓ ${safe(metrics.mysterySolved)}</strong></article>
        <article><span>Meals Identified</span><strong>${safe(metrics.mealsIdentified)}</strong></article>
        <article><span>Restaurant</span><strong>${safe(metrics.restaurant)}</strong><small>${metrics.restaurantCorrect ? "Correctly predicted" : "Answer revealed"}</small></article>
        <article><span>Accuracy</span><strong>${metrics.accuracy}%</strong><small>${metrics.correctPredictions} of ${metrics.totalPredictions} predictions</small></article>
      </section>

      ${model.funFact ? `<aside class="episode-complete-fact"><span aria-hidden="true">✦</span><div><strong>Fun fact</strong><p>${safe(model.funFact)}</p></div></aside>` : ""}
      <p class="episode-complete-ending">${safe(model.celebration || model.ending)}</p>

      <nav class="episode-complete-actions" aria-label="Episode complete actions">
        <button class="primary-button" id="nextEpisode" type="button" ${model.nextEpisodeId ? "" : "disabled aria-disabled=\"true\""}>
          <span aria-hidden="true">▶</span> ${model.nextEpisodeId ? "Next Episode" : "Next Episode · Coming Soon"}
        </button>
        <button class="secondary-button" id="replayEpisode" type="button"><span aria-hidden="true">↻</span> Replay Episode</button>
        <button class="secondary-button" id="episodeLibrary" type="button"><span aria-hidden="true">▦</span> Episode Library</button>
        <button class="ghost-button" id="episodeHome" type="button"><span aria-hidden="true">⌂</span> Home</button>
      </nav>

      <div class="episode-complete-more" aria-label="Case review actions">
        <button class="text-button" id="viewMissionReport" type="button">View Mission Report</button>
        <button class="text-button" id="reviewEveryAnswer" type="button">Review Every Answer</button>
        ${model.episodeId === "episode-001" ? `<button class="text-button" id="playFreshVariant" type="button">Play Fresh Variant</button>` : ""}
      </div>

      ${leaderboardMarkup()}

      <footer class="episode-complete-teaser">
        <p>Next time on <strong>Rate My Bites…</strong></p>
        <div>
          ${model.teaser.portrait ? photo(model.teaser.portrait, model.teaser.speaker) : ""}
          <blockquote><strong>${safe(model.teaser.speaker)}:</strong> “${safe(model.teaser.text)}”</blockquote>
        </div>
      </footer>
    </section>`;

    app.querySelector("#nextEpisode")?.addEventListener("click", () => {
      if (model.nextEpisodeId) runtime.startEpisode(model.nextEpisodeId);
    });
    app.querySelector("#replayEpisode").onclick = () => runtime.startEpisode(model.episodeId);
    app.querySelector("#episodeLibrary").onclick = runtime.returnToLibrary;
    app.querySelector("#episodeHome").onclick = runtime.returnToLibrary;
    app.querySelector("#viewMissionReport").onclick = () => {
      state.screen = "missionReport";
      render();
    };
    app.querySelector("#reviewEveryAnswer").onclick = () => {
      state.finalRevealPhase = "review";
      state.finalRevealShowAll = true;
      render();
    };
    const fresh = app.querySelector("#playFreshVariant");
    if (fresh) fresh.onclick = () => invokeMissionAction("#missionFreshVariant");
    const save = app.querySelector("#save");
    if (save) save.onclick = saveScore;

    state.revealComplete = true;
    state.revealScore = report.score.earned;
    if (!state.sprint31CompletionNarrated) {
      state.sprint31CompletionNarrated = true;
      root.PupVoice?.speak?.(`Episode complete. ${model.mascotMessage}`);
    }
    root.BiteBuddyRelease?.apply?.();
    root.requestAnimationFrame?.(() => app.querySelector("[data-final-reveal-heading]")?.focus?.({ preventScroll: true }));
  }

  const baseResults31 = results;
  results = function () {
    if (state.finalRevealPhase === "final") {
      stopTimer();
      root.PupVoice?.cancel?.();
      renderEpisodeComplete(revealRuntime.reportData());
      return;
    }
    baseResults31();
  };
  root.results = results;

  let historyInstalled = false;
  function installHistoryNavigation() {
    if (historyInstalled || !root.history?.replaceState) return;
    historyInstalled = true;
    if (!root.history.state?.rmbView) root.history.replaceState({ rmbView: "library" }, "");
    root.addEventListener("popstate", () => {
      if (root.history.state?.rmbView === "library" && state.screen !== "episodeLibrary") runtime.returnToLibrary();
    });
  }

  function polishNavigation() {
    restartButton.textContent = "Episode Library";
    if (state.screen === "missionReport" && !document.querySelector("#missionNextEpisode")) {
      const currentId = runtime.activeEpisodeId(state);
      const nextId = nextPlayableEpisodeId(currentId, episodes.getCatalog());
      const footer = document.querySelector(".mission-report-actions");
      if (footer && nextId) {
        const next = document.createElement("button");
        next.className = "primary-button";
        next.id = "missionNextEpisode";
        next.type = "button";
        next.textContent = "Next Episode";
        next.onclick = () => runtime.startEpisode(nextId);
        footer.prepend(next);
      }
    }
    if (root.history?.replaceState) {
      if (state.screen === "episodeLibrary") {
        if (root.history.state?.rmbView !== "library") root.history.replaceState({ rmbView: "library" }, "");
      } else if (root.history.state?.rmbView !== "episode") {
        root.history.pushState({ rmbView: "episode", episodeId: runtime.activeEpisodeId(state) }, "");
      }
    }
  }

  installHistoryNavigation();
  const baseRender31 = render;
  render = function () {
    baseRender31();
    polishNavigation();
  };
  root.render = render;
  polishNavigation();
})(window);
