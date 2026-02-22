import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Persona {
  id: 'takoda' | 'coach' | 'avery' | 'maya' | 'mox';
  name: string;
  color: string;
  tagline: string;
}

interface Task {
  id: number;
  text: string;
  done: boolean;
}

const personas: Persona[] = [
  { id: 'takoda', name: 'TAKOTA', color: '#FF6B35', tagline: 'Blunt truth, zero BS' },
  { id: 'coach', name: 'Coach', color: '#4ECDC4', tagline: 'One more rep' },
  { id: 'avery', name: 'Avery', color: '#95E1D3', tagline: 'Plan first, execute smart' },
  { id: 'maya', name: 'Maya', color: '#C7CEEA', tagline: 'Breathe, you got this' },
  { id: 'mox', name: 'Mox', color: '#FECA57', tagline: 'Chaos mode activated' },
];

const rewards: Record<Persona['id'], string[]> = {
  takoda: [
    "You actually did it. Proud of you.",
    "Damn. Didn't think you had it in you.",
    "Solid work. Keep going.",
  ],
  coach: [
    "THAT'S WHAT I'M TALKING ABOUT!",
    "One more down. Next rep.",
    "You're stronger than yesterday.",
  ],
  avery: [
    'Task completed. Updating strategy.',
    'Excellent execution. Next phase ready.',
    'Progress logged. Well done.',
  ],
  maya: [
    "You're doing amazing, friend.",
    'Take a moment. Feel that win.',
    "Proud of you. Rest if you need.",
  ],
  mox: [
    'YEET! Another one destroyed!',
    'Chaos wins again, baby!',
    "Task? DEMOLISHED. What's next?",
  ],
};

export default function App() {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showReward, setShowReward] = useState<string | null>(null);

  const addTask = () => {
    setTasks((prev) => [...prev, { id: Date.now(), text: 'New Task', done: false }]);
  };

  const toggleTask = (id: number) => {
    setTasks((prevTasks) => {
      const task = prevTasks.find((t) => t.id === id);

      if (task && !task.done && selectedPersona) {
        const personaRewards = rewards[selectedPersona.id];
        const randomReward = personaRewards[Math.floor(Math.random() * personaRewards.length)];
        setShowReward(randomReward);
        setTimeout(() => setShowReward(null), 3000);
      }

      return prevTasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    });
  };

  if (!selectedPersona) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.title}>DIVERGIFY</Text>
        <Text style={styles.subtitle}>Pick your chaos guide:</Text>
        <ScrollView style={styles.personaList}>
          {personas.map((persona) => (
            <TouchableOpacity
              key={persona.id}
              style={[styles.personaCard, { borderLeftColor: persona.color }]}
              onPress={() => setSelectedPersona(persona)}
            >
              <Text style={styles.personaName}>{persona.name}</Text>
              <Text style={styles.personaTagline}>{persona.tagline}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.header, { backgroundColor: selectedPersona.color }]}>
        <Text style={styles.headerText}>{selectedPersona.name}</Text>
        <TouchableOpacity onPress={() => setSelectedPersona(null)}>
          <Text style={styles.changeButton}>Change</Text>
        </TouchableOpacity>
      </View>

      {showReward && (
        <View style={[styles.reward, { backgroundColor: selectedPersona.color }]}>
          <Text style={styles.rewardText}>{showReward}</Text>
        </View>
      )}

      <ScrollView style={styles.taskList}>
        {tasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            style={[styles.task, task.done && styles.taskDone]}
            onPress={() => toggleTask(task.id)}
          >
            <Text style={[styles.taskText, task.done && styles.taskTextDone]}>
              {task.done ? '✓ ' : '○ '}
              {task.text}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: selectedPersona.color }]}
        onPress={addTask}
      >
        <Text style={styles.addButtonText}>+ Add Task</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 50,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4A90E2',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  personaList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  personaCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    marginBottom: 15,
    borderRadius: 10,
    borderLeftWidth: 5,
  },
  personaName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  personaTagline: {
    fontSize: 14,
    color: '#aaa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  changeButton: {
    fontSize: 16,
    color: '#fff',
    textDecorationLine: 'underline',
  },
  reward: {
    padding: 20,
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  rewardText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  taskList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  task: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  taskDone: {
    backgroundColor: '#0a3a0a',
  },
  taskText: {
    fontSize: 16,
    color: '#fff',
  },
  taskTextDone: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  addButton: {
    margin: 20,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
