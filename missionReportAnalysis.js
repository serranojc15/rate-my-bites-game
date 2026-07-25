// Sprint v0.4.3.0 — focused analysis refinements kept separate from rendering.

missionReportMissedContext = function (entries) {
  const priority = {
    permanent: 0,
    environmental: 1,
    recent: 2,
    social: 3,
    intentional: 4,
    preference: 5
  };

  const missed = entries
    .filter(item => !item.correct)
    .sort((a, b) => {
      const contextDifference = (priority[a.context?.id] ?? 99) - (priority[b.context?.id] ?? 99);
      if (contextDifference) return contextDifference;
      return (b.confidence - a.confidence) || (b.possible - a.possible);
    })[0];

  if (missed) return missed;

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
};

const missionReportAnalysisBaseBuilder = buildMissionReportData;
buildMissionReportData = function () {
  const report = missionReportAnalysisBaseBuilder();
  const totalCorrect = report.categoryResults.reduce((sum, item) => sum + item.correct, 0);
  const totalAttempts = report.categoryResults.reduce((sum, item) => sum + item.total, 0);

  if (!report.categoryResults.some(item => item.id === "overall")) {
    report.categoryResults.push({
      id: "overall",
      label: "Overall",
      correct: totalCorrect,
      total: totalAttempts,
      earned: report.score.earned,
      possible: report.score.possible
    });
  }

  return report;
};

window.BiteBuddyMissionReport = Object.freeze({
  version: MISSION_REPORT_VERSION,
  buildData: buildMissionReportData,
  classifyContext: missionReportContext,
  analyzeConfidence: missionReportConfidence
});
