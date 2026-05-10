"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, BookOpen, FileQuestion, GraduationCap, Plus } from "lucide-react";
import { useFiches } from "@/stores/useFiches";
import { useNotions } from "@/stores/useNotions";
import { useCours } from "@/stores/useCours";

function lastUpdate(items: { updatedAt: string }[]): string {
  if (!items.length) return "—";
  const latest = items.reduce((a, b) => (a.updatedAt > b.updatedAt ? a : b));
  return new Date(latest.updatedAt).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function LibraryHub() {
  const fiches = useFiches((s) => s.items);
  const notions = useNotions((s) => s.items);
  const cours = useCours((s) => s.items);

  const cards = [
    {
      title: "Fiches de révision",
      description: "Mémos courts en bullet-points, par thème, à parcourir avant un quiz.",
      icon: BookOpen,
      href: "/library/fiches",
      newHref: "/library/fiches?new=1",
      count: fiches.length,
      published: fiches.filter((f) => f.visibility === "published").length,
      lastUpdate: lastUpdate(fiches),
    },
    {
      title: "Notions détaillées",
      description: "Réponses approfondies à des questions fréquentes du test civique.",
      icon: FileQuestion,
      href: "/library/notions",
      newHref: "/library/notions?new=1",
      count: notions.length,
      published: notions.filter((n) => n.visibility === "published").length,
      lastUpdate: lastUpdate(notions),
    },
    {
      title: "Cours pédagogiques",
      description: "Le livret du citoyen et les cours longs, découpés en chapitres.",
      icon: GraduationCap,
      href: "/library/cours",
      newHref: "/library/cours?new=1",
      count: cours.length,
      published: cours.filter((c) => c.visibility === "published").length,
      lastUpdate: lastUpdate(cours),
    },
  ];

  return (
    <motion.div
      className="page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="page-header">
        <div className="page-title-block">
          <h1>Bibliothèque</h1>
          <div className="page-subtitle">
            Trois sources de contenu structuré : fiches courtes, notions approfondies, cours longs.
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.title} className="card card-pad" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="row" style={{ alignItems: "flex-start", gap: 12 }}>
                <div className="kpi-icon" style={{ width: 40, height: 40 }}>
                  <Icon size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: 17 }}>{c.title}</h2>
                  <p className="muted" style={{ fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>{c.description}</p>
                </div>
              </div>
              <div className="row between" style={{ paddingTop: 8, borderTop: "1px solid var(--outline)" }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "Satoshi, sans-serif", color: "var(--tertiary)" }}>
                    {c.count}
                  </div>
                  <div className="tiny muted">{c.published} publiés · maj {c.lastUpdate}</div>
                </div>
                <div className="row" style={{ gap: 6 }}>
                  <Link href={c.newHref} className="btn outline sm">
                    <Plus size={12} /> Ajouter
                  </Link>
                  <Link href={c.href} className="btn primary sm">
                    Ouvrir <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
