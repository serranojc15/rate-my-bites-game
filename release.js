// Rate My Bites Detective — authoritative current application release identity.
// Historical feature modules may keep their introduction versions, but active UI
// must obtain the running release from this single public interface.
(function (root) {
  "use strict";

  const VERSION = "v0.5.0";
  const RELEASE_NAME = "The Party";
  const DISPLAY_LABEL = `Rate My Bites Detective · ${VERSION}`;

  function each(selector, callback) {
    if (!root.document?.querySelectorAll) return;
    root.document.querySelectorAll(selector).forEach(callback);
  }

  function setText(selector, value) {
    each(selector, element => { element.textContent = value; });
  }

  function applyCurrentReleaseIdentity() {
    const document = root.document;
    if (!document) return false;

    document.title = `Rate My Bites Detective ${VERSION}`;

    const badge = document.querySelector?.("#directorCutBuild");
    if (badge) {
      badge.innerHTML = `<span>Rate My Bites Detective</span><strong>${VERSION}</strong>`;
      badge.setAttribute?.("aria-hidden", "true");
    }

    setText(".final-reveal-version strong", VERSION);
    setText(".director-version strong", VERSION);
    setText(".mission-classification strong", VERSION);
    setText(".hero > .eyebrow", DISPLAY_LABEL);
    setText(".hall .eyebrow", DISPLAY_LABEL);
    setText(".living-toolbar > div:first-child > span", `${VERSION} · Living Conversations`);

    each(".final-reveal-version", element => {
      element.setAttribute?.("aria-label", `Rate My Bites Detective ${VERSION}, The Final Reveal`);
    });
    each(".director-version", element => {
      const featureName = element.querySelector?.("span")?.textContent || "Director's Cut";
      element.setAttribute?.("aria-label", `Rate My Bites Detective ${VERSION}, ${featureName}`);
    });

    document.body?.classList?.add("release-ready");
    return true;
  }

  root.BiteBuddyRelease = Object.freeze({
    version: VERSION,
    releaseName: RELEASE_NAME,
    displayLabel: DISPLAY_LABEL,
    apply: applyCurrentReleaseIdentity
  });
})(window);
