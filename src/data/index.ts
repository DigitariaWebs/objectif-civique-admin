import type {
  User,
  Question,
  Article,
  Center,
  Coach,
  Partner,
  SignupPoint,
  SessionPoint,
  JourneyDist,
  TopFailed,
  BankBias,
  Goal,
  Plan,
  Deadline,
  Level,
  Theme,
  SourceBank,
  ArticleCategory,
  ArticleStatus,
  Platform,
  CenterStatus,
  CoachStatus,
  PartnerStatus,
} from "@/types";
import { rng, pick, randInt, dateAgoStr, FR_FIRST, FR_LAST } from "./_seed";

const ROBOT_GOALS: Goal[] = ["NAT", "CSP", "CR"];
const PLANS: Plan[] = ["free", "monthly", "quarterly", "lifetime"];
const DEADLINE_OPTS: Deadline[] = ["lt1m", "1to3m", "3to6m", "undecided"];
const LEVELS: Level[] = ["debutant", "intermediaire", "avance", "inconnu"];
const CHANNELS = ["TikTok","Instagram","YouTube","Bouche à oreille","Recherche Google","Préfecture","Association","Famille"];

// === USERS — 320 ===
export const USERS: User[] = (() => {
  const out: User[] = [];
  for (let i = 0; i < 320; i++) {
    const fn = pick(FR_FIRST);
    const ln = pick(FR_LAST);
    const goal: Goal | null = rng() < 0.92 ? pick(ROBOT_GOALS) : null;
    const planRoll = rng();
    const plan: Plan = planRoll < 0.62 ? "free" : planRoll < 0.78 ? "monthly" : planRoll < 0.92 ? "quarterly" : "lifetime";
    out.push({
      id: `usr_${(10000 + i).toString(36)}`,
      firstName: fn,
      lastName: ln,
      email: `${fn.toLowerCase().replace(/[^a-z]/g, "")}.${ln.toLowerCase().replace(/[^a-z]/g, "")}@${pick(["gmail.com","hotmail.fr","laposte.net","outlook.fr","yahoo.fr","orange.fr"])}`,
      goal,
      deadline: pick(DEADLINE_OPTS),
      level: pick(LEVELS),
      channel: pick(CHANNELS),
      companion: pick(["Seul·e","En famille","Avec ami·e"]),
      createdAt: dateAgoStr(420),
      lastActive: dateAgoStr(30),
      subscriptionPlan: plan,
      civicTestPassed: goal === "NAT" ? (rng() < 0.4 ? true : null) : null,
      languageTestPassed: rng() < 0.5 ? true : null,
      avgScore: randInt(45, 96),
      streak: randInt(0, 42),
      sessionsTotal: randInt(0, 180),
      referralCodeUsed: rng() < 0.22 ? pick(["NORA10","TIKTOK22","YASMINE","CITOYEN","PARIS"]) : null,
    });
  }
  return out;
})();

// === QUESTIONS — 280 ===
const QUESTION_SEEDS: { text: string; choices: string[]; correct: number; theme: Theme; expl: string }[] = [
  { text: "Qui est l'actuel Président de la République française ?", choices: ["Emmanuel Macron","Nicolas Sarkozy","François Hollande","Jacques Chirac"], correct: 0, theme: "institutions", expl: "Emmanuel Macron a été élu en 2017 puis réélu en 2022." },
  { text: "Quelle est la devise de la République française ?", choices: ["Liberté, Égalité, Fraternité","Travail, Famille, Patrie","Unité, Indivisibilité, Laïcité","Liberté, Justice, Solidarité"], correct: 0, theme: "valeurs", expl: "La devise officielle figure dans la Constitution de 1958." },
  { text: "Quel jour célèbre-t-on la fête nationale ?", choices: ["8 mai","11 novembre","14 juillet","1er mai"], correct: 2, theme: "histoire", expl: "Commémoration de la prise de la Bastille en 1789." },
  { text: "Combien y a-t-il de régions en France métropolitaine ?", choices: ["12","13","14","18"], correct: 1, theme: "geographie", expl: "Depuis la réforme territoriale de 2016." },
  { text: "Qui a écrit La Marseillaise ?", choices: ["Victor Hugo","Rouget de Lisle","Voltaire","Pierre Corneille"], correct: 1, theme: "culture", expl: "Composée à Strasbourg en 1792." },
  { text: "Combien de chambres composent le Parlement français ?", choices: ["Une","Deux","Trois","Quatre"], correct: 1, theme: "institutions", expl: "L'Assemblée nationale et le Sénat." },
  { text: "Quel est le fleuve le plus long de France ?", choices: ["La Seine","Le Rhône","La Loire","La Garonne"], correct: 2, theme: "geographie", expl: "La Loire mesure 1 006 km." },
  { text: "En quelle année la peine de mort a-t-elle été abolie en France ?", choices: ["1972","1981","1995","2002"], correct: 1, theme: "histoire", expl: "Loi portée par Robert Badinter." },
  { text: "Le principe de laïcité est inscrit dans :", choices: ["La Déclaration des droits de l'homme","La loi de 1905","Le Code civil","La loi de 1789"], correct: 1, theme: "valeurs", expl: "Loi de séparation des Églises et de l'État." },
  { text: "Qui désigne le Premier ministre ?", choices: ["L'Assemblée nationale","Le peuple","Le Président de la République","Le Sénat"], correct: 2, theme: "institutions", expl: "Article 8 de la Constitution." },
  { text: "Quel symbole figure sur les pièces d'euro françaises ?", choices: ["Le coq","La Marianne","La Tour Eiffel","Le drapeau tricolore"], correct: 1, theme: "culture", expl: "Marianne incarne la République." },
  { text: "Quelle est la capitale de la région Bretagne ?", choices: ["Brest","Nantes","Rennes","Quimper"], correct: 2, theme: "geographie", expl: "Rennes est le chef-lieu administratif." },
  { text: "Combien de temps dure le mandat présidentiel ?", choices: ["4 ans","5 ans","6 ans","7 ans"], correct: 1, theme: "institutions", expl: "Quinquennat depuis 2000." },
  { text: "Quel artiste a peint La Liberté guidant le peuple ?", choices: ["Monet","Delacroix","Cézanne","David"], correct: 1, theme: "culture", expl: "Eugène Delacroix, 1830." },
  { text: "Quel président a fondé la Ve République ?", choices: ["Charles de Gaulle","Vincent Auriol","René Coty","Georges Pompidou"], correct: 0, theme: "histoire", expl: "Constitution adoptée en 1958." },
];

const SOURCE_BANKS_LOCAL: SourceBank[] = ["officielles", "extended", "livret", "fulldata", "mise-en-situation"];

export const QUESTIONS: Question[] = (() => {
  const out: Question[] = [];
  for (let i = 0; i < 280; i++) {
    const seed = QUESTION_SEEDS[i % QUESTION_SEEDS.length]!;
    const cat = pick(ROBOT_GOALS);
    const sourceBank = pick(SOURCE_BANKS_LOCAL);
    let correctIndex = seed.correct;
    if (sourceBank === "officielles" && rng() < 0.85) correctIndex = 0;
    else correctIndex = randInt(0, 3);
    const stat = randInt(28, 96);
    out.push({
      id: `q_${(1000 + i).toString(36).toUpperCase()}`,
      category: cat,
      theme: seed.theme,
      text: seed.text,
      choices: [...seed.choices],
      correctIndex,
      explanation: seed.expl,
      sourceBank,
      stats: stat,
      attempts: randInt(120, 4200),
      active: rng() > 0.05,
    });
  }
  return out;
})();

export const BANK_BIAS: BankBias = (() => {
  const map = {} as BankBias;
  SOURCE_BANKS_LOCAL.forEach((b) => {
    map[b] = { 0: 0, 1: 0, 2: 0, 3: 0, total: 0 };
  });
  QUESTIONS.forEach((q) => {
    map[q.sourceBank][q.correctIndex as 0 | 1 | 2 | 3]++;
    map[q.sourceBank].total++;
  });
  return map;
})();

// === ARTICLES — 48 ===
const ARTICLE_CATS_LOCAL: ArticleCategory[] = ["legislation","naturalisation","titre-sejour","general"];
const ARTICLE_TITLES = [
  "Loi immigration 2025 : ce qui change pour les candidats à la naturalisation",
  "Comment se préparer à l'entretien d'assimilation en préfecture",
  "Test civique : barème, durée, conditions de réussite",
  "La carte de résident de 10 ans : conditions et démarches",
  "Délais de naturalisation : les chiffres réels par préfecture",
  "Renouvellement de titre de séjour : pièces obligatoires",
  "Le rôle du livret du citoyen dans votre préparation",
  "Naturalisation par mariage : 4 ans suffisent-ils vraiment ?",
  "TCF, TEF, DELF : quel test de langue choisir ?",
  "Refus de naturalisation : voies de recours",
  "Le serment républicain : ce que vous direz le jour J",
  "Les 5 thèmes incontournables du test civique",
  "Histoire de la République : la chronologie qu'il faut connaître",
  "Les institutions françaises expliquées en 10 minutes",
  "Régularisation par le travail : circulaire Valls 2024",
  "Comment obtenir un certificat de nationalité française",
  "Acquisition par filiation, mariage, déclaration : comparatif",
  "L'entretien individuel : 30 questions types décryptées",
  "Vivre en France : droits et devoirs du résident",
  "La laïcité expliquée aux nouveaux arrivants",
  "Calendrier des fêtes nationales et leur signification",
  "Préparer son dossier ANEF : guide pas-à-pas",
  "Frais de timbre et de dossier : barème 2025",
  "Le référendum en France : comment ça marche",
];

export const ARTICLES: Article[] = (() => {
  const out: Article[] = [];
  for (let i = 0; i < 48; i++) {
    const t = ARTICLE_TITLES[i % ARTICLE_TITLES.length]! + (i >= ARTICLE_TITLES.length ? ` (partie ${Math.ceil((i - ARTICLE_TITLES.length + 1) / 4) + 1})` : "");
    const status: ArticleStatus = rng() > 0.18 ? "published" : "draft";
    out.push({
      id: `art_${i + 1}`,
      title: t,
      category: pick(ARTICLE_CATS_LOCAL),
      excerpt: "Un guide pratique destiné aux candidats pour clarifier les étapes administratives.",
      publishedAt: dateAgoStr(180),
      source: pick(["Service-Public.fr","Légifrance","Ministère de l'Intérieur","Rédaction OC","Préfecture de Paris"]),
      views: randInt(220, 28000),
      status,
      author: `${pick(FR_FIRST)} ${pick(FR_LAST)}`,
    });
  }
  return out;
})();

// === CENTERS — 220 ===
const FR_DEPTS = [
  { dep: "75", city: "Paris", name: "Paris" },
  { dep: "13", city: "Marseille", name: "Bouches-du-Rhône" },
  { dep: "69", city: "Lyon", name: "Rhône" },
  { dep: "31", city: "Toulouse", name: "Haute-Garonne" },
  { dep: "06", city: "Nice", name: "Alpes-Maritimes" },
  { dep: "44", city: "Nantes", name: "Loire-Atlantique" },
  { dep: "67", city: "Strasbourg", name: "Bas-Rhin" },
  { dep: "34", city: "Montpellier", name: "Hérault" },
  { dep: "33", city: "Bordeaux", name: "Gironde" },
  { dep: "59", city: "Lille", name: "Nord" },
  { dep: "35", city: "Rennes", name: "Ille-et-Vilaine" },
  { dep: "51", city: "Reims", name: "Marne" },
  { dep: "54", city: "Nancy", name: "Meurthe-et-Moselle" },
  { dep: "63", city: "Clermont-Ferrand", name: "Puy-de-Dôme" },
  { dep: "76", city: "Rouen", name: "Seine-Maritime" },
  { dep: "38", city: "Grenoble", name: "Isère" },
  { dep: "21", city: "Dijon", name: "Côte-d'Or" },
  { dep: "37", city: "Tours", name: "Indre-et-Loire" },
  { dep: "49", city: "Angers", name: "Maine-et-Loire" },
  { dep: "29", city: "Brest", name: "Finistère" },
  { dep: "57", city: "Metz", name: "Moselle" },
  { dep: "68", city: "Mulhouse", name: "Haut-Rhin" },
  { dep: "62", city: "Calais", name: "Pas-de-Calais" },
  { dep: "83", city: "Toulon", name: "Var" },
  { dep: "45", city: "Orléans", name: "Loiret" },
  { dep: "94", city: "Créteil", name: "Val-de-Marne" },
  { dep: "92", city: "Nanterre", name: "Hauts-de-Seine" },
  { dep: "93", city: "Bobigny", name: "Seine-Saint-Denis" },
  { dep: "78", city: "Versailles", name: "Yvelines" },
  { dep: "91", city: "Évry", name: "Essonne" },
];

const CENTER_TYPES = ["Préfecture","Sous-préfecture","Centre OFII","Plateforme civique"];

export const CENTERS: Center[] = (() => {
  const out: Center[] = [];
  let i = 0;
  while (out.length < 220) {
    const d = FR_DEPTS[i % FR_DEPTS.length]!;
    const t = pick(CENTER_TYPES);
    const services: Goal[] = [];
    if (rng() > 0.2) services.push("CSP");
    if (rng() > 0.3) services.push("CR");
    if (rng() > 0.5) services.push("NAT");
    if (services.length === 0) services.push("CSP");
    const status: CenterStatus = rng() > 0.08 ? "active" : "inactive";
    out.push({
      id: `ctr_${out.length + 1}`,
      name: `${t} de ${d.city}${out.length % FR_DEPTS.length > FR_DEPTS.length - 4 ? " — Annexe" : ""}`,
      city: d.city,
      department: d.dep,
      departmentName: d.name,
      address: `${randInt(1, 280)} ${pick(["rue","avenue","boulevard","place"])} ${pick(["de la République","du Général-de-Gaulle","Victor-Hugo","Jean-Jaurès","de la Mairie","du 14-Juillet","des Carmes","Pasteur","Voltaire","de la Liberté"])}, ${d.dep}000 ${d.city}`,
      services,
      phone: `01 ${randInt(40, 89)} ${randInt(10, 99)} ${randInt(10, 99)} ${randInt(10, 99)}`,
      status,
      lastUpdate: dateAgoStr(60),
    });
    i++;
  }
  return out;
})();

// === COACHES === (static)
export const COACHES: Coach[] = [
  { id: "c1", name: "Yasmine Benali", specialty: "Préparation entretien d'assimilation", languages: ["Français","Arabe","Anglais"], rating: 4.9, completedSessions: 142, status: "available", bio: "Ancienne fonctionnaire en préfecture, j'accompagne depuis 6 ans les candidats à la naturalisation.", price: 49 },
  { id: "c2", name: "Mehdi Lopez", specialty: "Test civique & valeurs républicaines", languages: ["Français","Espagnol","Arabe"], rating: 4.8, completedSessions: 98, status: "available", bio: "Professeur d'instruction civique, spécialisé dans la pédagogie pour adultes.", price: 49 },
  { id: "c3", name: "Aïcha Diallo", specialty: "Carte de résident & démarches", languages: ["Français","Wolof","Anglais"], rating: 4.7, completedSessions: 76, status: "busy", bio: "Juriste en droit des étrangers, je guide pas-à-pas les candidats.", price: 49 },
  { id: "c4", name: "Olivier Marchand", specialty: "Histoire et institutions", languages: ["Français","Anglais"], rating: 4.6, completedSessions: 54, status: "available", bio: "Doctorant en histoire contemporaine, passionné par la transmission.", price: 49 },
  { id: "c5", name: "Soumaya El Amrani", specialty: "Test de langue (TCF/TEF)", languages: ["Français","Arabe","Anglais"], rating: 4.9, completedSessions: 211, status: "available", bio: "Formatrice FLE certifiée Alliance Française.", price: 59 },
  { id: "c6", name: "Idriss Touré", specialty: "Coaching mental & confiance", languages: ["Français","Bambara","Anglais"], rating: 4.5, completedSessions: 37, status: "available", bio: "Coach certifié, j'aide à dépasser le stress de l'entretien.", price: 49 },
];

// === PARTNERS — 64 ===
const PLATFORMS_LOCAL: Platform[] = ["TikTok","YouTube","Instagram","Direct","Twitter/X"];

export const PARTNERS: Partner[] = (() => {
  const out: Partner[] = [];
  for (let i = 0; i < 64; i++) {
    const fn = pick(FR_FIRST);
    const ln = pick(FR_LAST);
    const platform = pick(PLATFORMS_LOCAL);
    const followers = platform === "Direct" ? 0 : randInt(800, 480000);
    const signups = randInt(0, Math.max(8, Math.floor(followers / 220)));
    const conversions = Math.floor(signups * (0.04 + rng() * 0.18));
    const status: PartnerStatus = rng() > 0.06 ? "active" : "suspended";
    out.push({
      id: `p_${i + 1}`,
      code: (fn.slice(0, 3) + (10 + i)).toUpperCase().replace(/[^A-Z0-9]/g, ""),
      name: `${fn} ${ln}`,
      handle: platform === "Direct" ? null : `@${fn.toLowerCase().replace(/[^a-z]/g, "")}_${ln.toLowerCase().replace(/[^a-z]/g, "")}`,
      platform,
      followers,
      signups,
      conversions,
      earnings: conversions * 4.99 * 0.10 * randInt(1, 12),
      status,
      joinedAt: dateAgoStr(360),
      lastPayout: dateAgoStr(60),
    });
  }
  return out.sort((a, b) => b.conversions - a.conversions);
})();

// === Time series for dashboard ===
export const SIGNUPS_30: SignupPoint[] = (() => {
  const out: SignupPoint[] = [];
  let v = 32;
  for (let i = 29; i >= 0; i--) {
    v += Math.round((rng() - 0.4) * 9);
    v = Math.max(15, v);
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push({
      day: `${d.getDate()}/${d.getMonth() + 1}`,
      signups: v,
      paid: Math.round(v * (0.18 + rng() * 0.08)),
    });
  }
  return out;
})();

export const SESSIONS_30: SessionPoint[] = SIGNUPS_30.map((d) => ({
  day: d.day,
  sessions: 200 + Math.round(rng() * 800) + d.signups * 4,
}));

export const JOURNEY_DIST: JourneyDist[] = [
  { name: "NAT", value: 1840, color: "#0055A4" },
  { name: "CSP", value: 1420, color: "#1a6bb8" },
  { name: "CR", value: 760, color: "#5b8fc7" },
];

export const TOP_FAILED: TopFailed[] = QUESTIONS
  .map((q) => ({ id: q.id, text: q.text, fail: 100 - q.stats, attempts: q.attempts }))
  .sort((a, b) => b.fail - a.fail)
  .slice(0, 10);
