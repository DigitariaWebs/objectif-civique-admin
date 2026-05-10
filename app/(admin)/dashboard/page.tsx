"use client";

import { motion } from "motion/react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Crown,
  Cpu,
  Download,
  Edit3,
  Euro,
  FileText,
  MapPin,
  MessageSquareWarning,
  Target,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { KpiCard } from "@/components/ui/KpiCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Segmented } from "@/components/ui/Segmented";
import { V2DashboardWidgets } from "@/components/dashboard/V2Widgets";
import { GOAL_LABELS } from "@/types";
import { USERS } from "@/data/users";
import { SIGNUPS_30, SESSIONS_30, JOURNEY_DIST, TOP_FAILED } from "@/data/analytics";
import { useState } from "react";

type Period = "7" | "30" | "90" | "year";

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>("30");

  const totalUsers = USERS.length * 97;
  const activePaid = USERS.filter((u) => u.subscriptionPlan !== "free").length * 97;
  const passRate = Math.round(USERS.reduce((a, u) => a + u.avgScore, 0) / USERS.length);

  const dateLabel = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
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
          <h1>Tableau de bord</h1>
          <div className="page-subtitle">Vue d&apos;ensemble de la plateforme — {dateLabel}</div>
        </div>
        <div className="page-actions">
          <Segmented<Period>
            value={period}
            onChange={setPeriod}
            options={[
              { value: "7", label: "7 jours" },
              { value: "30", label: "30 jours" },
              { value: "90", label: "90 jours" },
              { value: "year", label: "Année" },
            ]}
          />
          <button className="btn outline">
            <Download size={13} /> Exporter
          </button>
        </div>
      </div>

      <div className="kpi-grid">
        <KpiCard icon={Users} label="Utilisateurs totaux" value={totalUsers.toLocaleString("fr-FR")} trend={8.4} />
        <KpiCard icon={UserCheck} label="Actifs sur 7 jours" value="6 482" trend={3.1} />
        <KpiCard icon={Activity} label="Actifs sur 30 jours" value="14 918" trend={11.7} />
        <KpiCard icon={Crown} label="Abonnements payants" value={activePaid.toLocaleString("fr-FR")} trend={5.2} />
        <KpiCard icon={Euro} label="MRR" value="38 940 €" trend={6.8} />
        <KpiCard icon={TrendingUp} label="ARR projeté" value="467 k €" trend={9.1} />
        <KpiCard icon={Target} label="Taux de réussite moyen" value={`${passRate}%`} trend={1.4} />
        <KpiCard icon={AlertTriangle} label="Question la + ratée" value="71%" trend={-2.3} trendLabel="d'échec" />
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <div className="head">
            <div>
              <h3>Inscriptions et conversions payantes</h3>
              <div className="sub">30 derniers jours</div>
            </div>
            <div className="row" style={{ gap: 14, fontSize: 12 }}>
              <span className="row" style={{ gap: 5 }}>
                <span style={{ width: 9, height: 9, background: "var(--primary)", borderRadius: 2 }} /> Inscriptions
              </span>
              <span className="row" style={{ gap: 5 }}>
                <span style={{ width: 9, height: 9, background: "var(--secondary)", borderRadius: 2 }} /> Conversions payantes
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={SIGNUPS_30} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gPrimary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0055A4" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#0055A4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gSecondary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4135" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#EF4135" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#f2f4f6" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#79747e" }} axisLine={false} tickLine={false} interval={3} />
              <YAxis tick={{ fontSize: 11, fill: "#79747e" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 12 }} />
              <Area type="monotone" dataKey="signups" stroke="#0055A4" strokeWidth={2} fill="url(#gPrimary)" />
              <Area type="monotone" dataKey="paid" stroke="#EF4135" strokeWidth={2} fill="url(#gSecondary)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="head">
            <div>
              <h3>Parcours des candidats</h3>
              <div className="sub">Répartition NAT / CSP / CR</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={JOURNEY_DIST} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {JOURNEY_DIST.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="col" style={{ gap: 6, marginTop: 6 }}>
            {JOURNEY_DIST.map((d) => (
              <div key={d.name} className="row between" style={{ fontSize: 12 }}>
                <span className="row" style={{ gap: 7 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                  <strong>{d.name}</strong>
                  <span className="muted">— {GOAL_LABELS[d.name]}</span>
                </span>
                <span>
                  <strong>{d.value.toLocaleString("fr-FR")}</strong>{" "}
                  <span className="muted">candidats</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="chart-grid" style={{ gridTemplateColumns: "1fr 1.4fr" }}>
        <div className="chart-card">
          <div className="head">
            <div>
              <h3>Sessions de quiz par jour</h3>
              <div className="sub">Volume sur 30 jours</div>
            </div>
            <StatusBadge kind="success">+11.7%</StatusBadge>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={SESSIONS_30} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#f2f4f6" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#79747e" }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fontSize: 11, fill: "#79747e" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 12 }} />
              <Bar dataKey="sessions" fill="#0055A4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="head">
            <div>
              <h3>Top 10 questions les plus ratées</h3>
              <div className="sub">% d&apos;échec, 30 derniers jours</div>
            </div>
            <button className="btn ghost sm">
              Voir toutes <ArrowRight size={12} />
            </button>
          </div>
          <div className="col" style={{ gap: 8 }}>
            {TOP_FAILED.map((q, i) => (
              <div key={q.id} className="row" style={{ gap: 12, fontSize: 12.5 }}>
                <span className="muted" style={{ width: 18, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                  {i + 1}.
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="col-truncate" style={{ marginBottom: 3 }}>
                    {q.text}
                  </div>
                  <div className="progress warning">
                    <span style={{ width: `${q.fail}%` }} />
                  </div>
                </div>
                <span style={{ fontVariantNumeric: "tabular-nums", minWidth: 48, textAlign: "right" }}>
                  <strong>{q.fail}%</strong>
                </span>
                <span className="muted tiny" style={{ minWidth: 60, textAlign: "right" }}>
                  {q.attempts.toLocaleString("fr-FR")} essais
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="chart-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", marginTop: 14 }}>
        <div className="chart-card">
          <div className="head">
            <div>
              <h3>Plans actifs</h3>
              <div className="sub">Répartition des abonnements payants</div>
            </div>
          </div>
          <div className="col" style={{ gap: 12 }}>
            {[
              { l: "Mensuel · 4,99 €", v: 1840, c: "#0055A4", pct: 62 },
              { l: "Trimestriel · 9,99 €", v: 720, c: "#1a6bb8", pct: 24 },
              { l: "À vie · 29,99 €", v: 410, c: "#EF4135", pct: 14 },
            ].map((p) => (
              <div key={p.l}>
                <div className="row between" style={{ fontSize: 12.5, marginBottom: 4 }}>
                  <span>{p.l}</span>
                  <strong>{p.v.toLocaleString("fr-FR")}</strong>
                </div>
                <div className="progress">
                  <span style={{ width: `${p.pct}%`, background: p.c }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <div className="head">
            <div>
              <h3>Notifications</h3>
              <div className="sub">Action recommandée</div>
            </div>
          </div>
          <div className="col" style={{ gap: 10 }}>
            <div
              className="row"
              style={{
                alignItems: "flex-start",
                gap: 10,
                padding: 10,
                border: "1px solid var(--outline)",
                borderRadius: 12,
                background: "rgba(245,158,11,0.05)",
              }}
            >
              <AlertTriangle size={16} color="#b45309" />
              <div>
                <div style={{ fontWeight: 500, fontSize: 13 }}>
                  Banque &quot;officielles&quot; : biais lettre A
                </div>
                <div className="tiny muted">85% des bonnes réponses tombent sur A. Diversifier l&apos;ordre.</div>
              </div>
            </div>
            <div
              className="row"
              style={{
                alignItems: "flex-start",
                gap: 10,
                padding: 10,
                border: "1px solid var(--outline)",
                borderRadius: 12,
              }}
            >
              <MessageSquareWarning size={16} color="var(--secondary)" />
              <div>
                <div style={{ fontWeight: 500, fontSize: 13 }}>3 signalements forum en attente</div>
                <div className="tiny muted">À modérer aujourd&apos;hui</div>
              </div>
            </div>
            <div
              className="row"
              style={{
                alignItems: "flex-start",
                gap: 10,
                padding: 10,
                border: "1px solid var(--outline)",
                borderRadius: 12,
              }}
            >
              <UserPlus size={16} color="var(--primary)" />
              <div>
                <div style={{ fontWeight: 500, fontSize: 13 }}>2 nouveaux partenaires actifs</div>
                <div className="tiny muted">À valider dans le programme parrainage</div>
              </div>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div className="head">
            <div>
              <h3>Activité récente</h3>
              <div className="sub">Équipe &amp; système</div>
            </div>
          </div>
          <div className="col" style={{ gap: 14 }}>
            {[
              { who: "Camille L.", what: "a publié l'article \"Loi immigration 2025\"", when: "il y a 12 min", Icon: FileText },
              { who: "Karim B.", what: "a modifié 14 questions du thème Histoire", when: "il y a 1 h", Icon: Edit3 },
              { who: "Système", what: "a détecté un biais sur la banque \"officielles\"", when: "il y a 3 h", Icon: Cpu },
              { who: "Léa M.", what: "a ajouté le centre \"Préfecture d'Évry\"", when: "hier", Icon: MapPin },
            ].map((a, i) => (
              <div key={i} className="row" style={{ alignItems: "flex-start", gap: 10 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    background: "var(--surface-low)",
                    display: "grid",
                    placeItems: "center",
                    color: "var(--text-secondary)",
                    flexShrink: 0,
                  }}
                >
                  <a.Icon size={13} />
                </div>
                <div style={{ flex: 1, minWidth: 0, fontSize: 12.5 }}>
                  <div>
                    <strong>{a.who}</strong> {a.what}
                  </div>
                  <div className="tiny muted">{a.when}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <V2DashboardWidgets />
    </motion.div>
  );
}
