"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import { motion } from "motion/react";
import {
  Ban,
  Banknote,
  Copy,
  Euro,
  Instagram,
  Link as LinkIcon,
  Link2,
  MoreHorizontal,
  Music,
  Search,
  Settings2,
  Twitter,
  UserPlus,
  Users,
  Youtube,
  Zap,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { KpiCard } from "@/components/ui/KpiCard";
import { FilterChip } from "@/components/ui/FilterChip";
import { Drawer } from "@/components/ui/Drawer";
import { Pagination } from "@/components/ui/Pagination";
import { Th } from "@/components/ui/DataTableHeader";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PARTNERS } from "@/data/partners";
import { PLATFORMS, type Partner, type PartnerStatus, type Platform } from "@/types";
import { cn } from "@/lib/utils";

type SortField = keyof Partner;
type Sort = { field: SortField; dir: "asc" | "desc" };

const platformIcon = (p: Platform): ComponentType<{ size?: number; color?: string }> => {
  const map: Record<Platform, ComponentType<{ size?: number; color?: string }>> = {
    TikTok: Music,
    YouTube: Youtube,
    Instagram: Instagram,
    Direct: LinkIcon,
    "Twitter/X": Twitter,
  };
  return map[p] || LinkIcon;
};

export default function PartnersPage() {
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState<"all" | Platform>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | PartnerStatus>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sort, setSort] = useState<Sort>({ field: "conversions", dir: "desc" });
  const [selected, setSelected] = useState<Partner | null>(null);

  const onSort = (f: SortField) =>
    setSort((s) => ({ field: f, dir: s.field === f ? (s.dir === "asc" ? "desc" : "asc") : "asc" }));

  const filtered = useMemo(() => {
    let r = PARTNERS;
    if (search) {
      const s = search.toLowerCase();
      r = r.filter((p) => p.name.toLowerCase().includes(s) || p.code.toLowerCase().includes(s));
    }
    if (platformFilter !== "all") r = r.filter((p) => p.platform === platformFilter);
    if (statusFilter !== "all") r = r.filter((p) => p.status === statusFilter);
    r = [...r].sort((a, b) => {
      const va = a[sort.field] as string | number;
      const vb = b[sort.field] as string | number;
      if (va < vb) return sort.dir === "asc" ? -1 : 1;
      if (va > vb) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
    return r;
  }, [search, platformFilter, statusFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => {
    setPage(1);
  }, [search, platformFilter, statusFilter]);

  const totalConversions = PARTNERS.reduce((s, p) => s + p.conversions, 0);
  const totalSignups = PARTNERS.reduce((s, p) => s + p.signups, 0);
  const pendingPayouts = PARTNERS.filter((p) => p.earnings > 50).reduce((s, p) => s + p.earnings, 0);

  return (
    <motion.div
      className="page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="page-header">
        <div className="page-title-block">
          <h1>Programme partenaires</h1>
          <div className="page-subtitle">
            {PARTNERS.length} créateurs · commission 10% · attribution 12 mois
          </div>
        </div>
        <div className="page-actions">
          <button className="btn outline">
            <Settings2 size={13} /> Paramètres
          </button>
          <button className="btn outline">
            <Banknote size={13} /> Lancer les paiements
          </button>
          <button className="btn primary">
            <UserPlus size={13} /> Nouveau partenaire
          </button>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <KpiCard
          icon={Users}
          label="Partenaires actifs"
          value={PARTNERS.filter((p) => p.status === "active").length}
          trend={6.2}
        />
        <KpiCard icon={UserPlus} label="Inscriptions générées" value={totalSignups.toLocaleString("fr-FR")} trend={18.4} />
        <KpiCard icon={Zap} label="Conversions payantes" value={totalConversions} trend={11.2} />
        <KpiCard
          icon={Euro}
          label="À régler ce mois"
          value={`${Math.round(pendingPayouts).toLocaleString("fr-FR")} €`}
          trendLabel="à payer"
        />
      </div>

      <div className="chart-grid" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: 18 }}>
        <div className="chart-card">
          <div className="head">
            <div>
              <h3>Top 5 partenaires</h3>
              <div className="sub">Par conversions cumulées</div>
            </div>
          </div>
          <div className="col" style={{ gap: 10 }}>
            {PARTNERS.slice(0, 5).map((p, i) => (
              <div key={p.id} className="row" style={{ gap: 10, padding: 8, borderRadius: 12 }}>
                <span
                  className="muted"
                  style={{
                    width: 16,
                    textAlign: "center",
                    fontWeight: 600,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {i + 1}
                </span>
                <Avatar name={p.name} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500 }}>{p.name}</div>
                  <div className="tiny muted">
                    {p.handle || p.platform} · code {p.code}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{p.conversions}</div>
                  <div className="tiny muted">conv.</div>
                </div>
                <div style={{ textAlign: "right", minWidth: 70 }}>
                  <div style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                    {Math.round(p.earnings)} €
                  </div>
                  <div className="tiny muted">gains</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <div className="head">
            <div>
              <h3>Réglages du programme</h3>
              <div className="sub">Modifiable par les super-admins</div>
            </div>
          </div>
          <div className="form-row split">
            <div>
              <label className="lbl">Commission</label>
              <div className="row" style={{ gap: 6 }}>
                <input type="number" defaultValue="10" style={{ width: 70 }} />
                <span className="muted">%</span>
              </div>
            </div>
            <div>
              <label className="lbl">Attribution</label>
              <div className="row" style={{ gap: 6 }}>
                <input type="number" defaultValue="12" style={{ width: 70 }} />
                <span className="muted">mois</span>
              </div>
            </div>
          </div>
          <div className="form-row split">
            <div>
              <label className="lbl">Seuil de paiement</label>
              <div className="row" style={{ gap: 6 }}>
                <input type="number" defaultValue="50" style={{ width: 70 }} />
                <span className="muted">€</span>
              </div>
            </div>
            <div>
              <label className="lbl">Devise</label>
              <select defaultValue="EUR">
                <option>EUR</option>
                <option>USD</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <label className="lbl">Conditions générales</label>
            <textarea
              defaultValue="Le programme partenaires Objectif Civique permet à tout créateur disposant d'une audience de promouvoir l'application en échange d'une commission de 10% sur les abonnements payants générés…"
              style={{ minHeight: 80 }}
            />
          </div>
        </div>
      </div>

      <div className="data-table-wrap">
        <div className="data-table-toolbar">
          <div className="data-table-search">
            <Search size={14} className="icon" />
            <input
              placeholder="Rechercher par nom, code…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="data-table-filters">
            <span className="muted tiny" style={{ marginRight: 4 }}>Plateforme</span>
            <FilterChip active={platformFilter === "all"} onClick={() => setPlatformFilter("all")}>Toutes</FilterChip>
            {PLATFORMS.map((p) => (
              <FilterChip key={p} active={platformFilter === p} onClick={() => setPlatformFilter(p)}>
                {p}
              </FilterChip>
            ))}
            <span className="muted tiny" style={{ margin: "0 4px 0 8px" }}>Statut</span>
            <FilterChip active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>Tous</FilterChip>
            <FilterChip active={statusFilter === "active"} onClick={() => setStatusFilter("active")}>Actifs</FilterChip>
            <FilterChip active={statusFilter === "suspended"} onClick={() => setStatusFilter("suspended")}>Suspendus</FilterChip>
          </div>
        </div>

        <div className="scroll-x">
          <table className="data-table">
            <thead>
              <tr>
                <Th field="code" sortField={sort.field} sortDir={sort.dir} onSort={onSort}>Code</Th>
                <Th field="name" sortField={sort.field} sortDir={sort.dir} onSort={onSort}>Créateur</Th>
                <Th field="platform" sortField={sort.field} sortDir={sort.dir} onSort={onSort}>Plateforme</Th>
                <Th field="followers" sortField={sort.field} sortDir={sort.dir} onSort={onSort}>Audience</Th>
                <Th field="signups" sortField={sort.field} sortDir={sort.dir} onSort={onSort}>Inscrits</Th>
                <Th field="conversions" sortField={sort.field} sortDir={sort.dir} onSort={onSort}>Conv.</Th>
                <Th field="earnings" sortField={sort.field} sortDir={sort.dir} onSort={onSort}>Gains</Th>
                <Th field="status" sortField={sort.field} sortDir={sort.dir} onSort={onSort}>Statut</Th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((p) => {
                const PIcon = platformIcon(p.platform);
                return (
                  <tr key={p.id} className={cn(selected?.id === p.id && "selected")} onClick={() => setSelected(p)}>
                    <td>
                      <code
                        style={{
                          fontSize: 12,
                          padding: "2px 7px",
                          background: "var(--surface-low)",
                          borderRadius: 5,
                          fontWeight: 600,
                          color: "var(--primary)",
                        }}
                      >
                        {p.code}
                      </code>
                    </td>
                    <td>
                      <div className="user-cell">
                        <Avatar name={p.name} />
                        <div>
                          <div className="user-cell-name">{p.name}</div>
                          <div className="user-cell-email">{p.handle || "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="row" style={{ gap: 5, fontSize: 12.5 }}>
                        <PIcon size={13} color="var(--text-secondary)" />
                        {p.platform}
                      </span>
                    </td>
                    <td className="muted" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {p.followers > 0 ? (p.followers >= 1000 ? `${(p.followers / 1000).toFixed(1)}k` : p.followers) : "—"}
                    </td>
                    <td style={{ fontVariantNumeric: "tabular-nums" }}>{p.signups}</td>
                    <td style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{p.conversions}</td>
                    <td style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                      {Math.round(p.earnings).toLocaleString("fr-FR")} €
                    </td>
                    <td>
                      {p.status === "active" ? (
                        <StatusBadge kind="success">Actif</StatusBadge>
                      ) : (
                        <StatusBadge kind="error">Suspendu</StatusBadge>
                      )}
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

      <PartnerDrawer partner={selected} onClose={() => setSelected(null)} />
    </motion.div>
  );
}

function PartnerDrawer({ partner, onClose }: { partner: Partner | null; onClose: () => void }) {
  const funnelData = useMemo(() => {
    if (!partner) return [];
    // Pseudo-deterministic per-partner funnel
    let s = 0;
    for (let i = 0; i < partner.code.length; i++) s = (s * 31 + partner.code.charCodeAt(i)) & 0xffffffff;
    const rand = () => {
      s = (s * 9301 + 49297) & 0xffffffff;
      return ((s >>> 0) % 1000) / 1000;
    };
    return Array.from({ length: 14 }, (_, i) => {
      const day = new Date();
      day.setDate(day.getDate() - (13 - i));
      return {
        day: `${day.getDate()}/${day.getMonth() + 1}`,
        clicks: Math.floor(rand() * 80) + 30,
        signups: Math.floor(rand() * 20) + 4,
        conversions: Math.floor(rand() * 6),
      };
    });
  }, [partner]);

  if (!partner) return null;

  const totalClicks = funnelData.reduce((s, d) => s + d.clicks, 0);

  return (
    <Drawer
      open={!!partner}
      onClose={onClose}
      wide
      title={partner.name}
      subtitle={`Code ${partner.code} · ${partner.platform} · membre depuis ${partner.joinedAt}`}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>Fermer</button>
          <button className="btn outline danger">
            <Ban size={13} /> Suspendre
          </button>
          <button className="btn primary">
            <Banknote size={13} /> Marquer comme payé
          </button>
        </>
      }
    >
      <div className="row" style={{ gap: 14, marginBottom: 18 }}>
        <Avatar name={partner.name} size="lg" />
        <div style={{ flex: 1 }}>
          <div className="row" style={{ gap: 6, marginBottom: 4 }}>
            {partner.status === "active" ? (
              <StatusBadge kind="success">Actif</StatusBadge>
            ) : (
              <StatusBadge kind="error">Suspendu</StatusBadge>
            )}
            <span className="badge outline">{partner.platform}</span>
            {partner.handle && <span className="muted tiny">{partner.handle}</span>}
          </div>
          <div className="muted tiny">
            Audience : {partner.followers.toLocaleString("fr-FR")} · Dernier paiement : {partner.lastPayout}
          </div>
        </div>
      </div>

      <div className="row wrap" style={{ gap: 10, marginBottom: 18 }}>
        {[
          { l: "Clics totaux", v: totalClicks },
          { l: "Inscriptions", v: partner.signups },
          { l: "Conversions", v: partner.conversions, c: "var(--success)" },
          { l: "Gains cumulés", v: `${Math.round(partner.earnings)} €`, c: "var(--primary)" },
        ].map((s) => (
          <div
            key={s.l}
            style={{ flex: "1 1 100px", padding: 12, border: "1px solid var(--outline)", borderRadius: 12 }}
          >
            <div className="tiny muted">{s.l}</div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: s.c || "var(--on-surface)",
                marginTop: 2,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {s.v}
            </div>
          </div>
        ))}
      </div>

      <div className="card card-pad" style={{ marginBottom: 14 }}>
        <h3 style={{ marginBottom: 12 }}>Performance — 14 derniers jours</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={funnelData} margin={{ top: 5, right: 10, left: -22, bottom: 0 }}>
            <CartesianGrid stroke="#f2f4f6" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#79747e" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#79747e" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 11 }} />
            <Line type="monotone" dataKey="clicks" stroke="#ccc7d0" strokeWidth={1.5} dot={false} />
            <Line type="monotone" dataKey="signups" stroke="#0055A4" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="conversions" stroke="#EF4135" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
        <div className="row" style={{ gap: 14, fontSize: 12, marginTop: 8 }}>
          <span className="row" style={{ gap: 5 }}>
            <span style={{ width: 9, height: 9, background: "#ccc7d0", borderRadius: 2 }} /> Clics
          </span>
          <span className="row" style={{ gap: 5 }}>
            <span style={{ width: 9, height: 9, background: "#0055A4", borderRadius: 2 }} /> Inscriptions
          </span>
          <span className="row" style={{ gap: 5 }}>
            <span style={{ width: 9, height: 9, background: "#EF4135", borderRadius: 2 }} /> Conversions
          </span>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 14 }}>
        <h3 style={{ marginBottom: 12 }}>Lien d&apos;affiliation</h3>
        <div className="row" style={{ gap: 8, padding: "8px 12px", background: "var(--surface-low)", borderRadius: 10 }}>
          <Link2 size={14} color="var(--text-tertiary)" />
          <code style={{ flex: 1, fontSize: 12, color: "var(--on-surface)" }}>
            https://objectif-civique.fr/?ref={partner.code}
          </code>
          <button className="btn ghost sm">
            <Copy size={12} /> Copier
          </button>
        </div>
      </div>

      <div className="card card-pad">
        <h3 style={{ marginBottom: 12 }}>Historique des paiements</h3>
        <table className="data-table" style={{ marginTop: -4 }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Montant</th>
              <th>Méthode</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {[
              { d: "2026-04-01", a: "127 €", m: "Virement SEPA", s: "paid" as const },
              { d: "2026-03-01", a: "98 €", m: "Virement SEPA", s: "paid" as const },
              { d: "2026-02-01", a: "74 €", m: "PayPal", s: "paid" as const },
              { d: "2026-05-01", a: `${Math.round(partner.earnings * 0.4)} €`, m: "Virement SEPA", s: "pending" as const },
            ].map((p, i) => (
              <tr key={i} style={{ cursor: "default" }}>
                <td>{p.d}</td>
                <td style={{ fontWeight: 600 }}>{p.a}</td>
                <td className="muted">{p.m}</td>
                <td>
                  {p.s === "paid" ? (
                    <StatusBadge kind="success">Payé</StatusBadge>
                  ) : (
                    <StatusBadge kind="warning">En attente</StatusBadge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Drawer>
  );
}
