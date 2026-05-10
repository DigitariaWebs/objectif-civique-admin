"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Database, Download, RefreshCw, Upload } from "lucide-react";

import { confirmAction } from "@/components/ui/ConfirmDialog";
import { useUsers } from "@/stores/useUsers";
import { useQuestions } from "@/stores/useQuestions";
import { useArticles } from "@/stores/useArticles";
import { useCenters } from "@/stores/useCenters";
import { useCoaches } from "@/stores/useCoaches";
import { usePartners } from "@/stores/usePartners";
import { useFiches } from "@/stores/useFiches";
import { useNotions } from "@/stores/useNotions";
import { useCours } from "@/stores/useCours";
import { useTestimonials } from "@/stores/useTestimonials";
import { useAchievements } from "@/stores/useAchievements";
import { useEligibility } from "@/stores/useEligibility";
import { usePlans } from "@/stores/usePlans";
import { useCoachingOffers } from "@/stores/useCoachingOffers";
import { useForumThreads } from "@/stores/useForumThreads";
import { useAdmins } from "@/stores/useAdmins";
import { useIntegrations } from "@/stores/useIntegrations";
import { useNotificationSettings } from "@/stores/useNotificationSettings";
import { useBranding } from "@/stores/useBranding";

const STORE_KEYS = [
  "oc-admin-users",
  "oc-admin-questions",
  "oc-admin-articles",
  "oc-admin-centers",
  "oc-admin-coaches",
  "oc-admin-partners",
  "oc-admin-fiches",
  "oc-admin-notions",
  "oc-admin-cours",
  "oc-admin-testimonials",
  "oc-admin-achievements",
  "oc-admin-eligibility",
  "oc-admin-plans",
  "oc-admin-coaching-offers",
  "oc-admin-forum",
  "oc-admin-admins",
  "oc-admin-integrations",
  "oc-admin-notifications",
  "oc-admin-branding",
  "oc-admin-auth",
];

export default function DataSettings() {
  const sp = useSearchParams();

  const stores = {
    users: useUsers,
    questions: useQuestions,
    articles: useArticles,
    centers: useCenters,
    coaches: useCoaches,
    partners: usePartners,
    fiches: useFiches,
    notions: useNotions,
    cours: useCours,
    testimonials: useTestimonials,
    achievements: useAchievements,
    eligibility: useEligibility,
    plans: usePlans,
    coachingOffers: useCoachingOffers,
    forum: useForumThreads,
    admins: useAdmins,
    integrations: useIntegrations,
    notifications: useNotificationSettings,
    branding: useBranding,
  };

  async function resetAll() {
    const ok = await confirmAction({
      title: "Réinitialiser toutes les données ?",
      message: "Toutes les modifications locales seront effacées et les seeds seront restaurés.",
      destructive: true,
      confirmLabel: "Tout réinitialiser",
    });
    if (!ok) return;
    Object.values(stores).forEach((s) => {
      const fn = (s.getState() as { reset?: () => void }).reset;
      if (typeof fn === "function") fn();
    });
    if (typeof localStorage !== "undefined") {
      STORE_KEYS.forEach((k) => localStorage.removeItem(k));
    }
    toast.success("Données réinitialisées");
    if (typeof window !== "undefined") {
      setTimeout(() => window.location.reload(), 300);
    }
  }

  useEffect(() => {
    if (sp.get("reset") === "1") {
      resetAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  function exportAll() {
    if (typeof localStorage === "undefined") return;
    const data: Record<string, unknown> = {};
    for (const key of STORE_KEYS) {
      const raw = localStorage.getItem(key);
      if (raw) data[key] = JSON.parse(raw);
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `oc-admin-state-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("État téléchargé");
  }

  function importAll(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        for (const [k, v] of Object.entries(parsed)) {
          if (STORE_KEYS.includes(k)) localStorage.setItem(k, JSON.stringify(v));
        }
        toast.success("État importé — la page va se recharger");
        setTimeout(() => window.location.reload(), 500);
      } catch {
        toast.error("Fichier JSON invalide");
      }
    };
    reader.readAsText(file);
  }

  const counts = {
    Utilisateurs: useUsers((s) => s.items.length),
    Questions: useQuestions((s) => s.items.length),
    Articles: useArticles((s) => s.items.length),
    Centres: useCenters((s) => s.items.length),
    Coachs: useCoaches((s) => s.items.length),
    Partenaires: usePartners((s) => s.items.length),
    Fiches: useFiches((s) => s.items.length),
    Notions: useNotions((s) => s.items.length),
    Cours: useCours((s) => s.items.length),
    Témoignages: useTestimonials((s) => s.items.length),
    Succès: useAchievements((s) => s.items.length),
    Threads: useForumThreads((s) => s.threads.length),
    Admins: useAdmins((s) => s.admins.length),
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <div className="card card-pad">
        <div className="row" style={{ gap: 10, marginBottom: 12 }}>
          <Database size={18} color="var(--primary)" />
          <h2>Statistiques de la base démo</h2>
        </div>
        <div className="col" style={{ gap: 8 }}>
          {Object.entries(counts).map(([k, v]) => (
            <div key={k} className="row between" style={{ fontSize: 13.5 }}>
              <span className="muted">{k}</span>
              <strong style={{ fontVariantNumeric: "tabular-nums" }}>{v}</strong>
            </div>
          ))}
          <div className="row between" style={{ fontSize: 12.5, marginTop: 6, paddingTop: 8, borderTop: "1px solid var(--outline)" }}>
            <span className="muted">Dernière sauvegarde</span>
            <span>aujourd&apos;hui (auto-persist)</span>
          </div>
        </div>
      </div>

      <div className="card card-pad">
        <h2 style={{ marginBottom: 12 }}>Actions sur les données</h2>
        <div className="col" style={{ gap: 8 }}>
          <button className="btn outline" onClick={exportAll} style={{ justifyContent: "flex-start" }}>
            <Download size={13} /> Exporter l&apos;état complet (JSON)
          </button>
          <label className="btn outline" style={{ justifyContent: "flex-start", cursor: "pointer" }}>
            <Upload size={13} /> Importer un état JSON
            <input type="file" accept="application/json" onChange={importAll} style={{ display: "none" }} />
          </label>
          <button className="btn danger" onClick={resetAll} style={{ justifyContent: "flex-start" }}>
            <RefreshCw size={13} /> Réinitialiser toutes les données démo
          </button>
        </div>
        <div className="hint" style={{ marginTop: 10 }}>
          La réinitialisation efface toutes les modifications locales et restaure les seeds. La page se rechargera automatiquement.
        </div>
      </div>
    </div>
  );
}
