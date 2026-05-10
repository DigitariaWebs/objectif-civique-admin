"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Edit3,
  Eye,
  EyeOff,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Drawer } from "@/components/ui/Drawer";
import { confirmAction } from "@/components/ui/ConfirmDialog";
import { useCoachingOffers } from "@/stores/useCoachingOffers";
import type { CoachOffer } from "@/types";
import { simulateVoid } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function CoachingOffersPage() {
  const offers = useCoachingOffers((s) => s.items);
  const upsert = useCoachingOffers((s) => s.upsert);
  const remove = useCoachingOffers((s) => s.remove);

  const [editing, setEditing] = useState<CoachOffer | null>(null);

  const funnel = useMemo(() => {
    const totalRev = offers.reduce((s, o) => s + o.revenueMonth, 0);
    const totalConv = offers.reduce((s, o) => s + o.conversionsMonth, 0);
    return [
      { step: "Impressions", value: 9420 },
      { step: "Clics", value: 1840 },
      { step: "Achats", value: totalConv },
      { step: "Upsell", value: Math.round(totalConv * 0.18) },
      // hidden total to derive label
      { step: "Revenu", value: totalRev },
    ];
  }, [offers]);

  async function handleDelete(id: string) {
    const ok = await confirmAction({
      title: "Supprimer cette offre ?",
      message: "Action irréversible.",
      destructive: true,
    });
    if (!ok) return;
    await simulateVoid();
    remove(id);
    toast.success("Offre supprimée");
  }

  return (
    <motion.div className="page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <div className="page-header">
        <div className="page-title-block">
          <h1>Offres de coaching</h1>
          <div className="page-subtitle">{offers.length} offres · conversions sur 30 jours</div>
        </div>
      </div>

      <div className="chart-card" style={{ marginBottom: 16 }}>
        <div className="head">
          <div>
            <h3>Funnel de conversion — 30 derniers jours</h3>
            <div className="sub">Impressions → clics → achats → upsells</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={funnel.slice(0, 4)} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="#f2f4f6" vertical={false} />
            <XAxis dataKey="step" tick={{ fontSize: 11, fill: "#79747e" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#79747e" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 12 }} />
            <Bar dataKey="value" fill="#0055A4" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
        {offers.map((o) => (
          <div
            key={o.id}
            className="card card-pad"
            style={{
              opacity: o.visibility === "hidden" ? 0.55 : 1,
              borderColor: o.highlight ? "var(--primary)" : "var(--outline)",
              borderWidth: o.highlight ? 2 : 1,
              position: "relative",
            }}
          >
            {o.badge && (
              <span className="badge info" style={{ position: "absolute", top: 12, right: 12, fontSize: 10 }}>
                {o.badge}
              </span>
            )}
            <h2 style={{ fontSize: 17, marginBottom: 4 }}>{o.title}</h2>
            <div style={{ marginBottom: 10 }}>
              <span style={{ fontFamily: "Satoshi, sans-serif", fontSize: 28, fontWeight: 700, color: "var(--tertiary)" }}>
                {o.priceLabel}
              </span>
              <span className="muted" style={{ fontSize: 13 }}> {o.period}</span>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, marginBottom: 14, fontSize: 12.5 }}>
              {o.features.map((f, i) => (
                <li key={i} className="row" style={{ gap: 6, padding: "4px 0" }}>
                  <Check size={12} color="var(--success)" /> {f}
                </li>
              ))}
            </ul>
            <div className="row" style={{ gap: 10, padding: "10px 0", borderTop: "1px solid var(--outline)", borderBottom: "1px solid var(--outline)", marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <div className="tiny muted">Conversions</div>
                <div style={{ fontWeight: 600, fontSize: 16, fontVariantNumeric: "tabular-nums" }}>{o.conversionsMonth}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div className="tiny muted">Revenu / mois</div>
                <div style={{ fontWeight: 600, fontSize: 16, fontVariantNumeric: "tabular-nums" }}>{o.revenueMonth.toLocaleString("fr-FR")} €</div>
              </div>
            </div>
            <div className="row between">
              <button className="btn outline sm" onClick={() => setEditing(o)}>
                <Edit3 size={12} /> Modifier
              </button>
              <div className="row" style={{ gap: 4 }}>
                <button
                  className="btn ghost sm"
                  onClick={() => {
                    upsert({ ...o, visibility: o.visibility === "visible" ? "hidden" : "visible" });
                    toast.success(o.visibility === "visible" ? "Masquée" : "Affichée");
                  }}
                  aria-label="Visibilité"
                >
                  {o.visibility === "visible" ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
                <button className="btn ghost sm" onClick={() => handleDelete(o.id)} aria-label="Supprimer">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <OfferDrawer offer={editing} onClose={() => setEditing(null)} />
    </motion.div>
  );
}

function OfferDrawer({ offer, onClose }: { offer: CoachOffer | null; onClose: () => void }) {
  const upsert = useCoachingOffers((s) => s.upsert);
  const [draft, setDraft] = useState<CoachOffer | null>(offer);
  if (!offer) return null;
  if (!draft || draft.id !== offer.id) {
    setDraft(offer);
    return null;
  }

  function moveFeature(i: number, dir: -1 | 1) {
    if (!draft) return;
    const swap = i + dir;
    if (swap < 0 || swap >= draft.features.length) return;
    const features = [...draft.features];
    [features[i], features[swap]] = [features[swap]!, features[i]!];
    setDraft({ ...draft, features });
  }

  return (
    <Drawer
      open={!!offer}
      onClose={onClose}
      title={`Offre « ${offer.title} »`}
      subtitle={offer.id}
      footer={
        <>
          <span className="save-state" />
          <button className="btn ghost" onClick={onClose}>Annuler</button>
          <button
            className="btn primary"
            onClick={async () => {
              await simulateVoid();
              upsert(draft);
              toast.success("Offre enregistrée");
              onClose();
            }}
          >
            <Save size={13} /> Enregistrer
          </button>
        </>
      }
    >
      <div className="form-row split">
        <div>
          <label className="lbl">Titre</label>
          <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        </div>
        <div>
          <label className="lbl">Badge</label>
          <input value={draft.badge ?? ""} onChange={(e) => setDraft({ ...draft, badge: e.target.value || undefined })} />
        </div>
      </div>
      <div className="form-row split">
        <div>
          <label className="lbl">Prix</label>
          <input type="number" step="0.01" value={draft.price} onChange={(e) => setDraft({ ...draft, price: parseFloat(e.target.value) })} />
        </div>
        <div>
          <label className="lbl">Prix affiché</label>
          <input value={draft.priceLabel} onChange={(e) => setDraft({ ...draft, priceLabel: e.target.value })} />
        </div>
      </div>
      <div className="form-row">
        <label className="lbl">Période</label>
        <input value={draft.period} onChange={(e) => setDraft({ ...draft, period: e.target.value })} />
      </div>
      <div className="form-row split">
        <div>
          <label className="lbl">Mise en avant</label>
          <div className="segmented">
            <button type="button" className={cn(!draft.highlight && "active")} onClick={() => setDraft({ ...draft, highlight: false })}>Standard</button>
            <button type="button" className={cn(draft.highlight && "active")} onClick={() => setDraft({ ...draft, highlight: true })}>Mis en avant</button>
          </div>
        </div>
        <div>
          <label className="lbl">Visibilité</label>
          <div className="segmented">
            <button type="button" className={cn(draft.visibility === "visible" && "active")} onClick={() => setDraft({ ...draft, visibility: "visible" })}>Visible</button>
            <button type="button" className={cn(draft.visibility === "hidden" && "active")} onClick={() => setDraft({ ...draft, visibility: "hidden" })}>Masquée</button>
          </div>
        </div>
      </div>
      <div className="form-row">
        <label className="lbl">Caractéristiques</label>
        <div className="col" style={{ gap: 6 }}>
          {draft.features.map((f, i) => (
            <div key={i} className="row" style={{ gap: 6 }}>
              <input
                type="text"
                value={f}
                onChange={(e) => {
                  const features = [...draft.features];
                  features[i] = e.target.value;
                  setDraft({ ...draft, features });
                }}
                style={{ flex: 1 }}
              />
              <button className="btn ghost sm" onClick={() => moveFeature(i, -1)} disabled={i === 0}><ArrowUp size={11} /></button>
              <button className="btn ghost sm" onClick={() => moveFeature(i, 1)} disabled={i === draft.features.length - 1}><ArrowDown size={11} /></button>
              <button
                className="btn ghost sm"
                onClick={() => setDraft({ ...draft, features: draft.features.filter((_, idx) => idx !== i) })}
              >
                <X size={11} />
              </button>
            </div>
          ))}
          <button
            className="btn outline sm"
            onClick={() => setDraft({ ...draft, features: [...draft.features, "Nouvelle caractéristique"] })}
            style={{ alignSelf: "flex-start" }}
          >
            <Plus size={11} /> Ajouter
          </button>
        </div>
      </div>
    </Drawer>
  );
}
