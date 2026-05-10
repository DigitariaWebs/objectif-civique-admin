"use client";

import {
  Award,
  BarChart3,
  Banknote,
  BookOpen,
  Building2,
  ClipboardCheck,
  CreditCard,
  Database,
  FileText,
  Handshake,
  HelpCircle,
  Home,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Newspaper,
  Package,
  Plus,
  Quote,
  RefreshCw,
  Settings,
  UserCog,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";

export type CommandSection = "Navigation" | "Création" | "Actions" | "Recherche";

export type Command = {
  id: string;
  label: string;
  hint?: string;
  section: CommandSection;
  icon: ComponentType<{ size?: number }>;
  href?: string;
  run?: (router: { push: (href: string) => void }) => void | Promise<void>;
};

export const STATIC_COMMANDS: Command[] = [
  // Navigation
  { id: "nav-dashboard", label: "Tableau de bord", section: "Navigation", icon: LayoutDashboard, href: "/dashboard" },
  { id: "nav-users", label: "Utilisateurs", section: "Navigation", icon: Users, href: "/users" },
  { id: "nav-questions", label: "Questions QCM", section: "Navigation", icon: HelpCircle, href: "/questions" },
  { id: "nav-articles", label: "Articles", section: "Navigation", icon: Newspaper, href: "/articles" },
  { id: "nav-centers", label: "Centres d'examen", section: "Navigation", icon: MapPin, href: "/centers" },
  { id: "nav-coaches", label: "Coachs", section: "Navigation", icon: UserCog, href: "/coaches" },
  { id: "nav-partners", label: "Partenaires", section: "Navigation", icon: Handshake, href: "/partners" },
  { id: "nav-library", label: "Bibliothèque", section: "Navigation", icon: BookOpen, href: "/library" },
  { id: "nav-fiches", label: "Bibliothèque · Fiches de révision", section: "Navigation", icon: BookOpen, href: "/library/fiches" },
  { id: "nav-notions", label: "Bibliothèque · Notions détaillées", section: "Navigation", icon: BookOpen, href: "/library/notions" },
  { id: "nav-cours", label: "Bibliothèque · Cours pédagogiques", section: "Navigation", icon: BookOpen, href: "/library/cours" },
  { id: "nav-forum", label: "Forum", section: "Navigation", icon: MessageSquare, href: "/forum" },
  { id: "nav-forum-reports", label: "Forum · Signalements", section: "Navigation", icon: MessageSquare, href: "/forum?tab=reports" },
  { id: "nav-testimonials", label: "Témoignages", section: "Navigation", icon: Quote, href: "/testimonials" },
  { id: "nav-achievements", label: "Succès", section: "Navigation", icon: Award, href: "/achievements" },
  { id: "nav-eligibility", label: "Test d'éligibilité", section: "Navigation", icon: ClipboardCheck, href: "/eligibility" },
  { id: "nav-plans", label: "Plans", section: "Navigation", icon: CreditCard, href: "/plans" },
  { id: "nav-offers", label: "Offres coaching", section: "Navigation", icon: Package, href: "/coaching-offers" },
  { id: "nav-analytics", label: "Analytics", section: "Navigation", icon: BarChart3, href: "/analytics" },
  { id: "nav-settings", label: "Paramètres", section: "Navigation", icon: Settings, href: "/settings" },
  { id: "nav-settings-general", label: "Paramètres · Général", section: "Navigation", icon: Settings, href: "/settings/general" },
  { id: "nav-settings-admins", label: "Paramètres · Admins", section: "Navigation", icon: Settings, href: "/settings/admins" },
  { id: "nav-settings-integrations", label: "Paramètres · Intégrations", section: "Navigation", icon: Settings, href: "/settings/integrations" },
  { id: "nav-settings-notifications", label: "Paramètres · Notifications", section: "Navigation", icon: Settings, href: "/settings/notifications" },
  { id: "nav-settings-data", label: "Paramètres · Données", section: "Navigation", icon: Database, href: "/settings/data" },
  { id: "nav-settings-branding", label: "Paramètres · Marque", section: "Navigation", icon: Settings, href: "/settings/branding" },
  // Création
  { id: "create-fiche", label: "Créer une fiche de révision", section: "Création", icon: Plus, href: "/library/fiches?new=1" },
  { id: "create-notion", label: "Créer une notion détaillée", section: "Création", icon: Plus, href: "/library/notions?new=1" },
  { id: "create-cours", label: "Créer un cours", section: "Création", icon: Plus, href: "/library/cours?new=1" },
  { id: "create-thread", label: "Créer un thread forum", section: "Création", icon: Plus, href: "/forum?new=1" },
  { id: "create-testimonial", label: "Créer un témoignage", section: "Création", icon: Plus, href: "/testimonials?new=1" },
  { id: "create-achievement", label: "Créer un succès", section: "Création", icon: Plus, href: "/achievements?new=1" },
  { id: "create-question", label: "Créer une question", section: "Création", icon: Plus, href: "/questions?new=1" },
  { id: "create-article", label: "Créer un article", section: "Création", icon: Plus, href: "/articles?new=1" },
  // Actions
  { id: "action-reset", label: "Réinitialiser les données démo", section: "Actions", icon: RefreshCw, href: "/settings/data?reset=1" },
  { id: "action-export-analytics", label: "Exporter le rapport analytics", section: "Actions", icon: FileText, href: "/analytics?export=1" },
  { id: "action-home", label: "Retour à l'accueil", section: "Actions", icon: Home, href: "/dashboard" },
  { id: "action-payouts", label: "Lancer les paiements partenaires", section: "Actions", icon: Banknote, href: "/partners?payouts=1" },
  { id: "action-new-center", label: "Nouveau centre d'examen", section: "Création", icon: Building2, href: "/centers?new=1" },
];
