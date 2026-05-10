"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Command } from "cmdk";
import { Search } from "lucide-react";
import { create } from "zustand";

import { STATIC_COMMANDS, type Command as Cmd } from "@/lib/commandRegistry";
import { useForumThreads } from "@/stores/useForumThreads";
import { useTestimonials } from "@/stores/useTestimonials";
import { useFiches } from "@/stores/useFiches";

type PaletteState = {
  open: boolean;
  setOpen: (v: boolean) => void;
};
export const usePalette = create<PaletteState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));

export function CommandPaletteHost() {
  const router = useRouter();
  const open = usePalette((s) => s.open);
  const setOpen = usePalette((s) => s.setOpen);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  // Dynamic entries from stores
  const threads = useForumThreads((s) => s.threads);
  const testimonials = useTestimonials((s) => s.items);
  const fiches = useFiches((s) => s.items);

  const dynamicCommands = useMemo<Cmd[]>(() => {
    return [
      ...threads.slice(0, 8).map<Cmd>((t) => ({
        id: `thread-${t.id}`,
        label: `Thread · ${t.title}`,
        hint: t.author,
        section: "Recherche",
        icon: STATIC_COMMANDS[12]!.icon,
        href: `/forum/${t.id}`,
      })),
      ...testimonials.slice(0, 8).map<Cmd>((t) => ({
        id: `testimonial-${t.id}`,
        label: `Témoignage · ${t.name}`,
        hint: t.origin,
        section: "Recherche",
        icon: STATIC_COMMANDS[14]!.icon,
        href: `/testimonials?focus=${t.id}`,
      })),
      ...fiches.slice(0, 8).map<Cmd>((f) => ({
        id: `fiche-${f.id}`,
        label: `Fiche · ${f.title}`,
        hint: f.theme,
        section: "Recherche",
        icon: STATIC_COMMANDS[8]!.icon,
        href: `/library/fiches?focus=${f.id}`,
      })),
    ];
  }, [threads, testimonials, fiches]);

  const allCommands = useMemo(() => [...STATIC_COMMANDS, ...dynamicCommands], [dynamicCommands]);
  const grouped = useMemo(() => {
    const map = new Map<string, Cmd[]>();
    for (const c of allCommands) {
      if (!map.has(c.section)) map.set(c.section, []);
      map.get(c.section)!.push(c);
    }
    return Array.from(map.entries());
  }, [allCommands]);

  if (!mounted) return null;

  function run(cmd: Cmd) {
    setOpen(false);
    setSearch("");
    if (cmd.href) router.push(cmd.href);
    else if (cmd.run) cmd.run({ push: (h) => router.push(h) });
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0"
            style={{ background: "rgba(10,15,30,0.32)", zIndex: 70 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            style={{
              position: "fixed",
              top: "12vh",
              left: "50%",
              transform: "translateX(-50%)",
              width: 640,
              maxWidth: "92vw",
              zIndex: 71,
              background: "white",
              borderRadius: 16,
              boxShadow: "0 24px 80px rgba(10,15,30,0.18)",
              overflow: "hidden",
              border: "1px solid var(--outline)",
            }}
          >
            <Command label="Palette de commandes">
              <div
                className="row"
                style={{
                  gap: 10,
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--outline)",
                }}
              >
                <Search size={16} color="var(--text-tertiary)" />
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Rechercher une page, créer un contenu, exécuter une action…"
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    fontSize: 14,
                    background: "transparent",
                  }}
                  autoFocus
                />
                <span className="kbd" style={{ fontSize: 10, color: "var(--text-tertiary)", background: "var(--surface-low)", border: "1px solid var(--outline)", padding: "2px 6px", borderRadius: 5 }}>
                  Échap
                </span>
              </div>
              <Command.List style={{ maxHeight: 420, overflowY: "auto", padding: 8 }}>
                <Command.Empty style={{ padding: 24, textAlign: "center", color: "var(--text-tertiary)", fontSize: 13 }}>
                  Aucun résultat.
                </Command.Empty>
                {grouped.map(([section, commands]) => (
                  <Command.Group
                    key={section}
                    heading={section}
                    style={{
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--text-tertiary)",
                      padding: "8px 8px 4px",
                    }}
                  >
                    {commands.map((c) => {
                      const Icon = c.icon;
                      return (
                        <Command.Item
                          key={c.id}
                          value={`${c.label} ${c.hint ?? ""}`}
                          onSelect={() => run(c)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "8px 10px",
                            borderRadius: 8,
                            fontSize: 13.5,
                            cursor: "pointer",
                          }}
                        >
                          <Icon size={14} />
                          <span style={{ flex: 1 }}>{c.label}</span>
                          {c.hint && <span className="muted tiny">{c.hint}</span>}
                        </Command.Item>
                      );
                    })}
                  </Command.Group>
                ))}
              </Command.List>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
