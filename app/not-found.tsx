import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "var(--surface)",
        padding: 40,
      }}
    >
      <div
        className="card card-pad"
        style={{ maxWidth: 480, textAlign: "center", padding: 40 }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 16,
            background: "var(--primary-fixed)",
            color: "var(--primary)",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 18px",
            fontSize: 28,
            fontWeight: 700,
            fontFamily: "Satoshi, sans-serif",
          }}
        >
          404
        </div>
        <h1>Page introuvable</h1>
        <p className="muted" style={{ marginTop: 8, marginBottom: 22, fontSize: 14 }}>
          Cette page n&apos;existe pas dans la console. Vérifiez l&apos;URL ou retournez au tableau de bord.
        </p>
        <Link href="/dashboard" className="btn primary">
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}
