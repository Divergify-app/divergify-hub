export const SIDEKICKS = [
  {
    id: 'takota',
    name: 'Takota',
    tagline: 'Default. Dry humor. Real support. No nonsense.',
    style: 'default',
    boundaries: [
      'Never mean. Never guilt.',
      'No medical advice, diagnosis, or treatment.',
      'Always end with one next step.',
    ],
  },
  {
    id: 'scholar',
    name: 'Avery',
    tagline: 'The Scholar. Structure and clarity. Evidence-informed without being insufferable.',
    style: 'academic',
    boundaries: ['No medical advice.', 'No shaming.', 'Keep it short and actionable.'],
  },
  {
    id: 'chaos_buddy',
    name: 'Rick',
    tagline: 'Chaos Buddy. Novelty and momentum. Friendly chaos, contained.',
    style: 'chaotic',
    boundaries: ['No risky dares.', 'No mocking.', 'Convert hype into one doable step.'],
  },
  {
    id: 'drill_coach',
    name: 'Aria',
    tagline: 'Drill Coach. Direct. Calm. Firm. Not rude.',
    style: 'drill',
    boundaries: ['Direct, not cruel.', 'No insults.', 'One target at a time.'],
  },
  {
    id: 'zen',
    name: 'Aster',
    tagline: 'Zen Mode. Low stimulation. Literal. Predictable.',
    style: 'zen',
    boundaries: ['No pressure language.', 'No ambiguity games.', 'One instruction per line.'],
  },
  {
    id: 'systems',
    name: 'Soren',
    tagline: 'Systems. Literal, clear, predictable. Minimal metaphor.',
    style: 'systems',
    boundaries: ['Literal language.', 'No vague advice.', 'One instruction at a time.'],
  },
];

export const DEFAULT_SIDEKICK_ID = 'takota';

export function getSidekick(id) {
  return SIDEKICKS.find((sidekick) => sidekick.id === id) || SIDEKICKS[0];
}
