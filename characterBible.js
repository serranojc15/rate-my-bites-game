// Sprint 4 — canonical recurring-character story profiles.
(function (root) {
  "use strict";

  const world = root.RateMyBitesWorld;
  if (!world) throw new Error("RateMyBitesWorld must load before characterBible.js");

  const clone = value => JSON.parse(JSON.stringify(value));
  const characterFacts = world.getCharacters();

  const authored = {
    pup: {
      personalitySummary: "A warm, optimistic host who notices what helps people feel welcome.",
      humorStyle: "Playful food enthusiasm and gentle detective phrasing; never sarcasm.",
      conversationStyle: "Short invitations, clear encouragement, and space for the diners to lead.",
      relationshipToParty: "Host and trusted dinner companion.",
      recurringHabits: ["Greets every table as if it is the best reservation of the night.", "Celebrates people before scores."],
      characterGoals: ["Help every diner feel included.", "Guide without solving the mystery for the player."],
      storyHooks: ["Learns when the best hosting choice is to step back and let the friends talk."],
      continuityNotes: ["Pup is the Host—not the detective and not the narrator.", "Pup never speaks for another character."],
      futureGrowthOpportunities: ["Reveal more of Pup’s hosting philosophy through brief, optional moments."],
      memorableQuote: "Good food. Great friends. See you at the next table."
    },
    emma: {
      personalitySummary: "Curious and adventurous, with a growing instinct to make her bold choices work for the whole table.",
      humorStyle: "Playful misdirection, quick callbacks, and mock-serious defense of her food photography.",
      conversationStyle: "Fast, specific, and visually observant; she often reveals the clue while trying to sound casual.",
      relationshipToParty: "The adventurous recommender who keeps familiar dinners from becoming predictable.",
      recurringHabits: ["Photographs the first bite.", "Pushes back when everyone assumes she will order sushi."],
      characterGoals: ["Eat a little healthier without becoming rigid.", "Use her curiosity to include other people."],
      storyHooks: ["Recommend a new restaurant that surprises the group.", "Let someone else document a dinner while she stays present."],
      continuityNotes: ["Episode 1 established that she had seafood the day before and wanted something different.", "She likes seafood; she does not order it automatically.", "She enjoys mocktails and sparkling water."],
      futureGrowthOpportunities: ["Grow from adventurous chooser into thoughtful group planner."],
      memorableQuote: "Everybody thinks I’m getting sushi. They’re probably wrong."
    },
    ellis: {
      personalitySummary: "Practical, competitive, and good-humored; his jokes usually protect a softer feeling.",
      humorStyle: "Dry exaggeration, mock inventory control, and affectionate corrections to old stories.",
      conversationStyle: "Plainspoken and economical until a favorite meal, photograph, or friend gets involved.",
      relationshipToParty: "The hearty-appetite storyteller who turns shared history into table banter.",
      recurringHabits: ["Counts dinner rolls while denying it.", "Inspects dessert before claiming he is full."],
      characterGoals: ["Keep old friendships active instead of merely nostalgic.", "Admit when a tradition matters to him."],
      storyHooks: ["Let the terrible fishing photograph solve a clue.", "Choose a dessert worth abandoning roll strategy for."],
      continuityNotes: ["Episode 2 established the dinner-roll inventory joke and his affection for the Willow Lake photo wall.", "Ellis loves dessert even though the Episode 2 roll basket left him too full to order it."],
      futureGrowthOpportunities: ["Let Ellis initiate the sentimental plan instead of hiding behind a joke."],
      memorableQuote: "A roll basket is not a race. I just happen to be winning."
    },
    grace: {
      personalitySummary: "Thoughtful, wry, and quietly competitive; she enjoys new food when the decision remains hers.",
      humorStyle: "Understated observations and perfectly timed reminders about past menu mistakes.",
      conversationStyle: "Measured and precise, with warmth underneath a dry delivery.",
      relationshipToParty: "The grounded experimenter who makes the group slow down and listen.",
      recurringHabits: ["Negotiates one substitution carefully.", "Reminds friends that ‘no mushrooms’ is a complete sentence."],
      characterGoals: ["Try new food on her own terms.", "Trust the group to remember what matters without overexplaining."],
      storyHooks: ["Turn the mushroom running joke into a moment of care.", "Encourage another diner to make an adventurous choice."],
      continuityNotes: ["Episode 3 is Grace’s first playable appearance.", "Her mushroom dislike is not an allergy and must never be treated as one."],
      futureGrowthOpportunities: ["Become a confident guide for someone else’s first visit."],
      memorableQuote: "I like surprises. I just prefer knowing whether they contain mushrooms."
    },
    marcus: {
      personalitySummary: "Dependable, dryly funny, and value-minded without putting a price on loyalty.",
      humorStyle: "Deadpan deal analysis and courtroom language for low-stakes menu disputes.",
      conversationStyle: "Concise objections followed by a practical compromise.",
      relationshipToParty: "Emma’s favorite debate partner and the group’s dependable reality check.",
      memorableQuote: "Honestly, I’m mostly here for dessert."
    },
    olivia: {
      personalitySummary: "Warm, organized, and socially perceptive; she can steer a room without controlling it.",
      humorStyle: "Gentle callbacks that turn tension into a shared joke.",
      conversationStyle: "Inclusive questions and well-timed summaries.",
      relationshipToParty: "The unofficial mediator and celebration planner.",
      memorableQuote: "They’ll never figure me out."
    },
    june: {
      personalitySummary: "Observant, sentimental, and quietly playful, with a gift for finding meaning in imperfect details.",
      humorStyle: "Soft denial when everyone correctly identifies what she cares about.",
      conversationStyle: "Reflective stories anchored to places and handmade food.",
      relationshipToParty: "The homecomer who helps old memories become new traditions.",
      memorableQuote: "I came back for the people. The pot pie is a very close second."
    },
    priya: {
      personalitySummary: "Warm, deliberate, and inclusive, while still learning to voice what she wants for herself.",
      humorStyle: "Affectionate philosophy built from seating plans and shared platters.",
      conversationStyle: "Inviting questions that make quieter people part of the table.",
      relationshipToParty: "The bridge-builder who turns separate diners into one group.",
      memorableQuote: "If everyone reaches for the same platter, the room starts talking."
    },
    ben: {
      personalitySummary: "Energetic, generous, and chronically late, with a photographer’s eye for small details.",
      humorStyle: "Optimistic explanations for timing nobody else considers mysterious.",
      conversationStyle: "Fast stories, vivid menu descriptions, and sincere apologies.",
      relationshipToParty: "Grace’s old friend and an enthusiastic occasional guest.",
      memorableQuote: "I’m not late. The appetizer was early."
    },
    sophie: {
      personalitySummary: "Curious, visual, and decisive, always looking for a meal that feels like a place.",
      humorStyle: "Travel-editor precision applied to everyday food.",
      conversationStyle: "Bright sensory details and confident choices.",
      relationshipToParty: "An occasional adventurer from the established Fresh Variant table.",
      memorableQuote: "Nobody touches it until the photo has a horizon."
    },
    daniel: {
      personalitySummary: "Practical, hungry, and good-natured, with an honest respect for generous portions.",
      humorStyle: "Treats appetite as a perfectly valid unit of measurement.",
      conversationStyle: "Direct questions about what arrives on the plate.",
      relationshipToParty: "The practical counterpoint at the Fresh Variant table.",
      memorableQuote: "I’m only asking whether the special requires a takeout box."
    },
    rachel: {
      personalitySummary: "Celebratory, attentive, and optimistic, with a talent for making ordinary plans feel special.",
      humorStyle: "Cheerful over-preparation and self-aware surprise planning.",
      conversationStyle: "Warm toasts and details that show she has been listening.",
      relationshipToParty: "The celebration-maker at the Fresh Variant table.",
      memorableQuote: "A surprise party still counts if I scheduled it."
    },
    maya: {
      personalitySummary: "Grounded, observant, and adaptable, even when a familiar order no longer fits the day.",
      humorStyle: "Bookish understatement and gently exposed contradictions.",
      conversationStyle: "Calm observations followed by a thoughtful change of plan.",
      relationshipToParty: "The adaptable anchor at the Fresh Variant table.",
      memorableQuote: "The usual is only usual until lunch changes the evidence."
    },
    noah: {
      personalitySummary: "Social, patient, and detail-oriented, remembering everyone’s order except his own.",
      humorStyle: "Self-aware hosting mishaps and affectionate memory.",
      conversationStyle: "Patient check-ins and inclusive suggestions.",
      relationshipToParty: "The occasion-keeper at the Fresh Variant table.",
      memorableQuote: "I remembered everyone’s order. Mine can be a surprise."
    },
    liam: {
      personalitySummary: "Direct, loyal, and value-conscious, with a full reading of every posted special.",
      humorStyle: "Exact accounting delivered as friendly common sense.",
      conversationStyle: "Clear questions, clear preferences, and quick loyalty once convinced.",
      relationshipToParty: "The special-reader at the Fresh Variant table.",
      memorableQuote: "I trust the recommendation. I’m still reading the fine print."
    }
  };

  function profile(id, base) {
    const detail = authored[id] || {};
    const defaultHook = base.futureStoryIdeas?.length
      ? base.futureStoryIdeas
      : [`Bring ${base.name} back only when the dinner reveals a new side of the relationship.`];
    return {
      id,
      fullName: base.name,
      portraitId: base.portraitId,
      portrait: world.getAsset(base.portraitId),
      personality: clone(base.personality),
      personalitySummary: detail.personalitySummary || `${base.name} is ${base.personality.join(", ")}.`,
      favoriteMeals: clone(base.favoriteFoods),
      favoriteDrinks: clone(base.favoriteDrinks),
      foodPreferences: [base.signatureOrder, ...base.favoriteFoods],
      dislikes: clone(base.leastFavoriteFoods),
      humorStyle: detail.humorStyle || "Character-specific warmth grounded in established habits.",
      conversationStyle: detail.conversationStyle || "Natural, concise conversation that preserves established personality.",
      relationships: clone(base.relationships),
      relationshipToParty: detail.relationshipToParty || "An established member of The Party.",
      runningJokes: clone(base.runningJokes),
      recurringHabits: clone(detail.recurringHabits || [base.signatureOrder]),
      characterGoals: clone(detail.characterGoals || defaultHook),
      storyHooks: clone(detail.storyHooks || defaultHook),
      continuityNotes: clone(detail.continuityNotes || [base.notes, "A surname has not been established in canon."]),
      episodeAppearances: clone(base.episodeAppearances),
      futureGrowthOpportunities: clone(detail.futureGrowthOpportunities || defaultHook),
      memorableQuote: detail.memorableQuote || base.signatureOrder,
      voiceProfileId: id
    };
  }

  const profiles = Object.fromEntries(
    Object.entries(characterFacts).map(([id, base]) => [id, profile(id, base)])
  );

  const requiredFields = [
    "id", "fullName", "portraitId", "portrait", "personality", "personalitySummary",
    "favoriteMeals", "favoriteDrinks", "foodPreferences", "dislikes", "humorStyle",
    "conversationStyle", "relationships", "relationshipToParty", "runningJokes",
    "recurringHabits", "characterGoals", "storyHooks", "continuityNotes",
    "episodeAppearances", "futureGrowthOpportunities", "memorableQuote", "voiceProfileId"
  ];

  function validate(source = profiles) {
    const errors = [];
    for (const [id, entry] of Object.entries(source || {})) {
      if (entry?.id !== id) errors.push(`${id}: profile key must match id`);
      for (const field of requiredFields) {
        if (entry?.[field] === undefined || entry?.[field] === null) errors.push(`${id}.${field} is required`);
      }
      if (entry?.portrait?.subjectId !== id) errors.push(`${id}: portrait must belong to the character`);
      if (!entry?.memorableQuote?.trim()) errors.push(`${id}: memorable quote is required`);
    }
    return { valid: errors.length === 0, errors };
  }

  const validation = validate();
  if (!validation.valid) throw new Error(`Invalid Character Bible: ${validation.errors.join("; ")}`);

  root.RateMyBitesCharacterBible = Object.freeze({
    schemaVersion: 1,
    getProfile: id => profiles[id] ? clone(profiles[id]) : null,
    getProfiles: () => clone(profiles),
    validate
  });
})(window);
