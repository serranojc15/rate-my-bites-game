// Sprint v0.4.3.0 — final navigation and visible-version polish.

function openMissionConversationReview() {
  document.querySelector(".mission-conversation-modal")?.remove();

  const events = typeof livingDinnerStory !== "undefined" && Array.isArray(livingDinnerStory.events)
    ? livingDinnerStory.events
    : [];

  const modal = document.createElement("div");
  modal.className = "mission-conversation-modal";
  modal.innerHTML = `<div class="mission-conversation-backdrop" data-mission-conversation-close></div>
    <section class="mission-conversation-dialog" role="dialog" aria-modal="true" aria-labelledby="missionConversationTitle">
      <header>
        <div>
          <p class="eyebrow">Episode transcript</p>
          <h2 id="missionConversationTitle">Review Conversations</h2>
        </div>
        <button class="mission-conversation-close" type="button" data-mission-conversation-close aria-label="Close conversation review">×</button>
      </header>
      ${events.length ? `<ol>${events.map((event, index) => `<li>
        <span>${String(index + 1).padStart(2, "0")} · ${escapeHtml(event.shot || conversationLabel(event.kind))}</span>
        <strong>${escapeHtml(event.speaker || "Conversation")}</strong>
        <blockquote>${escapeHtml(event.text || "No dialogue recorded.")}</blockquote>
        ${event.beat ? `<p>${escapeHtml(event.beat)}</p>` : ""}
      </li>`).join("")}</ol>` : `<p class="mission-empty mission-empty-large">No conversation transcript is available for this episode.</p>`}
    </section>`;

  document.body.appendChild(modal);
  document.body.classList.add("modal-open");
  const dialog = modal.querySelector(".mission-conversation-dialog");
  const closeButton = modal.querySelector(".mission-conversation-close");
  const previouslyFocused = document.activeElement;

  const close = () => {
    modal.remove();
    document.body.classList.remove("modal-open");
    if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    document.removeEventListener("keydown", handleKeydown);
  };

  const handleKeydown = event => {
    if (event.key === "Escape") close();
  };

  modal.querySelectorAll("[data-mission-conversation-close]").forEach(element => {
    element.addEventListener("click", close);
  });
  document.addEventListener("keydown", handleKeydown);
  closeButton?.focus();
  dialog?.scrollTo({ top: 0 });
}

const missionReportPolishBaseRenderer = renderMissionReport;
renderMissionReport = function () {
  missionReportPolishBaseRenderer();
  const conversationButton = document.querySelector("#missionReviewConversations");
  if (conversationButton) conversationButton.onclick = openMissionConversationReview;
};

const missionReportPolishBaseRender = render;
render = function () {
  missionReportPolishBaseRender();
  const sprintLabel = app.querySelector(".sprint4-hero .eyebrow");
  if (sprintLabel) sprintLabel.textContent = "Bite Buddy League · Sprint 4.3";
  missionReportInstallVersion();
};

render();
