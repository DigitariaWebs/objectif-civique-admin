"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Ban,
  Check,
  Crown,
  Download,
  Gift,
  Key,
  Mail,
  MoreHorizontal,
  RotateCcw,
  Save,
  Search,
  Trash2,
  UserCheck,
  UserPlus,
  Users as UsersIcon,
  UserX,
} from "lucide-react";

import { KpiCard } from "@/components/ui/KpiCard";
import { FilterChip } from "@/components/ui/FilterChip";
import { Avatar } from "@/components/ui/Avatar";
import { Drawer } from "@/components/ui/Drawer";
import { Pagination } from "@/components/ui/Pagination";
import { Checkbox } from "@/components/ui/Checkbox";
import { Th } from "@/components/ui/DataTableHeader";
import { USERS } from "@/data/users";
import type { Goal, Plan, User } from "@/types";
import { cn } from "@/lib/utils";

type SortField = keyof User;
type Sort = { field: SortField; dir: "asc" | "desc" };

function planBadge(p: Plan) {
  if (p === "free") return <span className="badge neutral">Gratuit</span>;
  if (p === "monthly") return <span className="badge info">Mensuel</span>;
  if (p === "quarterly") return <span className="badge info">Trimestriel</span>;
  return <span className="badge success">À vie</span>;
}

function goalBadge(g: Goal | null) {
  return g ? <span className="badge outline">{g}</span> : <span className="muted tiny">—</span>;
}

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [goalFilter, setGoalFilter] = useState<"all" | Goal>("all");
  const [planFilter, setPlanFilter] = useState<"all" | Plan>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sort, setSort] = useState<Sort>({ field: "createdAt", dir: "desc" });
  const [selectedRow, setSelectedRow] = useState<User | null>(null);
  const [bulk, setBulk] = useState<Record<string, boolean>>({});

  const onSort = (f: SortField) =>
    setSort((s) => ({ field: f, dir: s.field === f ? (s.dir === "asc" ? "desc" : "asc") : "asc" }));

  const filtered = useMemo(() => {
    let r = USERS;
    if (search) {
      const s = search.toLowerCase();
      r = r.filter(
        (u) =>
          u.firstName.toLowerCase().includes(s) ||
          u.lastName.toLowerCase().includes(s) ||
          u.email.toLowerCase().includes(s),
      );
    }
    if (goalFilter !== "all") r = r.filter((u) => u.goal === goalFilter);
    if (planFilter !== "all") r = r.filter((u) => u.subscriptionPlan === planFilter);
    r = [...r].sort((a, b) => {
      const va = a[sort.field];
      const vb = b[sort.field];
      if (va == null) return 1;
      if (vb == null) return -1;
      if (va < vb) return sort.dir === "asc" ? -1 : 1;
      if (va > vb) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
    return r;
  }, [search, goalFilter, planFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => {
    setPage(1);
  }, [search, goalFilter, planFilter]);

  const totalSelected = Object.values(bulk).filter(Boolean).length;
  const totalPaid = USERS.filter((u) => u.subscriptionPlan !== "free").length * 97;

  return (
    <motion.div
      className="page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="page-header">
        <div className="page-title-block">
          <h1>Utilisateurs</h1>
          <div className="page-subtitle">
            {(USERS.length * 97).toLocaleString("fr-FR")} candidats inscrits ·{" "}
            {totalPaid.toLocaleString("fr-FR")} abonnés payants
          </div>
        </div>
        <div className="page-actions">
          <button className="btn outline">
            <Download size={13} /> Exporter CSV
          </button>
          <button className="btn primary">
            <UserPlus size={13} /> Inviter un admin
          </button>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <KpiCard icon={UsersIcon} label="Inscrits totaux" value={(USERS.length * 97).toLocaleString("fr-FR")} trend={8.4} />
        <KpiCard icon={UserCheck} label="Actifs 30 jours" value="14 918" trend={11.7} />
        <KpiCard icon={Crown} label="Payants" value={totalPaid.toLocaleString("fr-FR")} trend={5.2} />
        <KpiCard icon={UserX} label="Inactifs > 60j" value="1 207" trend={-3.1} />
      </div>

      <div className="data-table-wrap">
        <div className="data-table-toolbar">
          <div className="data-table-search">
            <Search size={14} className="icon" />
            <input
              placeholder="Rechercher par nom, e-mail…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="data-table-filters">
            <span className="muted tiny" style={{ marginRight: 4 }}>Parcours</span>
            <FilterChip active={goalFilter === "all"} onClick={() => setGoalFilter("all")}>Tous</FilterChip>
            <FilterChip active={goalFilter === "NAT"} onClick={() => setGoalFilter("NAT")}>NAT</FilterChip>
            <FilterChip active={goalFilter === "CSP"} onClick={() => setGoalFilter("CSP")}>CSP</FilterChip>
            <FilterChip active={goalFilter === "CR"} onClick={() => setGoalFilter("CR")}>CR</FilterChip>
            <span className="muted tiny" style={{ margin: "0 4px 0 8px" }}>Plan</span>
            <FilterChip active={planFilter === "all"} onClick={() => setPlanFilter("all")}>Tous</FilterChip>
            <FilterChip active={planFilter === "free"} onClick={() => setPlanFilter("free")}>Gratuit</FilterChip>
            <FilterChip active={planFilter === "monthly"} onClick={() => setPlanFilter("monthly")}>Mensuel</FilterChip>
            <FilterChip active={planFilter === "quarterly"} onClick={() => setPlanFilter("quarterly")}>Trimestriel</FilterChip>
            <FilterChip active={planFilter === "lifetime"} onClick={() => setPlanFilter("lifetime")}>À vie</FilterChip>
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
            <strong>
              {totalSelected} sélectionné{totalSelected > 1 ? "s" : ""}
            </strong>
            <button className="btn sm secondary"><Mail size={12} /> Envoyer un e-mail</button>
            <button className="btn sm secondary"><Gift size={12} /> Offrir Premium 7j</button>
            <button className="btn sm danger"><Ban size={12} /> Désactiver</button>
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
                <Th field="firstName" sortField={sort.field} sortDir={sort.dir} onSort={onSort}>Candidat</Th>
                <Th field="goal" sortField={sort.field} sortDir={sort.dir} onSort={onSort}>Parcours</Th>
                <Th field="subscriptionPlan" sortField={sort.field} sortDir={sort.dir} onSort={onSort}>Plan</Th>
                <Th field="createdAt" sortField={sort.field} sortDir={sort.dir} onSort={onSort}>Inscrit le</Th>
                <Th field="lastActive" sortField={sort.field} sortDir={sort.dir} onSort={onSort}>Dernière activité</Th>
                <Th field="avgScore" sortField={sort.field} sortDir={sort.dir} onSort={onSort}>Score moyen</Th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((u) => (
                <tr
                  key={u.id}
                  className={cn(selectedRow?.id === u.id && "selected")}
                  onClick={() => setSelectedRow(u)}
                >
                  <td className="checkbox-cell" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={!!bulk[u.id]}
                      onChange={(c) => setBulk({ ...bulk, [u.id]: c })}
                      ariaLabel={`Sélectionner ${u.firstName}`}
                    />
                  </td>
                  <td>
                    <div className="user-cell">
                      <Avatar name={`${u.firstName} ${u.lastName}`} />
                      <div>
                        <div className="user-cell-name">
                          {u.firstName} {u.lastName}
                        </div>
                        <div className="user-cell-email">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{goalBadge(u.goal)}</td>
                  <td>{planBadge(u.subscriptionPlan)}</td>
                  <td className="muted">{u.createdAt}</td>
                  <td className="muted">{u.lastActive}</td>
                  <td>
                    <div className="row" style={{ gap: 8, minWidth: 130 }}>
                      <div className="progress" style={{ width: 70 }}>
                        <span
                          style={{
                            width: `${u.avgScore}%`,
                            background:
                              u.avgScore >= 80
                                ? "var(--success)"
                                : u.avgScore >= 60
                                ? "var(--warning)"
                                : "var(--secondary)",
                          }}
                        />
                      </div>
                      <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>{u.avgScore}%</span>
                    </div>
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

      <UserDrawer user={selectedRow} onClose={() => setSelectedRow(null)} />
    </motion.div>
  );
}

function UserDrawer({ user, onClose }: { user: User | null; onClose: () => void }) {
  if (!user) return null;
  const planMap: Record<Plan, string> = {
    free: "Gratuit",
    monthly: "Mensuel",
    quarterly: "Trimestriel",
    lifetime: "À vie",
  };

  return (
    <Drawer
      open={!!user}
      onClose={onClose}
      title={`${user.firstName} ${user.lastName}`}
      subtitle={user.email}
      footer={
        <>
          <span className="save-state">
            <Check size={12} color="var(--success)" /> Toutes les modifications enregistrées
          </span>
          <button className="btn ghost" onClick={onClose}>Fermer</button>
          <button className="btn primary">
            <Save size={13} /> Enregistrer
          </button>
        </>
      }
    >
      <div className="row" style={{ gap: 14, marginBottom: 22 }}>
        <Avatar name={`${user.firstName} ${user.lastName}`} size="lg" />
        <div style={{ flex: 1 }}>
          <div className="row" style={{ gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
            <span className="badge info dot">{planMap[user.subscriptionPlan]}</span>
            {user.goal && <span className="badge outline">Parcours {user.goal}</span>}
            <span className="badge neutral">Niveau {user.level}</span>
          </div>
          <div className="muted tiny">
            Inscrit le {user.createdAt} · {user.sessionsTotal} sessions · streak {user.streak} jours
          </div>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 14 }}>
        <h3 style={{ marginBottom: 12 }}>Profil candidat</h3>
        <div className="form-row split">
          <div>
            <label className="lbl">Prénom</label>
            <input type="text" defaultValue={user.firstName} />
          </div>
          <div>
            <label className="lbl">Nom</label>
            <input type="text" defaultValue={user.lastName} />
          </div>
        </div>
        <div className="form-row">
          <label className="lbl">E-mail</label>
          <input type="email" defaultValue={user.email} />
        </div>
        <div className="form-row split">
          <div>
            <label className="lbl">Parcours</label>
            <select defaultValue={user.goal || ""}>
              <option value="">—</option>
              <option value="NAT">Naturalisation</option>
              <option value="CSP">Carte de séjour</option>
              <option value="CR">Carte de résident</option>
            </select>
          </div>
          <div>
            <label className="lbl">Échéance</label>
            <select defaultValue={user.deadline || ""}>
              <option value="lt1m">Moins d&apos;1 mois</option>
              <option value="1to3m">1 à 3 mois</option>
              <option value="3to6m">3 à 6 mois</option>
              <option value="undecided">Non décidée</option>
            </select>
          </div>
        </div>
        <div className="form-row split">
          <div>
            <label className="lbl">Canal d&apos;acquisition</label>
            <input type="text" defaultValue={user.channel || ""} />
          </div>
          <div>
            <label className="lbl">Code parrain utilisé</label>
            <input type="text" defaultValue={user.referralCodeUsed || ""} placeholder="—" />
          </div>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 14 }}>
        <h3 style={{ marginBottom: 12 }}>Progression</h3>
        <div className="row" style={{ gap: 12, flexWrap: "wrap" }}>
          {[
            { l: "Score moyen", v: `${user.avgScore}%`, c: user.avgScore >= 80 ? "var(--success)" : "var(--warning)" },
            { l: "Sessions", v: user.sessionsTotal, c: "var(--primary)" },
            { l: "Série", v: `${user.streak}j`, c: "var(--secondary)" },
            { l: "Test civique", v: user.civicTestPassed ? "Réussi" : "—", c: user.civicTestPassed ? "var(--success)" : "var(--text-tertiary)" },
            { l: "Test langue", v: user.languageTestPassed ? "Validé" : "—", c: user.languageTestPassed ? "var(--success)" : "var(--text-tertiary)" },
          ].map((s) => (
            <div
              key={s.l}
              style={{ flex: "1 1 100px", minWidth: 100, padding: 10, border: "1px solid var(--outline)", borderRadius: 12 }}
            >
              <div className="tiny muted">{s.l}</div>
              <div style={{ fontSize: 17, fontWeight: 600, color: s.c, marginTop: 2 }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 14 }}>
        <h3 style={{ marginBottom: 12 }}>Historique des sessions</h3>
        <div className="col" style={{ gap: 8 }}>
          {[
            { d: "2026-05-07 14:32", n: "QCM Histoire — 20 questions", s: 16, total: 20 },
            { d: "2026-05-06 09:15", n: "Examen blanc complet", s: 32, total: 40 },
            { d: "2026-05-04 21:08", n: "QCM Institutions — 10 questions", s: 9, total: 10 },
            { d: "2026-05-02 18:44", n: "Révision fiches Géographie", s: null, total: 0 },
          ].map((s, i) => (
            <div
              key={i}
              className="row between"
              style={{ fontSize: 12.5, padding: "8px 12px", border: "1px solid var(--outline)", borderRadius: 10 }}
            >
              <div>
                <div style={{ fontWeight: 500 }}>{s.n}</div>
                <div className="tiny muted">{s.d}</div>
              </div>
              {s.s != null && (
                <span className="badge success dot">
                  {s.s}/{s.total}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card card-pad">
        <h3 style={{ marginBottom: 12 }}>Actions admin</h3>
        <div className="col" style={{ gap: 8 }}>
          <button className="btn outline" style={{ justifyContent: "flex-start" }}>
            <Gift size={14} /> Forcer Premium 7 jours
          </button>
          <button className="btn outline" style={{ justifyContent: "flex-start" }}>
            <RotateCcw size={14} /> Réinitialiser la progression
          </button>
          <button className="btn outline" style={{ justifyContent: "flex-start" }}>
            <Key size={14} /> Envoyer un lien de connexion
          </button>
          <button className="btn danger" style={{ justifyContent: "flex-start" }}>
            <Trash2 size={14} /> Supprimer le compte (RGPD)
          </button>
        </div>
      </div>
    </Drawer>
  );
}
