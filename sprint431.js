// Sprint v0.4.3.1 — Fresh Cases & Pup Voice Studio
(function () {
  "use strict";

  const VERSION = "v0.4.3.1";
  const CASE_ID = "episode-001";
  const HISTORY_KEY = "bite-buddy-case-history-v1";
  const VOICE_KEY = "bite-buddy-pup-voice-v1";
  const world = window.RateMyBitesWorld;
  if (!world) throw new Error("RateMyBitesWorld must load before Fresh Cases.");

  const clone = value => JSON.parse(JSON.stringify(value));
  const original = {
    diners: clone(diners),
    restaurants: clone(restaurants),
    peopleImages: clone(images.people),
    restaurantImages: clone(images.restaurants),
    foodImages: clone(images.food),
    episode: clone(sprint4Episode),
    story: clone(livingDinnerStory)
  };

  const variantBArtwork = world.getCaseArtwork("B");
  const variantCArtwork = world.getCaseArtwork("C");
  const variantBMenu = world.getCaseMenu("B");
  const variantCMenu = world.getCaseMenu("C");

  function person(id, name, role, recent, practical, social, actual) {
    const canonical = world.getCharacter(id);
    if (!canonical || canonical.name !== name) throw new Error(`Fresh Case character ${id} is missing from the Character Bible.`);
    return {
      id, name: canonical.name, portraitId: canonical.portraitId, role,
      intro: `${name} brings a distinct set of habits and tonight-specific priorities.`,
      favorite: recent.favorite,
      funFact: recent.funFact,
      facts: recent.facts,
      permission: "full",
      permissionLabel: "Full case file shared",
      preferences: recent.preferences,
      dislikes: recent.dislikes || [],
      places: recent.places,
      activity: recent.activity,
      clues: {
        restaurant: recent.restaurantClue,
        meal: practical.meal,
        drink: practical.drink,
        dessert: social.dessert
      },
      actual,
      why: social.why
    };
  }

  function place(id, worldId, distance, price, style, atmosphere, description, menu) {
    const canonical = world.getRestaurant(worldId);
    if (!canonical) throw new Error(`Fresh Case restaurant ${worldId} is missing from the Restaurant Bible.`);
    return { id, worldId, name: canonical.name, distance, price, style, atmosphere, description, menu };
  }

  const variants = [
    {
      id: "A", title: "The Great Sushi Debate", label: "Original Case",
      diners: original.diners,
      restaurants: original.restaurants,
      peopleImages: original.peopleImages,
      restaurantImages: original.restaurantImages,
      foodImages: original.foodImages,
      episode: original.episode,
      story: original.story
    },
    {
      id: "B", title: "The Harbor Table", label: "Fresh Variant",
      diners: [
        person("sophie", "Sophie", "The Explorer", {
          favorite: "Coastal plates & bright flavors", funFact: "She keeps a photo journal of standout dinners.",
          facts: ["Usually orders seafood", "Likes patios", "Avoids repeating cuisines"], preferences: ["Seafood", "Citrus", "Patios"], dislikes: ["Repeating yesterday’s meal"], places: ["Harbor & Hearth · 4.7★"],
          activity: [{ icon: "🍽️", title: "Recent meal", text: "Had shrimp tacos yesterday" }, { icon: "🎟️", title: "Deal", text: "Viewed Harbor & Hearth sunset special" }],
          restaurantClue: "Sophie ate shrimp yesterday, so tonight she is looking beyond the obvious seafood choice."
        }, { meal: "She wants something fresh but not seafood again.", drink: "She volunteered to drive." }, { dessert: "She wants a light finish.", why: "Sophie changed her usual pattern, drove the group, and kept dessert light." }, { meal: "Herb roast chicken", drink: "Sparkling lemonade", dessert: "No dessert" }),
        person("daniel", "Daniel", "The Practical One", {
          favorite: "Comfort food & iced tea", funFact: "He judges value by how hungry he is afterward.",
          facts: ["Prefers nearby places", "Looks for specials", "Rarely skips dessert"], preferences: ["Generous portions", "Iced tea", "Value"], places: ["Market House · frequent visit"],
          activity: [{ icon: "🏃", title: "Recent activity", text: "Finished a long workout this afternoon" }, { icon: "🎟️", title: "Deal", text: "Saved a two-for-one entrée offer" }],
          restaurantClue: "Daniel wants a close, moderately priced restaurant with a filling menu."
        }, { meal: "He wants the most filling entrée.", drink: "He nearly always orders unsweet tea." }, { dessert: "His dessert streak is still active.", why: "Daniel chose the filling value option, unsweet tea, and protected his dessert streak." }, { meal: "Braised short rib", drink: "Unsweet tea", dessert: "Apple pie" }),
        person("rachel", "Rachel", "The Celebrator", {
          favorite: "Shareable meals & festive rooms", funFact: "She organizes every birthday dinner.",
          facts: ["Values atmosphere", "Likes shareable food", "Usually orders a celebration drink"], preferences: ["Shareable plates", "Festive atmosphere"], places: ["Harbor & Hearth · saved"],
          activity: [{ icon: "📅", title: "Event clue", text: "Celebrating a promotion tonight" }],
          restaurantClue: "Rachel is celebrating, but wants a place that works for the entire table."
        }, { meal: "She wants something easy to share.", drink: "She is not driving tonight." }, { dessert: "The table plans to share dessert.", why: "Rachel chose the group-friendly restaurant, a celebration drink, and a shareable dessert." }, { meal: "Braised short rib", drink: "Citrus spritz", dessert: "Apple pie" })
      ],
      restaurants: [
        place("luna", "harbor-hearth", "2.6 mi", "$$", "New American", "Warm · lively · sunset patio", "A neighborhood dining room with generous plates and a timely sunset special.", variantBMenu),
        place("cactus", "pier-nine", "5.8 mi", "$$$", "Seafood", "Polished · waterfront", "An upscale seafood room with a beautiful view.", { meal: ["Grilled salmon"], drink: ["Tea"], dessert: ["Cake"] }),
        place("azul", "market-house", "1.5 mi", "$", "Counter service", "Quick · casual", "Affordable bowls and sandwiches in a bright market hall.", { meal: ["Chicken bowl"], drink: ["Water"], dessert: ["Cookie"] })
      ],
      peopleImages: variantBArtwork.images.people,
      restaurantImages: variantBArtwork.images.restaurants,
      foodImages: variantBArtwork.images.food,
      episode: {
        number: 1, title: "The Harbor Table", subtitle: "Context Under Pressure",
        opening: ["Good evening, Biter.", "Tonight’s names and restaurants have changed.", "The reasoning has not.", "Read current context before permanent preference."],
        people: {
          sophie: { narration: ["This is Sophie.", "She loves seafood, but had shrimp yesterday.", "Do not confuse a favorite with tonight’s decision."], confessional: "I want something completely different tonight." },
          daniel: { narration: ["This is Daniel.", "He is hungry, practical, and watching the price."], confessional: "A good special counts as evidence." },
          rachel: { narration: ["This is Rachel.", "She is celebrating, but she wants the group to be happy."], confessional: "The right room matters as much as the menu." }
        }, closing: ["Your briefing is complete.", "Use the same reasoning in a new case.", "Dinner begins now."]
      },
      story: null
    },
    {
      id: "C", title: "The Garden Celebration", label: "Fresh Variant",
      diners: [
        person("maya", "Maya", "The Traditionalist", { favorite: "Italian comfort food", funFact: "She knows every pasta special in town.", facts: ["Usually orders pasta", "Prefers familiar rooms", "Likes value"], preferences: ["Pasta", "Classic desserts"], places: ["Olive & Oak · frequent visit"], activity: [{ icon: "🍽️", title: "Recent meal", text: "Had lasagna at lunch" }], restaurantClue: "Maya already had a heavy Italian lunch and wants something lighter tonight." }, { meal: "She wants the lighter entrée.", drink: "She usually chooses unsweet tea." }, { dessert: "She may share rather than order her own.", why: "Maya broke her pasta pattern and chose the lighter option." }, { meal: "Grilled chicken salad", drink: "Unsweet tea", dessert: "No dessert" }),
        person("noah", "Noah", "The Social Planner", { favorite: "Lively rooms & shared plates", funFact: "He remembers everyone’s usual order.", facts: ["Plans group dinners", "Likes atmosphere", "Values convenience"], preferences: ["Shared plates", "Patios"], places: ["Garden Room · saved"], activity: [{ icon: "📅", title: "Event clue", text: "Celebrating an anniversary" }], restaurantClue: "Noah wants a celebratory room that still works for everyone." }, { meal: "He wants the table’s most shareable entrée.", drink: "He is celebrating and not driving." }, { dessert: "He suggested one dessert for the table.", why: "Noah’s celebration shaped the room, drink, and shared finish." }, { meal: "Steak board", drink: "Berry fizz", dessert: "Chocolate torte" }),
        person("liam", "Liam", "The Value Hunter", { favorite: "Steak & hearty portions", funFact: "He reads every special before the menu.", facts: ["Arrives hungry", "Watches price", "Usually gets dessert"], preferences: ["Steak", "Value", "Sweet tea"], places: ["Garden Room · deal saved"], activity: [{ icon: "🎟️", title: "Deal", text: "Garden Room has a family-style special tonight" }], restaurantClue: "Liam wants the nearby family-style special and a filling meal." }, { meal: "He wants the most filling option.", drink: "He nearly always chooses sweet tea." }, { dessert: "He expects dessert after a workout.", why: "Liam followed the special, chose the filling option, and kept dessert." }, { meal: "Steak board", drink: "Sweet tea", dessert: "Chocolate torte" })
      ],
      restaurants: [
        place("luna", "garden-room", "3.0 mi", "$$", "Contemporary grill", "Garden patio · celebratory", "The Garden Room is a group-friendly grill with a family-style special and a polished patio.", variantCMenu),
        place("cactus", "olive-oak", "6.2 mi", "$$$", "Italian", "Quiet · formal", "A refined Italian dining room.", { meal: ["Lasagna"], drink: ["Water"], dessert: ["Tiramisu"] }),
        place("azul", "corner-cafe", "1.2 mi", "$", "Café", "Casual · quick", "A reliable neighborhood café.", { meal: ["Sandwich"], drink: ["Tea"], dessert: ["Cookie"] })
      ],
      peopleImages: variantCArtwork.images.people,
      restaurantImages: variantCArtwork.images.restaurants,
      foodImages: variantCArtwork.images.food,
      episode: { number: 1, title: "The Garden Celebration", subtitle: "Context Under Pressure", opening: ["Good evening, Biter.", "A new table is waiting.", "Permanent habits are only the beginning."], people: {
        maya: { narration: ["This is Maya.", "She usually loves Italian food.", "She already had lasagna today."], confessional: "Tonight, pasta is not the answer." },
        noah: { narration: ["This is Noah.", "He is celebrating and shaping the group decision."], confessional: "I want the whole table to enjoy this." },
        liam: { narration: ["This is Liam.", "He wants value, quantity, and the special."], confessional: "The deal is part of the decision." }
      }, closing: ["The clues are complete.", "Make the contextual read."] }, story: null
    }
  ];

  function storyFor(variant) {
    if (variant.story) return clone(variant.story);
    const [a, b, c] = variant.diners;
    const restaurant = variant.restaurants[0].name;
    return {
      title: variant.title,
      events: [
        { id: `${variant.id}-recent`, kind: "conversation", speakerId: a.id, speaker: a.name, text: a.clues.restaurant, emotion: "thoughtful", cameraTarget: a.id, influence: { "group-restaurant": 1, [`${a.id}-meal`]: 1 }, memory: { type: "surprise", label: `${a.name} broke a familiar pattern` } },
        { id: `${variant.id}-value`, kind: "conversation", speakerId: c.id, speaker: c.name, text: c.clues.restaurant, emotion: "dry", cameraTarget: c.id, influence: { "group-restaurant": 1, [`${c.id}-meal`]: 1 }, memory: { type: "humor", label: `${c.name} made value part of the evidence` } },
        { id: `${variant.id}-social`, kind: "conversation", speakerId: b.id, speaker: b.name, text: b.clues.restaurant, emotion: "warm", cameraTarget: b.id, influence: { "group-restaurant": 1, [`${b.id}-drink`]: 1 }, memory: { type: "persuasive", label: `${b.name} reframed the decision around the group` } },
        { id: `${variant.id}-deal`, kind: "interruption", speaker: "Phone Alert", text: `${restaurant}: A timely group-friendly offer is available tonight.`, emotion: "urgent", cameraTarget: "restaurant", influence: { "group-restaurant": 1 }, memory: { type: "influence", label: `A timely ${restaurant} factor changed the room` } },
        { id: `${variant.id}-pup`, kind: "pup", speaker: "Pup", text: `The room has shifted. ${a.name} broke a pattern. ${c.name} wants value. ${b.name} is shaping the celebration.`, emotion: "decisive", cameraTarget: "pup" }
      ]
    };
  }

  function validateVariant(variant) {
    const errors = [];
    if (!variant || variant.id === "A") return { valid: true, errors };
    for (const person of variant.diners) {
      const character = world.getCharacter(person.id);
      if (!character) errors.push(`${variant.id}: unknown character ${person.id}`);
      else {
        if (person.name !== character.name) errors.push(`${variant.id}: ${person.id} has the wrong name`);
        if (person.portraitId !== character.portraitId) errors.push(`${variant.id}: ${person.id} has the wrong portraitId`);
        if (variant.peopleImages[person.id] !== world.assetSrc(character.portraitId)) errors.push(`${variant.id}: ${person.id} has the wrong portrait`);
      }
    }
    for (const restaurant of variant.restaurants) {
      const canonical = world.getRestaurant(restaurant.worldId);
      if (!canonical) errors.push(`${variant.id}: unknown restaurant ${restaurant.worldId}`);
      else {
        if (restaurant.name !== canonical.name) errors.push(`${variant.id}: ${restaurant.id} has the wrong restaurant name`);
        if (variant.restaurantImages[restaurant.id] !== world.assetSrc(canonical.artworkId)) errors.push(`${variant.id}: ${restaurant.id} has the wrong restaurant artwork`);
      }
    }
    const actual = variant.restaurants.find(restaurant => restaurant.id === "luna");
    for (const stage of ["meal", "drink", "dessert"]) {
      for (const item of actual?.menu?.[stage] || []) {
        if (!variant.foodImages[item]) errors.push(`${variant.id}: ${item} has no approved ${stage} artwork`);
      }
      for (const person of variant.diners) {
        if (!actual?.menu?.[stage]?.includes(person.actual[stage])) errors.push(`${variant.id}: ${person.id}.${stage} is not on the audited menu`);
      }
    }
    const sceneIds = storyFor(variant).events.map(event => event.id);
    if (new Set(sceneIds).size !== sceneIds.length) errors.push(`${variant.id}: duplicate story scene id`);
    return { valid: errors.length === 0, errors };
  }

  const variantValidation = variants.flatMap(variant => validateVariant(variant).errors);
  if (variantValidation.length) throw new Error(`Invalid Fresh Case content: ${variantValidation.join("; ")}`);

  function getVariant(id) { return variants.find(item => item.id === id) || variants[0]; }
  function applyVariant(id) {
    const variant = getVariant(id);
    diners.splice(0, diners.length, ...clone(variant.diners));
    restaurants.splice(0, restaurants.length, ...clone(variant.restaurants));
    Object.keys(images.people).forEach(key => delete images.people[key]);
    Object.assign(images.people, clone(variant.peopleImages));
    Object.keys(images.restaurants).forEach(key => delete images.restaurants[key]);
    Object.assign(images.restaurants, clone(variant.restaurantImages));
    Object.keys(images.food).forEach(key => delete images.food[key]);
    Object.assign(images.food, clone(variant.foodImages));
    Object.assign(sprint4Episode, clone(variant.episode));
    const story = storyFor(variant);
    livingDinnerStory.title = story.title;
    livingDinnerStory.events.splice(0, livingDinnerStory.events.length, ...story.events);
    return variant;
  }

  function loadHistory() { try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "null") || { attempts: [] }; } catch { return { attempts: [] }; } }
  function saveHistory(history) { try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch {} }
  function recordAttempt() {
    if (state.sprint431AttemptRecorded) return loadHistory();
    const history = loadHistory();
    const entry = { variantId: state.currentVariantId, attemptType: state.attemptType, score: Number(state.score) || 0, verdict: typeof revealVerdict === "function" ? revealVerdict(Number(state.score) || 0).label : "Completed", timestamp: new Date().toISOString() };
    history.attempts.push(entry);
    saveHistory(history);
    state.sprint431AttemptRecorded = true;
    return history;
  }
  function summary() {
    const attempts = loadHistory().attempts;
    const first = attempts[0]?.score ?? null;
    const fresh = attempts.filter(a => a.attemptType === "fresh-variant");
    const replay = attempts.filter(a => a.attemptType === "same-variant-replay");
    return { attempts: attempts.length, first, bestFresh: fresh.length ? Math.max(...fresh.map(a => a.score)) : null, bestReplay: replay.length ? Math.max(...replay.map(a => a.score)) : null };
  }
  function resetAttempt(variantId, attemptType) {
    const timer = state.timerSeconds;
    state = initialState();
    state.timerSeconds = timer;
    state.timeLeft = timer;
    state.currentCaseId = CASE_ID;
    state.currentVariantId = variantId;
    state.previousVariantId = state.currentVariantId;
    state.attemptType = attemptType;
    state.attemptNumber = loadHistory().attempts.length + 1;
    state.selectedEpisodeId = "episode-001";
    state.screen = "planner";
    applyVariant(variantId);
    render();
  }
  function freshVariantId(current) {
    const alternatives = variants.filter(item => item.id !== current);
    const history = loadHistory().attempts;
    const last = history.at(-1)?.variantId;
    return (alternatives.find(item => item.id !== last) || alternatives[0] || variants[0]).id;
  }

  const presets = Object.freeze({
    "system-default": { label: "System Default", rate: 1, pitch: 1 },
    "warm-narrator": { label: "Warm Narrator", rate: 0.92, pitch: 0.98 },
    "deep-detective": { label: "Deep Detective", rate: 0.88, pitch: 0.78 },
    "friendly-host": { label: "Friendly Host", rate: 1, pitch: 1.08 },
    "dramatic-game-master": { label: "Dramatic Game Master", rate: 0.84, pitch: 0.9 }
  });
  const defaults = { enabled: true, preset: "warm-narrator", voiceURI: "", rate: 0.92, pitch: 0.98, volume: 1 };
  const clamp = (value, min, max, fallback) => Number.isFinite(Number(value)) ? Math.min(max, Math.max(min, Number(value))) : fallback;
  function loadVoice() { try { const saved = JSON.parse(localStorage.getItem(VOICE_KEY) || "null") || {}; return { enabled: saved.enabled !== false, preset: presets[saved.preset] ? saved.preset : defaults.preset, voiceURI: typeof saved.voiceURI === "string" ? saved.voiceURI : "", rate: clamp(saved.rate, .5, 2, defaults.rate), pitch: clamp(saved.pitch, 0, 2, defaults.pitch), volume: clamp(saved.volume, 0, 1, defaults.volume) }; } catch { return { ...defaults }; } }
  let voiceSettings = loadVoice();
  let voices = [];
  function refreshVoices() { voices = window.speechSynthesis?.getVoices?.() || []; }
  function saveVoice() { try { localStorage.setItem(VOICE_KEY, JSON.stringify(voiceSettings)); } catch {} state.voiceEnabled = voiceSettings.enabled; }
  function selectedVoice() { return voices.find(v => v.voiceURI === voiceSettings.voiceURI) || voices.find(v => /^en/i.test(v.lang || "")) || null; }
  function speak(text) {
    if (!voiceSettings.enabled || !window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") return false;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(String(text));
    utterance.rate = voiceSettings.rate; utterance.pitch = voiceSettings.pitch; utterance.volume = voiceSettings.volume;
    const voice = selectedVoice(); if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance); return true;
  }
  function cancel() { window.speechSynthesis?.cancel?.(); }
  refreshVoices();
  window.speechSynthesis?.addEventListener?.("voiceschanged", refreshVoices);

  const PupVoice = Object.freeze({ VERSION, presets, get settings() { return { ...voiceSettings }; }, get voices() { return voices.slice(); }, speak, cancel, preview: () => speak("Good evening, Biter. The evidence is ready when you are."), set(next) { voiceSettings = { ...voiceSettings, ...next }; saveVoice(); }, reset() { voiceSettings = { ...defaults }; saveVoice(); } });
  window.PupVoice = PupVoice;
  speakBriefing = speak;
  speakConversation = speak;
  stopBriefingMedia = (function (base) { return function () { base(); cancel(); }; })(stopBriefingMedia);
  stopConversationMedia = (function (base) { return function () { base(); cancel(); }; })(stopConversationMedia);

  let voiceOpener = null;
  function closeVoiceStudio() { document.querySelector(".pup-voice-modal")?.remove(); document.body.classList.remove("modal-open"); voiceOpener?.focus?.(); }
  function openVoiceStudio(opener) {
    voiceOpener = opener || document.activeElement;
    refreshVoices();
    document.querySelector(".pup-voice-modal")?.remove();
    const modal = document.createElement("div"); modal.className = "pup-voice-modal";
    const unavailable = !window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined";
    modal.innerHTML = `<div class="modal-backdrop" data-close></div><section class="pup-voice-card" role="dialog" aria-modal="true" aria-labelledby="pupVoiceTitle"><button class="modal-close" data-close aria-label="Close Pup Voice Studio">×</button><p class="eyebrow">Pup Voice Studio</p><h2 id="pupVoiceTitle">Choose Pup’s voice</h2>${unavailable ? `<p class="voice-unavailable">Spoken narration is unavailable on this browser. The full game remains playable with text.</p>` : ""}<label>Narration <select id="voiceEnabled"><option value="true">On</option><option value="false">Off</option></select></label><label>Voice style <select id="voicePreset">${Object.entries(presets).map(([id,p]) => `<option value="${id}">${p.label}</option>`).join("")}</select></label><label>System voice <select id="voiceURI"><option value="">Automatic English voice</option>${voices.map(v => `<option value="${escapeHtml(v.voiceURI)}">${escapeHtml(v.name)} · ${escapeHtml(v.lang)}</option>`).join("")}</select></label><label>Speaking speed <input id="voiceRate" type="range" min="0.5" max="1.5" step="0.05"><output id="voiceRateOut"></output></label><label>Pitch <input id="voicePitch" type="range" min="0" max="2" step="0.05"><output id="voicePitchOut"></output></label><label>Volume <input id="voiceVolume" type="range" min="0" max="1" step="0.05"><output id="voiceVolumeOut"></output></label><div class="voice-actions"><button class="primary-button" id="voicePreview" type="button">Preview Pup’s Voice</button><button class="secondary-button" id="voiceReset" type="button">Reset Defaults</button></div></section>`;
    document.body.appendChild(modal); document.body.classList.add("modal-open");
    const sync = () => { const s = PupVoice.settings; modal.querySelector("#voiceEnabled").value = String(s.enabled); modal.querySelector("#voicePreset").value = s.preset; modal.querySelector("#voiceURI").value = voices.some(v => v.voiceURI === s.voiceURI) ? s.voiceURI : ""; modal.querySelector("#voiceRate").value = s.rate; modal.querySelector("#voicePitch").value = s.pitch; modal.querySelector("#voiceVolume").value = s.volume; modal.querySelector("#voiceRateOut").textContent = `${s.rate.toFixed(2)}×`; modal.querySelector("#voicePitchOut").textContent = s.pitch.toFixed(2); modal.querySelector("#voiceVolumeOut").textContent = `${Math.round(s.volume * 100)}%`; };
    sync();
    modal.querySelectorAll("[data-close]").forEach(el => el.onclick = closeVoiceStudio);
    modal.querySelector("#voiceEnabled").onchange = e => { PupVoice.set({ enabled: e.target.value === "true" }); if (!PupVoice.settings.enabled) cancel(); sync(); };
    modal.querySelector("#voicePreset").onchange = e => { const preset = presets[e.target.value]; PupVoice.set({ preset: e.target.value, rate: preset.rate, pitch: preset.pitch }); sync(); };
    modal.querySelector("#voiceURI").onchange = e => PupVoice.set({ voiceURI: e.target.value });
    ["Rate","Pitch","Volume"].forEach(name => modal.querySelector(`#voice${name}`).oninput = e => { PupVoice.set({ [name.toLowerCase()]: Number(e.target.value) }); sync(); });
    modal.querySelector("#voicePreview").onclick = () => PupVoice.preview();
    modal.querySelector("#voiceReset").onclick = () => { PupVoice.reset(); sync(); };
    const onKey = e => { if (e.key === "Escape") { closeVoiceStudio(); document.removeEventListener("keydown", onKey); } }; document.addEventListener("keydown", onKey);
    modal.querySelector("select, input, button")?.focus();
  }

  function addVoiceButton() {
    if (document.querySelector("#pupVoiceStudioButton")) return;
    const toolbar = document.querySelector(".briefing-tools, .living-tools, .mission-report-actions");
    if (!toolbar) return;
    const button = document.createElement("button"); button.id = "pupVoiceStudioButton"; button.type = "button"; button.className = "secondary-button pup-voice-entry"; button.textContent = "Pup Voice"; button.setAttribute("aria-label", "Open Pup Voice Studio"); button.onclick = () => openVoiceStudio(button); toolbar.prepend(button);
  }

  const baseInitialState = initialState;
  initialState = function () { const next = baseInitialState(); return { ...next, currentCaseId: CASE_ID, currentVariantId: "A", previousVariantId: null, attemptType: "first-attempt", attemptNumber: loadHistory().attempts.length + 1, sprint431AttemptRecorded: false }; };

  const baseRenderMissionReport = renderMissionReport;
  renderMissionReport = function () {
    if (state.selectedEpisodeId && state.selectedEpisodeId !== "episode-001") {
      baseRenderMissionReport();
      addVoiceButton();
      return;
    }
    recordAttempt();
    baseRenderMissionReport();
    const info = summary();
    const variant = getVariant(state.currentVariantId);
    const actions = document.querySelector(".mission-report-actions");
    if (actions && !document.querySelector("#missionFreshVariant")) {
      const mastery = document.createElement("section"); mastery.className = "mission-section case-mastery";
      const improved = info.bestFresh !== null && info.first !== null && info.bestFresh > info.first;
      mastery.innerHTML = `<div class="mission-section-heading"><span>09</span><div><p>Replay intelligence</p><h2>Case Mastery</h2></div></div><div class="mastery-grid"><div><span>Variant</span><strong>${escapeHtml(variant.id)} · ${escapeHtml(variant.title)}</strong></div><div><span>Attempt type</span><strong>${escapeHtml(state.attemptType.replaceAll("-", " "))}</strong></div><div><span>First attempt</span><strong>${info.first ?? "—"} / 300</strong></div><div><span>Best fresh variant</span><strong>${info.bestFresh ?? "—"} / 300</strong></div><div><span>Total attempts</span><strong>${info.attempts}</strong></div></div><p class="mastery-message"><strong>Pup:</strong> ${improved ? "You improved after the people and restaurants changed. That suggests you learned the reasoning, not just the answers." : "A fresh variant is the best test of whether the reasoning transfers beyond familiar names and answers."}</p>`;
      actions.before(mastery);
      const replay = document.querySelector("#missionReplayEpisode"); replay.textContent = "Replay This Case"; replay.onclick = () => resetAttempt(state.currentVariantId, "same-variant-replay");
      const fresh = document.createElement("button"); fresh.id = "missionFreshVariant"; fresh.className = "primary-button"; fresh.type = "button"; fresh.textContent = "Play Fresh Variant"; fresh.onclick = () => resetAttempt(freshVariantId(state.currentVariantId), "fresh-variant"); actions.insertBefore(fresh, replay);
    }
    addVoiceButton();
  };

  const basePlanner = planner;
  planner = function () { basePlanner(); const strongs = document.querySelectorAll(".planner-summary strong"); if (strongs[1]) strongs[1].textContent = diners.map(p => p.name).join(", "); addVoiceButton(); };
  const baseConversationVisual = conversationVisual;
  conversationVisual = function (event) { if (event.cameraTarget === "restaurant") { const restaurant = actualRestaurant(); return `${photo(images.restaurants[restaurant.id], restaurant.name, "living-restaurant-photo")}<div class="living-name"><span>New evidence</span><strong>${escapeHtml(restaurant.name)}</strong></div>`; } return baseConversationVisual(event); };
  const baseConversationFinale = conversationFinale;
  conversationFinale = function () { baseConversationFinale(); const cards = document.querySelectorAll(".finale-clues article p"); diners.forEach((p, i) => { if (cards[i]) cards[i].textContent = p.clues.restaurant; }); addVoiceButton(); };
  const baseRender = render;
  render = function () {
    if (!state.selectedEpisodeId || state.selectedEpisodeId === "episode-001") applyVariant(state.currentVariantId || "A");
    baseRender();
    document.title = `Rate My Bites — Bite Buddy League ${VERSION}`;
    document.querySelectorAll(".final-reveal-version strong").forEach(el => el.textContent = VERSION);
    addVoiceButton();
  };

  window.BiteBuddyCases = Object.freeze({ version: VERSION, caseId: CASE_ID, variants: variants.map(v => ({ id: v.id, title: v.title })), getVariant: id => clone(getVariant(id)), validateVariant, freshVariantId, summary, applyVariant });
  voiceSettings.enabled = state.voiceEnabled !== false && voiceSettings.enabled;
  saveVoice();
  state = { ...state, currentCaseId: CASE_ID, currentVariantId: state.currentVariantId || "A", attemptType: state.attemptType || "first-attempt", attemptNumber: state.attemptNumber || (loadHistory().attempts.length + 1), sprint431AttemptRecorded: false };
  applyVariant(state.currentVariantId);
  render();
})();
