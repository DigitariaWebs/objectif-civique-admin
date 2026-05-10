"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  Clock,
  Inbox,
  Loader,
  LogIn,
  Mail,
  MailCheck,
  ShieldCheck,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState<"email" | "magic">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) {
      setError("Adresse e-mail invalide.");
      return;
    }
    if (!email.toLowerCase().endsWith("@objectif-civique.fr")) {
      setError("Seules les adresses @objectif-civique.fr sont autorisées.");
      return;
    }
    setLoading(true);
    // TODO: replace with real magic-link API call
    setTimeout(() => {
      setLoading(false);
      setStage("magic");
    }, 700);
  }

  return (
    <div className="login-page">
      <div className="login-pane">
        <motion.form
          className="login-form"
          onSubmit={submit}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="login-logo">
            <div className="mark">OC</div>
            <div>
              <div className="name">Objectif Civique</div>
              <div className="role">Console interne</div>
            </div>
          </div>

          {stage === "email" && (
            <>
              <h1 className="login-h1">Connexion équipe</h1>
              <p className="login-sub">
                Accès réservé aux administrateurs Objectif Civique. Saisissez votre e-mail
                professionnel pour recevoir un lien de connexion sécurisé.
              </p>

              <div className="form-row">
                <label className="lbl">Adresse e-mail professionnelle</label>
                <input
                  type="email"
                  placeholder="prenom.nom@objectif-civique.fr"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  autoFocus
                  required
                  style={{ borderColor: error ? "var(--secondary)" : undefined }}
                />
                {error ? (
                  <div className="hint" style={{ color: "var(--secondary)" }}>
                    <AlertCircle size={12} /> {error}
                  </div>
                ) : (
                  <div className="hint">
                    Le lien reçu est valable 15 minutes et utilisable une seule fois.
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn primary lg"
                style={{ width: "100%", justifyContent: "center" }}
                disabled={loading}
              >
                {loading ? <Loader size={14} /> : <Mail size={14} />}
                {loading ? "Envoi en cours…" : "Recevoir le lien de connexion"}
              </button>

              <div
                style={{
                  marginTop: 22,
                  padding: "12px 14px",
                  background: "var(--surface-low)",
                  borderRadius: 12,
                  fontSize: 12.5,
                  color: "var(--text-secondary)",
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                <ShieldCheck size={14} color="var(--primary)" />
                <span>
                  Sessions limitées à 8 heures. Toute connexion est journalisée et auditée
                  mensuellement.
                </span>
              </div>

              <p className="tiny muted" style={{ marginTop: 18, textAlign: "center" }}>
                Problème d&apos;accès ? Contactez{" "}
                <a href="mailto:it@objectif-civique.fr" style={{ color: "var(--primary)" }}>
                  it@objectif-civique.fr
                </a>
              </p>
            </>
          )}

          {stage === "magic" && (
            <>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 999,
                  background: "var(--primary-fixed)",
                  color: "var(--primary)",
                  display: "grid",
                  placeItems: "center",
                  marginBottom: 18,
                }}
              >
                <MailCheck size={24} />
              </div>
              <h1 className="login-h1">Vérifiez votre boîte mail</h1>
              <p className="login-sub">
                Un lien de connexion a été envoyé à{" "}
                <strong style={{ color: "var(--on-surface)" }}>{email}</strong>. Cliquez dessus
                depuis ce navigateur pour entrer dans la console.
              </p>

              <div
                style={{
                  padding: "14px 16px",
                  background: "var(--surface-low)",
                  borderRadius: 12,
                  marginBottom: 18,
                }}
              >
                <div className="row" style={{ gap: 10, marginBottom: 8 }}>
                  <Clock size={14} color="var(--text-secondary)" />
                  <span style={{ fontSize: 13 }}>
                    Le lien expire dans <strong>15 minutes</strong>.
                  </span>
                </div>
                <div className="row" style={{ gap: 10 }}>
                  <Inbox size={14} color="var(--text-secondary)" />
                  <span style={{ fontSize: 13 }}>Pensez à vérifier vos courriers indésirables.</span>
                </div>
              </div>

              <button
                type="button"
                className="btn primary lg"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={() => router.push("/dashboard")}
              >
                <LogIn size={14} />
                Simuler la connexion (démo)
              </button>
              <button
                type="button"
                className="btn ghost"
                style={{ width: "100%", marginTop: 10, justifyContent: "center" }}
                onClick={() => {
                  setStage("email");
                  setError("");
                }}
              >
                <ArrowLeft size={13} /> Utiliser une autre adresse
              </button>
            </>
          )}
        </motion.form>
      </div>

      <div className="login-art" aria-hidden="true">
        <div className="login-art-grid" />
        <div className="login-art-flag" />
        <div className="login-art-flag b2" />
        <div className="login-art-content">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 12px",
              background: "rgba(255,255,255,0.12)",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 500,
              marginBottom: 22,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                background: "var(--secondary)",
                borderRadius: 999,
                display: "inline-block",
              }}
            />
            Console interne · v2.4
          </div>
          <h2>Le poste de pilotage d&apos;Objectif Civique.</h2>
          <p>
            Banque de questions, centres d&apos;examen, coachs, partenaires et candidats — tout
            l&apos;opérationnel de l&apos;application, dans une seule console.
          </p>
          <div className="login-art-stats">
            <div className="login-art-stat">
              <div className="v">2 847</div>
              <div className="l">Questions</div>
            </div>
            <div className="login-art-stat">
              <div className="v">220</div>
              <div className="l">Centres</div>
            </div>
            <div className="login-art-stat">
              <div className="v">31 k</div>
              <div className="l">Candidats</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
