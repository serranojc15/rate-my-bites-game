// Bite Buddy League v0.4.2.3 — Director's Cut
// Additive presentation layer. Core scoring, planner, evidence, permissions,
// profiles, persistence, and prediction mechanics remain unchanged.

const DIRECTOR_CUT_VERSION = "v0.4.2.3";
const DIRECTOR_CUT_NAME = "Director's Cut";

// The Director's Cut presentation consumes the canonical episode scene list.
// Episode authors edit episodes.js; this layer owns staging, not story truth.
livingDinnerStory.events = cloneEpisodeValue(initialEpisodeDefinition.story.scenes);

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
    <div class="living-frame">
      <div class="camera-label">${conversationLabel(event.kind)}</div>
      <div class="living-visual">${conversationVisual(event)}</div>
      <div class="living-dialogue">
        <p class="living-speaker">${event.kind === "producer" ? "🎬" : event.kind === "interruption" ? "📱" : event.kind === "confessional" ? "🎥" : event.kind === "reaction" ? "👀" : "💬"} ${escapeHtml(event.speaker)}</p>
        <blockquote>${escapeHtml(event.text)}</blockquote>
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
  const finaleClues = livingDinnerStory.finaleClues || diners.map(person => ({
    title: person.role,
    text: person.clues.restaurant
  }));
  app.innerHTML = `<section class="conversation-finale director-finale">
    ${directorCutVersionMarkup(true)}
    <div class="finale-signal"><span></span><span></span><span></span></div>
    <p class="eyebrow">The evidence is locked</p>
    <h1>The room<br>has shifted.</h1>
    <p class="finale-lead">The lights soften. The conversation stops. What sounded casual a moment ago now feels like evidence.</p>
    <div class="finale-clues">
      ${finaleClues.map((clue, index) => `<article><span>${String(index + 1).padStart(2, "0")}</span><strong>${escapeHtml(clue.title)}</strong><p>${escapeHtml(clue.text)}</p></article>`).join("")}
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
