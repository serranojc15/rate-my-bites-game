// Sprint 4 — canonical character voice profiles.
(function (root) {
  "use strict";

  const characters = root.RateMyBitesCharacterBible;
  if (!characters) throw new Error("RateMyBitesCharacterBible must load before voiceBible.js");

  const clone = value => JSON.parse(JSON.stringify(value));
  const authored = {
    pup: {
      speakingRhythm: "Warm medium pace; short welcoming phrases; a small lift on invitations.",
      vocabulary: ["table", "dinner", "friends", "adventure", "nice choice", "let’s see"],
      humorStyle: "Playful food enthusiasm without sarcasm or a punchline at someone’s expense.",
      emotionalRange: ["welcoming", "curious", "gently suspenseful", "encouraging", "fond farewell"],
      typicalExpressions: ["Ready for another dinner adventure?", "Nice choice!", "See you at the next table."],
      neverUses: ["obviously", "you should have known", "failure", "loser", "idiot", "case closed, rookie"],
      examples: [
        "Hey! I’m Pup. Ready for another dinner adventure? Let’s see who’s joining The Party tonight!",
        "Something feels a little unusual tonight. Keep your eyes open.",
        "Good food. Great friends. See you at the next table."
      ],
      direction: "Friendly maître d’, Disney-style attraction host, loyal golden retriever, helpful dinner companion.",
      futureElevenLabsVoiceId: null
    },
    emma: {
      speakingRhythm: "Quick, lightly teasing, with a pause before the detail that matters.",
      vocabulary: ["different", "photo", "bright", "new", "try", "actually"],
      humorStyle: "Playful misdirection and confident self-awareness.",
      emotionalRange: ["curious", "mischievous", "thoughtful", "quietly caring"],
      typicalExpressions: ["Before anybody says sushi…", "I did a little research.", "Take the picture first."],
      neverUses: ["whatever, I don’t care", "food is just fuel", "I hate trying new things"],
      examples: ["I wanted adventurous. I just wanted it to work for everybody this time."],
      futureElevenLabsVoiceId: null
    },
    ellis: {
      speakingRhythm: "Measured and dry; lets the final word carry the joke.",
      vocabulary: ["for the record", "inventory", "hearty", "fair", "technically"],
      humorStyle: "Mock seriousness and affectionate exaggeration.",
      emotionalRange: ["amused", "competitive", "practical", "unexpectedly sentimental"],
      typicalExpressions: ["For the record…", "I’m maintaining an accurate inventory.", "That seems fair."],
      neverUses: ["fine dining is pointless", "I don’t care about them", "adorbs"],
      examples: ["Dessert has its own inventory rules. I didn’t make them; I respect them."],
      futureElevenLabsVoiceId: null
    },
    grace: {
      speakingRhythm: "Calm, precise, and unhurried; dry observations land without emphasis.",
      vocabulary: ["carefully", "choice", "substitution", "interesting", "on purpose"],
      humorStyle: "Wry understatement and exact reminders.",
      emotionalRange: ["reserved", "curious", "quietly competitive", "touched", "confident"],
      typicalExpressions: ["I like surprises.", "That was very specific.", "On purpose is the important part."],
      neverUses: ["YOLO", "literally dying", "just order for me", "mushrooms are poison"],
      examples: ["I’ll try something new. I just want it to be my something new."],
      futureElevenLabsVoiceId: null
    }
  };

  function profile(character) {
    const detail = authored[character.id] || {};
    return {
      characterId: character.id,
      speakingRhythm: detail.speakingRhythm || "Natural conversational pace with room for other diners to respond.",
      vocabulary: clone(detail.vocabulary || character.favoriteMeals.slice(0, 3)),
      humorStyle: detail.humorStyle || character.humorStyle,
      emotionalRange: clone(detail.emotionalRange || character.personality),
      typicalExpressions: clone(detail.typicalExpressions || [character.memorableQuote]),
      neverUses: clone(detail.neverUses || ["language that contradicts established preferences", "cruel or judgmental jokes"]),
      exampleDialogue: clone(detail.examples || [character.memorableQuote]),
      performanceDirection: detail.direction || `${character.personalitySummary} Keep the delivery natural and conversational.`,
      futureElevenLabsVoiceId: detail.futureElevenLabsVoiceId ?? null,
      implementationStatus: character.id === "pup" ? "recorded-sprint-4" : "profile-only"
    };
  }

  const profiles = Object.fromEntries(
    Object.values(characters.getProfiles()).map(character => [character.id, profile(character)])
  );

  const requiredFields = [
    "characterId", "speakingRhythm", "vocabulary", "humorStyle", "emotionalRange",
    "typicalExpressions", "neverUses", "exampleDialogue", "performanceDirection",
    "futureElevenLabsVoiceId", "implementationStatus"
  ];

  function validate(source = profiles) {
    const errors = [];
    for (const [id, entry] of Object.entries(source || {})) {
      if (entry?.characterId !== id) errors.push(`${id}: voice profile key must match characterId`);
      for (const field of requiredFields) {
        if (entry?.[field] === undefined) errors.push(`${id}.${field} is required`);
      }
      if (id !== "pup" && entry?.implementationStatus !== "profile-only") {
        errors.push(`${id}: only Pup may have implemented voice in Sprint 4`);
      }
    }
    return { valid: errors.length === 0, errors };
  }

  const validation = validate();
  if (!validation.valid) throw new Error(`Invalid Voice Bible: ${validation.errors.join("; ")}`);

  root.RateMyBitesVoiceBible = Object.freeze({
    schemaVersion: 1,
    getProfile: id => profiles[id] ? clone(profiles[id]) : null,
    getProfiles: () => clone(profiles),
    validate
  });
})(window);
