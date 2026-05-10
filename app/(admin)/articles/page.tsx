"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Award,
  Check,
  Edit,
  Eye,
  FileText,
  Image as ImageIcon,
  MoreHorizontal,
  Plus,
  Rss,
  Search,
  Send,
} from "lucide-react";

import { KpiCard } from "@/components/ui/KpiCard";
import { FilterChip } from "@/components/ui/FilterChip";
import { Drawer } from "@/components/ui/Drawer";
import { Pagination } from "@/components/ui/Pagination";
import { Th } from "@/components/ui/DataTableHeader";
import { MarkdownEditor } from "@/components/ui/MarkdownEditor";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ARTICLES } from "@/data/articles";
import {
  ARTICLE_CATS,
  ARTICLE_CAT_LABELS,
  type Article,
  type ArticleCategory,
  type ArticleStatus,
} from "@/types";
import { cn } from "@/lib/utils";

type EditingArticle = Article & { body: string };
type SortField = keyof Article;
type Sort = { field: SortField; dir: "asc" | "desc" };

const SAMPLE_ARTICLE_BODY = `# Loi immigration 2025 : ce qui change pour les candidats à la naturalisation

La loi du **26 janvier 2024**, dite *loi pour contrôler l'immigration et améliorer l'intégration*, modifie en profondeur le parcours de naturalisation. Voici les points à retenir.

## Niveau de langue rehaussé

Le niveau **B1** devient le **nouveau seuil minimum** pour toute demande de naturalisation. Auparavant, le niveau A2 suffisait dans certains cas dérogatoires.

> Cette exigence prend effet pour toute demande déposée à compter du 1er janvier 2026.

## Test civique obligatoire

Le test civique devient **obligatoire** pour :

- Les candidats à la naturalisation par décret
- Les demandeurs de carte de résident de 10 ans
- Les demandeurs de carte de séjour pluriannuelle

## Conditions de stabilité

Le candidat doit prouver une **résidence régulière de 5 ans** en France et démontrer son **assimilation à la communauté française**.

## Sources

- [Légifrance — Loi 2024-42](https://legifrance.gouv.fr)
- [Service-Public.fr](https://service-public.fr)
`;

export default function ArticlesPage() {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<"all" | ArticleCategory>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ArticleStatus>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sort, setSort] = useState<Sort>({ field: "publishedAt", dir: "desc" });
  const [selected, setSelected] = useState<EditingArticle | null>(null);

  const onSort = (f: SortField) =>
    setSort((s) => ({ field: f, dir: s.field === f ? (s.dir === "asc" ? "desc" : "asc") : "asc" }));

  const filtered = useMemo(() => {
    let r = ARTICLES;
    if (search) r = r.filter((a) => a.title.toLowerCase().includes(search.toLowerCase()));
    if (catFilter !== "all") r = r.filter((a) => a.category === catFilter);
    if (statusFilter !== "all") r = r.filter((a) => a.status === statusFilter);
    r = [...r].sort((a, b) => {
      const va = a[sort.field] as string | number;
      const vb = b[sort.field] as string | number;
      if (va < vb) return sort.dir === "asc" ? -1 : 1;
      if (va > vb) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
    return r;
  }, [search, catFilter, statusFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => {
    setPage(1);
  }, [search, catFilter, statusFilter]);

  const startNew = () => {
    setSelected({
      id: "new",
      title: "",
      category: "naturalisation",
      excerpt: "",
      publishedAt: new Date().toISOString().slice(0, 10),
      source: "",
      views: 0,
      status: "draft",
      author: "Camille L.",
      body: "# Nouvel article\n\nÉcrivez ici…",
    });
  };

  return (
    <motion.div
      className="page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="page-header">
        <div className="page-title-block">
          <h1>Articles &amp; actualités</h1>
          <div className="page-subtitle">
            {ARTICLES.length} articles · {ARTICLES.filter((a) => a.status === "published").length} publiés ·{" "}
            {ARTICLES.filter((a) => a.status === "draft").length} brouillons
          </div>
        </div>
        <div className="page-actions">
          <button className="btn outline">
            <Rss size={13} /> Flux RSS
          </button>
          <button className="btn primary" onClick={startNew}>
            <Plus size={13} /> Nouvel article
          </button>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <KpiCard
          icon={FileText}
          label="Articles publiés"
          value={ARTICLES.filter((a) => a.status === "published").length}
          trend={4.2}
        />
        <KpiCard
          icon={Eye}
          label="Vues totales (30j)"
          value={ARTICLES.reduce((s, a) => s + a.views, 0).toLocaleString("fr-FR")}
          trend={12.4}
        />
        <KpiCard icon={Edit} label="Brouillons en cours" value={ARTICLES.filter((a) => a.status === "draft").length} />
        <KpiCard
          icon={Award}
          label="Article le plus lu"
          value={Math.max(...ARTICLES.map((a) => a.views)).toLocaleString("fr-FR")}
          trendLabel="vues"
        />
      </div>

      <div className="data-table-wrap">
        <div className="data-table-toolbar">
          <div className="data-table-search">
            <Search size={14} className="icon" />
            <input
              placeholder="Rechercher un titre…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="data-table-filters">
            <span className="muted tiny" style={{ marginRight: 4 }}>Catégorie</span>
            <FilterChip active={catFilter === "all"} onClick={() => setCatFilter("all")}>Toutes</FilterChip>
            {ARTICLE_CATS.map((c) => (
              <FilterChip key={c} active={catFilter === c} onClick={() => setCatFilter(c)}>
                {ARTICLE_CAT_LABELS[c]}
              </FilterChip>
            ))}
            <span className="muted tiny" style={{ margin: "0 4px 0 8px" }}>Statut</span>
            <FilterChip active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>Tous</FilterChip>
            <FilterChip active={statusFilter === "published"} onClick={() => setStatusFilter("published")}>Publiés</FilterChip>
            <FilterChip active={statusFilter === "draft"} onClick={() => setStatusFilter("draft")}>Brouillons</FilterChip>
          </div>
        </div>

        <div className="scroll-x">
          <table className="data-table">
            <thead>
              <tr>
                <Th field="title" sortField={sort.field} sortDir={sort.dir} onSort={onSort}>Titre</Th>
                <Th field="category" sortField={sort.field} sortDir={sort.dir} onSort={onSort}>Catégorie</Th>
                <Th field="publishedAt" sortField={sort.field} sortDir={sort.dir} onSort={onSort}>Publié le</Th>
                <th>Auteur</th>
                <th>Source</th>
                <Th field="views" sortField={sort.field} sortDir={sort.dir} onSort={onSort}>Vues</Th>
                <Th field="status" sortField={sort.field} sortDir={sort.dir} onSort={onSort}>Statut</Th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((a) => (
                <tr
                  key={a.id}
                  className={cn(selected?.id === a.id && "selected")}
                  onClick={() => setSelected({ ...a, body: SAMPLE_ARTICLE_BODY })}
                >
                  <td className="col-truncate" style={{ maxWidth: 380, fontWeight: 500 }}>{a.title}</td>
                  <td>
                    <span className="badge outline">{ARTICLE_CAT_LABELS[a.category]}</span>
                  </td>
                  <td className="muted">{a.publishedAt}</td>
                  <td className="muted" style={{ fontSize: 12 }}>{a.author}</td>
                  <td className="muted" style={{ fontSize: 12 }}>{a.source}</td>
                  <td style={{ fontVariantNumeric: "tabular-nums" }}>{a.views.toLocaleString("fr-FR")}</td>
                  <td>
                    {a.status === "published" ? (
                      <StatusBadge kind="success">Publié</StatusBadge>
                    ) : (
                      <StatusBadge kind="warning">Brouillon</StatusBadge>
                    )}
                  </td>
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

      <ArticleDrawer article={selected} onClose={() => setSelected(null)} />
    </motion.div>
  );
}

function ArticleDrawer({ article, onClose }: { article: EditingArticle | null; onClose: () => void }) {
  const [a, setA] = useState<EditingArticle | null>(article);

  useEffect(() => {
    setA(article);
  }, [article]);

  if (!article || !a) return null;

  return (
    <Drawer
      open={!!article}
      onClose={onClose}
      wide
      title={a.id === "new" ? "Nouvel article" : a.title}
      subtitle={a.id === "new" ? "Brouillon non sauvegardé" : `Par ${a.author} · ${a.views.toLocaleString("fr-FR")} vues`}
      footer={
        <>
          <span className="save-state">
            <Check size={12} color="var(--success)" /> Brouillon enregistré il y a 5 s
          </span>
          <button className="btn ghost" onClick={onClose}>Annuler</button>
          <button className="btn outline">
            <Eye size={13} /> Aperçu
          </button>
          <button className="btn primary">
            <Send size={13} /> Publier
          </button>
        </>
      }
    >
      <div className="form-row">
        <label className="lbl">Titre</label>
        <input
          type="text"
          value={a.title}
          onChange={(e) => setA({ ...a, title: e.target.value })}
          placeholder="Titre de l'article"
          style={{ fontSize: 16, fontWeight: 600 }}
        />
      </div>
      <div className="form-row split">
        <div>
          <label className="lbl">Catégorie</label>
          <select
            value={a.category}
            onChange={(e) => setA({ ...a, category: e.target.value as ArticleCategory })}
          >
            {ARTICLE_CATS.map((c) => (
              <option key={c} value={c}>
                {ARTICLE_CAT_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="lbl">Date de publication</label>
          <input type="text" defaultValue={a.publishedAt} />
        </div>
      </div>
      <div className="form-row">
        <label className="lbl">Source</label>
        <input type="text" defaultValue={a.source} placeholder="Légifrance, Service-Public.fr…" />
      </div>
      <div className="form-row">
        <label className="lbl">Extrait (carte mobile)</label>
        <textarea defaultValue={a.excerpt} placeholder="2 phrases max — affichées dans la liste de l'app" />
      </div>
      <div className="form-row">
        <label className="lbl">Corps de l&apos;article</label>
        <MarkdownEditor value={a.body} onChange={(v) => setA({ ...a, body: v })} height={460} />
      </div>
      <div className="form-row">
        <label className="lbl">Image de couverture</label>
        <div
          style={{
            border: "1.5px dashed var(--outline)",
            borderRadius: 12,
            padding: 24,
            textAlign: "center",
            color: "var(--text-tertiary)",
          }}
        >
          <ImageIcon size={20} />
          <div style={{ marginTop: 6, fontSize: 13 }}>
            Glissez une image ou{" "}
            <a href="#" style={{ color: "var(--primary)" }}>parcourir</a>
          </div>
          <div className="tiny">PNG, JPG · 1200×630 recommandé · 2 Mo max</div>
        </div>
      </div>
    </Drawer>
  );
}
