import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import SectionCard from '../components/sectioncard';
import PrimaryButton from '../components/primarybutton';
import BrandBadge from '../components/brandbadge';
import VoiceButton from '../components/voicebutton';
import useVoiceChat from '../hooks/usevoicechat';
import { colors, radii, spacing, typography } from '../constants/colors';

const speedOptions = [
  { label: 'Calm', rate: 0.88 },
  { label: 'Default', rate: 1 },
];

export default function SidekicksScreen() {
  const [micError, setMicError] = useState('');
  const [mute, setMute] = useState(false);
  const [speechRate, setSpeechRate] = useState(speedOptions[0].rate);
  const [lastSpokenId, setLastSpokenId] = useState(null);
  const { messages, sendTranscript, isStreaming, lastError, resetConversation } = useVoiceChat();

  const latestAi = useMemo(
    () => [...messages].reverse().find((m) => m.role === 'ai'),
    [messages]
  );

  useEffect(() => {
    return () => Speech.stop();
  }, []);

  useEffect(() => {
    if (mute || !latestAi || latestAi.status !== 'done' || latestAi.speak === false) return;
    if (latestAi.id === lastSpokenId) return;
    Speech.stop();
    Speech.speak(latestAi.content, {
      rate: speechRate,
      pitch: 1,
      language: 'en-US',
    });
    setLastSpokenId(latestAi.id);
  }, [latestAi, mute, speechRate, lastSpokenId]);

  const onFinalTranscript = (text) => {
    setMicError('');
    sendTranscript(text, { mute, speed: speechRate });
  };

  const replayResponse = () => {
    if (!latestAi?.content) return;
    Speech.stop();
    Speech.speak(latestAi.content, { rate: speechRate, pitch: 1, language: 'en-US' });
  };

  return (
    <View style={styles.container}>
      <SectionCard>
        <BrandBadge tagline="Low-stim guidance, one next step" />
        <Text style={styles.heading}>Takota Voice</Text>
        <Text style={styles.helper}>
          Press to talk. Takota keeps it short and clear, then reads it aloud if you want.
        </Text>
        <View style={styles.settingsRow}>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Mute speech</Text>
            <Switch
              value={mute}
              onValueChange={(val) => {
                setMute(val);
                if (val) Speech.stop();
              }}
              trackColor={{ false: colors.surface, true: colors.accentMuted }}
              thumbColor={mute ? colors.ink : colors.text}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Speed</Text>
            <View style={styles.speedRow}>
              {speedOptions.map((option) => {
                const active = speechRate === option.rate;
                return (
                  <TouchableOpacity
                    key={option.label}
                    style={[styles.speedChip, active && styles.speedChipActive]}
                    onPress={() => setSpeechRate(option.rate)}
                  >
                    <Text style={[styles.speedLabel, active && styles.speedLabelActive]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </SectionCard>

      <SectionCard>
        <VoiceButton
          disabled={isStreaming}
          onFinalTranscript={onFinalTranscript}
          onError={(msg) => setMicError(msg)}
        />
        {micError ? <Text style={styles.errorText}>{micError}</Text> : null}
        {lastError ? <Text style={styles.errorText}>{lastError}</Text> : null}
        <View style={styles.actionsRow}>
          <PrimaryButton
            label="Replay Takota"
            onPress={replayResponse}
            disabled={!latestAi?.content || mute}
            style={{ flex: 1 }}
          />
          <PrimaryButton
            label="New thread"
            onPress={resetConversation}
            style={{ flex: 1, backgroundColor: colors.surface }}
          />
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.subheading}>Conversation</Text>
        <Text style={styles.disclaimer}>Not therapy. Not medical advice. A planning tool.</Text>
        {messages.length === 0 ? (
          <Text style={styles.helper}>Tap talk to record. Replies will show here.</Text>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.turn,
                  item.role === 'user' ? styles.turnUser : styles.turnAi,
                ]}
              >
                <View style={styles.turnHeader}>
                  <Text style={styles.turnBadge}>{item.role === 'user' ? 'You' : 'Takota'}</Text>
                  {item.status === 'streaming' ? <Text style={styles.turnStatus}>...</Text> : null}
                  {item.status === 'error' ? (
                    <Ionicons name="warning" size={14} color={colors.danger} />
                  ) : null}
                </View>
                <Text style={styles.turnText}>{item.content}</Text>
              </View>
            )}
          />
        )}
      </SectionCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    gap: spacing.md,
  },
  heading: {
    color: colors.text,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
  },
  helper: {
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  subheading: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.sm,
  },
  disclaimer: {
    color: colors.muted,
    fontSize: typography.sizes.xs,
    marginBottom: spacing.sm,
  },
  settingsRow: {
    gap: spacing.sm,
  },
  settingItem: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingLabel: {
    color: colors.text,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  speedRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  speedChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: colors.card,
  },
  speedChipActive: {
    backgroundColor: colors.accent,
  },
  speedLabel: {
    color: colors.muted,
    fontWeight: typography.weights.semibold,
  },
  speedLabelActive: {
    color: colors.ink,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  errorText: {
    color: colors.danger,
    marginTop: spacing.xs,
    fontSize: typography.sizes.xs,
  },
  turn: {
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  turnUser: {
    backgroundColor: colors.surface,
  },
  turnAi: {
    backgroundColor: colors.card,
  },
  turnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  turnBadge: {
    color: colors.muted,
    fontSize: typography.sizes.xs,
  },
  turnStatus: {
    color: colors.muted,
    fontSize: typography.sizes.xs,
  },
  turnText: {
    color: colors.text,
    lineHeight: 20,
  },
});
