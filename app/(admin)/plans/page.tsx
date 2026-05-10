"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Edit3,
  Eye,
  EyeOff,
  History,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";

import { Drawer } from "@/components/ui/Drawer";
import { confirmAction } from "@/components/ui/ConfirmDialog";
import { usePlans } from "@/stores/usePlans";
import type { SubscriptionPlan } from "@/types";
import { simulateVoid } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function PlansPage() {
  const plans = usePlans((s) => s.plans);
  const update = usePlans((s) => s.update);
  const remove = usePlans((s) => s.remove);

  const [editing, setEditing] = useState<SubscriptionPlan | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  async function handleDelete(id: string) {
    const ok = await confirmAction({
      title: "Supprimer ce plan ?",
      message: "Le plan disparaîtra de la paywall.",
      destructive: true,
    });
    if (!ok) return;
    await simulateVoid();
    remove(id);
    toast.success("Plan supprimé");
  }

  return (
    <motion.div className="page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <div className="page-header">
        <div className="page-title-block">
          <h1>Plans d&apos;abonnement</h1>
          <div className="page-subtitle">
            {plans.length} plans · {plans.filter((p) => p.visibility === "visible").length} visibles
          </div>
        </div>
        <div className="page-actions">
          <button className="btn outline" onClick={() => setPreviewOpen(true)}>
            <Eye size={13} /> Aperçu paywall
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
        {plans.map((p) => (
          <PlanCard
            key={p.id}
            plan={p}
            onEdit={() => setEditing(p)}
            onToggle={() => {
              update(p.id, { visibility: p.visibility === "visible" ? "hidden" : "visible" });
              toast.success(p.visibility === "visible" ? "Plan masqué" : "Plan affiché");
            }}
            onDelete={() => handleDelete(p.id)}
          />
        ))}
      </div>

      <PlanDrawer plan={editing} onClose={() => setEditing(null)} />

      {previewOpen && <PaywallPreview plans={plans} onClose={() => setPreviewOpen(false)} />}
    </motion.div>
  );
}

function PlanCard({
  plan,
  onEdit,
  onToggle,
  onDelete,
}: {
  plan: SubscriptionPlan;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="card card-pad"
      style={{
        opacity: plan.visibility === "hidden" ? 0.55 : 1,
        borderColor: plan.highlight ? "var(--primary)" : "var(--outline)",
        borderWidth: plan.highlight ? 2 : 1,
        position: "relative",
      }}
    >
      {plan.badge && (
        <span
          className="badge info"
          style={{ position: "absolute", top: 12, right: 12, fontSize: 10 }}
        >
          {plan.badge}
        </span>
      )}
      <h2 style={{ fontSize: 18, marginBottom: 6 }}>{plan.title}</h2>
      <div style={{ marginBottom: 14 }}>
        <span style={{ fontFamily: "Satoshi, sans-serif", fontSize: 32, fontWeight: 700, color: "var(--tertiary)" }}>
          {plan.priceLabel}
        </span>
        <span className="muted" style={{ fontSize: 13 }}> {plan.period}</span>
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, marginBottom: 16 }}>
        {plan.features.map((f, i) => (
          <li key={i} className="row" style={{ gap: 8, padding: "6px 0", fontSize: 13 }}>
            <Check size={14} color="var(--success)" /> {f}
          </li>
        ))}
      </ul>
      <div className="row between" style={{ paddingTop: 10, borderTop: "1px solid var(--outline)" }}>
        <button className="btn outline sm" onClick={onEdit}>
          <Edit3 size={12} /> Modifier
        </button>
        <div className="row" style={{ gap: 4 }}>
          <button className="btn ghost sm" onClick={onToggle} aria-label="Visibilité">
            {plan.visibility === "visible" ? <Eye size={12} /> : <EyeOff size={12} />}
          </button>
          <button className="btn ghost sm" onClick={onDelete} aria-label="Supprimer">
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

function PlanDrawer({ plan, onClose }: { plan: SubscriptionPlan | null; onClose: () => void }) {
  const update = usePlans((s) => s.update);
  const [draft, setDraft] = useState<SubscriptionPlan | null>(plan);
  const [tab, setTab] = useState<"edit" | "history">("edit");

  if (!plan) return null;
  if (!draft || draft.id !== plan.id) {
    setDraft(plan);
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
      open={!!plan}
      onClose={onClose}
      title={`Plan « ${plan.title} »`}
      subtitle={plan.id}
      footer={
        <>
          <span className="save-state" />
          <button className="btn ghost" onClick={onClose}>Annuler</button>
          <button
            className="btn primary"
            onClick={async () => {
              await simulateVoid();
              update(plan.id, draft);
              toast.success("Plan enregistré");
              onClose();
            }}
          >
            <Save size={13} /> Enregistrer
          </button>
        </>
      }
    >
      <div className="row" style={{ gap: 4, marginBottom: 14, borderBottom: "1px solid var(--outline)" }}>
        <button
          type="button"
          onClick={() => setTab("edit")}
          style={{
            background: "transparent",
            border: "none",
            padding: "8px 14px",
            fontSize: 13,
            color: tab === "edit" ? "var(--primary)" : "var(--text-secondary)",
            borderBottom: tab === "edit" ? "2px solid var(--primary)" : "2px solid transparent",
            cursor: "pointer",
          }}
        >
          Édition
        </button>
        <button
          type="button"
          onClick={() => setTab("history")}
          style={{
            background: "transparent",
            border: "none",
            padding: "8px 14px",
            fontSize: 13,
            color: tab === "history" ? "var(--primary)" : "var(--text-secondary)",
            borderBottom: tab === "history" ? "2px solid var(--primary)" : "2px solid transparent",
            cursor: "pointer",
          }}
        >
          Historique
        </button>
      </div>

      {tab === "edit" ? (
        <>
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
              <label className="lbl">Prix (numérique)</label>
              <input
                type="number"
                step="0.01"
                value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: parseFloat(e.target.value) })}
              />
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
                <button type="button" className={cn(draft.visibility === "hidden" && "active")} onClick={() => setDraft({ ...draft, visibility: "hidden" })}>Masqué</button>
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
                  <button className="btn ghost sm" onClick={() => moveFeature(i, -1)} disabled={i === 0} aria-label="Monter">
                    <ArrowUp size={11} />
                  </button>
                  <button className="btn ghost sm" onClick={() => moveFeature(i, 1)} disabled={i === draft.features.length - 1} aria-label="Descendre">
                    <ArrowDown size={11} />
                  </button>
                  <button
                    className="btn ghost sm"
                    onClick={() => setDraft({ ...draft, features: draft.features.filter((_, idx) => idx !== i) })}
                    aria-label="Retirer"
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
        </>
      ) : (
        <>
          <div className="row" style={{ gap: 8, marginBottom: 12, color: "var(--text-secondary)", fontSize: 13 }}>
            <History size={14} /> {plan.history.length} entrée{plan.history.length > 1 ? "s" : ""}
          </div>
          {plan.history.length === 0 ? (
            <div className="muted" style={{ fontSize: 13 }}>Aucun changement enregistré pour ce plan.</div>
          ) : (
            <div className="col" style={{ gap: 8 }}>
              {[...plan.history].reverse().map((h, i) => (
                <div key={i} className="card" style={{ padding: 10 }}>
                  <div className="row between" style={{ marginBottom: 4 }}>
                    <strong style={{ fontSize: 13 }}>{h.field}</strong>
                    <span className="muted tiny">{new Date(h.changedAt).toLocaleString("fr-FR")}</span>
                  </div>
                  <div className="tiny muted">
                    {String(h.from)} → <strong style={{ color: "var(--on-surface)" }}>{String(h.to)}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Drawer>
  );
}

function PaywallPreview({ plans, onClose }: { plans: SubscriptionPlan[]; onClose: () => void }) {
  return (
    <Drawer open={true} onClose={onClose} wide title="Aperçu paywall mobile" subtitle="Vue candidat">
      <div className="muted tiny" style={{ marginBottom: 12 }}>
        Voici comment les plans visibles apparaissent sur l&apos;application mobile.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        {plans
          .filter((p) => p.visibility === "visible")
          .map((p) => (
            <div
              key={p.id}
              className="card card-pad"
              style={{
                borderColor: p.highlight ? "var(--primary)" : "var(--outline)",
                borderWidth: p.highlight ? 2 : 1,
                position: "relative",
              }}
            >
              {p.badge && (
                <span className="badge info" style={{ position: "absolute", top: 10, right: 10, fontSize: 10 }}>
                  {p.badge}
                </span>
              )}
              <h3>{p.title}</h3>
              <div style={{ margin: "8px 0", fontFamily: "Satoshi, sans-serif", fontSize: 24, fontWeight: 700 }}>
                {p.priceLabel} <span className="muted" style={{ fontSize: 12 }}>{p.period}</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 12 }}>
                {p.features.map((f, i) => (
                  <li key={i} className="row" style={{ gap: 6, padding: "3px 0" }}>
                    <Check size={11} color="var(--success)" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    </Drawer>
  );
}
