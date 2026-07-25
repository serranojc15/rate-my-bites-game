// Sprint 4.2 completion layer: turns Living Conversations into a complete
// pre-prediction experience without rewriting the existing game engine.

const sprint42Reasons = [
  { id: "conversation", icon: "💬", label: "Something someone said" },
  { id: "history", icon: "🍽️", label: "Dining history" },
  { id: "deal", icon: "🎟️", label: "Deal or happy hour" },
  { id: "event", icon: "📅", label: "Celebration or event" },
  { id: "gut", icon: "❤️", label: "Gut feeling" },
  { id: "guess", icon: "🤷", label: "Just guessing" }
];

function finishLivingConversation() {
  stopConversationMedia();
  state.screen = "restaurant";
  state.introIndex = 0;
  render();
}

// The cinematic briefing already introduces every diner. After the living
// conversation, move directly into the restaurant investigation rather than
// repeating the older Sprint 3 introduction carousel.
advanceConversation = function () {
  stopConversationMedia();
  if (state.conversationIndex < livingDinnerStory.events.length - 1) {
    state.conversationIndex += 1;
    render();
    return;
  }
  finishLivingConversation();
};

skipConversation = function () {
  stopConversationMedia();
  livingDinnerStory.events.forEach(event => {
    applyStoryInfluence(event);
    storyMemoryRecord(event);
  });
  finishLivingConversation();
};

const sprint42BaseInitialState = initialState;
initialState = function () {
  return {
    ...sprint42BaseInitialState(),
    restaurantReason: null
  };
};

function roomReadMarkup() {
  const restaurantRead = state.livingConfidence?.["group-restaurant"] || 3;
  const direction = restaurantRead > 3 ? "Leaning stronger" : restaurantRead < 3 ? "More uncertain" : "Still balanced";
  const selectedReason = state.restaurantReason;

  return `<section class="room-read-card" aria-label="Living conversation summary">
    <div class="room-read-heading">
      <div>
        <p class="eyebrow">The Room Has Shifted</p>
        <h2>Your live read</h2>
      </div>
      <div class="room-read-meter" aria-label="Restaurant read ${restaurantRead} out of 5">
        <strong>${restaurantRead}/5</strong>
        <span>${direction}</span>
      </div>
    </div>
    <div class="room-read-facts">
      <span>💬 ${livingDinnerStory.events.filter(event => event.kind === "conversation").length} diner comments</span>
      <span>🎥 ${livingDinnerStory.events.filter(event => event.kind === "confessional").length} confessionals</span>
      <span>🧠 ${state.storyMemory?.length || 0} story moments captured</span>
    </div>
    <div class="mind-change-block">
      <strong>What is influencing your prediction?</strong>
      <p>Optional — this will become part of the episode’s future Mission Report.</p>
      <div class="mind-change-options">
        ${sprint42Reasons.map(reason => `<button type="button" class="mind-change-option ${selectedReason === reason.id ? "selected" : ""}" data-reason="${reason.id}"><span>${reason.icon}</span>${reason.label}</button>`).join("")}
      </div>
    </div>
  </section>`;
}

const sprint42BaseRestaurantRound = restaurantRound;
restaurantRound = function () {
  sprint42BaseRestaurantRound();

  const progressWrap = app.querySelector(".progress-wrap");
  if (progressWrap) progressWrap.insertAdjacentHTML("afterend", roomReadMarkup());

  app.querySelectorAll("[data-reason]").forEach(button => {
    button.onclick = () => {
      state.restaurantReason = button.dataset.reason;
      restaurantRound();
    };
  });
};

// Reinitialize once so the new state field exists in the current session.
state = { ...state, restaurantReason: state.restaurantReason || null };
