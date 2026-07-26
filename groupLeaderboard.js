// Bite Buddy League v0.4.4.1 — future-facing simulated group leaderboard.
(function (root) {
  "use strict";

  const seed = root.BiteBuddyGroupLeaderboardData;
  const progressionApi = root.BiteBuddyProgression;
  const release = root.BiteBuddyRelease;
  const HISTORY_KEY = "bite-buddy-case-history-v1";
  let opener = null;
  let escapeHandler = null;

  const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const scoreValue = value => value === null || value === undefined ? -1 : finite(value, -1);
  const dateValue = value => {
    const parsed = Date.parse(value || "");
    return Number.isNaN(parsed) ? 0 : parsed;
  };
  const safeText = value => typeof root.escapeHtml === "function" ? root.escapeHtml(value) : String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);

  function loadHistory() {
    try {
      const parsed = JSON.parse(root.localStorage?.getItem?.(HISTORY_KEY) || "null");
      return parsed && Array.isArray(parsed.attempts) ? parsed : { attempts: [] };
    } catch {
      return { attempts: [] };
    }
  }

  function firstAttemptAverage(history = loadHistory()) {
    const scores = history.attempts
      .filter(attempt => attempt?.attemptType === "first-attempt" && Number.isFinite(Number(attempt.score)))
      .map(attempt => Number(attempt.score));
    return scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null;
  }

  function lastQualifyingActivity(history = loadHistory()) {
    const qualifying = history.attempts
      .filter(attempt => ["first-attempt", "fresh-variant"].includes(attempt?.attemptType))
      .filter(attempt => !Number.isNaN(Date.parse(attempt?.timestamp || "")))
      .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
    return qualifying[0]?.timestamp || null;
  }

  function rankName(rankId) {
    return progressionApi?.ranks?.find(rank => rank.id === rankId)?.name || "Rookie Biter";
  }

  function localMember() {
    const progression = progressionApi?.getProgression?.() || {
      totalXp: 0,
      rankId: "rookie-biter",
      bestFreshVariantScore: null,
      completedFreshVariants: 0
    };
    const history = loadHistory();
    const strongest = progressionApi?.strongestSkill?.(progression);
    return {
      groupId: seed?.groupId || "demo-group",
      userId: "local-player",
      displayName: "You",
      avatar: "YOU",
      rankId: progression.rankId || "rookie-biter",
      totalXp: Math.max(0, Math.floor(finite(progression.totalXp, 0))),
      bestFreshVariantScore: progression.bestFreshVariantScore ?? null,
      firstAttemptAverage: firstAttemptAverage(history),
      completedFreshVariants: Math.max(0, Math.floor(finite(progression.completedFreshVariants, 0))),
      strongestSkill: strongest ? `${strongest.label} · ${strongest.level.label}` : null,
      lastPlayedAt: lastQualifyingActivity(history),
      simulated: false
    };
  }

  function getMembers() {
    return [...(seed?.members || []).map(member => ({ ...member })), localMember()];
  }

  function compareMembers(a, b) {
    return (finite(b.totalXp) - finite(a.totalXp))
      || (scoreValue(b.bestFreshVariantScore) - scoreValue(a.bestFreshVariantScore))
      || (scoreValue(b.firstAttemptAverage) - scoreValue(a.firstAttemptAverage))
      || (dateValue(b.lastPlayedAt) - dateValue(a.lastPlayedAt))
      || String(a.displayName).localeCompare(String(b.displayName));
  }

  function getRankedMembers() {
    return getMembers().sort(compareMembers);
  }

  function getLocalPosition() {
    const ranked = getRankedMembers();
    const index = ranked.findIndex(member => member.userId === "local-player");
    return { position: index < 0 ? ranked.length : index + 1, total: ranked.length };
  }

  function getGroupLeader() {
    return getRankedMembers()[0] || localMember();
  }

  function getActivityPreview() {
    const local = localMember();
    const position = getLocalPosition();
    const localText = local.totalXp > 0
      ? `You are currently ${position.position} of ${position.total} with ${local.totalXp.toLocaleString()} XP.`
      : "You are preparing for your first investigation.";
    return [
      { id: "sim-rank", text: "Avery advanced to People Detective.", simulated: true },
      { id: "sim-fresh", text: "Jordan scored 270 on a fresh case.", simulated: true },
      { id: "sim-first", text: "Casey completed their first investigation.", simulated: true },
      { id: "local-status", text: localText, simulated: false }
    ];
  }

  function memberRow(member, index) {
    const fresh = member.bestFreshVariantScore === null || member.bestFreshVariantScore === undefined ? "No fresh case completed" : `${member.bestFreshVariantScore} / 300`;
    const average = member.firstAttemptAverage === null || member.firstAttemptAverage === undefined ? "No first attempt yet" : `${member.firstAttemptAverage} / 300`;
    return `<article class="group-leaderboard-row ${member.simulated ? "is-simulated" : "is-local"}" aria-label="${member.simulated ? "Simulated member" : "You"}, position ${index + 1}">
      <div class="leaderboard-position">${index + 1}</div>
      <div class="leaderboard-avatar" aria-hidden="true">${safeText(member.avatar || member.displayName.slice(0, 1))}</div>
      <div class="leaderboard-member-copy">
        <div><strong>${safeText(member.displayName)}</strong>${member.simulated ? `<span>Simulated</span>` : `<span>You · Local data</span>`}</div>
        <p>${safeText(rankName(member.rankId))} · ${finite(member.totalXp).toLocaleString()} XP</p>
        <small>Best fresh: ${safeText(fresh)} · First-attempt average: ${safeText(average)}</small>
        ${member.strongestSkill ? `<small>Strongest skill: ${safeText(member.strongestSkill)}</small>` : ""}
      </div>
    </article>`;
  }

  function close() {
    root.document?.querySelector?.(".group-leaderboard-modal")?.remove();
    root.document?.body?.classList?.remove?.("modal-open");
    if (escapeHandler) root.document?.removeEventListener?.("keydown", escapeHandler);
    escapeHandler = null;
    const target = opener;
    opener = null;
    target?.focus?.();
  }

  function open(openingElement) {
    if (!root.document?.createElement) return false;
    opener = openingElement || root.document.activeElement;
    close();
    opener = openingElement || root.document.activeElement;
    const ranked = getRankedMembers();
    const position = getLocalPosition();
    const leader = getGroupLeader();
    const modal = root.document.createElement("div");
    modal.className = "group-leaderboard-modal";
    modal.innerHTML = `<div class="modal-backdrop" data-leaderboard-close></div>
      <section class="group-leaderboard-card" role="dialog" aria-modal="true" aria-labelledby="groupLeaderboardTitle">
        <button class="modal-close" type="button" data-leaderboard-close aria-label="Close group leaderboard">×</button>
        <p class="eyebrow">${safeText(release?.version || "v0.4.4.1")} · Group Leaderboard · Simulation Preview</p>
        <h2 id="groupLeaderboardTitle">${safeText(seed?.groupName || "Dinner Detectives")}</h2>
        <p class="leaderboard-disclosure"><strong>Prototype preview:</strong> Other group members are simulated. Your row uses your current local Detective Progression stored on this device.</p>
        <div class="leaderboard-summary">
          <div><span>Your position</span><strong>${position.position} of ${position.total}</strong></div>
          <div><span>Group leader</span><strong>${safeText(leader.displayName)} · ${finite(leader.totalXp).toLocaleString()} XP</strong></div>
        </div>
        <div class="group-leaderboard-list">${ranked.map(memberRow).join("")}</div>
        <section class="group-activity-preview" aria-labelledby="groupActivityTitle">
          <div><span>Prototype data</span><h3 id="groupActivityTitle">Group activity preview</h3></div>
          <ul>${getActivityPreview().map(item => `<li><span>${item.simulated ? "Simulated" : "Your data"}</span>${safeText(item.text)}</li>`).join("")}</ul>
        </section>
        <button class="secondary-button leaderboard-done" type="button" data-leaderboard-close>Done</button>
      </section>`;
    root.document.body.appendChild(modal);
    root.document.body.classList.add("modal-open");
    modal.querySelectorAll?.("[data-leaderboard-close]").forEach(element => { element.onclick = close; });
    escapeHandler = event => { if (event.key === "Escape") close(); };
    root.document.addEventListener?.("keydown", escapeHandler);
    modal.querySelector?.(".modal-close")?.focus?.();
    return true;
  }

  function installHomeAccess() {
    const hall = root.document?.querySelector?.(".hall");
    if (!hall) return false;
    const heading = hall.querySelector?.(".section-heading");
    if (heading && !hall.querySelector?.("#viewGroupLeaderboard")) {
      const button = root.document.createElement("button");
      button.id = "viewGroupLeaderboard";
      button.type = "button";
      button.className = "secondary-button view-leaderboard-button";
      button.textContent = "View Leaderboard";
      button.onclick = () => open(button);
      heading.appendChild(button);
    }
    if (!hall.querySelector?.(".leaderboard-home-preview")) {
      const position = getLocalPosition();
      const leader = getGroupLeader();
      const preview = root.document.createElement("div");
      preview.className = "leaderboard-home-preview";
      preview.innerHTML = `<div><span>Your position in this group</span><strong>${position.position} of ${position.total}</strong></div><div><span>Group leader</span><strong>${safeText(leader.displayName)} · ${finite(leader.totalXp).toLocaleString()} XP</strong></div>`;
      heading?.insertAdjacentElement?.("afterend", preview);
    }
    return true;
  }

  root.BiteBuddyGroupLeaderboard = Object.freeze({
    version: 1,
    getMembers,
    getLocalMember: localMember,
    getRankedMembers,
    getLocalPosition,
    getGroupLeader,
    getActivityPreview,
    compareMembers,
    installHomeAccess,
    open,
    close
  });
})(window);
