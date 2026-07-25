const livingDinnerStory = {
  title: "The Great Sushi Debate",
  events: [
    {
      id: "emma-seafood",
      kind: "conversation",
      speakerId: "emma",
      speaker: "Emma",
      text: "I know everyone expects seafood, but I had fish yesterday. I want something completely different tonight.",
      emotion: "thoughtful",
      cameraTarget: "emma",
      influence: { "group-restaurant": -1, "emma-meal": 1 },
      memory: { type: "surprise", label: "Emma broke her seafood pattern" }
    },
    {
      id: "marcus-close",
      kind: "conversation",
      speakerId: "marcus",
      speaker: "Marcus",
      text: "As long as it is close, filling, and does not require a small loan, I am happy.",
      emotion: "dry",
      cameraTarget: "marcus",
      influence: { "group-restaurant": 1, "marcus-meal": 1 },
      memory: { type: "humor", label: "Marcus requested dinner without financing" }
    },
    {
      id: "pup-read",
      kind: "pup",
      speaker: "Pup",
      text: "Interesting. Emma is abandoning a pattern. Marcus has submitted a budget amendment.",
      emotion: "observant",
      cameraTarget: "pup"
    },
    {
      id: "olivia-celebration",
      kind: "conversation",
      speakerId: "olivia",
      speaker: "Olivia",
      text: "It is a celebration, but I want somewhere everyone will actually enjoy—not just somewhere that looks impressive.",
      emotion: "warm",
      cameraTarget: "olivia",
      influence: { "group-restaurant": 1, "olivia-drink": 1 },
      memory: { type: "persuasive", label: "Olivia reframed the restaurant decision around the group" }
    },
    {
      id: "producer-emma",
      kind: "producer",
      speaker: "Off-Camera Producer",
      text: "Emma, are you changing your mind—or trying to make everyone think you are changing your mind?",
      emotion: "documentary",
      cameraTarget: "producer"
    },
    {
      id: "emma-confessional",
      kind: "confessional",
      speakerId: "emma",
      speaker: "Emma",
      text: "They are all overthinking this. Which is useful, because now nobody knows what I am ordering.",
      emotion: "playful",
      cameraTarget: "emma",
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
      memory: { type: "humor", label: "Marcus declared happy hour admissible evidence" }
    },
    {
      id: "pup-close",
      kind: "pup",
      speaker: "Pup",
      text: "The room has shifted. Three clues remain: Emma broke her pattern. Marcus wants value. Olivia wants a celebration everyone can enjoy.",
      emotion: "decisive",
      cameraTarget: "pup"
    }
  ]
};

let conversationSpeech = null;

function stopConversationMedia() {
  if (conversationSpeech && "speechSynthesis" in window) window.speechSynthesis.cancel();
  conversationSpeech = null;
}

function speakConversation(text) {
  if (!state.voiceEnabled || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.96;
  utterance.pitch = 0.92;
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(voice => /Samantha|Alex|Daniel|Google US English/i.test(voice.name)) || voices.find(voice => voice.lang.startsWith("en"));
  if (preferred) utterance.voice = preferred;
  conversationSpeech = utterance;
  window.speechSynthesis.speak(utterance);
}

function storyMemoryRecord(event) {
  if (!event.memory) return;
  if (!state.storyMemory.some(item => item.eventId === event.id)) state.storyMemory.push({ eventId: event.id, ...event.memory });
}

function applyStoryInfluence(event) {
  if (!event.influence || state.appliedInfluence.includes(event.id)) return;
  Object.entries(event.influence).forEach(([key, delta]) => {
    const current = Number(state.livingConfidence[key] || 3);
    state.livingConfidence[key] = Math.max(1, Math.min(5, current + delta));
  });
  state.appliedInfluence.push(event.id);
}

function confidencePulseMarkup(event) {
  if (!event.influence) return "";
  const changes = Object.entries(event.influence).map(([key, delta]) => {
    const label = key === "group-restaurant" ? "Restaurant read" : `${key.split("-")[0]} ${key.split("-")[1]}`;
    return `<span class="confidence-pulse ${delta > 0 ? "up" : "down"}">${delta > 0 ? "↗" : "↘"} ${escapeHtml(label)}</span>`;
  }).join("");
  return `<div class="confidence-pulses" aria-label="Your confidence shifted">${changes}</div>`;
}

function producerControlRoomVisual() {
  return `<div class="control-room-visual" aria-label="Off-camera production control room">
    <div class="control-room-screen"><span>CAM 02</span><div class="audio-wave" aria-hidden="true">${Array.from({ length: 18 }, (_, i) => `<i style="--wave:${(i % 6) + 2}"></i>`).join("")}</div></div>
    <div class="control-room-meta"><span>VOICE FROM BEHIND THE CAMERA</span><strong>Producer</strong><small>The producer is heard, not seen.</small></div>
  </div>`;
}

function conversationVisual(event) {
  if (event.cameraTarget === "producer") return producerControlRoomVisual();
  if (event.cameraTarget === "pup") return `${photo(host.image, "Pup, game master", "living-person-photo")}<div class="living-name"><span>Game Master</span><strong>Pup</strong></div>`;
  if (event.cameraTarget === "restaurant") return `${photo(images.restaurants.luna, "Casa Luna", "living-restaurant-photo")}<div class="living-name"><span>New evidence</span><strong>Casa Luna</strong></div>`;
  const person = diners.find(item => item.id === event.speakerId);
  return `${photo(images.people[event.speakerId], event.speaker, "living-person-photo")}<div class="living-name"><span>${escapeHtml(person?.role || "Diner")}</span><strong>${escapeHtml(event.speaker)}</strong></div>`;
}

function conversationLabel(kind) {
  return { conversation: "DINNER CONVERSATION", pup: "PUP COMMENTARY", producer: "OFF-CAMERA QUESTION", confessional: "CONFESSIONAL", interruption: "NEW EVIDENCE" }[kind] || "LIVE MOMENT";
}

function showConversationFinale() {
  stopConversationMedia();
  state.screen = "conversationFinale";
  render();
}

function advanceConversation() {
  stopConversationMedia();
  if (state.conversationIndex < livingDinnerStory.events.length - 1) {
    state.conversationIndex += 1;
    render();
    return;
  }
  showConversationFinale();
}

function skipConversation() {
  stopConversationMedia();
  livingDinnerStory.events.forEach(event => { applyStoryInfluence(event); storyMemoryRecord(event); });
  showConversationFinale();
}

function livingConversation() {
  stopConversationMedia();
  const event = livingDinnerStory.events[state.conversationIndex] || livingDinnerStory.events[0];
  applyStoryInfluence(event);
  storyMemoryRecord(event);
  const progress = Math.round(((state.conversationIndex + 1) / livingDinnerStory.events.length) * 100);
  const isConfessional = event.kind === "confessional";

  app.innerHTML = `<section class="living-stage camera-${event.cameraTarget} ${isConfessional ? "living-confessional" : ""}">
    <div class="living-toolbar">
      <div><span>Sprint 4.2 · Living Conversations</span><strong>${escapeHtml(livingDinnerStory.title)}</strong></div>
      <div class="living-tools">
        <button class="briefing-icon-button" id="livingVoice" type="button" aria-label="${state.voiceEnabled ? "Mute dialogue" : "Turn on dialogue"}">${state.voiceEnabled ? "🔊" : "🔇"}</button>
        <button class="text-button light" id="skipLiving" type="button">Skip conversation</button>
      </div>
    </div>
    <div class="briefing-progress"><span style="width:${progress}%"></span></div>
    <div class="living-frame">
      <div class="camera-label">● ${conversationLabel(event.kind)}</div>
      <div class="living-visual">${conversationVisual(event)}</div>
      <div class="living-dialogue">
        <p class="living-speaker">${event.kind === "producer" ? "🎬" : event.kind === "interruption" ? "📱" : event.kind === "confessional" ? "🎥" : "💬"} ${escapeHtml(event.speaker)}</p>
        <blockquote>${escapeHtml(event.text)}</blockquote>
        ${confidencePulseMarkup(event)}
      </div>
    </div>
    <div class="living-footer">
      <div class="living-memory"><span>Story memory</span><strong>${state.storyMemory.length} moments captured</strong></div>
      <button class="primary-button" id="nextLiving">${state.conversationIndex === livingDinnerStory.events.length - 1 ? "Lock the Evidence" : "Continue"}</button>
    </div>
  </section>`;

  speakConversation(event.text);
  document.querySelector("#nextLiving").onclick = advanceConversation;
  document.querySelector("#skipLiving").onclick = skipConversation;
  document.querySelector("#livingVoice").onclick = () => { state.voiceEnabled = !state.voiceEnabled; if (!state.voiceEnabled) stopConversationMedia(); render(); };
}

function conversationFinale() {
  const read = state.livingConfidence["group-restaurant"] || 3;
  app.innerHTML = `<section class="conversation-finale">
    <div class="finale-signal"><span></span><span></span><span></span></div>
    <p class="eyebrow">Conversation Complete</p>
    <h1>The room<br>has shifted.</h1>
    <p class="finale-lead">The talking is over. The evidence is locked. Now make the call.</p>
    <div class="finale-clues">
      <article><span>01</span><strong>Pattern broken</strong><p>Emma does not want seafood again.</p></article>
      <article><span>02</span><strong>Value matters</strong><p>Marcus wants close, filling, and affordable.</p></article>
      <article><span>03</span><strong>Celebrate together</strong><p>Olivia wants a place the whole table will enjoy.</p></article>
    </div>
    <div class="finale-read"><span>Your restaurant read</span><strong>${read}/5</strong><div>${Array.from({ length: 5 }, (_, i) => `<i class="${i < read ? "active" : ""}"></i>`).join("")}</div></div>
    <div class="finale-pup">${photo(host.image, "Pup, Game Master")}<p><strong>Pup:</strong> One restaurant. One decision. Trust your read.</p></div>
    <button class="primary-button finale-button" id="makeTheCall">MAKE THE CALL</button>
  </section>`;
  speakConversation("The room has shifted. The evidence is locked. One restaurant. One decision. Make the call.");
  document.querySelector("#makeTheCall").onclick = () => { stopConversationMedia(); state.screen = "restaurant"; render(); };
}

const sprint42InitialState = initialState;
initialState = function () {
  return { ...sprint42InitialState(), conversationIndex: 0, livingConfidence: { "group-restaurant": 3, "emma-meal": 3, "marcus-meal": 3, "olivia-drink": 3 }, appliedInfluence: [], storyMemory: [] };
};

advanceBriefing = function () {
  stopBriefingMedia();
  const scenes = briefingScenes();
  if (state.briefingIndex < scenes.length - 1) { state.briefingIndex += 1; briefing(); }
  else { state.screen = "conversation"; state.conversationIndex = 0; render(); }
};

const sprint41Render = render;
render = function () {
  stopConversationMedia();
  if (state.screen === "conversation" || state.screen === "conversationFinale") {
    stopTimer();
    restartButton.classList.remove("hidden");
    app.classList.remove("screen-enter"); void app.offsetWidth; app.classList.add("screen-enter");
    if (state.screen === "conversation") livingConversation(); else conversationFinale();
    return;
  }
  sprint41Render();
};

const sprint41Reset = reset;
reset = function () { stopConversationMedia(); sprint41Reset(); };
restartButton.onclick = reset;

document.addEventListener("keydown", event => {
  if (state.screen === "conversation" && (event.key === " " || event.key === "ArrowRight")) { event.preventDefault(); advanceConversation(); }
  if (state.screen === "conversationFinale" && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); state.screen = "restaurant"; render(); }
});

state = initialState();
render();