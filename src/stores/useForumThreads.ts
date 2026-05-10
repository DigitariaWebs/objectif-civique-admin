"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { SEED_REPORTS, SEED_THREADS } from "@/data/forum";
import type { ForumReport, ForumThread } from "@/types";

type ForumState = {
  threads: ForumThread[];
  reports: ForumReport[];
  hydrated: boolean;
  // thread mutations
  addThread: (t: ForumThread) => void;
  updateThread: (id: string, patch: Partial<ForumThread>) => void;
  removeThread: (id: string) => void;
  togglePin: (id: string) => void;
  toggleLock: (id: string) => void;
  // reply mutations
  addReply: (threadId: string, reply: ForumThread["replies"][number]) => void;
  updateReply: (threadId: string, replyId: string, patch: Partial<ForumThread["replies"][number]>) => void;
  removeReply: (threadId: string, replyId: string) => void;
  hideReply: (threadId: string, replyId: string, hidden: boolean) => void;
  // reports
  resolveReport: (id: string) => void;
  reset: () => void;
};

export const useForumThreads = create<ForumState>()(
  persist(
    (set, get) => ({
      threads: SEED_THREADS,
      reports: SEED_REPORTS,
      hydrated: false,
      addThread: (t) => set({ threads: [t, ...get().threads] }),
      updateThread: (id, patch) =>
        set({ threads: get().threads.map((t) => (t.id === id ? { ...t, ...patch } : t)) }),
      removeThread: (id) =>
        set({
          threads: get().threads.filter((t) => t.id !== id),
          reports: get().reports.filter((r) => r.threadId !== id),
        }),
      togglePin: (id) =>
        set({ threads: get().threads.map((t) => (t.id === id ? { ...t, pinned: !t.pinned } : t)) }),
      toggleLock: (id) =>
        set({ threads: get().threads.map((t) => (t.id === id ? { ...t, locked: !t.locked } : t)) }),
      addReply: (threadId, reply) =>
        set({
          threads: get().threads.map((t) =>
            t.id === threadId ? { ...t, replies: [...t.replies, reply] } : t,
          ),
        }),
      updateReply: (threadId, replyId, patch) =>
        set({
          threads: get().threads.map((t) =>
            t.id === threadId
              ? { ...t, replies: t.replies.map((r) => (r.id === replyId ? { ...r, ...patch } : r)) }
              : t,
          ),
        }),
      removeReply: (threadId, replyId) =>
        set({
          threads: get().threads.map((t) =>
            t.id === threadId ? { ...t, replies: t.replies.filter((r) => r.id !== replyId) } : t,
          ),
          reports: get().reports.filter((r) => r.replyId !== replyId),
        }),
      hideReply: (threadId, replyId, hidden) =>
        set({
          threads: get().threads.map((t) =>
            t.id === threadId
              ? { ...t, replies: t.replies.map((r) => (r.id === replyId ? { ...r, hidden } : r)) }
              : t,
          ),
        }),
      resolveReport: (id) =>
        set({ reports: get().reports.map((r) => (r.id === id ? { ...r, status: "resolved" } : r)) }),
      reset: () => set({ threads: SEED_THREADS, reports: SEED_REPORTS }),
    }),
    {
      name: "oc-admin-forum",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
