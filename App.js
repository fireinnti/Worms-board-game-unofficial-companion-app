import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
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
} from "./src/features/game/session";
import { useSession } from "./src/features/game/useSession";

const COLORS = {
  bg: "#101411",
  panel: "#182019",
  panel2: "#202b22",
  text: "#f2f2e8",
  muted: "#9ca89b",
  green: "#b8e34b",
  orange: "#ffad4d",
  line: "#334034",
};
const TEAM_COLORS = {
  BLUE: "#79b7ff",
  RED: "#ff8585",
  YELLOW: "#f6df65",
  GREEN: "#8adb83",
  PURPLE: "#c49aff",
  GREY: "#b8bec5",
};

function Pill({ children, tone = "green" }) {
  return (
    <View style={[styles.pill, tone === "orange" && styles.orangePill]}>
      <Text style={styles.pillText}>{children}</Text>
    </View>
  );
}

function Button({
  children,
  onPress,
  disabled = false,
  primary = false,
  label,
  selected,
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{
        disabled,
        ...(selected === undefined ? {} : { selected }),
      }}
      disabled={disabled}
      onPress={onPress}
      style={[
        primary ? styles.askButton : styles.secondaryButton,
        disabled && styles.disabled,
        selected && styles.activeTeam,
      ]}
    >
      <Text style={primary ? styles.askButtonText : styles.buttonText}>
        {children}
      </Text>
    </Pressable>
  );
}

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
      <Text style={styles.source}>{ruleSource(rule)}</Text>
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
          onSave({ ...session, edition, teams: names, teamIndex: first })
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
      <Text style={styles.hero}>{team}'S TURN</Text>
      <Text style={styles.subtle}>
        {EDITIONS[session.edition].label} · {teams.length} players
      </Text>
      <Text style={styles.subtle}>
        Keep the board and cards as your source of truth.
      </Text>
      <View style={styles.teamRow}>
        <Text style={styles.label}>CURRENT TEAM · CLOCKWISE ORDER</Text>
        <View style={styles.teamButtons}>
          {teams.map((name, index) => (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: index === teamIndex }}
              key={name}
              onPress={() => setSession((s) => ({ ...s, teamIndex: index }))}
              style={[
                styles.teamButton,
                index === teamIndex && styles.activeTeam,
              ]}
            >
              <Text
                style={[
                  styles.teamText,
                  { color: TEAM_COLORS[name] || COLORS.text },
                ]}
              >
                {name}
              </Text>
            </Pressable>
          ))}
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
      <View style={styles.card}>
        <Text style={styles.cardLabel}>
          STEP {step + 1} OF {STEPS.length}
        </Text>
        <View style={styles.progress}>
          <View
            style={[
              styles.progressFill,
              { width: `${((step + 1) / STEPS.length) * 100}%` },
            ]}
          />
        </View>
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
          <Button primary onPress={() => setSession(nextStep)}>
            {step === STEPS.length - 1 ? "End turn →" : "Next →"}
          </Button>
        </View>
        {step === 7 && (
          <Text style={styles.subtle}>
            Next: {teams[(teamIndex + 1) % teams.length]}
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
      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>
          SUDDEN DEATH {suddenDeath ? "ON" : "OFF"}
        </Text>
        <Switch
          accessibilityLabel="Sudden Death"
          value={suddenDeath}
          onValueChange={(value) =>
            setSession((s) => ({ ...s, suddenDeath: value }))
          }
          trackColor={{ true: COLORS.green }}
        />
      </View>
      <Text style={styles.subtle}>
        Turn this on when you reveal and resolve the Sudden Death Card.
      </Text>
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
        placeholderTextColor="#718071"
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
            placeholderTextColor="#718071"
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
              style={styles.tab}
            >
              <Text style={[styles.tabIcon, tab === name && styles.activeTab]}>
                {name === "Play" ? "◉" : name === "Ask" ? "?" : "☷"}
              </Text>
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
const styles = StyleSheet.create({
  buttonText: { color: "#c8d0c5", fontSize: 14 },
  secondaryButton: {
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 8,
  },
  disabled: { opacity: 0.4 },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  setupRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  teamInput: {
    flex: 1,
    minWidth: 50,
    minHeight: 48,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  error: { color: COLORS.orange, fontSize: 13, lineHeight: 18 },
  notice: { padding: 12 },
  safe: { flex: 1, backgroundColor: COLORS.bg },
  app: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 22, paddingBottom: 110 },
  topbar: {
    height: 62,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  brand: {
    color: COLORS.text,
    fontWeight: "900",
    letterSpacing: 1.8,
    fontSize: 16,
  },
  brandAccent: { color: COLORS.green },
  dot: { color: COLORS.green, fontSize: 14 },
  eyebrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  eyebrowText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  pill: {
    backgroundColor: "#30441f",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
  },
  orangePill: { backgroundColor: "#4a3219" },
  pillText: {
    color: COLORS.green,
    fontWeight: "800",
    fontSize: 10,
    letterSpacing: 0.7,
  },
  hero: {
    color: COLORS.text,
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: -1.2,
  },
  title: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -1,
  },
  subtle: { color: COLORS.muted, fontSize: 14, lineHeight: 21, marginTop: 7 },
  teamRow: { marginTop: 26 },
  label: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  teamButtons: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 9 },
  teamButton: {
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  activeTeam: { borderColor: COLORS.green, backgroundColor: "#2e3d20" },
  teamText: { color: COLORS.muted, fontWeight: "800", fontSize: 12 },
  activeTeamText: { color: COLORS.green },
  card: {
    backgroundColor: COLORS.panel,
    borderRadius: 16,
    padding: 19,
    marginTop: 18,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  progressRow: { flexDirection: "row", justifyContent: "space-between" },
  cardLabel: {
    color: COLORS.green,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  progress: {
    height: 5,
    backgroundColor: "#344034",
    borderRadius: 5,
    marginTop: 10,
  },
  progressFill: { height: 5, backgroundColor: COLORS.green, borderRadius: 5 },
  stepTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "900",
    marginTop: 20,
  },
  stepBody: { color: "#c3cbbf", fontSize: 14, lineHeight: 21, marginTop: 7 },
  source: { color: COLORS.muted, fontSize: 11, marginTop: 12 },
  sectionTitle: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginTop: 28,
    marginBottom: 10,
  },
  stepRow: {
    minHeight: 49,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#263027",
    paddingHorizontal: 7,
  },
  selectedStep: {
    backgroundColor: COLORS.panel2,
    borderRadius: 8,
    borderBottomColor: COLORS.green,
  },
  stepNumber: {
    width: 27,
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  selectedNumber: { color: COLORS.green },
  stepText: { color: "#bbc4b9", fontSize: 14, flex: 1 },
  selectedText: { color: COLORS.text, fontWeight: "800" },
  chevron: { color: COLORS.green, fontSize: 22 },
  askButton: {
    backgroundColor: COLORS.green,
    minHeight: 54,
    borderRadius: 10,
    marginTop: 22,
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  askButtonText: { color: "#15200f", fontSize: 15, fontWeight: "900" },
  askArrow: { color: "#15200f", fontSize: 22 },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 24,
  },
  statusLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  input: {
    minHeight: 105,
    marginTop: 22,
    backgroundColor: COLORS.panel,
    borderColor: COLORS.line,
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    color: COLORS.text,
    fontSize: 15,
    textAlignVertical: "top",
  },
  answer: {
    backgroundColor: COLORS.panel,
    borderRadius: 14,
    padding: 18,
    marginTop: 20,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.green,
  },
  answerHeading: {
    color: COLORS.green,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.3,
    marginTop: 8,
  },
  answerTitle: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 23,
    marginTop: 7,
  },
  resolution: { color: "#d0d7cd", fontSize: 14, lineHeight: 22, marginTop: 6 },
  answerMeta: { marginTop: 17, gap: 5 },
  suggestion: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#263027",
  },
  suggestionText: { flex: 1, color: "#c8d0c5", fontSize: 14 },
  search: {
    marginTop: 22,
    backgroundColor: COLORS.panel,
    borderColor: COLORS.line,
    borderWidth: 1,
    borderRadius: 10,
    padding: 13,
    color: COLORS.text,
    fontSize: 14,
  },
  ruleRow: {
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderBottomColor: "#263027",
  },
  ruleName: { color: COLORS.green, fontSize: 18, fontWeight: "900" },
  ruleBody: { color: "#d0d7cd", fontSize: 14, lineHeight: 21, marginTop: 6 },
  tabs: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 79,
    backgroundColor: "#151c16",
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 12,
  },
  tab: { alignItems: "center", width: "33%" },
  tabIcon: { color: COLORS.muted, fontSize: 20, lineHeight: 23 },
  tabText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 3,
  },
  activeTab: { color: COLORS.green },
});
