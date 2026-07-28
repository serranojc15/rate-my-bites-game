// Multi-Episode Foundation — approved, data-driven story and gameplay content.
(function (root) {
  "use strict";

  const clone = value => JSON.parse(JSON.stringify(value));
  const world = root.RateMyBitesWorld;
  if (!world) throw new Error("RateMyBitesWorld must load before episodes.js");

  const characterName = id => {
    const character = world.getCharacter(id);
    if (!character) throw new Error(`Unknown character id: ${id}`);
    return character.name;
  };

  const episodeArtwork = assetIds => {
    const images = {};
    for (const [group, mappings] of Object.entries(assetIds)) {
      images[group] = {};
      for (const [label, assetId] of Object.entries(mappings)) {
        images[group][label] = world.assetSrc(assetId);
      }
    }
    return { assetIds: clone(assetIds), images };
  };
  const slugify = value => String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  /**
   * @typedef {Object} EpisodeDefinition
   * @property {{id:string,title:string,subtitle:string,destination:string,seasonId:string,artworkId:string,artwork:string,status:"playable",order:number,tags?:string[],future?:Object}} metadata
   * @property {{host:Object,castIds:string[],continuity:Object[],completion:Object,briefing:Object,scenes:Object[],missionText:string,finaleClues:Object[],ending:string}} story
   * @property {{assetIds:Object,images:Object,restaurants:Object[],actualRestaurantId:string,diners:Object[],stages:string[],points:Object,labels:Object}} gameplay
   * @property {{order:string[],restaurantExplanation:string,correctRestaurant:string,incorrectRestaurant:string,endingCelebration:string}} reveal
   */

  const pup = world.getCharacter("pup");
  const sharedHost = {
    id: pup.id,
    name: pup.name,
    portraitId: pup.portraitId,
    image: world.assetSrc(pup.portraitId)
  };

  /** @type {EpisodeDefinition} */
  const episode1 = {
    metadata: {
      id: "episode-001",
      title: "The Great Sushi Debate",
      subtitle: "Operation Dinner Briefing",
      destination: "Casa Luna · Taco Tuesday",
      seasonId: "season-001",
      artworkId: "restaurant.casa-luna",
      artwork: world.assetSrc("restaurant.casa-luna"),
      status: "playable",
      order: 1,
      tags: ["celebration", "modern-mexican", "friends"],
      future: { contentSource: "handcrafted" }
    },
    story: {
      host: sharedHost,
      castIds: ["emma", "marcus", "olivia"],
      continuity: [],
      completion: {
        mascotMessage: "Outstanding work! Olivia’s celebration never fooled you for a second.",
        funFact: "Marcus’s six-dinner dessert streak survived the case.",
        teaser: { speakerId: "olivia", text: "Priya says Willow Lake still has our names on a very embarrassing photograph." }
      },
      briefing: {
        number: 1,
        title: "The Great Sushi Debate",
        subtitle: "Operation Dinner Briefing",
        opening: [
          "Pull up a chair, Detective. Tonight’s table has already started arguing—in the friendly way.",
          "Emma, Marcus, and Olivia all want a good dinner. They do not agree on what that means.",
          "Listen for the habits they tease each other about.",
          "The smallest joke may be tonight’s best clue."
        ],
        people: {
          emma: {
            narration: [
              "Meet Emma.",
              "She usually follows curiosity—and photographs the evidence.",
              "Yesterday, however, she rated fried catfish 4.7 stars.",
              "Do not assume seafood."
            ],
            confessional: "Everybody thinks I’m getting sushi. They’re probably wrong."
          },
          marcus: {
            narration: [
              "Meet Marcus.",
              "He values consistency, familiar places, and a full plate.",
              "His dessert streak currently stands at six dinners.",
              "I have documented this historic achievement."
            ],
            confessional: "Honestly, I’m mostly here for dessert."
          },
          olivia: {
            narration: [
              "Meet Olivia.",
              "She plans for the whole table and remembers everyone’s favorites.",
              "Most of her detailed dining history is private.",
              "You will have to read the room."
            ],
            confessional: "They’ll never figure me out."
          }
        },
        closing: [
          "Your briefing is complete.",
          "Predict the restaurant, entrée, drink, and dessert.",
          "Dinner begins now."
        ]
      },
      missionText: "Tonight's mission: help this group choose one dinner everyone can enjoy. Listen closely—Emma wants something different, Marcus wants value, and Olivia wants the celebration to work for everyone.",
      scenes: [
        {
          id: "wide-open",
          kind: "conversation",
          speakerId: "emma",
          speaker: characterName("emma"),
          text: "Before anybody says sushi, I had fish yesterday. I want something completely different tonight.",
          emotion: "thoughtful",
          cameraTarget: "emma",
          shot: "WIDE SHOT",
          beat: "The table settles in.",
          influence: { "group-restaurant": -1, "emma-meal": 1 },
          memory: { type: "surprise", label: "Emma broke her seafood pattern" }
        },
        {
          id: "marcus-reacts",
          kind: "reaction",
          speakerId: "marcus",
          speaker: characterName("marcus"),
          text: "That’s exactly what someone ordering sushi would say.",
          emotion: "dry",
          cameraTarget: "marcus",
          shot: "REACTION SHOT",
          beat: "Emma gives him a look.",
          influence: { "emma-meal": -1 },
          memory: { type: "humor", label: "Marcus immediately challenged Emma's story" }
        },
        {
          id: "emma-pushback",
          kind: "conversation",
          speakerId: "emma",
          speaker: characterName("emma"),
          text: "You’re only suspicious because I used the word “completely.”",
          emotion: "playful",
          cameraTarget: "emma",
          shot: "QUICK CUT",
          beat: "Marcus tries not to smile."
        },
        {
          id: "marcus-budget",
          kind: "conversation",
          speakerId: "marcus",
          speaker: characterName("marcus"),
          text: "I’m flexible: close, filling, and no financing paperwork at the end.",
          emotion: "dry",
          cameraTarget: "marcus",
          shot: "CLOSE-UP",
          beat: "A beat. Olivia laughs.",
          influence: { "group-restaurant": 1, "marcus-meal": 1 },
          memory: { type: "humor", label: "Marcus requested dinner without financing" }
        },
        {
          id: "olivia-reframes",
          kind: "conversation",
          speakerId: "olivia",
          speaker: characterName("olivia"),
          text: "It’s a celebration. Can we pick somewhere everybody likes before this turns into seafood litigation?",
          emotion: "warm",
          cameraTarget: "olivia",
          shot: "TWO SHOT",
          beat: "The argument dissolves.",
          influence: { "group-restaurant": 1, "olivia-drink": 1 },
          memory: { type: "persuasive", label: "Olivia reframed the decision around the group" }
        },
        {
          id: "pup-observes",
          kind: "pup",
          speaker: "Pup",
          text: "One broken pattern. One budget speech. One person quietly steering the whole table. Which clue matters most?",
          emotion: "observant",
          cameraTarget: "pup",
          shot: "GAME MASTER CUT",
          beat: "Pup lets the question hang."
        },
        {
          id: "producer-emma",
          kind: "producer",
          speaker: "Off-Camera Producer",
          text: "Emma, are you changing your mind—or trying to make everyone think you changed it?",
          emotion: "documentary",
          cameraTarget: "producer",
          shot: "BEHIND THE CAMERA",
          beat: "The room goes quiet."
        },
        {
          id: "emma-confessional",
          kind: "confessional",
          speakerId: "emma",
          speaker: characterName("emma"),
          text: "They’re all overthinking it. Perfect. Now nobody knows what I’m ordering.",
          emotion: "playful",
          cameraTarget: "emma",
          shot: "CONFESSIONAL",
          beat: "She smiles directly at the camera.",
          influence: { "emma-meal": -1 },
          memory: { type: "confessional", label: "Emma admitted she enjoys the confusion" }
        },
        {
          id: "deal-interruption",
          kind: "interruption",
          speaker: "Phone Alert",
          text: "Casa Luna: Happy hour patio seating is available for the next 45 minutes.",
          emotion: "urgent",
          cameraTarget: "restaurant",
          shot: "INSERT — PHONE",
          beat: "Every head turns toward the screen.",
          influence: { "group-restaurant": 1, "olivia-drink": 1 },
          memory: { type: "influence", label: "A Casa Luna deal changed the room" }
        },
        {
          id: "marcus-confessional",
          kind: "confessional",
          speakerId: "marcus",
          speaker: characterName("marcus"),
          text: "Happy hour is evidence, and I respect evidence.",
          emotion: "serious",
          cameraTarget: "marcus",
          shot: "CONFESSIONAL",
          beat: "He nods as though the case is closed.",
          memory: { type: "humor", label: "Marcus declared happy hour admissible evidence" }
        },
        {
          id: "olivia-reaction",
          kind: "reaction",
          speakerId: "olivia",
          speaker: characterName("olivia"),
          text: "And suddenly Marcus is very interested in the celebration.",
          emotion: "amused",
          cameraTarget: "olivia",
          shot: "REACTION SHOT",
          beat: "Marcus looks away."
        },
        {
          id: "pup-close",
          kind: "pup",
          speaker: "Pup",
          text: "The room has shifted. Someone changed direction, someone revealed a priority, and one notification changed the temperature. Don’t chase every clue. Decide which one is true.",
          emotion: "decisive",
          cameraTarget: "pup",
          shot: "SLOW PUSH-IN",
          beat: "The music falls away."
        }
      ],
      finaleClues: [
        { title: "A pattern broke", text: "Emma rejected the choice everyone expected." },
        { title: "A priority surfaced", text: "Marcus revealed that value and convenience matter." },
        { title: "The room reacted", text: "One timely deal changed everyone's attention." }
      ],
      ending: "Olivia raises her glass. Marcus protects the last churro. Emma takes the picture."
    },
    gameplay: {
      ...episodeArtwork({
        people: {
          emma: "portrait.emma",
          marcus: "portrait.marcus",
          olivia: "portrait.olivia"
        },
        restaurants: {
          luna: "restaurant.casa-luna",
          cactus: "restaurant.cactus-cantina",
          azul: "restaurant.azul-mar",
          abuela: "restaurant.abuelas-table",
          rojo: "restaurant.rojo-taco-lab",
          plaza: "restaurant.plaza-fiesta"
        },
        food: {
          "Fish tacos": "food.fish-tacos",
          "Chicken enchiladas": "food.chicken-enchiladas",
          "Steak fajitas": "food.steak-fajitas",
          "Lime margarita": "food.lime-margarita",
          "Sweet tea": "food.sweet-tea",
          "Sparkling water": "food.sparkling-water",
          "Churros": "food.churros",
          "Tres leches": "food.tres-leches",
          "No dessert": "food.no-dessert"
        }
      }),
      restaurants: [
        { id: "luna", worldId: "casa-luna", name: "Casa Luna", distance: "3.2 mi", price: "$$", style: "Modern Mexican", atmosphere: "Warm lights · social patio", description: "A polished neighborhood favorite with modern plates and a lively bar.", menu: { meal: ["Fish tacos", "Chicken enchiladas", "Steak fajitas"], drink: ["Lime margarita", "Sweet tea", "Sparkling water"], dessert: ["Churros", "Tres leches", "No dessert"] } },
        { id: "cactus", worldId: "cactus-cantina", name: "Cactus Cantina", distance: "1.8 mi", price: "$", style: "Fast & casual", atmosphere: "Bright · energetic · quick", description: "A casual counter-service spot known for bold flavors and easy prices.", menu: { meal: ["Spicy chicken burrito", "Carne asada tacos", "Veggie bowl"], drink: ["Horchata", "Mexican Coke", "Water"], dessert: ["Cinnamon sopapillas", "Flan", "No dessert"] } },
        { id: "azul", worldId: "azul-mar", name: "Azul Mar", distance: "7.4 mi", price: "$$$", style: "Coastal Mexican", atmosphere: "Upscale · date-night", description: "Seafood-forward Mexican cooking in a sophisticated coastal dining room.", menu: { meal: ["Grilled mahi tacos", "Shrimp enchiladas", "Chicken mole"], drink: ["Cucumber agua fresca", "Paloma", "Sparkling water"], dessert: ["Coconut flan", "Tres leches", "No dessert"] } },
        { id: "abuela", worldId: "abuelas-table", name: "Abuela’s Table", distance: "5.1 mi", price: "$$", style: "Traditional family recipes", atmosphere: "Cozy · familiar · relaxed", description: "Comforting recipes, generous portions, and the feeling of a family table.", menu: { meal: ["Beef tamales", "Cheese enchiladas", "Chicken tortilla soup"], drink: ["Sweet tea", "Horchata", "Water"], dessert: ["Flan", "Churros", "No dessert"] } },
        { id: "rojo", worldId: "rojo-taco-lab", name: "Rojo Taco Lab", distance: "6.6 mi", price: "$$", style: "Creative street tacos", atmosphere: "Trendy · loud · adventurous", description: "Unexpected taco combinations in a colorful, high-energy room.", menu: { meal: ["Korean beef tacos", "Hot honey chicken tacos", "Avocado tostadas"], drink: ["Mango agua fresca", "Spicy margarita", "Mexican Coke"], dessert: ["Churro bites", "Mexican chocolate cookie", "No dessert"] } },
        { id: "plaza", worldId: "plaza-fiesta", name: "Plaza Fiesta", distance: "4.0 mi", price: "$$", style: "Lively neighborhood favorite", atmosphere: "Festive · group-friendly", description: "A dependable celebration spot with big tables and familiar favorites.", menu: { meal: ["Steak fajitas", "Combo enchiladas", "Fish tacos"], drink: ["House margarita", "Sweet tea", "Water"], dessert: ["Fried ice cream", "Sopapillas", "No dessert"] } }
      ],
      actualRestaurantId: "luna",
      diners: [
        {
          id: "emma", name: characterName("emma"), portraitId: world.getCharacter("emma").portraitId, role: "The Adventurer", intro: "Curious, social, and usually ready to try something new.", favorite: "Seafood & modern Mexican", funFact: "She photographs almost every memorable meal.", facts: ["Orders seafood often", "Usually stays within 10 miles", "Dessert about half the time"], permission: "full", permissionLabel: "Full case file shared",
          preferences: ["Seafood", "Spicy food", "Modern Mexican", "Mocktails", "Outdoor patios"], dislikes: ["Heavy lunches", "Repeating the same cuisine two days in a row"],
          places: ["Casa Luna · 4.8★", "Azul Mar · 4.6★", "Rojo Taco Lab · Must Try"],
          activity: [
            { icon: "🍽️", title: "Recent meal", text: "Rated fried catfish 4.7★ yesterday" },
            { icon: "🔖", title: "Must Try", text: "Saved Rojo Taco Lab’s hot honey tacos" },
            { icon: "🚻", title: "Restrooms", text: "Cleanliness matters · average rating 4.8★" },
            { icon: "🎟️", title: "Deal", text: "Viewed Casa Luna happy hour twice" },
            { icon: "📅", title: "Event", text: "Interested in Patio Music Thursday" }
          ],
          clues: { restaurant: "Emma ate fried catfish yesterday, so another seafood-focused restaurant may be less appealing.", meal: "She wants something lighter than fajitas and is willing to move away from fish tonight.", drink: "She is driving tonight.", dessert: "She skipped lunch, but says she does not want a heavy finish." },
          actual: { meal: "Chicken enchiladas", drink: "Sparkling water", dessert: "No dessert" },
          why: "Emma chose something lighter after yesterday’s fish, ordered sparkling water because she was driving, and skipped dessert."
        },
        {
          id: "marcus", name: characterName("marcus"), portraitId: world.getCharacter("marcus").portraitId, role: "The Traditionalist", intro: "Budget-minded, dependable, and always arrives hungry.", favorite: "Beef, comfort food & sweet tea", funFact: "His current dessert streak is six dinners.", facts: ["Favors familiar places", "Usually orders beef", "Almost always gets dessert"], permission: "limited", permissionLabel: "Some evidence shared",
          preferences: ["Beef entrées", "Sweet tea", "Familiar restaurants"], dislikes: [],
          places: ["Plaza Fiesta · frequent visit", "Abuela’s Table · 4.5★"],
          activity: [
            { icon: "🎟️", title: "Deals · summary", text: "Regularly saves weekday specials" },
            { icon: "🔖", title: "Must Try", text: "Saved Casa Luna’s fajitas for two" },
            { icon: "🚻", title: "Restrooms", text: "Private" },
            { icon: "📅", title: "Events · summary", text: "Prefers quieter group events" }
          ],
          clues: { restaurant: "Marcus paid for an expensive dinner last night and wants somewhere nearby at a moderate price.", meal: "He ran five miles this afternoon and wants the most filling option.", drink: "He orders sweet tea with most casual dinners.", dessert: "His dessert streak is currently six dinners." },
          actual: { meal: "Steak fajitas", drink: "Sweet tea", dessert: "Churros" },
          why: "Marcus backed the close, moderately priced choice, went with the filling beef option, stayed loyal to sweet tea, and protected his dessert streak."
        },
        {
          id: "olivia", name: characterName("olivia"), portraitId: world.getCharacter("olivia").portraitId, role: "The Social Planner", intro: "She values atmosphere, celebration, and keeping the whole table happy.", favorite: "Shareable plates & margaritas", funFact: "She remembers everyone’s favorite restaurant.", facts: ["Likes lively rooms", "Often orders margaritas", "Returns to trusted favorites"], permission: "none", permissionLabel: "Detailed history private",
          preferences: [], dislikes: [], places: [],
          activity: [
            { icon: "🔒", title: "Dining history", text: "Olivia has not shared this category" },
            { icon: "🔒", title: "Restrooms", text: "Private" },
            { icon: "📅", title: "Event clue", text: "Shared for this game: celebrating a promotion" }
          ],
          clues: { restaurant: "Olivia is celebrating a promotion, but she also wants a place that works for everyone in the group.", meal: "She wants something the table can easily share.", drink: "She is not driving and called this a celebration dinner.", dessert: "The group mentioned sharing one dessert for the table." },
          actual: { meal: "Steak fajitas", drink: "Lime margarita", dessert: "Tres leches" },
          why: "Olivia chose shareable fajitas, celebrated with a margarita, and finished with a dessert that worked for the table."
        }
      ],
      stages: ["meal", "drink", "dessert"],
      points: { restaurant: 120, meal: 30, drink: 20, dessert: 10 },
      labels: { restaurant: "Restaurant", meal: "Entrée", drink: "Drink", dessert: "Dessert" }
    },
    reveal: {
      order: ["restaurant", "emma", "marcus", "olivia", "celebration"],
      restaurantExplanation: "Casa Luna balanced Marcus’s price and distance concerns, Olivia’s celebration mood, and Emma’s desire for something modern without another seafood-heavy meal.",
      correctRestaurant: "You read the whole table, not just its loudest clue.",
      incorrectRestaurant: "You followed a believable trail, but the group found a different compromise.",
      endingCelebration: "Case closed: a celebration, a protected dessert streak, and one photo worth keeping."
    }
  };

  /** @type {EpisodeDefinition} */
  const episode2 = {
    metadata: {
      id: "episode-002",
      title: "The Lantern Table",
      subtitle: "A Homecoming Mystery",
      destination: "Willow Lake · Maple & Main",
      seasonId: "season-001",
      artworkId: "restaurant.maple-main",
      artwork: world.assetSrc("restaurant.maple-main"),
      status: "playable",
      order: 2,
      tags: ["homecoming", "family-style", "small-town"],
      future: { contentSource: "handcrafted" }
    },
    story: {
      host: sharedHost,
      castIds: ["june", "ellis", "priya"],
      continuity: [
        {
          previousEpisodeId: "episode-001",
          optional: true,
          affectsGameplay: false,
          returning: "Priya still has Olivia’s post-dinner message pinned: “Choose the table that keeps them talking.”",
          standalone: "Priya has one rule for group dinners: choose the table that keeps everyone talking."
        }
      ],
      completion: {
        mascotMessage: "Outstanding work! Ellis never distracted you with the roll basket.",
        funFact: "The old fishing photograph mattered to Ellis more than he admitted.",
        teaser: { speakerId: "priya", text: "Emma just texted: breakfast next Saturday. Apparently that makes it official." }
      },
      briefing: {
        number: 2,
        title: "The Lantern Table",
        subtitle: "A Homecoming Mystery",
        opening: [
          "Welcome to Willow Lake, Detective. June has barely set down her bag and Ellis is already auditing the roll basket.",
          "Priya brought three old friends back to the town where they first learned to share a table.",
          "Tonight’s clues are hiding in traditions, memories, and one extremely suspicious dinner-roll strategy."
        ],
        people: {
          june: {
            narration: [
              "Meet June.",
              "She has come home after several years away.",
              "Her strongest food memories begin in a flour-dusted kitchen.",
              "Nostalgia matters, but it may not decide everything."
            ],
            confessional: "I came back for the people. The pot pie is a very close second."
          },
          ellis: {
            narration: [
              "Meet Ellis.",
              "He has never met a family-style meal he could not turn into a competition.",
              "He calls the dinner rolls a warm-up course.",
              "Nobody else calls them that."
            ],
            confessional: "A roll basket is not a race. I just happen to be winning."
          },
          priya: {
            narration: [
              "Meet Priya.",
              "She organized the homecoming and wants conversation to last longer than dinner.",
              "For her, the best dish is the one that gets passed around."
            ],
            confessional: "If everyone reaches for the same platter, the room starts talking."
          }
        },
        closing: [
          "The lanterns are lit.",
          "The friends are seated.",
          "Listen for the choice that brings the whole table home."
        ]
      },
      missionText: "Tonight's mission: read a homecoming table. June is following a memory, Ellis is following his appetite, and Priya is protecting the reason they came back.",
      scenes: [
        {
          id: "pup-read",
          kind: "pup",
          speaker: "Pup",
          text: "Tonight's mission: read a homecoming table. June is following a memory, Ellis is following his appetite, and Priya is protecting the reason they came back.",
          emotion: "decisive",
          cameraTarget: "pup",
          influence: { "group-restaurant": 1 }
        },
        {
          id: "june-memory",
          kind: "conversation",
          speakerId: "june",
          speaker: characterName("june"),
          text: "My aunt taught me to crimp pie crust at this lake. She said every uneven edge proved somebody helped.",
          emotion: "warm",
          cameraTarget: "june",
          influence: { "june-meal": 1, "june-dessert": 1 },
          memory: { type: "warmth", label: "June connected an imperfect crust with being together" }
        },
        {
          id: "ellis-rolls",
          kind: "conversation",
          speakerId: "ellis",
          speaker: characterName("ellis"),
          text: "For the record, I’m not counting dinner rolls. I’m maintaining an accurate inventory.",
          emotion: "dry",
          cameraTarget: "ellis",
          influence: { "ellis-meal": 1 },
          memory: { type: "humor", label: "Ellis turned the roll basket into inventory control" }
        },
        {
          id: "priya-tradition",
          kind: "conversation",
          speakerId: "priya",
          speaker: characterName("priya"),
          text: "Pass one platter, ask one question, and suddenly nobody’s checking the time. That’s why I like family-style.",
          emotion: "thoughtful",
          cameraTarget: "priya",
          influence: { "group-restaurant": 1, "priya-meal": 1 },
          memory: { type: "learning", label: "Priya noticed how shared dishes keep conversation moving" }
        },
        {
          id: "june-pattern",
          kind: "confessional",
          speakerId: "june",
          speaker: characterName("june"),
          text: "Everyone expects me to order the old favorite. They’re right—but not for the reason they think.",
          emotion: "playful",
          cameraTarget: "june",
          influence: { "june-meal": 1 }
        },
        {
          id: "lantern-alert",
          kind: "interruption",
          speaker: "Host Stand",
          text: "Maple & Main: The lake-room table beside the old photo wall is ready.",
          emotion: "urgent",
          cameraTarget: "restaurant",
          influence: { "group-restaurant": 1 },
          memory: { type: "influence", label: "The old photo wall turned dinner into a homecoming" }
        },
        {
          id: "ellis-softens",
          kind: "reaction",
          speakerId: "ellis",
          speaker: characterName("ellis"),
          text: "That wall still has our terrible fishing picture? Fine—but I’m taking the seat farthest from it.",
          emotion: "amused",
          cameraTarget: "ellis",
          memory: { type: "warmth", label: "Ellis pretended the old picture did not matter" }
        },
        {
          id: "priya-close",
          kind: "conversation",
          speakerId: "priya",
          speaker: characterName("priya"),
          text: "That settles it. I didn’t bring everyone back just to eat near each other. I want us at the same table.",
          emotion: "sincere",
          cameraTarget: "priya",
          influence: { "group-restaurant": 1 }
        },
        {
          id: "pup-close",
          kind: "pup",
          speaker: "Pup",
          text: "A remembered crust. A shared platter. One embarrassing photograph. The answer is where the meal and the memory become the same choice.",
          emotion: "decisive",
          cameraTarget: "pup"
        }
      ],
      finaleClues: [
        { title: "A memory returned", text: "June’s favorite carried the feeling of being taught and included." },
        { title: "Sharing mattered", text: "Priya wanted dishes—and stories—to travel around one table." },
        { title: "The room belonged to them", text: "An old photograph made one restaurant part of the reunion." }
      ],
      ending: "Under the lanterns, the dishes make one more trip around the table before anyone is ready to leave."
    },
    gameplay: {
      ...episodeArtwork({
        people: {
          june: "portrait.june",
          ellis: "portrait.ellis",
          priya: "portrait.priya"
        },
        restaurants: {
          luna: "restaurant.maple-main",
          cactus: "restaurant.dockside-basket",
          azul: "restaurant.juniper-room",
          abuela: "restaurant.hearthstone-cafe",
          rojo: "restaurant.trailhead-smokehouse",
          plaza: "restaurant.lantern-market"
        },
        food: {
          "Herb roast chicken": "food.herb-roast-chicken",
          "Sunday pot pie": "food.sunday-pot-pie",
          "Smoked meatloaf": "food.smoked-meatloaf",
          "Sparkling lemonade": "food.sparkling-lemonade",
          "Sweet tea": "food.sweet-tea",
          "Root beer": "food.root-beer",
          "Peach cobbler": "food.peach-cobbler",
          "Chocolate chess pie": "food.chocolate-chess-pie",
          "No dessert": "food.no-dessert"
        }
      }),
      restaurants: [
        { id: "luna", worldId: "maple-main", name: "Maple & Main", distance: "2.1 mi", price: "$$", style: "Family-style supper club", atmosphere: "Lake lanterns · old photo wall", description: "A welcoming supper club where shared platters and local photographs keep people at the table.", menu: { meal: ["Herb roast chicken", "Sunday pot pie", "Smoked meatloaf"], drink: ["Sparkling lemonade", "Sweet tea", "Root beer"], dessert: ["Peach cobbler", "Chocolate chess pie", "No dessert"] } },
        { id: "cactus", worldId: "dockside-basket", name: "Dockside Basket", distance: "0.8 mi", price: "$", style: "Quick lakeside counter", atmosphere: "Casual · busy · outdoors", description: "Fast baskets beside the marina, built for a quick stop rather than a long reunion.", menu: { meal: ["Fish basket"], drink: ["Lemonade"], dessert: ["Ice cream"] } },
        { id: "azul", worldId: "juniper-room", name: "The Juniper Room", distance: "6.4 mi", price: "$$$", style: "Modern dining", atmosphere: "Quiet · polished · formal", description: "Precise seasonal plates in a room made for occasions.", menu: { meal: ["Seasonal plate"], drink: ["Sparkling water"], dessert: ["Tart"] } },
        { id: "abuela", worldId: "hearthstone-cafe", name: "Hearthstone Café", distance: "4.8 mi", price: "$$", style: "Neighborhood café", atmosphere: "Cozy · familiar", description: "A small café with comforting bowls and counter seating.", menu: { meal: ["Soup"], drink: ["Tea"], dessert: ["Cake"] } },
        { id: "rojo", worldId: "trailhead-smokehouse", name: "Trailhead Smokehouse", distance: "8.7 mi", price: "$$", style: "Barbecue", atmosphere: "Lively · picnic tables", description: "Big smoked plates and a lively room just outside town.", menu: { meal: ["Barbecue plate"], drink: ["Sweet tea"], dessert: ["Pudding"] } },
        { id: "plaza", worldId: "lantern-market", name: "Lantern Market", distance: "3.7 mi", price: "$", style: "Food hall", atmosphere: "Bright · flexible · noisy", description: "Independent counters with plenty of choice but no single shared meal.", menu: { meal: ["Market bowl"], drink: ["Soda"], dessert: ["Cookie"] } }
      ],
      actualRestaurantId: "luna",
      diners: [
        {
          id: "june", name: characterName("june"), portraitId: world.getCharacter("june").portraitId, role: "The Homecomer", intro: "Observant, sentimental, and determined not to make a fuss about being back.", favorite: "Hand pies & quiet lake views", funFact: "She can still find the best skipping stones before anyone else.", facts: ["Recently returned to town", "Connects food with place", "Usually chooses lighter drinks"], permission: "full", permissionLabel: "Full case file shared",
          preferences: ["Comfort food", "Old neighborhood places", "Sparkling drinks"], dislikes: ["Rushed dinners"],
          places: ["Maple & Main · saved", "Hearthstone Café · 4.6★"],
          activity: [
            { icon: "📷", title: "Memory", text: "Saved a photograph from the Willow Lake kitchen" },
            { icon: "🔖", title: "Must Try", text: "Saved Maple & Main’s Sunday pot pie" },
            { icon: "📅", title: "Event", text: "Homecoming dinner tonight" }
          ],
          clues: { restaurant: "June wants somewhere connected to Willow Lake, but she does not want a rushed nostalgia tour.", meal: "She keeps returning to the memory of learning to crimp a pie crust.", drink: "She wants something bright and alcohol-free.", dessert: "She says one warm fruit dessert can belong to the whole table." },
          actual: { meal: "Sunday pot pie", drink: "Sparkling lemonade", dessert: "Peach cobbler" },
          why: "June chose the pot pie because the handmade edge carried a memory, kept the drink bright, and shared the cobbler instead of rushing the evening."
        },
        {
          id: "ellis", name: characterName("ellis"), portraitId: world.getCharacter("ellis").portraitId, role: "The Storyteller", intro: "Good-humored, practical, and always prepared with one more version of an old story.", favorite: "Smoked plates & sweet tea", funFact: "He calls the dinner rolls a warm-up course.", facts: ["Arrives hungry", "Prefers familiar food", "Pretends old photographs embarrass him"], permission: "limited", permissionLabel: "Some evidence shared",
          preferences: ["Hearty entrées", "Sweet tea", "Generous portions"], dislikes: ["Tiny plates"],
          places: ["Trailhead Smokehouse · frequent visit", "Maple & Main · family dinner"],
          activity: [
            { icon: "🥖", title: "Table habit", text: "Asked whether roll refills count as a course" },
            { icon: "📷", title: "Old photo", text: "Claims the fishing picture should remain private" },
            { icon: "🎟️", title: "Special", text: "Viewed Maple & Main’s family platter" }
          ],
          clues: { restaurant: "Ellis wants a filling meal, but the old photo wall matters more than he admits.", meal: "He wants the heartiest option and immediately noticed the meatloaf.", drink: "He almost always orders sweet tea with supper.", dessert: "He filled up on what he continues to call the warm-up course." },
          actual: { meal: "Smoked meatloaf", drink: "Sweet tea", dessert: "No dessert" },
          why: "Ellis followed his appetite to the meatloaf, stayed loyal to sweet tea, and discovered that an ambitious roll strategy has consequences."
        },
        {
          id: "priya", name: characterName("priya"), portraitId: world.getCharacter("priya").portraitId, role: "The Bridge-Builder", intro: "Warm, deliberate, and skilled at making a group feel like one table.", favorite: "Shared platters & long conversations", funFact: "She remembers the story behind everyone’s favorite dish.", facts: ["Organized the reunion", "Prefers family-style service", "Chooses the room before the trend"], permission: "full", permissionLabel: "Full case file shared",
          preferences: ["Shared dishes", "Unhurried rooms", "Local traditions"], dislikes: ["Everyone ordering in isolation"],
          places: ["Maple & Main · reunion shortlist", "Lantern Market · lunch"],
          activity: [
            { icon: "📅", title: "Homecoming", text: "Invited the group back to Willow Lake" },
            { icon: "🍽️", title: "Dining note", text: "Family-style service keeps people talking" },
            { icon: "📷", title: "Memory", text: "Found the old fishing photograph" }
          ],
          clues: { restaurant: "Priya wants one shared table in a room that belongs to the group’s history.", meal: "She wants a platter that can make a full trip around the table.", drink: "She is choosing a nostalgic bottle with dinner.", dessert: "She promised to split the rich pie with June." },
          actual: { meal: "Herb roast chicken", drink: "Root beer", dessert: "Chocolate chess pie" },
          why: "Priya chose the roast chicken to pass around, made the drink part of the homecoming, and shared the rich pie exactly as promised."
        }
      ],
      stages: ["meal", "drink", "dessert"],
      points: { restaurant: 120, meal: 30, drink: 20, dessert: 10 },
      labels: { restaurant: "Restaurant", meal: "Entrée", drink: "Drink", dessert: "Dessert" }
    },
    reveal: {
      order: ["restaurant", "june", "ellis", "priya", "celebration"],
      restaurantExplanation: "Maple & Main gave June a genuine homecoming, Ellis the hearty meal and old photograph he pretended not to care about, and Priya one family-style table for the reunion.",
      correctRestaurant: "You found the place where tonight’s meal and the group’s memory became the same answer.",
      incorrectRestaurant: "Your choice fit the menu, but the group was choosing a room that already belonged to their story.",
      endingCelebration: "Case closed: the lanterns stayed on, the stories got better, and Ellis officially requested one more roll for the road."
    }
  };

  const catalog = [
    { ...episode1.metadata, episode: episode1 },
    { ...episode2.metadata, episode: episode2 },
    {
      id: "episode-003",
      title: "The Midnight Breakfast",
      subtitle: "A new table is being set",
      destination: "Coming Soon",
      seasonId: "season-001",
      artworkId: "scene.midnight-breakfast",
      artwork: world.assetSrc("scene.midnight-breakfast"),
      status: "coming-soon",
      order: 3,
      tags: ["coming-soon"],
      episode: null
    }
  ];

  function artworkErrors(episode) {
    const errors = [];
    const metadata = episode?.metadata || {};
    const story = episode?.story || {};
    const gameplay = episode?.gameplay || {};
    const ids = gameplay.assetIds || {};
    const images = gameplay.images || {};
    const seenByGroup = {};

    const checkAsset = (group, label, assetId, requiredKind) => {
      const asset = world.getAsset(assetId);
      if (!asset) {
        errors.push(`gameplay.assetIds.${group}.${label} references unknown artwork ${assetId}`);
        return null;
      }
      if (asset.kind !== requiredKind) errors.push(`${assetId} must be ${requiredKind} artwork`);
      if (asset.status !== "approved") errors.push(`${assetId} is not approved for production`);
      if (images?.[group]?.[label] !== asset.src) errors.push(`${group}.${label} image does not resolve from ${assetId}`);
      if (group === "people" && asset.subjectId !== label) errors.push(`${label}: portrait artwork belongs to ${asset.subjectId}`);
      if (group === "food" && asset.subjectId !== slugify(label)) errors.push(`${label}: food artwork depicts ${asset.subjectId}`);
      seenByGroup[group] ||= new Map();
      const previous = seenByGroup[group].get(assetId);
      if (previous && previous !== label) errors.push(`${group}.${previous} and ${group}.${label} incorrectly share ${assetId}`);
      seenByGroup[group].set(assetId, label);
      return asset;
    };

    for (const [group, requiredKind] of [["people", "portrait"], ["restaurants", "restaurant"], ["food", "food"]]) {
      if (!ids[group] || !Object.keys(ids[group]).length) errors.push(`gameplay.assetIds.${group} is required`);
      for (const [label, assetId] of Object.entries(ids[group] || {})) checkAsset(group, label, assetId, requiredKind);
    }

    const cover = world.getAsset(metadata.artworkId);
    if (!cover) errors.push(`metadata.artworkId references unknown artwork ${metadata.artworkId}`);
    else {
      if (cover.kind !== "restaurant") errors.push(`${metadata.artworkId} must be restaurant cover artwork`);
      if (cover.status !== "approved") errors.push(`${metadata.artworkId} is not approved for production`);
      if (metadata.artwork !== cover.src) errors.push("metadata.artwork must resolve from metadata.artworkId");
    }

    for (const diner of gameplay.diners || []) {
      const character = world.getCharacter(diner.id);
      if (!character) {
        errors.push(`${diner.id}: diner must exist in the Character Bible`);
        continue;
      }
      if (diner.name !== character.name) errors.push(`${diner.id}: name must come from the Character Bible`);
      if (diner.portraitId !== character.portraitId) errors.push(`${diner.id}: portraitId must match the Character Bible`);
      if (ids.people?.[diner.id] !== character.portraitId) errors.push(`${diner.id}: portrait assignment must match the Character Bible`);
      if (!character.episodeAppearances.includes(metadata.id)) errors.push(`${diner.id}: Character Bible is missing appearance ${metadata.id}`);
    }

    for (const restaurant of gameplay.restaurants || []) {
      const canonical = world.getRestaurant(restaurant.worldId);
      if (!canonical) {
        errors.push(`${restaurant.id}: restaurant must reference the Restaurant Bible`);
        continue;
      }
      if (restaurant.name !== canonical.name) errors.push(`${restaurant.id}: name must come from the Restaurant Bible`);
      if (ids.restaurants?.[restaurant.id] !== canonical.artworkId) errors.push(`${restaurant.id}: artwork must match the Restaurant Bible`);
      if (!canonical.episodeAppearances.includes(metadata.id)) errors.push(`${restaurant.worldId}: Restaurant Bible is missing appearance ${metadata.id}`);
    }

    const actualRestaurant = gameplay.restaurants?.find(restaurant => restaurant.id === gameplay.actualRestaurantId);
    if (actualRestaurant) {
      if (metadata.artworkId !== ids.restaurants?.[actualRestaurant.id]) errors.push("episode cover must depict the actual restaurant");
      for (const stage of gameplay.stages || []) {
        for (const item of actualRestaurant.menu?.[stage] || []) {
          if (!ids.food?.[item]) errors.push(`actual menu item "${item}" requires approved food artwork`);
        }
      }
    }

    for (const castId of story.castIds || []) {
      if (!gameplay.diners?.some(diner => diner.id === castId)) errors.push(`story.castIds references missing diner ${castId}`);
    }
    const sceneIds = new Set();
    for (const scene of story.scenes || []) {
      if (!scene.id) errors.push("every story scene requires an id");
      else if (sceneIds.has(scene.id)) errors.push(`duplicate story scene id ${scene.id}`);
      else sceneIds.add(scene.id);
      if (scene.speakerId && !story.castIds?.includes(scene.speakerId)) errors.push(`${scene.id}: speakerId ${scene.speakerId} is not in story.castIds`);
      if (scene.speakerId && scene.speaker !== world.getCharacter(scene.speakerId)?.name) errors.push(`${scene.id}: speaker name must come from the Character Bible`);
      if (scene.artworkId) {
        const asset = world.getAsset(scene.artworkId);
        if (!asset || !["scene", "background"].includes(asset.kind)) errors.push(`${scene.id}: invalid scene artwork ${scene.artworkId}`);
      }
    }
    return errors;
  }

  function validationErrors(episode) {
    const errors = [];
    const metadata = episode?.metadata;
    const story = episode?.story;
    const gameplay = episode?.gameplay;
    const reveal = episode?.reveal;
    if (!metadata?.id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(metadata.id)) errors.push("metadata.id must be a stable slug");
    if (!metadata?.title?.trim()) errors.push("metadata.title is required");
    if (!world.getSeason(metadata?.seasonId)) errors.push("metadata.seasonId must reference the Season Bible");
    if (!metadata?.artworkId) errors.push("metadata.artworkId is required");
    if (!story?.castIds?.length) errors.push("story.castIds is required");
    if (!story?.briefing?.opening?.length) errors.push("story.briefing.opening requires at least one scene");
    if (!story?.scenes?.length) errors.push("story.scenes requires at least one meaningful scene");
    if (!story?.scenes?.some(scene => scene.memory || scene.influence)) errors.push("story.scenes requires at least one clue or meaningful moment");
    if (!story?.ending?.trim()) errors.push("story.ending is required");
    if (!gameplay?.restaurants?.length) errors.push("gameplay.restaurants is required");
    if (!gameplay?.diners?.length) errors.push("gameplay.diners is required");
    if (!gameplay?.actualRestaurantId) errors.push("gameplay.actualRestaurantId is required");
    const actualRestaurant = gameplay?.restaurants?.find(restaurant => restaurant.id === gameplay.actualRestaurantId);
    if (gameplay?.actualRestaurantId && !actualRestaurant) errors.push("actual restaurant must exist in gameplay.restaurants");
    for (const stage of gameplay?.stages || []) {
      if (!actualRestaurant?.menu?.[stage]?.length) errors.push(`actual restaurant requires ${stage} choices`);
      if (!Number.isFinite(gameplay?.points?.[stage])) errors.push(`gameplay.points.${stage} is required`);
    }
    for (const diner of gameplay?.diners || []) {
      for (const stage of gameplay?.stages || []) {
        if (!diner?.actual?.[stage]) errors.push(`${diner?.id || "diner"} requires a correct ${stage} answer`);
        else if (actualRestaurant && !actualRestaurant.menu[stage]?.includes(diner.actual[stage])) {
          errors.push(`${diner.id}.${stage} answer must exist on the actual restaurant menu`);
        }
      }
    }
    if (!Number.isFinite(gameplay?.points?.restaurant)) errors.push("gameplay.points.restaurant is required");
    if (!reveal?.order?.length) errors.push("reveal.order is required");
    if (!reveal?.restaurantExplanation?.trim()) errors.push("reveal.restaurantExplanation is required");
    if (!reveal?.endingCelebration?.trim()) errors.push("reveal.endingCelebration is required");
    if (!story?.completion?.mascotMessage?.trim()) errors.push("story.completion.mascotMessage is required");
    if (!story?.completion?.teaser?.speakerId || !story?.completion?.teaser?.text?.trim()) errors.push("story.completion.teaser is required");
    else if (!world.getCharacter(story.completion.teaser.speakerId)) errors.push("story.completion.teaser speaker must exist in the Character Bible");
    if (story?.host?.portraitId !== world.getCharacter("pup")?.portraitId || story?.host?.image !== world.assetSrc("portrait.pup")) {
      errors.push("story.host must resolve Pup from the Character Bible");
    }
    for (const reference of story?.continuity || []) {
      if (!reference.previousEpisodeId || !reference.returning?.trim() || !reference.standalone?.trim()) {
        errors.push("continuity references require previousEpisodeId, returning, and standalone copy");
      }
      if (reference.optional !== true || reference.affectsGameplay !== false) {
        errors.push("continuity references must be optional and must not affect gameplay");
      }
    }
    errors.push(...artworkErrors(episode));
    return errors;
  }

  function validateEpisode(episode) {
    const errors = validationErrors(episode);
    return { valid: errors.length === 0, errors };
  }

  function assertValidEpisode(episode) {
    const result = validateEpisode(episode);
    if (!result.valid) {
      const id = episode?.metadata?.id || "unknown episode";
      throw new Error(`Invalid episode "${id}": ${result.errors.join("; ")}`);
    }
    return true;
  }

  function validateCatalog(entries = catalog) {
    const errors = [];
    const ids = new Set();
    for (const entry of entries) {
      if (!entry?.id) errors.push("catalog entry requires an id");
      else if (ids.has(entry.id)) errors.push(`duplicate episode id: ${entry.id}`);
      else ids.add(entry.id);
      if (entry?.status === "playable") {
        const result = validateEpisode(entry.episode);
        if (!result.valid) errors.push(...result.errors.map(error => `${entry.id}: ${error}`));
        if (entry.episode?.metadata?.id !== entry.id) errors.push(`${entry.id}: catalog id must match episode metadata id`);
        const season = world.getSeason(entry.episode?.metadata?.seasonId);
        const timelineEntry = season?.timeline?.find(item => item.episodeId === entry.id);
        if (!timelineEntry) errors.push(`${entry.id}: episode must appear in its season timeline`);
        else if (timelineEntry.order !== entry.order) errors.push(`${entry.id}: season timeline order must match catalog order`);
        for (const reference of entry.episode?.story?.continuity || []) {
          const previous = entries.find(item => item.id === reference.previousEpisodeId);
          if (!previous || previous.status !== "playable") errors.push(`${entry.id}: continuity references unknown playable episode ${reference.previousEpisodeId}`);
          else if (previous.order >= entry.order) errors.push(`${entry.id}: continuity must only reference an earlier episode`);
        }
      } else if (entry?.artworkId) {
        const artwork = world.getAsset(entry.artworkId);
        if (!artwork || entry.artwork !== artwork.src) errors.push(`${entry.id}: catalog artwork must resolve from artworkId`);
      }
    }
    return { valid: errors.length === 0, errors };
  }

  function getCatalog() {
    return catalog
      .slice()
      .sort((a, b) => a.order - b.order)
      .map(entry => ({ ...clone(entry), episode: entry.episode ? clone(entry.episode) : null }));
  }

  function getEpisode(id) {
    const entry = catalog.find(item => item.id === id && item.status === "playable");
    return entry?.episode ? clone(entry.episode) : null;
  }

  function resolveContinuity(id, completedEpisodeIds = []) {
    const episode = getEpisode(id);
    if (!episode) return null;
    const completed = new Set(Array.isArray(completedEpisodeIds) ? completedEpisodeIds : []);
    const lines = (episode.story.continuity || []).map(reference => (
      completed.has(reference.previousEpisodeId) ? reference.returning : reference.standalone
    ));
    if (lines.length) {
      episode.story.briefing.opening = [
        episode.story.briefing.opening[0],
        ...lines,
        ...episode.story.briefing.opening.slice(1)
      ];
    }
    episode.story.resolvedContinuity = lines;
    return episode;
  }

  function isPlayable(id) {
    return Boolean(catalog.find(entry => entry.id === id && entry.status === "playable" && entry.episode));
  }

  const catalogValidation = validateCatalog();
  if (!catalogValidation.valid) throw new Error(`Invalid episode catalog: ${catalogValidation.errors.join("; ")}`);

  root.RateMyBitesEpisodes = Object.freeze({
    schemaVersion: 2,
    defaultEpisodeId: "episode-001",
    getCatalog,
    getEpisode,
    resolveContinuity,
    isPlayable,
    validateEpisode,
    assertValidEpisode,
    validateCatalog
  });
})(window);
