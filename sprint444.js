// Bite Buddy League v0.4.4.4 — Final Reveal Continuity & Score Drama.
(function (root) {
  "use strict";

  const release = root.BiteBuddyRelease;
  const revealPhases = Object.freeze(["opening", "diner", "final", "review"]);

  function clamp(value, minimum, maximum) {
    const number = Number(value);
    if (!Number.isFinite(number)) return minimum;
    return Math.min(maximum, Math.max(minimum, number));
  }

  function calibrationLabel(confidence, correct) {
    const value = clamp(confidence, 0, 5);
    if (value >= 4 && correct) return { id: "high-correct", label: "High confidence · correct", text: "You trusted the right clue." };
    if (value <= 2 && correct) return { id: "low-correct", label: "Low confidence · correct", text: "You found the answer, but did not fully trust the evidence." };
    if (value >= 4 && !correct) return { id: "high-wrong", label: "High confidence · incorrect", text: "That clue felt stronger than it really was." };
    if (value <= 2 && !correct) return { id: "low-wrong", label: "Low confidence · incorrect", text: "Your uncertainty was justified." };
    return correct
      ? { id: "measured-correct", label: "Measured confidence · correct", text: "You made a measured call and the evidence held." }
      : { id: "measured-wrong", label: "Measured confidence · incorrect", text: "Your confidence reflected a genuinely difficult read." };
  }

  function categoryTotals(report) {
    const totals = {};
    (report?.categoryResults || []).forEach(item => {
      totals[item.id] = {
        id: item.id,
        label: item.label,
        earned: clamp(item.earned, 0, item.possible || 0),
        possible: Math.max(0, Number(item.possible) || 0)
      };
    });
    return totals;
  }

  function revealedScoreThrough(report, personIndex) {
    const restaurant = Number(report?.restaurantResult?.earned) || 0;
    const people = Array.isArray(report?.personResults) ? report.personResults : [];
    const last = Math.min(people.length - 1, Math.max(-1, Number(personIndex) || 0));
    const peopleScore = last < 0 ? 0 : people.slice(0, last + 1).reduce((sum, item) => sum + (Number(item.pointsEarned) || 0), 0);
    return clamp(restaurant + peopleScore, 0, Number(report?.score?.possible) || 300);
  }

  function orderEntries(report) {
    return (report?.personResults || []).flatMap(result => (result.answers || []).map(answer => ({
      ...answer,
      person: result.person,
      caseNote: result.caseNote,
      possible: Number(answer.possible) || 0,
      earned: Number(answer.earned) || 0,
      confidence: Number(answer.confidence) || 0
    })));
  }

  function bestDeduction(report) {
    const entries = orderEntries(report);
    const best = entries
      .filter(item => item.correct)
      .sort((a, b) => (b.earned - a.earned) || (b.confidence - a.confidence))[0];

    if (best) {
      return {
        title: "Best Deduction",
        label: `${best.person.name}’s ${String(best.label).replace(`${best.person.name}'s `, "")}`,
        prediction: best.prediction,
        actual: best.actual,
        confidence: best.confidence,
        points: best.earned,
        explanation: best.clue || best.context?.lesson || "This successful read matched the available evidence."
      };
    }

    if (report?.restaurantResult?.correct) {
      return {
        title: "Best Calibrated Read",
        label: "Shared restaurant",
        prediction: report.restaurantResult.prediction,
        actual: report.restaurantResult.actual,
        confidence: report.restaurantResult.confidence,
        points: report.restaurantResult.earned,
        explanation: "The group compromise was the strongest successful read in this case."
      };
    }

    const calibrated = [...entries].sort((a, b) => (a.confidence - b.confidence) || (b.possible - a.possible))[0];
    return calibrated ? {
      title: "Best Calibrated Read",
      label: `${calibrated.person.name}’s ${String(calibrated.label).replace(`${calibrated.person.name}'s `, "")}`,
      prediction: calibrated.prediction,
      actual: calibrated.actual,
      confidence: calibrated.confidence,
      points: calibrated.earned,
      explanation: calibrationLabel(calibrated.confidence, calibrated.correct).text
    } : {
      title: "Strongest Evidence Trail",
      label: "Case baseline",
      prediction: "—",
      actual: "—",
      confidence: 0,
      points: 0,
      explanation: "The completed case creates a baseline for the next investigation."
    };
  }

  function biggestMisread(report) {
    const entries = orderEntries(report);
    const miss = entries
      .filter(item => !item.correct)
      .sort((a, b) => (b.confidence - a.confidence) || (b.possible - a.possible))[0];

    if (miss) {
      return {
        title: "Biggest Misread",
        label: `${miss.person.name}’s ${String(miss.label).replace(`${miss.person.name}'s `, "")}`,
        prediction: miss.prediction,
        actual: miss.actual,
        confidence: miss.confidence,
        points: 0,
        explanation: miss.clue || miss.context?.lesson || "A competing clue carried more weight than expected."
      };
    }

    const closest = entries
      .filter(item => item.correct)
      .sort((a, b) => (a.confidence - b.confidence) || (b.possible - a.possible))[0];
    return closest ? {
      title: "Closest Call",
      label: `${closest.person.name}’s ${String(closest.label).replace(`${closest.person.name}'s `, "")}`,
      prediction: closest.prediction,
      actual: closest.actual,
      confidence: closest.confidence,
      points: closest.earned,
      explanation: closest.clue || "This correct read carried the most uncertainty."
    } : {
      title: "Closest Call",
      label: "No order result available",
      prediction: "—",
      actual: "—",
      confidence: 0,
      points: 0,
      explanation: "No individual order result was available for comparison."
    };
  }

  root.BiteBuddySprint444 = Object.freeze({
    version: release?.version || "v0.4.4.4",
    revealPhases,
    calibrationLabel,
    categoryTotals,
    revealedScoreThrough,
    bestDeduction,
    biggestMisread
  });

  if (
    typeof root.document === "undefined" ||
    typeof initialState !== "function" ||
    typeof results !== "function" ||
    typeof render !== "function" ||
    typeof buildMissionReportData !== "function"
  ) return;

  const baseInitialState444 = initialState;
  initialState = function () {
    return {
      ...baseInitialState444(),
      finalRevealPhase: "opening",
      finalRevealPersonIndex: 0,
      finalRevealShowAll: false,
      finalRevealSkipAnimations: false,
      finalRevealActionInProgress: false,
      finalRevealNarratedKeys: []
    };
  };

  const inferredPhase = Number(state.revealStep) >= 5 ? "final" : "opening";
  state = {
    ...state,
    finalRevealPhase: revealPhases.includes(state.finalRevealPhase) ? state.finalRevealPhase : inferredPhase,
    finalRevealPersonIndex: clamp(state.finalRevealPersonIndex, 0, Math.max(0, diners.length - 1)),
    finalRevealShowAll: Boolean(state.finalRevealShowAll),
    finalRevealSkipAnimations: Boolean(state.finalRevealSkipAnimations),
    finalRevealActionInProgress: false,
    finalRevealNarratedKeys: Array.isArray(state.finalRevealNarratedKeys) ? state.finalRevealNarratedKeys : []
  };

  function reportData() {
    return buildMissionReportData();
  }

  function speakOnce(key, line) {
    if (!line || state.finalRevealNarratedKeys.includes(key)) return false;
    state.finalRevealNarratedKeys = [...state.finalRevealNarratedKeys, key];
    return Boolean(root.PupVoice?.speak?.(line));
  }

  function focusRevealHeading() {
    const focus = () => app.querySelector("[data-final-reveal-heading]")?.focus?.({ preventScroll: true });
    if (typeof root.requestAnimationFrame === "function") root.requestAnimationFrame(focus);
    else setTimeout(focus, 0);
  }

  function scoreTarget(report) {
    if (state.finalRevealPhase === "opening") return Number(report.restaurantResult.earned) || 0;
    if (state.finalRevealPhase === "diner") return revealedScoreThrough(report, state.finalRevealPersonIndex);
    return clamp(report.score.earned, 0, report.score.possible || 300);
  }

  function revealProgress() {
    if (state.finalRevealPhase === "opening") return 0;
    if (state.finalRevealPhase === "diner") return Math.round(((state.finalRevealPersonIndex + 1) / Math.max(1, diners.length)) * 75);
    return 100;
  }

  function revealToolbarMarkup() {
    if (state.finalRevealPhase === "final" || state.finalRevealPhase === "review") return "";
    return `<div class="final-reveal-controls" aria-label="Final Reveal controls">
      <button class="secondary-button" id="revealAllAnswers" type="button">Reveal All Answers</button>
      <button class="ghost-button" id="skipRevealAnimations" type="button" aria-pressed="${state.finalRevealSkipAnimations}">Skip Animations</button>
    </div>`;
  }

  function revealShell(content, report, className = "") {
    const target = scoreTarget(report);
    state.revealScore = target;
    const progress = revealProgress();
    return `<section class="final-reveal-444 ${state.finalRevealSkipAnimations ? "skip-animations" : ""} ${className}" data-final-phase="${state.finalRevealPhase}">
      <div class="final-reveal-444-top">
        <div class="final-reveal-version" aria-label="Bite Buddy League ${escapeHtml(release?.version || "v0.4.4.4")}, Final Reveal"><strong>${escapeHtml(release?.version || "v0.4.4.4")}</strong><span>Final Reveal</span></div>
        <div class="final-score-live" role="status" aria-live="polite"><span>CASE SCORE</span><strong id="liveRevealScore">${target}</strong><small>/ ${report.score.possible}</small></div>
      </div>
      <div class="final-reveal-progress" role="progressbar" aria-label="Final Reveal progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><span style="width:${progress}%"></span></div>
      ${revealToolbarMarkup()}
      ${content}
    </section>`;
  }

  function bindGlobalRevealControls() {
    const revealAll = app.querySelector("#revealAllAnswers");
    if (revealAll) revealAll.onclick = () => revealAllAnswers(false);
    const skip = app.querySelector("#skipRevealAnimations");
    if (skip) skip.onclick = () => revealAllAnswers(true);
  }

  function withActionGuard(callback) {
    if (state.finalRevealActionInProgress) return false;
    state.finalRevealActionInProgress = true;
    callback();
    const releaseGuard = () => { state.finalRevealActionInProgress = false; };
    if (typeof queueMicrotask === "function") queueMicrotask(releaseGuard); else setTimeout(releaseGuard, 0);
    return true;
  }

  function revealOpening444(report) {
    const restaurant = report.restaurantResult;
    app.innerHTML = revealShell(`<div class="final-continuity-opening">
      <p class="eyebrow">The Table Is Ready</p>
      <h1 data-final-reveal-heading tabindex="-1">The restaurant is settled.<br>Now reveal the people.</h1>
      <section class="restaurant-continuity-card ${restaurant.correct ? "is-correct" : "is-incorrect"}" aria-label="Secured restaurant result">
        <div><span>Restaurant</span><strong>${escapeHtml(restaurant.actual)}</strong></div>
        <div><span>Your prediction</span><strong>${escapeHtml(restaurant.prediction)}</strong></div>
        <div><span>Restaurant result</span><strong>${restaurant.correct ? "✓ Correct" : "✕ Incorrect"} · ${restaurant.earned} / ${restaurant.possible}</strong></div>
      </section>
      <p class="final-continuity-copy">Restaurant score already secured. Nine order predictions are locked. No restaurant vote will be replayed.</p>
      <div class="final-pup-speech">${photo(host.image, "Pup, Host")}<div><span>HOST</span><p>The restaurant is settled. Nine order predictions remain to be judged.</p></div></div>
      <button class="primary-button reveal-primary" id="revealFirstDiner" type="button">Reveal ${escapeHtml(report.personResults[0]?.person?.name || "First Diner")}</button>
    </div>`, report, "continuity-opening");
    bindGlobalRevealControls();
    app.querySelector("#revealFirstDiner").onclick = () => withActionGuard(() => {
      state.finalRevealPhase = "diner";
      state.finalRevealPersonIndex = 0;
      state.revealStep = 1;
      render();
    });
    speakOnce("continuity-opening", "The restaurant is settled. Nine order predictions remain to be judged.");
    focusRevealHeading();
  }

  function answerCardMarkup(answer) {
    const calibration = calibrationLabel(answer.confidence, answer.correct);
    return `<article class="final-answer-card ${answer.correct ? "is-correct" : "is-incorrect"}">
      <header><span>${escapeHtml(String(answer.label).split("'s ").pop())}</span><strong>${answer.correct ? "✓ Correct" : "✕ Incorrect"}</strong></header>
      <dl>
        <div><dt>Your prediction</dt><dd>${escapeHtml(answer.prediction)}</dd></div>
        <div><dt>Actual order</dt><dd>${escapeHtml(answer.actual)}</dd></div>
        <div><dt>Confidence</dt><dd>${answer.confidence} of 5</dd></div>
        <div><dt>Points earned</dt><dd>${answer.correct ? `+${answer.earned}` : "0"} / ${answer.possible}</dd></div>
      </dl>
      <p class="answer-calibration"><strong>${escapeHtml(calibration.label)}:</strong> ${escapeHtml(calibration.text)}</p>
    </article>`;
  }

  function meaningfulCalibration(result) {
    const answers = [...(result.answers || [])].sort((a, b) => {
      const aWeight = (!a.correct && a.confidence >= 4 ? 4 : a.correct && a.confidence >= 4 ? 3 : a.correct ? 2 : 1);
      const bWeight = (!b.correct && b.confidence >= 4 ? 4 : b.correct && b.confidence >= 4 ? 3 : b.correct ? 2 : 1);
      return (bWeight - aWeight) || ((b.possible || 0) - (a.possible || 0));
    })[0];
    if (!answers) return "This diner created a useful baseline for the next investigation.";
    return `${answers.label}: ${calibrationLabel(answers.confidence, answers.correct).text}`;
  }

  function dinerRevealMarkup(result, index, report) {
    const next = report.personResults[index + 1]?.person?.name;
    return `<div class="final-diner-reveal">
      <p class="eyebrow">Diner ${index + 1} of ${report.personResults.length}</p>
      <div class="final-diner-heading clickable-person" data-person="${escapeHtml(result.person.id)}" tabindex="0" role="button" aria-label="Open ${escapeHtml(result.person.name)} case file">
        ${photo(images.people[result.person.id], result.person.name)}
        <div><span>${escapeHtml(result.person.role)}</span><h1 data-final-reveal-heading tabindex="-1">${escapeHtml(result.person.name)}’s Order Reveal</h1></div>
      </div>
      <div class="final-answer-grid">${result.answers.map(answerCardMarkup).join("")}</div>
      <section class="final-diner-subtotal" aria-label="${escapeHtml(result.person.name)} subtotal"><span>${escapeHtml(result.person.name)} total</span><strong>${result.pointsEarned} / ${result.pointsPossible}</strong></section>
      <section class="final-diner-explanation"><h2>Why ${escapeHtml(result.person.name)} chose this</h2><p>${escapeHtml(result.caseNote)}</p></section>
      <div class="final-pup-speech">${photo(host.image, "Pup, Host")}<div><span>CALIBRATION READ</span><p>${escapeHtml(meaningfulCalibration(result))}</p></div></div>
      <button class="primary-button reveal-primary" id="revealNextDiner" type="button">${next ? `Reveal ${escapeHtml(next)}` : "See Final Case Score"}</button>
    </div>`;
  }

  function revealDiner444(report) {
    const index = clamp(state.finalRevealPersonIndex, 0, Math.max(0, report.personResults.length - 1));
    const result = report.personResults[index];
    if (!result) {
      state.finalRevealPhase = "final";
      state.revealStep = 5;
      render();
      return;
    }
    app.innerHTML = revealShell(dinerRevealMarkup(result, index, report), report, "diner-reveal");
    bindGlobalRevealControls();
    app.querySelector("#revealNextDiner").onclick = () => withActionGuard(() => {
      if (index < report.personResults.length - 1) {
        state.finalRevealPersonIndex = index + 1;
        state.revealStep = index + 2;
      } else {
        state.finalRevealPhase = "final";
        state.revealStep = 5;
        state.revealComplete = true;
      }
      render();
    });
    speakOnce(`diner-${result.person.id}`, `Let's see how well you read ${result.person.name}. ${result.pointsEarned} of ${result.pointsPossible} points.`);
    focusRevealHeading();
  }

  function revealAllAnswers(skipAnimations) {
    return withActionGuard(() => {
      state.finalRevealShowAll = true;
      state.finalRevealSkipAnimations = Boolean(skipAnimations) || state.finalRevealSkipAnimations;
      state.finalRevealPhase = "final";
      state.finalRevealPersonIndex = Math.max(0, diners.length - 1);
      state.revealStep = 5;
      state.revealComplete = true;
      render();
    });
  }

  function categoryBreakdownMarkup(report) {
    return `<div class="final-category-breakdown" aria-label="Final category score breakdown">${report.categoryResults.map(item => `<article><span>${escapeHtml(item.label)}</span><strong>${item.earned} / ${item.possible}</strong></article>`).join("")}</div>`;
  }

  function takeawayMarkup(item, className) {
    return `<article class="final-takeaway ${className}">
      <span>${escapeHtml(item.title)}</span>
      <h3>${escapeHtml(item.label)}</h3>
      <dl>
        <div><dt>Prediction</dt><dd>${escapeHtml(item.prediction)}</dd></div>
        <div><dt>Actual</dt><dd>${escapeHtml(item.actual)}</dd></div>
        <div><dt>Confidence</dt><dd>${item.confidence} of 5</dd></div>
        <div><dt>Points</dt><dd>${item.points ? `+${item.points}` : "0"}</dd></div>
      </dl>
      <p>${escapeHtml(item.explanation)}</p>
    </article>`;
  }

  function fullReviewMarkup(report) {
    return `<section class="final-all-answers" aria-labelledby="allAnswersTitle">
      <div class="section-heading"><div><p class="eyebrow">Complete case recap</p><h2 id="allAnswersTitle">Every Answer</h2></div></div>
      <article class="final-review-restaurant ${report.restaurantResult.correct ? "is-correct" : "is-incorrect"}">
        <div><span>Restaurant</span><strong>${escapeHtml(report.restaurantResult.actual)}</strong></div>
        <div><span>Your prediction</span><strong>${escapeHtml(report.restaurantResult.prediction)}</strong></div>
        <div><span>Result</span><strong>${report.restaurantResult.correct ? "✓ Correct" : "✕ Incorrect"} · ${report.restaurantResult.earned} / ${report.restaurantResult.possible}</strong></div>
      </article>
      ${report.personResults.map((result, index) => `<section class="final-review-person">
        <header>${photo(images.people[result.person.id], result.person.name)}<div><span>Diner ${index + 1}</span><h3>${escapeHtml(result.person.name)}</h3></div><strong>${result.pointsEarned} / ${result.pointsPossible}</strong></header>
        <div class="final-answer-grid">${result.answers.map(answerCardMarkup).join("")}</div>
      </section>`).join("")}
    </section>`;
  }

  function openMissionReport() {
    return withActionGuard(() => {
      state.screen = "missionReport";
      render();
    });
  }

  function invokeMissionAction(selector) {
    return withActionGuard(() => {
      state.screen = "missionReport";
      render();
      const action = document.querySelector(selector);
      if (action) action.click();
    });
  }

  function bindFinalActions(report) {
    app.querySelector("#viewMissionReport").onclick = openMissionReport;
    app.querySelector("#reviewEveryAnswer").onclick = () => withActionGuard(() => {
      state.finalRevealPhase = "review";
      state.finalRevealShowAll = true;
      state.revealStep = 5;
      render();
    });
    app.querySelector("#playFreshVariant").onclick = () => invokeMissionAction("#missionFreshVariant");
    app.querySelector("#replayThisCase").onclick = () => invokeMissionAction("#missionReplayEpisode");
    const save = app.querySelector("#save");
    if (save) save.onclick = saveScore;
    speakOnce("final-score", `Three diners revealed. Final score: ${report.score.earned} out of ${report.score.possible}. ${report.verdict.title}.`);
  }

  function revealFinal444(report) {
    const best = bestDeduction(report);
    const misread = biggestMisread(report);
    const board = getBoard();
    app.innerHTML = revealShell(`<div class="final-case-verdict ${escapeHtml(report.verdict.className)}">
      <p class="eyebrow">Case Complete</p>
      <h1 data-final-reveal-heading tabindex="-1">${escapeHtml(report.verdict.title)}</h1>
      <div class="final-score-monument"><strong>${report.score.earned}</strong><span>out of ${report.score.possible}</span></div>
      <p class="verdict-subtitle">${escapeHtml(report.verdict.subtitle)}</p>
      ${categoryBreakdownMarkup(report)}
      <div class="final-takeaway-grid">${takeawayMarkup(best, "best")}${takeawayMarkup(misread, misread.title === "Biggest Misread" ? "misread" : "closest")}</div>
      <div class="final-pup-speech">${photo(host.image, "Pup, Host")}<div><span>FINAL WORD</span><p>${escapeHtml(report.pupDebrief)}</p></div></div>
      <div class="final-actions final-actions-444">
        <button class="primary-button" id="viewMissionReport" type="button">View Mission Report</button>
        <button class="secondary-button" id="reviewEveryAnswer" type="button">Review Every Answer</button>
        <button class="secondary-button" id="playFreshVariant" type="button">Play Fresh Variant</button>
        <button class="ghost-button" id="replayThisCase" type="button">Replay This Case</button>
      </div>
      ${state.finalRevealShowAll ? fullReviewMarkup(report) : ""}
      <details class="score-save-panel final-local-board"><summary>Local Top Biters</summary><div class="name-entry"><input id="nickname" maxlength="18" placeholder="Your nickname" aria-label="Your nickname"><button class="secondary-button" id="save" type="button">Save Score</button></div>${board.length ? `<table class="leaderboard"><thead><tr><th>Player</th><th>Date</th><th>Score</th></tr></thead><tbody>${board.map((row, index) => `<tr><td>${index + 1}. ${escapeHtml(row.name)}</td><td>${escapeHtml(row.date)}</td><td>${row.score}</td></tr>`).join("")}</tbody></table>` : `<p>No saved scores yet. Be the first local league leader.</p>`}</details>
    </div>`, report, "final-verdict");
    state.revealComplete = true;
    state.revealScore = report.score.earned;
    bindFinalActions(report);
    focusRevealHeading();
  }

  function revealReview444(report) {
    app.innerHTML = revealShell(`<div class="final-review-mode">
      <p class="eyebrow">Static Case Recap</p>
      <h1 data-final-reveal-heading tabindex="-1">Review Every Answer</h1>
      <p>All results are shown without rerunning scoring, narration, progression, or attempt history.</p>
      ${fullReviewMarkup(report)}
      <div class="final-actions final-actions-444">
        <button class="primary-button" id="viewMissionReport" type="button">View Mission Report</button>
        <button class="secondary-button" id="backToFinalScore" type="button">Back to Final Case Score</button>
      </div>
    </div>`, report, "review-mode");
    app.querySelector("#viewMissionReport").onclick = openMissionReport;
    app.querySelector("#backToFinalScore").onclick = () => withActionGuard(() => {
      state.finalRevealPhase = "final";
      render();
    });
    focusRevealHeading();
  }

  results = function () {
    stopTimer();
    root.PupVoice?.cancel?.();
    const report = reportData();
    if (state.finalRevealPhase === "diner") revealDiner444(report);
    else if (state.finalRevealPhase === "final") revealFinal444(report);
    else if (state.finalRevealPhase === "review") revealReview444(report);
    else revealOpening444(report);
    release?.apply?.();
  };

  root.BiteBuddySprint444Runtime = Object.freeze({
    reportData,
    revealAllAnswers,
    openMissionReport,
    revealOpening444,
    revealDiner444,
    revealFinal444,
    revealReview444
  });

  render();
})(window);
