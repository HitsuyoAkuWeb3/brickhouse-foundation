import { brick1Lessons } from './brick1Lessons';

export interface Lesson {
  id: string;
  number?: string;
  title: string;
  summary: string;
  body?: string;
  pullQuote?: string;
  promptType?: string;
  promptBox?: string;
  discardedBelief?: string;
  installedBelief?: string;
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
    name: "Self Love & Identity",
    subtitle: "Your Foundation",
    icon: "🌸",
    color: "330 100% 42%",
    lessonCount: 17, // Spec specifies 17 lessons for Beta
    description:
      "Core foundation work. I AM affirmations, Brickhouse identity, learning to love who you are when no one is watching.",
    lessons: brick1Lessons.map((l, index) => ({
      id: `1-${index + 1}`,
      number: l.number,
      title: l.title,
      summary: l.pullQuote || "Dive into this foundational lesson.",
      body: l.body,
      pullQuote: l.pullQuote,
      promptType: l.promptType,
      promptBox: l.promptBox,
      discardedBelief: l.discardedBelief,
      installedBelief: l.installedBelief
    })),
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
      title: "Lessons available in Phase 2",
      summary: "Lessons available in Phase 2",
    })),
  },
  {
    id: 3,
    slug: "goal-achievement",
    name: "Goal Achievement",
    subtitle: "Your Blueprint",
    icon: "🎯",
    color: "43 50% 54%",
    lessonCount: 12,
    description:
      "Phase II framework: Assess, Plan, Activate, Repeat. Turning dreams into phased, actionable blueprints.",
    lessons: Array.from({ length: 12 }, (_, i) => ({
      id: `3-${i + 1}`,
      title: "Lessons available in Phase 2",
      summary: "Lessons available in Phase 2",
    })),
  },
  {
    id: 4,
    slug: "accountability",
    name: "Accountability",
    subtitle: "Your Discipline",
    icon: "📋",
    color: "200 80% 45%",
    lessonCount: 12,
    description:
      "Taking ownership of your outcomes. Tracking progress, habit building, and structured follow-through.",
    lessons: Array.from({ length: 12 }, (_, i) => ({
      id: `4-${i + 1}`,
      title: "Lessons available in Phase 2",
      summary: "Lessons available in Phase 2",
    })),
  },
  {
    id: 5,
    slug: "healing",
    name: "Healing & Emotional Wellness",
    subtitle: "Your Peace",
    icon: "🌿",
    color: "150 60% 40%",
    lessonCount: 12,
    description: "Addressing inner child wounds, trauma recovery, and achieving deep emotional tranquility.",
    lessons: Array.from({ length: 12 }, (_, i) => ({
      id: `5-${i + 1}`,
      title: "Lessons available in Phase 2",
      summary: "Lessons available in Phase 2",
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
      summary: "Lessons available in Phase 2",
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
      title: "Lessons available in Phase 2",
      summary: "Lessons available in Phase 2",
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
      title: "Lessons available in Phase 2",
      summary: "Lessons available in Phase 2",
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
      title: "Lessons available in Phase 2",
      summary: "Lessons available in Phase 2",
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
      title: "Lessons available in Phase 2",
      summary: "Lessons available in Phase 2",
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
      title: "Lessons available in Phase 2",
      summary: "Lessons available in Phase 2",
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
      title: "Lessons available in Phase 2",
      summary: "Lessons available in Phase 2",
    })),
  },
];

export const getBrickBySlug = (slug: string) =>
  bricks.find((b) => b.slug === slug);
