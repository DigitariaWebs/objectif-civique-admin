"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Database, Palette, Plug, Settings, ShieldCheck } from "lucide-react";

const TABS = [
  { href: "/settings/general", label: "Général", icon: Settings },
  { href: "/settings/admins", label: "Admins", icon: ShieldCheck },
  { href: "/settings/integrations", label: "Intégrations", icon: Plug },
  { href: "/settings/notifications", label: "Notifications", icon: Bell },
  { href: "/settings/data", label: "Données", icon: Database },
  { href: "/settings/branding", label: "Marque", icon: Palette },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="page" style={{ paddingBottom: 64 }}>
      <div className="page-header">
        <div className="page-title-block">
          <h1>Paramètres</h1>
          <div className="page-subtitle">Configuration globale de la console</div>
        </div>
      </div>
      <div className="row" style={{ gap: 4, borderBottom: "1px solid var(--outline)", marginBottom: 18, overflowX: "auto" }}>
        {TABS.map((t) => {
          const active = pathname === t.href || pathname?.startsWith(t.href + "/");
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              className="row"
              style={{
                gap: 6,
                padding: "10px 16px",
                fontSize: 13.5,
                fontWeight: 500,
                color: active ? "var(--primary)" : "var(--text-secondary)",
                borderBottom: active ? "2px solid var(--primary)" : "2px solid transparent",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              <Icon size={14} />
              {t.label}
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
}
