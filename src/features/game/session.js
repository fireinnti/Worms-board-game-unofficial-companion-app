export const STEPS = [
  {
    title: "Activate a Worm",
    text: "Choose any of your worms. If it shares a hex with a Supply Crate, remove the crate and draw a Supply Deck card.",
    rules: ["activation", "supply-crate"],
  },
  {
    title: "Heal if Damaged",
    text: "Stand your damaged active worm upright to restore it to full health.",
    rules: ["activation"],
  },
  {
    title: "Inch / Jump",
    text: "Inch to adjacent Land, Jump within two hexes, or stay put. Resolve landing effects before a Jump’s Scatter, then check the new destination.",
    rules: ["movement", "scatter", "damage"],
  },
  {
    title: "Inch / Jump again",
    text: "Choose a second Inch or Jump, or skip it. You can repeat the first movement choice. Resolve movement effects as they happen.",
    rules: ["movement", "scatter", "damage"],
  },
  {
    title: "Play a Weapon",
    text: "You may play a Weapon Card. Resolve its Action Line from left to right, completing each text action before continuing. Discard the fully resolved card.",
    rules: ["weapon-action-line", "card-priority", "damage"],
  },
  {
    title: "End-turn effects",
    text: "Resolve effects that trigger at the end of the turn, including any applicable Sudden Death card effects.",
    rules: ["end-turn", "sudden-death"],
  },
  {
    title: "Draw Drop Card",
    text: "Draw the top Drop Deck card and resolve all its text in order. If it is the Sudden Death Card, resolve it and keep it face up.",
    rules: ["drop-card", "sudden-death"],
  },
  {
    title: "Pass Target Token",
    text: "Pass the Target Token to the player on your left. Tap End turn below to start the next team at Activate a Worm.",
    rules: ["turn-sequence", "pass-token"],
  },
];

export const EDITIONS = {
  standard: {
    label: "Standard Edition",
    teams: ["BLUE", "RED", "YELLOW", "GREEN"],
  },
  collectors: {
    label: "Collector’s Edition",
    teams: ["BLUE", "RED", "YELLOW", "GREEN", "PURPLE", "GREY"],
  },
};

// Older saves did not record an edition. Preserve extra teams when restoring them.
function inferEdition(teams) {
  return teams.length > 4 ||
    teams.some((team) => ["PURPLE", "GREY"].includes(team.trim().toUpperCase()))
    ? "collectors"
    : "standard";
}

export function newSession(
  teams = EDITIONS.standard.teams,
  edition = inferEdition(teams),
) {
  return parseSession(
    JSON.stringify({
      version: 1,
      edition,
      teams,
      teamIndex: 0,
      step: 0,
      suddenDeath: false,
      turn: 1,
    }),
  );
}

export function parseSession(raw) {
  const value = JSON.parse(raw);
  if (
    !value ||
    value.version !== 1 ||
    !Array.isArray(value.teams) ||
    value.teams.length < 2 ||
    value.teams.length > 6 ||
    value.teams.some(
      (t) => typeof t !== "string" || !t.trim() || t.length > 20,
    ) ||
    new Set(value.teams).size !== value.teams.length ||
    !Number.isInteger(value.teamIndex) ||
    value.teamIndex < 0 ||
    value.teamIndex >= value.teams.length ||
    !Number.isInteger(value.step) ||
    value.step < 0 ||
    value.step >= STEPS.length ||
    typeof value.suddenDeath !== "boolean" ||
    !Number.isSafeInteger(value.turn) ||
    value.turn < 1
  ) {
    throw new Error("Invalid saved session");
  }
  const edition =
    value.edition === undefined ? inferEdition(value.teams) : value.edition;
  if (
    !["standard", "collectors"].includes(edition) ||
    value.teams.length > EDITIONS[edition].teams.length
  ) {
    throw new Error("Invalid saved edition or player count");
  }
  return { ...value, edition };
}

export function nextStep(session) {
  if (session.step < STEPS.length - 1)
    return { ...session, step: session.step + 1 };
  return {
    ...session,
    step: 0,
    teamIndex: (session.teamIndex + 1) % session.teams.length,
    turn: session.turn + 1,
  };
}

// Serialize writes so an older slow write cannot overwrite a newer turn.
export function createSessionWriter(storage, key) {
  let pending = Promise.resolve();
  return (session) => {
    pending = pending
      .catch(() => {})
      .then(() => storage.setItem(key, JSON.stringify(session)));
    return pending;
  };
}
