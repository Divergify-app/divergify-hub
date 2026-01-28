const SELF_ATTACK_PHRASES = [
  'i hate myself',
  'i am useless',
  'im useless',
  "i'm useless",
  'i am a failure',
  "i'm a failure",
  'im a failure',
  'i always fuck this up',
  'i always mess this up',
  "what's wrong with me",
  'what is wrong with me',
];

const SELF_ATTACK_WORDS = [
  'useless',
  'worthless',
  'failure',
  'broken',
  'stupid',
  'idiot',
  'garbage',
];

const OVERLOAD_PHRASES = [
  "can't think",
  'cant think',
  'everything is too much',
  'too much',
  'overwhelmed',
  'overwhelm',
  "don't know where to start",
  'dont know where to start',
  'brain is melting',
  'i cannot think',
  'everything is happening at once',
  "can't handle today",
  'cant handle today',
  'i cant handle today',
  'drowning',
];

const PANIC_WORDS = ['panic', 'panicking', 'spinning', 'melting'];

const PROBLEM_MARKERS = [
  "can't",
  'cant',
  'too much',
  'overwhelmed',
  "don't know",
  'dont know',
  'no idea',
  'stuck',
  'melting',
  'panic',
  'spinning',
  'everything',
];

const INTENT_WORDS = ['should', 'need to', 'have to', 'gotta', 'must'];
const DELAY_WORDS = [
  'later',
  'not now',
  'after',
  'before i',
  'once i',
  'about to start',
  'soon',
  'eventually',
  'maybe',
  'tomorrow',
  'first',
  'just not yet',
];

const AVOIDANCE_PHRASES = [
  "i'll do it",
  'ill do it',
  'about to start',
  'just not yet',
];

const FATIGUE_WORDS = [
  'exhausted',
  'tired',
  'fried',
  'burnt',
  'burned out',
  "can't today",
  'cant today',
  'no energy',
  'drained',
  'sleepy',
  'done',
  "can't handle anything big",
  'cant handle anything big',
  "can't handle anything",
  'cant handle anything',
  'too tired',
];

const EMOTIONAL_MARKERS = [
  'overwhelmed',
  'panic',
  'hate',
  'frustrated',
  'anxious',
  'scared',
  'stressed',
  'tired',
  'exhausted',
  'angry',
  'sad',
  'depressed',
];

const ACTION_MARKERS = [
  'plan',
  'break this',
  'break this into steps',
  'steps',
  'next action',
  'schedule',
  'organize',
  'outline',
  'draft',
  'build',
  'finish',
  'ship',
  'make this smaller',
  'one step',
  'checklist',
];

const CREATIVE_MARKERS = ['brainstorm', 'idea', 'creative', 'concept', 'pitch'];

function normalizeInput(inputText) {
  const cleaned = inputText
    .toLowerCase()
    .trim()
    .replace(/([!?.,])\1+/g, '$1')
    .replace(/\s+/g, ' ');
  return cleaned;
}

function wordCount(text) {
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

function containsAny(text, list) {
  return list.some((phrase) => text.includes(phrase));
}

function countMatches(text, list) {
  return list.reduce((count, phrase) => (text.includes(phrase) ? count + 1 : count), 0);
}

function hasFirstPerson(text) {
  return /\b(i|im|i'm|i am|me|my)\b/.test(text);
}

function hasNegativeDescriptor(text) {
  return containsAny(text, SELF_ATTACK_WORDS);
}

export function detectState(inputText) {
  const normalized = normalizeInput(inputText || '');
  const words = wordCount(normalized);

  const hasSelfAttack =
    containsAny(normalized, SELF_ATTACK_PHRASES) ||
    (hasFirstPerson(normalized) && hasNegativeDescriptor(normalized));
  if (hasSelfAttack) return 'SELF_ATTACK';

  const problemHits = countMatches(normalized, PROBLEM_MARKERS);
  const andCount = (normalized.match(/\band\b/g) || []).length;
  const hasOverload =
    containsAny(normalized, OVERLOAD_PHRASES) ||
    (words > 12 && problemHits >= 2) ||
    andCount >= 3;
  if (hasOverload) return 'OVERLOAD';

  const hasAvoidance =
    (containsAny(normalized, INTENT_WORDS) && containsAny(normalized, DELAY_WORDS)) ||
    containsAny(normalized, AVOIDANCE_PHRASES);
  if (hasAvoidance) return 'AVOIDANCE';

  const hasFatigue = containsAny(normalized, FATIGUE_WORDS);
  const hasPanic = containsAny(normalized, PANIC_WORDS);
  if (hasFatigue && !hasPanic) return 'LOW_ENERGY';

  const hasAction = containsAny(normalized, ACTION_MARKERS);
  const hasEmotion = containsAny(normalized, EMOTIONAL_MARKERS);
  if (hasAction && !hasEmotion && words < 20) return 'FOCUSED';

  return 'NEUTRAL';
}

export function detectCreativeIntent(inputText) {
  const normalized = normalizeInput(inputText || '');
  return containsAny(normalized, CREATIVE_MARKERS);
}

let GOLDEN_PROMPTS = [];
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  GOLDEN_PROMPTS = [
    { prompt: "I'm a failure. I always screw this up.", expected: 'SELF_ATTACK' },
    { prompt: "I hate myself for letting this happen again.", expected: 'SELF_ATTACK' },
    { prompt: "What is wrong with me.", expected: 'SELF_ATTACK' },
    { prompt: "I'm useless. I can't do anything.", expected: 'SELF_ATTACK' },
    { prompt: "I'm such an idiot.", expected: 'SELF_ATTACK' },
    { prompt: "I can't think. Everything is too much.", expected: 'OVERLOAD' },
    { prompt: "I have ten things to do and my brain is melting.", expected: 'OVERLOAD' },
    { prompt: "I don't know where to start and I'm panicking.", expected: 'OVERLOAD' },
    { prompt: "Everything is happening at once and I'm drowning.", expected: 'OVERLOAD' },
    { prompt: "I can't handle today.", expected: 'OVERLOAD' },
    { prompt: "I should do it but I'll do it later.", expected: 'AVOIDANCE' },
    { prompt: "I just need to research a bit more first.", expected: 'AVOIDANCE' },
    { prompt: "I'm about to start, just not yet.", expected: 'AVOIDANCE' },
    { prompt: "I need to get ready before I can do it.", expected: 'AVOIDANCE' },
    { prompt: "I'll do it tomorrow.", expected: 'AVOIDANCE' },
    { prompt: "I'm exhausted. I can't today.", expected: 'LOW_ENERGY' },
    { prompt: "I'm fried. I have nothing left.", expected: 'LOW_ENERGY' },
    { prompt: "My brain is done.", expected: 'LOW_ENERGY' },
    { prompt: "I can't handle anything big right now.", expected: 'LOW_ENERGY' },
    { prompt: "I'm too tired.", expected: 'LOW_ENERGY' },
    { prompt: "Break this task into steps.", expected: 'FOCUSED' },
    { prompt: "What's my next action for writing the email?", expected: 'FOCUSED' },
    { prompt: "Help me plan this in 20 minutes.", expected: 'FOCUSED' },
    { prompt: "Make this smaller. One step.", expected: 'FOCUSED' },
    { prompt: "Turn this into a checklist.", expected: 'FOCUSED' },
    { prompt: "Hey Takota.", expected: 'NEUTRAL' },
    { prompt: "I'm here.", expected: 'NEUTRAL' },
    { prompt: "What can you do?", expected: 'NEUTRAL' },
    { prompt: "Explain Stickys.", expected: 'NEUTRAL' },
    { prompt: "Where do I start?", expected: 'NEUTRAL' },
  ];
}

export { GOLDEN_PROMPTS };
