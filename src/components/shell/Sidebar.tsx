"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  Award,
  BarChart3,
  BookOpen,
  ChevronDown,
  ClipboardCheck,
  CreditCard,
  FileQuestion,
  GraduationCap,
  Handshake,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageSquare,
  Newspaper,
  Package,
  Quote,
  Settings,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";

import { useForumThreads } from "@/stores/useForumThreads";
import { useFiches } from "@/stores/useFiches";
import { useNotions } from "@/stores/useNotions";
import { useCours } from "@/stores/useCours";
import { useAuth } from "@/stores/useAuth";
import { useBranding } from "@/stores/useBranding";
import { cn } from "@/lib/utils";

type LeafItem = {
  kind?: "leaf";
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badgeKey?: "forum-reports" | "questions";
  badgeValue?: string;
};

type GroupItem = {
  kind: "group";
  id: string;
  label: string;
  icon: LucideIcon;
  basePath: string;
  children: LeafItem[];
};

type SidebarItem = LeafItem | GroupItem;

type NavGroup = {
  label: string | null;
  items: SidebarItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [{ id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard, href: "/dashboard" }],
  },
  {
    label: "Contenu",
    items: [
      { id: "questions", label: "Questions QCM", icon: HelpCircle, href: "/questions", badgeValue: "2.8k" },
      { id: "articles", label: "Articles", icon: Newspaper, href: "/articles" },
      {
        kind: "group",
        id: "library",
        label: "Bibliothèque",
        icon: BookOpen,
        basePath: "/library",
        children: [
          { id: "library-hub", label: "Vue d'ensemble", icon: BookOpen, href: "/library" },
          { id: "library-fiches", label: "Fiches de révision", icon: BookOpen, href: "/library/fiches" },
          { id: "library-notions", label: "Notions détaillées", icon: FileQuestion, href: "/library/notions" },
          { id: "library-cours", label: "Cours pédagogiques", icon: GraduationCap, href: "/library/cours" },
        ],
      },
      { id: "centers", label: "Centres d'examen", icon: MapPin, href: "/centers" },
    ],
  },
  {
    label: "Communauté",
    items: [
      { id: "forum", label: "Forum", icon: MessageSquare, href: "/forum", badgeKey: "forum-reports" },
      { id: "testimonials", label: "Témoignages", icon: Quote, href: "/testimonials" },
      { id: "coaches", label: "Coachs", icon: UserCog, href: "/coaches" },
    ],
  },
  {
    label: "Business",
    items: [
      { id: "plans", label: "Plans", icon: CreditCard, href: "/plans" },
      { id: "coaching-offers", label: "Offres coaching", icon: Package, href: "/coaching-offers" },
      { id: "partners", label: "Partenaires", icon: Handshake, href: "/partners" },
      { id: "users", label: "Utilisateurs", icon: Users, href: "/users" },
    ],
  },
  {
    label: "Insights",
    items: [
      { id: "analytics", label: "Analytics", icon: BarChart3, href: "/analytics" },
      { id: "achievements", label: "Succès", icon: Award, href: "/achievements" },
      { id: "eligibility", label: "Test d'éligibilité", icon: ClipboardCheck, href: "/eligibility" },
    ],
  },
  {
    label: null,
    items: [{ id: "settings", label: "Paramètres", icon: Settings, href: "/settings" }],
  },
];

export function Sidebar() {
  const pathname = usePathname() ?? "";
  const auth = useAuth();
  const branding = useBranding();
  const openReports = useForumThreads((s) => s.reports.filter((r) => r.status === "open").length);
  const ficheCount = useFiches((s) => s.items.length);
  const notionCount = useNotions((s) => s.items.length);
  const coursCount = useCours((s) => s.items.length);

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    library: pathname.startsWith("/library"),
  });

  function toggleGroup(id: string) {
    setExpandedGroups((g) => ({ ...g, [id]: !g[id] }));
  }

  function badgeFor(key: LeafItem["badgeKey"]): string | null {
    if (key === "forum-reports") return openReports > 0 ? String(openReports) : null;
    return null;
  }

  function renderLeaf(item: LeafItem) {
    const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"));
    const dynamicBadge = badgeFor(item.badgeKey);
    return (
      <Link
        key={item.id}
        href={item.href}
        className={cn("sidebar-item", active && "active")}
      >
        <item.icon size={16} />
        <span>{item.label}</span>
        {(dynamicBadge ?? item.badgeValue) && (
          <span className="badge-pill">{dynamicBadge ?? item.badgeValue}</span>
        )}
      </Link>
    );
  }

  function renderGroup(group: GroupItem) {
    const groupActive = pathname.startsWith(group.basePath);
    const expanded = !!expandedGroups[group.id] || groupActive;
    const Icon = group.icon;
    let count = 0;
    if (group.id === "library") count = ficheCount + notionCount + coursCount;
    return (
      <div key={group.id}>
        <button
          type="button"
          className={cn("sidebar-item", groupActive && "active")}
          onClick={() => toggleGroup(group.id)}
        >
          <Icon size={16} />
          <span>{group.label}</span>
          {count > 0 && <span className="badge-pill">{count}</span>}
          <ChevronDown
            size={13}
            style={{ marginLeft: 4, transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 160ms" }}
          />
        </button>
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{ overflow: "hidden", paddingLeft: 18 }}
            >
              {group.children.map((c) => {
                const active = pathname === c.href || (c.href !== "/library" && pathname.startsWith(c.href + "/"));
                return (
                  <Link
                    key={c.id}
                    href={c.href}
                    className={cn("sidebar-item", active && "active")}
                    style={{ fontSize: 12.5 }}
                  >
                    <c.icon size={14} />
                    <span>{c.label}</span>
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        {branding.logoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={branding.logoDataUrl}
            alt="Logo"
            style={{ width: 36, height: 36, borderRadius: 10, objectFit: "cover" }}
          />
        ) : (
          <div className="sidebar-logo-mark">OC</div>
        )}
        <div>
          <div className="sidebar-logo-text">{branding.appName || "Objectif Civique"}</div>
          <div className="sidebar-logo-sub">Console admin</div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {NAV_GROUPS.map((g, i) => (
          <div key={i} className="sidebar-section">
            {g.label && <div className="sidebar-section-label">{g.label}</div>}
            {g.items.map((item) => {
              if ("kind" in item && item.kind === "group") return renderGroup(item);
              return renderLeaf(item as LeafItem);
            })}
          </div>
        ))}
      </nav>
      <div className="sidebar-user">
        <div className="sidebar-user-avatar">{auth.initials}</div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{auth.name}</div>
          <div className="sidebar-user-role">
            {auth.role === "super-admin" ? "Super-admin" : auth.role === "editor" ? "Éditeur" : "Modérateur"}
          </div>
        </div>
        <Link href="/login" title="Se déconnecter" aria-label="Se déconnecter">
          <LogOut size={14} />
        </Link>
      </div>
    </aside>
  );
}
