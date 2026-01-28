import { detectCreativeIntent, detectState } from './stateDetector';

const STYLE_RULES = {
  OVERLOAD: {
    label: 'CONTAINMENT',
    allowQuestions: false,
  },
  SELF_ATTACK: {
    label: 'INTERRUPT',
    allowQuestions: false,
  },
  AVOIDANCE: {
    label: 'CHALLENGE',
    allowQuestions: false,
  },
  LOW_ENERGY: {
    label: 'PERMISSION',
    allowQuestions: false,
  },
  FOCUSED: {
    label: 'EXECUTION',
    allowQuestions: true,
  },
  NEUTRAL: {
    label: 'ORIENTATION',
    allowQuestions: true,
  },
};

const DIRECTIVE_PATTERNS = [
  /^(stop|do|pick|choose|write|name|start|open|pause|rest|set)\b/i,
  /\b(do|pick|choose|write|name|start|open|pause|rest|set)\b/i,
];

function splitSentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function enforceConstraints(text, state) {
  const style = selectResponseStyle(state);
  let sentences = splitSentences(text);

  if (!style.allowQuestions) {
    sentences = sentences.filter((sentence) => !sentence.includes('?'));
  }

  let directiveCount = 0;
  sentences = sentences.filter((sentence) => {
    if (sentence.startsWith('State:')) return true;
    const isDirective = DIRECTIVE_PATTERNS.some((pattern) => pattern.test(sentence));
    if (isDirective) {
      directiveCount += 1;
      return directiveCount <= 1;
    }
    return true;
  });

  if (sentences.length === 0) {
    sentences = [`State: ${state}.`];
  }

  return sentences.slice(0, 5).join(' ');
}

function buildTakotaMessage(state) {
  switch (state) {
    case 'SELF_ATTACK':
      return 'State: SELF_ATTACK. Stop. That voice is not useful here. We move to one tiny action.';
    case 'OVERLOAD':
      return 'State: OVERLOAD. Too much is happening. Choose one small thing.';
    case 'AVOIDANCE':
      return 'State: AVOIDANCE. This is avoidance. Do the smallest real step now.';
    case 'LOW_ENERGY':
      return 'State: LOW_ENERGY. You are low. Pick rest or one tiny action.';
    case 'FOCUSED':
      return 'State: FOCUSED. What is the exact outcome? Next step: write it in one line.';
    case 'NEUTRAL':
    default:
      return 'State: NEUTRAL. What are you trying to get done?';
  }
}

function buildHandoffAnnouncement(targetName, state) {
  return `State: ${state}. This needs a different tone. I am handing you to ${targetName} for this part.`;
}

function buildHandoffResponse(targetId, inputText) {
  const normalized = (inputText || '').toLowerCase();
  if (targetId === 'chaos_buddy') {
    return 'Buddy here. Do 60 seconds on the smallest real step.';
  }
  if (targetId === 'courtney') {
    if (normalized.includes('idea') || normalized.includes('brainstorm')) {
      return 'Courtney here. Give me one sentence of the goal and I will draft options.';
    }
    return 'Courtney here. Describe the creative output in one line.';
  }
  return 'Switching tone. Give me the next concrete step you want to take.';
}

function detectHandoff(inputText, state) {
  const normalized = (inputText || '').toLowerCase();

  if (normalized.includes('switch to buddy') || normalized.includes('be softer')) {
    return { id: 'chaos_buddy', name: 'Buddy' };
  }
  if (normalized.includes('switch to scholar')) {
    return { id: 'scholar', name: 'The Scholar' };
  }
  if (normalized.includes('switch to drill')) {
    return { id: 'drill_coach', name: 'Drill Coach' };
  }
  if (normalized.includes('switch to zen')) {
    return { id: 'zen', name: 'Zen Mode' };
  }
  if (normalized.includes('switch to systems')) {
    return { id: 'systems', name: 'Systems' };
  }
  if (normalized.includes('switch to courtney')) {
    return { id: 'courtney', name: 'Courtney' };
  }

  if (state === 'LOW_ENERGY' && normalized.includes('encouragement')) {
    return { id: 'chaos_buddy', name: 'Buddy' };
  }
  if (state === 'FOCUSED' && detectCreativeIntent(inputText)) {
    return { id: 'courtney', name: 'Courtney' };
  }
  return null;
}

export function selectResponseStyle(state) {
  return STYLE_RULES[state] || STYLE_RULES.NEUTRAL;
}

export function buildTakotaResponse(inputText) {
  const state = detectState(inputText);
  const handoff = detectHandoff(inputText, state);

  if (handoff) {
    const announcement = buildHandoffAnnouncement(handoff.name, state);
    const handoffReply = buildHandoffResponse(handoff.id, inputText);
    return {
      state,
      turns: [
        {
          sidekickId: 'takota',
          content: enforceConstraints(announcement, state),
        },
        {
          sidekickId: handoff.id,
          content: enforceConstraints(handoffReply, state),
        },
      ],
    };
  }

  const base = buildTakotaMessage(state);
  return {
    state,
    turns: [
      {
        sidekickId: 'takota',
        content: enforceConstraints(base, state),
      },
    ],
  };
}
