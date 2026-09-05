You are taking over development of a new Expo / React Native app in this repository:

`fireinnti/Worms-board-game-unofficial-companion-app`

The app is an unofficial companion app for **Worms: The Board Game**.

## Primary goal

Build a lightweight companion that helps players answer rules questions and move through turns without replacing the physical board game.

The app should reduce rulebook lookup friction, especially for situations where several effects interact.

The physical board, cards, worms, mines, crates, fire, oil drums, etc. remain the source of truth. Do not turn this into a full digital recreation of the game.

## Rulebook source

Use the attached **Worms: The Board Game digital rulebook PDF** as the authoritative rules source.

Important requirements:

- Do not invent rules.
- If the rulebook does not establish an answer, clearly say so.
- Card text overrides the general rulebook where they conflict.
- When multiple effects trigger at the same time, the active player may choose their resolution order unless another rule/card says otherwise.
- Answers from the AI rules assistant should cite the relevant rulebook page/section whenever possible.
- The AI should distinguish between:
  1. explicit rulebook text
  2. reasonable interpretation
  3. situations not clearly specified by the rulebook

If the PDF is not actually available in your environment, stop before implementing rule-derived content and tell me that the file is missing.

If useful, extract the PDF into structured Markdown or JSON under something like:

`src/data/rules/`

Suggested sections:

- setup
- first player
- turn order
- movement
- inching
- jumping
- weapons
- action line
- accuracy
- blast
- direct targeting
- scatter
- knockback
- damage
- fire
- mines
- supply crates
- oil drums
- water
- full hexes
- drop cards
- sudden death
- elimination
- winning
- keywords

Preserve page numbers/source references in the extracted structure.

## Important game rules already identified

The normal turn sequence is:

1. Activate a worm
2. Heal worm if damaged
3. Inch or Jump
4. Inch or Jump again
5. Play a Weapon Card
6. End turn
7. Draw a Drop Card
8. Pass the Target Token

Movement:

- Inch = move to an adjacent Land hex.
- Jump = choose a hex within two hexes, ignore intervening hexes, move there, then Scatter.
- A player can choose not to move.
- The two movement steps can be Inch/Inch, Inch/Jump, Jump/Inch, Jump/Jump, or skipped.

Triggered effects include things such as:

- Mines
- Fire
- Supply Crates
- full-hex overflow
- Scatter
- Knockback
- Water
- explosions / Blast

These interactions are a major reason the companion app exists.

Weapon Cards resolve their Action Line from left to right.

Card text can instruct:

- movement
- playing another Weapon Card
- resolving weapon text
- repeated resolution

Use the PDF to verify all of this before encoding it.

## V1 navigation

Use a simple bottom tab layout:

### 1. Play

Purpose: lightweight turn assistant.

Show:

- current player/team
- turn sequence
- current turn step
- next/back controls
- optional worms remaining per team
- eliminated teams
- whether Sudden Death is active

Do NOT initially track:

- every worm's hex
- full map state
- every crater
- every mine
- every card in hand
- every token/object location

Keep bookkeeping minimal.

The Play screen should make it obvious what the player should do next.

Example:

BLUE'S TURN

1. Activate a Worm
2. Heal if Damaged
3. Inch / Jump
4. Inch / Jump again
5. Play Weapon
6. End-turn effects
7. Draw Drop Card
8. Pass Target Token

Tapping a step should show a concise explanation of that rule.

Include a prominent button such as:

"What happens now?"

That launches the rules assistant with current context, such as:

- current player
- current turn step
- Sudden Death state

## 2. Ask

This is the AI rules referee.

Users should be able to ask scenario questions such as:

- Can I Jump twice?
- Can I choose not to move?
- Does a Jump ignore Water between the start and destination?
- What happens if Scatter puts me into Water?
- I entered a hex with a Mine and Supply Crate. Which resolves first?
- Mine and Fire triggered together. Which happens first?
- Does card text override the rulebook?
- When does Sudden Death begin?
- Can I activate the same worm every turn?
- My Bazooka scattered onto a hex with two worms and an Oil Drum. What happens?

The model should answer in a compact structured format:

Ruling

Short direct answer.

Resolution

Ordered steps.

Rulebook

Relevant section/page.

Confidence

- Explicitly covered
- Interpretation
- Not specified

Do not allow the model to confidently fabricate house rules.

## AI architecture

Do not send the entire rulebook blindly with every request if avoidable.

Create a small retrieval layer.

Possible flow:

User question
→ retrieve 3–5 relevant rule sections
→ send only those sections plus system rules to the model
→ return answer with citations

For V1, a lightweight local keyword/semantic retrieval system is acceptable.

Do not overengineer vector infrastructure unless needed.

Keep the AI provider abstraction simple so it can initially use OpenAI.

Do not put API keys directly in the client app.

Design an appropriate backend/serverless boundary for API calls.

## 3. Rules

Create a fast searchable rules reference.

Important entries include:

- Accuracy
- Blast
- Damage
- Direct
- Fire
- Inch
- Jump
- Knockback
- Mine
- Scatter
- Supply Crate
- Water
- Wind
- Sudden Death

Each rule entry should include:

- short summary
- detailed explanation
- related rules
- page/source reference

Allow cross-linking.

Example:

Bazooka uses Accuracy → Blast.

Both Accuracy and Blast should be tappable rule references.

## 4. Weapons

Create a searchable Weapon library.

Do not fabricate weapon-card data that is not in the rulebook/PDF.

If the rulebook does not contain all Weapon Cards, create the data model and UI shell first.

Suggested fields:

```ts
type Weapon = {
  id: string;
  name: string;
  starter?: boolean;
  superWeapon?: boolean;
  actionLine: WeaponAction[];
  description?: string;
  targetType?: string;
  rulesReferences?: RuleReference[];
};
```

Allow a future version to support card scanning/photo recognition.

## Resolve This feature

Consider a guided interaction mode for common situations.

Possible categories:

- Weapon
- Jump
- Mine
- Fire
- Explosion
- Scatter
- Crate

Example Mine flow:

Mine triggered
→ destroy Mine
→ flip Danger Flipper
→ Safe / Explosion
→ continue appropriate resolution

Example Weapon flow:

Select weapon
→ target
→ Accuracy
→ Scatter/result
→ Blast
→ Knockback
→ secondary effects

Implement this only if it stays simple enough for V1.

## Technical stack

Use:

- Expo
- React Native
- TypeScript
- current stable Expo Router unless there is a strong reason not to
- current supported React Native / Expo versions
- simple, maintainable architecture
- minimal dependencies

Prefer Expo-native APIs where possible.

Use a clean structure such as:

```text
app/
  (tabs)/
    play.tsx
    ask.tsx
    rules.tsx
    weapons.tsx

src/
  components/
  data/
    rules/
    weapons/
  features/
    game/
    rules/
    ai/
  hooks/
  services/
  types/
```

Adjust if a better architecture emerges.

## UI direction

The app should feel inspired by Worms without directly copying proprietary game artwork.

Tone:

- playful
- slightly chaotic
- readable
- fast to use at the table

Avoid an overly corporate design.

Use large tap targets because players may be using the app quickly during a game.

Dark mode support is desirable.

Do not depend on copyrighted game assets unless they are explicitly provided and allowed for this private project.

Use placeholders or original visual treatments where needed.

## Initial milestone

Build a functional first-pass app that includes:

1. Expo project setup
2. bottom-tab navigation
3. Play screen with turn-step state
4. Rules screen with searchable structured rules
5. Ask screen UI
6. initial AI/rules retrieval architecture
7. Weapons screen and data model
8. rulebook extraction/source structure
9. README documenting architecture and setup

Do not attempt every possible feature at once.

## Git workflow

Work on a feature branch rather than directly on the default branch.

Suggested branch:

`feature/initial-companion-app`

Make coherent commits.

When the first usable milestone is ready:

- run TypeScript checks
- run lint
- run tests if present
- inspect for obvious Expo/runtime issues
- open a PR summarizing:
  - what was built
  - architecture decisions
  - what's incomplete
  - next recommended steps

## EAS / cloud development goal

This project should eventually support development while my local computer is off.

Prepare it so GitHub can be connected to Expo/EAS.

Eventually we want:

GitHub push / PR
→ validation
→ EAS preview build or EAS Update
→ test on phone

Do not add secret values to the repository.

Create sensible configuration files for future:

- `eas.json`
- EAS Workflows if appropriate
- preview / production profiles

If EAS project linking requires interactive Expo account authentication or credentials that are unavailable, prepare the configuration but do not invent IDs or credentials.

## Future ideas — do not prioritize yet

Potential later features:

- camera recognition of Weapon Cards
- camera/photo interpretation of current board situation
- voice questions
- spoken rules answers
- shared multiplayer game state
- custom house rules
- saved game history
- scanned card database
- AI "What happens?" using an image of the board

These should not distract from V1.

## Product philosophy

The app should solve:

"I don't want to dig through the rulebook in the middle of a turn."

It should NOT create:

"Now I have to maintain a second digital version of the whole board."

Optimize for low input cost and fast answers.

Before making large architectural decisions, inspect the current repository and preserve anything useful already present.

Start by:

1. inspecting the repo
2. confirming the rulebook PDF is actually available
3. proposing a short implementation plan
4. then begin implementing the initial milestone