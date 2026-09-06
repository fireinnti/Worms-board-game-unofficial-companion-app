export const STEPS = [
  { title: "Activate a Worm", text: "Choose any of your worms. If it shares a hex with a Supply Crate, remove the crate and draw a Supply Deck card.", rules: ["activation", "supply-crate"] },
  { title: "Heal if Damaged", text: "Stand your damaged active worm upright to restore it to full health.", rules: ["activation"] },
  { title: "Inch / Jump", text: "Inch to adjacent Land, Jump within two hexes, or stay put. Resolve landing effects before a Jump’s Scatter, then check the new destination.", rules: ["movement", "scatter", "damage"] },
  { title: "Inch / Jump again", text: "Choose a second Inch or Jump, or skip it. You can repeat the first movement choice. Resolve movement effects as they happen.", rules: ["movement", "scatter", "damage"] },
  { title: "Play a Weapon", text: "You may play a Weapon Card. Resolve its Action Line from left to right, completing each text action before continuing. Discard the fully resolved card.", rules: ["weapon-action-line", "card-priority", "damage"] },
  { title: "End-turn effects", text: "Resolve effects that trigger at the end of the turn, including any applicable Sudden Death card effects.", rules: ["end-turn", "sudden-death"] },
  { title: "Draw Drop Card", text: "Draw the top Drop Deck card and resolve all its text in order. If it is the Sudden Death Card, resolve it and keep it face up.", rules: ["drop-card", "sudden-death"] },
  { title: "Pass Target Token", text: "Pass the Target Token to the player on your left. Tap End turn below to start the next team at Activate a Worm.", rules: ["turn-sequence", "pass-token"] },
];

export const EDITIONS = {
  standard: { label: "Standard Edition", teams: ["BLUE", "RED", "YELLOW", "GREEN"] },
  collectors: { label: "Collector’s Edition", teams: ["BLUE", "RED", "YELLOW", "GREEN", "PURPLE", "GREY"] },
};
export const SESSION_VERSION = 2;
export const DEFAULT_WORMS = 4;

function inferEdition(teams) {
  return teams.length > 4 || teams.some((team) => ["PURPLE", "GREY"].includes(team.trim().toUpperCase())) ? "collectors" : "standard";
}
const freshStatus = () => ({ remaining: DEFAULT_WORMS, damaged: 0 });
const invalid = () => { throw new Error("Invalid saved session"); };

export function newSession(teams = EDITIONS.standard.teams, edition = inferEdition(teams)) {
  return parseSession(JSON.stringify({
    version: SESSION_VERSION, edition, teams, teamIndex: 0, step: 0,
    suddenDeath: false, turn: 1,
    teamStatus: Object.fromEntries(teams.map((team) => [team, freshStatus()])),
    finalRound: null,
  }));
}

export function parseSession(raw) {
  const value = JSON.parse(raw);
  if (!value || ![1, SESSION_VERSION].includes(value.version) || !Array.isArray(value.teams) || value.teams.length < 2 || value.teams.length > 6 ||
      value.teams.some((t) => typeof t !== "string" || !t.trim() || t.length > 20) || new Set(value.teams).size !== value.teams.length ||
      !Number.isInteger(value.teamIndex) || value.teamIndex < 0 || value.teamIndex >= value.teams.length ||
      !Number.isInteger(value.step) || value.step < 0 || value.step >= STEPS.length || typeof value.suddenDeath !== "boolean" ||
      !Number.isSafeInteger(value.turn) || value.turn < 1) invalid();
  const edition = value.edition === undefined ? inferEdition(value.teams) : value.edition;
  if (!["standard", "collectors"].includes(edition) || value.teams.length > EDITIONS[edition].teams.length) invalid();
  if (value.version === 1) return { ...value, version: SESSION_VERSION, edition,
    teamStatus: Object.fromEntries(value.teams.map((team) => [team, freshStatus()])), finalRound: null };
  const status = value.teamStatus;
  if (!status || typeof status !== "object" || Array.isArray(status) || Object.keys(status).length !== value.teams.length ||
      value.teams.some((team) => !Object.prototype.hasOwnProperty.call(status, team) || !Number.isInteger(status[team]?.remaining) ||
        !Number.isInteger(status[team]?.damaged) || status[team].remaining < 0 || status[team].remaining > DEFAULT_WORMS ||
        status[team].damaged < 0 || status[team].damaged > status[team].remaining)) invalid();
  const final = value.finalRound;
  if (final !== null && (!final || !Array.isArray(final.remainingTeams) || typeof final.ended !== "boolean" ||
      (final.activeTeam !== null && !value.teams.includes(final.activeTeam)) ||
      final.remainingTeams.some((t) => !value.teams.includes(t)) || new Set(final.remainingTeams).size !== final.remainingTeams.length)) invalid();
  return { ...value, edition };
}

export function updateTeamStatus(session, team, changes) {
  if (!session.teams.includes(team)) throw new Error("Unknown team");
  const next = { ...session.teamStatus[team], ...changes };
  if (!Number.isInteger(next.remaining) || !Number.isInteger(next.damaged) || next.remaining < 0 || next.remaining > DEFAULT_WORMS || next.damaged < 0 || next.damaged > next.remaining) throw new Error("Invalid worm counts");
  let result = { ...session, teamStatus: { ...session.teamStatus, [team]: next } };
  if (!session.finalRound && next.remaining === 0 && session.teamStatus[team].remaining > 0) {
    const current = session.teams[session.teamIndex];
    const order = [...session.teams.slice(session.teamIndex + 1), ...session.teams.slice(0, session.teamIndex + 1)];
    result.finalRound = { remainingTeams: order.filter((t) => result.teamStatus[t].remaining > 0), activeTeam: null, ended: false };
  }
  return result;
}

export function nextStep(session) {
  if (session.finalRound?.ended || session.step < STEPS.length - 1)
    return session.finalRound?.ended ? session : { ...session, step: session.step + 1 };
  if (session.finalRound) {
    const remaining = session.finalRound.remainingTeams.filter((t) => session.teamStatus[t].remaining > 0);
    if (!remaining.length) return { ...session, step: 0, finalRound: { ...session.finalRound, remainingTeams: [], activeTeam: null, ended: true } };
    const [next, ...rest] = remaining;
    return { ...session, step: 0, teamIndex: session.teams.indexOf(next), turn: session.turn + 1,
      finalRound: { remainingTeams: rest, activeTeam: next, ended: false } };
  }
  for (let offset = 1; offset <= session.teams.length; offset++) {
    const index = (session.teamIndex + offset) % session.teams.length;
    if (session.teamStatus[session.teams[index]].remaining > 0)
      return { ...session, step: 0, teamIndex: index, turn: session.turn + 1 };
  }
  return session;
}

export function calculateWinner(session) {
  if (!session.finalRound?.ended) return null;
  const scores = session.teams.map((team) => ({ team, remaining: session.teamStatus[team].remaining, undamaged: session.teamStatus[team].remaining - session.teamStatus[team].damaged }));
  const best = [...scores].sort((a, b) => b.remaining - a.remaining || b.undamaged - a.undamaged)[0];
  const winners = scores.filter((s) => s.remaining === best.remaining && s.undamaged === best.undamaged).map((s) => s.team);
  return { winner: winners.length === 1 ? winners[0] : null, draw: winners.length > 1, teams: winners, remaining: best.remaining, undamaged: best.undamaged };
}

export function reconcileTeams(session, teams, teamIndex, edition = session.edition) {
  const teamStatus = Object.fromEntries(teams.map((team) => [team, session.teamStatus[team] || freshStatus()]));
  let eligibleIndex = teamIndex;
  if (teamStatus[teams[eligibleIndex]]?.remaining === 0) eligibleIndex = teams.findIndex((t) => teamStatus[t].remaining > 0);
  if (eligibleIndex < 0) eligibleIndex = 0;
  const finalRound = session.finalRound && { ...session.finalRound,
    remainingTeams: session.finalRound.remainingTeams.filter((t) => teams.includes(t) && teamStatus[t].remaining > 0),
    activeTeam: teams.includes(session.finalRound.activeTeam) ? session.finalRound.activeTeam : null };
  return { ...session, edition, teams, teamIndex: eligibleIndex, teamStatus, finalRound };
}

export function createSessionWriter(storage, key) {
  let pending = Promise.resolve();
  return (session) => (pending = pending.catch(() => {}).then(() => storage.setItem(key, JSON.stringify(session))));
}
