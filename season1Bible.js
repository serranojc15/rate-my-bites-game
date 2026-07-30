// Sprint 4 — permanent Season 1 continuity source.
(function (root) {
  "use strict";

  const world = root.RateMyBitesWorld;
  if (!world) throw new Error("RateMyBitesWorld must load before season1Bible.js");
  const clone = value => JSON.parse(JSON.stringify(value));

  const season = {
    id: "season-001",
    title: "Huntsville Tables",
    setting: "Huntsville and North Alabama, where a recurring group of friends uses dinner to make room for one another.",
    timeline: [
      { episodeId: "episode-001", order: 1, event: "Olivia’s promotion dinner ends at Casa Luna." },
      { episodeId: "episode-002", order: 2, event: "Priya brings June and Ellis home to Maple & Main in Willow Lake." },
      { episodeId: "episode-003", order: 3, event: "Emma brings Ellis and Grace to The Copper Table for a carefully planned surprise." }
    ],
    recurringRestaurants: [
      "casa-luna", "maple-main", "copper-table", "trailhead-smokehouse",
      "garden-room", "rojo-taco-lab", "lantern-market"
    ],
    partyRoster: ["pup", "emma", "marcus", "olivia", "june", "ellis", "priya", "grace"],
    guestRoster: ["ben", "sophie", "daniel", "rachel", "maya", "noah", "liam"],
    relationships: {
      "emma-marcus": "Longtime friends and favorite debate partners.",
      "emma-olivia": "Olivia can read Emma’s bluff without spoiling it.",
      "june-ellis": "Childhood friends who edit one another’s stories.",
      "june-priya": "Priya created June’s homecoming with care.",
      "ellis-priya": "Priya recognizes when Ellis’s joke protects a real feeling.",
      "emma-grace": "Episode 3 begins a friendship built on curiosity plus careful listening.",
      "ellis-grace": "Dry humor gives them an immediate, low-key competitive rhythm."
    },
    establishedFacts: [
      "Pup is the Host, not the detective or narrator.",
      "Emma likes seafood but resists predictable assumptions and is trying to eat healthier.",
      "Marcus values generous portions, dependable places, and dessert.",
      "Olivia plans celebrations while protecting the group’s pace.",
      "June connects handmade food with people and place.",
      "Ellis loves hearty meals, dinner rolls, dessert, and the traditions he pretends not to care about.",
      "Priya uses shared dishes to create conversation.",
      "Grace enjoys trying new food when the choice remains hers and dislikes mushrooms ordered on her behalf."
    ],
    runningJokes: [
      "Everyone assumes Emma will order sushi.",
      "Marcus’s dessert streak.",
      "Ellis calls dinner rolls the warm-up course and maintains an ‘accurate inventory.’",
      "The Willow Lake fishing photograph embarrasses Ellis less than he claims.",
      "Grace is never again allowing someone else to order mushrooms for her.",
      "Pup treats a good table like the most important reservation in town."
    ],
    importantPastEvents: [
      "Olivia’s Episode 1 promotion dinner made Casa Luna part of the group’s celebration history.",
      "Episode 2 returned June to Willow Lake and made the Maple & Main photo wall part of the group’s shared memory.",
      "Priya’s rule—choose the table that keeps people talking—became optional continuity rather than puzzle-critical knowledge."
    ],
    mysteryOutcomes: [
      { episodeId: "episode-001", solution: "Casa Luna balanced Emma’s desire for something different, Marcus’s value and appetite, and Olivia’s celebration." },
      { episodeId: "episode-002", solution: "Maple & Main joined June’s handmade memory, Priya’s shared-table goal, and Ellis’s affection for the photo wall." },
      { episodeId: "episode-003", solution: "Emma called ahead to The Copper Table for a mushroom-free risotto so Grace could choose something new on her own terms." }
    ],
    unresolvedStoryHooks: [
      "Can Marcus choose sentiment over the best deal?",
      "What happens when Priya is the indecisive diner?",
      "Will June create a new tradition rather than revisit an old one?",
      "Can Grace become the person who encourages someone else’s adventurous order?",
      "When will the old fishing photograph unexpectedly solve a clue?"
    ],
    futureEpisodeIdeas: [
      "A dessert decision where Marcus’s streak becomes the distraction, not the answer.",
      "A breakfast episode that lets Olivia attend without organizing.",
      "A return to Casa Luna where the restaurant remembers The Party.",
      "A low-key guest appearance from Ben that tests Grace’s patience without redefining either character."
    ],
    continuityConstraints: [
      "Every episode must stand alone.",
      "Past events may reward returning players but may never contain a required clue.",
      "A replay may vary authored living details but never the attending Party, restaurant truth, solution, ending, or continuity consequences.",
      "Characters may grow but may not lose established preferences, relationships, or voice patterns without an authored story reason.",
      "Food choices must never be judged, punished, or used to lock content.",
      "Baby Bite, multiplayer, runtime-generated dialogue, achievements, currency, and economy systems remain out of scope."
    ]
  };

  function validate(source = season) {
    const errors = [];
    for (const field of [
      "id", "title", "setting", "timeline", "recurringRestaurants", "partyRoster",
      "guestRoster", "relationships", "establishedFacts", "runningJokes",
      "importantPastEvents", "mysteryOutcomes", "unresolvedStoryHooks",
      "futureEpisodeIdeas", "continuityConstraints"
    ]) {
      if (source?.[field] === undefined || source?.[field] === null) errors.push(`season.${field} is required`);
    }
    for (const id of [...(source?.partyRoster || []), ...(source?.guestRoster || [])]) {
      if (!world.getCharacter(id)) errors.push(`season references unknown character ${id}`);
    }
    for (const id of source?.recurringRestaurants || []) {
      if (!world.getRestaurant(id)) errors.push(`season references unknown restaurant ${id}`);
    }
    return { valid: errors.length === 0, errors };
  }

  const validation = validate();
  if (!validation.valid) throw new Error(`Invalid Season 1 Bible: ${validation.errors.join("; ")}`);

  root.RateMyBitesSeason1Bible = Object.freeze({
    schemaVersion: 1,
    get: () => clone(season),
    validate
  });
})(window);
