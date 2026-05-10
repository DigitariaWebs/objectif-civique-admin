"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { useBranding } from "@/stores/useBranding";

export default function GeneralSettings() {
  const branding = useBranding();
  const [appName, setAppName] = useState(branding.appName);
  const [supportEmail, setSupportEmail] = useState("contact@objectif-civique.fr");
  const [defaultJourney, setDefaultJourney] = useState<"NAT" | "CSP" | "CR">("NAT");
  const [locale, setLocale] = useState("fr-FR");

  function save() {
    branding.setAppName(appName);
    branding.setPrimaryColor(branding.primaryColor); // re-apply
    toast.success("Paramètres enregistrés");
  }

  return (
    <div className="card card-pad">
      <h2 style={{ marginBottom: 14 }}>Général</h2>
      <div className="form-row">
        <label className="lbl">Nom de l&apos;application</label>
        <input value={appName} onChange={(e) => setAppName(e.target.value)} />
      </div>
      <div className="form-row split">
        <div>
          <label className="lbl">Couleur principale</label>
          <div className="row" style={{ gap: 8 }}>
            <input
              type="color"
              value={branding.primaryColor}
              onChange={(e) => branding.setPrimaryColor(e.target.value)}
              style={{ width: 56, height: 36, padding: 0, border: "1px solid var(--outline)", borderRadius: 8, cursor: "pointer" }}
            />
            <input
              type="text"
              value={branding.primaryColor}
              onChange={(e) => /^#[0-9a-fA-F]{6}$/.test(e.target.value) && branding.setPrimaryColor(e.target.value)}
              style={{ flex: 1, fontFamily: "ui-monospace, monospace" }}
            />
          </div>
          <div className="hint">Met à jour la barre latérale et les KPI en temps réel.</div>
        </div>
        <div>
          <label className="lbl">Locale par défaut</label>
          <select value={locale} onChange={(e) => setLocale(e.target.value)}>
            <option value="fr-FR">Français (France)</option>
            <option value="fr-BE">Français (Belgique)</option>
            <option value="fr-CH">Français (Suisse)</option>
          </select>
        </div>
      </div>
      <div className="form-row split">
        <div>
          <label className="lbl">Parcours par défaut</label>
          <select value={defaultJourney} onChange={(e) => setDefaultJourney(e.target.value as "NAT" | "CSP" | "CR")}>
            <option value="NAT">Naturalisation</option>
            <option value="CSP">Carte de séjour</option>
            <option value="CR">Carte de résident</option>
          </select>
        </div>
        <div>
          <label className="lbl">E-mail support</label>
          <input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
        </div>
      </div>
      <div className="row" style={{ justifyContent: "flex-end", marginTop: 16 }}>
        <button className="btn primary" onClick={save}>
          <Save size={13} /> Enregistrer
        </button>
      </div>
    </div>
  );
}
