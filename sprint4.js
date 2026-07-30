const sprint4Episode = cloneEpisodeValue(initialEpisodeDefinition.story.briefing);

let briefingTimer = null;
let currentSpeech = null;

function stopBriefingMedia() {
  if (briefingTimer) clearTimeout(briefingTimer);
  briefingTimer = null;
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  currentSpeech = null;
}

function speakBriefing(text) {
  if (!state.voiceEnabled || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 0.82;
  utterance.volume = 0.92;
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(voice => /Daniel|Alex|Samantha|Google UK English Male/i.test(voice.name)) || voices.find(voice => voice.lang.startsWith("en"));
  if (preferred) utterance.voice = preferred;
  currentSpeech = utterance;
  window.speechSynthesis.speak(utterance);
}

function typeBriefingText(element, text, onDone) {
  let index = 0;
  element.textContent = "";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const step = () => {
    if (reducedMotion) {
      element.textContent = text;
      onDone?.();
      return;
    }
    element.textContent = text.slice(0, index++);
    if (index <= text.length) briefingTimer = setTimeout(step, 28);
    else onDone?.();
  };
  step();
}

function briefingScenes() {
  const opening = sprint4Episode.opening.map((line, index) => ({
    kind: index === 0 ? "cold-open" : "mission",
    speaker: "Pup",
    text: line
  }));
  const people = diners.flatMap(person => {
    const profile = sprint4Episode.people[person.id];
    return [
      ...profile.narration.map(line => ({ kind: "person", speaker: "Pup", text: line, person })),
      { kind: "confessional", speaker: person.name, text: profile.confessional, person }
    ];
  });
  const closing = sprint4Episode.closing.map(line => ({ kind: "closing", speaker: "Pup", text: line }));
  return [...opening, ...people, ...closing];
}

function advanceBriefing() {
  stopBriefingMedia();
  const scenes = briefingScenes();
  if (state.briefingIndex < scenes.length - 1) {
    state.briefingIndex += 1;
    briefing();
  } else {
    state.screen = "intro";
    state.introIndex = 0;
    render();
  }
}

function briefing() {
  stopBriefingMedia();
  const scenes = briefingScenes();
  const scene = scenes[state.briefingIndex] || scenes[0];
  const progressValue = Math.round(((state.briefingIndex + 1) / scenes.length) * 100);
  const personVisual = scene.person ? `${photo(images.people[scene.person.id], scene.person.name, "briefing-person-photo")}<div class="briefing-person-meta"><span>${escapeHtml(scene.person.role)}</span><strong>${escapeHtml(scene.person.name)}</strong></div>` : `${photo(host.image, "Pup, Host", "briefing-pup")}<div class="briefing-person-meta"><span>Host</span><strong>Pup</strong></div>`;
  const confessionalClass = scene.kind === "confessional" ? "confessional-scene" : "";

  app.innerHTML = `<section class="mission-briefing ${confessionalClass}">
    <div class="briefing-toolbar">
      <div><span>Episode ${sprint4Episode.number}</span><strong>${sprint4Episode.title}</strong></div>
      <div class="briefing-tools">
        <button class="briefing-icon-button" id="voiceToggle" type="button" aria-label="${state.voiceEnabled ? "Mute narration" : "Turn on narration"}">${state.voiceEnabled ? "🔊" : "🔇"}</button>
        <button class="text-button light" id="skipBriefing" type="button">Skip briefing</button>
      </div>
    </div>
    <div class="briefing-progress"><span style="width:${progressValue}%"></span></div>
    <div class="briefing-visual">${personVisual}${scene.kind === "confessional" ? `<span class="camera-badge">● CONFESSIONAL</span>` : `<span class="classified-badge">CLASSIFIED</span>`}</div>
    <div class="briefing-copy">
      <p class="briefing-speaker">${scene.kind === "confessional" ? "🎥" : "🎙️"} ${escapeHtml(scene.speaker)}</p>
      <h1 id="typedBriefing" aria-live="polite"></h1>
      ${state.briefingIndex === 0 ? '<p class="briefing-hint">Tap anywhere or press Space to continue</p>' : ""}
    </div>
    <button class="briefing-next-hit" id="nextBriefing" type="button" aria-label="Continue briefing"></button>
  </section>`;

  const typed = document.querySelector("#typedBriefing");
  typeBriefingText(typed, scene.text);
  speakBriefing(scene.text);

  document.querySelector("#nextBriefing").onclick = advanceBriefing;
  document.querySelector("#skipBriefing").onclick = () => { stopBriefingMedia(); state.screen = "intro"; state.introIndex = 0; render(); };
  document.querySelector("#voiceToggle").onclick = event => {
    event.stopPropagation();
    state.voiceEnabled = !state.voiceEnabled;
    if (!state.voiceEnabled) stopBriefingMedia();
    briefing();
  };
}

const sprint3InitialState = initialState;
initialState = function () {
  return { ...sprint3InitialState(), briefingIndex: 0, voiceEnabled: true };
};

welcome = function () {
  app.innerHTML = `<div class="hero sprint4-hero"><p class="eyebrow">Rate My Bites Detective</p><div class="show-logo"><span>🎬</span><div><strong>The Living Dinner</strong><small>Host: Pup</small></div></div><h1>Every dinner<br>is an episode.</h1><p class="lead">Enter a cinematic dinner, meet tonight’s diners, and investigate the story before the first prediction.</p><div class="episode-card"><span>Tonight’s episode</span><strong>${sprint4Episode.title}</strong><small>${sprint4Episode.subtitle}</small></div><button class="primary-button wide" id="start">Begin Dinner</button>${hallOfFame()}</div>`;
  document.querySelector("#start").onclick = () => { state.screen = "planner"; render(); };
};

planner = function () {
  app.innerHTML = `<p class="eyebrow">Planner Mode · ${sprint4Episode.title}</p><h1 class="screen-title">Prepare tonight’s mission.</h1>${hostCard("Choose the prediction clock, then I’ll brief you on every diner. Narration can be muted or skipped at any time.")}<section class="planner-card"><h2>Time per prediction</h2><p>Opening a case file does not pause the clock.</p><div class="timer-options">${[{v:30,l:"30 sec",s:"Fast"},{v:60,l:"60 sec",s:"Recommended"},{v:120,l:"120 sec",s:"Investigate"},{v:0,l:"Unlimited",s:"Untimed"}].map(option => `<button class="timer-option ${state.timerSeconds === option.v ? "selected" : ""}" data-timer="${option.v}"><strong>${option.l}</strong><span>${option.s}</span></button>`).join("")}</div><div class="planner-summary"><span>Episode</span><strong>${sprint4Episode.title}</strong><span>Players</span><strong>${diners.map(person => person.name).join(", ")}</strong><span>Opening</span><strong>Voice narration + synchronized text</strong></div></section><div class="actions"><button class="primary-button" id="begin">Begin Mission Briefing</button></div>`;
  app.querySelectorAll(".timer-option").forEach(button => button.onclick = () => { state.timerSeconds = Number(button.dataset.timer); state.timeLeft = state.timerSeconds; render(); });
  document.querySelector("#begin").onclick = () => { state.screen = "briefing"; state.briefingIndex = 0; render(); };
};

const sprint3Render = render;
render = function () {
  stopBriefingMedia();
  if (state.screen === "briefing") {
    stopTimer();
    restartButton.classList.remove("hidden");
    app.classList.remove("screen-enter"); void app.offsetWidth; app.classList.add("screen-enter");
    briefing();
    return;
  }
  sprint3Render();
};

const sprint3Reset = reset;
reset = function () {
  stopBriefingMedia();
  sprint3Reset();
};
restartButton.onclick = reset;

document.addEventListener("keydown", event => {
  if (state.screen === "briefing" && (event.key === " " || event.key === "ArrowRight")) {
    event.preventDefault();
    advanceBriefing();
  }
});

state = initialState();
render();
