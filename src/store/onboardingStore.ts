import { create } from "zustand";

export type Step = "birthdate" | "goals" | "transformation";

interface OnboardingStore {
  step: Step;
  birthDate: Date | undefined;
  goals: [string, string, string];
  transformation: string;
  setStep: (step: Step) => void;
  setBirthDate: (date: Date | undefined) => void;
  setGoal: (index: number, value: string) => void;
  setTransformation: (t: string) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  step: "birthdate",
  birthDate: undefined,
  goals: ["", "", ""],
  transformation: "",
  setStep: (step) => set({ step }),
  setBirthDate: (birthDate) => set({ birthDate }),
  setGoal: (index, value) =>
    set((state) => {
      const newGoals = [...state.goals] as [string, string, string];
      newGoals[index] = value;
      return { goals: newGoals };
    }),
  setTransformation: (transformation) => set({ transformation }),
  reset: () =>
    set({
      step: "birthdate",
      birthDate: undefined,
      goals: ["", "", ""],
      transformation: "",
    }),
}));
