"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  AlertCircle,
  Building2,
  Flag,
  Map,
  MapPin,
  MoreHorizontal,
  Plus,
  Save,
  Search,
  Upload,
} from "lucide-react";

import { KpiCard } from "@/components/ui/KpiCard";
import { FilterChip } from "@/components/ui/FilterChip";
import { Drawer } from "@/components/ui/Drawer";
import { Pagination } from "@/components/ui/Pagination";
import { Th } from "@/components/ui/DataTableHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CENTERS } from "@/data/centers";
import type { Center, CenterStatus, Goal } from "@/types";
import { cn } from "@/lib/utils";

type SortField = keyof Center;
type Sort = { field: SortField; dir: "asc" | "desc" };

const COORDS: Record<string, [number, number]> = {
  Paris: [50, 26], Marseille: [62, 84], Lyon: [62, 56], Toulouse: [43, 82],
  Nice: [76, 80], Nantes: [27, 50], Strasbourg: [80, 31], Montpellier: [54, 82],
  Bordeaux: [32, 70], Lille: [54, 9], Rennes: [25, 38], Reims: [60, 22],
  Nancy: [73, 26], "Clermont-Ferrand": [54, 64], Rouen: [44, 22], Grenoble: [69, 64],
  Dijon: [65, 44], Tours: [42, 44], Angers: [32, 45], Brest: [10, 36],
  Metz: [73, 22], Mulhouse: [82, 38], Calais: [49, 4], Toulon: [70, 86],
  Orléans: [50, 38], Créteil: [51, 27], Nanterre: [49, 26], Bobigny: [51, 25],
  Versailles: [49, 27], Évry: [51, 30],
};

export default function CentersPage() {
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState<"all" | Goal>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | CenterStatus>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sort, setSort] = useState<Sort>({ field: "name", dir: "asc" });
  const [selected, setSelected] = useState<Center | null>(null);

  const onSort = (f: SortField) =>
    setSort((s) => ({ field: f, dir: s.field === f ? (s.dir === "asc" ? "desc" : "asc") : "asc" }));

  const filtered = useMemo(() => {
    let r = CENTERS;
    if (search) {
      const s = search.toLowerCase();
      r = r.filter(
        (c) =>
          c.name.toLowerCase().includes(s) ||
          c.city.toLowerCase().includes(s) ||
          c.department.includes(s),
      );
    }
    if (serviceFilter !== "all") r = r.filter((c) => c.services.includes(serviceFilter));
    if (statusFilter !== "all") r = r.filter((c) => c.status === statusFilter);
    r = [...r].sort((a, b) => {
      const va = a[sort.field] as string | number;
      const vb = b[sort.field] as string | number;
      if (va < vb) return sort.dir === "asc" ? -1 : 1;
      if (va > vb) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
    return r;
  }, [search, serviceFilter, statusFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => {
    setPage(1);
  }, [search, serviceFilter, statusFilter]);

  const topCities = useMemo(() => {
    const m: Record<string, number> = {};
    CENTERS.forEach((c) => {
      m[c.city] = (m[c.city] || 0) + 1;
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 12);
  }, []);

  return (
    <motion.div
      className="page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="page-header">
        <div className="page-title-block">
          <h1>Centres d&apos;examen</h1>
          <div className="page-subtitle">
            {CENTERS.length} centres répartis sur {new Set(CENTERS.map((c) => c.city)).size} villes et{" "}
            {new Set(CENTERS.map((c) => c.department)).size} départements
          </div>
        </div>
        <div className="page-actions">
          <button className="btn outline">
            <Upload size={13} /> Importer
          </button>
          <button className="btn primary">
            <MapPin size={13} /> Nouveau centre
          </button>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <KpiCard
          icon={Building2}
          label="Centres actifs"
          value={CENTERS.filter((c) => c.status === "active").length}
          trend={2.1}
        />
        <KpiCard icon={Map} label="Villes couvertes" value={new Set(CENTERS.map((c) => c.city)).size} />
        <KpiCard icon={Flag} label="Départements" value={new Set(CENTERS.map((c) => c.department)).size} />
        <KpiCard icon={AlertCircle} label="À mettre à jour" value="14" trendLabel=">90j" />
      </div>

      <div className="chart-grid" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: 18 }}>
        <div className="chart-card">
          <div className="head">
            <div>
              <h3>Couverture territoriale</h3>
              <div className="sub">Carte simplifiée — dimensionnement par densité de centres</div>
            </div>
            <div className="row" style={{ gap: 14, fontSize: 12 }}>
              <span className="row" style={{ gap: 5 }}>
                <span style={{ width: 9, height: 9, background: "var(--primary)", borderRadius: 999 }} /> Actif
              </span>
              <span className="row" style={{ gap: 5 }}>
                <span style={{ width: 9, height: 9, background: "var(--secondary)", borderRadius: 999 }} /> Inactif
              </span>
            </div>
          </div>
          <FranceMap centers={CENTERS} onCityClick={(city) => setSearch(city)} />
        </div>
        <div className="chart-card">
          <div className="head">
            <div>
              <h3>Top villes</h3>
              <div className="sub">Nombre de centres par ville</div>
            </div>
          </div>
          <div className="col" style={{ gap: 8 }}>
            {topCities.map(([city, count]) => (
              <div key={city} className="row" style={{ gap: 12 }}>
                <span style={{ flex: 1, fontWeight: 500 }}>{city}</span>
                <div className="progress" style={{ flex: 1, maxWidth: 180 }}>
                  <span style={{ width: `${(count / topCities[0]![1]) * 100}%` }} />
                </div>
                <span
                  style={{
                    minWidth: 40,
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                    fontWeight: 600,
                  }}
                >
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="data-table-wrap">
        <div className="data-table-toolbar">
          <div className="data-table-search">
            <Search size={14} className="icon" />
            <input
              placeholder="Rechercher un centre, une ville, un département…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="data-table-filters">
            <span className="muted tiny" style={{ marginRight: 4 }}>Service</span>
            <FilterChip active={serviceFilter === "all"} onClick={() => setServiceFilter("all")}>Tous</FilterChip>
            <FilterChip active={serviceFilter === "NAT"} onClick={() => setServiceFilter("NAT")}>NAT</FilterChip>
            <FilterChip active={serviceFilter === "CSP"} onClick={() => setServiceFilter("CSP")}>CSP</FilterChip>
            <FilterChip active={serviceFilter === "CR"} onClick={() => setServiceFilter("CR")}>CR</FilterChip>
            <span className="muted tiny" style={{ margin: "0 4px 0 8px" }}>Statut</span>
            <FilterChip active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>Tous</FilterChip>
            <FilterChip active={statusFilter === "active"} onClick={() => setStatusFilter("active")}>Actifs</FilterChip>
            <FilterChip active={statusFilter === "inactive"} onClick={() => setStatusFilter("inactive")}>Inactifs</FilterChip>
          </div>
        </div>

        <div className="scroll-x">
          <table className="data-table">
            <thead>
              <tr>
                <Th field="name" sortField={sort.field} sortDir={sort.dir} onSort={onSort}>Nom</Th>
                <Th field="city" sortField={sort.field} sortDir={sort.dir} onSort={onSort}>Ville</Th>
                <Th field="department" sortField={sort.field} sortDir={sort.dir} onSort={onSort}>Département</Th>
                <th>Adresse</th>
                <th>Services</th>
                <th>Téléphone</th>
                <Th field="status" sortField={sort.field} sortDir={sort.dir} onSort={onSort}>Statut</Th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((c) => (
                <tr key={c.id} className={cn(selected?.id === c.id && "selected")} onClick={() => setSelected(c)}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td>{c.city}</td>
                  <td className="muted">
                    <code style={{ fontSize: 11.5 }}>{c.department}</code> {c.departmentName}
                  </td>
                  <td className="col-truncate muted" style={{ maxWidth: 260, fontSize: 12 }}>{c.address}</td>
                  <td>
                    <div className="row" style={{ gap: 4 }}>
                      {c.services.map((s) => (
                        <span key={s} className="badge info" style={{ fontSize: 10 }}>{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="muted" style={{ fontSize: 12, fontVariantNumeric: "tabular-nums" }}>{c.phone}</td>
                  <td>
                    {c.status === "active" ? (
                      <StatusBadge kind="success">Actif</StatusBadge>
                    ) : (
                      <StatusBadge kind="error">Inactif</StatusBadge>
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

      <CenterDrawer center={selected} onClose={() => setSelected(null)} />
    </motion.div>
  );
}

function FranceMap({
  centers,
  onCityClick,
}: {
  centers: Center[];
  onCityClick: (city: string) => void;
}) {
  const cityCounts = useMemo(() => {
    const m: Record<string, { active: number; inactive: number }> = {};
    centers.forEach((c) => {
      if (!m[c.city]) m[c.city] = { active: 0, inactive: 0 };
      m[c.city]![c.status === "active" ? "active" : "inactive"]++;
    });
    return m;
  }, [centers]);

  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1.05", maxWidth: 460, margin: "0 auto" }}>
      <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", display: "block" }}>
        <path
          d="M 50 4 C 56 4 62 6 66 9 L 78 12 L 84 22 L 88 35 L 84 48 L 76 56 L 78 68 L 74 80 L 68 88 L 60 92 L 50 94 L 38 90 L 28 84 L 22 72 L 16 60 L 12 48 L 14 36 L 10 26 L 14 18 L 22 12 L 32 10 L 42 8 Z"
          fill="#f7f9fb"
          stroke="#ccc7d0"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />
        <g opacity="0.35" stroke="#e5e7eb" strokeWidth="0.2">
          {[20, 40, 60, 80].map((x) => (
            <line key={`v${x}`} x1={x} y1="4" x2={x} y2="94" />
          ))}
          {[20, 40, 60, 80].map((y) => (
            <line key={`h${y}`} x1="10" y1={y} x2="90" y2={y} />
          ))}
        </g>
        <text x="50" y="18" textAnchor="middle" fontSize="2.5" fill="#79747e" fontWeight="500">Île-de-France</text>
        <text x="74" y="58" textAnchor="middle" fontSize="2.5" fill="#79747e" fontWeight="500">AURA</text>
        <text x="38" y="78" textAnchor="middle" fontSize="2.5" fill="#79747e" fontWeight="500">Occitanie</text>
        <text x="22" y="48" textAnchor="middle" fontSize="2.5" fill="#79747e" fontWeight="500">Bretagne</text>

        {Object.entries(cityCounts).map(([city, counts]) => {
          const c = COORDS[city];
          if (!c) return null;
          const total = counts.active + counts.inactive;
          const r = Math.min(3.5, 1 + Math.sqrt(total) * 0.5);
          const isActive = counts.active > 0;
          return (
            <g key={city} style={{ cursor: "pointer" }} onClick={() => onCityClick(city)}>
              <circle cx={c[0]} cy={c[1]} r={r + 1.5} fill={isActive ? "#0055A4" : "#EF4135"} opacity="0.15" />
              <circle
                cx={c[0]}
                cy={c[1]}
                r={r}
                fill={isActive ? "#0055A4" : "#EF4135"}
                opacity="0.85"
                stroke="white"
                strokeWidth="0.4"
              />
              <text x={c[0]} y={c[1] - r - 0.6} textAnchor="middle" fontSize="2.2" fill="#0A0F1E" fontWeight="600">
                {city}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function CenterDrawer({ center, onClose }: { center: Center | null; onClose: () => void }) {
  if (!center) return null;
  return (
    <Drawer
      open={!!center}
      onClose={onClose}
      title={center.name}
      subtitle={`${center.departmentName} (${center.department}) · ${center.city}`}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>Annuler</button>
          <button className="btn primary">
            <Save size={13} /> Enregistrer
          </button>
        </>
      }
    >
      <div className="form-row">
        <label className="lbl">Nom du centre</label>
        <input type="text" defaultValue={center.name} />
      </div>
      <div className="form-row split">
        <div>
          <label className="lbl">Ville</label>
          <input type="text" defaultValue={center.city} />
        </div>
        <div>
          <label className="lbl">Département</label>
          <input type="text" defaultValue={center.department} />
        </div>
      </div>
      <div className="form-row">
        <label className="lbl">Adresse complète</label>
        <textarea defaultValue={center.address} style={{ minHeight: 60 }} />
      </div>
      <div className="form-row">
        <label className="lbl">Téléphone</label>
        <input type="text" defaultValue={center.phone} />
      </div>
      <div className="form-row">
        <label className="lbl">Services proposés</label>
        <div className="row" style={{ gap: 6 }}>
          {(["NAT", "CSP", "CR"] as Goal[]).map((s) => (
            <button
              key={s}
              type="button"
              className={cn("filter-chip", center.services.includes(s) && "active")}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="form-row">
        <label className="lbl">Statut</label>
        <div className="segmented">
          <button type="button" className={cn(center.status === "active" && "active")}>Actif</button>
          <button type="button" className={cn(center.status === "inactive" && "active")}>Inactif</button>
        </div>
      </div>

      <div className="card card-pad" style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 10 }}>FAQ locale</h3>
        <div className="muted tiny" style={{ marginBottom: 10 }}>
          Questions / réponses spécifiques à ce centre, affichées dans l&apos;app.
        </div>
        {[
          { q: "Faut-il prendre rendez-vous ?", a: "Oui, exclusivement via le site de la préfecture." },
          { q: "Combien de temps dure l'entretien ?", a: "Entre 30 et 45 minutes." },
        ].map((f, i) => (
          <div
            key={i}
            style={{ padding: 10, border: "1px solid var(--outline)", borderRadius: 10, marginBottom: 8 }}
          >
            <input
              type="text"
              defaultValue={f.q}
              style={{ width: "100%", border: "none", padding: 0, fontWeight: 500, marginBottom: 6 }}
            />
            <textarea
              defaultValue={f.a}
              style={{ width: "100%", border: "none", padding: 0, fontSize: 13, minHeight: 30, resize: "vertical" }}
            />
          </div>
        ))}
        <button className="btn outline sm">
          <Plus size={12} /> Ajouter une question
        </button>
      </div>
    </Drawer>
  );
}
