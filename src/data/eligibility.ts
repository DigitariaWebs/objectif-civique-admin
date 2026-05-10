import type { EligibilityQuestion, EligibilityRule } from "@/types";

export const SEED_ELIGIBILITY_QUESTIONS: EligibilityQuestion[] = [
  {
    id: "q_age",
    prompt: "Quel est votre âge ?",
    choices: [
      { key: "lt18", label: "Moins de 18 ans" },
      { key: "18_64", label: "18 à 64 ans" },
      { key: "65+", label: "65 ans ou plus" },
    ],
  },
  {
    id: "q_residency",
    prompt: "Depuis combien d'années vivez-vous en France ?",
    choices: [
      { key: "lt2", label: "Moins de 2 ans" },
      { key: "2_4", label: "2 à 4 ans" },
      { key: "5_9", label: "5 à 9 ans" },
      { key: "10+", label: "10 ans ou plus" },
    ],
  },
  {
    id: "q_status",
    prompt: "Quel est votre statut administratif actuel ?",
    choices: [
      { key: "csp", label: "Carte de séjour" },
      { key: "cr", label: "Carte de résident" },
      { key: "asylum", label: "Réfugié·e" },
      { key: "tourist", label: "Touriste / autre" },
    ],
  },
  {
    id: "q_certif",
    prompt: "Disposez-vous d'un certificat médical d'exemption ?",
    choices: [
      { key: "yes_cert", label: "Oui" },
      { key: "no_cert", label: "Non" },
    ],
  },
];

export const SEED_ELIGIBILITY_RULES: EligibilityRule[] = [
  {
    id: "r_exempt_age",
    conditions: [
      { questionId: "q_age", equals: "65+" },
      { questionId: "q_certif", equals: "yes_cert" },
    ],
    outcome: { kind: "exempt", reason: "Exempté pour raison d'âge avec certificat médical" },
  },
  {
    id: "r_eligible_nat",
    conditions: [
      { questionId: "q_residency", equals: "5_9" },
      { questionId: "q_status", equals: "csp" },
    ],
    outcome: { kind: "eligible", programs: ["NAT", "CR"] },
  },
  {
    id: "r_eligible_cr",
    conditions: [
      { questionId: "q_residency", equals: "10+" },
    ],
    outcome: { kind: "eligible", programs: ["CR"] },
  },
  {
    id: "r_redirect_tourist",
    conditions: [
      { questionId: "q_status", equals: "tourist" },
    ],
    outcome: { kind: "redirect", url: "https://service-public.fr/particuliers" },
  },
];
