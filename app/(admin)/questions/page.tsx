"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Ban,
  BarChart3,
  BatteryFull,
  Bookmark,
  CheckCircle2,
  Check,
  Database,
  Download,
  Eye,
  Info,
  Loader,
  MoreHorizontal,
  Plus,
  Save,
  Search,
  Signal,
  Tag,
  Upload,
  Wifi,
  X,
} from "lucide-react";

import { KpiCard } from "@/components/ui/KpiCard";
import { FilterChip } from "@/components/ui/FilterChip";
import { Drawer } from "@/components/ui/Drawer";
import { Pagination } from "@/components/ui/Pagination";
import { Checkbox } from "@/components/ui/Checkbox";
import { Th } from "@/components/ui/DataTableHeader";
import { QUESTIONS, BANK_BIAS } from "@/data/questions";
import {
  THEMES,
  THEME_LABELS,
  SOURCE_BANKS,
  type Goal,
  type Question,
  type SourceBank,
  type Theme,
} from "@/types";
import { cn } from "@/lib/utils";

type SortField = keyof Question;
type Sort = { field: SortField; dir: "asc" | "desc" };

export default function QuestionsPage() {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<"all" | Goal>("all");
  const [themeFilter, setThemeFilter] = useState<"all" | Theme>("all");
  const [bankFilter, setBankFilter] = useState<"all" | SourceBank>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sort, setSort] = useState<Sort>({ field: "id", dir: "asc" });
  const [selected, setSelected] = useState<Question | null>(null);
  const [bulk, setBulk] = useState<Record<string, boolean>>({});

  const onSort = (f: SortField) =>
    setSort((s) => ({ field: f, dir: s.field === f ? (s.dir === "asc" ? "desc" : "asc") : "asc" }));

  const filtered = useMemo(() => {
    let r = QUESTIONS;
    if (search) {
      const s = search.toLowerCase();
      r = r.filter((q) => q.text.toLowerCase().includes(s) || q.id.toLowerCase().includes(s));
    }
    if (catFilter !== "all") r = r.filter((q) => q.category === catFilter);
    if (themeFilter !== "all") r = r.filter((q) => q.theme === themeFilter);
    if (bankFilter !== "all") r = r.filter((q) => q.sourceBank === bankFilter);
    r = [...r].sort((a, b) => {
      const va = a[sort.field] as string | number;
      const vb = b[sort.field] as string | number;
      if (va < vb) return sort.dir === "asc" ? -1 : 1;
      if (va > vb) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
    return r;
  }, [search, catFilter, themeFilter, bankFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => {
    setPage(1);
  }, [search, catFilter, themeFilter, bankFilter]);

  const totalSelected = Object.values(bulk).filter(Boolean).length;

  const biasAlerts = SOURCE_BANKS.map((b) => {
    const bd = BANK_BIAS[b];
    const dist = [bd[0], bd[1], bd[2], bd[3]];
    const top = Math.max(...dist);
    const topIndex = dist.indexOf(top);
    const topLetter = ["A", "B", "C", "D"][topIndex]!;
    const pct = bd.total === 0 ? 0 : Math.round((top / bd.total) * 100);
    return { bank: b, topLetter, pct, total: bd.total, dist };
  });

  return (
    <motion.div
      className="page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="page-header">
        <div className="page-title-block">
          <h1>Banque de questions</h1>
          <div className="page-subtitle">2 847 questions · 8 banques sources · 5 thèmes officiels</div>
        </div>
        <div className="page-actions">
          <button className="btn outline"><Upload size={13} /> Importer CSV</button>
          <button className="btn outline"><Download size={13} /> Exporter</button>
          <button className="btn primary"><Plus size={13} /> Nouvelle question</button>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <KpiCard icon={Database} label="Questions totales" value="2 847" trend={1.2} />
        <KpiCard icon={CheckCircle2} label="Actives" value="2 718" />
        <KpiCard
          icon={AlertOctagon}
          label="Banques biaisées"
          value={biasAlerts.filter((b) => b.pct > 50).length}
          trendLabel="lettre A"
        />
        <KpiCard icon={BarChart3} label="Taux de réussite moyen" value="68%" trend={2.1} />
      </div>

      <div
        className="card card-pad"
        style={{
          marginBottom: 16,
          borderColor: "rgba(245,158,11,0.4)",
          background: "rgba(245,158,11,0.04)",
        }}
      >
        <div className="row" style={{ gap: 12, alignItems: "flex-start" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "rgba(245,158,11,0.18)",
              color: "#b45309",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ marginBottom: 4 }}>Équilibrage des bonnes réponses (A / B / C / D)</h3>
            <div className="muted tiny" style={{ marginBottom: 12 }}>
              Le runtime mélange déjà les choix, mais la répartition source doit rester équilibrée. Une banque
              déséquilibrée &gt;50% sur une lettre est signalée.
            </div>
            <div className="row wrap" style={{ gap: 10 }}>
              {biasAlerts.map((b) => {
                const biased = b.pct > 50;
                return (
                  <div
                    key={b.bank}
                    style={{
                      flex: "1 1 180px",
                      minWidth: 180,
                      padding: "10px 12px",
                      border: `1px solid ${biased ? "rgba(245,158,11,0.4)" : "var(--outline)"}`,
                      borderRadius: 12,
                      background: "white",
                    }}
                  >
                    <div className="row between" style={{ marginBottom: 6 }}>
                      <strong style={{ fontSize: 13 }}>{b.bank}</strong>
                      {biased ? (
                        <span className="badge warning dot">Lettre {b.topLetter} : {b.pct}%</span>
                      ) : (
                        <span className="badge success dot">Équilibrée</span>
                      )}
                    </div>
                    <div className="row" style={{ gap: 3 }}>
                      {b.dist.map((c, i) => {
                        const pct = b.total === 0 ? 0 : (c / b.total) * 100;
                        const isMax = c === Math.max(...b.dist);
                        return (
                          <div key={i} style={{ flex: 1 }} title={`${["A", "B", "C", "D"][i]} : ${Math.round(pct)}%`}>
                            <div
                              style={{
                                fontSize: 9,
                                textAlign: "center",
                                color: "var(--text-tertiary)",
                                marginBottom: 2,
                              }}
                            >
                              {["A", "B", "C", "D"][i]}
                            </div>
                            <div
                              style={{
                                height: 26,
                                background: isMax && biased ? "#F59E0B" : "var(--primary)",
                                borderRadius: 4,
                                opacity: isMax ? 1 : 0.5 + (pct / 100) * 0.4,
                              }}
                            />
                            <div
                              style={{
                                fontSize: 9.5,
                                textAlign: "center",
                                marginTop: 2,
                                color: "var(--text-secondary)",
                                fontVariantNumeric: "tabular-nums",
                              }}
                            >
                              {Math.round(pct)}%
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="data-table-wrap">
        <div className="data-table-toolbar">
          <div className="data-table-search">
            <Search size={14} className="icon" />
            <input
              placeholder="Rechercher l'intitulé ou l'ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="data-table-filters">
            <span className="muted tiny" style={{ marginRight: 4 }}>Parcours</span>
            <FilterChip active={catFilter === "all"} onClick={() => setCatFilter("all")}>Tous</FilterChip>
            <FilterChip active={catFilter === "NAT"} onClick={() => setCatFilter("NAT")}>NAT</FilterChip>
            <FilterChip active={catFilter === "CSP"} onClick={() => setCatFilter("CSP")}>CSP</FilterChip>
            <FilterChip active={catFilter === "CR"} onClick={() => setCatFilter("CR")}>CR</FilterChip>
            <span className="muted tiny" style={{ margin: "0 4px 0 8px" }}>Thème</span>
            <FilterChip active={themeFilter === "all"} onClick={() => setThemeFilter("all")}>Tous</FilterChip>
            {THEMES.map((t) => (
              <FilterChip key={t} active={themeFilter === t} onClick={() => setThemeFilter(t)}>
                {THEME_LABELS[t]}
              </FilterChip>
            ))}
          </div>
        </div>
        <div className="data-table-toolbar" style={{ borderTop: 0, paddingTop: 0 }}>
          <span className="muted tiny" style={{ marginRight: 4 }}>Banque</span>
          <FilterChip active={bankFilter === "all"} onClick={() => setBankFilter("all")}>Toutes</FilterChip>
          {SOURCE_BANKS.map((b) => (
            <FilterChip key={b} active={bankFilter === b} onClick={() => setBankFilter(b)}>
              {b}
            </FilterChip>
          ))}
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
            <strong>
              {totalSelected} sélectionnée{totalSelected > 1 ? "s" : ""}
            </strong>
            <button className="btn sm secondary"><Tag size={12} /> Changer le thème</button>
            <button className="btn sm secondary"><Ban size={12} /> Désactiver</button>
            <button className="btn sm secondary"><Download size={12} /> Exporter CSV</button>
            <button className="btn sm ghost" style={{ marginLeft: "auto" }} onClick={() => setBulk({})}>
              Tout désélectionner
            </button>
          </div>
        )}

        <div className="scroll-x">
          <table className="data-table">
            <thead>
              <tr>
                <th className="checkbox-cell">
                  <Checkbox
                    checked={pageRows.every((r) => bulk[r.id])}
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
                <Th field="id" sortField={sort.field} sortDir={sort.dir} onSort={onSort}>ID</Th>
                <th>Énoncé</th>
                <Th field="category" sortField={sort.field} sortDir={sort.dir} onSort={onSort}>Parcours</Th>
                <Th field="theme" sortField={sort.field} sortDir={sort.dir} onSort={onSort}>Thème</Th>
                <th>Bonne réponse</th>
                <Th field="sourceBank" sortField={sort.field} sortDir={sort.dir} onSort={onSort}>Banque</Th>
                <Th field="stats" sortField={sort.field} sortDir={sort.dir} onSort={onSort}>% réussite</Th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((q) => {
                const letter = ["A", "B", "C", "D"][q.correctIndex];
                return (
                  <tr key={q.id} className={cn(selected?.id === q.id && "selected")} onClick={() => setSelected(q)}>
                    <td className="checkbox-cell" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={!!bulk[q.id]}
                        onChange={(c) => setBulk({ ...bulk, [q.id]: c })}
                        ariaLabel={`Sélectionner ${q.id}`}
                      />
                    </td>
                    <td>
                      <code style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>{q.id}</code>
                    </td>
                    <td className="col-truncate" style={{ maxWidth: 380, fontWeight: 500 }}>{q.text}</td>
                    <td>
                      <span className="badge outline">{q.category}</span>
                    </td>
                    <td className="muted" style={{ fontSize: 12 }}>{THEME_LABELS[q.theme]}</td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background:
                            q.correctIndex === 0 && q.sourceBank === "officielles"
                              ? "rgba(245,158,11,0.12)"
                              : "var(--surface-low)",
                          color:
                            q.correctIndex === 0 && q.sourceBank === "officielles"
                              ? "#b45309"
                              : "var(--text-secondary)",
                          fontWeight: 600,
                        }}
                      >
                        {letter}
                      </span>
                    </td>
                    <td>
                      <span className="tag">{q.sourceBank}</span>
                    </td>
                    <td>
                      <div className="row" style={{ gap: 8, minWidth: 130 }}>
                        <div className="progress" style={{ width: 70 }}>
                          <span
                            style={{
                              width: `${q.stats}%`,
                              background:
                                q.stats >= 75
                                  ? "var(--success)"
                                  : q.stats >= 50
                                  ? "var(--warning)"
                                  : "var(--secondary)",
                            }}
                          />
                        </div>
                        <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 500, fontSize: 12.5 }}>
                          {q.stats}%
                        </span>
                      </div>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button className="btn ghost sm" aria-label="Actions">
                        <MoreHorizontal size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
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

      <QuestionDrawer question={selected} onClose={() => setSelected(null)} />
    </motion.div>
  );
}

function QuestionDrawer({ question, onClose }: { question: Question | null; onClose: () => void }) {
  const [q, setQ] = useState<Question | null>(question);

  useEffect(() => {
    setQ(question);
  }, [question]);

  if (!question || !q) return null;

  const updateChoice = (i: number, v: string) => {
    const next = [...q.choices];
    next[i] = v;
    setQ({ ...q, choices: next });
  };

  return (
    <Drawer
      open={!!question}
      onClose={onClose}
      wide
      title={`Question ${q.id}`}
      subtitle={`${q.category} · ${THEME_LABELS[q.theme]} · banque ${q.sourceBank}`}
      footer={
        <>
          <span className="save-state">
            <Loader size={12} /> Brouillon enregistré il y a 3 s
          </span>
          <button className="btn ghost" onClick={onClose}>Annuler</button>
          <button className="btn outline">
            <Eye size={13} /> Aperçu mobile
          </button>
          <button className="btn primary">
            <Save size={13} /> Enregistrer
          </button>
        </>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 22, alignItems: "flex-start" }}>
        <div>
          <div className="form-row">
            <label className="lbl">Énoncé</label>
            <textarea
              value={q.text}
              onChange={(e) => setQ({ ...q, text: e.target.value })}
              style={{ minHeight: 80 }}
            />
            <div className="hint">{q.text.length} / 280 caractères. Phrase courte, sans piège grammatical.</div>
          </div>

          <div className="form-row">
            <label className="lbl">Choix de réponse</label>
            <div className="col" style={{ gap: 8 }}>
              {q.choices.map((c, i) => {
                const isCorrect = i === q.correctIndex;
                return (
                  <div
                    key={i}
                    className="row"
                    style={{
                      gap: 8,
                      padding: "8px 10px",
                      border: `1px solid ${isCorrect ? "var(--success)" : "var(--outline)"}`,
                      borderRadius: 12,
                      background: isCorrect ? "rgba(16,185,129,0.05)" : "white",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setQ({ ...q, correctIndex: i })}
                      aria-label={`Définir ${["A", "B", "C", "D"][i]} comme bonne réponse`}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 999,
                        border: `2px solid ${isCorrect ? "var(--success)" : "var(--outline-variant)"}`,
                        background: isCorrect ? "var(--success)" : "white",
                        color: isCorrect ? "white" : "var(--text-tertiary)",
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                        fontWeight: 700,
                        fontSize: 11,
                      }}
                    >
                      {isCorrect ? <Check size={13} color="white" strokeWidth={3} /> : ["A", "B", "C", "D"][i]}
                    </button>
                    <input
                      type="text"
                      value={c}
                      onChange={(e) => updateChoice(i, e.target.value)}
                      style={{
                        flex: 1,
                        border: "none",
                        padding: "4px 0",
                        background: "transparent",
                        fontSize: 13.5,
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="hint" style={{ marginTop: 8 }}>
              <Info size={12} /> La position de la bonne réponse en source est{" "}
              <strong style={{ color: "var(--on-surface)" }}>{["A", "B", "C", "D"][q.correctIndex]}</strong>.
              Le runtime mélange l&apos;ordre côté mobile.
            </div>
          </div>

          <div className="form-row">
            <label className="lbl">Explication</label>
            <textarea
              value={q.explanation}
              onChange={(e) => setQ({ ...q, explanation: e.target.value })}
              placeholder="Texte affiché après la réponse — Markdown autorisé"
            />
          </div>

          <div className="form-row split">
            <div>
              <label className="lbl">Parcours concernés</label>
              <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                {(["NAT", "CSP", "CR"] as Goal[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={cn("filter-chip", q.category === c && "active")}
                    onClick={() => setQ({ ...q, category: c })}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="lbl">Thème</label>
              <select
                value={q.theme}
                onChange={(e) => setQ({ ...q, theme: e.target.value as Theme })}
              >
                {THEMES.map((t) => (
                  <option key={t} value={t}>
                    {THEME_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row split">
            <div>
              <label className="lbl">Banque source</label>
              <select
                value={q.sourceBank}
                onChange={(e) => setQ({ ...q, sourceBank: e.target.value as SourceBank })}
              >
                {SOURCE_BANKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="lbl">Statut</label>
              <select defaultValue="active">
                <option value="active">Active</option>
                <option value="draft">Brouillon</option>
                <option value="archived">Archivée</option>
              </select>
            </div>
          </div>

          <div className="card card-pad" style={{ background: "var(--surface)", marginTop: 18 }}>
            <h3 style={{ marginBottom: 8 }}>Statistiques</h3>
            <div className="row wrap" style={{ gap: 12 }}>
              <div style={{ flex: "1 1 100px" }}>
                <div className="tiny muted">Tentatives</div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>{q.attempts.toLocaleString("fr-FR")}</div>
              </div>
              <div style={{ flex: "1 1 100px" }}>
                <div className="tiny muted">% réussite</div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: q.stats >= 75 ? "var(--success)" : "var(--warning)",
                  }}
                >
                  {q.stats}%
                </div>
              </div>
              <div style={{ flex: "1 1 100px" }}>
                <div className="tiny muted">Difficulté calculée</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  {q.stats >= 75 ? "Facile" : q.stats >= 50 ? "Moyenne" : "Difficile"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ position: "sticky", top: 0 }}>
          <div
            className="muted tiny"
            style={{ marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}
          >
            Aperçu mobile
          </div>
          <MobilePreview q={q} />
        </div>
      </div>
    </Drawer>
  );
}

function MobilePreview({ q }: { q: Question }) {
  const [chosen, setChosen] = useState<number | null>(null);
  const reveal = chosen != null;

  return (
    <div className="phone-frame">
      <div className="phone-screen">
        <div
          style={{
            height: 32,
            paddingTop: 8,
            padding: "6px 18px 0",
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10,
            color: "#0A0F1E",
            fontWeight: 600,
          }}
        >
          <span>09:42</span>
          <span style={{ display: "inline-flex", gap: 4 }}>
            <Signal size={11} />
            <Wifi size={11} />
            <BatteryFull size={12} />
          </span>
        </div>

        <div style={{ padding: "14px 16px 6px" }}>
          <div className="row between" style={{ marginBottom: 10 }}>
            <button
              type="button"
              style={{ background: "none", border: "none", padding: 0, color: "var(--text-secondary)" }}
              aria-label="Fermer"
            >
              <X size={16} />
            </button>
            <span className="tiny muted">Question 12 / 40</span>
            <Bookmark size={14} color="var(--text-tertiary)" />
          </div>
          <div
            style={{
              height: 4,
              background: "var(--surface-low)",
              borderRadius: 999,
              overflow: "hidden",
              marginBottom: 14,
            }}
          >
            <div style={{ height: "100%", width: "30%", background: "var(--primary)" }} />
          </div>
          <div className="row" style={{ gap: 5, marginBottom: 12 }}>
            <span className="badge info" style={{ fontSize: 9, padding: "2px 7px" }}>{q.category}</span>
            <span className="badge neutral" style={{ fontSize: 9, padding: "2px 7px" }}>
              {THEME_LABELS[q.theme]}
            </span>
          </div>
          <div
            style={{
              fontFamily: "Satoshi, sans-serif",
              fontWeight: 700,
              fontSize: 14,
              lineHeight: 1.3,
              color: "var(--tertiary)",
              letterSpacing: "-0.01em",
              marginBottom: 14,
              minHeight: 44,
            }}
          >
            {q.text}
          </div>
        </div>

        <div
          style={{
            padding: "0 16px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            flex: 1,
            overflowY: "auto",
          }}
        >
          {q.choices.map((c, i) => {
            const isCorrect = i === q.correctIndex;
            const isChosen = chosen === i;
            let bg = "white";
            let border = "var(--outline)";
            let color = "var(--on-surface)";
            if (reveal) {
              if (isCorrect) {
                bg = "rgba(16,185,129,0.08)";
                border = "var(--success)";
                color = "#047857";
              } else if (isChosen) {
                bg = "rgba(239,65,53,0.06)";
                border = "var(--secondary)";
                color = "#b91c1c";
              }
            }
            return (
              <button
                key={i}
                type="button"
                onClick={() => setChosen(i)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: `1.5px solid ${border}`,
                  background: bg,
                  color,
                  fontSize: 11.5,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 999,
                    display: "grid",
                    placeItems: "center",
                    fontSize: 9,
                    fontWeight: 700,
                    background:
                      reveal && isCorrect
                        ? "var(--success)"
                        : reveal && isChosen
                        ? "var(--secondary)"
                        : "var(--surface-low)",
                    color: reveal && (isCorrect || isChosen) ? "white" : "var(--text-secondary)",
                    flexShrink: 0,
                  }}
                >
                  {reveal && isCorrect ? "✓" : ["A", "B", "C", "D"][i]}
                </span>
                <span style={{ flex: 1 }}>{c}</span>
              </button>
            );
          })}
        </div>

        <div style={{ padding: "10px 16px 14px", borderTop: "1px solid var(--surface-low)" }}>
          {!reveal ? (
            <button
              type="button"
              disabled
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 999,
                background: "var(--surface-low)",
                color: "var(--text-tertiary)",
                border: "none",
                fontWeight: 600,
                fontSize: 11.5,
              }}
            >
              Choisir une réponse
            </button>
          ) : (
            <>
              <div
                style={{
                  padding: 10,
                  background: "var(--surface-low)",
                  borderRadius: 12,
                  fontSize: 10.5,
                  lineHeight: 1.45,
                  color: "var(--text-secondary)",
                  marginBottom: 8,
                }}
              >
                <strong style={{ color: "var(--on-surface)" }}>Explication.</strong> {q.explanation}
              </div>
              <button
                type="button"
                onClick={() => setChosen(null)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 999,
                  background: "var(--primary)",
                  color: "white",
                  border: "none",
                  fontWeight: 600,
                  fontSize: 11.5,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                Question suivante <ArrowRight size={11} color="white" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
