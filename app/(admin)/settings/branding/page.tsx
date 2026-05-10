"use client";

import { toast } from "sonner";
import { Palette, RefreshCw, Upload } from "lucide-react";
import { useBranding } from "@/stores/useBranding";

export default function BrandingSettings() {
  const branding = useBranding();

  function onLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      branding.setLogo(reader.result as string);
      toast.success("Logo chargé");
    };
    reader.readAsDataURL(file);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <div className="card card-pad">
        <div className="row" style={{ gap: 10, marginBottom: 12 }}>
          <Palette size={18} color="var(--primary)" />
          <h2>Identité visuelle</h2>
        </div>

        <div className="form-row">
          <label className="lbl">Logo</label>
          <div className="row" style={{ gap: 12 }}>
            {branding.logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={branding.logoDataUrl}
                alt="Logo"
                style={{ width: 64, height: 64, borderRadius: 12, objectFit: "cover", border: "1px solid var(--outline)" }}
              />
            ) : (
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 12,
                  background: "var(--primary)",
                  color: "white",
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "Satoshi, sans-serif",
                  fontWeight: 900,
                  fontSize: 28,
                }}
              >
                OC
              </div>
            )}
            <label className="btn outline" style={{ cursor: "pointer" }}>
              <Upload size={13} /> Charger un logo
              <input type="file" accept="image/*" onChange={onLogoFile} style={{ display: "none" }} />
            </label>
            {branding.logoDataUrl && (
              <button className="btn ghost" onClick={() => { branding.setLogo(null); toast.success("Logo retiré"); }}>
                Retirer
              </button>
            )}
          </div>
        </div>

        <div className="form-row">
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
            <button
              className="btn ghost"
              onClick={() => { branding.resetBranding(); toast.success("Marque réinitialisée"); }}
            >
              <RefreshCw size={13} /> Réinitialiser
            </button>
          </div>
          <div className="hint">Met à jour la sidebar et les éléments de marque en temps réel.</div>
        </div>

        <div className="form-row split">
          <div>
            <label className="lbl">Bande tricolore</label>
            <div className="segmented">
              <button type="button" className={branding.showTricolor ? "active" : ""} onClick={() => branding.setShowTricolor(true)}>Affichée</button>
              <button type="button" className={!branding.showTricolor ? "active" : ""} onClick={() => branding.setShowTricolor(false)}>Masquée</button>
            </div>
          </div>
          <div>
            <label className="lbl">Mode sombre par défaut</label>
            <div className="segmented">
              <button type="button" className={!branding.darkMode ? "active" : ""} onClick={() => branding.setDarkMode(false)}>Clair</button>
              <button type="button" className={branding.darkMode ? "active" : ""} onClick={() => branding.setDarkMode(true)}>Sombre</button>
            </div>
            <div className="hint">Le mode sombre sera implémenté en V2.1 — la préférence est conservée.</div>
          </div>
        </div>
      </div>

      <div className="card card-pad">
        <h2 style={{ marginBottom: 12 }}>CSS personnalisé</h2>
        <div className="form-row">
          <label className="lbl">Override</label>
          <textarea
            value={branding.customCss}
            onChange={(e) => branding.setCustomCss(e.target.value)}
            placeholder=":root { --primary: #123456; }"
            style={{ minHeight: 240, fontFamily: "ui-monospace, monospace", fontSize: 12.5 }}
          />
          <div className="hint">
            Le CSS saisi ici est injecté globalement. Utilisez avec prudence — risque de casse visuelle.
          </div>
        </div>
        <div className="row" style={{ justifyContent: "flex-end" }}>
          <button
            className="btn outline"
            onClick={() => { branding.setCustomCss(""); toast.success("CSS personnalisé effacé"); }}
          >
            Effacer
          </button>
        </div>
      </div>
    </div>
  );
}
