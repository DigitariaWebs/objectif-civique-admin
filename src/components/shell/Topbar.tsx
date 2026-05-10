"use client";

import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronRight, Home, LifeBuoy, LogOut, Search } from "lucide-react";
import { NAV_GROUPS } from "./Sidebar";
import { usePalette } from "@/components/ui/CommandPalette";

function findLabel(pathname: string | null): string {
  if (!pathname) return "Tableau de bord";
  for (const g of NAV_GROUPS) {
    for (const it of g.items) {
      if ("kind" in it && it.kind === "group") {
        for (const c of it.children) {
          if (pathname === c.href || pathname.startsWith(c.href + "/")) return c.label;
        }
        if (pathname.startsWith(it.basePath)) return it.label;
      } else {
        const leaf = it as { href: string; label: string };
        if (pathname === leaf.href || pathname.startsWith(leaf.href + "/")) return leaf.label;
      }
    }
  }
  return "Tableau de bord";
}

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const setPaletteOpen = usePalette((s) => s.setOpen);
  const label = findLabel(pathname);

  return (
    <>
      <header className="topbar">
        <div className="breadcrumb">
          <Home size={13} />
          <ChevronRight size={12} />
          <b>{label}</b>
        </div>
        <button
          className="topbar-search"
          type="button"
          onClick={() => setPaletteOpen(true)}
          style={{
            background: "var(--surface-low)",
            border: "1px solid transparent",
            borderRadius: 10,
            padding: "8px 14px 8px 36px",
            position: "relative",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            color: "var(--text-tertiary)",
            fontSize: 13,
          }}
          aria-label="Ouvrir la palette de commandes"
        >
          <Search size={14} className="icon" />
          <span>Rechercher utilisateurs, questions, centres…</span>
          <span className="kbd">⌘K</span>
        </button>
        <div className="topbar-actions">
          <button className="topbar-icon-btn" title="Aide" aria-label="Aide">
            <LifeBuoy size={16} />
          </button>
          <button className="topbar-icon-btn" title="Notifications" aria-label="Notifications">
            <Bell size={16} />
            <span className="dot" />
          </button>
          <button
            className="topbar-icon-btn"
            onClick={() => router.push("/login")}
            title="Déconnexion"
            aria-label="Déconnexion"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>
      <div className="tricolor-strip" />
    </>
  );
}
