import type { AdminActivityEntry, AdminUser } from "@/types";

const NOW = Date.now();
const ago = (n: number) => new Date(NOW - n).toISOString();

export const SEED_ADMINS: AdminUser[] = [
  { id: "a_1", name: "Camille Lefèvre", email: "camille.lefevre@objectif-civique.fr", role: "super-admin", twoFA: true, lastLogin: ago(900_000), initials: "CL" },
  { id: "a_2", name: "Karim Benkhelifa", email: "karim.benkhelifa@objectif-civique.fr", role: "editor", twoFA: true, lastLogin: ago(36_000_000), initials: "KB" },
  { id: "a_3", name: "Léa Mercier", email: "lea.mercier@objectif-civique.fr", role: "editor", twoFA: false, lastLogin: ago(72_000_000), initials: "LM" },
  { id: "a_4", name: "Mehdi Lopez", email: "mehdi.lopez@objectif-civique.fr", role: "moderator", twoFA: true, lastLogin: ago(8 * 86_400_000), initials: "ML" },
];

export const SEED_ADMIN_ACTIVITY: AdminActivityEntry[] = [
  { id: "act_1", author: "Camille L.", action: "a publié", target: "Article « Loi immigration 2025 »", at: ago(600_000) },
  { id: "act_2", author: "Karim B.", action: "a modifié", target: "14 questions du thème Histoire", at: ago(3_600_000) },
  { id: "act_3", author: "Système", action: "a détecté", target: "biais sur la banque officielles", at: ago(10_800_000) },
  { id: "act_4", author: "Léa M.", action: "a ajouté", target: "centre Préfecture d'Évry", at: ago(86_400_000) },
  { id: "act_5", author: "Mehdi L.", action: "a modéré", target: "thread #t_5 (spam)", at: ago(2 * 86_400_000) },
  { id: "act_6", author: "Camille L.", action: "a marqué payé", target: "partenaire NORA10", at: ago(3 * 86_400_000) },
];
