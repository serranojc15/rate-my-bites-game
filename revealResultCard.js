// Shared restaurant reveal/result card presentation.
(function (root) {
  "use strict";

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    })[character]);
  }

  function markup(options = {}) {
    const stateClass = options.success === false ? "is-failure" : "is-success";
    return `<article class="reveal-result-card ${stateClass}">
      <div class="reveal-result-image">
        <img src="${escapeHtml(options.imageSrc)}" alt="${escapeHtml(options.imageAlt)}" loading="lazy">
        <span class="reveal-result-score">${escapeHtml(options.score)}</span>
      </div>
      <div class="reveal-result-panel">
        <h2>${escapeHtml(options.title)}</h2>
        <div class="reveal-result-field reveal-result-answer">
          <span>Your Answer</span>
          <p>${escapeHtml(options.playerAnswer)}</p>
        </div>
        <div class="reveal-result-field reveal-result-explanation">
          <span>What Actually Happened</span>
          <p>${escapeHtml(options.explanation)}</p>
        </div>
      </div>
    </article>`;
  }

  root.RateMyBitesRevealResultCard = Object.freeze({ markup });
})(window);
