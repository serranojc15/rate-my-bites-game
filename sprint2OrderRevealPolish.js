// Bite Buddy League — Order Reveal encouragement polish.
(function (root) {
  "use strict";

  const release = root.BiteBuddyRelease;

  const reactionPools = Object.freeze({
    highCorrect: Object.freeze([
      "Outstanding deduction. You trusted the right clues and nailed it.",
      "Excellent read. Your confidence matched the evidence.",
      "Wow, that was a great prediction. You followed the clues perfectly."
    ]),
    measuredCorrect: Object.freeze([
      "Nice catch. That detail mattered.",
      "Great prediction. You connected the evidence at the right moment.",
      "Strong read. You found exactly what mattered."
    ]),
    lowCorrect: Object.freeze([
      "Your instinct was right, even if you were not fully sure.",
      "You found the answer. Trust that evidence a little more next time.",
      "Good deduction. The clue was stronger than it first appeared."
    ]),
    highWrong: Object.freeze([
      "Good thinking. One convincing clue pointed the other way.",
      "That was a reasonable read, but one detail changed the outcome.",
      "You committed to a believable trail. Let’s note the clue that shifted it."
    ]),
    measuredWrong: Object.freeze([
      "Close. You saw part of the pattern, but one clue changed the choice.",
      "Solid reasoning. This one came down to a difficult detail.",
      "A thoughtful prediction. The evidence leaned another direction this time."
    ]),
    lowWrong: Object.freeze([
      "Your uncertainty made sense. This was a tough read.",
      "No problem—this clue was easy to miss.",
      "That was a fair guess. Now you know which detail carried more weight."
    ])
  });

  function finite(value, fallback = 0) {
    return Number.isFinite(Number(value)) ? Number(value) : fallback;
  }

  function reactionCategory(answer = {}) {
    const confidence = finite(answer.confidence, 0);
    if (answer.correct && confidence >= 4) return "highCorrect";
    if (answer.correct && confidence <= 2) return "lowCorrect";
    if (answer.correct) return "measuredCorrect";
    if (confidence >= 4) return "highWrong";
    if (confidence <= 2) return "lowWrong";
    return "measuredWrong";
  }

  function stableIndex(answer = {}, personId = "diner", answerIndex = 0, poolLength = 1) {
    const seed = `${personId}:${answer.stage || answer.label || "answer"}:${answerIndex}`;
    let total = 0;
    for (let index = 0; index < seed.length; index += 1) total = (total * 31 + seed.charCodeAt(index)) >>> 0;
    return poolLength ? total % poolLength : 0;
  }

  function answerReaction(answer = {}, personId, answerIndex = 0) {
    const pool = reactionPools[reactionCategory(answer)] || reactionPools.measuredWrong;
    return pool[stableIndex(answer, personId, answerIndex, pool.length)];
  }

  function dinerSummary(result = {}) {
    const answers = Array.isArray(result.answers) ? result.answers : [];
    const name = result.person?.name || "this diner";
    const correct = answers.filter(answer => answer.correct).length;
    const highConfidenceCorrect = answers.filter(answer => answer.correct && finite(answer.confidence, 0) >= 4).length;
    const recovery = answers.length >= 2 && !answers[0]?.correct && answers.slice(1).some(answer => answer.correct);

    if (correct === answers.length && answers.length) {
      return highConfidenceCorrect >= 2
        ? `You completely understood ${name}. Outstanding clue work.`
        : `You got every part of ${name}’s order right. Trust your instincts.`;
    }
    if (correct === 2) return recovery
      ? `Great recovery. You finished ${name}’s order with two strong deductions.`
      : `You picked up nearly every clue for ${name}. Two of three predictions landed.`;
    if (correct === 1) return `You found one important truth about ${name}. The other clues made this a difficult read.`;
    return `${name} kept the order hidden this time. Every missed clue helps sharpen the next prediction.`;
  }

  function debugControlsEnabled() {
    try {
      return new URLSearchParams(root.location?.search || "").get("revealDebug") === "1";
    } catch {
      return false;
    }
  }

  function removePlayerDebugControls(document = root.document) {
    if (!document?.querySelector || debugControlsEnabled()) return false;
    const controls = document.querySelector(".final-reveal-controls");
    if (!controls) return false;
    controls.remove();
    return true;
  }

  function decorateDinerReveal(document = root.document) {
    if (!document?.querySelectorAll) return false;
    const heading = document.querySelector(".final-diner-heading");
    const personId = heading?.dataset?.person || "diner";
    const cards = [...document.querySelectorAll(".final-answer-card")];
    if (!cards.length) return false;

    const report = root.buildMissionReportData?.();
    const stateObject = root.state || (typeof state !== "undefined" ? state : null);
    const personIndex = Math.max(0, finite(stateObject?.finalRevealPersonIndex, 0));
    const result = report?.personResults?.[personIndex];

    cards.forEach((card, index) => {
      if (card.querySelector(".pup-answer-reaction")) return;
      const answer = result?.answers?.[index] || {};
      const reaction = document.createElement("div");
      reaction.className = "pup-answer-reaction";
      reaction.setAttribute("role", "status");
      reaction.innerHTML = `<img src="${root.host?.image || "assets/buddies/buddy-dog.webp"}" alt=""><div><span>PUP’S READ</span><p></p></div>`;
      reaction.querySelector("p").textContent = answerReaction(answer, personId, index);
      card.append(reaction);
    });

    const existingSpeech = document.querySelector(".final-diner-reveal .final-pup-speech");
    if (existingSpeech && result) {
      existingSpeech.querySelector("span").textContent = "DINER SUMMARY";
      existingSpeech.querySelector("p").textContent = dinerSummary(result);
    }
    return true;
  }

  function installOrderRevealPolish() {
    if (typeof root.results !== "function" || root.results.sprint2OrderRevealWrapped) return false;
    const baseResults = root.results;
    const wrappedResults = function () {
      baseResults();
      removePlayerDebugControls();
      decorateDinerReveal();
      release?.apply?.();
    };
    wrappedResults.sprint2OrderRevealWrapped = true;
    wrappedResults.sprint2OrderRevealBase = baseResults;
    root.results = wrappedResults;
    try { results = wrappedResults; } catch {}
    return true;
  }

  root.BiteBuddyOrderRevealPolish = Object.freeze({
    reactionCategory,
    answerReaction,
    dinerSummary,
    removePlayerDebugControls,
    decorateDinerReveal,
    installOrderRevealPolish
  });

  if (typeof root.document === "undefined") return;
  installOrderRevealPolish();
  release?.apply?.();
  root.render?.();
})(window);
