"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { SEED_ELIGIBILITY_QUESTIONS, SEED_ELIGIBILITY_RULES } from "@/data/eligibility";
import type { EligibilityQuestion, EligibilityRule } from "@/types";

type State = {
  questions: EligibilityQuestion[];
  rules: EligibilityRule[];
  hydrated: boolean;
  setQuestions: (q: EligibilityQuestion[]) => void;
  setRules: (r: EligibilityRule[]) => void;
  upsertQuestion: (q: EligibilityQuestion) => void;
  removeQuestion: (id: string) => void;
  upsertRule: (r: EligibilityRule) => void;
  removeRule: (id: string) => void;
  reset: () => void;
};

export const useEligibility = create<State>()(
  persist(
    (set, get) => ({
      questions: SEED_ELIGIBILITY_QUESTIONS,
      rules: SEED_ELIGIBILITY_RULES,
      hydrated: false,
      setQuestions: (questions) => set({ questions }),
      setRules: (rules) => set({ rules }),
      upsertQuestion: (q) => {
        const list = get().questions;
        const idx = list.findIndex((x) => x.id === q.id);
        if (idx === -1) set({ questions: [...list, q] });
        else set({ questions: list.map((x) => (x.id === q.id ? q : x)) });
      },
      removeQuestion: (id) =>
        set({
          questions: get().questions.filter((q) => q.id !== id),
          rules: get().rules.map((r) => ({
            ...r,
            conditions: r.conditions.filter((c) => c.questionId !== id),
          })),
        }),
      upsertRule: (r) => {
        const list = get().rules;
        const idx = list.findIndex((x) => x.id === r.id);
        if (idx === -1) set({ rules: [...list, r] });
        else set({ rules: list.map((x) => (x.id === r.id ? r : x)) });
      },
      removeRule: (id) => set({ rules: get().rules.filter((r) => r.id !== id) }),
      reset: () => set({ questions: SEED_ELIGIBILITY_QUESTIONS, rules: SEED_ELIGIBILITY_RULES }),
    }),
    {
      name: "oc-admin-eligibility",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (s) => {
        if (s) s.hydrated = true;
      },
    },
  ),
);

export function evaluateAnswers(
  answers: Record<string, string>,
  rules: EligibilityRule[],
): EligibilityRule | null {
  for (const rule of rules) {
    const matches = rule.conditions.every((c) => answers[c.questionId] === c.equals);
    if (matches) return rule;
  }
  return null;
}
