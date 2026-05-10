"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Plug, RefreshCw, XCircle } from "lucide-react";
import { useIntegrations } from "@/stores/useIntegrations";
import { simulateVoid } from "@/lib/api";

export default function IntegrationsSettings() {
  const items = useIntegrations((s) => s.items);
  const toggle = useIntegrations((s) => s.toggle);
  const setKey = useIntegrations((s) => s.setKey);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  async function testConnection(name: string) {
    await simulateVoid(400, 800);
    toast.success(`Connexion ${name} OK`);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
      {items.map((i) => (
        <div key={i.id} className="card card-pad">
          <div className="row between" style={{ marginBottom: 10 }}>
            <div className="row" style={{ gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "var(--primary-fixed)",
                  color: "var(--primary)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Plug size={16} />
              </div>
              <div>
                <h2 style={{ fontSize: 16 }}>{i.name}</h2>
                <div className="tiny muted">{i.description}</div>
              </div>
            </div>
            {i.connected ? (
              <span className="badge success dot">Connecté</span>
            ) : (
              <span className="badge neutral">Déconnecté</span>
            )}
          </div>
          <div className="form-row">
            <label className="lbl">Clé API</label>
            <div className="row" style={{ gap: 6 }}>
              <input
                type={revealed[i.id] ? "text" : "password"}
                value={i.apiKey}
                onChange={(e) => setKey(i.id, e.target.value)}
                style={{ flex: 1, fontFamily: "ui-monospace, monospace", fontSize: 12 }}
              />
              <button
                className="btn outline sm"
                onClick={() => setRevealed({ ...revealed, [i.id]: !revealed[i.id] })}
              >
                {revealed[i.id] ? "Masquer" : "Afficher"}
              </button>
            </div>
          </div>
          <div className="row" style={{ gap: 6, marginTop: 12 }}>
            <button
              className={i.connected ? "btn danger" : "btn primary"}
              onClick={() => {
                toggle(i.id);
                toast.success(i.connected ? `${i.name} déconnecté` : `${i.name} connecté`);
              }}
            >
              {i.connected ? <><XCircle size={13} /> Déconnecter</> : <><CheckCircle2 size={13} /> Connecter</>}
            </button>
            <button className="btn outline" onClick={() => testConnection(i.name)} disabled={!i.connected}>
              <RefreshCw size={13} /> Tester
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
