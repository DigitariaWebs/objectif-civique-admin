// === V1 entities ===
export type Goal = "NAT" | "CSP" | "CR";
export type Plan = "free" | "monthly" | "quarterly" | "lifetime";
export type Theme = "institutions" | "histoire" | "valeurs" | "geographie" | "culture";
export type SourceBank = "officielles" | "extended" | "livret" | "fulldata" | "mise-en-situation";
export type Deadline = "lt1m" | "1to3m" | "3to6m" | "undecided";
export type Level = "debutant" | "intermediaire" | "avance" | "inconnu";
export type ArticleCategory = "legislation" | "naturalisation" | "titre-sejour" | "general";
export type ArticleStatus = "published" | "draft";
export type CenterStatus = "active" | "inactive";
export type CoachStatus = "available" | "busy";
export type PartnerStatus = "active" | "suspended";
export type Platform = "TikTok" | "YouTube" | "Instagram" | "Direct" | "Twitter/X";

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  goal: Goal | null;
  deadline: Deadline;
  level: Level;
  channel: string;
  companion: string;
  createdAt: string;
  lastActive: string;
  subscriptionPlan: Plan;
  civicTestPassed: boolean | null;
  languageTestPassed: boolean | null;
  avgScore: number;
  streak: number;
  sessionsTotal: number;
  referralCodeUsed: string | null;
};

export type Question = {
  id: string;
  category: Goal;
  theme: Theme;
  text: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  sourceBank: SourceBank;
  stats: number;
  attempts: number;
  active: boolean;
};

export type Article = {
  id: string;
  title: string;
  category: ArticleCategory;
  excerpt: string;
  publishedAt: string;
  source: string;
  views: number;
  status: ArticleStatus;
  author: string;
};

export type ArticleEditable = Article & { body?: string };

export type Center = {
  id: string;
  name: string;
  city: string;
  department: string;
  departmentName: string;
  address: string;
  services: Goal[];
  phone: string;
  status: CenterStatus;
  lastUpdate: string;
};

export type Coach = {
  id: string;
  name: string;
  specialty: string;
  languages: string[];
  rating: number;
  completedSessions: number;
  status: CoachStatus;
  bio: string;
  price: number;
};

export type Partner = {
  id: string;
  code: string;
  name: string;
  handle: string | null;
  platform: Platform;
  followers: number;
  signups: number;
  conversions: number;
  earnings: number;
  status: PartnerStatus;
  joinedAt: string;
  lastPayout: string;
};

export type SignupPoint = { day: string; signups: number; paid: number };
export type SessionPoint = { day: string; sessions: number };
export type JourneyDist = { name: Goal; value: number; color: string };
export type TopFailed = { id: string; text: string; fail: number; attempts: number };
export type BankBias = Record<SourceBank, { 0: number; 1: number; 2: number; 3: number; total: number }>;

export const GOAL_LABELS: Record<Goal, string> = {
  NAT: "Naturalisation",
  CSP: "Carte de séjour",
  CR: "Carte de résident",
};

export const PLAN_LABELS: Record<Plan, string> = {
  free: "Gratuit",
  monthly: "Mensuel",
  quarterly: "Trimestriel",
  lifetime: "À vie",
};

export const THEME_LABELS: Record<Theme, string> = {
  institutions: "Institutions",
  histoire: "Histoire",
  valeurs: "Valeurs",
  geographie: "Géographie",
  culture: "Culture",
};

export const ARTICLE_CAT_LABELS: Record<ArticleCategory, string> = {
  legislation: "Législation",
  naturalisation: "Naturalisation",
  "titre-sejour": "Titre de séjour",
  general: "Général",
};

export const THEMES: Theme[] = ["institutions", "histoire", "valeurs", "geographie", "culture"];
export const SOURCE_BANKS: SourceBank[] = ["officielles", "extended", "livret", "fulldata", "mise-en-situation"];
export const ARTICLE_CATS: ArticleCategory[] = ["legislation", "naturalisation", "titre-sejour", "general"];
export const PLATFORMS: Platform[] = ["TikTok", "YouTube", "Instagram", "Direct", "Twitter/X"];

// === V2 — Library ===
export type Visibility = "draft" | "published";

export type RevisionFiche = {
  id: string;
  title: string;
  content: string;
  theme: Theme;
  subTheme?: string | null;
  visibility: Visibility;
  updatedAt: string;
};

export type DetailedNotion = {
  id: string;
  question: string;
  answer: string;
  theme: Theme;
  subTheme?: string | null;
  visibility: Visibility;
  updatedAt: string;
};

export type CoursLesson = {
  id: string;
  title: string;
  source: string;
  bucket: "livret" | "cours";
  theme: Theme | null;
  body: string;
  parentId?: string | null;
  order: number;
  visibility: Visibility;
  updatedAt: string;
};

// === V2 — Forum ===
export type ForumTopic = "NAT" | "CSP" | "CR" | "general";

export type ForumReply = {
  id: string;
  threadId: string;
  author: string;
  authorInitials: string;
  body: string;
  createdAt: string;
  helpful: number;
  reportsCount: number;
  hidden: boolean;
};

export type ForumThread = {
  id: string;
  author: string;
  authorInitials: string;
  authorJourney: Goal;
  topic: ForumTopic;
  title: string;
  body: string;
  createdAt: string;
  views: number;
  pinned: boolean;
  locked: boolean;
  reportsCount: number;
  replies: ForumReply[];
};

export type ForumReport = {
  id: string;
  targetKind: "thread" | "reply";
  threadId: string;
  replyId?: string;
  reason: string;
  reporter: string;
  createdAt: string;
  status: "open" | "resolved";
};

// === V2 — Testimonials ===
export type Testimonial = {
  id: string;
  name: string;
  origin: string;
  journey: Goal;
  quote: string;
  avatarUrl?: string | null;
  rating: number;
  visibility: "visible" | "hidden";
  featured: boolean;
  createdAt: string;
};

// === V2 — Achievements ===
export type AchievementCategory = "engagement" | "performance" | "exploration" | "loyalty";

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: string;
  category: AchievementCategory;
  visibility: "active" | "archived";
  unlockedRate: number;
};

// === V2 — Eligibility ===
export type EligibilityChoice = { key: string; label: string };

export type EligibilityQuestion = {
  id: string;
  prompt: string;
  choices: EligibilityChoice[];
};

export type EligibilityOutcome =
  | { kind: "exempt"; reason: string }
  | { kind: "eligible"; programs: Goal[] }
  | { kind: "redirect"; url: string };

export type EligibilityRule = {
  id: string;
  conditions: Array<{ questionId: string; equals: string }>;
  outcome: EligibilityOutcome;
};

// === V2 — Plans ===
export type SubscriptionPlanId = "monthly" | "quarterly" | "lifetime";

export type PlanHistoryEntry = {
  changedAt: string;
  field: string;
  from: string | number | boolean;
  to: string | number | boolean;
};

export type SubscriptionPlan = {
  id: SubscriptionPlanId;
  title: string;
  price: number;
  priceLabel: string;
  period: string;
  features: string[];
  highlight: boolean;
  badge?: string;
  visibility: "visible" | "hidden";
  history: PlanHistoryEntry[];
};

// === V2 — Coaching offers ===
export type CoachOfferId = "single" | "pack3" | "full";

export type CoachOffer = {
  id: CoachOfferId;
  title: string;
  price: number;
  priceLabel: string;
  period: string;
  features: string[];
  highlight: boolean;
  badge?: string;
  visibility: "visible" | "hidden";
  conversionsMonth: number;
  revenueMonth: number;
};

// === V2 — Settings: admins ===
export type AdminRole = "super-admin" | "editor" | "moderator";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  twoFA: boolean;
  lastLogin: string;
  initials: string;
};

export type AdminActivityEntry = {
  id: string;
  author: string;
  action: string;
  target: string;
  at: string;
};

// === V2 — Settings: integrations ===
export type IntegrationId = "stripe" | "resend" | "slack" | "sentry" | "mixpanel";

export type Integration = {
  id: IntegrationId;
  name: string;
  description: string;
  apiKey: string;
  connected: boolean;
};

// === V2 — Settings: notifications ===
export type NotificationEvent =
  | "new-signup"
  | "payment-success"
  | "payment-failed"
  | "forum-report"
  | "new-partner"
  | "coach-application";

export type NotificationChannelToggles = {
  email: boolean;
  slack: boolean;
};

export type NotificationSetting = Record<NotificationEvent, NotificationChannelToggles>;

export const NOTIFICATION_EVENT_LABELS: Record<NotificationEvent, string> = {
  "new-signup": "Nouvelle inscription",
  "payment-success": "Paiement réussi",
  "payment-failed": "Échec de paiement",
  "forum-report": "Signalement forum",
  "new-partner": "Nouveau partenaire",
  "coach-application": "Candidature coach",
};
