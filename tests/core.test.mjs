import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const moduleFrom = async (path) =>
  import(
    `data:text/javascript;base64,${Buffer.from(await readFile(new URL(path, import.meta.url))).toString("base64")}`
  );
const { newSession, nextStep, parseSession, createSessionWriter, updateTeamStatus, calculateWinner, STEPS } =
  await moduleFrom("../src/features/game/session.js");
const { answerQuestion, retrieveRules, RULE_SECTIONS } = await moduleFrom(
  "../src/data/rules/index.js",
);

test("all four base-game teams are available by default", () => {
  assert.deepEqual(newSession().teams, ["BLUE", "RED", "YELLOW", "GREEN"]);
});
for (const count of [2, 3, 4, 5, 6])
  test(`${count} teams complete a full rotation without losing Sudden Death`, () => {
    let game = {
      ...newSession(Array.from({ length: count }, (_, i) => `Team ${i + 1}`)),
      suddenDeath: true,
    };
    for (let team = 0; team < count; team++) {
      assert.equal(game.teamIndex, team);
      for (let step = 0; step < 8; step++) {
        assert.equal(game.step, step);
        game = nextStep(game);
      }
    }
    assert.equal(game.teamIndex, 0);
    assert.equal(game.turn, count + 1);
    assert.equal(game.suddenDeath, true);
  });
test("saved sessions round-trip and reject corrupted state", () => {
  const game = {
    ...newSession(),
    teamIndex: 3,
    step: 6,
    suddenDeath: true,
    turn: 19,
  };
  assert.deepEqual(parseSession(JSON.stringify(game)), game);
  for (const patch of [
    { step: 8 },
    { step: -1 },
    { teamIndex: 4 },
    { teams: ["BLUE", "BLUE"] },
    { teams: [] },
    { suddenDeath: "yes" },
    { version: 3 },
    { turn: 0 },
  ])
    assert.throws(() => parseSession(JSON.stringify({ ...game, ...patch })));
  assert.throws(() => parseSession("{broken"));
});
test("queued persistence keeps newest state even after a failed write", async () => {
  const saved = [];
  const write = createSessionWriter(
    {
      async setItem(key, value) {
        const game = JSON.parse(value);
        if (game.turn === 2) throw Error("disk unavailable");
        saved.push(game.turn);
      },
    },
    "test",
  );
  const first = write(newSession());
  const failed = write({ ...newSession(), turn: 2 });
  const last = write({ ...newSession(), turn: 3 });
  await first;
  await assert.rejects(failed);
  await last;
  assert.deepEqual(saved, [1, 3]);
});
test("keywords in a complex scenario never imply a verified ruling", () => {
  for (const query of [
    "Can I Jump twice after taking damage?",
    "Can I jump into water and survive?",
    "A mine was placed beside a crate; does it trigger?",
    "My Bazooka hit two worms and an Oil Drum. What happens?",
  ])
    assert.equal(
      answerQuestion(query).confidence,
      "Not specified by this reference",
    );
});
test("common answers cite the actual supporting sections", () => {
  assert.deepEqual(
    answerQuestion("Does card text override the rulebook?").references.map(
      (r) => r.id,
    ),
    ["card-priority"],
  );
  assert.ok(
    answerQuestion("Can I Jump twice?").references.some(
      (r) => r.id === "damage",
    ),
  );
  assert.ok(
    answerQuestion("Which effect resolves first?").references.some(
      (r) => r.id === "simultaneous-effects",
    ),
  );
  assert.ok(
    answerQuestion("When does Sudden Death begin?").references.some(
      (r) => r.id === "drop-card",
    ),
  );
});
test("empty and stop-word questions do not retrieve arbitrary rule excerpts", () => {
  assert.deepEqual(retrieveRules("What is it?"), []);
  assert.deepEqual(retrieveRules(""), []);
  assert.equal(retrieveRules("Fire")[0].id, "fire");
});
test("every turn step has valid references and rule IDs are unique", () => {
  const ids = new Set(RULE_SECTIONS.map((r) => r.id));
  assert.equal(ids.size, RULE_SECTIONS.length);
  STEPS.forEach((step) =>
    step.rules.forEach((id) => assert.ok(ids.has(id), id)),
  );
});

test("six-player answers cite the expansion separately from the main rulebook", () => {
  const answer = answerQuestion("Can we play with 6 players?");
  assert.equal(answer.confidence, "Explicitly covered");
  assert.equal(answer.references[0].id, "extra-players");
  assert.equal(answer.references[0].source, "Extra Rules");
  assert.match(answer.source, /Extra Rules · p. 1/);
});

test("edition persists for a Collector’s game with only two players", () => {
  const session = { ...newSession(["PURPLE", "BLUE"], "collectors"), step: 7 };
  const next = nextStep(session);
  assert.equal(parseSession(JSON.stringify(next)).edition, "collectors");
  assert.equal(
    newSession(session.teams, session.edition).edition,
    "collectors",
  );
  assert.equal(newSession().edition, "standard");
});

test("old saves gain an edition without losing their current game", () => {
  for (const teams of [
    ["BLUE", "RED"],
    ["GREY", "BLUE"],
    ["A", "B", "C", "D", "E", "F"],
  ]) {
    const { edition, teamStatus, finalRound, ...legacy } = {
      ...newSession(teams),
      version: 1,
      step: 6,
      teamIndex: 1,
      turn: 12,
      suddenDeath: true,
    };
    const restored = parseSession(JSON.stringify(legacy));
    assert.equal(
      restored.edition,
      teams.length > 4 || teams.includes("GREY") ? "collectors" : "standard",
    );
    assert.equal(restored.version, 2);
    assert.deepEqual(restored.teamStatus, Object.fromEntries(teams.map((t) => [t, { remaining: 4, damaged: 0 }])));
    assert.equal(restored.finalRound, null);
    const { edition: _e, teamStatus: _s, finalRound: _f, version: _v, ...restoredGame } = restored;
    const { version: _legacyVersion, ...legacyGame } = legacy;
    assert.deepEqual(restoredGame, legacyGame);
  }
});

test("worm counts are strict and damaged worms cannot exceed remaining worms", () => {
  const game = newSession();
  for (const teamStatus of [
    { ...game.teamStatus, BLUE: { remaining: 3.5, damaged: 0 } },
    { ...game.teamStatus, BLUE: { remaining: 3, damaged: 4 } },
    { ...game.teamStatus, BLUE: { remaining: -1, damaged: 0 } },
    { ...game.teamStatus, BLUE: { remaining: 5, damaged: 0 } },
  ]) assert.throws(() => parseSession(JSON.stringify({ ...game, teamStatus })));
});

test("elimination starts a final round after the current turn and includes that player", () => {
  let game = { ...newSession(["A", "B", "C"]), teamIndex: 1, step: 7 };
  game = updateTeamStatus(game, "A", { remaining: 0, damaged: 0 });
  assert.deepEqual(game.finalRound.remainingTeams, ["C", "B"]);
  game = nextStep(game);
  assert.equal(game.teamIndex, 2);
  assert.deepEqual(game.finalRound.remainingTeams, ["B"]);
  for (let i = 0; i < 8; i++) game = nextStep(game);
  assert.equal(game.teams[game.teamIndex], "B");
  assert.deepEqual(game.finalRound.remainingTeams, []);
  for (let i = 0; i < 8; i++) game = nextStep(game);
  assert.equal(game.finalRound.ended, true);
});

test("normal and final-round rotation skips eliminated teams", () => {
  let game = updateTeamStatus(newSession(["A", "B", "C", "D"]), "C", { remaining: 0, damaged: 0 });
  game = { ...game, finalRound: null, step: 7 };
  assert.equal(nextStep(game).teams[nextStep(game).teamIndex], "B");
  game = { ...game, teamIndex: 1 };
  assert.equal(nextStep(game).teams[nextStep(game).teamIndex], "D");
});

test("winner uses remaining worms, then undamaged worms, and preserves draws", () => {
  const ended = (statuses) => ({ ...newSession(Object.keys(statuses)), teamStatus: statuses, finalRound: { remainingTeams: [], activeTeam: null, ended: true } });
  assert.equal(calculateWinner(ended({ A: { remaining: 2, damaged: 2 }, B: { remaining: 1, damaged: 0 } })).winner, "A");
  assert.equal(calculateWinner(ended({ A: { remaining: 2, damaged: 1 }, B: { remaining: 2, damaged: 2 } })).winner, "A");
  const draw = calculateWinner(ended({ A: { remaining: 2, damaged: 1 }, B: { remaining: 2, damaged: 1 } }));
  assert.equal(draw.draw, true);
  assert.deepEqual(draw.teams, ["A", "B"]);
});

test("elimination and final-round state survive persistence", () => {
  let game = updateTeamStatus(newSession(["A", "B"]), "B", { remaining: 0, damaged: 0 });
  game = { ...game, step: 7 };
  game = nextStep(game);
  assert.deepEqual(parseSession(JSON.stringify(game)), game);
});

test("edition validation rejects unknown editions and oversized Standard games", () => {
  for (const edition of ["deluxe", "toString", null, 1])
    assert.throws(() =>
      parseSession(JSON.stringify({ ...newSession(), edition })),
    );
  assert.throws(() => newSession(["A", "B", "C", "D", "E"], "standard"));
  assert.doesNotThrow(() =>
    newSession(["A", "B", "C", "D", "E", "F"], "collectors"),
  );
});
