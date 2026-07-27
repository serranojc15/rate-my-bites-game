// Bite Buddy League v0.4.4.5 — Mission Report Payoff & Replay Momentum.
(function (root) {
  "use strict";

  const progressionApi = root.BiteBuddyProgression;
  const leaderboardApi = root.BiteBuddyGroupLeaderboard;
  const casesApi = root.BiteBuddyCases;
  const release = root.BiteBuddyRelease;
  const HISTORY_KEY = progressionApi?.historyKey || "bite-buddy-case-history-v1";

  const clone = value => JSON.parse(JSON.stringify(value));
  const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const skillOrder = Object.freeze({ new: 0, developing: 1, reliable: 2, strong: 3, expert: 4 });
  const attemptLabels = Object.freeze({
    "first-attempt": "First Attempt",
    "fresh-variant": "Fresh Variant",
    "same-variant-replay": "Practice Replay"
  });
  const skillCopy = Object.freeze({
    recentBehavior: "You compared recent meals and activity with longer-term habits.",
    permanentConstraints: "You treated lasting dietary constraints as stronger than casual preferences.",
    groupDynamics: "You separated individual preferences from the pressures shaping the whole table.",
    patternChanges: "You looked for evidence that someone was deliberately breaking a familiar pattern.",
    contextualFactors: "You weighed tonight-specific circumstances alongside general preferences.",
    confidenceCalibration: "You matched certainty more closely to the strength of the available evidence."
  });

  function attemptTypeLabel(type) {
    return attemptLabels[type] || "Completed Investigation";
  }

  function loadHistory() {
    try {
      const parsed = JSON.parse(root.localStorage?.getItem?.(HISTORY_KEY) || "null");
      return parsed && Array.isArray(parsed.attempts) ? parsed : { attempts: [] };
    } catch {
      return { attempts: [] };
    }
  }

  function currentAttempt(history = loadHistory()) {
    return history.attempts.at(-1) || null;
  }

  function currentAward(progression, attempt) {
    if (!progression) return null;
    const exact = attempt?.attemptId
      ? progression.awards?.find?.(award => award.attemptId === attempt.attemptId)
      : null;
    return exact || progression.lastAward || null;
  }

  function groupedXpBreakdown(award) {
    const rows = [];
    const byKey = new Map();
    const friendly = label => {
      if (/Correct Entr/i.test(label)) return ["meal", "Entrée deductions"];
      if (/Correct Drink/i.test(label)) return ["drink", "Drink deductions"];
      if (/Correct Dessert/i.test(label)) return ["dessert", "Dessert deductions"];
      if (/Correct Restaurant/i.test(label)) return ["restaurant", "Restaurant prediction"];
      if (/Confidence Calibration/i.test(label)) return ["confidence", "Confidence calibration"];
      if (/First Attempt Completed/i.test(label)) return ["first", "First attempt completed"];
      if (/Fresh Variant Completed/i.test(label)) return ["fresh", "Fresh variant completed"];
      if (/Replay Practice Completed/i.test(label)) return ["replay", "Practice replay completed"];
      if (/Fresh-Variant Improvement/i.test(label)) return ["fresh-improved", "Improved fresh-case score"];
      if (/Fresh-Variant Consistency/i.test(label)) return ["fresh-equal", "Matched first-case score on a fresh variant"];
      if (/Fresh-Variant Completion/i.test(label)) return ["fresh-lower", "Completed a lower-scoring fresh variant"];
      if (/First Fresh Variant Milestone/i.test(label)) return ["fresh-milestone", "First fresh-variant milestone"];
      if (/Near-Perfect Investigation/i.test(label)) return ["near-perfect", "Near-perfect investigation"];
      return [`other-${label}`, label];
    };

    (award?.breakdown || []).forEach(item => {
      const xp = Math.max(0, Math.floor(finite(item?.xp, 0)));
      if (!xp) return;
      const [key, label] = friendly(String(item.label || "Awarded XP"));
      if (!byKey.has(key)) {
        const row = { key, label, xp: 0 };
        byKey.set(key, row);
        rows.push(row);
      }
      byKey.get(key).xp += xp;
    });

    const expected = Math.max(0, Math.floor(finite(award?.xp, 0)));
    const grouped = rows.reduce((sum, row) => sum + row.xp, 0);
    if (expected > grouped) rows.push({ key: "other-awarded", label: "Other awarded XP", xp: expected - grouped });
    return { rows, total: expected };
  }

  function skillIdForEntry(entry) {
    const definitions = progressionApi?.skillDefinitions || {};
    const contextId = entry?.context?.id;
    return Object.keys(definitions).find(id => id !== "confidenceCalibration" && definitions[id].contextIds?.includes?.(contextId)) || "contextualFactors";
  }

  function progressionBeforeAttempt(progression, report, award, attempt, history = loadHistory()) {
    const before = clone(progression || {});
    before.totalXp = Math.max(0, finite(before.totalXp, 0) - finite(award?.xp, 0));
    before.skills = clone(before.skills || {});

    (progressionApi?.reportEntries?.(report) || []).forEach(entry => {
      const id = skillIdForEntry(entry);
      const skill = before.skills[id] || { correct: 0, attempted: 0 };
      skill.attempted = Math.max(0, finite(skill.attempted, 0) - 1);
      if (entry.correct) skill.correct = Math.max(0, finite(skill.correct, 0) - 1);
      before.skills[id] = skill;

      if (finite(entry.confidence, 0) > 0) {
        const calibration = before.skills.confidenceCalibration || { correct: 0, attempted: 0 };
        calibration.attempted = Math.max(0, finite(calibration.attempted, 0) - 1);
        const calibrated = (entry.correct && finite(entry.confidence, 0) >= 3) || (!entry.correct && finite(entry.confidence, 0) <= 3);
        if (calibrated) calibration.correct = Math.max(0, finite(calibration.correct, 0) - 1);
        before.skills.confidenceCalibration = calibration;
      }
    });

    if (attempt?.attemptType === "first-attempt") before.completedFirstAttempts = Math.max(0, finite(before.completedFirstAttempts, 0) - 1);
    if (attempt?.attemptType === "fresh-variant") before.completedFreshVariants = Math.max(0, finite(before.completedFreshVariants, 0) - 1);
    if (attempt?.attemptType === "same-variant-replay") before.completedReplays = Math.max(0, finite(before.completedReplays, 0) - 1);

    const priorAttempts = (history.attempts || []).filter(item => item !== attempt && (!attempt?.attemptId || item.attemptId !== attempt.attemptId));
    const priorFresh = priorAttempts.filter(item => item.attemptType === "fresh-variant").map(item => finite(item.score, 0));
    before.bestFreshVariantScore = priorFresh.length ? Math.max(...priorFresh) : null;
    const priorFirst = priorAttempts.find(item => item.attemptType === "first-attempt") || null;
    before.firstAttemptScore = priorFirst ? finite(priorFirst.score, 0) : null;
    before.rankId = progressionApi?.getRank?.(before.totalXp, progressionApi?.ranks?.[0]?.id)?.id || before.rankId;
    return before;
  }

  function relevantPreviousAttempt(history, attempt) {
    const attempts = history?.attempts || [];
    const prior = attempts.filter(item => item !== attempt && (!attempt?.attemptId || item.attemptId !== attempt.attemptId));
    if (!attempt) return null;
    if (attempt.attemptType === "fresh-variant") {
      return [...prior].reverse().find(item => ["first-attempt", "fresh-variant"].includes(item.attemptType)) || null;
    }
    if (attempt.attemptType === "same-variant-replay") {
      return [...prior].reverse().find(item => item.variantId === attempt.variantId) || null;
    }
    return null;
  }

  function previousInvestigationComparison(report, history, attempt, progression, before, award) {
    const rows = [];
    const previous = relevantPreviousAttempt(history, attempt);
    const score = finite(report?.score?.earned, finite(attempt?.score, 0));

    if (!previous) {
      rows.push({ label: "Case score", value: "First qualifying comparison", detail: "No earlier comparable investigation is available." });
    } else {
      const difference = score - finite(previous.score, 0);
      rows.push({
        label: "Case score",
        value: difference > 0 ? `+${difference}` : difference < 0 ? String(difference) : "No change",
        detail: difference > 0 ? "Higher than the previous comparable investigation." : difference < 0 ? "Lower than the previous comparable investigation." : "Matched the previous comparable investigation."
      });
    }

    if (attempt?.attemptType === "fresh-variant") {
      const previousFresh = (history?.attempts || [])
        .filter(item => item !== attempt && item.attemptType === "fresh-variant" && (!attempt.attemptId || item.attemptId !== attempt.attemptId))
        .map(item => finite(item.score, 0));
      if (!previousFresh.length) rows.push({ label: "Best fresh score", value: "New baseline", detail: `${score} / 300 establishes the first fresh-case result.` });
      else {
        const priorBest = Math.max(...previousFresh);
        rows.push({
          label: "Best fresh score",
          value: score > priorBest ? "New record" : score === priorBest ? "Record matched" : "Record unchanged",
          detail: `Previous best: ${priorBest} / 300.`
        });
      }
    } else if (attempt?.attemptType === "same-variant-replay") {
      rows.push({ label: "Transfer evidence", value: "Practice only", detail: "A same-case replay is not counted as fresh proof of mastery." });
    }

    const currentRank = progressionApi?.getRank?.(progression?.totalXp, progression?.rankId);
    const previousRank = progressionApi?.getRank?.(before?.totalXp, before?.rankId);
    if (currentRank && previousRank) {
      rows.push({
        label: "Detective rank",
        value: currentRank.id === previousRank.id ? currentRank.name : `${previousRank.name} → ${currentRank.name}`,
        detail: currentRank.id === previousRank.id ? "Rank unchanged this case." : "Rank advanced from the awarded XP."
      });
    }

    const currentConfidence = progressionApi?.getSkillSummary?.(progression)?.find(skill => skill.id === "confidenceCalibration");
    const priorConfidence = progressionApi?.getSkillSummary?.(before)?.find(skill => skill.id === "confidenceCalibration");
    if (currentConfidence && priorConfidence) {
      rows.push({
        label: "Confidence Calibration",
        value: currentConfidence.level.id === priorConfidence.level.id ? currentConfidence.level.label : `${priorConfidence.level.label} → ${currentConfidence.level.label}`,
        detail: currentConfidence.level.id === priorConfidence.level.id ? "No skill-level change this case." : "Calibration evidence changed the skill level."
      });
    }

    rows.push({ label: "Total XP", value: `+${Math.max(0, finite(award?.xp, 0))} XP`, detail: `${Math.max(0, finite(progression?.totalXp, 0))} XP total.` });
    return rows;
  }

  function detectiveDevelopment(progression, before) {
    const currentSkills = progressionApi?.getSkillSummary?.(progression) || [];
    const previousSkills = progressionApi?.getSkillSummary?.(before) || [];
    const previousById = Object.fromEntries(previousSkills.map(skill => [skill.id, skill]));
    const strongest = progressionApi?.strongestSkill?.(progression) || null;
    const improved = currentSkills
      .filter(skill => (skillOrder[skill.level.id] ?? 0) > (skillOrder[previousById[skill.id]?.level?.id] ?? 0))
      .sort((a, b) => (skillOrder[b.level.id] - skillOrder[a.level.id]) || (b.attempted - a.attempted))[0] || null;
    const needsEvidence = [...currentSkills].sort((a, b) => (a.attempted - b.attempted) || (a.level.percent - b.level.percent))[0] || null;
    return {
      strongest,
      improved,
      needsEvidence,
      skills: currentSkills,
      explanation: id => skillCopy[id] || "More completed investigations will make this skill easier to evaluate."
    };
  }

  function nextMissionRecommendation(progression, attemptType, unlockState, skillSummary) {
    const unlocks = unlockState || progressionApi?.getUnlockState?.(progression) || {};
    const skills = skillSummary || progressionApi?.getSkillSummary?.(progression) || [];
    const confidence = skills.find(skill => skill.id === "confidenceCalibration");

    if (finite(progression?.completedFirstAttempts, 0) === 0) {
      return { id: "first", title: "Complete your first investigation", reason: "One completed case creates the baseline for every future comparison.", target: "first-attempt", action: "Return to League Home" };
    }
    if (finite(progression?.completedFreshVariants, 0) === 0) {
      return { id: "fresh", title: "Play a fresh variant", reason: "A new group tests whether your reasoning transfers beyond familiar answers.", target: "fresh-transfer", action: "Play Fresh Variant" };
    }

    const intermediateRequirements = unlocks.intermediate?.requirements || [];
    const unmetIntermediate = intermediateRequirements.filter(item => !item.met);
    if (!unlocks.intermediate?.unlocked && unmetIntermediate.length === 1) {
      return { id: "intermediate", title: "Finish the next Intermediate requirement", reason: unmetIntermediate[0].label, target: "intermediate-unlock", action: "Play Fresh Variant" };
    }

    if (confidence && ["new", "developing"].includes(confidence.level.id)) {
      return { id: "calibration", title: "Strengthen confidence calibration", reason: "On the next fresh case, match confidence to how strong and consistent the evidence really is.", target: "confidence-calibration", action: "Play Fresh Variant" };
    }

    if (finite(progression?.completedFreshVariants, 0) < 3 || attemptType === "same-variant-replay") {
      return { id: "fresh", title: "Play another fresh variant", reason: "More fresh groups provide stronger evidence that your reads transfer.", target: "fresh-transfer", action: "Play Fresh Variant" };
    }

    return { id: "fresh", title: "Play a fresh variant", reason: "Fresh evidence is the best way to keep building detective skill and rank progress.", target: "long-term-progression", action: "Play Fresh Variant" };
  }

  function groupUpdate(api = leaderboardApi) {
    if (!api) return null;
    const ranked = api.getRankedMembers?.() || [];
    const position = api.getLocalPosition?.() || { position: ranked.length, total: ranked.length };
    const localIndex = ranked.findIndex(member => member.userId === "local-player");
    const local = localIndex >= 0 ? ranked[localIndex] : api.getLocalMember?.();
    const above = localIndex > 0 ? ranked[localIndex - 1] : null;
    const gap = above && local ? Math.max(0, finite(above.totalXp, 0) - finite(local.totalXp, 0)) : 0;
    return {
      position: position.position,
      total: position.total,
      local,
      above,
      gap,
      leader: api.getGroupLeader?.() || ranked[0] || local
    };
  }

  root.BiteBuddySprint445 = Object.freeze({
    version: release?.version || "v0.4.4.5",
    attemptTypeLabel,
    groupedXpBreakdown,
    progressionBeforeAttempt,
    previousInvestigationComparison,
    detectiveDevelopment,
    nextMissionRecommendation,
    groupUpdate
  });

  if (
    typeof document === "undefined" ||
    typeof renderMissionReport !== "function" ||
    typeof buildMissionReportData !== "function" ||
    !progressionApi
  ) return;

  if (typeof initialState === "function") {
    const baseInitialState445 = initialState;
    initialState = function () {
      return { ...baseInitialState445(), missionPayoffNarrated: false };
    };
  }
  state = { ...state, missionPayoffNarrated: Boolean(state.missionPayoffNarrated) };

  function safe(value) {
    return typeof root.escapeHtml === "function"
      ? root.escapeHtml(String(value ?? ""))
      : String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  }

  function captureExistingActions() {
    return {
      fresh: document.querySelector("#missionFreshVariant"),
      replay: document.querySelector("#missionReplayEpisode"),
      home: document.querySelector("#missionReturnHome"),
      voice: document.querySelector("#pupVoiceStudioButton")
    };
  }

  function captureCelebrations() {
    return {
      ranks: [...document.querySelectorAll(".rank-up-notice")].map(item => ({ title: item.querySelector("h3")?.textContent || "Rank advanced", copy: item.querySelector("p")?.textContent || "Your detective rank advanced." })),
      unlocks: [...document.querySelectorAll(".unlock-notice")].map(item => ({ title: item.querySelector("h3")?.textContent || "Difficulty unlocked", copy: item.querySelector("p")?.textContent || "A new difficulty tier is now unlocked.", note: item.querySelector("small")?.textContent || "The playable case is planned for a future sprint." }))
    };
  }

  function rankProgressMarkup(progression) {
    const progress = progressionApi.getRankProgress(progression);
    const maximum = progress.next ? progress.maximum : Math.max(1, progress.current.minimumXp);
    const minimum = progress.next ? progress.minimum : 0;
    const value = progress.next ? progress.value : maximum;
    return `<div class="mission-payoff-rank-progress">
      <div><span>${progress.next ? `Progress to ${safe(progress.next.name)}` : "Highest rank reached"}</span><strong>${finite(progression.totalXp).toLocaleString()}${progress.next ? ` / ${progress.next.minimumXp.toLocaleString()} XP` : " XP"}</strong></div>
      <div class="mission-payoff-progress" role="progressbar" aria-label="${progress.next ? `Progress toward ${safe(progress.next.name)}` : "Highest detective rank reached"}" aria-valuemin="${minimum}" aria-valuemax="${maximum}" aria-valuenow="${value}"><span style="width:${progress.percent}%"></span></div>
      <small>${progress.next ? `${Math.max(0, progress.next.minimumXp - progression.totalXp).toLocaleString()} XP to next rank` : "Detective rank complete"}</small>
    </div>`;
  }

  function celebrationsMarkup(celebrations) {
    const ranks = celebrations.ranks.map(item => `<article class="mission-payoff-celebration rank"><span>Rank advanced</span><h2>${safe(item.title)}</h2><p>${safe(item.copy)}</p></article>`).join("");
    const unlocks = celebrations.unlocks.map(item => `<article class="mission-payoff-celebration unlock"><span>Difficulty unlocked</span><h2>${safe(item.title)}</h2><p>${safe(item.copy)}</p><small>${safe(item.note)}</small></article>`).join("");
    return ranks || unlocks ? `<section class="mission-payoff-celebrations" aria-label="New progression achievements">${ranks}${unlocks}</section>` : "";
  }

  function xpMarkup(award, attempt) {
    const grouped = groupedXpBreakdown(award);
    const rows = grouped.rows.length
      ? `<dl class="mission-payoff-xp-list">${grouped.rows.map(row => `<div><dt>${safe(row.label)}</dt><dd>+${row.xp} XP</dd></div>`).join("")}<div class="total"><dt>Total XP earned</dt><dd>+${grouped.total} XP</dd></div></dl>`
      : `<p class="mission-payoff-empty">No additional XP was awarded for this completed attempt.</p>`;
    let explanation = "";
    if (attempt?.attemptType === "same-variant-replay" && grouped.total > 0) explanation = "Same-case replays provide limited practice XP. Fresh variants are the best test of transferable reasoning.";
    if (attempt?.attemptType === "same-variant-replay" && grouped.total === 0) explanation = "This replay did not add XP because practice credit for this variant was already awarded.";
    return `<section class="mission-payoff-section" aria-labelledby="missionXpTitle"><div class="mission-payoff-heading"><p>Progression accounting</p><h2 id="missionXpTitle">XP Breakdown</h2></div>${rows}${explanation ? `<p class="mission-payoff-note">${safe(explanation)}</p>` : ""}</section>`;
  }

  function comparisonMarkup(rows) {
    return `<section class="mission-payoff-section" aria-labelledby="missionComparisonTitle"><div class="mission-payoff-heading"><p>Stored comparison</p><h2 id="missionComparisonTitle">Since Your Last Investigation</h2></div><div class="mission-payoff-comparison">${rows.map(row => `<article><span>${safe(row.label)}</span><strong>${safe(row.value)}</strong><p>${safe(row.detail)}</p></article>`).join("")}</div></section>`;
  }

  function developmentMarkup(development) {
    const item = (label, skill, fallback) => `<article><span>${label}</span><strong>${skill ? `${safe(skill.label)} · ${safe(skill.level.label)}` : fallback}</strong><p>${skill ? safe(development.explanation(skill.id)) : "More qualifying cases are needed before this can be identified reliably."}</p></article>`;
    return `<section class="mission-payoff-section" aria-labelledby="missionDevelopmentTitle"><div class="mission-payoff-heading"><p>Long-term evidence</p><h2 id="missionDevelopmentTitle">Detective Development</h2></div><div class="mission-payoff-development">
      ${item("Strongest skill", development.strongest, "Not enough evidence yet")}
      ${item("Improved this case", development.improved, "No skill level changed this case")}
      ${item("Needs more evidence", development.needsEvidence, "Complete another investigation")}
    </div><details class="mission-payoff-all-skills"><summary>View all six detective skills</summary><div>${development.skills.map(skill => `<p><span>${safe(skill.label)}</span><strong>${safe(skill.level.label)}</strong><small>${skill.correct} of ${skill.attempted} associated predictions correct</small></p>`).join("")}</div></details></section>`;
  }

  function groupMarkup(group) {
    if (!group) return "";
    const status = group.position === 1
      ? "You currently lead the simulated group."
      : group.above
        ? `${group.gap.toLocaleString()} XP behind ${safe(group.above.displayName)}.`
        : "Your current group position is available in the leaderboard.";
    return `<section class="mission-payoff-section mission-payoff-group" aria-labelledby="missionGroupTitle"><div class="mission-payoff-heading"><p>Prototype group standings</p><h2 id="missionGroupTitle">Group Update</h2></div><div class="mission-payoff-group-summary"><div><span>Your position</span><strong>${group.position} of ${group.total}</strong></div><div><span>Current status</span><strong>${status}</strong></div></div><p class="mission-payoff-disclosure"><strong>Prototype preview:</strong> Other group members are simulated. Your row uses your local Detective Progression.</p><button class="secondary-button" id="missionViewLeaderboard" type="button">View Group Leaderboard</button></section>`;
  }

  function categorySummaryMarkup(report) {
    return `<details class="mission-payoff-case-summary"><summary>Review compact case-score breakdown</summary><div>${report.categoryResults.map(item => `<p><span>${safe(item.label)}</span><strong>${item.earned} / ${item.possible}</strong></p>`).join("")}</div></details>`;
  }

  function renderPayoff() {
    const existingActions = captureExistingActions();
    const celebrations = captureCelebrations();
    const report = buildMissionReportData();
    const progression = progressionApi.getProgression();
    const history = loadHistory();
    const attempt = currentAttempt(history);
    const award = currentAward(progression, attempt);
    const before = progressionBeforeAttempt(progression, report, award, attempt, history);
    const comparisons = previousInvestigationComparison(report, history, attempt, progression, before, award);
    const development = detectiveDevelopment(progression, before);
    const unlockState = progressionApi.getUnlockState(progression);
    const recommendation = nextMissionRecommendation(progression, attempt?.attemptType || state.attemptType, unlockState, development.skills);
    const group = groupUpdate();
    const rank = progressionApi.getRank(progression.totalXp, progression.rankId);
    const variant = casesApi?.getVariant?.(state.currentVariantId) || { id: state.currentVariantId || "A", title: report.episode?.title || "Current Case" };
    const attemptNumber = state.attemptNumber || history.attempts.length;
    const completionDate = attempt?.timestamp ? new Date(attempt.timestamp).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : report.episode?.date;

    app.innerHTML = `<article class="mission-payoff-report">
      <header class="mission-payoff-hero">
        <div class="mission-classification"><span>Mission Complete</span><strong>${safe(release?.version || "v0.4.4.5")}</strong></div>
        <p class="eyebrow">${safe(variant.id)} · ${safe(variant.title)} · ${safe(attemptTypeLabel(attempt?.attemptType || state.attemptType))}</p>
        <h1 tabindex="-1" id="missionPayoffTitle">MISSION COMPLETE</h1>
        <p class="mission-payoff-context">Attempt ${attemptNumber} · ${safe(completionDate || "Completed investigation")}</p>
        <div class="mission-payoff-primary-metrics">
          <article class="score"><span>Case Score</span><strong>${report.score.earned}</strong><small>out of ${report.score.possible}</small></article>
          <article class="xp"><span>XP Earned</span><strong>+${Math.max(0, finite(award?.xp, 0))}</strong><small>${finite(progression.totalXp).toLocaleString()} total XP</small></article>
          <article class="rank"><span>Current Rank</span><strong>${safe(rank.icon)} ${safe(rank.name)}</strong><small>${safe(rank.description)}</small></article>
        </div>
        ${rankProgressMarkup(progression)}
      </header>

      ${celebrationsMarkup(celebrations)}

      <section class="mission-payoff-next" aria-labelledby="missionNextTitle">
        <div>${photo(host.image, "Pup, Game Master")}<div><span>Pup’s Next Mission</span><h2 id="missionNextTitle">${safe(recommendation.title)}</h2><p>${safe(recommendation.reason)}</p><small>Targets: ${safe(recommendation.target.replaceAll("-", " "))}</small></div></div>
        <button class="primary-button" id="missionRecommendedAction" type="button">${safe(recommendation.action)}</button>
      </section>

      ${xpMarkup(award, attempt)}
      ${comparisonMarkup(comparisons)}
      ${developmentMarkup(development)}
      ${groupMarkup(group)}

      <section class="mission-payoff-section mission-payoff-attempt" aria-labelledby="missionAttemptTitle"><div class="mission-payoff-heading"><p>Attempt and transfer details</p><h2 id="missionAttemptTitle">Case Context</h2></div><div class="mission-payoff-attempt-grid"><div><span>Variant</span><strong>${safe(variant.id)} · ${safe(variant.title)}</strong></div><div><span>Attempt type</span><strong>${safe(attemptTypeLabel(attempt?.attemptType || state.attemptType))}</strong></div><div><span>Attempt number</span><strong>${attemptNumber}</strong></div><div><span>Final score</span><strong>${report.score.earned} / ${report.score.possible}</strong></div></div>${categorySummaryMarkup(report)}</section>

      <footer class="mission-report-actions mission-payoff-actions" aria-label="Mission Report actions">
        <div id="missionFreshSlot"></div>
        <div id="missionReplaySlot"><small>Practice mode · Limited XP</small></div>
        <button class="secondary-button" id="missionReviewEveryAnswer" type="button">Review Every Answer</button>
        <button class="secondary-button" id="missionViewLeaderboardFooter" type="button">View Group Leaderboard</button>
        <div id="missionVoiceSlot"></div>
        <div id="missionHomeSlot"></div>
      </footer>
    </article>`;

    if (existingActions.fresh) {
      existingActions.fresh.className = "primary-button";
      existingActions.fresh.textContent = "Play Fresh Variant";
      document.querySelector("#missionFreshSlot")?.appendChild(existingActions.fresh);
    }
    if (existingActions.replay) {
      existingActions.replay.className = "secondary-button";
      existingActions.replay.textContent = "Replay This Case";
      document.querySelector("#missionReplaySlot")?.prepend(existingActions.replay);
    }
    if (existingActions.home) {
      existingActions.home.className = "ghost-button";
      existingActions.home.textContent = "Return to League Home";
      document.querySelector("#missionHomeSlot")?.appendChild(existingActions.home);
    }
    if (existingActions.voice) document.querySelector("#missionVoiceSlot")?.appendChild(existingActions.voice);

    const clickExisting = element => { if (element && typeof element.click === "function") element.click(); };
    document.querySelector("#missionRecommendedAction").onclick = () => {
      if (recommendation.action === "Replay This Case") clickExisting(existingActions.replay);
      else if (recommendation.action === "Return to League Home") clickExisting(existingActions.home);
      else clickExisting(existingActions.fresh);
    };
    document.querySelector("#missionReviewEveryAnswer").onclick = () => {
      state.screen = "results";
      state.finalRevealPhase = "review";
      state.finalRevealShowAll = true;
      state.revealStep = 5;
      state.revealComplete = true;
      render();
    };
    ["#missionViewLeaderboard", "#missionViewLeaderboardFooter"].forEach(selector => {
      const button = document.querySelector(selector);
      if (button) button.onclick = () => leaderboardApi?.open?.(button);
    });

    release?.apply?.();
    const heading = document.querySelector("#missionPayoffTitle");
    requestAnimationFrame?.(() => heading?.focus?.({ preventScroll: true }));
    if (!state.missionPayoffNarrated && root.PupVoice?.settings?.enabled !== false) {
      state.missionPayoffNarrated = true;
      root.PupVoice?.speak?.("The case is complete. Now let's see what the investigation taught you.");
    }
  }

  const baseRenderMissionReport445 = renderMissionReport;
  renderMissionReport = function () {
    baseRenderMissionReport445();
    renderPayoff();
  };

  root.BiteBuddySprint445Runtime = Object.freeze({ renderPayoff, loadHistory, currentAward, captureCelebrations });
  render();
})(window);
