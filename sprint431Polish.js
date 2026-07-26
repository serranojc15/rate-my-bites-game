// Sprint v0.4.3.1 — small compatibility and copy refinements.
(function () {
  "use strict";
  const VERSION = "v0.4.3.1";

  const baseRestaurantReveal431 = restaurantReveal;
  restaurantReveal = function () {
    baseRestaurantReveal431();
    const restaurant = actualRestaurant();
    const explanation = document.querySelector(".reveal-card .explanation");
    if (explanation) {
      explanation.textContent = `${restaurant.name} best balanced the group’s recent behavior, practical needs, social influence, and tonight-specific restaurant context.`;
    }
  };

  const baseRender431Polish = render;
  render = function () {
    baseRender431Polish();
    document.querySelectorAll(".hero .eyebrow").forEach(element => {
      element.textContent = `Bite Buddy League · ${VERSION}`;
    });
    document.querySelectorAll(".living-toolbar > div:first-child > span").forEach(element => {
      element.textContent = `${VERSION} · Living Conversations`;
    });
    document.querySelectorAll(".final-reveal-version strong").forEach(element => {
      element.textContent = VERSION;
    });
  };

  render();
})();
