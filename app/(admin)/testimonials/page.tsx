"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  Edit3,
  Eye,
  EyeOff,
  Plus,
  Quote as QuoteIcon,
  Save,
  Search,
  Star,
  Trash2,
} from "lucide-react";

import { Avatar } from "@/components/ui/Avatar";
import { Drawer } from "@/components/ui/Drawer";
import { FilterChip } from "@/components/ui/FilterChip";
import { confirmAction } from "@/components/ui/ConfirmDialog";
import { useTestimonials } from "@/stores/useTestimonials";
import type { Goal, Testimonial } from "@/types";
import { simulateVoid } from "@/lib/api";
import { cn } from "@/lib/utils";

function emptyTestimonial(): Testimonial {
  return {
    id: `tm_${Date.now().toString(36)}`,
    name: "",
    origin: "",
    journey: "NAT",
    quote: "",
    avatarUrl: null,
    rating: 5,
    visibility: "visible",
    featured: false,
    createdAt: new Date().toISOString(),
  };
}

export default function TestimonialsPage() {
  const items = useTestimonials((s) => s.items);
  const upsert = useTestimonials((s) => s.upsert);
  const update = useTestimonials((s) => s.update);
  const remove = useTestimonials((s) => s.remove);
  const setFeatured = useTestimonials((s) => s.setFeatured);

  const sp = useSearchParams();
  const [search, setSearch] = useState("");
  const [journeyFilter, setJourneyFilter] = useState<"all" | Goal>("all");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "visible" | "hidden">("all");
  const [selected, setSelected] = useState<Testimonial | null>(null);

  useEffect(() => {
    if (sp.get("new") === "1") setSelected(emptyTestimonial());
    const focus = sp.get("focus");
    if (focus) {
      const t = items.find((i) => i.id === focus);
      if (t) setSelected(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  const filtered = useMemo(() => {
    let r = items;
    if (search) r = r.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()) || t.quote.toLowerCase().includes(search.toLowerCase()));
    if (journeyFilter !== "all") r = r.filter((t) => t.journey === journeyFilter);
    if (visibilityFilter !== "all") r = r.filter((t) => t.visibility === visibilityFilter);
    return r;
  }, [items, search, journeyFilter, visibilityFilter]);

  function toggleFeature(t: Testimonial) {
    if (t.featured) {
      update(t.id, { featured: false });
      toast.success("Mis en avant retiré");
    } else {
      const previous = items.find((i) => i.featured);
      setFeatured(t.id);
      toast.success(previous ? `« ${t.name} » mis en avant — « ${previous.name} » remis en arrière-plan` : "Mis en avant");
    }
  }

  async function handleDelete(id: string) {
    const ok = await confirmAction({
      title: "Supprimer le témoignage ?",
      message: "Le témoignage disparaîtra immédiatement de l'application.",
      destructive: true,
    });
    if (!ok) return;
    await simulateVoid();
    remove(id);
    toast.success("Témoignage supprimé");
    setSelected(null);
  }

  async function handleSave(t: Testimonial) {
    if (!t.name.trim() || !t.quote.trim()) {
      toast.error("Nom et témoignage requis");
      return;
    }
    await simulateVoid();
    upsert(t);
    toast.success("Témoignage enregistré");
    setSelected(null);
  }

  const featured = items.find((i) => i.featured);

  return (
    <motion.div className="page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <div className="page-header">
        <div className="page-title-block">
          <h1>Témoignages</h1>
          <div className="page-subtitle">
            {items.length} témoignages · {items.filter((i) => i.visibility === "visible").length} visibles
            {featured ? ` · « ${featured.name} » mis en avant` : ""}
          </div>
        </div>
        <div className="page-actions">
          <button className="btn primary" onClick={() => setSelected(emptyTestimonial())}>
            <Plus size={13} /> Nouveau témoignage
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div className="row wrap" style={{ gap: 10 }}>
          <div className="data-table-search" style={{ maxWidth: 320 }}>
            <Search size={14} className="icon" />
            <input
              placeholder="Rechercher par nom, contenu…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="muted tiny" style={{ marginLeft: 8 }}>Parcours</span>
          <FilterChip active={journeyFilter === "all"} onClick={() => setJourneyFilter("all")}>Tous</FilterChip>
          <FilterChip active={journeyFilter === "NAT"} onClick={() => setJourneyFilter("NAT")}>NAT</FilterChip>
          <FilterChip active={journeyFilter === "CSP"} onClick={() => setJourneyFilter("CSP")}>CSP</FilterChip>
          <FilterChip active={journeyFilter === "CR"} onClick={() => setJourneyFilter("CR")}>CR</FilterChip>
          <span className="muted tiny" style={{ marginLeft: 8 }}>Visibilité</span>
          <FilterChip active={visibilityFilter === "all"} onClick={() => setVisibilityFilter("all")}>Tous</FilterChip>
          <FilterChip active={visibilityFilter === "visible"} onClick={() => setVisibilityFilter("visible")}>Visibles</FilterChip>
          <FilterChip active={visibilityFilter === "hidden"} onClick={() => setVisibilityFilter("hidden")}>Masqués</FilterChip>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
        {filtered.map((t) => (
          <div
            key={t.id}
            className="card"
            style={{
              padding: 18,
              opacity: t.visibility === "hidden" ? 0.55 : 1,
              borderColor: t.featured ? "var(--primary)" : "var(--outline)",
              borderWidth: t.featured ? 2 : 1,
            }}
          >
            {t.featured && (
              <div className="row" style={{ gap: 5, marginBottom: 8, color: "var(--primary)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                <Star size={11} /> Mis en avant
              </div>
            )}
            <div className="row" style={{ gap: 12, marginBottom: 12 }}>
              <Avatar name={t.name} size="lg" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{t.name}</div>
                <div className="tiny muted">{t.origin} · Parcours {t.journey}</div>
                <div className="row" style={{ gap: 2, marginTop: 4 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={11}
                      color={i < t.rating ? "#F59E0B" : "var(--outline-variant)"}
                      fill={i < t.rating ? "#F59E0B" : "none"}
                    />
                  ))}
                </div>
              </div>
            </div>
            <QuoteIcon size={14} color="var(--text-tertiary)" style={{ marginBottom: 4 }} />
            <p style={{ fontSize: 13, lineHeight: 1.55, color: "var(--text-secondary)", margin: 0, marginBottom: 14 }}>
              « {t.quote} »
            </p>
            <div className="row between" style={{ paddingTop: 10, borderTop: "1px solid var(--outline)" }}>
              <button
                className="btn outline sm"
                onClick={() => toggleFeature(t)}
                aria-label={t.featured ? "Retirer mise en avant" : "Mettre en avant"}
              >
                <Star size={12} fill={t.featured ? "#F59E0B" : "none"} color={t.featured ? "#F59E0B" : "currentColor"} />
                {t.featured ? "Retirer" : "Mettre en avant"}
              </button>
              <div className="row" style={{ gap: 4 }}>
                <button
                  className="btn ghost sm"
                  onClick={() => {
                    update(t.id, { visibility: t.visibility === "visible" ? "hidden" : "visible" });
                    toast.success(t.visibility === "visible" ? "Masqué" : "Affiché");
                  }}
                  aria-label="Visibilité"
                >
                  {t.visibility === "visible" ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
                <button className="btn ghost sm" onClick={() => setSelected(t)} aria-label="Modifier">
                  <Edit3 size={12} />
                </button>
                <button className="btn ghost sm" onClick={() => handleDelete(t.id)} aria-label="Supprimer">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <TestimonialDrawer testimonial={selected} onClose={() => setSelected(null)} onSave={handleSave} />
    </motion.div>
  );
}

function TestimonialDrawer({
  testimonial,
  onClose,
  onSave,
}: {
  testimonial: Testimonial | null;
  onClose: () => void;
  onSave: (t: Testimonial) => void;
}) {
  const [draft, setDraft] = useState<Testimonial | null>(testimonial);
  useEffect(() => setDraft(testimonial), [testimonial]);
  if (!testimonial || !draft) return null;

  function onAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setDraft((d) => (d ? { ...d, avatarUrl: reader.result as string } : d));
    };
    reader.readAsDataURL(file);
  }

  return (
    <Drawer
      open={!!testimonial}
      onClose={onClose}
      title={testimonial.name || "Nouveau témoignage"}
      subtitle={testimonial.origin}
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
      <div className="form-row">
        <label className="lbl">Avatar</label>
        <div className="row" style={{ gap: 12 }}>
          {draft.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={draft.avatarUrl} alt="" style={{ width: 56, height: 56, borderRadius: "999px", objectFit: "cover" }} />
          ) : (
            <Avatar name={draft.name || "??"} size="lg" />
          )}
          <input type="file" accept="image/*" onChange={onAvatarFile} />
        </div>
      </div>
      <div className="form-row split">
        <div>
          <label className="lbl">Nom</label>
          <input type="text" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        </div>
        <div>
          <label className="lbl">Origine</label>
          <input type="text" value={draft.origin} onChange={(e) => setDraft({ ...draft, origin: e.target.value })} />
        </div>
      </div>
      <div className="form-row split">
        <div>
          <label className="lbl">Parcours</label>
          <select value={draft.journey} onChange={(e) => setDraft({ ...draft, journey: e.target.value as Goal })}>
            <option value="NAT">Naturalisation</option>
            <option value="CSP">Carte de séjour</option>
            <option value="CR">Carte de résident</option>
          </select>
        </div>
        <div>
          <label className="lbl">Note</label>
          <select value={draft.rating} onChange={(e) => setDraft({ ...draft, rating: parseInt(e.target.value, 10) })}>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{n} ★</option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-row">
        <label className="lbl">Témoignage</label>
        <textarea
          value={draft.quote}
          onChange={(e) => setDraft({ ...draft, quote: e.target.value })}
          style={{ minHeight: 120 }}
        />
      </div>
      <div className="form-row split">
        <div>
          <label className="lbl">Visibilité</label>
          <div className="segmented">
            <button type="button" className={cn(draft.visibility === "visible" && "active")} onClick={() => setDraft({ ...draft, visibility: "visible" })}>Visible</button>
            <button type="button" className={cn(draft.visibility === "hidden" && "active")} onClick={() => setDraft({ ...draft, visibility: "hidden" })}>Masqué</button>
          </div>
        </div>
        <div>
          <label className="lbl">Mise en avant</label>
          <div className="segmented">
            <button type="button" className={cn(!draft.featured && "active")} onClick={() => setDraft({ ...draft, featured: false })}>Standard</button>
            <button type="button" className={cn(draft.featured && "active")} onClick={() => setDraft({ ...draft, featured: true })}>Hero</button>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
