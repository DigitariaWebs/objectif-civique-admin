"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Eye,
  GraduationCap,
  Plus,
  Save,
  Search,
  Trash2,
} from "lucide-react";

import { MarkdownEditor } from "@/components/ui/MarkdownEditor";
import { confirmAction } from "@/components/ui/ConfirmDialog";
import { useCours } from "@/stores/useCours";
import { THEMES, THEME_LABELS, type CoursLesson, type Theme, type Visibility } from "@/types";
import { renderMarkdown } from "@/lib/markdown";
import { simulateVoid } from "@/lib/api";
import { cn } from "@/lib/utils";

function emptyCours(bucket: "livret" | "cours"): CoursLesson {
  return {
    id: `c_${bucket[0]}_${Date.now().toString(36)}`,
    title: bucket === "livret" ? "Nouveau chapitre du livret" : "Nouveau cours",
    source: "",
    bucket,
    theme: null,
    body: "# Nouveau\n\nÉcrivez ici…",
    parentId: null,
    order: 999,
    visibility: "draft",
    updatedAt: new Date().toISOString(),
  };
}

export default function CoursPage() {
  const items = useCours((s) => s.items);
  const upsert = useCours((s) => s.upsert);
  const remove = useCours((s) => s.remove);
  const update = useCours((s) => s.update);

  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);
  const active = items.find((c) => c.id === activeId) ?? null;
  const [draft, setDraft] = useState<CoursLesson | null>(active);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setDraft(active);
  }, [active?.id]);

  const tree = useMemo(() => {
    const filtered = search
      ? items.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()))
      : items;
    const groups: Record<"livret" | "cours", Record<string, CoursLesson[]>> = {
      livret: {},
      cours: {},
    };
    for (const item of filtered) {
      const themeKey = item.theme ?? "autres";
      if (!groups[item.bucket][themeKey]) groups[item.bucket][themeKey] = [];
      groups[item.bucket][themeKey]!.push(item);
    }
    for (const bucket of Object.values(groups)) {
      for (const k of Object.keys(bucket)) {
        bucket[k]!.sort((a, b) => a.order - b.order);
      }
    }
    return groups;
  }, [items, search]);

  function reorder(item: CoursLesson, dir: -1 | 1) {
    const siblings = items
      .filter((i) => i.bucket === item.bucket && i.theme === item.theme)
      .sort((a, b) => a.order - b.order);
    const idx = siblings.findIndex((s) => s.id === item.id);
    const swap = siblings[idx + dir];
    if (!swap) return;
    update(item.id, { order: swap.order });
    update(swap.id, { order: item.order });
    toast.success("Ordre mis à jour");
  }

  async function handleDelete(id: string) {
    const ok = await confirmAction({
      title: "Supprimer ce cours ?",
      message: "Action irréversible.",
      destructive: true,
    });
    if (!ok) return;
    await simulateVoid();
    remove(id);
    setActiveId(items.find((c) => c.id !== id)?.id ?? null);
    toast.success("Cours supprimé");
  }

  async function handleSave() {
    if (!draft) return;
    if (!draft.title.trim()) {
      toast.error("Le titre est requis");
      return;
    }
    await simulateVoid();
    upsert({ ...draft, updatedAt: new Date().toISOString() });
    toast.success("Cours enregistré");
  }

  function createNew(bucket: "livret" | "cours") {
    const next = emptyCours(bucket);
    upsert(next);
    setActiveId(next.id);
    toast.success(bucket === "livret" ? "Chapitre créé" : "Cours créé");
  }

  return (
    <motion.div
      className="page"
      style={{ paddingBottom: 0 }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="page-header">
        <div className="page-title-block">
          <h1>Cours pédagogiques</h1>
          <div className="page-subtitle">Le livret du citoyen et les cours longs.</div>
        </div>
        <div className="page-actions">
          <button className="btn outline" onClick={() => createNew("livret")}>
            <Plus size={13} /> Nouveau chapitre (livret)
          </button>
          <button className="btn primary" onClick={() => createNew("cours")}>
            <Plus size={13} /> Nouveau cours
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 14, alignItems: "flex-start" }}>
        <div className="card" style={{ padding: 12, position: "sticky", top: 80, maxHeight: "calc(100vh - 100px)", overflowY: "auto" }}>
          <div className="data-table-search" style={{ marginBottom: 10 }}>
            <Search size={14} className="icon" />
            <input
              placeholder="Rechercher un cours…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {(["livret", "cours"] as const).map((bucket) => {
            const groups = tree[bucket];
            const Icon = bucket === "livret" ? BookOpen : GraduationCap;
            return (
              <div key={bucket} style={{ marginBottom: 16 }}>
                <div className="row" style={{ gap: 6, padding: "6px 8px", color: "var(--text-secondary)", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  <Icon size={13} />
                  {bucket === "livret" ? "Livret du citoyen" : "Cours longs"}
                </div>
                {Object.entries(groups).map(([themeKey, lessons]) => (
                  <div key={themeKey} style={{ marginBottom: 8 }}>
                    <div className="tiny muted" style={{ padding: "4px 8px", fontWeight: 500 }}>
                      {themeKey === "autres" ? "Sans thème" : THEME_LABELS[themeKey as Theme]}
                    </div>
                    {lessons.map((c, i) => (
                      <div
                        key={c.id}
                        className={cn(
                          "row",
                          activeId === c.id && "selected",
                        )}
                        style={{
                          gap: 6,
                          padding: "6px 8px",
                          borderRadius: 8,
                          cursor: "pointer",
                          background: activeId === c.id ? "rgba(0,85,164,0.06)" : "transparent",
                        }}
                        onClick={() => setActiveId(c.id)}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12.5, fontWeight: 500, color: c.visibility === "draft" ? "var(--text-tertiary)" : "var(--on-surface)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {c.title}
                          </div>
                        </div>
                        <button
                          className="btn ghost sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            reorder(c, -1);
                          }}
                          disabled={i === 0}
                          aria-label="Monter"
                          style={{ padding: 4 }}
                        >
                          <ArrowUp size={11} />
                        </button>
                        <button
                          className="btn ghost sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            reorder(c, 1);
                          }}
                          disabled={i === lessons.length - 1}
                          aria-label="Descendre"
                          style={{ padding: 4 }}
                        >
                          <ArrowDown size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        <div>
          {!draft ? (
            <div className="card" style={{ padding: 60, textAlign: "center", color: "var(--text-tertiary)" }}>
              Sélectionnez un cours dans l&apos;arborescence à gauche.
            </div>
          ) : (
            <div className="card" style={{ padding: 20 }}>
              <div className="row between" style={{ marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <div className="muted tiny" style={{ marginBottom: 4 }}>
                    {draft.bucket === "livret" ? "Livret" : "Cours"} · {draft.source || "sans source"}
                  </div>
                  <input
                    type="text"
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    style={{
                      width: "100%",
                      border: "none",
                      padding: 0,
                      fontFamily: "Satoshi, sans-serif",
                      fontSize: 22,
                      fontWeight: 700,
                      color: "var(--tertiary)",
                      letterSpacing: "-0.02em",
                    }}
                  />
                </div>
                <div className="row" style={{ gap: 6 }}>
                  <button className="btn outline" onClick={() => setShowPreview((v) => !v)}>
                    <Eye size={13} /> {showPreview ? "Masquer aperçu" : "Aperçu"}
                  </button>
                  <button className="btn danger" onClick={() => handleDelete(draft.id)}>
                    <Trash2 size={13} />
                  </button>
                  <button className="btn primary" onClick={handleSave}>
                    <Save size={13} /> Enregistrer
                  </button>
                </div>
              </div>

              <div className="form-row split" style={{ gap: 12 }}>
                <div>
                  <label className="lbl">Thème</label>
                  <select
                    value={draft.theme ?? ""}
                    onChange={(e) => setDraft({ ...draft, theme: (e.target.value || null) as Theme | null })}
                  >
                    <option value="">— Sans thème</option>
                    {THEMES.map((t) => (
                      <option key={t} value={t}>{THEME_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="lbl">Visibilité</label>
                  <div className="segmented">
                    <button
                      type="button"
                      className={cn(draft.visibility === "draft" && "active")}
                      onClick={() => setDraft({ ...draft, visibility: "draft" as Visibility })}
                    >
                      Brouillon
                    </button>
                    <button
                      type="button"
                      className={cn(draft.visibility === "published" && "active")}
                      onClick={() => setDraft({ ...draft, visibility: "published" as Visibility })}
                    >
                      Publié
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <label className="lbl">Contenu</label>
                <MarkdownEditor value={draft.body} onChange={(v) => setDraft({ ...draft, body: v })} height={460} />
              </div>

              {showPreview && (
                <div className="card card-pad" style={{ marginTop: 16, background: "var(--surface)" }}>
                  <div className="muted tiny" style={{ marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                    Aperçu mobile
                  </div>
                  <div
                    style={{ fontSize: 14, lineHeight: 1.65 }}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(draft.body) }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
