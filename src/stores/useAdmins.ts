"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { SEED_ADMINS, SEED_ADMIN_ACTIVITY } from "@/data/admins";
import type { AdminActivityEntry, AdminUser } from "@/types";

type State = {
  admins: AdminUser[];
  activity: AdminActivityEntry[];
  hydrated: boolean;
  add: (a: AdminUser) => void;
  update: (id: string, patch: Partial<AdminUser>) => void;
  remove: (id: string) => void;
  log: (entry: Omit<AdminActivityEntry, "id" | "at"> & { at?: string }) => void;
  reset: () => void;
};

export const useAdmins = create<State>()(
  persist(
    (set, get) => ({
      admins: SEED_ADMINS,
      activity: SEED_ADMIN_ACTIVITY,
      hydrated: false,
      add: (a) => set({ admins: [a, ...get().admins] }),
      update: (id, patch) => set({ admins: get().admins.map((a) => (a.id === id ? { ...a, ...patch } : a)) }),
      remove: (id) => set({ admins: get().admins.filter((a) => a.id !== id) }),
      log: (entry) =>
        set({
          activity: [
            { id: `act_${Date.now().toString(36)}`, at: entry.at ?? new Date().toISOString(), author: entry.author, action: entry.action, target: entry.target },
            ...get().activity,
          ].slice(0, 50),
        }),
      reset: () => set({ admins: SEED_ADMINS, activity: SEED_ADMIN_ACTIVITY }),
    }),
    {
      name: "oc-admin-admins",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (s) => {
        if (s) s.hydrated = true;
      },
    },
  ),
);
