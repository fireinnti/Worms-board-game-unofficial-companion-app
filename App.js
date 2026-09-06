import React, { useMemo, useState } from "react";
import { useFonts } from "expo-font";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Switch,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  RULE_SECTIONS,
  answerQuestion,
  rulesByIds,
  ruleSource,
} from "./src/data/rules";
import {
  STEPS,
  EDITIONS,
  newSession,
  nextStep,
  updateTeamStatus,
  reconcileTeams,
  calculateWinner,
} from "./src/features/game/session";
import { useSession } from "./src/features/game/useSession";
import { colors, styles, teamColors } from "./src/ui/theme";
import { Button, Pill, StepMarkers, TabIcon, TeamToken } from "./src/ui/components";

function RuleReferences({ references, onRule }) {
  return references.map((rule) => (
    <Pressable
      accessibilityRole="button"
      key={rule.id}
      onPress={() => onRule(rule.id)}
      style={styles.ruleRow}
    >
      <Text style={styles.ruleName}>{rule.title} →</Text>
      <Text style={styles.ruleBody}>{rule.text}</Text>
      <View style={styles.sourceBadge}><Text style={styles.source}>{ruleSource(rule)}</Text></View>
    </Pressable>
  ));
}

function TeamSetup({ session, onSave, onCancel }) {
  const [teams, setTeams] = useState(session.teams);
  const [first, setFirst] = useState(session.teamIndex);
  const [edition, setEdition] = useState(session.edition);
  const maxPlayers = EDITIONS[edition].teams.length;
  const names = teams.map((t) => t.trim().toUpperCase());
  const validNames =
    names.every(Boolean) && new Set(names).size === names.length;
  const valid = validNames && teams.length <= maxPlayers;
  const move = (index) => {
    const reordered = [...teams];
    [reordered[index - 1], reordered[index]] = [
      reordered[index],
      reordered[index - 1],
    ];
    setTeams(reordered);
    setFirst(first === index ? index - 1 : first === index - 1 ? index : first);
  };
  return (
    <View style={styles.card}>
      <Text style={styles.stepTitle}>Game setup</Text>
      <Text style={styles.sectionTitle}>EDITION</Text>
      <View style={styles.teamButtons}>
        {Object.entries(EDITIONS).map(([id, info]) => (
          <Button
            key={id}
            selected={edition === id}
            onPress={() => setEdition(id)}
          >
            {info.label}
          </Button>
        ))}
      </View>
      <Text style={styles.subtle}>
        {edition === "standard"
          ? "Standard Edition: 2–4 players with Blue, Red, Yellow and Green teams."
          : "Collector’s Edition: 2–6 players, adding Purple and Grey teams. Shuffle the new Weapon and Superweapon Cards into the existing deck (Extra Rules · p. 1)."}
      </Text>
      {teams.length > maxPlayers && (
        <Text style={styles.error}>
          Standard Edition supports up to four players. Choose 2–4 players below
          or remove teams before applying.
        </Text>
      )}
      <Text style={styles.sectionTitle}>TEAMS & TURN ORDER</Text>
      <Text style={styles.subtle}>
        List teams clockwise around the table, then select who holds the Target
        Token. Base-game colours are Blue, Red, Yellow and Green (pp. 6–7, 15).
      </Text>
      <Text style={styles.sectionTitle}>NUMBER OF PLAYERS</Text>
      <View style={styles.teamButtons}>
        {Array.from({ length: maxPlayers - 1 }, (_, i) => i + 2).map(
          (count) => (
            <Button
              key={count}
              label={`${count} players`}
              selected={teams.length === count}
              onPress={() => {
                const updated = teams.slice(0, count);
                const defaults = EDITIONS[edition].teams;
                while (updated.length < count) {
                  const available = defaults.find(
                    (name) =>
                      !updated.some((t) => t.trim().toUpperCase() === name),
                  );
                  updated.push(available);
                }
                setTeams(updated);
                if (first >= count) setFirst(0);
              }}
            >
              {teams.length === count ? "● " : ""}
              {count}
            </Button>
          ),
        )}
      </View>
      {teams.map((name, index) => (
        <View key={index} style={styles.setupRow}>
          <Text style={styles.label}>{index + 1}</Text>
          <TextInput
            accessibilityLabel={`Team ${index + 1} name`}
            maxLength={20}
            value={name}
            onChangeText={(value) =>
              setTeams(teams.map((t, i) => (i === index ? value : t)))
            }
            style={styles.teamInput}
          />
          <Button
            label={`Move team ${index + 1} earlier`}
            disabled={index === 0}
            onPress={() => move(index)}
          >
            ↑
          </Button>
          <Button
            label={`Remove team ${index + 1}`}
            disabled={teams.length <= 2}
            onPress={() => {
              setTeams(teams.filter((_, i) => i !== index));
              setFirst(first === index ? 0 : first > index ? first - 1 : first);
            }}
          >
            ×
          </Button>
        </View>
      ))}
      <Button
        disabled={teams.length >= maxPlayers}
        onPress={() => {
          const available = EDITIONS[edition].teams.find(
            (t) => !names.includes(t),
          );
          setTeams([...teams, available || `TEAM ${teams.length + 1}`]);
        }}
      >
        Add team ({teams.length}/{maxPlayers})
      </Button>
      {edition === "collectors" && teams.length > 4 && (
        <Text style={styles.subtle}>
          For 5–6 players, include player cards 5 and 6 as needed before
          assigning Teams. Each extra player adds a Map Tile, four worms, one
          Oil Drum, one Crate and one Mine. Normal setup and starting hands
          still apply (Extra Rules · p. 1). The additional teams are Purple and
          Grey.
        </Text>
      )}
      <Text style={styles.sectionTitle}>TARGET TOKEN HOLDER</Text>
      <View style={styles.teamButtons}>
        {names.map((name, i) => (
          <Button key={i} onPress={() => setFirst(i)}>
            {first === i ? "● " : ""}
            {name || `Team ${i + 1}`}
          </Button>
        ))}
      </View>
      {!validNames && (
        <Text style={styles.error}>Give every team a different name.</Text>
      )}
      <Text style={styles.subtle}>
        Apply keeps your current step and Sudden Death setting. New game resets
        the turn and Sudden Death.
      </Text>
      <Button
        primary
        disabled={!valid}
        onPress={() =>
          onSave(reconcileTeams(session, names, first, edition))
        }
      >
        Apply teams
      </Button>
      <Button
        disabled={!valid}
        onPress={() =>
          onSave({ ...newSession(names, edition), teamIndex: first })
        }
      >
        Start new game
      </Button>
      <Button onPress={onCancel}>Cancel</Button>
    </View>
  );
}

function PlayScreen({ session, setSession, onAsk, onRule }) {
  const [setup, setSetup] = useState(false);
  const { step, teams, teamIndex, suddenDeath } = session;
  const team = teams[teamIndex];
  const current = STEPS[step];
  const result = calculateWinner(session);
  const nextTeam = session.finalRound
    ? session.finalRound.remainingTeams.find((t) => session.teamStatus[t].remaining > 0)
    : Array.from({ length: teams.length - 1 }, (_, i) => teams[(teamIndex + i + 1) % teams.length]).find((t) => session.teamStatus[t].remaining > 0);
  const guidance =
    step === 6 && suddenDeath
      ? "Resolve the Drop portion of the face-up Sudden Death Card instead of drawing a card."
      : current.text;
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.eyebrow}>
        <Text style={styles.eyebrowText}>TURN ASSISTANT</Text>
        <Pill>TURN {session.turn}</Pill>
      </View>
      <View style={[styles.heroBanner, { backgroundColor: teamColors[team] || colors.grassGreen, borderLeftColor: colors.ink }]}><Text style={styles.hero}>{team}'S TURN</Text></View>
      {session.finalRound && !session.finalRound.ended && (
        <View style={styles.finalBanner}>
          <Text style={styles.finalTitle}>FINAL ROUND</Text>
          <Text style={styles.finalText}>
            {session.finalRound.remainingTeams.length + (session.finalRound.activeTeam ? 1 : 0)} final {session.finalRound.remainingTeams.length + (session.finalRound.activeTeam ? 1 : 0) === 1 ? "turn" : "turns"} remaining
          </Text>
        </View>
      )}
      {result && (
        <View style={styles.finalBanner}>
          <Text style={styles.finalTitle}>GAME OVER</Text>
          <Text style={styles.finalText}>
            {result.draw ? `Draw: ${result.teams.join(" & ")}` : `${result.winner} wins`} · {result.remaining} worms · {result.undamaged} undamaged
          </Text>
        </View>
      )}
      <Text style={styles.subtle}>
        {EDITIONS[session.edition].label} · {teams.length} players
      </Text>
      <Text style={styles.subtle}>
        Keep the board and cards as your source of truth.
      </Text>
      <View style={styles.teamRow}>
        <Text style={styles.label}>CURRENT TEAM · CLOCKWISE ORDER</Text>
        <View style={styles.teamButtons}>
          {teams.map((name, index) => {
            const status = session.teamStatus[name];
            const eliminated = status.remaining === 0;
            const change = (field, delta) => setSession((s) => {
              const old = s.teamStatus[name];
              return updateTeamStatus(s, name, { [field]: old[field] + delta });
            });
            return <View key={name} style={[styles.teamStatus, eliminated && styles.eliminated]}>
            <TeamToken
              name={name}
              selected={index === teamIndex}
              disabled={eliminated}
              onPress={() => setSession((s) => ({ ...s, teamIndex: index }))}
            />
            <Text style={styles.counterLabel}>{eliminated ? "ELIMINATED" : "REMAINING"}</Text>
            <View style={styles.counterRow}>
              <Button label={`Remove one remaining ${name} worm`} disabled={status.remaining <= status.damaged} onPress={() => change("remaining", -1)}>−</Button>
              <Text style={styles.counterValue}>{status.remaining}</Text>
              <Button label={`Add one remaining ${name} worm`} disabled={status.remaining >= 4} onPress={() => change("remaining", 1)}>+</Button>
            </View>
            <Text style={styles.counterLabel}>DAMAGED</Text>
            <View style={styles.counterRow}>
              <Button label={`Remove one damaged ${name} worm`} disabled={status.damaged === 0} onPress={() => change("damaged", -1)}>−</Button>
              <Text style={styles.counterValue}>{status.damaged}</Text>
              <Button label={`Add one damaged ${name} worm`} disabled={status.damaged >= status.remaining} onPress={() => change("damaged", 1)}>+</Button>
            </View>
            </View>;
          })}
        </View>
      </View>
      <Button onPress={() => setSetup(!setup)}>Teams / new game</Button>
      {setup && (
        <TeamSetup
          session={session}
          onSave={(s) => {
            setSession(s);
            setSetup(false);
          }}
          onCancel={() => setSetup(false)}
        />
      )}
      <View style={[styles.card, step === STEPS.length - 1 && styles.finalMission]}>
        <Text style={styles.cardLabel}>
          {step === STEPS.length - 1 ? "FINAL STEP · " : ""}STEP {step + 1} OF {STEPS.length}
        </Text>
        <StepMarkers step={step} count={STEPS.length} onSelect={(index) => setSession((s) => ({ ...s, step: index }))} />
        <Text style={styles.stepTitle}>{current.title}</Text>
        <Text style={styles.stepBody}>{guidance}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => onRule(current.rules[0])}
        >
          <Text style={styles.source}>
            Read rule · p. {rulesByIds(current.rules)[0].page} →
          </Text>
        </Pressable>
        <View style={styles.controls}>
          <Button
            disabled={step === 0}
            onPress={() => setSession((s) => ({ ...s, step: s.step - 1 }))}
          >
            Back
          </Button>
          <Button primary disabled={Boolean(session.finalRound?.ended)} onPress={() => setSession(nextStep)}>
            {step === STEPS.length - 1 ? "End turn →" : "Next →"}
          </Button>
        </View>
        {step === 7 && (
          <Text style={styles.subtle}>
            Next: {nextTeam || "Game over"}
          </Text>
        )}
      </View>
      <Text style={styles.sectionTitle}>TURN SEQUENCE</Text>
      {STEPS.map(({ title }, index) => (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: step === index }}
          key={title}
          onPress={() => setSession((s) => ({ ...s, step: index }))}
          style={[styles.stepRow, step === index && styles.selectedStep]}
        >
          <Text
            style={[styles.stepNumber, step === index && styles.selectedNumber]}
          >
            {index + 1}
          </Text>
          <Text
            style={[styles.stepText, step === index && styles.selectedText]}
          >
            {title}
          </Text>
          {step === index && <Text style={styles.chevron}>›</Text>}
        </Pressable>
      ))}
      {step < 5 && (
        <View style={styles.card}>
          <Text style={styles.stepBody}>
            Active worm Damaged? Finish any Weapon Card text already being
            resolved, then go to End-turn effects (p. 17).
          </Text>
          <Button onPress={() => setSession((s) => ({ ...s, step: 5 }))}>
            Go to End-turn effects
          </Button>
        </View>
      )}
      <Button
        primary
        onPress={() =>
          onAsk({ team, step, suddenDeath, guidance, edition: session.edition })
        }
      >
        What happens now? →
      </Button>
      <View style={styles.hazard}>
        <View style={styles.statusRow}>
        <Text style={styles.hazardText}>
          SUDDEN DEATH {suddenDeath ? "ON" : "OFF"}
        </Text>
        <Switch
          accessibilityLabel="Sudden Death"
          value={suddenDeath}
          onValueChange={(value) =>
            setSession((s) => ({ ...s, suddenDeath: value }))
          }
          trackColor={{ false: colors.line, true: colors.explosionOrange }}
        />
      </View>
      <Text style={styles.subtle}>
        Final round / Sudden Death status uses hazard accents as well as this
        explicit ON/OFF label. Turn it on when the card is revealed.
      </Text>
      </View>
    </ScrollView>
  );
}

function AskScreen({
  question,
  setQuestion,
  answer,
  setAnswer,
  context,
  clearContext,
  onRule,
}) {
  const edit = (value) => {
    setQuestion(value);
    setAnswer(null);
    clearContext();
  };
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.eyebrow}>
        <Text style={styles.eyebrowText}>RULES REFERENCE</Text>
        <Pill>OFFLINE</Pill>
      </View>
      <Text style={styles.title}>Ask the rulebook</Text>
      <Text style={styles.subtle}>
        Quick answers for common questions, with related summaries for other
        scenarios.
      </Text>
      {context && (
        <View style={styles.answer}>
          <Text style={styles.answerHeading}>
            {context.team} · {STEPS[context.step].title} ·{" "}
            {EDITIONS[context.edition].label} · SUDDEN DEATH{" "}
            {context.suddenDeath ? "ON" : "OFF"}
          </Text>
          <Text style={styles.answerTitle}>{context.guidance}</Text>
          <RuleReferences
            references={rulesByIds(STEPS[context.step].rules)}
            onRule={onRule}
          />
        </View>
      )}
      <TextInput
        accessibilityLabel="Rules question"
        value={question}
        onChangeText={edit}
        placeholder="Can I Jump twice?"
        placeholderTextColor="#65705F"
        multiline
        style={styles.input}
      />
      <Button
        primary
        disabled={!question.trim()}
        onPress={() => setAnswer(answerQuestion(question))}
      >
        Find rule guidance →
      </Button>
      {answer && (
        <View style={styles.answer}>
          <Text style={styles.answerHeading}>RULING</Text>
          <Text style={styles.answerTitle}>{answer.ruling}</Text>
          <Text style={styles.answerHeading}>RESOLUTION</Text>
          {answer.resolution.map((item, i) => (
            <Text key={item} style={styles.resolution}>
              {i + 1}. {item}
            </Text>
          ))}
          <View style={styles.answerMeta}>
            <Pill tone="orange">{answer.confidence}</Pill>
          </View>
          <RuleReferences references={answer.references} onRule={onRule} />
        </View>
      )}
      <Text style={styles.sectionTitle}>TRY ASKING</Text>
      {[
        "Can I Jump twice?",
        "Does card text override the rulebook?",
        "Which effect resolves first?",
        "Can I activate the same worm every turn?",
        "Can we play with 6 players?",
      ].map((q) => (
        <Button
          key={q}
          onPress={() => {
            edit(q);
            setAnswer(answerQuestion(q));
          }}
        >
          {q}
        </Button>
      ))}
    </ScrollView>
  );
}

function RulesScreen({ query, setQuery, selected, setSelected }) {
  const filtered = useMemo(
    () =>
      RULE_SECTIONS.filter((rule) =>
        `${rule.title} ${rule.text} ${rule.tags.join(" ")}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      ),
    [query],
  );
  const detail = RULE_SECTIONS.find((r) => r.id === selected);
  return (
    <ScrollView
      key={selected || "index"}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.eyebrow}>
        <Text style={styles.eyebrowText}>QUICK REFERENCE</Text>
        <Pill>{RULE_SECTIONS.length} TERMS</Pill>
      </View>
      <Text style={styles.title}>{detail ? detail.title : "Rules index"}</Text>
      {detail ? (
        <>
          <Text style={styles.ruleBody}>{detail.text}</Text>
          <Text style={styles.source}>{ruleSource(detail)}</Text>
          <Button onPress={() => setSelected(null)}>Back to all rules</Button>
          <Text style={styles.sectionTitle}>RELATED RULES</Text>
          <RuleReferences
            references={RULE_SECTIONS.filter(
              (r) =>
                r.id !== detail.id &&
                r.tags.some((tag) => detail.tags.includes(tag)),
            ).slice(0, 4)}
            onRule={setSelected}
          />
        </>
      ) : (
        <>
          <Text style={styles.subtle}>
            Summaries checked against the supplied digital rulebook. Tap a term
            for its reference and related rules.
          </Text>
          <TextInput
            accessibilityLabel="Search rules"
            value={query}
            onChangeText={setQuery}
            placeholder="Search terms"
            placeholderTextColor="#65705F"
            style={styles.search}
          />
          {!filtered.length && (
            <Text style={styles.subtle}>
              No matching terms. Try a Thing or action, such as Fire or Jump.
            </Text>
          )}
          <RuleReferences references={filtered} onRule={setSelected} />
        </>
      )}
    </ScrollView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <CompanionApp />
    </SafeAreaProvider>
  );
}

function CompanionApp() {
  const [fontsLoaded] = useFonts({
    BattleDisplay:
      "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/bungee/Bungee-Regular.ttf",
    RulesText:
      "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/atkinsonhyperlegiblenext/AtkinsonHyperlegibleNext%5Bwght%5D.ttf",
    ...MaterialCommunityIcons.font,
  });
  const [tab, setTab] = useState("Play");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [context, setContext] = useState(null);
  const [query, setQuery] = useState("");
  const [selectedRule, setSelectedRule] = useState(null);
  const game = useSession();
  const onRule = (id) => {
    setSelectedRule(id);
    setTab("Rules");
  };
  const ask = (value) => {
    setContext(value);
    setQuestion("");
    setAnswer(null);
    setTab("Ask");
  };
  if (!fontsLoaded) return <SafeAreaView style={styles.safe}><Text style={styles.loading}>Loading field kit…</Text></SafeAreaView>;
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.app}>
        <View style={styles.topbar}>
          <Text style={styles.brand}>
            WORMS <Text style={styles.brandAccent}>COMPANION</Text>
          </Text>
          <Text style={styles.dot}>●</Text>
        </View>
        {game.storageError ? (
          <View style={styles.notice}>
            <Text style={styles.error}>{game.storageError}</Text>
            <Button onPress={game.retrySave}>Retry saving current game</Button>
          </View>
        ) : null}
        {!game.ready ? (
          <Text style={styles.subtle}>Loading saved game…</Text>
        ) : (
          <>
            {tab === "Play" && (
              <PlayScreen {...game} onAsk={ask} onRule={onRule} />
            )}
            {tab === "Ask" && (
              <AskScreen
                {...{
                  question,
                  setQuestion,
                  answer,
                  setAnswer,
                  context,
                  onRule,
                }}
                clearContext={() => setContext(null)}
              />
            )}
            {tab === "Rules" && (
              <RulesScreen
                query={query}
                setQuery={setQuery}
                selected={selectedRule}
                setSelected={setSelectedRule}
              />
            )}
          </>
        )}
        <View style={styles.tabs}>
          {["Play", "Ask", "Rules"].map((name) => (
            <Pressable
              accessibilityRole="tab"
              accessibilityLabel={name}
              accessibilityState={{ selected: tab === name }}
              key={name}
              onPress={() => setTab(name)}
              style={({ pressed, focused }) => [styles.tab, pressed && styles.tabPressed, focused && styles.buttonFocused]}
            >
              <TabIcon name={name} active={tab === name} />
              <Text style={[styles.tabText, tab === name && styles.activeTab]}>
                {name}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
