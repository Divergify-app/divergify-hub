import appJson from './app.json';

export default () => ({
  ...appJson.expo,
  extra: {
    ...appJson.expo.extra,
    aiBaseUrl: process.env.EXPO_PUBLIC_AI_BASE_URL,
    takotaGuardrail: process.env.EXPO_PUBLIC_TAKOTA_GUARDRAIL,
    takotaMaxResponseChars: process.env.EXPO_PUBLIC_TAKOTA_MAX_RESPONSE_CHARS,
  },
});
