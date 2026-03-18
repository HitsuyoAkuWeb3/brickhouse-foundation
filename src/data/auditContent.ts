export interface AuditArea {
  name: string;
  icon: string;
  key: string;
  tagline: string;
  questions: string[];
  sliderLabel: string;
}

export const areas: AuditArea[] = [
  {
    name: "Self",
    icon: "🌸",
    key: "SELF",
    tagline: "Your Foundation",
    sliderLabel: "Rate your SELF-LOVE",
    questions: [
      "How do you speak to yourself when no one is listening?",
      "Do you treat yourself with the same grace you offer everyone else? Do you genuinely like who you are — not who you perform for the world, but who you are when no one is watching?",
      "Do you protect your peace or hand it away to whoever asks?",
      "When is the last time you did something just because it made you feel good?",
    ],
  },
  {
    name: "Love",
    icon: "💎",
    key: "LOVE",
    tagline: "Your Relationships",
    sliderLabel: "Rate your LOVE LIFE",
    questions: [
      "Not just romantic — every relationship in your orbit.",
      "Are you surrounded by people who see you, support you, and pour into you the way you pour into them?",
      "Or are you settling for crumbs — half-efforts, unreturned texts, friendships that drain you?",
      "Does your love life — romantic, platonic, and familial — feel like adoration or obligation?",
    ],
  },
  {
    name: "Money",
    icon: "✨",
    key: "MONEY",
    tagline: "Your Abundance",
    sliderLabel: "Rate your MONEY",
    questions: [
      "Not just your bank account — your relationship with abundance.",
      "Do you feel financially safe? Do you believe more is coming — or are you bracing for the next crisis?",
      "Are you building wealth or just surviving paycheck to paycheck? Do you spend from a place of confidence or anxiety?",
      "Does money feel like a tool you control — or a weight you carry?",
    ],
  },
  {
    name: "Purpose",
    icon: "🔥",
    key: "PURPOSE",
    tagline: "Your Calling",
    sliderLabel: "Rate your PURPOSE",
    questions: [
      "Are you just working — or are you building something meaningful?",
      "Does your work align with your gifts? Do you wake up with direction or dread?",
      "Are you using your talents in a way that fulfills you? Do you feel like you're living your purpose or just paying bills?",
      "Does your career feed your soul — or drain it?",
    ],
  },
  {
    name: "Joy",
    icon: "🌹",
    key: "JOY",
    tagline: "Your Daily Experience",
    sliderLabel: "Rate your JOY",
    questions: [
      'Not happiness for special occasions — joy in your ordinary days.',
      "Do you laugh often? Feel light? Find magic in the mundane?",
      'Or is life heavy? Every day a grind? Are you just getting through until the weekend, the vacation, the "someday"?',
      "Does your daily life — not the highlight reel, the actual Tuesday — feel good to you?",
    ],
  },
];

export const feelingLabels: Record<number, string> = {
  1: "This is where we start. You're not broken — you're ready to build.",
  2: "You feel it. The gap between where you are and where you want to be.",
  3: "Struggling. But you're still here, which means something.",
  4: "Below the line. There's real work to do here.",
  5: "Getting by. Not broken — but not building either.",
  6: "You've got a foundation. Now let's build on it.",
  7: "Some real strength here. Let's protect and grow it.",
  8: "You're doing the work. This area has momentum.",
  9: "This area is a gift. Let it fuel the rest.",
  10: "Thriving. This is what a Brickhouse feels like.",
};

export const sliderSubLabels = [
  "Drowning",
  "Drowning",
  "Struggling",
  "Struggling",
  "Surviving",
  "Building",
  "Building",
  "Thriving",
  "Thriving",
  "Thriving",
];

export interface Insight {
  truth: string;
  shift: string;
}

export const areaInsights: Record<string, { low: Insight; mid: Insight; high: Insight }> = {
  SELF: {
    low: {
      truth: "You've been caring for everyone except yourself.",
      shift: "A Brickhouse knows: you cannot pour from an empty cup. Loving yourself first isn't selfish — it's the only foundation that holds.",
    },
    mid: {
      truth: "You know what you need. You're just not fully giving it to yourself yet.",
      shift: "You're closer than you think. The shift from surviving to thriving in your inner world starts with one decision: I come first.",
    },
    high: {
      truth: "Your inner world is strong. That's your greatest asset.",
      shift: "This is the foundation everything else is built on. Protect it.",
    },
  },
  LOVE: {
    low: {
      truth: "You've been accepting crumbs and calling it love.",
      shift: "A Brickhouse only settles for adoration. The relationships in your life should add energy, not drain it. It's time to raise the standard.",
    },
    mid: {
      truth: "Some of your relationships nourish you. Others are costing you more than you're admitting.",
      shift: "Crumbs to Adoration starts with getting honest about who's truly in your corner.",
    },
    high: {
      truth: "You are surrounded by people who see you fully and love what they see.",
      shift: "This is what adoration looks like. Keep building from this frequency.",
    },
  },
  MONEY: {
    low: {
      truth: "Your financial life does not yet reflect your divine worth.",
      shift: "Abundance isn't just a number — it's a belief. The Brickhouse framework starts here: you are worthy of financial peace.",
    },
    mid: {
      truth: "You're managing. But there's a gap between where you are and where you know you could be.",
      shift: "Drowning to Building starts with shifting from scarcity thinking to abundance alignment.",
    },
    high: {
      truth: "Your relationship with money is one of abundance and freedom.",
      shift: "This is the frequency. Let it expand into every other area.",
    },
  },
  PURPOSE: {
    low: {
      truth: "You are not living your calling. You're just paying bills.",
      shift: "Purpose is not a luxury — it's oxygen. The Brickhouse framework will help you align your daily actions with your divine gifts.",
    },
    mid: {
      truth: "You have glimpses of purpose. But it's not fully yours yet.",
      shift: "The gap between a job and a calling is identity. When you know who you are, purpose becomes clear.",
    },
    high: {
      truth: "You are building something that matters — and you know it.",
      shift: "Let this clarity anchor you on the hard days.",
    },
  },
  JOY: {
    low: {
      truth: "You are living for someday. Waiting to be happy until everything is fixed.",
      shift: "Joy is not the reward at the end. It's the building material. Your ordinary Tuesday deserves to feel good too.",
    },
    mid: {
      truth: "You have joy — but it's conditional. Special occasions only.",
      shift: "A Brickhouse architects joy into the daily. Not just the highlight reel. The actual Tuesday.",
    },
    high: {
      truth: "You find joy in the ordinary. That is one of the rarest and most powerful things a woman can cultivate.",
      shift: "This frequency is magnetic. Everything you desire is drawn to this.",
    },
  },
};

export function getLevel(score: number): "low" | "mid" | "high" {
  if (score <= 4) return "low";
  if (score <= 7) return "mid";
  return "high";
}
