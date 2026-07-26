// Bite Buddy League — authoritative current application release identity.
// Historical feature modules may keep their introduction versions, but active UI
// must obtain the running release from this single public interface.
(function (root) {
  "use strict";

  const VERSION = "v0.4.4.2";
  const RELEASE_NAME = "Restaurant Decision Polish";
  const DISPLAY_LABEL = `Bite Buddy League · ${VERSION}`;

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

    document.title = `Rate My Bites — Bite Buddy League ${VERSION}`;

    const badge = document.querySelector?.("#directorCutBuild");
    if (badge) {
      badge.innerHTML = `<span>Bite Buddy League</span><strong>${VERSION}</strong>`;
      badge.setAttribute?.("aria-hidden", "true");
    }

    setText(".final-reveal-version strong", VERSION);
    setText(".director-version strong", VERSION);
    setText(".mission-classification strong", VERSION);
    setText(".hero > .eyebrow", DISPLAY_LABEL);
    setText(".hall .eyebrow", DISPLAY_LABEL);
    setText(".living-toolbar > div:first-child > span", `${VERSION} · Living Conversations`);

    each(".final-reveal-version", element => {
      element.setAttribute?.("aria-label", `Bite Buddy League ${VERSION}, The Final Reveal`);
    });
    each(".director-version", element => {
      const featureName = element.querySelector?.("span")?.textContent || "Director's Cut";
      element.setAttribute?.("aria-label", `Bite Buddy League ${VERSION}, ${featureName}`);
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
