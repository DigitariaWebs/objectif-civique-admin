"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { NotificationEvent, NotificationSetting } from "@/types";

const DEFAULT: NotificationSetting = {
  "new-signup": { email: true, slack: false },
  "payment-success": { email: true, slack: false },
  "payment-failed": { email: true, slack: true },
  "forum-report": { email: true, slack: true },
  "new-partner": { email: true, slack: false },
  "coach-application": { email: true, slack: false },
};

type State = {
  settings: NotificationSetting;
  hydrated: boolean;
  toggle: (event: NotificationEvent, channel: "email" | "slack") => void;
  reset: () => void;
};

export const useNotificationSettings = create<State>()(
  persist(
    (set, get) => ({
      settings: DEFAULT,
      hydrated: false,
      toggle: (event, channel) =>
        set({
          settings: {
            ...get().settings,
            [event]: {
              ...get().settings[event],
              [channel]: !get().settings[event][channel],
            },
          },
        }),
      reset: () => set({ settings: DEFAULT }),
    }),
    {
      name: "oc-admin-notifications",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (s) => {
        if (s) s.hydrated = true;
      },
    },
  ),
);
