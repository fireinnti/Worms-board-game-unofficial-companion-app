// Paraphrased summaries checked against the supplied 24-page digital rulebook.
// See docs/rules-audit.md for source identity and verification notes.
// Keep this dataset small and retrieval-friendly; the physical game remains the source of truth.
const SECTIONS = [
  {
    id: "turn-sequence",
    title: "Turn sequence",
    tags: ["turn", "active", "phase", "order"],
    page: 8,
    text: "Each turn follows: activate a worm; heal if damaged; Inch or Jump; Inch or Jump again; play a Weapon Card; end turn; draw a Drop Card; pass the Target Token.",
  },
  {
    id: "movement",
    title: "Movement: Inch and Jump",
    tags: ["move", "inch", "jump", "water", "scatter"],
    page: "8–10",
    text: "Inch moves a worm from a Land hex to an adjacent Land hex. Jump chooses any hex within two hexes, ignores intervening hexes, moves there, resolves landing effects, then Scatters the surviving worm and resolves the new destination (see the example on p. 10). A worm may also choose not to move.",
  },
  {
    id: "simultaneous-effects",
    title: "Simultaneous effects",
    tags: ["mine", "fire", "crate", "order", "trigger"],
    page: 8,
    text: "If two or more effects trigger at the same time, the player whose turn it is may choose the order in which they are resolved.",
  },
  {
    id: "card-priority",
    title: "Card priority",
    tags: ["card", "override", "weapon"],
    page: 8,
    text: "If a rule on a card and a rule in the book contradict one another, follow the rules on the card.",
  },
  {
    id: "weapon-action-line",
    title: "Weapon Action Line",
    tags: ["weapon", "action", "card", "left", "right"],
    page: 11,
    text: "Resolve the symbols on a Weapon Card Action Line from left to right. Card text must be fully resolved before moving to the next symbol.",
  },
  {
    id: "damage",
    title: "Damage",
    tags: ["damage", "worm", "oil drum", "mine", "crate"],
    page: 17,
    text: "A full-health worm becomes Damaged; a Damaged worm is destroyed. If your worm is Damaged during your turn, finish any Weapon Card text already being resolved, then skip immediately to step 6: End turn. The result of damaging other Things depends on the Thing reference.",
  },
  {
    id: "water",
    title: "Water hexes",
    tags: ["water", "sink", "destroy", "phantom"],
    page: 18,
    text: "If a Thing moves or is placed onto a Water hex, or finds itself in Water, it sinks and is destroyed, even if normally indestructible. Hexes off the edge of the map are also Water. Phantom Water hexes are valid for counting, Scatter, and targeting.",
  },
  {
    id: "full-hex",
    title: "Full hex",
    tags: ["full", "three", "knockback", "overflow"],
    page: "18–19",
    text: "A hex can hold a maximum of three Things. If it has four or more after movement or placement and the resulting effects resolve, choose a worm to Knockback Scatter; if there are no worms, choose a non-Crater Thing.",
  },
  {
    id: "scatter",
    title: "Scatter",
    tags: ["scatter", "direction", "knockback", "wind"],
    page: 20,
    text: "Roll a die and move the target or Thing one hex in the rolled direction, in the Wind Direction for the wind symbol, or not at all for the no-move symbol. Knockback Scatter replaces no-move with a chosen direction.",
  },
  {
    id: "supply-crate",
    title: "Supply Crates",
    tags: ["crate", "supply", "draw", "activation"],
    page: 21,
    text: "If a worm begins activation in a hex containing a Supply Crate or moves into one, remove the crate and draw a Supply Deck card. A crate is not picked up merely because it is placed into a worm’s hex.",
  },
  {
    id: "mine",
    title: "Mines",
    tags: ["mine", "danger", "blast", "move"],
    page: 22,
    text: "If a worm moves into a hex with a Mine, or vice versa, destroy the Mine and flip the Danger Flipper. If Danger is rolled, resolve a Blast in the hex. If a Mine is Damaged, destroy it and resolve a Blast.",
  },
  {
    id: "sudden-death",
    title: "Sudden Death",
    tags: ["sudden", "death", "drop"],
    page: "11, 21",
    text: "The Sudden Death Card is the final card in the Drop Deck. When it is revealed, resolve its text and keep it face up. On later Drop steps, resolve its Drop portion instead of drawing another card. Apply any ongoing rules printed on it.",
  },
  {
    id: "elimination",
    title: "Elimination and winning",
    tags: ["elimination", "win", "round", "worms"],
    page: 13,
    text: "When a Team has no remaining worms, it is eliminated. After the first elimination, finish the current turn, then each player takes one more turn. The player with the most remaining worms wins; undamaged worms break a tie. If that is also tied, the game is a draw. The final round includes the player whose turn just ended.",
  },
  {
    id: "activation",
    title: "Activation and healing",
    tags: ["activate", "activation", "heal", "healing"],
    page: 8,
    text: "Choose any worm on your team as the active worm. Collect a Supply Crate in its hex at activation. In step 2, stand it upright if Damaged to restore full health.",
  },
  {
    id: "end-turn",
    title: "End-turn effects",
    tags: ["end", "turn", "effects"],
    page: 11,
    text: "At step 6, resolve effects that trigger at the end of the turn. Then proceed to the Drop step and pass the Target Token.",
  },
  {
    id: "drop-card",
    title: "Drop Cards",
    tags: ["drop", "deck", "draw"],
    page: 11,
    text: "Draw the top card of the Drop Deck and resolve all its text from top to bottom. Discard a completed Drop Card into the box. Resolve and retain the Sudden Death Card when it is revealed; use its Drop portion on later turns.",
  },
  {
    id: "pass-token",
    title: "Pass the Target Token",
    tags: ["pass", "token", "left"],
    page: 11,
    text: "Pass the Target Token to the player on your left, taking it from the map if necessary. That player takes the next turn.",
  },
  {
    id: "accuracy",
    title: "Accuracy",
    tags: ["accuracy", "range", "target"],
    page: 16,
    text: "For Accuracy X, subtract the extra distance beyond an adjacent hex, counting Water too, to a minimum of one die. Roll that many dice and choose one: a number moves the target one hex in that direction, wind moves it one hex downwind, and the no-move result leaves it in place.",
  },
  {
    id: "blast",
    title: "Blast",
    tags: ["blast", "explosion", "crater"],
    page: 16,
    text: "A Blast in Water does nothing. Otherwise add a Crater, then resolve each Thing, worms before other Things. For each, roll a die: Damage it and move it one hex in the rolled direction or Wind Direction; the no-move result only Damages it. Resolve effects in destination hexes. You choose the order within the worms-first restriction.",
  },
  {
    id: "crater",
    title: "Craters",
    tags: ["crater", "craters"],
    page: 16,
    text: "Craters count as Things and cannot normally move or be destroyed. When a hex contains three Craters, destroy everything in that hex, including the Craters, and replace the hex with Water.",
  },
  {
    id: "fire",
    title: "Fire",
    tags: ["fire", "danger"],
    page: 18,
    text: "Fire is a Thing and cannot normally move or be destroyed, except by effects specifically allowing it or by Water. When a Thing moves into its hex, remove the Fire and flip the Danger Flipper. On Danger, Damage the entering Thing.",
  },
  {
    id: "direct",
    title: "Direct targeting",
    tags: ["direct", "target", "targeting"],
    page: "19, 21",
    text: "A Direct hex lies along one of the six straight Wind Dial directions from your worm. Your own hex also counts as Direct. Follow the targeting restriction on the card; the Target Token does not count as a Thing.",
  },
  {
    id: "oil-drum",
    title: "Oil Drums",
    tags: ["oil", "drum", "drums"],
    page: "17, 22",
    text: "When Damaged, remove the Oil Drum and roll five dice. Number results identify adjacent hexes, wind identifies the downwind hex, and no-move identifies the drum’s own hex. Damage all Things in the indicated hexes, then place Fire in each. Resolve each distinct hex only once.",
  },
  {
    id: "wind",
    title: "Wind Direction",
    tags: ["wind", "direction"],
    page: 17,
    text: "Use the Wind Dial for direction numbers. When told to change Wind Direction, roll one die: a number sets the new direction; either symbol leaves the Wind unchanged.",
  },
  {
    id: "setup",
    title: "Setup and teams",
    tags: ["setup", "teams", "players"],
    page: "6–7, 14–15",
    text: "For normal setup, use four worms in each participating colour, plus one Oil Drum, Mine and Supply Crate per player. Players place Things before randomly receiving their team Reference Cards. The introductory setup uses two worms each. The illustrated base-game colours are Blue, Red, Yellow and Green.",
  },
  {
    id: "first-player",
    title: "First player",
    tags: ["first", "player", "setup"],
    page: 6,
    text: "The youngest player starts setup. For the game itself, the player with the lowest number on their team Reference Card takes the Target Token. Roll a numerical die result to set Wind Direction. The introductory setup instead starts with Blue and Wind Direction 2 (p. 14).",
  },
  {
    id: "starting-hand",
    title: "Starting hand and decks",
    tags: ["setup", "cards", "deck", "hand"],
    page: 6,
    text: "Each player starts with Uzi, Bazooka, Ninja Rope and Girder, plus one random remaining Starter card. Shuffle non-Starter weapons into the Supply Deck. Put two random Drop Cards per player plus two extra above one randomly selected face-down Sudden Death Card.",
  },
  {
    id: "knockback",
    title: "Knockback Scatter",
    tags: ["knockback", "scatter"],
    page: 20,
    text: "Use the normal Scatter roll, except the no-move symbol means choose a direction and move the Thing one hex. Check effects in the destination hex.",
  },
  {
    id: "place",
    title: "Place and move",
    tags: ["place", "move", "pool", "full"],
    page: 19,
    text: "Place takes a Thing from the supply pool; moving relocates one already on the board. If no component remains in the pool, you cannot place another. After placement and its effects, check for a full hex.",
  },
  {
    id: "air-strike",
    title: "Air Strike targeting",
    tags: ["air", "strike", "target"],
    page: 21,
    text: "Use the directional face of the Target Token in any hex, pointing along one of the six directions. Resolve the token’s hex, then the next two hexes in that direction, in order. Scattering the token does not rotate it.",
  },
  {
    id: "weapon-symbols",
    title: "Weapon Action Line symbols",
    tags: ["weapon", "symbols", "action"],
    page: 11,
    text: "The movement symbol allows an Inch or Jump; repeated movement symbols allow repeated moves. The additional-card symbol plays another Weapon Card from your hand. The text symbol resolves all weapon text in order; repeated text symbols repeat that entire text. Finish the Action Line, then discard the card.",
  },
  {
    id: "optional-rules",
    title: "Optional rules",
    tags: ["optional", "timer", "settings"],
    page: 23,
    text: "Agree on optional rules before play. Page 23 offers Parting Gifts, True Elimination, Sudden Death Draft, No Sudden Death, Late Superweapons, Longer game, Reduced Blast, Larger map and a 60-second Timer. These change the normal rules; consult that page for their full instructions. The turn assistant does not automatically apply these variants.",
  },
  {
    id: "extra-players",
    title: "Playing with 5–6 players",
    tags: ["players", "teams", "five", "six", "5", "6", "expansion", "setup"],
    page: 1,
    source: "Extra Rules",
    text: "For five or six players, shuffle the required extra player cards (numbered 5 and 6) with the original four before assigning Teams. Normal setup and starting hands still apply. Each extra player uses four worms, one Oil Drum, one Supply Crate, one Mine and another Map Tile. The Collector’s Edition supplies the additional components, including matching base rings and more Water hexes.",
  },
  {
    id: "extra-weapons",
    title: "Extra Weapon and Superweapon Cards",
    tags: ["expansion", "weapon", "superweapon", "cards"],
    page: 1,
    source: "Extra Rules",
    text: "Shuffle the new Weapon and Superweapon Cards into the existing deck and play as normal. You may remove some original cards to see new cards more often. Some new weapons, such as the Electromagnet, include tokens and a Reference Card with additional rules; consult those for the weapon’s effects.",
  },
];

export const SOURCE_DOCUMENTS = {
  "main-rulebook": {
    id: "main-rulebook",
    title: "Worms: The Board Game — Rulebook",
    shortTitle: "Main rulebook",
    fileName: "Copy of Worms - Rulebook DIGITAL.pdf",
    sha256: "8e92b7f42f74d06a97e13e4effe179080b62bd644da3fc8913a6dfdc44b11511",
    pdfPages: 24,
    publisher: "Steamforged Games",
    // The verified source was supplied locally; do not substitute an unverified mirror.
    pdfUrl: null,
    fallbackUrl: "https://steamforged.com/products/worms-the-board-game",
  },
  "extra-rules": {
    id: "extra-rules",
    title: "Worms: The Board Game — Extra Rules",
    shortTitle: "Extra Rules",
    fileName: "additionalplayers.pdf",
    sha256: "dc9e359d1ad2126d1367300b6c7a90aae7e20374ecb70210ec3d1bd54adbc621",
    pdfPages: 1,
    publisher: "Steamforged Games",
    pdfUrl: null,
    fallbackUrl: "https://steamforged.com/products/worms-the-board-game",
  },
};

const pageNumbers = (page) => String(page).split(/[^0-9]+/).filter(Boolean).map(Number);

// Every indexed passage carries both coordinate systems and an immutable source ID.
// In these verified files printed numbering and PDF positioning coincide.
export const RULE_SECTIONS = SECTIONS.map((section) => {
  const sourceDocumentId = section.source === "Extra Rules" ? "extra-rules" : "main-rulebook";
  const pages = pageNumbers(section.page);
  return {
    ...section,
    sourceDocumentId,
    source: SOURCE_DOCUMENTS[sourceDocumentId].shortTitle,
    pdfPages: pages,
    printedPages: pages,
    excerpt: section.text,
  };
});

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "i",
  "my",
  "is",
  "it",
  "in",
  "on",
  "at",
  "to",
  "of",
  "and",
  "or",
  "for",
  "can",
  "do",
  "does",
  "what",
  "which",
  "how",
  "when",
  "happens",
  "now",
  "with",
  "if",
  "this",
  "that",
  "be",
  "are",
  "you",
  "match",
]);
const ALIASES = {
  ocean: "water", sea: "water", drown: "water", drowning: "water",
  walking: "inch", walk: "inch", leap: "jump", leaping: "jump",
  object: "thing", objects: "thing", pieces: "thing", piece: "thing",
  space: "hex", spaces: "hex", crowded: "full", several: "full",
  explode: "blast", explodes: "blast", explosion: "blast",
  barrels: "drum", barrel: "drum", pickups: "crate", pickup: "crate",
  simultaneous: "same-time", together: "same-time", first: "order",
};
const stem = (word) => word.length > 4 ? word.replace(/(ing|ers|ies|ed|es|s)$/, "") : word;
const tokenize = (text) =>
  text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t))
    .flatMap((term) => [term, ALIASES[term]].filter(Boolean))
    .map(stem);

export function retrieveRules(query, limit = 8) {
  const terms = [...new Set(tokenize(query))];
  if (!terms.length) return [];
  return RULE_SECTIONS.map((section, order) => {
    const titleWords = new Set(tokenize(section.title));
    const tagWords = new Set(tokenize(section.tags.join(" ")));
    const passageWords = new Set(tokenize(section.excerpt));
    const matchedTerms = terms.filter((term) =>
      titleWords.has(term) || tagWords.has(term) || passageWords.has(term)
    );
    const score = matchedTerms.reduce((total, term) => total +
      (titleWords.has(term) ? 8 : 0) +
      (tagWords.has(term) ? 5 : 0) +
      (passageWords.has(term) ? 2 : 0), 0) +
      (matchedTerms.length > 1 ? matchedTerms.length * 3 : 0);
    return { section, score, matchedTerms, order };
  })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.matchedTerms.length - a.matchedTerms.length || a.order - b.order)
    .slice(0, Math.max(1, limit))
    .map(({ section, score, matchedTerms }) => ({ ...section, score, matchedTerms }));
}

export function rulesByIds(ids) {
  return ids
    .map((id) => RULE_SECTIONS.find((section) => section.id === id))
    .filter(Boolean);
}

export function ruleSource(rule) {
  return `${rule.source || "Main rulebook"} · PDF p. ${rule.page} · printed p. ${rule.page}`;
}


export function ruleDocumentLink(rule) {
  const document = SOURCE_DOCUMENTS[rule.sourceDocumentId];
  return document.pdfUrl
    ? { url: `${document.pdfUrl}#page=${rule.pdfPages[0]}`, deepLinked: true, label: `Open PDF at page ${rule.pdfPages[0]}` }
    : { url: document.fallbackUrl, deepLinked: false, label: "PDF page link unavailable — open publisher page" };
}

function result(ruling, resolution, confidence, references) {
  return {
    ruling,
    resolution,
    confidence,
    references,
    source: references.length
      ? references.map((r) => `${r.title} · ${ruleSource(r)}`).join("\n")
      : "No matching section in the local reference",
  };
}

// Only narrowly recognised questions receive direct rulings. Longer scenarios
// get references, not a keyword-based claim that the interaction is settled.
export function answerQuestion(query) {
  const normalized = query
    .toLowerCase()
    .trim()
    .replace(/[?.!]+$/, "")
    .replace(/\s+/g, " ");
  if (
    /^(can i|may i|can a worm) (jump twice|jump two times)$/.test(normalized)
  ) {
    return result(
      "Yes. Both movement steps can be Jumps.",
      [
        "Resolve the first Jump, including landing effects and Scatter. Apply the Damage rule immediately if your active worm is Damaged.",
        "Check each destination for triggered effects and Water; do not continue movement after the Damage rule sends you to End turn.",
        "Otherwise, you may take the second Jump, resolving its landing effects and Scatter in the same way.",
      ],
      "Exact answer",
      rulesByIds(["turn-sequence", "movement", "damage"]),
    );
  }
  if (
    /^(can i|may i) (choose not to move|not move|skip (a |the )?movement( step)?)$/.test(
      normalized,
    )
  ) {
    return result(
      "Yes. You may skip either or both movement steps.",
      [
        "Skip the movement step you do not want to use.",
        "Continue to the next turn step.",
      ],
      "Exact answer",
      rulesByIds(["movement", "turn-sequence"]),
    );
  }
  if (/^does card text override (the )?rulebook$/.test(normalized)) {
    return result(
      "Yes, where the card and rulebook contradict each other, the card takes precedence.",
      ["Read the card instruction and apply it to that conflict."],
      "Exact answer",
      rulesByIds(["card-priority"]),
    );
  }
  if (
    /^(which effect resolves first|which effects resolve first)$/.test(
      normalized,
    )
  ) {
    return result(
      "If effects trigger at the same time, the active player chooses their order.",
      [
        "Check that the effects actually trigger simultaneously.",
        "Follow any specific ordering instructions, such as worms before other Things in a Blast.",
      ],
      "Exact answer",
      rulesByIds(["simultaneous-effects", "blast"]),
    );
  }
  if (/^when does sudden death (begin|start)$/.test(normalized)) {
    return result(
      "Resolve the Sudden Death Card when it is revealed at the end of the Drop Deck.",
      [
        "Resolve its text and keep it face up.",
        "Apply its ongoing rules, and use its Drop portion on later Drop steps.",
      ],
      "Exact answer",
      rulesByIds(["sudden-death", "drop-card"]),
    );
  }
  if (/^can i activate the same worm every turn$/.test(normalized)) {
    return result(
      "The activation step lets you choose any of your worms.",
      [
        "Choose a worm on your team; the activation rule does not require alternating worms.",
        "Resolve any activation crate pickup, then healing.",
      ],
      "Exact answer",
      rulesByIds(["activation"]),
    );
  }
  if (
    /^(can (we|i) play with (5|6|five|six) players|how (do (we|i)|to) (set up|play) (with |for )?(5|6|five|six) players)$/.test(
      normalized,
    )
  ) {
    return result(
      "Yes. The Extra Rules sheet supports five or six players with the additional components.",
      [
        "Include the required extra player cards (5 and 6) before assigning Teams.",
        "Use normal setup and starting hands, with four worms and one Oil Drum, Supply Crate and Mine per player.",
        "Add a Map Tile for each extra player and use their matching team rings.",
      ],
      "Exact answer",
      rulesByIds(["extra-players", "setup", "starting-hand"]),
    );
  }
  const matches = retrieveRules(query);
  return result(
    normalized
      ? "I do not have a verified direct answer for this scenario."
      : "Enter a rules question first.",
    matches.length
      ? [
          "These related summaries may help, but do not establish the answer to the whole scenario.",
          "Check the cited rulebook sections and the specific card text.",
        ]
      : [
          "Try naming the relevant action or Thing, such as Jump, Mine, or Fire.",
        ],
    matches.length ? "Related passage" : "No clear rule found",
    matches,
  );
}
