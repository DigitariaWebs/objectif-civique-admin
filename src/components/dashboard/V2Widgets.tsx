"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, FileText, Flag, GraduationCap, MessageSquare } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { useForumThreads } from "@/stores/useForumThreads";
import { useFiches } from "@/stores/useFiches";
import { useNotions } from "@/stores/useNotions";
import { useCours } from "@/stores/useCours";
import { useUsers } from "@/stores/useUsers";

export function V2DashboardWidgets() {
  const reports = useForumThreads((s) => s.reports.filter((r) => r.status === "open"));
  const threads = useForumThreads((s) => s.threads);
  const fiches = useFiches((s) => s.items);
  const notions = useNotions((s) => s.items);
  const cours = useCours((s) => s.items);
  const users = useUsers((s) => s.items);

  const total = fiches.length + notions.length + cours.length;
  const published =
    fiches.filter((f) => f.visibility === "published").length +
    notions.filter((n) => n.visibility === "published").length +
    cours.filter((c) => c.visibility === "published").length;
  const publishedPct = total ? Math.round((published / total) * 100) : 0;

  const paid = users.filter((u) => u.subscriptionPlan !== "free");
  const paidByPlan = [
    { name: "Mensuel", value: paid.filter((u) => u.subscriptionPlan === "monthly").length, color: "#0055A4" },
    { name: "Trimestriel", value: paid.filter((u) => u.subscriptionPlan === "quarterly").length, color: "#1a6bb8" },
    { name: "À vie", value: paid.filter((u) => u.subscriptionPlan === "lifetime").length, color: "#EF4135" },
  ];

  return (
    <div className="chart-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", marginTop: 14 }}>
      {/* Forum activity */}
      <div className="chart-card">
        <div className="head">
          <div>
            <h3>Activité forum</h3>
            <div className="sub">{reports.length} signalement{reports.length > 1 ? "s" : ""} ouvert{reports.length > 1 ? "s" : ""}</div>
          </div>
          <Link href="/forum?tab=reports" className="btn ghost sm">
            Voir tous <ArrowRight size={11} />
          </Link>
        </div>
        <div className="col" style={{ gap: 8 }}>
          {reports.length === 0 ? (
            <div className="muted tiny" style={{ padding: 12 }}>Aucun signalement en attente.</div>
          ) : (
            reports.slice(0, 5).map((r) => {
              const t = threads.find((th) => th.id === r.threadId);
              return (
                <div key={r.id} className="row" style={{ alignItems: "flex-start", gap: 8, fontSize: 12.5 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 8,
                      background: "rgba(239,65,53,0.10)",
                      color: "var(--secondary)",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Flag size={11} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="col-truncate" style={{ fontWeight: 500 }}>
                      {r.targetKind === "thread" ? t?.title : `Réponse — ${t?.title}`}
                    </div>
                    <div className="tiny muted">{r.reason} · par {r.reporter}</div>
                  </div>
                  <Link href={`/forum/${r.threadId}`} className="btn ghost sm">
                    Voir
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Library health */}
      <div className="chart-card">
        <div className="head">
          <div>
            <h3>Santé bibliothèque</h3>
            <div className="sub">{publishedPct}% publié sur {total}</div>
          </div>
          <Link href="/library" className="btn ghost sm">
            Ouvrir <ArrowRight size={11} />
          </Link>
        </div>
        <div className="col" style={{ gap: 10, marginBottom: 10 }}>
          {[
            { label: "Fiches", icon: BookOpen, total: fiches.length, pub: fiches.filter((f) => f.visibility === "published").length },
            { label: "Notions", icon: FileText, total: notions.length, pub: notions.filter((n) => n.visibility === "published").length },
            { label: "Cours", icon: GraduationCap, total: cours.length, pub: cours.filter((c) => c.visibility === "published").length },
          ].map((row) => {
            const Icon = row.icon;
            const pct = row.total ? Math.round((row.pub / row.total) * 100) : 0;
            return (
              <div key={row.label}>
                <div className="row" style={{ gap: 6, fontSize: 12.5, marginBottom: 4 }}>
                  <Icon size={12} color="var(--text-secondary)" />
                  <strong>{row.label}</strong>
                  <span className="muted" style={{ marginLeft: "auto" }}>
                    {row.pub} / {row.total} ({pct}%)
                  </span>
                </div>
                <div className="progress">
                  <span style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plan distribution */}
      <div className="chart-card">
        <div className="head">
          <div>
            <h3>Plans actifs (payants)</h3>
            <div className="sub">{paid.length} utilisateurs</div>
          </div>
          <Link href="/plans" className="btn ghost sm">
            Plans <ArrowRight size={11} />
          </Link>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <PieChart>
            <Pie data={paidByPlan} dataKey="value" innerRadius={40} outerRadius={62} paddingAngle={2}>
              {paidByPlan.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="col" style={{ gap: 4 }}>
          {paidByPlan.map((d) => (
            <div key={d.name} className="row between" style={{ fontSize: 12 }}>
              <span className="row" style={{ gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} /> {d.name}
              </span>
              <strong style={{ fontVariantNumeric: "tabular-nums" }}>{d.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
