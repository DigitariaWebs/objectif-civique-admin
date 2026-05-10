"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { Calendar, Download, Filter, Printer } from "lucide-react";

import { Segmented } from "@/components/ui/Segmented";
import { useUsers } from "@/stores/useUsers";
import { useQuestions } from "@/stores/useQuestions";
import { THEME_LABELS, type Goal, type Plan, type Theme } from "@/types";

type Period = "7" | "30" | "90" | "year" | "custom";

export default function AnalyticsPage() {
  const sp = useSearchParams();
  const users = useUsers((s) => s.items);
  const questions = useQuestions((s) => s.items);
  const [period, setPeriod] = useState<Period>("30");
  const [planFilter, setPlanFilter] = useState<"all" | Plan>("all");
  const [journeyFilter, setJourneyFilter] = useState<"all" | Goal>("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // Cohorts (synthetic, deterministic)
  const cohorts = useMemo(() => {
    const weeks = 8;
    const out: { week: string; size: number; d1: number; d7: number; d30: number; d60: number }[] = [];
    for (let i = 0; i < weeks; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (weeks - i) * 7);
      const seed = i + 1;
      out.push({
        week: `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`,
        size: 200 + ((seed * 41) % 90),
        d1: 78 - ((seed * 7) % 12),
        d7: 52 - ((seed * 11) % 10),
        d30: 31 - ((seed * 13) % 8),
        d60: 22 - ((seed * 17) % 7),
      });
    }
    return out;
  }, []);

  // Funnel
  const funnel = useMemo(() => {
    const total = users.length * 97;
    const persoComplete = Math.round(total * 0.78);
    const firstQcm = Math.round(total * 0.62);
    const firstSub = Math.round(total * 0.18);
    return [
      { step: "Inscription", value: total, pct: 100 },
      { step: "Personnalisation", value: persoComplete, pct: Math.round((persoComplete / total) * 100) },
      { step: "Premier QCM", value: firstQcm, pct: Math.round((firstQcm / total) * 100) },
      { step: "Premier abonnement", value: firstSub, pct: Math.round((firstSub / total) * 100) },
    ];
  }, [users.length]);

  // Weak themes
  const weakThemes = useMemo(() => {
    const themeMap: Record<Theme, { sum: number; count: number; nat: number; csp: number; cr: number; n: { nat: number; csp: number; cr: number } }> = {
      institutions: { sum: 0, count: 0, nat: 0, csp: 0, cr: 0, n: { nat: 0, csp: 0, cr: 0 } },
      histoire: { sum: 0, count: 0, nat: 0, csp: 0, cr: 0, n: { nat: 0, csp: 0, cr: 0 } },
      valeurs: { sum: 0, count: 0, nat: 0, csp: 0, cr: 0, n: { nat: 0, csp: 0, cr: 0 } },
      geographie: { sum: 0, count: 0, nat: 0, csp: 0, cr: 0, n: { nat: 0, csp: 0, cr: 0 } },
      culture: { sum: 0, count: 0, nat: 0, csp: 0, cr: 0, n: { nat: 0, csp: 0, cr: 0 } },
    };
    for (const q of questions) {
      themeMap[q.theme].sum += q.stats;
      themeMap[q.theme].count += 1;
      const cat = q.category === "NAT" ? "nat" : q.category === "CSP" ? "csp" : "cr";
      themeMap[q.theme][cat] += q.stats;
      themeMap[q.theme].n[cat] += 1;
    }
    return Object.entries(themeMap).map(([theme, v]) => ({
      theme: THEME_LABELS[theme as Theme],
      avg: v.count ? Math.round(v.sum / v.count) : 0,
      NAT: v.n.nat ? Math.round(v.nat / v.n.nat) : 0,
      CSP: v.n.csp ? Math.round(v.csp / v.n.csp) : 0,
      CR: v.n.cr ? Math.round(v.cr / v.n.cr) : 0,
    }));
  }, [questions]);

  // Heatmap 24h × 7 days, deterministic
  const heatmap = useMemo(() => {
    const rows: { day: string; hours: { h: number; v: number }[] }[] = [];
    const days = ["L", "M", "M", "J", "V", "S", "D"];
    days.forEach((d, di) => {
      const hours = Array.from({ length: 24 }, (_, h) => {
        let v = 1;
        if (h >= 8 && h <= 22) v = 6 + ((di * 17 + h * 7) % 10);
        if ((h === 12 || h === 19) && di < 5) v += 4;
        if (di >= 5) v = Math.max(1, v - 3);
        return { h, v };
      });
      rows.push({ day: d, hours });
    });
    return rows;
  }, []);

  // NPS
  const npsScore = 42; // synthetic
  const npsRatings = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      score: ((i * 7) % 11),
      comment: [
        "Très utile pour préparer mon entretien.",
        "Application bien faite, contenu clair.",
        "Manque quelques fonctionnalités.",
        "Excellent rapport qualité-prix.",
        "À améliorer côté navigation.",
        "Les coachs sont au top.",
      ][i % 6]!,
      who: ["Aïcha D.", "Mehdi B.", "Sofia M.", "Karim S.", "Inès B.", "Yasmine T."][i % 6]!,
      when: `il y a ${i + 1}j`,
    }));
  }, []);

  // Question quality scatter
  const scatter = useMemo(() => {
    return questions.slice(0, 80).map((q) => ({
      x: q.attempts,
      y: q.stats,
      text: q.text,
      flag: q.stats < 40 && q.attempts > 1500,
    }));
  }, [questions]);

  function exportPdf() {
    if (typeof window !== "undefined") {
      window.print();
      toast.success("Vue imprimable ouverte");
    }
  }

  // If ?export=1 in URL, trigger export immediately
  useMemo(() => {
    if (sp.get("export") === "1") {
      setTimeout(() => exportPdf(), 200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  return (
    <motion.div className="page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <div className="page-header">
        <div className="page-title-block">
          <h1>Analytics</h1>
          <div className="page-subtitle">
            Filtres : période · plan · parcours · {planFilter !== "all" || journeyFilter !== "all" ? "actif" : "tous"}
          </div>
        </div>
        <div className="page-actions">
          <button className="btn outline" onClick={exportPdf}>
            <Printer size={13} /> Vue imprimable
          </button>
          <button className="btn primary" onClick={exportPdf}>
            <Download size={13} /> Exporter (PDF)
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 14, marginBottom: 16 }}>
        <div className="row wrap" style={{ gap: 12 }}>
          <div>
            <div className="tiny muted" style={{ marginBottom: 4 }}><Filter size={11} /> Période</div>
            <Segmented<Period>
              value={period}
              onChange={setPeriod}
              options={[
                { value: "7", label: "7j" },
                { value: "30", label: "30j" },
                { value: "90", label: "90j" },
                { value: "year", label: "Année" },
                { value: "custom", label: "Personnalisée" },
              ]}
            />
          </div>
          {period === "custom" && (
            <div className="row" style={{ gap: 6 }}>
              <Calendar size={14} color="var(--text-secondary)" />
              <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
              <span>→</span>
              <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
            </div>
          )}
          <div>
            <div className="tiny muted" style={{ marginBottom: 4 }}>Plan</div>
            <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value as "all" | Plan)}>
              <option value="all">Tous</option>
              <option value="free">Gratuit</option>
              <option value="monthly">Mensuel</option>
              <option value="quarterly">Trimestriel</option>
              <option value="lifetime">À vie</option>
            </select>
          </div>
          <div>
            <div className="tiny muted" style={{ marginBottom: 4 }}>Parcours</div>
            <select value={journeyFilter} onChange={(e) => setJourneyFilter(e.target.value as "all" | Goal)}>
              <option value="all">Tous</option>
              <option value="NAT">Naturalisation</option>
              <option value="CSP">Carte de séjour</option>
              <option value="CR">Carte de résident</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div className="chart-card">
          <div className="head">
            <div>
              <h3>Cohortes hebdomadaires</h3>
              <div className="sub">% utilisateurs encore actifs après J+1, J+7, J+30, J+60</div>
            </div>
          </div>
          <div className="scroll-x">
            <table className="data-table" style={{ fontSize: 12 }}>
              <thead>
                <tr>
                  <th>Cohorte</th>
                  <th>Taille</th>
                  <th>D+1</th>
                  <th>D+7</th>
                  <th>D+30</th>
                  <th>D+60</th>
                </tr>
              </thead>
              <tbody>
                {cohorts.map((c) => (
                  <tr key={c.week} style={{ cursor: "default" }}>
                    <td><strong>{c.week}</strong></td>
                    <td className="muted" style={{ fontVariantNumeric: "tabular-nums" }}>{c.size}</td>
                    {[c.d1, c.d7, c.d30, c.d60].map((v, i) => (
                      <td key={i}>
                        <span
                          className="badge"
                          style={{
                            background:
                              v >= 60
                                ? "rgba(16,185,129,0.15)"
                                : v >= 30
                                ? "rgba(245,158,11,0.15)"
                                : "rgba(239,65,53,0.10)",
                            color:
                              v >= 60
                                ? "#047857"
                                : v >= 30
                                ? "#b45309"
                                : "#b91c1c",
                            fontWeight: 600,
                          }}
                        >
                          {v}%
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="chart-card">
          <div className="head">
            <div>
              <h3>Funnel acquisition → conversion</h3>
              <div className="sub">% restant à chaque étape</div>
            </div>
          </div>
          <div className="col" style={{ gap: 12 }}>
            {funnel.map((f, i) => {
              const drop = i > 0 ? funnel[i - 1]!.value - f.value : 0;
              return (
                <div key={f.step}>
                  <div className="row between" style={{ marginBottom: 4 }}>
                    <strong>{f.step}</strong>
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>
                      {f.value.toLocaleString("fr-FR")} <span className="muted">({f.pct}%)</span>
                    </span>
                  </div>
                  <div className="progress" style={{ height: 14 }}>
                    <span style={{ width: `${f.pct}%` }} />
                  </div>
                  {i > 0 && drop > 0 && (
                    <div className="tiny muted" style={{ marginTop: 4 }}>
                      → {drop.toLocaleString("fr-FR")} abandons
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14, marginBottom: 14 }}>
        <div className="chart-card">
          <div className="head">
            <div>
              <h3>Top thèmes faibles</h3>
              <div className="sub">% correct moyen par thème, ventilé par parcours</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weakThemes} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#f2f4f6" vertical={false} />
              <XAxis dataKey="theme" tick={{ fontSize: 11, fill: "#79747e" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#79747e" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 12 }} />
              <Bar dataKey="NAT" fill="#0055A4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="CSP" fill="#1a6bb8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="CR" fill="#5b8fc7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="head">
            <div>
              <h3>NPS</h3>
              <div className="sub">Score &amp; verbatims récents</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={[
                  { name: "Promoteurs", value: 58, color: "#10B981" },
                  { name: "Passifs", value: 26, color: "#F59E0B" },
                  { name: "Détracteurs", value: 16, color: "#EF4135" },
                ]}
                dataKey="value"
                innerRadius={45}
                outerRadius={64}
                startAngle={180}
                endAngle={0}
              >
                {[
                  { name: "Promoteurs", value: 58, color: "#10B981" },
                  { name: "Passifs", value: 26, color: "#F59E0B" },
                  { name: "Détracteurs", value: 16, color: "#EF4135" },
                ].map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ textAlign: "center", marginBottom: 10 }}>
            <div style={{ fontFamily: "Satoshi, sans-serif", fontSize: 30, fontWeight: 700, color: "var(--success)" }}>
              {npsScore}
            </div>
            <div className="tiny muted">NPS — 30 derniers jours</div>
          </div>
          <div className="col" style={{ gap: 6, maxHeight: 140, overflowY: "auto" }}>
            {npsRatings.slice(0, 5).map((r, i) => (
              <div key={i} className="card" style={{ padding: 8, fontSize: 12 }}>
                <div className="row between" style={{ marginBottom: 2 }}>
                  <strong>{r.who}</strong>
                  <span
                    className="badge"
                    style={{
                      background: r.score >= 9 ? "rgba(16,185,129,0.10)" : r.score >= 7 ? "rgba(245,158,11,0.10)" : "rgba(239,65,53,0.10)",
                      color: r.score >= 9 ? "#047857" : r.score >= 7 ? "#b45309" : "#b91c1c",
                    }}
                  >
                    {r.score}/10
                  </span>
                </div>
                <div className="muted">{r.comment}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 14 }}>
        <div className="chart-card">
          <div className="head">
            <div>
              <h3>Heatmap horaire d&apos;usage</h3>
              <div className="sub">Densité 24h × 7 jours</div>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", fontSize: 10 }}>
              <thead>
                <tr>
                  <th></th>
                  {Array.from({ length: 24 }).map((_, h) => (
                    <th key={h} style={{ padding: 2, color: "var(--text-tertiary)", fontWeight: 500, textAlign: "center", width: 16 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmap.map((row, i) => (
                  <tr key={i}>
                    <td style={{ padding: "2px 6px", fontSize: 10, color: "var(--text-secondary)", fontWeight: 600 }}>{row.day}</td>
                    {row.hours.map((h, j) => {
                      const intensity = Math.min(1, h.v / 16);
                      return (
                        <td
                          key={j}
                          title={`${row.day} ${h.h}h — intensité ${h.v}`}
                          style={{
                            width: 14,
                            height: 14,
                            background: `rgba(0, 85, 164, ${intensity})`,
                            borderRadius: 3,
                            border: "1px solid white",
                          }}
                        />
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="chart-card">
          <div className="head">
            <div>
              <h3>Qualité des questions</h3>
              <div className="sub">Tentatives × % correct — outliers signalés en rouge</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <ScatterChart margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="#f2f4f6" />
              <XAxis dataKey="x" name="tentatives" tick={{ fontSize: 11, fill: "#79747e" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="y" name="% correct" tick={{ fontSize: 11, fill: "#79747e" }} axisLine={false} tickLine={false} />
              <ZAxis range={[40, 40]} />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 11 }}
              />
              <Scatter
                data={scatter}
                fill="#0055A4"
                shape={(props: { cx?: number; cy?: number; payload?: { flag?: boolean } }) => {
                  const { cx, cy, payload } = props;
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill={payload?.flag ? "#EF4135" : "#0055A4"}
                      opacity={0.7}
                    />
                  );
                }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
