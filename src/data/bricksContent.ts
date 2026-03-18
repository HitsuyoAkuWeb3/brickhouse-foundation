export interface Lesson {
  id: string;
  title: string;
  summary: string;
}

export interface Brick {
  id: number;
  slug: string;
  name: string;
  subtitle: string;
  icon: string;
  color: string; // tailwind hsl accent
  lessonCount: number;
  description: string;
  lessons: Lesson[];
}

export const bricks: Brick[] = [
  {
    id: 1,
    slug: "self-love",
    name: "Self-Love & Identity",
    subtitle: "Your Foundation",
    icon: "🌸",
    color: "330 100% 42%",
    lessonCount: 19,
    description:
      "Core foundation work. I AM affirmations, Brickhouse identity, learning to love who you are when no one is watching.",
    lessons: [
      { id: "1-1", title: "The Mirror Exercise", summary: "How do you speak to yourself when no one is listening?" },
      { id: "1-2", title: "I AM Declarations", summary: "Writing your identity into existence, one statement at a time." },
      { id: "1-3", title: "The Grace You Give Others", summary: "Why you deserve the same kindness you hand out freely." },
      { id: "1-4", title: "Protecting Your Peace", summary: "Stop handing your peace away to whoever asks for it." },
      { id: "1-5", title: "The Brickhouse Identity", summary: "Who is she? Defining the woman you're building into." },
      { id: "1-6", title: "Joy as Self-Love", summary: "When was the last time you did something just because it felt good?" },
      { id: "1-7", title: "Your Inner Dialogue", summary: "Rewiring the conversation you have with yourself every day." },
      { id: "1-8", title: "The First Brick", summary: "Laying the foundation — self-love isn't selfish, it's structural." },
      { id: "1-9", title: "Boundaries as Love", summary: "Saying no is an act of self-adoration." },
      { id: "1-10", title: "The Woman in the Arena", summary: "Showing up for yourself when the world hasn't shown up for you." },
      { id: "1-11", title: "Self-Forgiveness", summary: "Releasing the version of you that didn't know better." },
      { id: "1-12", title: "Your Non-Negotiables", summary: "The things you will never compromise on again." },
      { id: "1-13", title: "The Beauty of Being Alone", summary: "Solitude isn't loneliness — it's self-partnership." },
      { id: "1-14", title: "Reclaiming Your Story", summary: "You are not what happened to you. You are what you chose after." },
      { id: "1-15", title: "The Self-Love Audit", summary: "Honest assessment: where are you shortchanging yourself?" },
      { id: "1-16", title: "Daily Devotion", summary: "Creating a morning practice that centers YOU first." },
      { id: "1-17", title: "The Compliment Exercise", summary: "Learning to receive love without deflecting it." },
      { id: "1-18", title: "Your Love Language — To Yourself", summary: "How do you need to be loved by YOU?" },
      { id: "1-19", title: "Building the Foundation", summary: "The capstone — integrating everything into daily life." },
    ],
  },
  {
    id: 2,
    slug: "mindset",
    name: "Mindset & Manifestation",
    subtitle: "Your Power",
    icon: "🧠",
    color: "280 80% 50%",
    lessonCount: 22,
    description:
      "Code Switch technique, Passion Pick, visualization, universal laws, and the Laying Bricks philosophy.",
    lessons: Array.from({ length: 22 }, (_, i) => ({
      id: `2-${i + 1}`,
      title: [
        "The Code Switch", "Passion Pick Activation", "Visualization Blueprint", "Universal Law of Vibration",
        "Thoughts Become Things", "The Laying Bricks Philosophy", "Rewiring Limiting Beliefs", "The Power of Decision",
        "Abundance Mindset", "Manifestation Journaling", "The Energy You Carry", "Morning Mindset Reset",
        "Affirmation Architecture", "The 17-Second Rule", "Scripting Your Future", "Gratitude as Fuel",
        "Breaking the Scarcity Loop", "The Compound Effect", "Vision Board Mastery", "Acting As If",
        "The Faith Factor", "Mindset Capstone"
      ][i],
      summary: "Lesson content coming soon.",
    })),
  },
  {
    id: 3,
    slug: "goals",
    name: "Goal Achievement",
    subtitle: "Your Blueprint",
    icon: "🎯",
    color: "43 50% 54%",
    lessonCount: 12,
    description:
      "Phase II framework: Assess, Plan, Activate, Repeat. Turning dreams into phased, actionable blueprints.",
    lessons: Array.from({ length: 12 }, (_, i) => ({
      id: `3-${i + 1}`,
      title: [
        "The Phase II Framework", "Assess Your Starting Point", "Planning with Purpose", "Activate Mode",
        "The Repeat Principle", "Goal Roadmapping", "Breaking It Down", "Accountability Architecture",
        "The 90-Day Sprint", "Celebrating Milestones", "Course Correction", "Goal Achievement Capstone"
      ][i],
      summary: "Lesson content coming soon.",
    })),
  },
  {
    id: 4,
    slug: "accountability",
    name: "Accountability",
    subtitle: "Your Discipline",
    icon: "📋",
    color: "200 80% 50%",
    lessonCount: 12,
    description:
      "Daily check-ins, habit tracking, no-excuses coaching prompts. Building the muscle of follow-through.",
    lessons: Array.from({ length: 12 }, (_, i) => ({
      id: `4-${i + 1}`,
      title: [
        "The No-Excuses Audit", "Daily Check-In Protocol", "Habit Stacking", "The Accountability Mirror",
        "Tracking What Matters", "Your Accountability Partner", "Breaking the Cycle", "The 1% Rule",
        "When You Fall Off", "The Power of Consistency", "Building Streaks", "Accountability Capstone"
      ][i],
      summary: "Lesson content coming soon.",
    })),
  },
  {
    id: 5,
    slug: "healing",
    name: "Healing & Emotional Wellness",
    subtitle: "Your Release",
    icon: "💚",
    color: "160 60% 45%",
    lessonCount: 14,
    description:
      "Wound identification, Code Switch out of pain, emotional reset tools. Healing isn't linear — but it is possible.",
    lessons: Array.from({ length: 14 }, (_, i) => ({
      id: `5-${i + 1}`,
      title: [
        "Naming Your Wounds", "The Code Switch for Pain", "Emotional Reset Tools", "The Healing Timeline",
        "Triggers & Responses", "Grief as a Teacher", "Inner Child Work", "The Weight of Unforgiveness",
        "Letting Go Rituals", "Therapy & Self-Work", "Trauma-Informed Self-Care", "The Healing Spiral",
        "Post-Traumatic Growth", "Healing Capstone"
      ][i],
      summary: "Lesson content coming soon.",
    })),
  },
  {
    id: 6,
    slug: "body",
    name: "Body & Health",
    subtitle: "Your Temple",
    icon: "💪",
    color: "15 80% 55%",
    lessonCount: 11,
    description:
      "Badbody to Brickhouse transformation. Loving your body NOW — not when you hit some arbitrary goal.",
    lessons: Array.from({ length: 11 }, (_, i) => ({
      id: `6-${i + 1}`,
      title: [
        "Badbody to Brickhouse", "Loving Your Body Now", "Movement as Medicine", "Nourishment Not Punishment",
        "The Mirror Reframe", "Rest as Productivity", "Body Image Healing", "Strength Over Aesthetics",
        "Your Body's Wisdom", "The Temple Mindset", "Body & Health Capstone"
      ][i],
      summary: "Lesson content coming soon.",
    })),
  },
  {
    id: 7,
    slug: "relationships",
    name: "Relationships (General)",
    subtitle: "Your Circle",
    icon: "🤝",
    color: "270 60% 55%",
    lessonCount: 15,
    description:
      "Adoration Standard, energy protection, self-respect over boundaries. Curating the people in your life.",
    lessons: Array.from({ length: 15 }, (_, i) => ({
      id: `7-${i + 1}`,
      title: [
        "The Adoration Standard", "Energy Audit", "Self-Respect Over Boundaries", "Toxic Relationship Detox",
        "The Inner Circle Blueprint", "Friendship Evaluation", "Family Dynamics", "Setting Standards",
        "Communication Mastery", "Conflict Resolution", "Giving Without Depleting", "The Reciprocity Test",
        "Cutting Ties With Love", "Building Your Tribe", "Relationships Capstone"
      ][i],
      summary: "Lesson content coming soon.",
    })),
  },
  {
    id: 8,
    slug: "dating",
    name: "Dating & Partner Selection",
    subtitle: "Your Standard",
    icon: "💕",
    color: "340 80% 55%",
    lessonCount: 18,
    description:
      "Crumbs to Adoration. Choosing aligned partners, the Goddess Standard, and never settling again.",
    lessons: Array.from({ length: 18 }, (_, i) => ({
      id: `8-${i + 1}`,
      title: [
        "Crumbs to Adoration", "The Goddess Standard", "Choosing Aligned Partners", "Red Flags 101",
        "Your Dating Blueprint", "Attachment Styles", "The Vetting Process", "Emotional Availability",
        "Love Languages in Dating", "The Situationship Exit", "Standards vs. Expectations", "Dating Detox",
        "Your Non-Negotiable List", "First Date Energy", "Vulnerability in Dating", "The Right One vs. Right Now",
        "Building Together", "Dating Capstone"
      ][i],
      summary: "Lesson content coming soon.",
    })),
  },
  {
    id: 9,
    slug: "narcissism",
    name: "Narcissism & Red Flags",
    subtitle: "Your Protection",
    icon: "🚩",
    color: "0 70% 50%",
    lessonCount: 12,
    description:
      "Warning sign identification, leaving safely, protecting your energy from manipulative dynamics.",
    lessons: Array.from({ length: 12 }, (_, i) => ({
      id: `9-${i + 1}`,
      title: [
        "Recognizing the Pattern", "Love Bombing Decoded", "Gaslighting Awareness", "The Trauma Bond",
        "Breaking Free Safely", "No Contact Protocol", "Rebuilding After Narcissistic Abuse", "Trust After Betrayal",
        "Your Red Flag Radar", "The Gray Rock Method", "Healing the Wound", "Protection Capstone"
      ][i],
      summary: "Lesson content coming soon.",
    })),
  },
  {
    id: 10,
    slug: "marriage",
    name: "Marriage & Partnership",
    subtitle: "Your Union",
    icon: "💍",
    color: "43 70% 66%",
    lessonCount: 10,
    description:
      "Brickhouse partnership standards, communication, vision alignment. Building together, not just existing together.",
    lessons: Array.from({ length: 10 }, (_, i) => ({
      id: `10-${i + 1}`,
      title: [
        "Brickhouse Partnership Standards", "Communication Architecture", "Vision Alignment", "Conflict as Growth",
        "Love Languages in Marriage", "Keeping the Fire", "Financial Partnership", "Growing Together",
        "When to Fight For It", "Partnership Capstone"
      ][i],
      summary: "Lesson content coming soon.",
    })),
  },
  {
    id: 11,
    slug: "wisdom",
    name: "Life Wisdom & Peace",
    subtitle: "Your Simplicity",
    icon: "🕊️",
    color: "200 30% 60%",
    lessonCount: 12,
    description:
      "Simplicity, joy scheduling, Drowning to Building transformation. Finding peace in a chaotic world.",
    lessons: Array.from({ length: 12 }, (_, i) => ({
      id: `11-${i + 1}`,
      title: [
        "Drowning to Building", "The Simplicity Principle", "Joy Scheduling", "Peace as a Priority",
        "Letting Go of Control", "The Art of Doing Nothing", "Gratitude Practice", "Minimalist Living",
        "Digital Detox", "Nature as Medicine", "The Wisdom of Waiting", "Wisdom Capstone"
      ][i],
      summary: "Lesson content coming soon.",
    })),
  },
  {
    id: 12,
    slug: "spiritual",
    name: "Spiritual Alignment",
    subtitle: "Your Divinity",
    icon: "✨",
    color: "280 60% 65%",
    lessonCount: 7,
    description:
      "Universal laws, divine feminine activation, Laying Bricks universal teachings. Connecting to something greater.",
    lessons: Array.from({ length: 7 }, (_, i) => ({
      id: `12-${i + 1}`,
      title: [
        "Universal Laws", "Divine Feminine Activation", "Laying Bricks Teachings", "Spiritual Self-Care",
        "Meditation & Stillness", "Trusting the Universe", "Spiritual Capstone"
      ][i],
      summary: "Lesson content coming soon.",
    })),
  },
];

export const getBrickBySlug = (slug: string) =>
  bricks.find((b) => b.slug === slug);
