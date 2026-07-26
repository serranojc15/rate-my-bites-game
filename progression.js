// Bite Buddy League v0.4.4.0 — Detective Progression core.
(function (root) {
  "use strict";

  const STORAGE_KEY = "bite-buddy-progression-v1";
  const HISTORY_KEY = "bite-buddy-case-history-v1";
  const VERSION = 1;

  const ranks = Object.freeze([
    { id: "rookie-biter", name: "Rookie Biter", minimumXp: 0, icon: "🔎", description: "You are learning which details matter.", pup: "Every strong read begins with one honest observation." },
    { id: "table-reader", name: "Table Reader", minimumXp: 250, icon: "🧭", description: "You are beginning to separate habits from tonight’s context.", pup: "You are starting to hear the clue beneath the conversation." },
    { id: "clue-tracker", name: "Clue Tracker", minimumXp: 650, icon: "🗂️", description: "You consistently identify evidence that changes the decision.", pup: "You are no longer collecting clues. You are connecting them." },
    { id: "people-detective", name: "People Detective", minimumXp: 1200, icon: "🕵️", description: "You understand how individual preferences and group pressure interact.", pup: "You read the table as a system, not a list of orders." },
    { id: "master-biter", name: "Master Biter", minimumXp: 2000, icon: "🏅", description: "You read the people, the context, and the confidence behind every choice.", pup: "The meal is evidence. The people are the case. You understand both." }
  ]);

  const xpRules = Object.freeze({
    base: Object.freeze({ "first-attempt": 40, "fresh-variant": 55, "same-variant-replay": 10 }),
    restaurant: 30,
    meal: 10,
    drink: 7,
    dessert: 5,
    confidence: Object.freeze({ highCorrect: 4, lowWrong: 2, highWrong: 0, lowCorrect: 3 }),
    transfer: Object.freeze({ improved: 25, equal: 15, lower: 8, firstFreshMilestone: 20 }),
    nearPerfect: 20,
    nearPerfectMinimum: 270
  });

  const skillDefinitions = Object.freeze({
    recentBehavior: Object.freeze({ label: "Recent Behavior", contextIds: ["recent"] }),
    permanentConstraints: Object.freeze({ label: "Permanent Constraints", contextIds: ["permanent"] }),
    groupDynamics: Object.freeze({ label: "Group Dynamics", contextIds: ["social"] }),
    patternChanges: Object.freeze({ label: "Pattern Changes", contextIds: ["intentional"] }),
    contextualFactors: Object.freeze({ label: "Contextual Factors", contextIds: ["environmental", "preference"] }),
    confidenceCalibration: Object.freeze({ label: "Confidence Calibration", contextIds: [] })
  });

  const attemptTypes = new Set(["first-attempt", "same-variant-replay", "fresh-variant"]);
  const clone = value => JSON.parse(JSON.stringify(value));
  const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const bounded = (value, min, max, fallback = min) => Math.max(min, Math.min(max, finite(value, fallback)));
  const emptySkill = () => ({ correct: 0, attempted: 0 });
  const emptySkills = () => Object.fromEntries(Object.keys(skillDefinitions).map(id => [id, emptySkill()]));

  function defaultProgression() {
    return {
      version: VERSION,
      totalXp: 0,
      rankId: ranks[0].id,
      completedFirstAttempts: 0,
      completedFreshVariants: 0,
      completedReplays: 0,
      bestFirstAttemptScore: null,
      firstAttemptScore: null,
      bestFreshVariantScore: null,
      totalCorrectRestaurantPredictions: 0,
      totalCompletedPredictions: 0,
      skills: emptySkills(),
      unlocks: { introductory: true, intermediate: false, advanced: false },
      announcedUnlocks: [],
      pendingRankUps: [],
      awardedAttempts: [],
      awards: [],
      lastAward: null,
      lastProgressionUpdate: null
    };
  }

  function safeParse(raw, fallback) {
    try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
  }

  function normalizeSkill(value) {
    const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    return {
      correct: Math.max(0, Math.floor(finite(source.correct, 0))),
      attempted: Math.max(0, Math.floor(finite(source.attempted, 0)))
    };
  }

  function rankIndex(id) {
    const index = ranks.findIndex(rank => rank.id === id);
    return index < 0 ? 0 : index;
  }

  function calculatedRank(totalXp) {
    const xp = Math.max(0, finite(totalXp, 0));
    return [...ranks].reverse().find(rank => xp >= rank.minimumXp) || ranks[0];
  }

  function getRank(totalXp, storedRankId) {
    const earned = calculatedRank(totalXp);
    const stored = ranks[rankIndex(storedRankId)];
    return rankIndex(stored.id) > rankIndex(earned.id) ? stored : earned;
  }

  function normalizeAward(value) {
    if (!value || typeof value !== "object") return null;
    const attemptId = typeof value.attemptId === "string" ? value.attemptId : "";
    if (!attemptId) return null;
    return {
      attemptId,
      variantId: typeof value.variantId === "string" ? value.variantId : "A",
      attemptType: attemptTypes.has(value.attemptType) ? value.attemptType : "first-attempt",
      xp: Math.max(0, Math.floor(finite(value.xp, 0))),
      breakdown: Array.isArray(value.breakdown) ? value.breakdown.flatMap(item => item && typeof item.label === "string" ? [{ label: item.label, xp: Math.max(0, Math.floor(finite(item.xp, 0))) }] : []) : [],
      awardedAt: typeof value.awardedAt === "string" ? value.awardedAt : null
    };
  }

  function normalizeProgression(value) {
    const defaults = defaultProgression();
    const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    const skills = emptySkills();
    Object.keys(skills).forEach(id => { skills[id] = normalizeSkill(source.skills?.[id]); });
    const awards = Array.isArray(source.awards) ? source.awards.map(normalizeAward).filter(Boolean) : [];
    const awardedAttempts = [...new Set([
      ...(Array.isArray(source.awardedAttempts) ? source.awardedAttempts.filter(id => typeof id === "string" && id) : []),
      ...awards.map(award => award.attemptId)
    ])];
    const totalXp = Math.max(0, Math.floor(finite(source.totalXp, 0)));
    const rank = getRank(totalXp, source.rankId);
    const progression = {
      ...defaults,
      ...source,
      version: VERSION,
      totalXp,
      rankId: rank.id,
      completedFirstAttempts: Math.max(0, Math.floor(finite(source.completedFirstAttempts, 0))),
      completedFreshVariants: Math.max(0, Math.floor(finite(source.completedFreshVariants, 0))),
      completedReplays: Math.max(0, Math.floor(finite(source.completedReplays, 0))),
      bestFirstAttemptScore: source.bestFirstAttemptScore === null || source.bestFirstAttemptScore === undefined ? null : bounded(source.bestFirstAttemptScore, 0, 300, 0),
      firstAttemptScore: source.firstAttemptScore === null || source.firstAttemptScore === undefined ? null : bounded(source.firstAttemptScore, 0, 300, 0),
      bestFreshVariantScore: source.bestFreshVariantScore === null || source.bestFreshVariantScore === undefined ? null : bounded(source.bestFreshVariantScore, 0, 300, 0),
      totalCorrectRestaurantPredictions: Math.max(0, Math.floor(finite(source.totalCorrectRestaurantPredictions, 0))),
      totalCompletedPredictions: Math.max(0, Math.floor(finite(source.totalCompletedPredictions, 0))),
      skills,
      unlocks: {
        introductory: true,
        intermediate: Boolean(source.unlocks?.intermediate),
        advanced: Boolean(source.unlocks?.advanced)
      },
      announcedUnlocks: [...new Set(Array.isArray(source.announcedUnlocks) ? source.announcedUnlocks.filter(id => ["intermediate", "advanced"].includes(id)) : [])],
      pendingRankUps: Array.isArray(source.pendingRankUps) ? source.pendingRankUps.flatMap(item => item && typeof item === "object" && ranks.some(rankItem => rankItem.id === item.to) ? [{ from: ranks.some(rankItem => rankItem.id === item.from) ? item.from : ranks[0].id, to: item.to, attemptId: typeof item.attemptId === "string" ? item.attemptId : "" }] : []) : [],
      awardedAttempts,
      awards,
      lastAward: source.lastAward && typeof source.lastAward === "object" ? source.lastAward : null,
      lastProgressionUpdate: typeof source.lastProgressionUpdate === "string" ? source.lastProgressionUpdate : null
    };
    progression.unlocks = calculateUnlocks(progression);
    return progression;
  }

  function reconcileHistoryStats(progression, history = { attempts: [] }) {
    const attempts = Array.isArray(history.attempts) ? history.attempts : [];
    const firstAttempts = attempts.filter(attempt => attempt.attemptType === "first-attempt");
    const freshAttempts = attempts.filter(attempt => attempt.attemptType === "fresh-variant");
    const replayAttempts = attempts.filter(attempt => attempt.attemptType === "same-variant-replay");
    const firstEntry = firstAttempts[0] || attempts[0] || null;
    progression.completedFirstAttempts = Math.max(progression.completedFirstAttempts || 0, firstAttempts.length);
    progression.completedFreshVariants = Math.max(progression.completedFreshVariants || 0, freshAttempts.length);
    progression.completedReplays = Math.max(progression.completedReplays || 0, replayAttempts.length);
    if (progression.firstAttemptScore === null && firstEntry) progression.firstAttemptScore = firstEntry.score;
    if (firstAttempts.length) {
      const bestFirst = Math.max(...firstAttempts.map(attempt => attempt.score));
      progression.bestFirstAttemptScore = progression.bestFirstAttemptScore === null ? bestFirst : Math.max(progression.bestFirstAttemptScore, bestFirst);
    }
    if (freshAttempts.length) {
      const bestFresh = Math.max(...freshAttempts.map(attempt => attempt.score));
      progression.bestFreshVariantScore = progression.bestFreshVariantScore === null ? bestFresh : Math.max(progression.bestFreshVariantScore, bestFresh);
    }
    progression.unlocks = calculateUnlocks(progression);
    return progression;
  }

  function loadProgression() {
    try {
      const parsed = safeParse(root.localStorage?.getItem?.(STORAGE_KEY), defaultProgression());
      const normalized = reconcileHistoryStats(normalizeProgression(parsed), loadHistory());
      root.localStorage?.setItem?.(STORAGE_KEY, JSON.stringify(normalized));
      return normalized;
    } catch {
      return defaultProgression();
    }
  }

  function saveProgression(value) {
    const normalized = reconcileHistoryStats(normalizeProgression(value), loadHistory());
    try { root.localStorage?.setItem?.(STORAGE_KEY, JSON.stringify(normalized)); } catch {}
    return normalized;
  }

  function stableAttemptId(entry, index = 0) {
    if (entry && typeof entry.attemptId === "string" && entry.attemptId) return entry.attemptId;
    const timestamp = typeof entry?.timestamp === "string" && entry.timestamp ? entry.timestamp : "legacy";
    const variantId = typeof entry?.variantId === "string" && entry.variantId ? entry.variantId : "A";
    const attemptType = attemptTypes.has(entry?.attemptType) ? entry.attemptType : "first-attempt";
    const score = bounded(entry?.score, 0, 300, 0);
    return `${timestamp}|${variantId}|${attemptType}|${score}|${index}`;
  }

  function normalizeHistory(value) {
    const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    const attempts = Array.isArray(source.attempts) ? source.attempts : [];
    return {
      ...source,
      attempts: attempts.flatMap((entry, index) => {
        if (!entry || typeof entry !== "object") return [];
        const score = Number(entry.score);
        if (!Number.isFinite(score)) return [];
        const normalized = {
          ...entry,
          variantId: typeof entry.variantId === "string" && entry.variantId ? entry.variantId : "A",
          attemptType: attemptTypes.has(entry.attemptType) ? entry.attemptType : "first-attempt",
          score: bounded(score, 0, 300, 0),
          verdict: typeof entry.verdict === "string" && entry.verdict ? entry.verdict : "Completed",
          timestamp: typeof entry.timestamp === "string" && !Number.isNaN(Date.parse(entry.timestamp)) ? entry.timestamp : null
        };
        normalized.attemptId = stableAttemptId(normalized, index);
        return [normalized];
      })
    };
  }

  function loadHistory() {
    try {
      const parsed = safeParse(root.localStorage?.getItem?.(HISTORY_KEY), { attempts: [] });
      const normalized = normalizeHistory(parsed);
      root.localStorage?.setItem?.(HISTORY_KEY, JSON.stringify(normalized));
      return normalized;
    } catch {
      return { attempts: [] };
    }
  }

  function reportEntries(report) {
    if (!report || typeof report !== "object") return [];
    const restaurant = report.restaurantResult ? [report.restaurantResult] : [];
    const answers = Array.isArray(report.personResults)
      ? report.personResults.flatMap(result => Array.isArray(result.answers) ? result.answers : [])
      : [];
    return [...restaurant, ...answers];
  }

  function confidenceBonus(entry) {
    const confidence = finite(entry?.confidence, 0);
    const correct = Boolean(entry?.correct);
    if (confidence >= 4) return correct ? xpRules.confidence.highCorrect : xpRules.confidence.highWrong;
    if (confidence > 0 && confidence <= 2) return correct ? xpRules.confidence.lowCorrect : xpRules.confidence.lowWrong;
    return 0;
  }

  function firstAttemptScore(progression, history) {
    if (progression.firstAttemptScore !== null) return progression.firstAttemptScore;
    const first = history.attempts.find(attempt => attempt.attemptType === "first-attempt") || history.attempts[0];
    return first ? first.score : null;
  }

  function calculateAttemptXp(attempt, report, progression = defaultProgression(), history = { attempts: [] }) {
    if (!attempt || !report || !attemptTypes.has(attempt.attemptType)) return { total: 0, breakdown: [] };
    const breakdown = [];
    const add = (label, xp) => { if (xp > 0) breakdown.push({ label, xp }); };
    const alreadyCreditedReplay = attempt.attemptType === "same-variant-replay" && progression.awards.some(award => award.attemptType === "same-variant-replay" && award.variantId === attempt.variantId);
    const baseXp = alreadyCreditedReplay ? 0 : xpRules.base[attempt.attemptType];
    add(attempt.attemptType === "first-attempt" ? "First Attempt Completed" : attempt.attemptType === "fresh-variant" ? "Fresh Variant Completed" : "Replay Practice Completed", baseXp);

    // Same-variant replay is practice, not a renewable progression source. Its
    // one small per-variant completion credit is the entire award.
    if (attempt.attemptType === "same-variant-replay") {
      return { total: breakdown.reduce((sum, item) => sum + item.xp, 0), breakdown };
    }

    const entries = reportEntries(report);
    const restaurant = entries.find(entry => entry.type === "restaurant" || entry.id === "group-restaurant");
    if (restaurant?.correct) add("Correct Restaurant", xpRules.restaurant);

    ["meal", "drink", "dessert"].forEach(type => {
      const count = entries.filter(entry => entry.type === type && entry.correct).length;
      if (count) add(`${count} Correct ${type === "meal" ? "Entrée" : type[0].toUpperCase() + type.slice(1)}${count === 1 ? "" : "s"}`, count * xpRules[type]);
    });

    const calibrationXp = entries.reduce((sum, entry) => sum + confidenceBonus(entry), 0);
    add("Confidence Calibration", calibrationXp);

    if (attempt.attemptType === "fresh-variant") {
      const firstScore = firstAttemptScore(progression, history);
      let transferXp = xpRules.transfer.lower;
      let transferLabel = "Fresh-Variant Completion";
      if (firstScore !== null && attempt.score > firstScore) {
        transferXp = xpRules.transfer.improved;
        transferLabel = "Fresh-Variant Improvement";
      } else if (firstScore !== null && attempt.score === firstScore) {
        transferXp = xpRules.transfer.equal;
        transferLabel = "Fresh-Variant Consistency";
      }
      add(transferLabel, transferXp);
      const hasPriorFreshAward = progression.awards.some(award => award.attemptType === "fresh-variant");
      if (!hasPriorFreshAward) add("First Fresh Variant Milestone", xpRules.transfer.firstFreshMilestone);
    }

    if (attempt.attemptType !== "same-variant-replay" && attempt.score >= xpRules.nearPerfectMinimum) add("Near-Perfect Investigation", xpRules.nearPerfect);
    return { total: breakdown.reduce((sum, item) => sum + item.xp, 0), breakdown };
  }

  function contextSkillId(entry) {
    const contextId = entry?.context?.id;
    return Object.keys(skillDefinitions).find(id => id !== "confidenceCalibration" && skillDefinitions[id].contextIds.includes(contextId)) || "contextualFactors";
  }

  function updateSkills(skills, report) {
    const next = clone(skills || emptySkills());
    const entries = reportEntries(report);
    entries.forEach(entry => {
      const skillId = contextSkillId(entry);
      next[skillId] = normalizeSkill(next[skillId]);
      next[skillId].attempted += 1;
      if (entry.correct) next[skillId].correct += 1;
      if (finite(entry.confidence, 0) > 0) {
        next.confidenceCalibration.attempted += 1;
        const calibrated = (entry.correct && finite(entry.confidence, 0) >= 3) || (!entry.correct && finite(entry.confidence, 0) <= 3);
        if (calibrated) next.confidenceCalibration.correct += 1;
      }
    });
    return next;
  }

  function skillLevel(skill) {
    const value = normalizeSkill(skill);
    if (value.attempted < 2) return { id: "new", label: "New", percent: value.attempted ? Math.round((value.correct / value.attempted) * 100) : 0 };
    const percent = Math.round((value.correct / value.attempted) * 100);
    if (percent < 50) return { id: "developing", label: "Developing", percent };
    if (percent < 70) return { id: "reliable", label: "Reliable", percent };
    if (percent < 85 || value.attempted < 6) return { id: "strong", label: "Strong", percent };
    return { id: "expert", label: "Expert", percent };
  }

  function getSkillSummary(progression = loadProgression()) {
    return Object.entries(skillDefinitions).map(([id, definition]) => ({ id, label: definition.label, ...normalizeSkill(progression.skills?.[id]), level: skillLevel(progression.skills?.[id]) }));
  }

  function strongestSkill(progression = loadProgression()) {
    const tested = getSkillSummary(progression).filter(skill => skill.attempted >= 3);
    if (!tested.length) return null;
    return tested.sort((a, b) => (b.level.percent - a.level.percent) || (b.attempted - a.attempted))[0];
  }

  function calculateUnlocks(progression) {
    const confidence = skillLevel(progression.skills?.confidenceCalibration);
    const rank = getRank(progression.totalXp, progression.rankId);
    return {
      introductory: true,
      intermediate: progression.completedFirstAttempts >= 1 && progression.completedFreshVariants >= 1 && progression.totalXp >= 250 && finite(progression.bestFreshVariantScore, 0) >= 180,
      advanced: rankIndex(rank.id) >= rankIndex("people-detective") && progression.completedFreshVariants >= 3 && finite(progression.bestFreshVariantScore, 0) >= 225 && ["reliable", "strong", "expert"].includes(confidence.id)
    };
  }

  function getUnlockState(progression = loadProgression()) {
    const unlocks = calculateUnlocks(progression);
    return {
      introductory: { unlocked: true, label: "Introductory", description: "Clear contextual clues and full case-file access." },
      intermediate: { unlocked: unlocks.intermediate, label: "Intermediate", description: "More conflicting clues and stronger distractions.", requirements: [
        { label: "Complete one first attempt", met: progression.completedFirstAttempts >= 1 },
        { label: "Complete one fresh variant", met: progression.completedFreshVariants >= 1 },
        { label: "Earn 250 XP", met: progression.totalXp >= 250 },
        { label: "Score at least 180 on a fresh variant", met: finite(progression.bestFreshVariantScore, 0) >= 180 }
      ] },
      advanced: { unlocked: unlocks.advanced, label: "Advanced", description: "Ambiguous evidence and subtler social influence.", requirements: [
        { label: "Reach People Detective", met: rankIndex(getRank(progression.totalXp, progression.rankId).id) >= rankIndex("people-detective") },
        { label: "Complete three fresh variants", met: progression.completedFreshVariants >= 3 },
        { label: "Score at least 225 on a fresh variant", met: finite(progression.bestFreshVariantScore, 0) >= 225 },
        { label: "Reach Reliable confidence calibration", met: ["reliable", "strong", "expert"].includes(skillLevel(progression.skills?.confidenceCalibration).id) }
      ] }
    };
  }

  function getRankProgress(progression = loadProgression()) {
    const current = getRank(progression.totalXp, progression.rankId);
    const currentIndex = rankIndex(current.id);
    const next = ranks[currentIndex + 1] || null;
    if (!next) return { current, next: null, minimum: current.minimumXp, maximum: current.minimumXp, value: current.minimumXp, percent: 100 };
    const value = bounded(progression.totalXp, current.minimumXp, next.minimumXp, current.minimumXp);
    return { current, next, minimum: current.minimumXp, maximum: next.minimumXp, value, percent: Math.round(((value - current.minimumXp) / (next.minimumXp - current.minimumXp)) * 100) };
  }

  function awardAttempt(attempt, report) {
    if (!attempt || !report) return { awarded: false, reason: "incomplete", progression: loadProgression(), award: null };
    const history = loadHistory();
    const normalizedAttempt = history.attempts.find(item => item.attemptId === attempt.attemptId) || { ...attempt, attemptId: stableAttemptId(attempt, history.attempts.length) };
    let progression = loadProgression();
    const existing = progression.awards.find(award => award.attemptId === normalizedAttempt.attemptId);
    if (existing || progression.awardedAttempts.includes(normalizedAttempt.attemptId)) {
      return { awarded: false, reason: "duplicate", progression, award: existing || null };
    }

    const previousRank = getRank(progression.totalXp, progression.rankId);
    const xp = calculateAttemptXp(normalizedAttempt, report, progression, history);
    const award = {
      attemptId: normalizedAttempt.attemptId,
      variantId: normalizedAttempt.variantId,
      attemptType: normalizedAttempt.attemptType,
      xp: xp.total,
      breakdown: xp.breakdown,
      awardedAt: new Date().toISOString()
    };

    progression.totalXp += xp.total;
    progression.awardedAttempts.push(normalizedAttempt.attemptId);
    progression.awards.push(award);
    progression.lastAward = award;
    progression.lastProgressionUpdate = award.awardedAt;
    progression.totalCompletedPredictions += reportEntries(report).length;
    progression.totalCorrectRestaurantPredictions += report.restaurantResult?.correct ? 1 : 0;
    progression.skills = updateSkills(progression.skills, report);

    const newRank = getRank(progression.totalXp, progression.rankId);
    progression.rankId = newRank.id;
    if (rankIndex(newRank.id) > rankIndex(previousRank.id)) {
      progression.pendingRankUps.push({ from: previousRank.id, to: newRank.id, attemptId: normalizedAttempt.attemptId });
    }

    progression.unlocks = calculateUnlocks(progression);
    progression = saveProgression(progression);
    return { awarded: true, reason: "awarded", progression, award };
  }

  function awardLatestAttempt(report) {
    const history = loadHistory();
    const attempt = history.attempts.at(-1) || null;
    return awardAttempt(attempt, report);
  }

  function consumeNotices() {
    let progression = loadProgression();
    const rankUps = progression.pendingRankUps.slice();
    progression.pendingRankUps = [];
    const unlockState = calculateUnlocks(progression);
    const unlocks = ["intermediate", "advanced"].filter(id => unlockState[id] && !progression.announcedUnlocks.includes(id));
    progression.announcedUnlocks = [...new Set([...progression.announcedUnlocks, ...unlocks])];
    progression = saveProgression(progression);
    return { rankUps, unlocks, progression };
  }

  root.BiteBuddyProgression = Object.freeze({
    version: VERSION,
    storageKey: STORAGE_KEY,
    historyKey: HISTORY_KEY,
    ranks,
    xpRules,
    skillDefinitions,
    getProgression: () => clone(loadProgression()),
    normalizeProgression,
    normalizeHistory,
    reconcileHistoryStats,
    stableAttemptId,
    calculateAttemptXp,
    awardAttempt,
    awardLatestAttempt,
    getRank,
    getRankProgress,
    getSkillSummary,
    strongestSkill,
    skillLevel,
    getUnlockState,
    consumeNotices,
    reportEntries
  });
})(window);
