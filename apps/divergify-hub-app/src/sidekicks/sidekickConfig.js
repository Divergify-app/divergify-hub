// sidekickConfig.js

const sidekickPersonalities = {
  takota: {
    name: "Takota",
    meaning: "Friend to all",
    tone: "supportive",
    shameLevel: 0, // Always zero!
    style: "direct, calm, practical"
  },
  rex: {
    name: "Rex",
    meaning: "Lovable chaos buddy",
    tone: "goofy-encouraging",
    shameLevel: 0,
    style: "corny dad jokes, all-in encouragement"
  },
  asha: {
    name: "Asha",
    meaning: "Gentle grounding",
    tone: "low-stim",
    shameLevel: 0,
    style: "soft, steady, one step at a time"
  },
  sanjay: {
    name: "Sanjay",
    meaning: "Clear thinking",
    tone: "reflective",
    shameLevel: 0,
    style: "stoic clarity, practical reasoning"
  },
  lira: {
    name: "Lira",
    meaning: "Creative warmth",
    tone: "warm-creative",
    shameLevel: 0,
    style: "gentle, vivid, grounding"
  },
  systems: {
    name: "Systems",
    meaning: "Structure and predictability",
    tone: "literal",
    shameLevel: 0,
    style: "minimal metaphor, clear steps"
  }
};

// Initial State for the User's Sidekick
const userSidekick = {
  customName: "Takota",
  selectedPersona: sidekickPersonalities.takota,
  currentStimulation: 5 // Scale of 1-10
};

export { sidekickPersonalities, userSidekick };
