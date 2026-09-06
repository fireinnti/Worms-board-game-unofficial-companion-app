// Structured, page-grounded excerpts from the supplied Worms: The Board Game rulebook.
// Keep this dataset small and retrieval-friendly; the physical game remains the source of truth.
export const RULE_SECTIONS = [
  { id: 'turn-sequence', title: 'Turn sequence', tags: ['turn', 'active', 'phase', 'order'], page: 8, text: 'Each turn follows: activate a worm; heal if damaged; Inch or Jump; Inch or Jump again; play a Weapon Card; end turn; draw a Drop Card; pass the Target Token.' },
  { id: 'movement', title: 'Movement: Inch and Jump', tags: ['move', 'inch', 'jump', 'water', 'scatter'], page: 9, text: 'Inch moves a worm from a Land hex to an adjacent Land hex. Jump chooses any hex within two hexes, ignores intervening hexes, moves there, then Scatters the worm. A worm may also choose not to move.' },
  { id: 'simultaneous-effects', title: 'Simultaneous effects', tags: ['mine', 'fire', 'crate', 'order', 'trigger'], page: 8, text: 'If two or more effects trigger at the same time, the player whose turn it is may choose the order in which they are resolved.' },
  { id: 'card-priority', title: 'Card priority', tags: ['card', 'override', 'weapon'], page: 8, text: 'If a rule on a card and a rule in the book contradict one another, follow the rules on the card.' },
  { id: 'weapon-action-line', title: 'Weapon Action Line', tags: ['weapon', 'action', 'card', 'left', 'right'], page: 11, text: 'Resolve the symbols on a Weapon Card Action Line from left to right. Card text must be fully resolved before moving to the next symbol.' },
  { id: 'damage', title: 'Damage', tags: ['damage', 'worm', 'oil drum', 'mine', 'crate'], page: 17, text: 'A full-health worm becomes Damaged; a Damaged worm is destroyed. The result of damaging other Things depends on the Thing reference.' },
  { id: 'water', title: 'Water hexes', tags: ['water', 'sink', 'destroy', 'phantom'], page: 18, text: 'If a Thing moves or is placed onto a Water hex, it sinks and is destroyed. Hexes off the edge of the map are also Water. Phantom Water hexes are valid for counting, Scatter, and targeting.' },
  { id: 'full-hex', title: 'Full hex', tags: ['full', 'three', 'knockback', 'overflow'], page: 18, text: 'A hex can hold a maximum of three Things. If it has four or more after a move and its effects resolve, choose a worm to Knockback Scatter; if there are no worms, choose a non-Crater Thing.' },
  { id: 'scatter', title: 'Scatter', tags: ['scatter', 'direction', 'knockback', 'wind'], page: 20, text: 'Roll a die and move the target or Thing one hex in the rolled direction, in the Wind Direction for the wind symbol, or not at all for the no-move symbol. Knockback Scatter replaces no-move with a chosen direction.' },
  { id: 'supply-crate', title: 'Supply Crates', tags: ['crate', 'supply', 'draw', 'activation'], page: 21, text: 'If a worm begins activation in a hex containing a Supply Crate or moves into one, remove the crate and draw a Supply Deck card. A crate is not picked up merely because it is placed into a worm’s hex.' },
  { id: 'mine', title: 'Mines', tags: ['mine', 'danger', 'blast', 'move'], page: 22, text: 'If a worm moves into a hex with a Mine, or vice versa, destroy the Mine and flip the Danger Flipper. If Danger is rolled, resolve a Blast in the hex. If a Mine is Damaged, destroy it and resolve a Blast.' },
  { id: 'sudden-death', title: 'Sudden Death', tags: ['sudden', 'death', 'drop'], page: 21, text: 'After all Drop Cards have been drawn, reveal the Sudden Death Card. It remains face up and its Drop portion is used whenever a Drop Card would normally be resolved.' },
  { id: 'elimination', title: 'Elimination and winning', tags: ['elimination', 'win', 'round', 'worms'], page: 13, text: 'When a Team has no remaining worms, it is eliminated. After the first elimination, finish the current turn, then each player takes one more turn. The player with the most remaining worms wins; undamaged worms break a tie.' },
];

export function retrieveRules(query, limit = 5) {
  const terms = query.toLowerCase().split(/\W+/).filter(Boolean);
  return RULE_SECTIONS.map(section => ({
    section,
    score: terms.reduce((score, term) => score + (section.tags.includes(term) ? 3 : `${section.title} ${section.text}`.toLowerCase().includes(term) ? 1 : 0), 0),
  })).filter(item => item.score > 0).sort((a, b) => b.score - a.score).slice(0, limit).map(item => item.section);
}

export function answerQuestion(query) {
  const normalized = query.toLowerCase();
  const matches = retrieveRules(query);
  let ruling = 'The supplied rulebook reference does not establish a direct answer to this question.';
  let confidence = 'Not specified';
  let resolution = ['Check the specific card text first.', 'If the interaction is still not settled, agree on a table ruling rather than treating an assumption as an official rule.'];

  if (/jump twice|two jump|jump.*again/.test(normalized)) {
    ruling = 'Yes. The two movement steps may both be Jump actions, and each Jump is followed by Scatter.';
    confidence = 'Explicitly covered';
    resolution = ['Resolve the first Jump and its Scatter.', 'Resolve the second Jump and its Scatter.', 'Resolve any triggered effects as they occur.'];
  } else if (/not move|skip.*move|move.*skip/.test(normalized)) {
    ruling = 'Yes. A worm may choose not to move during either movement step.';
    confidence = 'Explicitly covered';
    resolution = ['Skip the first movement step if desired.', 'Skip the second movement step if desired.', 'Continue to Play a Weapon Card.'];
  } else if (/card text.*(override|contradict)|override.*(card|rulebook)/.test(normalized)) {
    ruling = 'Yes. If a card rule contradicts a rule in the book, follow the card.';
    confidence = 'Explicitly covered';
    resolution = ['Read the card text as written.', 'Apply the card instruction for that conflict.', 'Continue the remaining Action Line from left to right.'];
  } else if (/mine.*(crate|fire)|fire.*mine|crate.*mine/.test(normalized)) {
    ruling = 'The active player chooses the resolution order when the Mine, Fire, or Supply Crate effects trigger at the same time.';
    confidence = 'Explicitly covered';
    resolution = ['Choose which triggered effect resolves first.', 'Finish that effect completely.', 'Resolve the remaining triggered effect(s).'];
  } else if (/sudden death|when.*sudden/.test(normalized)) {
    ruling = 'Sudden Death begins when the last Drop Card is drawn and the Sudden Death Card is revealed.';
    confidence = 'Explicitly covered';
    resolution = ['Reveal the Sudden Death Card.', 'Keep it face up near the map.', 'Use its Drop portion whenever a Drop Card would normally be resolved.'];
  } else if (/water.*jump|jump.*water/.test(normalized)) {
    ruling = 'A Jump ignores intervening hexes when choosing its destination, but the worm is Scattered after moving and may end up in Water.';
    confidence = 'Explicitly covered';
    resolution = ['Choose a destination within two hexes.', 'Move there, ignoring intervening hexes.', 'Scatter the worm and resolve the resulting destination.'];
  } else if (matches.length) {
    ruling = `Relevant rulebook guidance: ${matches[0].text}`;
    confidence = 'Explicitly covered / context-dependent';
  }
  return { ruling, resolution, confidence, source: matches.length ? matches.map(match => `p. ${match.page}`).join(' · ') : 'Rulebook · no matching section' };
}
