# Worms Companion

Unofficial Expo / React Native companion for Worms: The Board Game.

## Run

```sh
npm ci
npm start
npm run web
npm test
```

Uses Expo SDK 57 with React Native 0.86 and React 19.2. `npm run android` and
`npm run ios` build native development apps with the installed toolchains.
Install a new native build after this SDK upgrade; existing SDK 51 APKs cannot
receive it as an OTA update. AsyncStorage remains responsible for saved sessions.

## Features

Android delivery on pushes to `main`: [build-or-update setup and remote status](docs/android-delivery.md).

- Choose **Standard Edition** (2–4 players) or **Collector’s Edition** (2–6 players) under **Teams / new game**. Collector’s adds Purple and Grey as default extra teams. Names and clockwise turn order remain editable.
- Select the Target Token holder; use Back / Next and End turn to cycle teams.
- Session restoration across tabs and restarts, including turn step and Sudden Death.
- Manual Sudden Death switch and damaged-worm shortcut to End-turn effects.
- Offline common-question answers, contextual step help and searchable rule summaries with linked in-app references.

**Apply teams** saves the edition and preserves the step and Sudden Death state. Switching a six-player setup to Standard requires choosing at most four players before applying; Cancel preserves the existing game. **Start new game** resets both and the turn counter. Team buttons correct the current token holder without resetting the current step. Rule references open the app's summaries and printed page references, not an embedded PDF viewer.

## Structure

- `App.js`: screens and shared navigation/query state.
- `src/features/game/session.js`: turn model, validation and ordered persistence writer.
- `src/features/game/useSession.js`: restore/save lifecycle with visible storage failure handling.
- `src/data/rules/index.js`: source-checked paraphrases, retrieval and conservative common-question answers.
- `docs/rules-audit.md`: PDF identity, verification findings and source limitations.
- `tests/core.test.mjs`: team rotation, persistence, invalid saves and answer regressions.

The reference is local and works offline. It does not call an AI provider. Unknown scenarios receive related references without an asserted ruling. The supplied Extra Rules sheet is included for 5–6 player setup and additional Weapon Cards. Optional variants are not automated; consult the relevant rules and cards. Team elimination and the final round are currently managed at the table. The chosen edition is saved with the session and displayed on Play. Older saves with more than four teams or Purple/Grey are restored as Collector’s; other older saves default to Standard.
