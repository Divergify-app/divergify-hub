import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography } from '../constants/colors';

const isWeb = Platform.OS === 'web';
const voiceModule = isWeb ? null : require('@react-native-voice/voice').default;

const requestMicPermission = async () => {
  if (Platform.OS === 'android') {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: 'Allow microphone access',
        message: 'Takota uses the mic for press-to-talk.',
        buttonPositive: 'Allow',
      }
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }
  if (voiceModule?.requestPermissions) {
    try {
      const granted = await voiceModule.requestPermissions();
      if (typeof granted === 'boolean') return granted;
      return granted?.status === 'granted' || granted === 'granted' || granted?.granted;
    } catch (_e) {
      return false;
    }
  }
  return true;
};

export default function VoiceButton({
  disabled,
  onPartialTranscript,
  onFinalTranscript,
  onError,
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [partial, setPartial] = useState('');
  const [permissionError, setPermissionError] = useState('');
  const busy = disabled;

  useEffect(() => {
    if (!voiceModule) {
      setPermissionError('Voice capture is only available on device.');
      return () => {};
    }

    voiceModule.onSpeechStart = () => setIsRecording(true);
    voiceModule.onSpeechEnd = () => setIsRecording(false);
    voiceModule.onSpeechPartialResults = (event) => {
      const nextPartial = event.value?.[0] ?? '';
      setPartial(nextPartial);
      onPartialTranscript?.(nextPartial);
    };
    voiceModule.onSpeechResults = (event) => {
      const finalText = event.value?.[0] ?? '';
      setPartial('');
      setIsRecording(false);
      if (finalText) {
        onFinalTranscript?.(finalText);
      }
    };
    voiceModule.onSpeechError = (event) => {
      setIsRecording(false);
      onError?.(event?.error?.message || 'Speech capture failed. Try again.');
    };

    return () => {
      voiceModule
        .destroy()
        .catch(() => {})
        .finally(() => voiceModule.removeAllListeners?.());
    };
  }, [onError, onFinalTranscript, onPartialTranscript]);

  const startRecording = async () => {
    if (!voiceModule) {
      onError?.('Voice capture is only available on device.');
      return;
    }

    setPermissionError('');
    const granted = await requestMicPermission();
    if (!granted) {
      setPermissionError('Microphone permission is required.');
      onError?.('Microphone permission is required.');
      return;
    }

    try {
      setPartial('');
      await voiceModule.start('en-US', {
        EXTRA_PARTIAL_RESULTS: true,
        REQUEST_PERMISSIONS_AUTO: true,
      });
      setIsRecording(true);
    } catch (_e) {
      onError?.('Could not start listening.');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!voiceModule) return;
    try {
      await voiceModule.stop();
    } catch (_e) {
      // swallow; Voice will emit an end event
    }
    setIsRecording(false);
  };

  const toggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[styles.button, isRecording && styles.recording, busy && styles.disabled]}
        onPress={toggle}
        disabled={busy}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={isRecording ? 'Stop recording' : 'Start recording'}
      >
        {isRecording ? (
          <ActivityIndicator color={colors.ink} />
        ) : (
          <Ionicons name="mic" size={20} color={colors.ink} />
        )}
        <Text style={styles.label}>{isRecording ? 'Stop' : 'Talk'}</Text>
      </TouchableOpacity>
      <View style={styles.transcriptRow}>
        <Text style={styles.transcriptLabel}>Transcript</Text>
        <Text style={styles.transcriptText}>
          {partial || (isRecording ? 'Listening...' : 'Tap to record')}
        </Text>
      </View>
      {!!permissionError && <Text style={styles.error}>{permissionError}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  recording: {
    backgroundColor: colors.warning,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    color: colors.ink,
    fontWeight: typography.weights.semibold,
    fontSize: typography.sizes.md,
  },
  transcriptRow: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  transcriptLabel: {
    color: colors.muted,
    fontSize: typography.sizes.xs,
    marginBottom: spacing.xxs,
  },
  transcriptText: {
    color: colors.text,
    fontSize: typography.sizes.sm,
  },
  error: {
    color: colors.danger,
    fontSize: typography.sizes.xs,
  },
});
