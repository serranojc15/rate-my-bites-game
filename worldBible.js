// Sprint 3.1 — canonical series, season, character, restaurant, and artwork data.
(function (root) {
  "use strict";

  const clone = value => JSON.parse(JSON.stringify(value));
  const approved = (id, kind, subjectId, src, alt) => ({
    id,
    kind,
    subjectId,
    src,
    alt,
    status: "approved"
  });

  const assets = {
    "portrait.pup": approved("portrait.pup", "portrait", "pup", "assets/buddies/buddy-dog.webp", "Pup, the Rate My Bites Host"),
    "portrait.emma": approved("portrait.emma", "portrait", "emma", "assets/characters/emma.webp", "Emma smiling in a red top"),
    "portrait.marcus": approved("portrait.marcus", "portrait", "marcus", "assets/characters/marcus.webp", "Marcus in a gray sweater"),
    "portrait.olivia": approved("portrait.olivia", "portrait", "olivia", "assets/characters/olivia.webp", "Olivia looking toward the camera"),
    "portrait.june": approved("portrait.june", "portrait", "june", "assets/characters/june.webp", "June laughing"),
    "portrait.ellis": approved("portrait.ellis", "portrait", "ellis", "assets/characters/ellis.webp", "Ellis smiling outdoors"),
    "portrait.priya": approved("portrait.priya", "portrait", "priya", "assets/characters/priya.webp", "Priya smiling"),
    "portrait.grace": approved("portrait.grace", "portrait", "grace", "assets/characters/grace.webp", "Grace looking toward the camera"),
    "portrait.ben": approved("portrait.ben", "portrait", "ben", "assets/characters/ben.webp", "Ben in a charcoal sweater"),
    "portrait.sophie": approved("portrait.sophie", "portrait", "sophie", "assets/characters/sophie.webp", "Sophie in a denim jacket"),
    "portrait.daniel": approved("portrait.daniel", "portrait", "daniel", "assets/characters/daniel.webp", "Daniel wearing a black hat"),
    "portrait.rachel": approved("portrait.rachel", "portrait", "rachel", "assets/characters/rachel.webp", "Rachel looking to the side"),
    "portrait.maya": approved("portrait.maya", "portrait", "maya", "assets/characters/maya.webp", "Maya smiling"),
    "portrait.noah": approved("portrait.noah", "portrait", "noah", "assets/characters/noah.webp", "Noah holding a camera"),
    "portrait.liam": approved("portrait.liam", "portrait", "liam", "assets/characters/liam.webp", "Liam wearing sunglasses"),

    "restaurant.casa-luna": approved("restaurant.casa-luna", "restaurant", "casa-luna", "assets/restaurants/casa-luna.webp", "The warm dining room at Casa Luna"),
    "restaurant.cactus-cantina": approved("restaurant.cactus-cantina", "restaurant", "cactus-cantina", "assets/restaurants/cactus-cantina.webp", "The colorful dining room at Cactus Cantina"),
    "restaurant.azul-mar": approved("restaurant.azul-mar", "restaurant", "azul-mar", "assets/restaurants/azul-mar.webp", "A polished table at Azul Mar"),
    "restaurant.abuelas-table": approved("restaurant.abuelas-table", "restaurant", "abuelas-table", "assets/restaurants/abuelas-table.webp", "A cozy brick dining room at Abuela’s Table"),
    "restaurant.rojo-taco-lab": approved("restaurant.rojo-taco-lab", "restaurant", "rojo-taco-lab", "assets/restaurants/rojo-taco-lab.webp", "A vivid signature plate at Rojo Taco Lab"),
    "restaurant.plaza-fiesta": approved("restaurant.plaza-fiesta", "restaurant", "plaza-fiesta", "assets/restaurants/plaza-fiesta.webp", "A welcoming table at Plaza Fiesta"),
    "restaurant.maple-main": approved("restaurant.maple-main", "restaurant", "maple-main", "assets/restaurants/maple-main.webp", "The lake-view patio at Maple & Main"),
    "restaurant.dockside-basket": approved("restaurant.dockside-basket", "restaurant", "dockside-basket", "assets/restaurants/dockside-basket.webp", "The marina patio at Dockside Basket"),
    "restaurant.juniper-room": approved("restaurant.juniper-room", "restaurant", "juniper-room", "assets/restaurants/juniper-room.webp", "The refined dining room at The Juniper Room"),
    "restaurant.hearthstone-cafe": approved("restaurant.hearthstone-cafe", "restaurant", "hearthstone-cafe", "assets/restaurants/hearthstone-cafe.webp", "The intimate Hearthstone Café"),
    "restaurant.trailhead-smokehouse": approved("restaurant.trailhead-smokehouse", "restaurant", "trailhead-smokehouse", "assets/restaurants/trailhead-smokehouse.webp", "The lively counter at Trailhead Smokehouse"),
    "restaurant.lantern-market": approved("restaurant.lantern-market", "restaurant", "lantern-market", "assets/restaurants/lantern-market.webp", "The bustling hall at Lantern Market"),
    "restaurant.harbor-hearth": approved("restaurant.harbor-hearth", "restaurant", "harbor-hearth", "assets/restaurants/harbor-hearth.webp", "The water-view terrace at Harbor & Hearth"),
    "restaurant.pier-nine": approved("restaurant.pier-nine", "restaurant", "pier-nine", "assets/restaurants/pier-nine.webp", "The marina deck at Pier Nine"),
    "restaurant.market-house": approved("restaurant.market-house", "restaurant", "market-house", "assets/restaurants/market-house.webp", "The casual counter at Market House"),
    "restaurant.garden-room": approved("restaurant.garden-room", "restaurant", "garden-room", "assets/restaurants/garden-room.webp", "The softly lit dining room at The Garden Room"),
    "restaurant.copper-table": approved("restaurant.copper-table", "restaurant", "copper-table", "assets/restaurants/copper-table.webp", "The warm copper-lit dining room at The Copper Table"),
    "restaurant.olive-oak": approved("restaurant.olive-oak", "restaurant", "olive-oak", "assets/restaurants/olive-oak.webp", "The warm dining room at Olive & Oak"),
    "restaurant.corner-cafe": approved("restaurant.corner-cafe", "restaurant", "corner-cafe", "assets/restaurants/corner-cafe.webp", "The neighborhood counter at Corner Café"),

    "food.fish-tacos": approved("food.fish-tacos", "food", "fish-tacos", "assets/food/fish-tacos.webp", "Fish tacos"),
    "food.chicken-enchiladas": approved("food.chicken-enchiladas", "food", "chicken-enchiladas", "assets/food/chicken-enchiladas.webp", "Chicken enchiladas"),
    "food.steak-fajitas": approved("food.steak-fajitas", "food", "steak-fajitas", "assets/food/steak-fajitas.webp", "Steak fajitas"),
    "food.lime-margarita": approved("food.lime-margarita", "food", "lime-margarita", "assets/food/lime-margarita.webp", "A lime margarita"),
    "food.sweet-tea": approved("food.sweet-tea", "food", "sweet-tea", "assets/food/sweet-tea.webp", "A glass of sweet tea"),
    "food.sparkling-water": approved("food.sparkling-water", "food", "sparkling-water", "assets/food/sparkling-water.webp", "Sparkling water"),
    "food.churros": approved("food.churros", "food", "churros", "assets/food/churros.webp", "Churros"),
    "food.tres-leches": approved("food.tres-leches", "food", "tres-leches", "assets/food/tres-leches.webp", "Tres leches cake"),
    "food.no-dessert": approved("food.no-dessert", "food", "no-dessert", "assets/food/no-dessert.svg", "An empty plate representing no dessert"),
    "food.herb-roast-chicken": approved("food.herb-roast-chicken", "food", "herb-roast-chicken", "assets/food/herb-roast-chicken.webp", "Herb roast chicken"),
    "food.sunday-pot-pie": approved("food.sunday-pot-pie", "food", "sunday-pot-pie", "assets/food/sunday-pot-pie.webp", "Sunday pot pie"),
    "food.smoked-meatloaf": approved("food.smoked-meatloaf", "food", "smoked-meatloaf", "assets/food/smoked-meatloaf.webp", "Smoked meatloaf"),
    "food.sparkling-lemonade": approved("food.sparkling-lemonade", "food", "sparkling-lemonade", "assets/food/sparkling-lemonade.webp", "Sparkling lemonade"),
    "food.root-beer": approved("food.root-beer", "food", "root-beer", "assets/food/root-beer.webp", "A glass of root beer"),
    "food.peach-cobbler": approved("food.peach-cobbler", "food", "peach-cobbler", "assets/food/peach-cobbler.webp", "Peach cobbler"),
    "food.chocolate-chess-pie": approved("food.chocolate-chess-pie", "food", "chocolate-chess-pie", "assets/food/chocolate-chess-pie.webp", "Chocolate chess pie"),
    "food.braised-short-rib": approved("food.braised-short-rib", "food", "braised-short-rib", "assets/food/braised-short-rib.webp", "Braised short rib"),
    "food.mushroom-pasta": approved("food.mushroom-pasta", "food", "mushroom-pasta", "assets/food/mushroom-pasta.webp", "Mushroom pasta"),
    "food.unsweet-tea": approved("food.unsweet-tea", "food", "unsweet-tea", "assets/food/unsweet-tea.webp", "Unsweet iced tea"),
    "food.citrus-spritz": approved("food.citrus-spritz", "food", "citrus-spritz", "assets/food/citrus-spritz.webp", "A citrus spritz"),
    "food.apple-pie": approved("food.apple-pie", "food", "apple-pie", "assets/food/apple-pie.webp", "Warm apple pie"),
    "food.lemon-tart": approved("food.lemon-tart", "food", "lemon-tart", "assets/food/lemon-tart.webp", "Lemon tart"),
    "food.grilled-chicken-salad": approved("food.grilled-chicken-salad", "food", "grilled-chicken-salad", "assets/food/grilled-chicken-salad.webp", "Grilled chicken salad"),
    "food.steak-board": approved("food.steak-board", "food", "steak-board", "assets/food/steak-board.webp", "A steak board with potatoes"),
    "food.vegetable-risotto": approved("food.vegetable-risotto", "food", "vegetable-risotto", "assets/food/vegetable-risotto.webp", "Vegetable risotto"),
    "food.berry-fizz": approved("food.berry-fizz", "food", "berry-fizz", "assets/food/berry-fizz.webp", "A berry fizz"),
    "food.chocolate-torte": approved("food.chocolate-torte", "food", "chocolate-torte", "assets/food/chocolate-torte.webp", "Chocolate torte"),
    "food.berry-tart": approved("food.berry-tart", "food", "berry-tart", "assets/food/berry-tart.webp", "Berry tart"),

    "scene.midnight-breakfast": approved("scene.midnight-breakfast", "scene", "midnight-breakfast", "assets/scenes/midnight-breakfast.svg", "A moonlit diner table prepared for breakfast")
  };

  // Legacy Fresh Variants remain playable, so their visual truth is audited here too.
  const caseArtwork = {
    B: {
      people: {
        sophie: "portrait.sophie",
        daniel: "portrait.daniel",
        rachel: "portrait.rachel"
      },
      restaurants: {
        luna: "restaurant.harbor-hearth",
        cactus: "restaurant.pier-nine",
        azul: "restaurant.market-house"
      },
      food: {
        "Herb roast chicken": "food.herb-roast-chicken",
        "Braised short rib": "food.braised-short-rib",
        "Mushroom pasta": "food.mushroom-pasta",
        "Sparkling lemonade": "food.sparkling-lemonade",
        "Unsweet tea": "food.unsweet-tea",
        "Citrus spritz": "food.citrus-spritz",
        "Apple pie": "food.apple-pie",
        "Lemon tart": "food.lemon-tart",
        "No dessert": "food.no-dessert"
      }
    },
    C: {
      people: {
        maya: "portrait.maya",
        noah: "portrait.noah",
        liam: "portrait.liam"
      },
      restaurants: {
        luna: "restaurant.garden-room",
        cactus: "restaurant.olive-oak",
        azul: "restaurant.corner-cafe"
      },
      food: {
        "Grilled chicken salad": "food.grilled-chicken-salad",
        "Steak board": "food.steak-board",
        "Vegetable risotto": "food.vegetable-risotto",
        "Unsweet tea": "food.unsweet-tea",
        "Sweet tea": "food.sweet-tea",
        "Berry fizz": "food.berry-fizz",
        "Chocolate torte": "food.chocolate-torte",
        "Berry tart": "food.berry-tart",
        "No dessert": "food.no-dessert"
      }
    }
  };

  const caseMenus = {
    B: {
      meal: ["Herb roast chicken", "Braised short rib", "Mushroom pasta"],
      drink: ["Sparkling lemonade", "Unsweet tea", "Citrus spritz"],
      dessert: ["Apple pie", "Lemon tart", "No dessert"]
    },
    C: {
      meal: ["Grilled chicken salad", "Steak board", "Vegetable risotto"],
      drink: ["Unsweet tea", "Sweet tea", "Berry fizz"],
      dessert: ["Chocolate torte", "Berry tart", "No dessert"]
    }
  };

  const characters = {
    pup: {
      id: "pup",
      name: "Pup",
      portraitId: "portrait.pup",
      homeCity: "Huntsville",
      occupation: "Host",
      personality: ["observant", "encouraging", "quietly theatrical"],
      favoriteFoods: ["anything shared after a solved case"],
      leastFavoriteFoods: ["cold clues"],
      favoriteRestaurants: ["casa-luna", "maple-main"],
      favoriteDrinks: ["water, served with evidence"],
      signatureOrder: "The truth, followed by dessert",
      relationships: { group: "The trusted host who makes every player feel invited." },
      runningJokes: ["Treats dinner decisions like high-stakes detective work."],
      episodeAppearances: ["episode-001", "episode-002", "episode-003"],
      notes: "Pup is the Host. He welcomes the player and supports the dinner without narrating every screen or solving the mystery.",
      futureStoryIdeas: ["Introduce Baby Bite only in a future scoped sprint."]
    },
    emma: {
      id: "emma",
      name: "Emma",
      portraitId: "portrait.emma",
      homeCity: "Huntsville",
      occupation: "Community photographer",
      personality: ["curious", "playful", "adventurous"],
      favoriteFoods: ["seafood", "modern Mexican"],
      leastFavoriteFoods: ["the same cuisine two days in a row"],
      favoriteRestaurants: ["casa-luna", "azul-mar", "rojo-taco-lab"],
      favoriteDrinks: ["mocktails", "sparkling water"],
      signatureOrder: "Something new, photographed before the first bite",
      relationships: { marcus: "Longtime friend and favorite debate partner", olivia: "Trusts her to keep the group together" },
      runningJokes: ["Everyone assumes she will order sushi.", "She photographs the evidence before eating it."],
      episodeAppearances: ["episode-001", "episode-003"],
      notes: "Her curiosity is real; her unpredictability is partly for fun.",
      futureStoryIdeas: ["Let her confidently recommend a restaurant that surprises the group."]
    },
    marcus: {
      id: "marcus",
      name: "Marcus",
      portraitId: "portrait.marcus",
      homeCity: "Huntsville",
      occupation: "Operations analyst",
      personality: ["dependable", "dryly funny", "budget-minded"],
      favoriteFoods: ["beef", "comfort food", "dessert"],
      leastFavoriteFoods: ["tiny portions"],
      favoriteRestaurants: ["plaza-fiesta", "abuelas-table", "casa-luna"],
      favoriteDrinks: ["sweet tea"],
      signatureOrder: "The filling option, plus whatever deal is admissible",
      relationships: { emma: "Challenges every suspiciously specific claim", olivia: "Pretends her plans do not always work on him" },
      runningJokes: ["His dessert streak.", "Treats happy hour like courtroom evidence."],
      episodeAppearances: ["episode-001"],
      notes: "Never make him only the cheap friend; loyalty and consistency matter to him.",
      futureStoryIdeas: ["Make him choose sentiment over the better deal."]
    },
    olivia: {
      id: "olivia",
      name: "Olivia",
      portraitId: "portrait.olivia",
      homeCity: "Huntsville",
      occupation: "Events coordinator",
      personality: ["warm", "organized", "socially perceptive"],
      favoriteFoods: ["shareable plates"],
      leastFavoriteFoods: ["anything that makes the group rush"],
      favoriteRestaurants: ["casa-luna", "plaza-fiesta"],
      favoriteDrinks: ["lime margaritas"],
      signatureOrder: "One thing for herself and one thing for the table",
      relationships: { emma: "Reads her bluffs without spoiling the fun", marcus: "Can turn his objections into a group joke" },
      runningJokes: ["Remembers everyone’s favorite restaurant.", "Accidentally becomes the group’s unofficial mediator."],
      episodeAppearances: ["episode-001"],
      notes: "She steers the room without making every decision.",
      futureStoryIdeas: ["Give her a celebration where someone else handles the plan."]
    },
    june: {
      id: "june",
      name: "June",
      portraitId: "portrait.june",
      homeCity: "Willow Lake",
      occupation: "Museum exhibit designer",
      personality: ["observant", "sentimental", "quietly playful"],
      favoriteFoods: ["hand pies", "comfort food"],
      leastFavoriteFoods: ["rushed dinners"],
      favoriteRestaurants: ["maple-main", "hearthstone-cafe"],
      favoriteDrinks: ["sparkling lemonade"],
      signatureOrder: "The dish with a story attached",
      relationships: { ellis: "Childhood friend who remembers every embarrassing photograph", priya: "Grateful she made the homecoming happen" },
      runningJokes: ["Insists she did not come home for the pot pie."],
      episodeAppearances: ["episode-002"],
      notes: "Nostalgia guides her, but should not become her only trait.",
      futureStoryIdeas: ["Have her create a new tradition instead of revisiting an old one."]
    },
    ellis: {
      id: "ellis",
      name: "Ellis",
      portraitId: "portrait.ellis",
      homeCity: "Willow Lake",
      occupation: "Parks and trails coordinator",
      personality: ["good-humored", "practical", "competitive"],
      favoriteFoods: ["smoked plates", "dinner rolls"],
      leastFavoriteFoods: ["tiny plates"],
      favoriteRestaurants: ["trailhead-smokehouse", "maple-main"],
      favoriteDrinks: ["sweet tea"],
      signatureOrder: "The heartiest entrée and an accurate roll inventory",
      relationships: { june: "Childhood friend whose stories he edits for dramatic accuracy", priya: "Respects how she gets everyone to the same table" },
      runningJokes: ["Calls dinner rolls the warm-up course.", "Denies caring about the old fishing photograph."],
      episodeAppearances: ["episode-002", "episode-003"],
      notes: "His jokes hide affection, never contempt.",
      futureStoryIdeas: ["Let the terrible fishing picture unexpectedly solve a clue."]
    },
    priya: {
      id: "priya",
      name: "Priya",
      portraitId: "portrait.priya",
      homeCity: "Huntsville",
      occupation: "Neighborhood program director",
      personality: ["warm", "deliberate", "inclusive"],
      favoriteFoods: ["shared platters", "local specialties"],
      leastFavoriteFoods: ["meals ordered in total isolation"],
      favoriteRestaurants: ["maple-main", "lantern-market"],
      favoriteDrinks: ["root beer"],
      signatureOrder: "The platter that makes a full trip around the table",
      relationships: { june: "Planned her homecoming with care", ellis: "Knows when his jokes are hiding a real feeling" },
      runningJokes: ["Can turn any seating plan into a philosophy of friendship."],
      episodeAppearances: ["episode-002"],
      notes: "She creates connection, but she should also have wants of her own.",
      futureStoryIdeas: ["Let her be the indecisive one while the others support her."]
    },
    grace: {
      id: "grace",
      name: "Grace",
      portraitId: "portrait.grace",
      homeCity: "Huntsville",
      occupation: "Landscape architect",
      personality: ["wry", "thoughtful", "quietly competitive"],
      favoriteFoods: ["roasted vegetables", "crispy potatoes"],
      leastFavoriteFoods: ["mushrooms ordered on her behalf"],
      favoriteRestaurants: ["garden-room", "maple-main"],
      favoriteDrinks: ["unsweet tea"],
      signatureOrder: "A familiar favorite with one carefully negotiated substitution",
      relationships: { ben: "Old friend and enthusiastic source of unsolicited menu advice" },
      runningJokes: ["Says she is never ordering mushrooms again."],
      episodeAppearances: ["episode-003"],
      notes: "Grace enjoys trying new foods when the choice remains hers. Her mushroom boundary is humorous continuity, never an allergy or a puzzle penalty.",
      futureStoryIdeas: ["Let Grace become the confident person who encourages someone else to try a new dish."]
    },
    ben: {
      id: "ben",
      name: "Ben",
      portraitId: "portrait.ben",
      homeCity: "New York",
      occupation: "Food photographer",
      personality: ["energetic", "generous", "chronically late"],
      favoriteFoods: ["breakfast sandwiches", "wood-fired pizza"],
      leastFavoriteFoods: ["anything served before he arrives"],
      favoriteRestaurants: ["corner-cafe", "casa-luna"],
      favoriteDrinks: ["black coffee"],
      signatureOrder: "Whatever everyone already ordered, plus coffee",
      relationships: { grace: "Old friend who never lets him rewrite the timing of a story" },
      runningJokes: ["Is always 'finally back from New York.'"],
      episodeAppearances: [],
      notes: "Reserved recurring character. His portrait is fixed before his first playable appearance.",
      futureStoryIdeas: ["Use a guest appearance without making earlier seasons required."]
    },
    sophie: {
      id: "sophie",
      name: "Sophie",
      portraitId: "portrait.sophie",
      homeCity: "Huntsville",
      occupation: "Travel editor",
      personality: ["curious", "visual", "decisive"],
      favoriteFoods: ["coastal plates", "bright flavors"],
      leastFavoriteFoods: ["the same meal twice"],
      favoriteRestaurants: ["harbor-hearth"],
      favoriteDrinks: ["sparkling lemonade"],
      signatureOrder: "The freshest plate that is not yesterday’s dinner",
      relationships: { daniel: "Appreciates his practical counterpoint", rachel: "Trusts her celebration instincts" },
      runningJokes: ["Keeps a photo journal of meals nobody is allowed to touch yet."],
      episodeAppearances: ["episode-001"],
      notes: "Appears in Episode 1’s established Fresh Variant B.",
      futureStoryIdeas: []
    },
    daniel: {
      id: "daniel",
      name: "Daniel",
      portraitId: "portrait.daniel",
      homeCity: "Huntsville",
      occupation: "Recreation coordinator",
      personality: ["practical", "hungry", "good-natured"],
      favoriteFoods: ["comfort food", "generous portions"],
      leastFavoriteFoods: ["small plates after a workout"],
      favoriteRestaurants: ["market-house", "harbor-hearth"],
      favoriteDrinks: ["unsweet tea"],
      signatureOrder: "The special most likely to require a takeout box",
      relationships: { sophie: "Calls her photo journal the evidence locker", rachel: "Lets her choose the room if he can inspect the menu" },
      runningJokes: ["Measures value by how hungry he is afterward."],
      episodeAppearances: ["episode-001"],
      notes: "Appears in Episode 1’s established Fresh Variant B.",
      futureStoryIdeas: []
    },
    rachel: {
      id: "rachel",
      name: "Rachel",
      portraitId: "portrait.rachel",
      homeCity: "Huntsville",
      occupation: "Fundraising producer",
      personality: ["celebratory", "attentive", "optimistic"],
      favoriteFoods: ["shareable meals", "warm desserts"],
      leastFavoriteFoods: ["anything that rushes the table"],
      favoriteRestaurants: ["harbor-hearth"],
      favoriteDrinks: ["citrus spritz"],
      signatureOrder: "One toast and one dessert for the table",
      relationships: { sophie: "Knows when a new choice will interest her", daniel: "Can make his practical choice feel festive" },
      runningJokes: ["Organizes every birthday dinner, including her own surprise party."],
      episodeAppearances: ["episode-001"],
      notes: "Appears in Episode 1’s established Fresh Variant B.",
      futureStoryIdeas: []
    },
    maya: {
      id: "maya",
      name: "Maya",
      portraitId: "portrait.maya",
      homeCity: "Huntsville",
      occupation: "Bookshop manager",
      personality: ["grounded", "observant", "adaptable"],
      favoriteFoods: ["Italian comfort food"],
      leastFavoriteFoods: ["a second heavy meal in one day"],
      favoriteRestaurants: ["olive-oak", "garden-room"],
      favoriteDrinks: ["unsweet tea"],
      signatureOrder: "The classic choice—unless lunch already claimed it",
      relationships: { noah: "Trusts him to make occasions feel easy", liam: "Enjoys testing his deal logic" },
      runningJokes: ["Knows every pasta special and still occasionally orders salad."],
      episodeAppearances: ["episode-001"],
      notes: "Appears in Episode 1’s established Fresh Variant C.",
      futureStoryIdeas: []
    },
    noah: {
      id: "noah",
      name: "Noah",
      portraitId: "portrait.noah",
      homeCity: "Huntsville",
      occupation: "Community arts producer",
      personality: ["social", "patient", "detail-oriented"],
      favoriteFoods: ["shared plates"],
      leastFavoriteFoods: ["a celebration nobody can enjoy"],
      favoriteRestaurants: ["garden-room"],
      favoriteDrinks: ["berry fizz"],
      signatureOrder: "The dish that gives everyone a reason to reach in",
      relationships: { maya: "Remembers her usual order", liam: "Finds the occasion hidden inside his practical choices" },
      runningJokes: ["Remembers everyone’s order except his own."],
      episodeAppearances: ["episode-001"],
      notes: "Appears in Episode 1’s established Fresh Variant C.",
      futureStoryIdeas: []
    },
    liam: {
      id: "liam",
      name: "Liam",
      portraitId: "portrait.liam",
      homeCity: "Huntsville",
      occupation: "Fitness studio owner",
      personality: ["direct", "loyal", "value-conscious"],
      favoriteFoods: ["steak", "hearty portions"],
      leastFavoriteFoods: ["full-price entrées with side-sized portions"],
      favoriteRestaurants: ["garden-room", "corner-cafe"],
      favoriteDrinks: ["sweet tea"],
      signatureOrder: "The special, after confirming exactly what the special includes",
      relationships: { maya: "Respects her ability to change a plan", noah: "Accepts his restaurant picks after reviewing the numbers" },
      runningJokes: ["Reads every special before he reads the menu."],
      episodeAppearances: ["episode-001"],
      notes: "Appears in Episode 1’s established Fresh Variant C.",
      futureStoryIdeas: []
    }
  };

  const restaurant = (id, name, artworkId, identity, signatureDishes, episodeAppearances, notes) => ({
    id,
    name,
    artworkId,
    identity,
    signatureDishes,
    traditions: [],
    runningJokes: [],
    episodeAppearances,
    notes
  });

  const restaurants = {
    "casa-luna": restaurant("casa-luna", "Casa Luna", "restaurant.casa-luna", "A polished neighborhood gathering place with warm lights and a social patio.", ["Chicken enchiladas", "Steak fajitas", "Churros"], ["episode-001"], "A recurring Huntsville anchor for celebrations."),
    "cactus-cantina": restaurant("cactus-cantina", "Cactus Cantina", "restaurant.cactus-cantina", "Bright, energetic, casual, and quick.", ["Spicy chicken burrito"], ["episode-001"], "Useful when speed and value matter."),
    "azul-mar": restaurant("azul-mar", "Azul Mar", "restaurant.azul-mar", "A sophisticated, seafood-forward coastal room.", ["Grilled mahi tacos"], ["episode-001"], "Feels special, though not always right for the whole table."),
    "abuelas-table": restaurant("abuelas-table", "Abuela’s Table", "restaurant.abuelas-table", "A cozy room built around traditional family recipes.", ["Beef tamales", "Flan"], ["episode-001"], "The dependable comfort-food choice."),
    "rojo-taco-lab": restaurant("rojo-taco-lab", "Rojo Taco Lab", "restaurant.rojo-taco-lab", "A colorful, high-energy room for adventurous tacos.", ["Hot honey chicken tacos"], ["episode-001"], "Emma keeps it on her Must Try list."),
    "plaza-fiesta": restaurant("plaza-fiesta", "Plaza Fiesta", "restaurant.plaza-fiesta", "A lively neighborhood celebration spot with big tables.", ["Combo enchiladas", "Sopapillas"], ["episode-001"], "A trusted group fallback."),
    "maple-main": restaurant("maple-main", "Maple & Main", "restaurant.maple-main", "A Willow Lake supper club where shared platters and local photographs keep people talking.", ["Sunday pot pie", "Herb roast chicken", "Peach cobbler"], ["episode-002"], "The photo wall makes this a place the friends already own in memory."),
    "dockside-basket": restaurant("dockside-basket", "Dockside Basket", "restaurant.dockside-basket", "A quick, casual marina counter.", ["Fish basket"], ["episode-002"], "Great for a stop; less suited to a long reunion."),
    "juniper-room": restaurant("juniper-room", "The Juniper Room", "restaurant.juniper-room", "A quiet, polished room with precise seasonal plates.", ["Seasonal plate"], ["episode-002"], "An occasion restaurant with a formal rhythm."),
    "hearthstone-cafe": restaurant("hearthstone-cafe", "Hearthstone Café", "restaurant.hearthstone-cafe", "A small neighborhood café with comforting bowls.", ["Soup", "Cake"], ["episode-002"], "Cozy, familiar, and intimate."),
    "trailhead-smokehouse": restaurant("trailhead-smokehouse", "Trailhead Smokehouse", "restaurant.trailhead-smokehouse", "Big smoked plates in a lively room outside town.", ["Barbecue plate"], ["episode-002", "episode-003"], "An Ellis favorite."),
    "lantern-market": restaurant("lantern-market", "Lantern Market", "restaurant.lantern-market", "A bright food hall with many independent counters.", ["Market bowl"], ["episode-002"], "Plenty of choice, but no single shared meal."),
    "harbor-hearth": restaurant("harbor-hearth", "Harbor & Hearth", "restaurant.harbor-hearth", "A water-view gathering place with generous plates and a sunset patio.", ["Herb roast chicken", "Braised short rib"], ["episode-001"], "Established Fresh Variant B gathering place."),
    "pier-nine": restaurant("pier-nine", "Pier Nine", "restaurant.pier-nine", "A polished seafood room overlooking the marina.", ["Grilled salmon"], ["episode-001"], "Established Fresh Variant B alternative."),
    "market-house": restaurant("market-house", "Market House", "restaurant.market-house", "A bright, casual counter-service room.", ["Chicken bowl"], ["episode-001"], "Established Fresh Variant B alternative."),
    "garden-room": restaurant("garden-room", "The Garden Room", "restaurant.garden-room", "A contemporary grill with a celebratory dining room.", ["Grilled chicken salad", "Steak board"], ["episode-001", "episode-003"], "Established Fresh Variant C gathering place and an Episode 3 alternative."),
    "copper-table": restaurant("copper-table", "The Copper Table", "restaurant.copper-table", "An intimate neighborhood dining room where copper light, thoughtful substitutions, and a round table make every guest feel considered.", ["Grilled chicken salad", "Steak board", "Vegetable risotto", "Chocolate torte"], ["episode-003"], "Episode 3 introduces the restaurant as Emma’s carefully researched surprise for Grace and Ellis."),
    "olive-oak": restaurant("olive-oak", "Olive & Oak", "restaurant.olive-oak", "A warm, refined Italian dining room.", ["Lasagna"], ["episode-001"], "Established Fresh Variant C alternative."),
    "corner-cafe": restaurant("corner-cafe", "Corner Café", "restaurant.corner-cafe", "A reliable neighborhood café.", ["Sandwich"], ["episode-001"], "Established Fresh Variant C alternative.")
  };

  const series = {
    id: "rate-my-bites-mystery-game",
    title: "Rate My Bites Mystery Game",
    description: "Food mysteries about recurring friends, gathering places, and the memories made around a table.",
    seasonIds: ["season-001"]
  };

  const seasons = {
    "season-001": {
      id: "season-001",
      title: "Huntsville",
      location: "Huntsville and North Alabama",
      description: "Friends read the room, revisit nearby gathering places, and discover that dinner choices reveal the stories they share.",
      mainCast: ["emma", "marcus", "olivia", "ellis", "grace"],
      recurringCast: ["june", "priya"],
      restaurants: Object.keys(restaurants),
      timeline: [
        { episodeId: "episode-001", order: 1, note: "Olivia’s promotion dinner at Casa Luna." },
        { episodeId: "episode-002", order: 2, note: "Priya brings June and Ellis together for a Willow Lake homecoming." },
        { episodeId: "episode-003", order: 3, note: "Emma, Ellis, and Grace discover who quietly changed the special at The Copper Table." }
      ],
      storyNotes: [
        "Every episode must stand alone.",
        "Continuity references reward returning players without carrying puzzle-critical information.",
        "Restaurants should gain traditions and memories when they return."
      ]
    }
  };

  function getAsset(id) {
    return assets[id] ? clone(assets[id]) : null;
  }

  function assetSrc(id) {
    const asset = assets[id];
    if (!asset) throw new Error(`Unknown artwork id: ${id}`);
    return asset.src;
  }

  function getCharacter(id) {
    return characters[id] ? clone(characters[id]) : null;
  }

  function getRestaurant(id) {
    return restaurants[id] ? clone(restaurants[id]) : null;
  }

  function getSeason(id) {
    return seasons[id] ? clone(seasons[id]) : null;
  }

  function getCaseArtwork(id) {
    const assetIds = caseArtwork[id];
    if (!assetIds) return null;
    const images = {};
    for (const [group, mappings] of Object.entries(assetIds)) {
      images[group] = {};
      for (const [label, assetId] of Object.entries(mappings)) images[group][label] = assetSrc(assetId);
    }
    return { assetIds: clone(assetIds), images };
  }

  function getCaseMenu(id) {
    return caseMenus[id] ? clone(caseMenus[id]) : null;
  }

  const slugify = value => String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  function validateBible(snapshot = {}) {
    const sourceAssets = snapshot.assets || assets;
    const sourceCharacters = snapshot.characters || characters;
    const sourceRestaurants = snapshot.restaurants || restaurants;
    const sourceSeries = snapshot.series || series;
    const sourceSeasons = snapshot.seasons || seasons;
    const errors = [];
    const assetPaths = new Set();
    const assetSubjects = new Set();
    const portraitOwners = new Set();
    const characterNames = new Set();
    for (const [id, asset] of Object.entries(sourceAssets)) {
      if (asset.id !== id) errors.push(`${id}: registry key must match asset.id`);
      if (!["portrait", "restaurant", "food", "scene", "background"].includes(asset.kind)) errors.push(`${id}: invalid asset kind`);
      if (id.split(".")[0] !== asset.kind) errors.push(`${id}: asset id prefix must match kind ${asset.kind}`);
      if (!asset.subjectId) errors.push(`${id}: subjectId is required`);
      if (!asset.src || /^(?:https?:|data:)/i.test(asset.src)) errors.push(`${id}: artwork must use a local asset path`);
      if (!asset.alt?.trim()) errors.push(`${id}: alt text is required`);
      if (asset.status !== "approved") errors.push(`${id}: asset is not approved`);
      if (assetPaths.has(asset.src)) errors.push(`${id}: duplicate file assignment ${asset.src}`);
      assetPaths.add(asset.src);
      const subjectKey = `${asset.kind}:${asset.subjectId}`;
      if (assetSubjects.has(subjectKey)) errors.push(`${id}: duplicate ${asset.kind} subject ${asset.subjectId}`);
      assetSubjects.add(subjectKey);
    }
    for (const [id, character] of Object.entries(sourceCharacters)) {
      if (character.id !== id) errors.push(`${id}: character key must match character.id`);
      for (const field of ["name", "portraitId", "homeCity", "occupation", "personality", "favoriteFoods", "leastFavoriteFoods", "favoriteRestaurants", "favoriteDrinks", "signatureOrder", "relationships", "runningJokes", "episodeAppearances", "notes", "futureStoryIdeas"]) {
        if (character[field] === undefined || character[field] === null) errors.push(`${id}: character.${field} is required`);
      }
      for (const field of ["name", "portraitId", "homeCity", "occupation", "signatureOrder", "notes"]) {
        if (typeof character[field] !== "string" || !character[field].trim()) errors.push(`${id}: character.${field} must be a non-empty string`);
      }
      for (const field of ["personality", "favoriteFoods", "leastFavoriteFoods", "favoriteRestaurants", "favoriteDrinks", "runningJokes", "episodeAppearances", "futureStoryIdeas"]) {
        if (!Array.isArray(character[field])) errors.push(`${id}: character.${field} must be an array`);
      }
      if (!character.relationships || Array.isArray(character.relationships) || typeof character.relationships !== "object") {
        errors.push(`${id}: character.relationships must be an object`);
      }
      if (characterNames.has(character.name)) errors.push(`${id}: duplicate character name ${character.name}`);
      characterNames.add(character.name);
      const portrait = sourceAssets[character.portraitId];
      if (!portrait || portrait.kind !== "portrait") errors.push(`${id}: portraitId must reference a portrait`);
      else if (portrait.subjectId !== id) errors.push(`${id}: portrait belongs to ${portrait.subjectId}`);
      if (portraitOwners.has(character.portraitId)) errors.push(`${id}: portrait is already assigned to another character`);
      portraitOwners.add(character.portraitId);
      for (const restaurantId of Array.isArray(character.favoriteRestaurants) ? character.favoriteRestaurants : []) {
        if (!sourceRestaurants[restaurantId]) errors.push(`${id}: unknown favorite restaurant ${restaurantId}`);
      }
    }
    for (const [id, place] of Object.entries(sourceRestaurants)) {
      if (place.id !== id) errors.push(`${id}: restaurant key must match restaurant.id`);
      for (const field of ["name", "artworkId", "identity", "signatureDishes", "traditions", "runningJokes", "episodeAppearances", "notes"]) {
        if (place[field] === undefined || place[field] === null) errors.push(`${id}: restaurant.${field} is required`);
      }
      for (const field of ["name", "artworkId", "identity", "notes"]) {
        if (typeof place[field] !== "string" || !place[field].trim()) errors.push(`${id}: restaurant.${field} must be a non-empty string`);
      }
      for (const field of ["signatureDishes", "traditions", "runningJokes", "episodeAppearances"]) {
        if (!Array.isArray(place[field])) errors.push(`${id}: restaurant.${field} must be an array`);
      }
      const artwork = sourceAssets[place.artworkId];
      if (!artwork || artwork.kind !== "restaurant") errors.push(`${id}: artworkId must reference restaurant artwork`);
      else if (artwork.subjectId !== id) errors.push(`${id}: artwork belongs to ${artwork.subjectId}`);
    }
    for (const field of ["id", "title", "description", "seasonIds"]) {
      if (sourceSeries[field] === undefined || sourceSeries[field] === null) errors.push(`series.${field} is required`);
    }
    if (!Array.isArray(sourceSeries.seasonIds)) errors.push("series.seasonIds must be an array");
    const seriesSeasonIds = Array.isArray(sourceSeries.seasonIds) ? sourceSeries.seasonIds : [];
    if (new Set(seriesSeasonIds).size !== seriesSeasonIds.length) errors.push("series.seasonIds contains a duplicate");
    for (const id of seriesSeasonIds) {
      if (!sourceSeasons[id]) errors.push(`series references unknown season ${id}`);
    }
    for (const [id, season] of Object.entries(sourceSeasons)) {
      if (season.id !== id) errors.push(`${id}: season key must match season.id`);
      for (const field of ["title", "location", "description", "mainCast", "recurringCast", "restaurants", "timeline", "storyNotes"]) {
        if (season[field] === undefined || season[field] === null) errors.push(`${id}: season.${field} is required`);
      }
      for (const field of ["mainCast", "recurringCast", "restaurants", "timeline", "storyNotes"]) {
        if (!Array.isArray(season[field])) errors.push(`${id}: season.${field} must be an array`);
      }
      const mainCast = Array.isArray(season.mainCast) ? season.mainCast : [];
      const recurringCast = Array.isArray(season.recurringCast) ? season.recurringCast : [];
      const seasonRestaurants = Array.isArray(season.restaurants) ? season.restaurants : [];
      const timeline = Array.isArray(season.timeline) ? season.timeline : [];
      for (const castId of [...mainCast, ...recurringCast]) {
        if (!sourceCharacters[castId]) errors.push(`${id}: unknown cast member ${castId}`);
      }
      const allCast = [...mainCast, ...recurringCast];
      if (new Set(allCast).size !== allCast.length) errors.push(`${id}: main and recurring cast must not overlap or repeat`);
      for (const restaurantId of seasonRestaurants) {
        if (!sourceRestaurants[restaurantId]) errors.push(`${id}: unknown restaurant ${restaurantId}`);
      }
      if (new Set(seasonRestaurants).size !== seasonRestaurants.length) errors.push(`${id}: season restaurants must not repeat`);
      const timelineEpisodeIds = new Set();
      const timelineOrders = new Set();
      for (const item of timeline) {
        if (!item?.episodeId || !Number.isInteger(item.order) || item.order < 1 || !item.note?.trim()) {
          errors.push(`${id}: timeline entries require episodeId, positive integer order, and note`);
          continue;
        }
        if (timelineEpisodeIds.has(item.episodeId)) errors.push(`${id}: duplicate timeline episode ${item.episodeId}`);
        if (timelineOrders.has(item.order)) errors.push(`${id}: duplicate timeline order ${item.order}`);
        timelineEpisodeIds.add(item.episodeId);
        timelineOrders.add(item.order);
      }
    }
    const sourceCaseArtwork = snapshot.caseArtwork || caseArtwork;
    const sourceCaseMenus = snapshot.caseMenus || caseMenus;
    for (const [caseId, groups] of Object.entries(sourceCaseArtwork)) {
      for (const [group, requiredKind] of [["people", "portrait"], ["restaurants", "restaurant"], ["food", "food"]]) {
        const assignments = groups[group] || {};
        const assignedIds = new Set();
        for (const [label, assetId] of Object.entries(assignments)) {
          const asset = sourceAssets[assetId];
          if (!asset) {
            errors.push(`case ${caseId} ${group}.${label}: unknown asset ${assetId}`);
            continue;
          }
          if (asset.kind !== requiredKind) errors.push(`case ${caseId} ${group}.${label}: ${assetId} must be ${requiredKind}`);
          if (assignedIds.has(assetId)) errors.push(`case ${caseId} ${group}: duplicate assignment ${assetId}`);
          assignedIds.add(assetId);
          if (group === "people" && asset.subjectId !== label) errors.push(`case ${caseId} ${label}: portrait belongs to ${asset.subjectId}`);
          if (group === "food" && asset.subjectId !== slugify(label)) errors.push(`case ${caseId} ${label}: food artwork depicts ${asset.subjectId}`);
        }
      }
      const menu = sourceCaseMenus[caseId];
      if (!menu) errors.push(`case ${caseId}: actual menu is required`);
      for (const stage of ["meal", "drink", "dessert"]) {
        if (!menu?.[stage]?.length) errors.push(`case ${caseId}: ${stage} menu is required`);
        for (const item of menu?.[stage] || []) {
          if (!groups.food?.[item]) errors.push(`case ${caseId}: ${item} requires approved ${stage} artwork`);
        }
      }
    }
    return { valid: errors.length === 0, errors };
  }

  const validation = validateBible();
  if (!validation.valid) throw new Error(`Invalid world bible: ${validation.errors.join("; ")}`);

  root.RateMyBitesWorld = Object.freeze({
    schemaVersion: 1,
    getSeries: () => clone(series),
    getAsset,
    getAssets: () => clone(assets),
    assetSrc,
    getCharacter,
    getCharacters: () => clone(characters),
    getRestaurant,
    getRestaurants: () => clone(restaurants),
    getSeason,
    getSeasons: () => clone(seasons),
    getCaseArtwork,
    getCaseArtworkManifests: () => clone(caseArtwork),
    getCaseMenu,
    getCaseMenus: () => clone(caseMenus),
    getSnapshot: () => clone({ assets, characters, restaurants, series, seasons, caseArtwork, caseMenus }),
    validateBible
  });
})(window);
