import type { Achievement } from "@/types";

export const SEED_ACHIEVEMENTS: Achievement[] = [
  { id: "ach_first_q", title: "Premier QCM", description: "Compléter sa première session de QCM", icon: "Sparkles", condition: "questionsAnswered >= 1", category: "engagement", visibility: "active", unlockedRate: 92 },
  { id: "ach_100_q", title: "Les 100", description: "Répondre à 100 questions", icon: "Target", condition: "questionsAnswered >= 100", category: "engagement", visibility: "active", unlockedRate: 58 },
  { id: "ach_streak_7", title: "Une semaine de suite", description: "Réviser 7 jours consécutifs", icon: "Flame", condition: "currentStreak >= 7", category: "loyalty", visibility: "active", unlockedRate: 24 },
  { id: "ach_streak_30", title: "Mois citoyen", description: "Réviser 30 jours consécutifs", icon: "Crown", condition: "currentStreak >= 30", category: "loyalty", visibility: "active", unlockedRate: 6 },
  { id: "ach_perfect", title: "Sans-faute", description: "Réussir une session avec 100%", icon: "Award", condition: "bestSessionScore >= 100", category: "performance", visibility: "active", unlockedRate: 31 },
  { id: "ach_simulation", title: "Simulation réussie", description: "Réussir une simulation d'examen", icon: "ShieldCheck", condition: "simulationsCompleted >= 1", category: "performance", visibility: "active", unlockedRate: 41 },
  { id: "ach_explorer", title: "Explorateur des thèmes", description: "Avancer dans les 5 thèmes", icon: "Compass", condition: "themesStarted >= 5", category: "exploration", visibility: "active", unlockedRate: 38 },
  { id: "ach_history_master", title: "Historien", description: "Atteindre 90% au thème Histoire", icon: "BookOpen", condition: "themeProgress.histoire >= 90", category: "exploration", visibility: "active", unlockedRate: 12 },
  { id: "ach_civic", title: "Citoyen confirmé", description: "Atteindre 90% au thème Valeurs", icon: "Scale", condition: "themeProgress.valeurs >= 90", category: "exploration", visibility: "active", unlockedRate: 9 },
  { id: "ach_legacy", title: "Héritage", description: "Désactivé suite à la refonte du parcours", icon: "Archive", condition: "false", category: "loyalty", visibility: "archived", unlockedRate: 0 },
];

// DSL fields available to the admin's condition expression.
export const ACHIEVEMENT_DSL_FIELDS = [
  "questionsAnswered",
  "currentStreak",
  "bestSessionScore",
  "simulationsCompleted",
  "themesStarted",
  "themeProgress.institutions",
  "themeProgress.histoire",
  "themeProgress.valeurs",
  "themeProgress.geographie",
  "themeProgress.culture",
];

// Demo user — used to evaluate conditions in the test panel.
export const DEMO_USER_FOR_RULES: Record<string, number> = {
  questionsAnswered: 142,
  currentStreak: 9,
  bestSessionScore: 92,
  simulationsCompleted: 2,
  themesStarted: 4,
  "themeProgress.institutions": 78,
  "themeProgress.histoire": 64,
  "themeProgress.valeurs": 91,
  "themeProgress.geographie": 52,
  "themeProgress.culture": 45,
};

// Eval a tiny DSL: `field >= number`, `field <= number`, `field == number`, `field == "string"`,
// joined by &&. No side effects.
export function evalCondition(condition: string, ctx: Record<string, number | string | boolean>): boolean {
  const trimmed = condition.trim();
  if (!trimmed || trimmed === "false") return false;
  if (trimmed === "true") return true;
  const parts = trimmed.split(/&&/).map((p) => p.trim());
  return parts.every((p) => {
    const m = /^([a-zA-Z][a-zA-Z0-9_.]*)\s*(>=|<=|==|>|<)\s*(.+)$/.exec(p);
    if (!m) return false;
    const [, field, op, raw] = m;
    const value = ctx[field!];
    if (value == null) return false;
    let target: number | string | boolean = raw!;
    if (/^\-?\d+(\.\d+)?$/.test(raw!)) target = parseFloat(raw!);
    else if (/^"[^"]*"$/.test(raw!)) target = raw!.slice(1, -1);
    else if (raw === "true") target = true;
    else if (raw === "false") target = false;
    switch (op) {
      case ">=": return Number(value) >= Number(target);
      case "<=": return Number(value) <= Number(target);
      case ">": return Number(value) > Number(target);
      case "<": return Number(value) < Number(target);
      case "==": return value === target;
      default: return false;
    }
  });
}
