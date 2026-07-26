// Bite Buddy League v0.4.4.1 — interaction polish for the choice-first flow.
(function (root) {
  "use strict";

  if (typeof root.document === "undefined") return;

  function visiblePersonOpener(personId) {
    const active = root.document.activeElement;
    if (active && active !== root.document.body && active.closest?.(`[data-person="${personId}"]`)) return active.closest(`[data-person="${personId}"]`);
    return [...root.document.querySelectorAll?.(`[data-person="${personId}"]`) || []].find(element => element.getClientRects?.().length) || null;
  }

  if (typeof openPersonCard === "function") {
    const baseOpenPersonCard441 = openPersonCard;
    openPersonCard = function (person) {
      const opener = visiblePersonOpener(person?.id);
      const scrollX = root.scrollX || 0;
      const scrollY = root.scrollY || 0;
      baseOpenPersonCard441(person);
      const modal = root.document.querySelector(".person-modal");
      if (!modal) return;

      let restored = false;
      const restore = () => {
        if (restored) return;
        restored = true;
        root.setTimeout?.(() => {
          try { opener?.focus?.({ preventScroll: true }); } catch { opener?.focus?.(); }
          root.scrollTo?.(scrollX, scrollY);
          root.document.removeEventListener("keydown", onKey, true);
        }, 0);
      };
      const onKey = event => { if (event.key === "Escape") restore(); };
      modal.querySelectorAll("[data-close]").forEach(element => element.addEventListener("click", restore, { once: true }));
      root.document.addEventListener("keydown", onKey, true);
    };
  }

  function positionRestaurantLockDock() {
    if (typeof state === "undefined" || state.screen !== "restaurant") return false;
    const working = root.document.querySelector(".working-prediction");
    const dock = root.document.querySelector(".restaurant-lock-dock");
    if (!working || !dock) return false;
    if (working.nextElementSibling !== dock) working.insertAdjacentElement("afterend", dock);
    dock.classList.add("restaurant-lock-dock-visible");
    return true;
  }

  if (typeof render === "function") {
    const baseRender441Polish = render;
    render = function () {
      baseRender441Polish();
      positionRestaurantLockDock();
      root.BiteBuddyRelease?.apply?.();
    };
  }

  root.BiteBuddySprint441Polish = Object.freeze({
    version: root.BiteBuddyRelease?.version || "v0.4.4.1",
    positionRestaurantLockDock
  });

  positionRestaurantLockDock();
})(window);
