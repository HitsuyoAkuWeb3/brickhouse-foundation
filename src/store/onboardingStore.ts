import { create } from "zustand";

export type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6;

interface OnboardingStore {
  step: OnboardingStep;
  lifeAuditScores: Record<string, number>;
  birthDate: Date | undefined;
  zodiacSign: string | undefined;
  goals: string[];
  reminderPreferences: {
    morning: string;
    midday: string;
    evening: string;
  };
  passionPickMediaUrl: string | undefined;
  passionPickSkipped: boolean;
  
  // Actions
  setStep: (step: OnboardingStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  setLifeAuditScore: (category: string, score: number) => void;
  setBirthDate: (date: Date | undefined) => void;
  setZodiacSign: (sign: string) => void;
  toggleGoal: (goal: string) => void;
  setReminderPreference: (period: 'morning' | 'midday' | 'evening', time: string) => void;
  setPassionPickMedia: (url: string | undefined, skipped?: boolean) => void;
  reset: () => void;
}

const initialState = {
  step: 1 as OnboardingStep,
  lifeAuditScores: {},
  birthDate: undefined,
  zodiacSign: undefined,
  goals: [],
  reminderPreferences: {
    morning: '08:00',
    midday: '12:00',
    evening: '20:00'
  },
  passionPickMediaUrl: undefined,
  passionPickSkipped: false,
};

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  ...initialState,
  
  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: Math.min(state.step + 1, 6) as OnboardingStep })),
  prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) as OnboardingStep })),
  
  setLifeAuditScore: (category, score) => set((state) => ({
    lifeAuditScores: { ...state.lifeAuditScores, [category]: score }
  })),
  
  setBirthDate: (birthDate) => set({ birthDate }),
  setZodiacSign: (zodiacSign) => set({ zodiacSign }),
  
  toggleGoal: (goal) => set((state) => {
    // If the exact goal is already selected, unselect it.
    // Otherwise, select ONLY this new goal.
    return { goals: state.goals.includes(goal) ? [] : [goal] };
  }),
  
  setReminderPreference: (period, time) => set((state) => ({
    reminderPreferences: { ...state.reminderPreferences, [period]: time }
  })),
  
  setPassionPickMedia: (url, skipped = false) => set({ 
    passionPickMediaUrl: url,
    passionPickSkipped: skipped 
  }),
  
  reset: () => set(initialState),
}));
