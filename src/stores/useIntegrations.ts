"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Integration } from "@/types";

const SEED: Integration[] = [
  { id: "stripe", name: "Stripe", description: "Paiements et abonnements", apiKey: "sk_live_•••••••••••••••••••••AbC1", connected: true },
  { id: "resend", name: "Resend", description: "E-mails transactionnels", apiKey: "re_•••••••••••••••••••••XyZ4", connected: true },
  { id: "slack", name: "Slack", description: "Notifications équipe", apiKey: "xoxb-•••••••••••••••", connected: false },
  { id: "sentry", name: "Sentry", description: "Monitoring erreurs", apiKey: "sntrys_•••••••••••••••", connected: true },
  { id: "mixpanel", name: "Mixpanel", description: "Analytique produit", apiKey: "mp_•••••••••••••••", connected: false },
];

type State = {
  items: Integration[];
  hydrated: boolean;
  toggle: (id: string) => void;
  setKey: (id: string, key: string) => void;
  reset: () => void;
};

export const useIntegrations = create<State>()(
  persist(
    (set, get) => ({
      items: SEED,
      hydrated: false,
      toggle: (id) =>
        set({ items: get().items.map((i) => (i.id === id ? { ...i, connected: !i.connected } : i)) }),
      setKey: (id, apiKey) =>
        set({ items: get().items.map((i) => (i.id === id ? { ...i, apiKey } : i)) }),
      reset: () => set({ items: SEED }),
    }),
    {
      name: "oc-admin-integrations",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (s) => {
        if (s) s.hydrated = true;
      },
    },
  ),
);
