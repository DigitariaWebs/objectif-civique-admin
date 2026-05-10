"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  CheckCircle2,
  Edit,
  Eye,
  FileQuestion,
  FileText,
  MoreHorizontal,
  Plus,
  Save,
  Search,
  Trash2,
} from "lucide-react";

import { KpiCard } from "@/components/ui/KpiCard";
import { FilterChip } from "@/components/ui/FilterChip";
import { Drawer } from "@/components/ui/Drawer";
import { Pagination } from "@/components/ui/Pagination";
import { Checkbox } from "@/components/ui/Checkbox";
import { Th } from "@/components/ui/DataTableHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MarkdownEditor } from "@/components/ui/MarkdownEditor";
import { confirmAction } from "@/components/ui/ConfirmDialog";

import { useNotions } from "@/stores/useNotions";
import { THEMES, THEME_LABELS, type DetailedNotion, type Theme, type Visibility } from "@/types";
import { renderMarkdown } from "@/lib/markdown";
import { simulateVoid } from "@/lib/api";
import { cn } from "@/lib/utils";

type SortField = keyof DetailedNotion;
type Sort = { field: SortField; dir: "asc" | "desc" };

function emptyNotion(): DetailedNotion {
  return {
    id: `n_${Date.now().toString(36)}`,
    question: "",
    answer: "## Repère\n\n",
    theme: "institutions",
    subTheme: null,
    visibility: "draft",
    updatedAt: new Date().toISOString(),
  };
}

export default function NotionsPage() {
  const items = useNotions((s) => s.items);
  const upsert = useNotions((s) => s.upsert);
  const remove = useNotions((s) => s.remove);
  const bulkRemove = useNotions((s) => s.bulkRemove);
  const bulkUpdate = useNotions((s) => s.bulkUpdate);

  const sp = useSearchParams();
  const [search, setSearch] = useState("");
  const [themeFilter, setThemeFilter] = useState<"all" | Theme>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | Visibility>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sort, setSort] = useState<Sort>({ field: "updatedAt", dir: "desc" });
  const [bulk, setBulk] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<DetailedNotion | null>(null);

  useEffect(() => {
    if (sp.get("new") === "1") setSelected(emptyNotion());
  }, [sp]);

  const onSort = (f: SortField) =>
    setSort((s) => ({ field: f, dir: s.field === f ? (s.dir === "asc" ? "desc" : "asc") : "asc" }));

  const filtered = useMemo(() => {
    let r = items;
    if (search) r = r.filter((n) => n.question.toLowerCase().includes(search.toLowerCase()));
    if (themeFilter !== "all") r = r.filter((n) => n.theme === themeFilter);
    if (statusFilter !== "all") r = r.filter((n) => n.visibility === statusFilter);
    r = [...r].sort((a, b) => {
      const va = a[sort.field] as string;
      const vb = b[sort.field] as string;
      if (va < vb) return sort.dir === "asc" ? -1 : 1;
      if (va > vb) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
    return r;
  }, [items, search, themeFilter, statusFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => setPage(1), [search, themeFilter, statusFilter]);

  const totalSelected = Object.values(bulk).filter(Boolean).length;
  const drafts = items.filter((i) => i.visibility === "draft").length;

  async function handleDelete(id: string) {
    const ok = await confirmAction({
      title: "Supprimer la notion ?",
      message: "Action irréversible.",
      destructive: true,
      confirmLabel: "Supprimer",
    });
    if (!ok) return;
    await simulateVoid();
    remove(id);
    setSelected(null);
    toast.success("Notion supprimée");
  }

  async function handleSave(notion: DetailedNotion) {
    if (!notion.question.trim()) {
      toast.error("La question est requise");
      return;
    }
    await simulateVoid();
    upsert({ ...notion, updatedAt: new Date().toISOString() });
    toast.success("Notion enregistrée");
    setSelected(null);
  }

  async function handleBulk(action: "publish" | "unpublish" | "delete") {
    const ids = Object.entries(bulk).filter(([, v]) => v).map(([k]) => k);
    if (action === "delete") {
      const ok = await confirmAction({
        title: `Supprimer ${ids.length} notion${ids.length > 1 ? "s" : ""} ?`,
        message: "Action irréversible.",
        destructive: true,
      });
      if (!ok) return;
      await simulateVoid();
      bulkRemove(ids);
      toast.success("Notions supprimées");
    } else {
      await simulateVoid();
      bulkUpdate(ids, { visibility: action === "publish" ? "published" : "draft", updatedAt: new Date().toISOString() });
      toast.success("Notions mises à jour");
    }
    setBulk({});
  }

  return (
    <motion.div className="page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <div className="page-header">
        <div className="page-title-block">
          <h1>Notions détaillées</h1>
          <div className="page-subtitle">{items.length} notions · {drafts} brouillon{drafts > 1 ? "s" : ""}</div>
        </div>
        <div className="page-actions">
          <button className="btn primary" onClick={() => setSelected(emptyNotion())}>
            <Plus size={13} /> Nouvelle notion
          </button>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <KpiCard icon={FileQuestion} label="Total notions" value={items.length} />
        <KpiCard icon={CheckCircle2} label="Publiées" value={items.filter((i) => i.visibility === "published").length} />
        <KpiCard icon={FileText} label="Brouillons" value={drafts} />
        <KpiCard
          icon={Edit}
          label="Longueur moyenne"
          value={`${Math.round(items.reduce((s, n) => s + n.answer.length, 0) / Math.max(1, items.length))} car.`}
        />
      </div>

      <div className="data-table-wrap">
        <div className="data-table-toolbar">
          <div className="data-table-search">
            <Search size={14} className="icon" />
            <input
              placeholder="Rechercher une question…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="data-table-filters">
            <span className="muted tiny" style={{ marginRight: 4 }}>Thème</span>
            <FilterChip active={themeFilter === "all"} onClick={() => setThemeFilter("all")}>Tous</FilterChip>
            {THEMES.map((t) => (
              <FilterChip key={t} active={themeFilter === t} onClick={() => setThemeFilter(t)}>{THEME_LABELS[t]}</FilterChip>
            ))}
            <span className="muted tiny" style={{ margin: "0 4px 0 8px" }}>Statut</span>
            <FilterChip active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>Tous</FilterChip>
            <FilterChip active={statusFilter === "published"} onClick={() => setStatusFilter("published")}>Publiées</FilterChip>
            <FilterChip active={statusFilter === "draft"} onClick={() => setStatusFilter("draft")}>Brouillons</FilterChip>
          </div>
        </div>

        {totalSelected > 0 && (
          <div style={{ padding: "10px 16px", background: "rgba(0,85,164,0.04)", borderBottom: "1px solid var(--outline)", display: "flex", gap: 10, alignItems: "center" }}>
            <strong>{totalSelected} sélectionnée{totalSelected > 1 ? "s" : ""}</strong>
            <button className="btn sm secondary" onClick={() => handleBulk("publish")}>Publier</button>
            <button className="btn sm secondary" onClick={() => handleBulk("unpublish")}>Dépublier</button>
            <button className="btn sm danger" onClick={() => handleBulk("delete")}>
              <Trash2 size={12} /> Supprimer
            </button>
            <button className="btn sm ghost" style={{ marginLeft: "auto" }} onClick={() => setBulk({})}>Tout désélectionner</button>
          </div>
        )}

        <div className="scroll-x">
          <table className="data-table">
            <thead>
              <tr>
                <th className="checkbox-cell">
                  <Checkbox
                    checked={pageRows.length > 0 && pageRows.every((r) => bulk[r.id])}
                    onChange={(c) => {
                      const next = { ...bulk };
                      pageRows.forEach((r) => {
                        if (c) next[r.id] = true;
                        else delete next[r.id];
                      });
                      setBulk(next);
                    }}
                    ariaLabel="Tout sélectionner"
                  />
                </th>
                <Th field="question" sortField={sort.field} sortDir={sort.dir} onSort={onSort}>Question</Th>
                <Th field="theme" sortField={sort.field} sortDir={sort.dir} onSort={onSort}>Thème</Th>
                <th>Longueur réponse</th>
                <Th field="visibility" sortField={sort.field} sortDir={sort.dir} onSort={onSort}>Statut</Th>
                <Th field="updatedAt" sortField={sort.field} sortDir={sort.dir} onSort={onSort}>Maj le</Th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 60, textAlign: "center", color: "var(--text-tertiary)" }}>
                    Aucune notion ne correspond aux filtres.
                  </td>
                </tr>
              )}
              {pageRows.map((n) => (
                <tr key={n.id} className={cn(selected?.id === n.id && "selected")} onClick={() => setSelected(n)}>
                  <td className="checkbox-cell" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={!!bulk[n.id]}
                      onChange={(c) => setBulk({ ...bulk, [n.id]: c })}
                      ariaLabel={`Sélectionner ${n.question}`}
                    />
                  </td>
                  <td className="col-truncate" style={{ maxWidth: 420, fontWeight: 500 }}>{n.question}</td>
                  <td><span className="badge outline">{THEME_LABELS[n.theme]}</span></td>
                  <td className="muted" style={{ fontSize: 12, fontVariantNumeric: "tabular-nums" }}>{n.answer.length} car.</td>
                  <td>
                    {n.visibility === "published" ? (
                      <StatusBadge kind="success">Publiée</StatusBadge>
                    ) : (
                      <StatusBadge kind="warning">Brouillon</StatusBadge>
                    )}
                  </td>
                  <td className="muted" style={{ fontSize: 12 }}>{new Date(n.updatedAt).toLocaleDateString("fr-FR")}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button className="btn ghost sm" aria-label="Actions">
                      <MoreHorizontal size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={setPage}
          total={filtered.length}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
        />
      </div>

      <NotionDrawer notion={selected} onClose={() => setSelected(null)} onSave={handleSave} onDelete={handleDelete} />
    </motion.div>
  );
}

function NotionDrawer({
  notion,
  onClose,
  onSave,
  onDelete,
}: {
  notion: DetailedNotion | null;
  onClose: () => void;
  onSave: (n: DetailedNotion) => void;
  onDelete: (id: string) => void;
}) {
  const [draft, setDraft] = useState<DetailedNotion | null>(notion);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  useEffect(() => setDraft(notion), [notion]);
  if (!notion || !draft) return null;

  return (
    <Drawer
      open={!!notion}
      onClose={onClose}
      wide
      title={notion.question || "Nouvelle notion"}
      subtitle={`${THEME_LABELS[notion.theme]}${notion.subTheme ? ` · ${notion.subTheme}` : ""}`}
      footer={
        <>
          <span className="save-state" />
          <button className="btn danger" onClick={() => onDelete(notion.id)}>
            <Trash2 size={13} /> Supprimer
          </button>
          <button className="btn ghost" onClick={onClose}>Annuler</button>
          <button className="btn primary" onClick={() => onSave(draft)}>
            <Save size={13} /> Enregistrer
          </button>
        </>
      }
    >
      <div className="form-row">
        <label className="lbl">Question</label>
        <textarea
          value={draft.question}
          onChange={(e) => setDraft({ ...draft, question: e.target.value })}
          placeholder="Pourquoi… ?"
          style={{ minHeight: 60 }}
        />
      </div>
      <div className="form-row split">
        <div>
          <label className="lbl">Thème</label>
          <select value={draft.theme} onChange={(e) => setDraft({ ...draft, theme: e.target.value as Theme })}>
            {THEMES.map((t) => <option key={t} value={t}>{THEME_LABELS[t]}</option>)}
          </select>
        </div>
        <div>
          <label className="lbl">Sous-thème</label>
          <input
            type="text"
            value={draft.subTheme || ""}
            onChange={(e) => setDraft({ ...draft, subTheme: e.target.value || null })}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="row between" style={{ marginBottom: 6 }}>
          <label className="lbl" style={{ marginBottom: 0 }}>Réponse</label>
          <div className="segmented">
            <button type="button" className={cn(mode === "edit" && "active")} onClick={() => setMode("edit")}>
              <Edit size={11} /> Édition
            </button>
            <button type="button" className={cn(mode === "preview" && "active")} onClick={() => setMode("preview")}>
              <Eye size={11} /> Aperçu
            </button>
          </div>
        </div>
        {mode === "edit" ? (
          <textarea
            value={draft.answer}
            onChange={(e) => setDraft({ ...draft, answer: e.target.value })}
            style={{ minHeight: 320, fontFamily: "ui-monospace, monospace", fontSize: 13 }}
          />
        ) : (
          <div
            className="card card-pad"
            style={{ minHeight: 320, fontSize: 13.5, lineHeight: 1.65 }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(draft.answer) }}
          />
        )}
      </div>

      <div className="form-row">
        <label className="lbl">Visibilité</label>
        <div className="segmented">
          <button type="button" className={cn(draft.visibility === "draft" && "active")} onClick={() => setDraft({ ...draft, visibility: "draft" })}>
            Brouillon
          </button>
          <button type="button" className={cn(draft.visibility === "published" && "active")} onClick={() => setDraft({ ...draft, visibility: "published" })}>
            Publiée
          </button>
        </div>
      </div>
    </Drawer>
  );
}
