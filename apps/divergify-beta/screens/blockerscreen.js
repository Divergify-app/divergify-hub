import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SectionCard from '../components/sectioncard';
import PrimaryButton from '../components/primarybutton';
import usePersistentState from '../hooks/usepersistentstate';
import { colors, radii, spacing, typography } from '../constants/colors';
import { nudges } from '../constants/nudges';

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export default function BlockerScreen() {
  const [stats, setStats] = usePersistentState('blockerStats', {
    sessions: [],
    streak: 0,
    lastWin: null,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  const baseline = useMemo(() => {
    if (!stats.sessions.length) return 300;
    const total = stats.sessions.reduce((sum, session) => sum + session.duration, 0);
    return Math.max(120, Math.round(total / stats.sessions.length));
  }, [stats.sessions]);

  const currentNudge = useMemo(() => {
    const idx = stats.streak % nudges.length;
    return nudges[idx];
  }, [stats.streak]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => timerRef.current && clearInterval(timerRef.current);
  }, [isRunning]);

  const stopSession = () => {
    setIsRunning(false);
    if (seconds === 0) return;
    const beatBaseline = seconds >= baseline;
    setStats((prev) => ({
      streak: beatBaseline ? prev.streak + 1 : 0,
      lastWin: beatBaseline ? Date.now() : prev.lastWin,
      sessions: [
        { id: Date.now().toString(), duration: seconds, won: beatBaseline },
        ...(prev.sessions ?? []),
      ].slice(0, 10),
    }));
    setSeconds(0);
  };

  const toggleTimer = () => {
    if (isRunning) {
      stopSession();
    } else {
      setSeconds(0);
      setIsRunning(true);
    }
  };

  return (
    <View style={styles.container}>
      <SectionCard>
        <Text style={styles.heading}>Beat your baseline</Text>
        <Text style={styles.helper}>
          Timer gamifies focus reps. Hit your average or better and the streak climbs.
        </Text>
        <View style={styles.timerCard}>
          <Text style={styles.timerValue}>{formatTime(seconds)}</Text>
          <Text style={styles.timerLabel}>Baseline {formatTime(baseline)}</Text>
        </View>
        <PrimaryButton
          label={isRunning ? 'Stop & Log' : 'Start Focus Sprint'}
          onPress={toggleTimer}
        />
      </SectionCard>

      <SectionCard>
        <Text style={styles.subheading}>Nudge</Text>
        <Text style={styles.nudge}>{currentNudge}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.streak}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {stats.sessions[0]?.duration ? formatTime(stats.sessions[0].duration) : '--'}
            </Text>
            <Text style={styles.statLabel}>Last run</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {stats.sessions.filter((s) => s.won).length}
            </Text>
            <Text style={styles.statLabel}>Wins (10)</Text>
          </View>
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.subheading}>Receipts</Text>
        {stats.sessions.length === 0 ? (
          <Text style={styles.helper}>No sprints logged yet. Hit start when ready.</Text>
        ) : (
          stats.sessions.map((session) => (
            <View key={session.id} style={styles.historyRow}>
              <View>
                <Text style={styles.historyTime}>{formatTime(session.duration)}</Text>
                <Text style={styles.historyDate}>
                  {new Date(Number(session.id)).toLocaleDateString()}
                </Text>
              </View>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: session.won ? colors.success : '#272733' },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    session.won ? { color: '#023327' } : { color: colors.muted },
                  ]}
                >
                  {session.won ? 'Beat' : 'Reset & retry'}
                </Text>
              </View>
            </View>
          ))
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
  timerCard: {
    width: '100%',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  timerValue: {
    color: colors.text,
    fontSize: 48,
    fontVariant: ['tabular-nums'],
    fontWeight: typography.weights.bold,
  },
  timerLabel: {
    color: colors.muted,
    marginTop: spacing.xs,
  },
  subheading: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.sm,
  },
  nudge: {
    color: colors.text,
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  statValue: {
    color: colors.text,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  statLabel: {
    color: colors.muted,
    fontSize: typography.sizes.xs,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  historyTime: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  historyDate: {
    color: colors.muted,
    fontSize: typography.sizes.xs,
  },
  badge: {
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  badgeText: {
    fontWeight: typography.weights.semibold,
  },
});
