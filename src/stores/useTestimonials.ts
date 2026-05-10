"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { SEED_TESTIMONIALS } from "@/data/testimonials";
import type { Testimonial } from "@/types";

type TestimonialsState = {
  items: Testimonial[];
  hydrated: boolean;
  add: (t: Testimonial) => void;
  upsert: (t: Testimonial) => void;
  update: (id: string, patch: Partial<Testimonial>) => void;
  remove: (id: string) => void;
  setFeatured: (id: string) => void;
  reset: () => void;
};

export const useTestimonials = create<TestimonialsState>()(
  persist(
    (set, get) => ({
      items: SEED_TESTIMONIALS,
      hydrated: false,
      add: (t) => set({ items: [t, ...get().items] }),
      upsert: (t) => {
        const items = get().items;
        const idx = items.findIndex((i) => i.id === t.id);
        if (idx === -1) set({ items: [t, ...items] });
        else set({ items: items.map((i) => (i.id === t.id ? t : i)) });
      },
      update: (id, patch) => set({ items: get().items.map((i) => (i.id === id ? { ...i, ...patch } : i)) }),
      remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      setFeatured: (id) =>
        set({
          items: get().items.map((i) => ({ ...i, featured: i.id === id })),
        }),
      reset: () => set({ items: SEED_TESTIMONIALS }),
    }),
    {
      name: "oc-admin-testimonials",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (s) => {
        if (s) s.hydrated = true;
      },
    },
  ),
);
