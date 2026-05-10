"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";
import { BookOpen, CheckCircle2, Edit, FileText, MoreHorizontal, Plus, Save, Search, Trash2 } from "lucide-react";

import { KpiCard } from "@/components/ui/KpiCard";
import { FilterChip } from "@/components/ui/FilterChip";
import { Drawer } from "@/components/ui/Drawer";
import { Pagination } from "@/components/ui/Pagination";
import { Checkbox } from "@/components/ui/Checkbox";
import { Th } from "@/components/ui/DataTableHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MarkdownEditor } from "@/components/ui/MarkdownEditor";
import { confirmAction } from "@/components/ui/ConfirmDialog";

import { useFiches } from "@/stores/useFiches";
import { THEMES, THEME_LABELS, type RevisionFiche, type Theme, type Visibility } from "@/types";
import { renderMarkdown } from "@/lib/markdown";
import { simulateVoid } from "@/lib/api";
import { cn } from "@/lib/utils";

type SortField = keyof RevisionFiche;
type Sort = { field: SortField; dir: "asc" | "desc" };

function emptyFiche(): RevisionFiche {
  return {
    id: `f_${Date.now().toString(36)}`,
    title: "",
    content: "- ",
    theme: "institutions",
    subTheme: null,
    visibility: "draft",
    updatedAt: new Date().toISOString(),
  };
}

export default function FichesPage() {
  const items = useFiches((s) => s.items);
  const upsert = useFiches((s) => s.upsert);
  const remove = useFiches((s) => s.remove);
  const bulkRemove = useFiches((s) => s.bulkRemove);
  const bulkUpdate = useFiches((s) => s.bulkUpdate);

  const sp = useSearchParams();
  const [search, setSearch] = useState("");
  const [themeFilter, setThemeFilter] = useState<"all" | Theme>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | Visibility>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sort, setSort] = useState<Sort>({ field: "updatedAt", dir: "desc" });
  const [bulk, setBulk] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<RevisionFiche | null>(null);

  // Open new-drawer or focus row from query
  useEffect(() => {
    if (sp.get("new") === "1") setSelected(emptyFiche());
    const focus = sp.get("focus");
    if (focus) {
      const f = items.find((i) => i.id === focus);
      if (f) setSelected(f);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  const onSort = (f: SortField) =>
    setSort((s) => ({ field: f, dir: s.field === f ? (s.dir === "asc" ? "desc" : "asc") : "asc" }));

  const filtered = useMemo(() => {
    let r = items;
    if (search) r = r.filter((f) => f.title.toLowerCase().includes(search.toLowerCase()));
    if (themeFilter !== "all") r = r.filter((f) => f.theme === themeFilter);
    if (statusFilter !== "all") r = r.filter((f) => f.visibility === statusFilter);
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
  const byTheme = (t: Theme) => items.filter((i) => i.theme === t).length;

  async function handleDelete(id: string) {
    const ok = await confirmAction({
      title: "Supprimer la fiche ?",
      message: "La fiche disparaîtra immédiatement de l'application mobile.",
      destructive: true,
      confirmLabel: "Supprimer",
    });
    if (!ok) return;
    await simulateVoid();
    remove(id);
    setSelected(null);
    toast.success("Fiche supprimée");
  }

  async function handleSave(fiche: RevisionFiche) {
    if (!fiche.title.trim()) {
      toast.error("Le titre est requis");
      return;
    }
    await simulateVoid();
    upsert({ ...fiche, updatedAt: new Date().toISOString() });
    toast.success(fiche.visibility === "published" ? "Fiche publiée" : "Fiche enregistrée");
    setSelected(null);
  }

  async function handleBulk(action: "publish" | "unpublish" | "delete") {
    const ids = Object.entries(bulk).filter(([, v]) => v).map(([k]) => k);
    if (action === "delete") {
      const ok = await confirmAction({
        title: `Supprimer ${ids.length} fiche${ids.length > 1 ? "s" : ""} ?`,
        message: "Action irréversible.",
        destructive: true,
        confirmLabel: "Supprimer",
      });
      if (!ok) return;
      await simulateVoid();
      bulkRemove(ids);
      toast.success(`${ids.length} fiche${ids.length > 1 ? "s" : ""} supprimée${ids.length > 1 ? "s" : ""}`);
    } else {
      await simulateVoid();
      bulkUpdate(ids, { visibility: action === "publish" ? "published" : "draft", updatedAt: new Date().toISOString() });
      toast.success(`${ids.length} fiche${ids.length > 1 ? "s" : ""} mise${ids.length > 1 ? "s" : ""} à jour`);
    }
    setBulk({});
  }

  return (
    <motion.div className="page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <div className="page-header">
        <div className="page-title-block">
          <h1>Fiches de révision</h1>
          <div className="page-subtitle">
            {items.length} fiches · {drafts} brouillon{drafts > 1 ? "s" : ""} · 5 thèmes
          </div>
        </div>
        <div className="page-actions">
          <button className="btn primary" onClick={() => setSelected(emptyFiche())}>
            <Plus size={13} /> Nouvelle fiche
          </button>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <KpiCard icon={BookOpen} label="Total fiches" value={items.length} />
        <KpiCard icon={CheckCircle2} label="Publiées" value={items.filter((i) => i.visibility === "published").length} />
        <KpiCard icon={FileText} label="Brouillons" value={drafts} />
        <KpiCard icon={Edit} label="Thèmes couverts" value={new Set(items.map((i) => i.theme)).size} />
      </div>

      <div className="row wrap" style={{ gap: 6, marginBottom: 12 }}>
        <span className="muted tiny" style={{ marginRight: 4 }}>Répartition par thème</span>
        {THEMES.map((t) => (
          <FilterChip
            key={t}
            active={themeFilter === t}
            onClick={() => setThemeFilter(themeFilter === t ? "all" : t)}
          >
            {THEME_LABELS[t]} · {byTheme(t)}
          </FilterChip>
        ))}
      </div>

      <div className="data-table-wrap">
        <div className="data-table-toolbar">
          <div className="data-table-search">
            <Search size={14} className="icon" />
            <input
              placeholder="Rechercher par titre…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="data-table-filters">
            <span className="muted tiny" style={{ marginRight: 4 }}>Statut</span>
            <FilterChip active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>Tous</FilterChip>
            <FilterChip active={statusFilter === "published"} onClick={() => setStatusFilter("published")}>Publiés</FilterChip>
            <FilterChip active={statusFilter === "draft"} onClick={() => setStatusFilter("draft")}>Brouillons</FilterChip>
          </div>
        </div>

        {totalSelected > 0 && (
          <div
            style={{
              padding: "10px 16px",
              background: "rgba(0,85,164,0.04)",
              borderBottom: "1px solid var(--outline)",
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
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
                <Th field="title" sortField={sort.field} sortDir={sort.dir} onSort={onSort}>Titre</Th>
                <Th field="theme" sortField={sort.field} sortDir={sort.dir} onSort={onSort}>Thème</Th>
                <th>Sous-thème</th>
                <th>Longueur</th>
                <Th field="visibility" sortField={sort.field} sortDir={sort.dir} onSort={onSort}>Statut</Th>
                <Th field="updatedAt" sortField={sort.field} sortDir={sort.dir} onSort={onSort}>Maj le</Th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: 60, textAlign: "center", color: "var(--text-tertiary)" }}>
                    Aucune fiche ne correspond aux filtres.
                  </td>
                </tr>
              )}
              {pageRows.map((f) => (
                <tr key={f.id} className={cn(selected?.id === f.id && "selected")} onClick={() => setSelected(f)}>
                  <td className="checkbox-cell" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={!!bulk[f.id]}
                      onChange={(c) => setBulk({ ...bulk, [f.id]: c })}
                      ariaLabel={`Sélectionner ${f.title}`}
                    />
                  </td>
                  <td style={{ fontWeight: 500 }}>{f.title}</td>
                  <td><span className="badge outline">{THEME_LABELS[f.theme]}</span></td>
                  <td className="muted" style={{ fontSize: 12 }}>{f.subTheme || "—"}</td>
                  <td className="muted" style={{ fontSize: 12, fontVariantNumeric: "tabular-nums" }}>
                    {f.content.length} car.
                  </td>
                  <td>
                    {f.visibility === "published" ? (
                      <StatusBadge kind="success">Publiée</StatusBadge>
                    ) : (
                      <StatusBadge kind="warning">Brouillon</StatusBadge>
                    )}
                  </td>
                  <td className="muted" style={{ fontSize: 12 }}>
                    {new Date(f.updatedAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button className="btn ghost sm" aria-label="Actions" onClick={() => setSelected(f)}>
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

      <FicheDrawer fiche={selected} onClose={() => setSelected(null)} onSave={handleSave} onDelete={handleDelete} />
    </motion.div>
  );
}

function FicheDrawer({
  fiche,
  onClose,
  onSave,
  onDelete,
}: {
  fiche: RevisionFiche | null;
  onClose: () => void;
  onSave: (f: RevisionFiche) => void;
  onDelete: (id: string) => void;
}) {
  const [draft, setDraft] = useState<RevisionFiche | null>(fiche);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => setDraft(fiche), [fiche]);

  // auto-save brouillon to localStorage every ~10s while editing
  useEffect(() => {
    if (!draft) return;
    const key = `oc-admin-draft-fiche-${draft.id}`;
    const t = setInterval(() => {
      try {
        localStorage.setItem(key, JSON.stringify(draft));
        setSavedAt(Date.now());
      } catch { /* ignore quota */ }
    }, 10000);
    return () => clearInterval(t);
  }, [draft]);

  if (!fiche || !draft) return null;

  const handleClose = async () => {
    if (JSON.stringify(draft) !== JSON.stringify(fiche)) {
      const ok = await confirmAction({
        title: "Modifications non enregistrées",
        message: "Voulez-vous fermer sans enregistrer ?",
        destructive: true,
        confirmLabel: "Fermer sans enregistrer",
      });
      if (!ok) return;
    }
    onClose();
  };

  return (
    <Drawer
      open={!!fiche}
      onClose={handleClose}
      wide
      title={fiche.title || "Nouvelle fiche"}
      subtitle={`${THEME_LABELS[fiche.theme]}${fiche.subTheme ? ` · ${fiche.subTheme}` : ""}`}
      footer={
        <>
          <span className="save-state">
            {savedAt
              ? `Brouillon enregistré il y a ${Math.round((Date.now() - savedAt) / 1000)} s`
              : "Modifications non enregistrées"}
          </span>
          {fiche.id.startsWith("f_") && fiche.title ? (
            <button className="btn danger" onClick={() => onDelete(fiche.id)}>
              <Trash2 size={13} /> Supprimer
            </button>
          ) : null}
          <button className="btn ghost" onClick={handleClose}>Annuler</button>
          <button className="btn primary" onClick={() => onSave(draft)}>
            <Save size={13} /> Enregistrer
          </button>
        </>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 22, alignItems: "flex-start" }}>
        <div>
          <div className="form-row">
            <label className="lbl">Titre</label>
            <input
              type="text"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Ex. Les institutions de la Ve République"
            />
          </div>
          <div className="form-row split">
            <div>
              <label className="lbl">Thème</label>
              <select
                value={draft.theme}
                onChange={(e) => setDraft({ ...draft, theme: e.target.value as Theme })}
              >
                {THEMES.map((t) => (
                  <option key={t} value={t}>{THEME_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="lbl">Sous-thème</label>
              <input
                type="text"
                value={draft.subTheme || ""}
                onChange={(e) => setDraft({ ...draft, subTheme: e.target.value || null })}
                placeholder="Optionnel"
              />
            </div>
          </div>
          <div className="form-row">
            <label className="lbl">Contenu</label>
            <MarkdownEditor value={draft.content} onChange={(v) => setDraft({ ...draft, content: v })} height={420} />
          </div>
          <div className="form-row">
            <label className="lbl">Visibilité</label>
            <div className="segmented">
              <button
                type="button"
                className={cn(draft.visibility === "draft" && "active")}
                onClick={() => setDraft({ ...draft, visibility: "draft" })}
              >
                Brouillon
              </button>
              <button
                type="button"
                className={cn(draft.visibility === "published" && "active")}
                onClick={() => setDraft({ ...draft, visibility: "published" })}
              >
                Publiée
              </button>
            </div>
          </div>
        </div>

        <div style={{ position: "sticky", top: 0 }}>
          <div className="muted tiny" style={{ marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
            Aperçu mobile
          </div>
          <div
            className="card"
            style={{
              padding: 16,
              background: "white",
              borderRadius: 18,
              minHeight: 280,
            }}
          >
            <div className="row" style={{ gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
              <span className="badge info" style={{ fontSize: 10 }}>{THEME_LABELS[draft.theme]}</span>
              {draft.subTheme && <span className="badge neutral" style={{ fontSize: 10 }}>{draft.subTheme}</span>}
            </div>
            <h3 style={{ fontSize: 15, marginBottom: 10 }}>{draft.title || "Titre de la fiche"}</h3>
            <div
              style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--text-secondary)" }}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(draft.content) }}
            />
          </div>
        </div>
      </div>
    </Drawer>
  );
}
