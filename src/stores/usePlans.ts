"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { SEED_PLANS } from "@/data/plans";
import type { SubscriptionPlan } from "@/types";

type State = {
  plans: SubscriptionPlan[];
  hydrated: boolean;
  update: (id: string, patch: Partial<SubscriptionPlan>) => void;
  upsert: (plan: SubscriptionPlan) => void;
  remove: (id: string) => void;
  reset: () => void;
};

export const usePlans = create<State>()(
  persist(
    (set, get) => ({
      plans: SEED_PLANS,
      hydrated: false,
      update: (id, patch) => {
        const list = get().plans;
        const target = list.find((p) => p.id === id);
        if (!target) return;
        const history = [...target.history];
        for (const [k, v] of Object.entries(patch)) {
          const prev = (target as Record<string, unknown>)[k];
          if (prev !== v && (typeof prev === "string" || typeof prev === "number" || typeof prev === "boolean")) {
            history.push({ changedAt: new Date().toISOString(), field: k, from: prev, to: v as string | number | boolean });
          }
        }
        set({
          plans: list.map((p) => (p.id === id ? { ...p, ...patch, history } : p)),
        });
      },
      upsert: (plan) => {
        const list = get().plans;
        const idx = list.findIndex((p) => p.id === plan.id);
        if (idx === -1) set({ plans: [...list, plan] });
        else set({ plans: list.map((p) => (p.id === plan.id ? plan : p)) });
      },
      remove: (id) => set({ plans: get().plans.filter((p) => p.id !== id) }),
      reset: () => set({ plans: SEED_PLANS }),
    }),
    {
      name: "oc-admin-plans",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (s) => {
        if (s) s.hydrated = true;
      },
    },
  ),
);
