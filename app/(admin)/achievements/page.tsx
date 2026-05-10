"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";
import * as Lucide from "lucide-react";
import {
  Archive,
  ArchiveRestore,
  Award,
  Edit3,
  Plus,
  Save,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";

import { Drawer } from "@/components/ui/Drawer";
import { FilterChip } from "@/components/ui/FilterChip";
import { confirmAction } from "@/components/ui/ConfirmDialog";
import { useAchievements } from "@/stores/useAchievements";
import { ACHIEVEMENT_DSL_FIELDS, DEMO_USER_FOR_RULES, evalCondition } from "@/data/achievements";
import type { Achievement, AchievementCategory } from "@/types";
import { simulateVoid } from "@/lib/api";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  engagement: "Engagement",
  performance: "Performance",
  exploration: "Exploration",
  loyalty: "Fidélité",
};

function emptyAchievement(): Achievement {
  return {
    id: `ach_${Date.now().toString(36)}`,
    title: "",
    description: "",
    icon: "Award",
    condition: "questionsAnswered >= 1",
    category: "engagement",
    visibility: "active",
    unlockedRate: 0,
  };
}

function lookupIcon(name: string): React.ComponentType<{ size?: number }> {
  const map = Lucide as unknown as Record<string, React.ComponentType<{ size?: number }>>;
  return map[name] ?? Award;
}

const COMMON_ICONS = [
  "Award", "Sparkles", "Target", "Flame", "Crown", "ShieldCheck", "Compass",
  "BookOpen", "Scale", "Star", "Trophy", "Medal", "Zap", "Heart", "Rocket",
  "Mountain", "Map", "Brain", "Lightbulb", "CheckCircle2",
];

export default function AchievementsPage() {
  const items = useAchievements((s) => s.items);
  const upsert = useAchievements((s) => s.upsert);
  const update = useAchievements((s) => s.update);
  const remove = useAchievements((s) => s.remove);
  const bulkUpdate = useAchievements((s) => s.bulkUpdate);

  const sp = useSearchParams();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<"all" | AchievementCategory>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "archived">("all");
  const [bulk, setBulk] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<Achievement | null>(null);

  useEffect(() => {
    if (sp.get("new") === "1") setSelected(emptyAchievement());
  }, [sp]);

  const filtered = useMemo(() => {
    let r = items;
    if (search) r = r.filter((a) => a.title.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase()));
    if (catFilter !== "all") r = r.filter((a) => a.category === catFilter);
    if (statusFilter !== "all") r = r.filter((a) => a.visibility === statusFilter);
    return r;
  }, [items, search, catFilter, statusFilter]);

  const totalSelected = Object.values(bulk).filter(Boolean).length;

  async function handleDelete(id: string) {
    const ok = await confirmAction({
      title: "Supprimer ce succès ?",
      message: "Les utilisateurs perdront le badge.",
      destructive: true,
    });
    if (!ok) return;
    await simulateVoid();
    remove(id);
    toast.success("Succès supprimé");
    setSelected(null);
  }

  async function handleBulk(action: "archive" | "activate") {
    const ids = Object.entries(bulk).filter(([, v]) => v).map(([k]) => k);
    await simulateVoid();
    bulkUpdate(ids, { visibility: action === "archive" ? "archived" : "active" });
    toast.success(`${ids.length} succès ${action === "archive" ? "archivé(s)" : "activé(s)"}`);
    setBulk({});
  }

  async function handleSave(a: Achievement) {
    if (!a.title.trim()) {
      toast.error("Le titre est requis");
      return;
    }
    await simulateVoid();
    upsert(a);
    toast.success("Succès enregistré");
    setSelected(null);
  }

  return (
    <motion.div className="page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <div className="page-header">
        <div className="page-title-block">
          <h1>Succès</h1>
          <div className="page-subtitle">
            {items.length} badges · {items.filter((i) => i.visibility === "active").length} actifs
          </div>
        </div>
        <div className="page-actions">
          <button className="btn primary" onClick={() => setSelected(emptyAchievement())}>
            <Plus size={13} /> Nouveau succès
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div className="row wrap" style={{ gap: 10 }}>
          <div className="data-table-search" style={{ maxWidth: 320 }}>
            <Search size={14} className="icon" />
            <input
              placeholder="Rechercher un succès…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="muted tiny" style={{ marginLeft: 8 }}>Catégorie</span>
          <FilterChip active={catFilter === "all"} onClick={() => setCatFilter("all")}>Toutes</FilterChip>
          {(Object.keys(CATEGORY_LABELS) as AchievementCategory[]).map((c) => (
            <FilterChip key={c} active={catFilter === c} onClick={() => setCatFilter(c)}>{CATEGORY_LABELS[c]}</FilterChip>
          ))}
          <span className="muted tiny" style={{ marginLeft: 8 }}>Statut</span>
          <FilterChip active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>Tous</FilterChip>
          <FilterChip active={statusFilter === "active"} onClick={() => setStatusFilter("active")}>Actifs</FilterChip>
          <FilterChip active={statusFilter === "archived"} onClick={() => setStatusFilter("archived")}>Archivés</FilterChip>
        </div>
        {totalSelected > 0 && (
          <div className="row" style={{ gap: 6, marginTop: 10 }}>
            <strong>{totalSelected} sélectionné(s)</strong>
            <button className="btn sm secondary" onClick={() => handleBulk("archive")}>
              <Archive size={12} /> Archiver
            </button>
            <button className="btn sm secondary" onClick={() => handleBulk("activate")}>
              <ArchiveRestore size={12} /> Activer
            </button>
            <button className="btn sm ghost" onClick={() => setBulk({})} style={{ marginLeft: "auto" }}>Tout désélectionner</button>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
        {filtered.map((a) => {
          const Icon = lookupIcon(a.icon);
          const isSelected = !!bulk[a.id];
          return (
            <div
              key={a.id}
              className="card"
              style={{
                padding: 18,
                opacity: a.visibility === "archived" ? 0.55 : 1,
                borderColor: isSelected ? "var(--primary)" : "var(--outline)",
              }}
              onClick={() => setBulk({ ...bulk, [a.id]: !isSelected })}
            >
              <div className="row between" style={{ marginBottom: 10 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "var(--primary-fixed)",
                    color: "var(--primary)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Icon size={20} />
                </div>
                <span className="badge neutral">{CATEGORY_LABELS[a.category]}</span>
              </div>
              <h3 style={{ fontSize: 15, marginBottom: 4 }}>{a.title || "Sans titre"}</h3>
              <p className="muted" style={{ fontSize: 12, lineHeight: 1.5, marginBottom: 12 }}>{a.description}</p>
              <div className="row between" style={{ paddingTop: 10, borderTop: "1px solid var(--outline)" }}>
                <div>
                  <div className="tiny muted">Débloqué par</div>
                  <div style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{a.unlockedRate}%</div>
                </div>
                <div className="row" style={{ gap: 4 }}>
                  <button
                    className="btn ghost sm"
                    onClick={(e) => { e.stopPropagation(); update(a.id, { visibility: a.visibility === "active" ? "archived" : "active" }); toast.success(a.visibility === "active" ? "Archivé" : "Activé"); }}
                    aria-label="Toggle archive"
                  >
                    {a.visibility === "active" ? <Archive size={12} /> : <ArchiveRestore size={12} />}
                  </button>
                  <button className="btn ghost sm" onClick={(e) => { e.stopPropagation(); setSelected(a); }} aria-label="Modifier">
                    <Edit3 size={12} />
                  </button>
                  <button className="btn ghost sm" onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }} aria-label="Supprimer">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AchievementDrawer achievement={selected} onClose={() => setSelected(null)} onSave={handleSave} />
    </motion.div>
  );
}

function AchievementDrawer({
  achievement,
  onClose,
  onSave,
}: {
  achievement: Achievement | null;
  onClose: () => void;
  onSave: (a: Achievement) => void;
}) {
  const [draft, setDraft] = useState<Achievement | null>(achievement);
  const [iconSearch, setIconSearch] = useState("");
  useEffect(() => setDraft(achievement), [achievement]);
  if (!achievement || !draft) return null;

  const Icon = lookupIcon(draft.icon);
  const matchesDemo = (() => {
    try {
      return evalCondition(draft.condition, DEMO_USER_FOR_RULES);
    } catch {
      return false;
    }
  })();

  const filteredIcons = COMMON_ICONS.filter((n) => n.toLowerCase().includes(iconSearch.toLowerCase()));

  return (
    <Drawer
      open={!!achievement}
      onClose={onClose}
      wide
      title={achievement.title || "Nouveau succès"}
      subtitle="Badge déblocable"
      footer={
        <>
          <span className="save-state" />
          <button className="btn ghost" onClick={onClose}>Annuler</button>
          <button className="btn primary" onClick={() => onSave(draft)}>
            <Save size={13} /> Enregistrer
          </button>
        </>
      }
    >
      <div className="row" style={{ gap: 14, marginBottom: 16 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: "var(--primary-fixed)",
            color: "var(--primary)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Icon size={26} />
        </div>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="Titre du succès"
            style={{ fontSize: 18, fontWeight: 600 }}
          />
          <div style={{ marginTop: 8 }}>
            <input
              type="text"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Description courte"
            />
          </div>
        </div>
      </div>

      <div className="form-row">
        <label className="lbl">Icône</label>
        <div
          className="row"
          style={{
            gap: 8,
            padding: 8,
            border: "1px solid var(--outline)",
            borderRadius: 12,
            flexWrap: "wrap",
            maxHeight: 160,
            overflowY: "auto",
          }}
        >
          <input
            placeholder="Filtrer…"
            value={iconSearch}
            onChange={(e) => setIconSearch(e.target.value)}
            style={{ flex: "1 1 100%", border: "none", outline: "none", padding: "4px 8px" }}
          />
          {filteredIcons.map((name) => {
            const I = lookupIcon(name);
            const sel = draft.icon === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => setDraft({ ...draft, icon: name })}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  border: sel ? "2px solid var(--primary)" : "1px solid var(--outline)",
                  background: sel ? "var(--primary-fixed)" : "white",
                  color: sel ? "var(--primary)" : "var(--text-secondary)",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                }}
                aria-label={name}
                title={name}
              >
                <I size={16} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="form-row split">
        <div>
          <label className="lbl">Catégorie</label>
          <select
            value={draft.category}
            onChange={(e) => setDraft({ ...draft, category: e.target.value as AchievementCategory })}
          >
            {(Object.keys(CATEGORY_LABELS) as AchievementCategory[]).map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="lbl">Statut</label>
          <div className="segmented">
            <button type="button" className={cn(draft.visibility === "active" && "active")} onClick={() => setDraft({ ...draft, visibility: "active" })}>Actif</button>
            <button type="button" className={cn(draft.visibility === "archived" && "active")} onClick={() => setDraft({ ...draft, visibility: "archived" })}>Archivé</button>
          </div>
        </div>
      </div>

      <div className="form-row">
        <label className="lbl">Condition de déblocage (DSL)</label>
        <textarea
          value={draft.condition}
          onChange={(e) => setDraft({ ...draft, condition: e.target.value })}
          style={{ minHeight: 70, fontFamily: "ui-monospace, monospace", fontSize: 13 }}
        />
        <div className="hint">
          Champs disponibles :{" "}
          {ACHIEVEMENT_DSL_FIELDS.map((f) => (
            <code
              key={f}
              style={{ marginRight: 6, padding: "1px 6px", background: "var(--surface-low)", borderRadius: 4, cursor: "pointer" }}
              onClick={() => setDraft({ ...draft, condition: `${draft.condition} && ${f} >= 1`.trim() })}
            >
              {f}
            </code>
          ))}
        </div>
      </div>

      <div
        className="card card-pad"
        style={{
          background: matchesDemo ? "rgba(16,185,129,0.06)" : "rgba(239,65,53,0.05)",
          borderColor: matchesDemo ? "var(--success)" : "var(--outline)",
        }}
      >
        <div className="row between" style={{ marginBottom: 8 }}>
          <strong>Test sur l&apos;utilisateur démo</strong>
          {matchesDemo ? (
            <span className="badge success dot">Débloqué</span>
          ) : (
            <span className="badge error dot">Non débloqué</span>
          )}
        </div>
        <div className="tiny muted">
          {Object.entries(DEMO_USER_FOR_RULES).map(([k, v]) => `${k}=${v}`).join(" · ")}
        </div>
      </div>

      <div className="hint" style={{ marginTop: 12 }}>
        <Sparkles size={12} /> DSL minimal : <code>field op value</code>, séparateurs <code>&amp;&amp;</code>. Opérateurs : <code>&gt;=</code>, <code>&lt;=</code>, <code>&gt;</code>, <code>&lt;</code>, <code>==</code>.
      </div>
    </Drawer>
  );
}
