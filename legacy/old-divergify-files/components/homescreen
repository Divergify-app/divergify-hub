import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import FocusTimer from "./FocusTimer";
import taskProtocols from "../data/taskProtocols";
import { useBehaviorProtocol } from "../hooks/useBehaviorProtocol";

export default function HomeScreen() {
  const [currentProtocol, setCurrentProtocol] = useState(null);
  const [sessionDone, setSessionDone] = useState(false);
  const persona = {
    name: "TAKOTA",
    startMessage: "Alright, chaos brain—time to anchor in.",
    endMessage: "Baseline obliterated. You just rewired something.",
    pauseMessage: "Pause acknowledged. Don’t drift too long.",
    nudge: "Momentum, not perfection.",
    lowStim: false,
  };

  const tone = {
    intro: "Initiating task sequence:",
    complete: "Protocol complete. Reinforcement delivered.",
  };

  const { startProtocol, nextStep, step, active } = useBehaviorProtocol(
    persona,
    tone,
    () => setSessionDone(true)
  );

  return (
    <LinearGradient
      colors={persona.lowStim ? ["#E0E0E0", "#FAFAFA"] : ["#A3E635", "#3B82F6", "#EC4899"]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>Your Divergify Hub</Text>

        {!currentProtocol && !active && !sessionDone && (
          <>
            <Text style={styles.subtitle}>
              Choose a protocol. We’ll guide you through the microsteps.
            </Text>
            {taskProtocols.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={styles.taskCard}
                onPress={() => {
                  setCurrentProtocol(p);
                  startProtocol(p);
                }}
              >
                <Text style={styles.taskTitle}>{p.title}</Text>
                <Text style={styles.taskHint}>{p.type}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.focusLaunch}
              onPress={() => setCurrentProtocol({ id: "focus_timer" })}
            >
              <Text style={styles.focusText}>Launch Focus Session</Text>
            </TouchableOpacity>
          </>
        )}

        {currentProtocol && currentProtocol.id === "focus_timer" && (
          <FocusTimer
            persona={persona}
            onFinish={() => {
              setCurrentProtocol(null);
              setSessionDone(true);
            }}
          />
        )}

        {active && currentProtocol && (
          <View style={styles.protocolBox}>
            <Text style={styles.stepText}>
              {currentProtocol.steps ? currentProtocol.steps[step] : ""}
            </Text>
            <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
              <Text style={styles.nextText}>Next</Text>
            </TouchableOpacity>
          </View>
        )}

        {sessionDone && (
          <View style={styles.doneBox}>
            <Text style={styles.doneText}>Session complete.</Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setCurrentProtocol(null);
                setSessionDone(false);
              }}
            >
              <Text style={styles.resetText}>Back to Hub</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, alignItems: "center" },
  header: {
    fontSize: 26,
    color: "white",
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 40,
  },
  subtitle: {
    color: "white",
    textAlign: "center",
    marginBottom: 20,
    fontSize: 16,
  },
  taskCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 15,
    borderRadius: 10,
    marginVertical: 6,
    width: "90%",
  },
  taskTitle: { color: "white", fontWeight: "bold", fontSize: 18 },
  taskHint: { color: "#fafafa", fontSize: 12 },
  focusLaunch: {
    marginTop: 25,
    backgroundColor: "#10B981",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  focusText: { color: "white", fontWeight: "bold", fontSize: 18 },
  protocolBox: { alignItems: "center", marginTop: 40 },
  stepText: {
    color: "white",
    fontSize: 20,
    textAlign: "center",
    marginBottom: 20,
  },
  nextButton: {
    backgroundColor: "#F59E0B",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  nextText: { color: "white", fontWeight: "bold", fontSize: 16 },
  doneBox: { alignItems: "center", marginTop: 40 },
  doneText: { color: "white", fontSize: 20, marginBottom: 10 },
  resetButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  resetText: { color: "white", fontWeight: "600" },
});

