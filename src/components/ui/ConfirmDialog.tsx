"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle } from "lucide-react";
import { create } from "zustand";

type ConfirmInput = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type ConfirmStore = {
  pending: (ConfirmInput & { resolve: (v: boolean) => void }) | null;
  ask: (input: ConfirmInput) => Promise<boolean>;
  resolve: (v: boolean) => void;
};

const useConfirmStore = create<ConfirmStore>((set, get) => ({
  pending: null,
  ask: (input) =>
    new Promise<boolean>((resolve) => {
      set({ pending: { ...input, resolve } });
    }),
  resolve: (v) => {
    const { pending } = get();
    if (pending) {
      pending.resolve(v);
      set({ pending: null });
    }
  },
}));

export function confirmAction(input: ConfirmInput): Promise<boolean> {
  return useConfirmStore.getState().ask(input);
}

export function ConfirmDialogHost() {
  const pending = useConfirmStore((s) => s.pending);
  const resolve = useConfirmStore((s) => s.resolve);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!pending) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") resolve(false);
      else if (e.key === "Enter") resolve(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pending, resolve]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {pending && (
        <>
          <motion.div
            className="fixed inset-0"
            style={{ background: "rgba(10,15,30,0.32)", zIndex: 80 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => resolve(false)}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={pending.title}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 4 }}
            transition={{ duration: 0.18 }}
            className="card"
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 420,
              maxWidth: "92vw",
              padding: 22,
              zIndex: 81,
            }}
          >
            <div className="row" style={{ alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: pending.destructive ? "rgba(239,65,53,0.12)" : "var(--primary-fixed)",
                  color: pending.destructive ? "var(--secondary)" : "var(--primary)",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 17 }}>{pending.title}</h2>
                <p style={{ marginTop: 6, fontSize: 13.5, color: "var(--text-secondary)" }}>
                  {pending.message}
                </p>
              </div>
            </div>
            <div className="row" style={{ justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <button className="btn ghost" onClick={() => resolve(false)}>
                {pending.cancelLabel ?? "Annuler"}
              </button>
              <button
                className={pending.destructive ? "btn danger" : "btn primary"}
                onClick={() => resolve(true)}
                autoFocus
              >
                {pending.confirmLabel ?? "Confirmer"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
