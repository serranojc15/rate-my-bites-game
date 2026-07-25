// Bite Buddy League v0.4.2.3 — Director's Cut
// Additive presentation layer. Core scoring, planner, evidence, permissions,
// profiles, persistence, and prediction mechanics remain unchanged.

const DIRECTOR_CUT_VERSION = "v0.4.2.3";
const DIRECTOR_CUT_NAME = "Director's Cut";

// Rewrite the episode as a connected exchange rather than isolated monologues.
livingDinnerStory.events = [
  {
    id: "wide-open",
    kind: "conversation",
    speakerId: "emma",
    speaker: "Emma",
    text: "Before anybody says sushi, I had fish yesterday. I want something completely different tonight.",
    emotion: "thoughtful",
    cameraTarget: "emma",
    shot: "WIDE SHOT",
    beat: "The table settles in.",
    influence: { "group-restaurant": -1, "emma-meal": 1 },
    memory: { type: "surprise", label: "Emma broke her seafood pattern" }
  },
  {
    id: "marcus-reacts",
    kind: "reaction",
    speakerId: "marcus",
    speaker: "Marcus",
    text: "That is exactly what someone ordering sushi would say.",
    emotion: "dry",
    cameraTarget: "marcus",
    shot: "REACTION SHOT",
    beat: "Emma gives him a look.",
    influence: { "emma-meal": -1 },
    memory: { type: "humor", label: "Marcus immediately challenged Emma's story" }
  },
  {
    id: "emma-pushback",
    kind: "conversation",
    speakerId: "emma",
    speaker: "Emma",
    text: "You are only suspicious because I used the word 'completely.'",
    emotion: "playful",
    cameraTarget: "emma",
    shot: "QUICK CUT",
    beat: "Marcus tries not to smile."
  },
  {
    id: "marcus-budget",
    kind: "conversation",
    speakerId: "marcus",
    speaker: "Marcus",
    text: "I am flexible. Close, filling, and no financing paperwork at the end.",
    emotion: "dry",
    cameraTarget: "marcus",
    shot: "CLOSE-UP",
    beat: "A beat. Olivia laughs.",
    influence: { "group-restaurant": 1, "marcus-meal": 1 },
    memory: { type: "humor", label: "Marcus requested dinner without financing" }
  },
  {
    id: "olivia-reframes",
    kind: "conversation",
    speakerId: "olivia",
    speaker: "Olivia",
    text: "It is a celebration. Can we choose somewhere everybody will enjoy instead of conducting seafood litigation?",
    emotion: "warm",
    cameraTarget: "olivia",
    shot: "TWO SHOT",
    beat: "The argument dissolves.",
    influence: { "group-restaurant": 1, "olivia-drink": 1 },
    memory: { type: "persuasive", label: "Olivia reframed the decision around the group" }
  },
  {
    id: "pup-observes",
    kind: "pup",
    speaker: "Pup",
    text: "One broken pattern. One budget speech. One person quietly steering the whole table. Which clue matters most?",
    emotion: "observant",
    cameraTarget: "pup",
    shot: "GAME MASTER CUT",
    beat: "Pup lets the question hang."
  },
  {
    id: "producer-emma",
    kind: "producer",
    speaker: "Off-Camera Producer",
    text: "Emma, are you changing your mind—or trying to make everyone think you changed it?",
    emotion: "documentary",
    cameraTarget: "producer",
    shot: "BEHIND THE CAMERA",
    beat: "The room goes quiet."
  },
  {
    id: "emma-confessional",
    kind: "confessional",
    speakerId: "emma",
    speaker: "Emma",
    text: "They are all overthinking this. Which is useful, because now nobody knows what I am ordering.",
    emotion: "playful",
    cameraTarget: "emma",
    shot: "CONFESSIONAL",
    beat: "She smiles directly at the camera.",
    influence: { "emma-meal": -1 },
    memory: { type: "confessional", label: "Emma admitted she enjoys the confusion" }
  },
  {
    id: "deal-interruption",
    kind: "interruption",
    speaker: "Phone Alert",
    text: "Casa Luna: Happy hour patio seating is available for the next 45 minutes.",
    emotion: "urgent",
    cameraTarget: "restaurant",
    shot: "INSERT — PHONE",
    beat: "Every head turns toward the screen.",
    influence: { "group-restaurant": 1, "olivia-drink": 1 },
    memory: { type: "influence", label: "A Casa Luna deal changed the room" }
  },
  {
    id: "marcus-confessional",
    kind: "confessional",
    speakerId: "marcus",
    speaker: "Marcus",
    text: "Happy hour is evidence. I respect evidence.",
    emotion: "serious",
    cameraTarget: "marcus",
    shot: "CONFESSIONAL",
    beat: "He nods as though the case is closed.",
    memory: { type: "humor", label: "Marcus declared happy hour admissible evidence" }
  },
  {
    id: "olivia-reaction",
    kind: "reaction",
    speakerId: "olivia",
    speaker: "Olivia",
    text: "And suddenly Marcus is very interested in the celebration.",
    emotion: "amused",
    cameraTarget: "olivia",
    shot: "REACTION SHOT",
    beat: "Marcus looks away."
  },
  {
    id: "pup-close",
    kind: "pup",
    speaker: "Pup",
    text: "The room has shifted. Someone changed direction, someone revealed a priority, and one notification changed the temperature. Do not chase every clue. Decide which one is true.",
    emotion: "decisive",
    cameraTarget: "pup",
    shot: "SLOW PUSH-IN",
    beat: "The music falls away."
  }
];

const directorCutLabels = {
  conversation: "DINNER CONVERSATION",
  reaction: "REACTION SHOT",
  pup: "GAME MASTER",
  producer: "OFF-CAMERA QUESTION",
  confessional: "CONFESSIONAL",
  interruption: "NEW EVIDENCE"
};

conversationLabel = function (kind) {
  return directorCutLabels[kind] || "LIVE MOMENT";
};

function directorCutVersionMarkup(compact = false) {
  return `<div class="director-version ${compact ? "compact" : ""}" aria-label="Bite Buddy League ${DIRECTOR_CUT_VERSION}, ${DIRECTOR_CUT_NAME}"><strong>${DIRECTOR_CUT_VERSION}</strong><span>${DIRECTOR_CUT_NAME}</span></div>`;
}

function installPersistentVersionBadge() {
  let badge = document.querySelector("#directorCutBuild");
  if (!badge) {
    badge = document.createElement("div");
    badge.id = "directorCutBuild";
    badge.className = "director-build-badge";
    badge.innerHTML = `<span>Bite Buddy League</span><strong>${DIRECTOR_CUT_VERSION}</strong>`;
    document.body.appendChild(badge);
  }
}

// Restore the cinematic finale that the previous completion layer bypassed.
advanceConversation = function () {
  stopConversationMedia();
  if (state.conversationIndex < livingDinnerStory.events.length - 1) {
    state.conversationIndex += 1;
    render();
    return;
  }
  showConversationFinale();
};

skipConversation = function () {
  stopConversationMedia();
  livingDinnerStory.events.forEach(event => {
    applyStoryInfluence(event);
    storyMemoryRecord(event);
  });
  showConversationFinale();
};

livingConversation = function () {
  stopConversationMedia();
  const event = livingDinnerStory.events[state.conversationIndex] || livingDinnerStory.events[0];
  applyStoryInfluence(event);
  storyMemoryRecord(event);
  const progress = Math.round(((state.conversationIndex + 1) / livingDinnerStory.events.length) * 100);
  const isConfessional = event.kind === "confessional";
  const isReaction = event.kind === "reaction";

  app.innerHTML = `<section class="living-stage director-cut camera-${event.cameraTarget} ${isConfessional ? "living-confessional" : ""} ${isReaction ? "living-reaction" : ""}">
    <div class="living-toolbar">
      <div><span>${DIRECTOR_CUT_VERSION} · Living Conversations</span><strong>${escapeHtml(livingDinnerStory.title)}</strong></div>
      <div class="living-tools">
        <button class="briefing-icon-button" id="livingVoice" type="button" aria-label="${state.voiceEnabled ? "Mute dialogue" : "Turn on dialogue"}">${state.voiceEnabled ? "🔊" : "🔇"}</button>
        <button class="text-button light" id="skipLiving" type="button">Skip conversation</button>
      </div>
    </div>
    <div class="briefing-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><span style="width:${progress}%"></span></div>
    <div class="director-shot-label"><span>● REC</span><strong>${escapeHtml(event.shot || conversationLabel(event.kind))}</strong></div>
    <div class="living-frame">
      <div class="camera-label">${conversationLabel(event.kind)}</div>
      <div class="living-visual">${conversationVisual(event)}</div>
      <div class="living-dialogue">
        <p class="living-speaker">${event.kind === "producer" ? "🎬" : event.kind === "interruption" ? "📱" : event.kind === "confessional" ? "🎥" : event.kind === "reaction" ? "👀" : "💬"} ${escapeHtml(event.speaker)}</p>
        <blockquote>${escapeHtml(event.text)}</blockquote>
        ${event.beat ? `<p class="director-beat">${escapeHtml(event.beat)}</p>` : ""}
        ${confidencePulseMarkup(event)}
      </div>
    </div>
    <div class="living-footer">
      <div class="living-memory"><span>Story memory</span><strong>${state.storyMemory.length} moments captured</strong></div>
      <button class="primary-button" id="nextLiving">${state.conversationIndex === livingDinnerStory.events.length - 1 ? "LOCK THE EVIDENCE" : isReaction ? "CUT TO NEXT" : "CONTINUE"}</button>
    </div>
  </section>`;

  speakConversation(event.text);
  document.querySelector("#nextLiving").onclick = advanceConversation;
  document.querySelector("#skipLiving").onclick = skipConversation;
  document.querySelector("#livingVoice").onclick = () => {
    state.voiceEnabled = !state.voiceEnabled;
    if (!state.voiceEnabled) stopConversationMedia();
    render();
  };
};

conversationFinale = function () {
  const read = state.livingConfidence["group-restaurant"] || 3;
  app.innerHTML = `<section class="conversation-finale director-finale">
    ${directorCutVersionMarkup(true)}
    <div class="finale-signal"><span></span><span></span><span></span></div>
    <p class="eyebrow">The evidence is locked</p>
    <h1>The room<br>has shifted.</h1>
    <p class="finale-lead">The lights soften. The conversation stops. What sounded casual a moment ago now feels like evidence.</p>
    <div class="finale-clues">
      <article><span>01</span><strong>A pattern broke</strong><p>Emma rejected the choice everyone expected.</p></article>
      <article><span>02</span><strong>A priority surfaced</strong><p>Marcus revealed that value and convenience matter.</p></article>
      <article><span>03</span><strong>The room reacted</strong><p>One timely deal changed everyone's attention.</p></article>
    </div>
    <div class="finale-read"><span>Your restaurant read</span><strong>${read}/5</strong><div>${Array.from({ length: 5 }, (_, i) => `<i class="${i < read ? "active" : ""}"></i>`).join("")}</div></div>
    <div class="finale-pup director-pup">${photo(host.image, "Pup, Game Master")}<div><span>GAME MASTER</span><p><strong>Pup:</strong> You've already seen every clue. The answer has been hiding in plain sight.</p><em>Did you notice?</em></div></div>
    <button class="primary-button finale-button" id="makeTheCall">MAKE THE CALL</button>
  </section>`;
  speakConversation("The room has shifted. You've already seen every clue. The answer has been hiding in plain sight. Did you notice? Make the call.");
  document.querySelector("#makeTheCall").onclick = () => {
    stopConversationMedia();
    state.screen = "restaurant";
    state.introIndex = 0;
    render();
  };
};

const directorCutBaseRender = render;
render = function () {
  directorCutBaseRender();
  installPersistentVersionBadge();
  const welcome = app.querySelector(".welcome-screen, .welcome, [data-screen='welcome']");
  if (welcome && !welcome.querySelector(".director-version")) welcome.insertAdjacentHTML("afterbegin", directorCutVersionMarkup());
};

installPersistentVersionBadge();
render();
