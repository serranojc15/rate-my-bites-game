// Bite Buddy League v0.4.4.0 — Detective Progression presentation.
(function () {
  "use strict";

  const progressionApi = window.BiteBuddyProgression;
  const release = window.BiteBuddyRelease;
  if (!progressionApi) return;

  function rankById(id) {
    return progressionApi.ranks.find(rank => rank.id === id) || progressionApi.ranks[0];
  }

  function strongestSkillCopy(progression) {
    const strongest = progressionApi.strongestSkill(progression);
    return strongest
      ? `${strongest.label} · ${strongest.level.label}`
      : "Complete more fresh cases to identify your strongest detective skill.";
  }

  function rankProgressMarkup(progression, compact = false) {
    const progress = progressionApi.getRankProgress(progression);
    const maximum = progress.next ? progress.maximum : Math.max(1, progress.current.minimumXp);
    const minimum = progress.next ? progress.minimum : 0;
    const value = progress.next ? progress.value : maximum;
    return `<div class="detective-rank-progress ${compact ? "compact" : ""}">
      <div><span>${progress.next ? `Progress to ${escapeHtml(progress.next.name)}` : "Highest rank reached"}</span><strong>${progression.totalXp.toLocaleString()}${progress.next ? ` / ${progress.next.minimumXp.toLocaleString()} XP` : " XP"}</strong></div>
      <div class="detective-progress-track" role="progressbar" aria-label="${progress.next ? `Progress toward ${escapeHtml(progress.next.name)}` : "Master Biter rank complete"}" aria-valuemin="${minimum}" aria-valuemax="${maximum}" aria-valuenow="${value}"><span style="width:${progress.percent}%"></span></div>
      <small>${progress.next ? `${Math.max(0, progress.next.minimumXp - progression.totalXp).toLocaleString()} XP to next rank` : "Detective rank complete"}</small>
    </div>`;
  }

  function requirementsMarkup(requirements) {
    return `<ul class="unlock-requirements">${requirements.map(requirement => `<li class="${requirement.met ? "met" : "unmet"}"><span aria-hidden="true">${requirement.met ? "✓" : "○"}</span>${escapeHtml(requirement.label)}</li>`).join("")}</ul>`;
  }

  function difficultyMarkup(progression) {
    const difficulties = progressionApi.getUnlockState(progression);
    return `<div class="difficulty-preview" aria-label="Case difficulty status">
      ${Object.values(difficulties).map(item => `<article class="difficulty-card ${item.unlocked ? "unlocked" : "locked"}">
        <div><span>${item.unlocked ? "Unlocked" : "Locked"}</span><strong>${escapeHtml(item.label)}</strong></div>
        <p>${escapeHtml(item.description)}</p>
        ${item.label === "Introductory" ? `<small>Episode 001 is playable now.</small>` : item.unlocked ? `<small>Progression requirement met. A playable ${escapeHtml(item.label.toLowerCase())} case is planned for a future sprint.</small>` : `<small>Complete the listed requirements to unlock this tier.</small>`}
      </article>`).join("")}
    </div>`;
  }

  function renderHomeProgression() {
    if (state.screen !== "welcome" || document.querySelector(".detective-profile-panel")) return;
    const hero = document.querySelector(".hero");
    if (!hero) return;
    const progression = progressionApi.getProgression();
    const rank = progressionApi.getRank(progression.totalXp, progression.rankId);
    const unlocks = progressionApi.getUnlockState(progression);
    const nextUnlock = unlocks.intermediate.unlocked ? unlocks.advanced : unlocks.intermediate;
    const panel = document.createElement("section");
    panel.className = "detective-profile-panel";
    panel.setAttribute("aria-labelledby", "detectiveProfileTitle");
    panel.innerHTML = `<div class="section-heading detective-heading"><div><p class="eyebrow">Detective Profile</p><h2 id="detectiveProfileTitle">${rank.icon} ${escapeHtml(rank.name)}</h2></div><strong>${progression.totalXp.toLocaleString()} XP</strong></div>
      <p class="detective-description">${escapeHtml(rank.description)}</p>
      ${rankProgressMarkup(progression)}
      <div class="detective-stat-grid">
        <div><span>First attempts</span><strong>${progression.completedFirstAttempts}</strong></div>
        <div><span>Fresh variants</span><strong>${progression.completedFreshVariants}</strong></div>
        <div><span>Best fresh score</span><strong>${progression.bestFreshVariantScore ?? "—"}<small>${progression.bestFreshVariantScore === null ? "" : " / 300"}</small></strong></div>
        <div><span>Strongest skill</span><strong>${escapeHtml(strongestSkillCopy(progression))}</strong></div>
      </div>
      <div class="next-unlock-card">
        <div><span>Next unlock</span><strong>${escapeHtml(nextUnlock.label)} Cases</strong></div>
        ${nextUnlock.unlocked ? `<p>All current requirements are complete. The playable case will arrive in a future sprint.</p>` : progression.completedFirstAttempts === 0 ? `<p>Complete your first investigation to begin building your detective profile.</p>${requirementsMarkup(nextUnlock.requirements)}` : requirementsMarkup(nextUnlock.requirements)}
      </div>
      ${difficultyMarkup(progression)}`;
    const hall = hero.querySelector(".hall");
    if (hall) hall.before(panel); else hero.appendChild(panel);
  }

  function caseSkillSummary(report) {
    const definitions = progressionApi.skillDefinitions;
    const rows = Object.keys(definitions).map(id => ({ id, label: definitions[id].label, correct: 0, attempted: 0 }));
    const byId = Object.fromEntries(rows.map(row => [row.id, row]));
    progressionApi.reportEntries(report).forEach(entry => {
      const contextId = entry?.context?.id;
      const skillId = Object.keys(definitions).find(id => id !== "confidenceCalibration" && definitions[id].contextIds.includes(contextId)) || "contextualFactors";
      byId[skillId].attempted += 1;
      if (entry.correct) byId[skillId].correct += 1;
      if (Number(entry.confidence) > 0) {
        byId.confidenceCalibration.attempted += 1;
        if ((entry.correct && Number(entry.confidence) >= 3) || (!entry.correct && Number(entry.confidence) <= 3)) byId.confidenceCalibration.correct += 1;
      }
    });
    return rows.filter(row => row.attempted).map(row => ({ ...row, level: progressionApi.skillLevel(row) }));
  }

  function xpBreakdownMarkup(award) {
    if (!award || !award.breakdown?.length) {
      return `<p class="progression-empty">This practice replay has already received its one small progression credit. No additional XP was awarded.</p>`;
    }
    return `<dl class="xp-breakdown">${award.breakdown.map(item => `<div><dt>${escapeHtml(item.label)}</dt><dd>+${item.xp} XP</dd></div>`).join("")}<div class="xp-total"><dt>Total</dt><dd>+${award.xp} XP</dd></div></dl>`;
  }

  function noticesMarkup(notices) {
    const messages = [];
    notices.rankUps.forEach(item => {
      const from = rankById(item.from);
      const to = rankById(item.to);
      messages.push(`<article class="rank-up-notice"><span>Rank advanced</span><h3>${escapeHtml(from.name)} → ${escapeHtml(to.name)}</h3><p><strong>Pup:</strong> ${escapeHtml(to.pup)}</p></article>`);
    });
    notices.unlocks.forEach(id => {
      const label = id === "intermediate" ? "Intermediate" : "Advanced";
      messages.push(`<article class="unlock-notice"><span>Difficulty unlocked</span><h3>${label} investigations</h3><p><strong>Pup:</strong> ${id === "intermediate" ? "Intermediate investigations are now unlocked. The clues will not always agree." : "Advanced investigation requirements are complete. The next case will ask more of every deduction."}</p><small>The progression tier is unlocked; its playable episode is planned for a future sprint.</small></article>`);
    });
    return messages.join("");
  }

  function renderMissionProgression() {
    const report = buildMissionReportData();
    const result = progressionApi.awardLatestAttempt(report);
    const progression = result.progression;
    const rank = progressionApi.getRank(progression.totalXp, progression.rankId);
    const notices = progressionApi.consumeNotices();
    const unlocks = progressionApi.getUnlockState(notices.progression);
    const nextUnlock = unlocks.intermediate.unlocked ? unlocks.advanced : unlocks.intermediate;
    const caseSkills = caseSkillSummary(report);
    const existing = document.querySelector(".mission-development, .detective-development");
    if (!existing) return;
    const section = document.createElement("section");
    section.className = "mission-section detective-development";
    section.setAttribute("aria-labelledby", "detectiveDevelopmentTitle");
    section.innerHTML = `<div class="mission-section-heading"><span>10</span><div><p>Long-term progression</p><h2 id="detectiveDevelopmentTitle">Detective Development</h2></div></div>
      ${noticesMarkup(notices)}
      <div class="development-summary">
        <article><span>XP earned this case</span><strong>+${result.award?.xp ?? 0}</strong></article>
        <article><span>Total XP</span><strong>${notices.progression.totalXp.toLocaleString()}</strong></article>
        <article><span>Current rank</span><strong>${rank.icon} ${escapeHtml(rank.name)}</strong></article>
        <article><span>Best fresh score</span><strong>${notices.progression.bestFreshVariantScore ?? "—"}${notices.progression.bestFreshVariantScore === null ? "" : " / 300"}</strong></article>
      </div>
      ${rankProgressMarkup(notices.progression, true)}
      <div class="development-grid">
        <section><h3>XP earned</h3>${xpBreakdownMarkup(result.award)}</section>
        <section><h3>Case skills</h3><p class="skill-honesty">These labels summarize results associated with each clue type. The game does not claim to know which clue you consciously used.</p><div class="case-skill-list">${caseSkills.map(skill => `<div><span>${escapeHtml(skill.label)}</span><strong>${escapeHtml(skill.level.label)}</strong><small>${skill.correct} of ${skill.attempted} associated predictions correct</small></div>`).join("")}</div></section>
      </div>
      <div class="development-footer"><div><span>Strongest tested skill</span><strong>${escapeHtml(strongestSkillCopy(notices.progression))}</strong></div><div><span>Next unlock</span><strong>${escapeHtml(nextUnlock.label)} Cases</strong>${nextUnlock.requirements ? requirementsMarkup(nextUnlock.requirements) : ""}</div></div>`;
    existing.replaceWith(section);
    release?.apply?.();
  }

  if (typeof renderMissionReport === "function") {
    const baseRenderMissionReport440 = renderMissionReport;
    renderMissionReport = function () {
      baseRenderMissionReport440();
      renderMissionProgression();
    };
  }

  if (typeof render === "function") {
    const baseRender440 = render;
    render = function () {
      baseRender440();
      renderHomeProgression();
      release?.apply?.();
    };
  }

  window.BiteBuddyProgressionUI = Object.freeze({ renderHomeProgression, renderMissionProgression, caseSkillSummary });
  render();
})();
