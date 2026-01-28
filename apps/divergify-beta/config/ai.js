import Constants from 'expo-constants';
import { Platform } from 'react-native';

const extra = Constants?.expoConfig?.extra ?? {};

const aiBaseUrl =
  process.env.EXPO_PUBLIC_AI_BASE_URL ||
  extra.aiBaseUrl ||
  '';

const takotaGuardrail =
  process.env.EXPO_PUBLIC_TAKOTA_GUARDRAIL ||
  extra.takotaGuardrail ||
  '';

const takotaMaxResponseChars = Number(
  process.env.EXPO_PUBLIC_TAKOTA_MAX_RESPONSE_CHARS ?? extra.takotaMaxResponseChars ?? 0
);

export const personaProfiles = {
  takota: {
    persona: 'takota',
    guardrail: takotaGuardrail,
    maxResponseChars: takotaMaxResponseChars,
  },
};

export const aiConfig = {
  baseUrl: aiBaseUrl?.replace(/\/$/, ''),
  device: Platform.OS,
};

const missing = [];
if (!aiBaseUrl) missing.push('EXPO_PUBLIC_AI_BASE_URL');
if (!takotaGuardrail) missing.push('EXPO_PUBLIC_TAKOTA_GUARDRAIL');
if (Number.isNaN(takotaMaxResponseChars) || !takotaMaxResponseChars) {
  missing.push('EXPO_PUBLIC_TAKOTA_MAX_RESPONSE_CHARS');
}

if (missing.length && typeof console !== 'undefined') {
  console.warn(
    `[AI config] Missing env values: ${missing.join(', ')}. Set them before running Expo.`
  );
}

export const debugAIConfig = () => ({
  baseUrl: aiBaseUrl,
  takotaGuardrail,
  takotaMaxResponseChars,
});
