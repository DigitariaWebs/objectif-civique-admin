"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Calendar,
  CalendarCheck,
  Clock,
  Edit3,
  ExternalLink,
  Save,
  Search,
  Star,
  Upload,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import { KpiCard } from "@/components/ui/KpiCard";
import { FilterChip } from "@/components/ui/FilterChip";
import { Drawer } from "@/components/ui/Drawer";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { COACHES } from "@/data/coaches";
import type { Coach, CoachStatus } from "@/types";
import { cn } from "@/lib/utils";

export default function CoachesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CoachStatus>("all");
  const [selected, setSelected] = useState<Coach | null>(null);

  const filtered = useMemo(
    () =>
      COACHES.filter((c) => {
        if (
          search &&
          !c.name.toLowerCase().includes(search.toLowerCase()) &&
          !c.specialty.toLowerCase().includes(search.toLowerCase())
        )
          return false;
        if (statusFilter !== "all" && c.status !== statusFilter) return false;
        return true;
      }),
    [search, statusFilter],
  );

  const avgRating = (COACHES.reduce((s, c) => s + c.rating, 0) / COACHES.length).toFixed(1);

  return (
    <motion.div
      className="page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="page-header">
        <div className="page-title-block">
          <h1>Coachs</h1>
          <div className="page-subtitle">
            {COACHES.length} coachs actifs · {COACHES.reduce((s, c) => s + c.completedSessions, 0)} sessions cumulées · note moyenne{" "}
            {avgRating} ★
          </div>
        </div>
        <div className="page-actions">
          <button className="btn outline">
            <Calendar size={13} /> Calendly
          </button>
          <button className="btn primary">
            <UserPlus size={13} /> Nouveau coach
          </button>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <KpiCard
          icon={Users}
          label="Coachs disponibles"
          value={COACHES.filter((c) => c.status === "available").length}
        />
        <KpiCard icon={CalendarCheck} label="Sessions ce mois" value="48" trend={14.2} />
        <KpiCard icon={Star} label="Note moyenne" value={avgRating} />
        <KpiCard icon={Clock} label="Délai moyen 1ère session" value="2,4 j" trend={-8} trendLabel="amélioré" />
      </div>

      <div className="data-table-wrap" style={{ padding: 16, marginBottom: 16 }}>
        <div className="row wrap" style={{ gap: 10, marginBottom: 4 }}>
          <div className="data-table-search" style={{ maxWidth: 320 }}>
            <Search size={14} className="icon" />
            <input
              placeholder="Rechercher un coach…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <FilterChip active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>Tous</FilterChip>
          <FilterChip
            active={statusFilter === "available"}
            onClick={() => setStatusFilter("available")}
          >
            Disponibles
          </FilterChip>
          <FilterChip active={statusFilter === "busy"} onClick={() => setStatusFilter("busy")}>Occupés</FilterChip>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 14 }}>
        {filtered.map((c) => (
          <div
            key={c.id}
            className="card"
            style={{ padding: 18, cursor: "pointer" }}
            onClick={() => setSelected(c)}
          >
            <div className="row" style={{ gap: 12, marginBottom: 12 }}>
              <Avatar name={c.name} size="lg" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="row" style={{ gap: 6, marginBottom: 2 }}>
                  <h3 style={{ fontSize: 15 }}>{c.name}</h3>
                </div>
                <div className="muted tiny" style={{ marginBottom: 6 }}>{c.specialty}</div>
                <div className="row" style={{ gap: 6 }}>
                  {c.status === "available" ? (
                    <StatusBadge kind="success">Disponible</StatusBadge>
                  ) : (
                    <StatusBadge kind="warning">Occupé</StatusBadge>
                  )}
                  <span className="row" style={{ gap: 3, fontSize: 12, fontWeight: 500 }}>
                    <Star size={12} color="#F59E0B" />
                    {c.rating}
                  </span>
                </div>
              </div>
            </div>
            <p className="tiny muted" style={{ marginBottom: 12, lineHeight: 1.5, height: 50, overflow: "hidden" }}>
              {c.bio}
            </p>
            <div className="row" style={{ gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
              {c.languages.map((l) => (
                <span key={l} className="tag">{l}</span>
              ))}
            </div>
            <div className="row between" style={{ paddingTop: 10, borderTop: "1px solid var(--outline)" }}>
              <div>
                <div className="tiny muted">Sessions</div>
                <div style={{ fontWeight: 600 }}>{c.completedSessions}</div>
              </div>
              <div>
                <div className="tiny muted">Tarif horaire</div>
                <div style={{ fontWeight: 600 }}>{c.price} €</div>
              </div>
              <button className="btn outline sm" onClick={(e) => { e.stopPropagation(); setSelected(c); }}>
                <Edit3 size={12} /> Éditer
              </button>
            </div>
          </div>
        ))}
      </div>

      <CoachDrawer coach={selected} onClose={() => setSelected(null)} />
    </motion.div>
  );
}

function CoachDrawer({ coach, onClose }: { coach: Coach | null; onClose: () => void }) {
  if (!coach) return null;
  return (
    <Drawer
      open={!!coach}
      onClose={onClose}
      title={coach.name}
      subtitle={coach.specialty}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>Annuler</button>
          <button className="btn primary">
            <Save size={13} /> Enregistrer
          </button>
        </>
      }
    >
      <div className="row" style={{ gap: 14, marginBottom: 18 }}>
        <Avatar name={coach.name} size="lg" />
        <div>
          {coach.status === "available" ? (
            <StatusBadge kind="success">Disponible</StatusBadge>
          ) : (
            <StatusBadge kind="warning">Occupé</StatusBadge>
          )}
          <div className="row" style={{ gap: 4, fontSize: 13, marginTop: 4 }}>
            <Star size={13} color="#F59E0B" />
            <strong>{coach.rating}</strong>{" "}
            <span className="muted">· {coach.completedSessions} sessions</span>
          </div>
        </div>
      </div>

      <div className="form-row">
        <label className="lbl">Photo de profil</label>
        <div className="row" style={{ gap: 12 }}>
          <Avatar name={coach.name} size="lg" />
          <button className="btn outline">
            <Upload size={13} /> Changer la photo
          </button>
        </div>
      </div>
      <div className="form-row">
        <label className="lbl">Nom</label>
        <input type="text" defaultValue={coach.name} />
      </div>
      <div className="form-row">
        <label className="lbl">Spécialité</label>
        <input type="text" defaultValue={coach.specialty} />
      </div>
      <div className="form-row">
        <label className="lbl">Bio</label>
        <textarea defaultValue={coach.bio} />
      </div>

      <div className="form-row">
        <label className="lbl">Langues</label>
        <div
          className="row"
          style={{ gap: 6, padding: 8, border: "1px solid var(--outline)", borderRadius: 12, flexWrap: "wrap" }}
        >
          {coach.languages.map((l) => (
            <span
              key={l}
              className="tag"
              style={{
                background: "var(--primary-fixed)",
                color: "var(--primary)",
                padding: "4px 10px",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {l}{" "}
              <button
                type="button"
                style={{ border: "none", background: "none", padding: 0, color: "inherit", cursor: "pointer" }}
                aria-label={`Retirer ${l}`}
              >
                <X size={11} />
              </button>
            </span>
          ))}
          <input
            placeholder="Ajouter…"
            style={{ border: "none", flex: 1, minWidth: 80, padding: "4px 0", background: "transparent" }}
          />
        </div>
      </div>

      <div className="form-row split">
        <div>
          <label className="lbl">Tarif horaire (€)</label>
          <input type="number" defaultValue={coach.price} />
        </div>
        <div>
          <label className="lbl">Statut</label>
          <div className="segmented">
            <button type="button" className={cn(coach.status === "available" && "active")}>Disponible</button>
            <button type="button" className={cn(coach.status === "busy" && "active")}>Occupé</button>
          </div>
        </div>
      </div>

      <div className="card card-pad" style={{ marginTop: 16 }}>
        <div className="row between" style={{ marginBottom: 10 }}>
          <h3>Disponibilités cette semaine</h3>
          <button className="btn ghost sm">
            <ExternalLink size={12} /> Calendly
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div className="tiny muted" style={{ marginBottom: 4 }}>{d}</div>
              <div
                style={{
                  height: 60,
                  borderRadius: 8,
                  background: i < 5 ? "rgba(0,85,164,0.10)" : "var(--surface-low)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  padding: 4,
                }}
              >
                {i < 5 && (
                  <>
                    <div
                      style={{
                        height: 18,
                        background: "var(--primary)",
                        borderRadius: 3,
                        marginBottom: 2,
                        opacity: 0.85,
                      }}
                    />
                    {i % 2 === 0 && (
                      <div style={{ height: 12, background: "var(--primary)", borderRadius: 3, opacity: 0.5 }} />
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Drawer>
  );
}
