// Bite Buddy League v0.4.3.0 — Mission Report
// Additive post-game analysis layer. Existing predictions, scoring, evidence,
// conversations, persistence, and Final Reveal remain authoritative.

const MISSION_REPORT_VERSION = "v0.4.3.0";
const MISSION_REPORT_NAME = "Mission Report";
const MISSION_REPORT_SCORE_MAX = 300;

const missionReportBaseInitialState = initialState;
initialState = function () {
  return {
    ...missionReportBaseInitialState(),
    missionReportViewed: false
  };
};

state = {
  ...state,
  missionReportViewed: Boolean(state.missionReportViewed)
};

function missionReportInstallVersion() {
  document.title = `Rate My Bites — Bite Buddy League ${MISSION_REPORT_VERSION}`;
  const badge = document.querySelector("#directorCutBuild");
  if (badge) badge.innerHTML = `<span>Bite Buddy League</span><strong>${MISSION_REPORT_VERSION}</strong>`;
}

function missionReportValue(value, fallback = "Not recorded") {
  if (value === null || value === undefined || value === "") return fallback;
  return value;
}

function missionReportPercent(value, possible) {
  if (!Number.isFinite(value) || !Number.isFinite(possible) || possible <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((value / possible) * 100)));
}

function missionReportContext(text = "") {
  const value = String(text).toLowerCase();

  if (/allerg|intoler|lactose|gluten|vegetarian|vegan|religious|dietary restriction|cannot eat|can't eat/.test(value)) {
    return {
      id: "permanent",
      label: "Permanent constraint",
      lesson: "Treat permanent dietary constraints as stronger evidence than general favorites."
    };
  }

  if (/weather|temperature|degree|summer|winter|hot outside|cold outside|heat|rain|snow|season/.test(value)) {
    return {
      id: "environmental",
      label: "Environmental context",
      lesson: "Consider how weather, temperature, season, and time change a person's normal choice."
    };
  }

  if (/yesterday|last night|recent|today|this afternoon|streak|ran |run |skipped lunch|spent|earlier/.test(value)) {
    return {
      id: "recent",
      label: "Recent behavior",
      lesson: "Recent meals and activities can outweigh a person's long-term pattern."
    };
  }

  if (/driving|celebrat|group|everyone|share|budget|price|afford|deal|happy hour|organizer|whole table|nearby|close/.test(value)) {
    return {
      id: "social",
      label: "Social context",
      lesson: "Separate an individual's preference from the pressures and priorities of the whole group."
    };
  }

  if (/try something new|changing|changed|break|different|routine|mislead|confusion|unexpected/.test(value)) {
    return {
      id: "intentional",
      label: "Pattern disruption",
      lesson: "Notice when someone is deliberately breaking a familiar routine."
    };
  }

  return {
    id: "preference",
    label: "Preference or habit",
    lesson: "Balance long-term preferences with the rest of the available evidence."
  };
}

function missionReportEpisodeMeta() {
  const episode = typeof sprint4Episode !== "undefined" ? sprint4Episode : {};
  return {
    id: `episode-${missionReportValue(episode.number, 1)}`,
    number: missionReportValue(episode.number, 1),
    title: missionReportValue(episode.title, "Untitled Case"),
    date: new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    })
  };
}

function missionReportInvestigator() {
  let savedName = "";
  try {
    savedName = localStorage.getItem("rmb-investigator-name") || "";
  } catch {
    savedName = "";
  }

  const firstName = String(
    state.investigatorName ||
    state.playerName ||
    savedName ||
    "Investigator"
  ).trim().split(/\s+/)[0] || "Investigator";

  return { firstName };
}

function missionReportCandidateFromAnswer(result, answer) {
  const clue = result.person.clues?.[answer.stage] || "";
  return {
    id: `${result.person.id}-${answer.stage}`,
    personId: result.person.id,
    personName: result.person.name,
    type: answer.stage,
    label: `${result.person.name}'s ${answer.label.toLowerCase()}`,
    prediction: missionReportValue(answer.pick, "No prediction"),
    actual: missionReportValue(answer.actual, "Not available"),
    confidence: Number(answer.confidence) || 0,
    correct: Boolean(answer.correct),
    earned: Number(answer.earned) || 0,
    possible: Number(points[answer.stage]) || 0,
    clue,
    context: missionReportContext(clue)
  };
}

function missionReportRestaurantCandidate(revealData) {
  const actual = actualRestaurant();
  const predicted = restaurantFor(state.groupRestaurant);
  const clues = diners
    .map(person => person.clues?.restaurant)
    .filter(Boolean);

  return {
    id: "group-restaurant",
    personId: "group",
    personName: "The group",
    type: "restaurant",
    label: "Shared restaurant",
    prediction: missionReportValue(predicted?.name, "No prediction"),
    actual: missionReportValue(actual?.name, "Not available"),
    confidence: Number(currentConfidence("group", "restaurant")) || 0,
    correct: Boolean(revealData.restaurantCorrect),
    earned: Number(revealData.restaurantPoints) || 0,
    possible: Number(points.restaurant) || 120,
    clue: clues.join(" "),
    clues,
    context: {
      id: "social",
      label: "Group decision",
      lesson: "Read the shared restaurant as a group compromise, not as one person's favorite."
    }
  };
}

function missionReportConfidence(entries) {
  const recorded = entries.filter(item => item.confidence > 0);
  const highCorrect = recorded.filter(item => item.confidence >= 4 && item.correct);
  const highWrong = recorded.filter(item => item.confidence >= 4 && !item.correct);
  const lowCorrect = recorded.filter(item => item.confidence <= 2 && item.correct);
  const lowWrong = recorded.filter(item => item.confidence <= 2 && !item.correct);

  let summary = "Confidence incomplete";
  if (recorded.length) {
    if (highWrong.length >= 2 && lowCorrect.length) summary = "Mixed confidence";
    else if (highWrong.length >= 2) summary = "Highly overconfident";
    else if (highWrong.length) summary = "Slightly overconfident";
    else if (lowCorrect.length >= 2) summary = "Slightly underconfident";
    else if (!lowWrong.length) summary = "Well calibrated";
    else summary = "Mixed confidence";
  }

  return {
    summary,
    recorded: recorded.length,
    total: entries.length,
    groups: [
      {
        id: "high-correct",
        label: "High confidence — correct",
        items: highCorrect,
        lesson: "Strong read supported by the outcome."
      },
      {
        id: "high-wrong",
        label: "High confidence — incorrect",
        items: highWrong,
        lesson: "Certainty stayed high even though the final result differed."
      },
      {
        id: "low-correct",
        label: "Low confidence — correct",
        items: lowCorrect,
        lesson: "Your initial read was stronger than you believed."
      },
      {
        id: "low-wrong",
        label: "Low confidence — incorrect",
        items: lowWrong,
        lesson: "Your uncertainty accurately reflected a difficult read."
      }
    ]
  };
}

function missionReportBestDeduction(entries) {
  const correct = entries
    .filter(item => item.correct)
    .sort((a, b) => (b.earned - a.earned) || (b.confidence - a.confidence));

  const best = correct[0];
  if (!best) {
    return {
      label: "No correct deduction recorded",
      prediction: "—",
      actual: "—",
      confidence: 0,
      earned: 0,
      explanation: "Every completed case still creates a useful baseline."
    };
  }

  return {
    ...best,
    explanation: best.type === "restaurant"
      ? "This was the highest-value correct prediction in the case."
      : `The available ${best.context.label.toLowerCase()} clue aligned with this result.`
  };
}

function missionReportBiggestSurprise(entries) {
  const wrong = entries
    .filter(item => !item.correct)
    .sort((a, b) => (b.confidence - a.confidence) || (b.possible - a.possible));

  const surprise = wrong[0];
  if (!surprise) {
    return {
      label: "No major surprise",
      prediction: "—",
      actual: "—",
      confidence: 0,
      clue: "",
      explanation: "Your predictions matched every recorded outcome."
    };
  }

  return {
    ...surprise,
    explanation: surprise.confidence
      ? `At ${surprise.confidence}/5 confidence, this was your strongest incorrect prediction.`
      : "This was the highest-value incorrect prediction in the completed case."
  };
}

function missionReportMissedContext(entries) {
  const missed = entries.find(item => !item.correct && item.context.id !== "preference") ||
    entries.find(item => !item.correct);

  if (!missed) {
    return {
      label: "No major contextual clue missed",
      context: {
        id: "complete",
        label: "Complete read",
        lesson: "Keep comparing permanent, recent, environmental, and social clues."
      },
      prediction: "—",
      actual: "—",
      clue: "Every recorded prediction was correct."
    };
  }

  return missed;
}

function missionReportEvidence(revealData, peopleResults) {
  const items = [];

  diners.forEach(person => {
    const clue = person.clues?.restaurant;
    if (!clue) return;
    items.push({
      id: `${person.id}-restaurant-evidence`,
      personName: person.name,
      category: "Restaurant",
      text: clue,
      context: missionReportContext(clue),
      status: revealData.restaurantCorrect ? "supported" : "overlooked"
    });
  });

  peopleResults.forEach(result => {
    result.answers.forEach(answer => {
      if (!answer.clue) return;
      items.push({
        id: `${result.person.id}-${answer.type}-evidence`,
        personName: result.person.name,
        category: answer.label.replace(`${result.person.name}'s `, ""),
        text: answer.clue,
        context: answer.context,
        status: answer.correct
          ? "supported"
          : answer.context.id === "preference"
            ? "overlooked"
            : "conflicting"
      });
    });
  });

  return {
    supported: items.filter(item => item.status === "supported"),
    overlooked: items.filter(item => item.status === "overlooked"),
    conflicting: items.filter(item => item.status === "conflicting")
  };
}

function missionReportStoryMemory() {
  const memories = Array.isArray(state.storyMemory) ? state.storyMemory : [];
  const events = typeof livingDinnerStory !== "undefined" && Array.isArray(livingDinnerStory.events)
    ? livingDinnerStory.events
    : [];

  return memories.slice(0, 5).map(memory => {
    const event = events.find(item => item.id === memory.eventId);
    return {
      label: missionReportValue(memory.label, "Story moment"),
      detail: missionReportValue(event?.text, memory.type || "Recorded during the episode")
    };
  });
}

function missionReportLessons(entries, missedContext, confidenceAnalysis) {
  const lessons = [];

  if (missedContext?.context?.lesson && missedContext.context.id !== "complete") {
    lessons.push(missedContext.context.lesson);
  }

  if (entries.some(item => !item.correct && item.confidence >= 4)) {
    lessons.push("Lower confidence when the available clues conflict with your prediction.");
  }

  if (entries.some(item => item.type === "restaurant" && !item.correct)) {
    lessons.push("Treat the restaurant as a group compromise rather than one person's individual preference.");
  }

  if (!lessons.length && confidenceAnalysis.summary === "Well calibrated") {
    lessons.push("Keep combining several clues before locking a high-confidence prediction.");
  }

  if (!lessons.length) {
    lessons.push("Compare long-term habits with the immediate context before making the next call.");
  }

  return [...new Set(lessons)].slice(0, 3);
}

function missionReportDebrief(report) {
  const strongestPerson = [...report.personResults].sort((a, b) => b.pointsEarned - a.pointsEarned)[0];
  const lines = [];

  lines.push(report.restaurantResult.correct
    ? `You correctly identified ${report.restaurantResult.actual} and secured the case's largest single point award.`
    : `The group chose ${report.restaurantResult.actual}, while your prediction was ${report.restaurantResult.prediction}.`);

  if (strongestPerson) {
    lines.push(`Your strongest person read was ${strongestPerson.person.name}, with ${strongestPerson.pointsEarned} of 60 points.`);
  }

  if (report.biggestSurprise.actual !== "—") {
    lines.push(`${report.biggestSurprise.label} became the biggest surprise: you predicted ${report.biggestSurprise.prediction}, but the result was ${report.biggestSurprise.actual}.`);
  }

  lines.push(`Your confidence pattern was ${report.confidenceAnalysis.summary.toLowerCase()}.`);

  if (report.missedContext.context.id !== "complete") {
    lines.push(report.missedContext.context.lesson);
  }

  return lines.slice(0, 4).join(" ");
}

function buildMissionReportData() {
  const revealData = revealResultsData();
  const restaurantResult = missionReportRestaurantCandidate(revealData);

  const personResults = revealData.people.map(result => {
    const answers = result.answers.map(answer => missionReportCandidateFromAnswer(result, answer));
    const correctAnswers = answers.filter(answer => answer.correct);
    const wrongAnswers = answers.filter(answer => !answer.correct);
    const strongestRead = [...correctAnswers].sort((a, b) => (b.earned - a.earned) || (b.confidence - a.confidence))[0] || null;
    const largestMiss = [...wrongAnswers].sort((a, b) => (b.confidence - a.confidence) || (b.possible - a.possible))[0] || null;

    return {
      person: result.person,
      answers,
      pointsEarned: result.total,
      pointsPossible: dinerStages.reduce((sum, stage) => sum + points[stage], 0),
      correctCount: correctAnswers.length,
      strongestRead,
      largestMiss,
      caseNote: missionReportValue(result.person.why, "No additional case note was available.")
    };
  });

  const answerEntries = personResults.flatMap(result => result.answers);
  const allEntries = [restaurantResult, ...answerEntries];

  const categoryResults = [
    {
      id: "restaurant",
      label: "Restaurant",
      correct: restaurantResult.correct ? 1 : 0,
      total: 1,
      earned: restaurantResult.earned,
      possible: restaurantResult.possible
    },
    ...dinerStages.map(stage => {
      const entries = answerEntries.filter(item => item.type === stage);
      return {
        id: stage,
        label: labels[stage],
        correct: entries.filter(item => item.correct).length,
        total: entries.length,
        earned: entries.reduce((sum, item) => sum + item.earned, 0),
        possible: entries.reduce((sum, item) => sum + item.possible, 0)
      };
    })
  ];

  const confidenceAnalysis = missionReportConfidence(allEntries);
  const bestDeduction = missionReportBestDeduction(allEntries);
  const biggestSurprise = missionReportBiggestSurprise(allEntries);
  const missedContext = missionReportMissedContext(allEntries);
  const evidenceReview = missionReportEvidence(revealData, personResults);
  const storyMemory = missionReportStoryMemory();
  const lessons = missionReportLessons(allEntries, missedContext, confidenceAnalysis);
  const verdict = revealVerdict(state.score);

  const report = {
    version: MISSION_REPORT_VERSION,
    versionName: MISSION_REPORT_NAME,
    episode: missionReportEpisodeMeta(),
    investigator: missionReportInvestigator(),
    verdict,
    score: {
      earned: Number(state.score) || 0,
      possible: MISSION_REPORT_SCORE_MAX,
      percentage: missionReportPercent(Number(state.score) || 0, MISSION_REPORT_SCORE_MAX)
    },
    categoryResults,
    restaurantResult,
    personResults,
    bestDeduction,
    biggestSurprise,
    missedContext,
    evidenceReview,
    confidenceAnalysis,
    storyMemory,
    lessons
  };

  report.pupDebrief = missionReportDebrief(report);
  return report;
}

function missionReportConfidenceLabel(value) {
  return value ? `${value}/5` : "Not recorded";
}

function missionReportOutcomeMarkup(item) {
  return `<span class="mission-outcome ${item.correct ? "is-correct" : "is-wrong"}">${item.correct ? "✓ Correct" : "✕ Incorrect"}</span>`;
}

function missionReportMetricMarkup(metric) {
  const percentage = missionReportPercent(metric.earned, metric.possible);
  return `<article class="mission-metric">
    <div class="mission-metric-heading">
      <span>${escapeHtml(metric.label)}</span>
      <strong>${metric.earned} / ${metric.possible}</strong>
    </div>
    <p>${metric.correct} of ${metric.total} correct</p>
    <div class="mission-progress" role="progressbar" aria-label="${escapeHtml(metric.label)} points" aria-valuemin="0" aria-valuemax="${metric.possible}" aria-valuenow="${metric.earned}">
      <span style="width:${percentage}%"></span>
    </div>
  </article>`;
}

function missionReportMomentMarkup(title, item, className) {
  return `<article class="mission-moment ${className}">
    <span>${escapeHtml(title)}</span>
    <h3>${escapeHtml(item.label)}</h3>
    <dl>
      <div><dt>Prediction</dt><dd>${escapeHtml(item.prediction)}</dd></div>
      <div><dt>Actual</dt><dd>${escapeHtml(item.actual)}</dd></div>
      <div><dt>Confidence</dt><dd>${escapeHtml(missionReportConfidenceLabel(item.confidence))}</dd></div>
    </dl>
    <p>${escapeHtml(item.explanation || item.context?.lesson || "No additional explanation was available.")}</p>
  </article>`;
}

function missionReportEvidenceGroup(title, items, className) {
  return `<section class="mission-evidence-group ${className}">
    <h3>${escapeHtml(title)}</h3>
    ${items.length ? `<div class="mission-evidence-list">${items.map(item => `<article>
      <div><span>${escapeHtml(item.personName)}</span><strong>${escapeHtml(item.category)}</strong></div>
      <p>${escapeHtml(item.text)}</p>
      <small>${escapeHtml(item.context.label)}</small>
    </article>`).join("")}</div>` : `<p class="mission-empty">No evidence fell into this group.</p>`}
  </section>`;
}

function missionReportConfidenceGroup(group) {
  return `<article class="mission-confidence-card">
    <h3>${escapeHtml(group.label)}</h3>
    ${group.items.length ? group.items.map(item => `<div class="mission-confidence-row">
      <div><strong>${escapeHtml(item.label)}</strong><span>${escapeHtml(item.prediction)} → ${escapeHtml(item.actual)}</span></div>
      <em>${item.confidence}/5</em>
    </div>`).join("") : `<p class="mission-empty">No predictions in this group.</p>`}
    <small>${escapeHtml(group.lesson)}</small>
  </article>`;
}

function missionReportPersonMarkup(result) {
  const strongest = result.strongestRead
    ? `${result.strongestRead.label} (${result.strongestRead.earned} points)`
    : "No correct read recorded";
  const miss = result.largestMiss
    ? `${result.largestMiss.label} (${missionReportConfidenceLabel(result.largestMiss.confidence)} confidence)`
    : "No missed read recorded";

  return `<article class="mission-person-card">
    <header>
      ${photo(images.people[result.person.id], result.person.name)}
      <div><span>${escapeHtml(result.person.role)}</span><h3>${escapeHtml(result.person.name)}</h3></div>
      <strong>${result.pointsEarned} / ${result.pointsPossible}</strong>
    </header>
    <div class="mission-person-answers">
      ${result.answers.map(answer => `<div>
        <div><span>${escapeHtml(answer.label.replace(`${result.person.name}'s `, ""))}</span>${missionReportOutcomeMarkup(answer)}</div>
        <p><strong>Your call:</strong> ${escapeHtml(answer.prediction)}</p>
        <p><strong>Actual:</strong> ${escapeHtml(answer.actual)}</p>
        <small>Confidence: ${escapeHtml(missionReportConfidenceLabel(answer.confidence))}</small>
      </div>`).join("")}
    </div>
    <dl class="mission-person-summary">
      <div><dt>Strongest read</dt><dd>${escapeHtml(strongest)}</dd></div>
      <div><dt>Largest miss</dt><dd>${escapeHtml(miss)}</dd></div>
    </dl>
    <p class="mission-case-note"><strong>Case note:</strong> ${escapeHtml(result.caseNote)}</p>
  </article>`;
}

function renderMissionReport() {
  const report = buildMissionReportData();
  const firstOpen = !state.missionReportViewed;
  state.missionReportViewed = true;

  app.innerHTML = `<article class="mission-report ${firstOpen ? "mission-report-first-open" : ""}">
    <header class="mission-report-header">
      <div class="mission-classification">
        <span>League Confidential</span>
        <strong>${MISSION_REPORT_VERSION}</strong>
      </div>
      <p class="eyebrow">Post-game intelligence debrief</p>
      <h1 tabindex="-1">MISSION REPORT</h1>
      <div class="mission-header-meta">
        <div><span>Episode</span><strong>${escapeHtml(String(report.episode.number).padStart(3, "0"))} · ${escapeHtml(report.episode.title)}</strong></div>
        <div><span>Investigation date</span><strong>${escapeHtml(report.episode.date)}</strong></div>
        <div><span>Lead Investigator</span><strong>${escapeHtml(report.investigator.firstName)}</strong></div>
        <div><span>Host</span><strong>Pup</strong></div>
      </div>
      <div class="mission-verdict ${escapeHtml(report.verdict.className)}">
        <div>
          <span>Case verdict</span>
          <strong>${escapeHtml(report.verdict.title)}</strong>
          <p>${escapeHtml(report.verdict.subtitle)}</p>
        </div>
        <div class="mission-score">
          <strong>${report.score.earned}</strong>
          <span>out of ${report.score.possible}</span>
          <small>${report.score.percentage}% of available points</small>
        </div>
      </div>
    </header>

    <section class="mission-section" aria-labelledby="missionPerformanceTitle">
      <div class="mission-section-heading">
        <span>01</span>
        <div><p>Case summary</p><h2 id="missionPerformanceTitle">Performance Breakdown</h2></div>
      </div>
      <div class="mission-metrics">${report.categoryResults.map(missionReportMetricMarkup).join("")}</div>
    </section>

    <section class="mission-section mission-pup-debrief" aria-labelledby="missionDebriefTitle">
      ${photo(host.image, "Pup, Host")}
      <div>
        <span>Host Debrief</span>
        <h2 id="missionDebriefTitle">Pup's assessment</h2>
        <p>${escapeHtml(report.pupDebrief)}</p>
      </div>
    </section>

    <section class="mission-section" aria-labelledby="missionMomentsTitle">
      <div class="mission-section-heading">
        <span>02</span>
        <div><p>Critical findings</p><h2 id="missionMomentsTitle">Biggest Moments</h2></div>
      </div>
      <div class="mission-moments">
        ${missionReportMomentMarkup("Best deduction", report.bestDeduction, "best")}
        ${missionReportMomentMarkup("Biggest surprise", report.biggestSurprise, "surprise")}
        <article class="mission-moment context">
          <span>Clue that changed the case</span>
          <h3>${escapeHtml(report.missedContext.context.label)}</h3>
          <p class="mission-quoted-clue">${escapeHtml(report.missedContext.clue || "No contextual clue was available for this result.")}</p>
          <dl>
            <div><dt>Prediction</dt><dd>${escapeHtml(report.missedContext.prediction)}</dd></div>
            <div><dt>Actual</dt><dd>${escapeHtml(report.missedContext.actual)}</dd></div>
          </dl>
          <p>${escapeHtml(report.missedContext.context.lesson)}</p>
        </article>
      </div>
    </section>

    <section id="missionEvidence" class="mission-section" aria-labelledby="missionEvidenceTitle">
      <div class="mission-section-heading">
        <span>03</span>
        <div><p>Evidence audit</p><h2 id="missionEvidenceTitle">Evidence Review</h2></div>
      </div>
      <p class="mission-section-intro">The simulation does not track which clue you consciously used. These groups compare the available evidence with the completed outcomes without claiming hidden player telemetry.</p>
      <div class="mission-evidence-grid">
        ${missionReportEvidenceGroup("Evidence aligned with correct results", report.evidenceReview.supported, "supported")}
        ${missionReportEvidenceGroup("Evidence that may have been overlooked", report.evidenceReview.overlooked, "overlooked")}
        ${missionReportEvidenceGroup("Evidence that conflicted with a prediction", report.evidenceReview.conflicting, "conflicting")}
      </div>
    </section>

    <section id="missionConfidence" class="mission-section" aria-labelledby="missionConfidenceTitle">
      <div class="mission-section-heading">
        <span>04</span>
        <div><p>Calibration audit</p><h2 id="missionConfidenceTitle">Confidence Analysis</h2></div>
      </div>
      <div class="mission-calibration-summary">
        <span>Overall pattern</span>
        <strong>${escapeHtml(report.confidenceAnalysis.summary)}</strong>
        <small>${report.confidenceAnalysis.recorded} of ${report.confidenceAnalysis.total} confidence values recorded</small>
      </div>
      <div class="mission-confidence-grid">${report.confidenceAnalysis.groups.map(missionReportConfidenceGroup).join("")}</div>
    </section>

    <section class="mission-section" aria-labelledby="missionRestaurantTitle">
      <div class="mission-section-heading">
        <span>05</span>
        <div><p>Group decision</p><h2 id="missionRestaurantTitle">Restaurant Finding</h2></div>
      </div>
      <article class="mission-restaurant-card">
        <div>
          <span>Predicted restaurant</span>
          <strong>${escapeHtml(report.restaurantResult.prediction)}</strong>
        </div>
        <div>
          <span>Actual restaurant</span>
          <strong>${escapeHtml(report.restaurantResult.actual)}</strong>
        </div>
        <div>
          ${missionReportOutcomeMarkup(report.restaurantResult)}
          <strong>${report.restaurantResult.earned} / ${report.restaurantResult.possible} points</strong>
          <small>Confidence: ${escapeHtml(missionReportConfidenceLabel(report.restaurantResult.confidence))}</small>
        </div>
        <details>
          <summary>Review the group clues</summary>
          <ul>${report.restaurantResult.clues.map(clue => `<li>${escapeHtml(clue)}</li>`).join("")}</ul>
        </details>
      </article>
    </section>

    <section class="mission-section" aria-labelledby="missionPeopleTitle">
      <div class="mission-section-heading">
        <span>06</span>
        <div><p>Individual findings</p><h2 id="missionPeopleTitle">Person-by-Person Report</h2></div>
      </div>
      <div class="mission-people">${report.personResults.map(missionReportPersonMarkup).join("")}</div>
    </section>

    <section id="missionStory" class="mission-section" aria-labelledby="missionStoryTitle">
      <div class="mission-section-heading">
        <span>07</span>
        <div><p>Episode record</p><h2 id="missionStoryTitle">Story Memory</h2></div>
      </div>
      ${report.storyMemory.length ? `<ol class="mission-story-list">${report.storyMemory.map(memory => `<li><strong>${escapeHtml(memory.label)}</strong><p>${escapeHtml(memory.detail)}</p></li>`).join("")}</ol>` : `<p class="mission-empty mission-empty-large">No conversation memories were recorded for this completed state.</p>`}
    </section>

    <section class="mission-section mission-lessons" aria-labelledby="missionLessonsTitle">
      <div class="mission-section-heading">
        <span>08</span>
        <div><p>Next investigation</p><h2 id="missionLessonsTitle">Lessons for the Next Case</h2></div>
      </div>
      <ol>${report.lessons.map(lesson => `<li>${escapeHtml(lesson)}</li>`).join("")}</ol>
    </section>

    <aside class="mission-development" aria-label="Future detective progression preview">
      <span>Detective Development</span>
      <strong>Case experience recorded</strong>
      <p>Future sprints can add case difficulty, detective levels, skills, and unlocks without changing this report format.</p>
    </aside>

    <footer class="mission-report-actions">
      <button class="primary-button" id="missionReviewReveal" type="button">Review Final Reveal</button>
      <button class="secondary-button" id="missionReviewConversations" type="button">Review Conversations</button>
      <button class="secondary-button" id="missionReviewEvidence" type="button">Review Evidence</button>
      <button class="secondary-button" id="missionReplayEpisode" type="button">Replay Episode</button>
      <button class="ghost-button" id="missionReturnHome" type="button">Return Home</button>
    </footer>
  </article>`;

  document.querySelector("#missionReviewReveal").onclick = () => {
    state.screen = "results";
    state.revealStep = Math.max(5, Number(state.revealStep) || 0);
    state.revealComplete = true;
    render();
  };

  document.querySelector("#missionReviewConversations").onclick = () => {
    document.querySelector("#missionStory")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  document.querySelector("#missionReviewEvidence").onclick = () => {
    document.querySelector("#missionEvidence")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  document.querySelector("#missionReplayEpisode").onclick = () => {
    stopTimer();
    if (typeof stopConversationMedia === "function") stopConversationMedia();
    if (typeof stopBriefingMedia === "function") stopBriefingMedia();
    document.querySelector(".person-modal")?.remove();
    document.body.classList.remove("modal-open");
    state = initialState();
    state.screen = "planner";
    render();
  };

  document.querySelector("#missionReturnHome").onclick = reset;
}

const missionReportBaseRevealFinale = revealFinale;
revealFinale = function (data) {
  missionReportBaseRevealFinale(data);
  const button = document.querySelector(".mission-disabled");
  if (!button) return;

  button.disabled = false;
  button.removeAttribute("title");
  button.className = "primary-button mission-report-entry";
  button.id = "openMissionReport";
  button.textContent = "OPEN MISSION REPORT";
  button.onclick = () => {
    state.screen = "missionReport";
    render();
  };

  const actions = button.closest(".final-actions");
  if (actions) actions.prepend(button);
};

const missionReportBaseRender = render;
render = function () {
  if (state.screen === "missionReport") {
    stopTimer();
    if (typeof stopConversationMedia === "function") stopConversationMedia();
    if (typeof stopBriefingMedia === "function") stopBriefingMedia();
    restartButton.classList.remove("hidden");
    app.classList.remove("screen-enter");
    void app.offsetWidth;
    app.classList.add("screen-enter");
    renderMissionReport();
    missionReportInstallVersion();
    return;
  }

  missionReportBaseRender();
  missionReportInstallVersion();
};

missionReportInstallVersion();
render();
