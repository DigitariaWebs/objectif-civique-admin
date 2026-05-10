"use client";

import { create, type StateCreator } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type EntityStore<T extends { id: string }> = {
  items: T[];
  add: (item: T) => void;
  upsert: (item: T) => void;
  update: (id: string, patch: Partial<T>) => void;
  remove: (id: string) => void;
  bulkRemove: (ids: string[]) => void;
  bulkUpdate: (ids: string[], patch: Partial<T>) => void;
  reset: () => void;
  hydrated: boolean;
};

export function createEntityStore<T extends { id: string }>(
  storeName: string,
  seed: T[],
  extra?: (set: Parameters<StateCreator<EntityStore<T>>>[0], get: Parameters<StateCreator<EntityStore<T>>>[1]) => Record<string, unknown>,
) {
  return create<EntityStore<T> & Record<string, unknown>>()(
    persist(
      (set, get) => ({
        items: seed,
        hydrated: false,
        add: (item) => set({ items: [item, ...get().items] }),
        upsert: (item) => {
          const items = get().items;
          const idx = items.findIndex((i) => i.id === item.id);
          if (idx === -1) set({ items: [item, ...items] });
          else set({ items: items.map((i) => (i.id === item.id ? item : i)) });
        },
        update: (id, patch) =>
          set({ items: get().items.map((i) => (i.id === id ? { ...i, ...patch } : i)) }),
        remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
        bulkRemove: (ids) => set({ items: get().items.filter((i) => !ids.includes(i.id)) }),
        bulkUpdate: (ids, patch) =>
          set({
            items: get().items.map((i) => (ids.includes(i.id) ? { ...i, ...patch } : i)),
          }),
        reset: () => set({ items: seed }),
        ...(extra ? extra(set, get) : {}),
      }),
      {
        name: `oc-admin-${storeName}`,
        storage: createJSONStorage(() => localStorage),
        onRehydrateStorage: () => (state) => {
          if (state) state.hydrated = true;
        },
      },
    ),
  );
}
