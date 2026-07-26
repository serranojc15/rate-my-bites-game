// Bite Buddy League v0.4.4.1 — simulated group leaderboard seed data.
(function (root) {
  "use strict";

  const members = Object.freeze([
    Object.freeze({ groupId: "demo-group", userId: "sim-avery", displayName: "Avery", avatar: "A", rankId: "people-detective", totalXp: 1280, bestFreshVariantScore: 285, firstAttemptAverage: 246, completedFreshVariants: 6, lastPlayedAt: "2026-07-25T21:15:00.000Z", simulated: true }),
    Object.freeze({ groupId: "demo-group", userId: "sim-jordan", displayName: "Jordan", avatar: "J", rankId: "clue-tracker", totalXp: 820, bestFreshVariantScore: 270, firstAttemptAverage: 228, completedFreshVariants: 4, lastPlayedAt: "2026-07-25T20:00:00.000Z", simulated: true }),
    Object.freeze({ groupId: "demo-group", userId: "sim-taylor", displayName: "Taylor", avatar: "T", rankId: "table-reader", totalXp: 540, bestFreshVariantScore: 245, firstAttemptAverage: 214, completedFreshVariants: 2, lastPlayedAt: "2026-07-25T18:30:00.000Z", simulated: true }),
    Object.freeze({ groupId: "demo-group", userId: "sim-morgan", displayName: "Morgan", avatar: "M", rankId: "table-reader", totalXp: 360, bestFreshVariantScore: 220, firstAttemptAverage: 205, completedFreshVariants: 1, lastPlayedAt: "2026-07-24T19:45:00.000Z", simulated: true }),
    Object.freeze({ groupId: "demo-group", userId: "sim-casey", displayName: "Casey", avatar: "C", rankId: "rookie-biter", totalXp: 190, bestFreshVariantScore: 180, firstAttemptAverage: 170, completedFreshVariants: 1, lastPlayedAt: "2026-07-23T17:10:00.000Z", simulated: true })
  ]);

  root.BiteBuddyGroupLeaderboardData = Object.freeze({
    version: 1,
    groupId: "demo-group",
    groupName: "Dinner Detectives",
    members
  });
})(window);
