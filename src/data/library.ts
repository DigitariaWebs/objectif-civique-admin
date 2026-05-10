import type { CoursLesson, DetailedNotion, RevisionFiche, Theme } from "@/types";

const NOW = new Date().toISOString();

const ficheBody = (bullets: string[]) => bullets.map((b) => `- ${b}`).join("\n");

export const SEED_FICHES: RevisionFiche[] = [
  {
    id: "f_inst_1",
    title: "Les institutions de la Ve République",
    theme: "institutions",
    subTheme: "Présidence",
    visibility: "published",
    updatedAt: NOW,
    content: ficheBody([
      "Le Président est élu au suffrage universel direct pour 5 ans.",
      "Mandat renouvelable une fois consécutivement (réforme 2008).",
      "Nomme le Premier ministre (Article 8).",
      "Préside le Conseil des ministres (Article 9).",
      "Peut dissoudre l'Assemblée nationale (Article 12).",
    ]),
  },
  {
    id: "f_inst_2",
    title: "Le Parlement français",
    theme: "institutions",
    subTheme: "Législatif",
    visibility: "published",
    updatedAt: NOW,
    content: ficheBody([
      "Bicaméral : Assemblée nationale + Sénat.",
      "Assemblée : 577 députés élus pour 5 ans.",
      "Sénat : 348 sénateurs élus pour 6 ans.",
      "Vote la loi et contrôle le gouvernement.",
    ]),
  },
  {
    id: "f_inst_3",
    title: "Le Conseil constitutionnel",
    theme: "institutions",
    subTheme: "Juridictionnel",
    visibility: "published",
    updatedAt: NOW,
    content: ficheBody([
      "9 membres nommés pour 9 ans non renouvelables.",
      "Vérifie la constitutionnalité des lois.",
      "QPC : question prioritaire de constitutionnalité depuis 2010.",
    ]),
  },
  {
    id: "f_hist_1",
    title: "La Révolution française",
    theme: "histoire",
    subTheme: "1789-1799",
    visibility: "published",
    updatedAt: NOW,
    content: ficheBody([
      "14 juillet 1789 : prise de la Bastille.",
      "26 août 1789 : Déclaration des droits de l'homme et du citoyen.",
      "1792 : proclamation de la République.",
      "1793 : exécution de Louis XVI.",
    ]),
  },
  {
    id: "f_hist_2",
    title: "Les Républiques successives",
    theme: "histoire",
    subTheme: "Régimes",
    visibility: "published",
    updatedAt: NOW,
    content: ficheBody([
      "Ire République : 1792-1804.",
      "IIe République : 1848-1852.",
      "IIIe République : 1870-1940.",
      "IVe République : 1946-1958.",
      "Ve République : 1958-aujourd'hui.",
    ]),
  },
  {
    id: "f_hist_3",
    title: "La Seconde Guerre mondiale en France",
    theme: "histoire",
    subTheme: "1939-1945",
    visibility: "published",
    updatedAt: NOW,
    content: ficheBody([
      "1940 : appel du 18 juin du général de Gaulle.",
      "1944 : débarquement de Normandie le 6 juin.",
      "1945 : 8 mai victoire en Europe.",
      "Libération de Paris : 25 août 1944.",
    ]),
  },
  {
    id: "f_val_1",
    title: "Liberté, Égalité, Fraternité",
    theme: "valeurs",
    subTheme: "Devise",
    visibility: "published",
    updatedAt: NOW,
    content: ficheBody([
      "Devise officielle inscrite dans la Constitution de 1958.",
      "Hérité de la Révolution française.",
      "Présent sur les bâtiments publics et la monnaie.",
    ]),
  },
  {
    id: "f_val_2",
    title: "La laïcité",
    theme: "valeurs",
    subTheme: "Principe républicain",
    visibility: "published",
    updatedAt: NOW,
    content: ficheBody([
      "Loi de séparation des Églises et de l'État (1905).",
      "Neutralité de l'État vis-à-vis des religions.",
      "Liberté de conscience garantie.",
      "Pas de financement public des cultes (sauf exceptions historiques).",
    ]),
  },
  {
    id: "f_val_3",
    title: "L'égalité hommes-femmes",
    theme: "valeurs",
    subTheme: "Droits",
    visibility: "published",
    updatedAt: NOW,
    content: ficheBody([
      "1944 : droit de vote pour les femmes.",
      "1965 : capacité juridique pleine de la femme mariée.",
      "1975 : loi Veil sur l'IVG.",
      "Parité en politique : loi de 2000.",
    ]),
  },
  {
    id: "f_geo_1",
    title: "Les régions et départements",
    theme: "geographie",
    subTheme: "Découpage",
    visibility: "published",
    updatedAt: NOW,
    content: ficheBody([
      "13 régions métropolitaines depuis 2016.",
      "5 régions d'outre-mer.",
      "101 départements (96 métropolitains + 5 ultramarins).",
      "Chef-lieu = préfecture du département.",
    ]),
  },
  {
    id: "f_geo_2",
    title: "Les fleuves de France",
    theme: "geographie",
    subTheme: "Hydrographie",
    visibility: "published",
    updatedAt: NOW,
    content: ficheBody([
      "Loire : 1 006 km, le plus long.",
      "Rhône : 812 km en France.",
      "Seine : 776 km, traverse Paris.",
      "Garonne : 647 km.",
    ]),
  },
  {
    id: "f_geo_3",
    title: "Les massifs montagneux",
    theme: "geographie",
    subTheme: "Reliefs",
    visibility: "draft",
    updatedAt: NOW,
    content: ficheBody([
      "Alpes : Mont Blanc 4 810 m.",
      "Pyrénées : frontière avec l'Espagne.",
      "Massif central, Jura, Vosges, Massif armoricain.",
    ]),
  },
  {
    id: "f_cul_1",
    title: "Symboles de la République",
    theme: "culture",
    subTheme: "Identité",
    visibility: "published",
    updatedAt: NOW,
    content: ficheBody([
      "Marianne : figure allégorique.",
      "Drapeau tricolore : bleu blanc rouge.",
      "Hymne : La Marseillaise (Rouget de Lisle, 1792).",
      "Coq gaulois : symbole sportif.",
    ]),
  },
  {
    id: "f_cul_2",
    title: "Le patrimoine culturel français",
    theme: "culture",
    subTheme: "Arts & lettres",
    visibility: "published",
    updatedAt: NOW,
    content: ficheBody([
      "Musée du Louvre : ancien palais royal.",
      "Versailles : symbole de la monarchie absolue.",
      "Notre-Dame, Mont-Saint-Michel, Chambord.",
      "Cinéma : Cannes, frères Lumière.",
    ]),
  },
  {
    id: "f_cul_3",
    title: "La gastronomie française",
    theme: "culture",
    subTheme: "Patrimoine immatériel",
    visibility: "draft",
    updatedAt: NOW,
    content: ficheBody([
      "Inscrite à l'UNESCO en 2010.",
      "Régionalité : 22 fromages AOC, plus de 300 plats régionaux.",
      "Repas gastronomique : pratique sociale coutumière.",
    ]),
  },
  {
    id: "f_inst_4",
    title: "Le Premier ministre",
    theme: "institutions",
    subTheme: "Exécutif",
    visibility: "published",
    updatedAt: NOW,
    content: ficheBody([
      "Nommé par le Président (Article 8).",
      "Chef du gouvernement.",
      "Conduit la politique de la nation.",
      "Responsable devant l'Assemblée nationale.",
    ]),
  },
  {
    id: "f_hist_4",
    title: "Les colonies et la décolonisation",
    theme: "histoire",
    subTheme: "XXe siècle",
    visibility: "draft",
    updatedAt: NOW,
    content: ficheBody([
      "Empire colonial français : XIXe-XXe.",
      "1954-1962 : guerre d'Algérie.",
      "1960 : indépendance des colonies africaines.",
      "Aujourd'hui : départements et collectivités d'outre-mer.",
    ]),
  },
  {
    id: "f_val_4",
    title: "Les droits de l'homme",
    theme: "valeurs",
    subTheme: "Universalité",
    visibility: "published",
    updatedAt: NOW,
    content: ficheBody([
      "Déclaration de 1789 : référence française.",
      "1948 : Déclaration universelle des droits de l'homme.",
      "Convention européenne des droits de l'homme (1950).",
    ]),
  },
  {
    id: "f_geo_4",
    title: "Les frontières",
    theme: "geographie",
    subTheme: "Limites",
    visibility: "published",
    updatedAt: NOW,
    content: ficheBody([
      "8 pays frontaliers : Belgique, Luxembourg, Allemagne, Suisse, Italie, Monaco, Espagne, Andorre.",
      "Façades maritimes : Manche, Atlantique, Méditerranée.",
    ]),
  },
  {
    id: "f_cul_4",
    title: "Personnalités historiques",
    theme: "culture",
    subTheme: "Panthéon",
    visibility: "published",
    updatedAt: NOW,
    content: ficheBody([
      "Voltaire, Rousseau, Hugo : Lumières et littérature.",
      "Pasteur, Curie : sciences.",
      "Joan d'Arc : figure nationale.",
      "De Gaulle : fondateur de la Ve République.",
    ]),
  },
];

export const SEED_NOTIONS: DetailedNotion[] = Array.from({ length: 36 }, (_, i) => {
  const themes: Theme[] = ["institutions", "histoire", "valeurs", "geographie", "culture"];
  const theme = themes[i % themes.length]!;
  return {
    id: `n_${i + 1}`,
    question: [
      "Pourquoi la République est-elle indivisible ?",
      "Quelle est la différence entre laïcité et neutralité ?",
      "À quoi sert le Sénat exactement ?",
      "Comment fonctionne la séparation des pouvoirs en France ?",
      "Quelles sont les origines de la devise républicaine ?",
      "Que signifie « État de droit » ?",
      "Pourquoi commémore-t-on le 11 novembre ?",
      "Comment se déroule l'élection présidentielle ?",
      "Qu'est-ce qu'une loi organique ?",
      "Quelle est la place des collectivités territoriales ?",
      "Que change la Constitution de 1958 par rapport à la IVe ?",
      "Quel est le rôle exact du Conseil d'État ?",
    ][i % 12]!,
    answer:
      "## Repère historique\n\nÉlément clé du fonctionnement de la République, ce point se comprend à la lumière de l'histoire constitutionnelle française et des principes énoncés à l'article 1er de la Constitution.\n\n## Définition\n\nLa notion fait référence à un principe juridique structurant. Elle implique notamment :\n\n- une portée universelle sur l'ensemble du territoire ;\n- une continuité dans l'application des lois ;\n- l'absence de privilèges entre régions ou catégories de citoyens.\n\n> « La République est indivisible, laïque, démocratique et sociale. » — Article 1er, Constitution de 1958.\n\n## En pratique\n\nDans les démarches administratives quotidiennes (préfecture, mairie, juridictions), ce principe se traduit par l'application uniforme des règles, qu'on soit en métropole ou en outre-mer.",
    theme,
    subTheme: theme === "institutions" ? "Constitution" : theme === "histoire" ? "Repères" : null,
    visibility: i < 30 ? "published" : "draft",
    updatedAt: NOW,
  };
});

export const SEED_COURS: CoursLesson[] = (() => {
  const out: CoursLesson[] = [];
  const themes: (Theme | null)[] = ["institutions", "histoire", "valeurs", "geographie", "culture", null];
  let order = 0;
  // Livret bucket — 16 lessons
  for (let i = 0; i < 16; i++) {
    out.push({
      id: `c_l_${i + 1}`,
      title: [
        "Le livret du citoyen — préface",
        "L'idée républicaine",
        "Les grandes étapes de l'histoire",
        "Marianne et les symboles",
        "Le territoire français",
        "L'organisation des pouvoirs",
        "Voter, être candidat",
        "Justice et droits fondamentaux",
        "École et laïcité",
        "Le service public",
        "Vivre ensemble",
        "Les engagements citoyens",
        "Hymne et drapeau",
        "Devise et identité",
        "Personnalités marquantes",
        "Conclusion : devenir français",
      ][i]!,
      source: `livret/chap_${i + 1}.md`,
      bucket: "livret",
      theme: themes[i % themes.length]!,
      body:
        "# " +
        "Chapitre " +
        (i + 1) +
        "\n\nCe chapitre du livret du citoyen présente, en termes accessibles, les fondements et la pratique de la République française. Il sert de support de révision pour le test civique et l'entretien d'assimilation.\n\n## Points clés\n\n- Repère historique\n- Cadre juridique\n- Application concrète\n\n## Exemple\n\n> Repère officiel.\n",
      parentId: null,
      order: order++,
      visibility: "published",
      updatedAt: NOW,
    });
  }
  // Cours bucket — 30 lessons
  for (let i = 0; i < 30; i++) {
    out.push({
      id: `c_c_${i + 1}`,
      title: [
        "Cours 1 — La séparation des pouvoirs",
        "Cours 2 — La V République",
        "Cours 3 — Élections et suffrage",
        "Cours 4 — La laïcité en pratique",
        "Cours 5 — La Révolution française",
        "Cours 6 — La République sociale",
        "Cours 7 — La justice française",
        "Cours 8 — Les droits fondamentaux",
        "Cours 9 — Géographie politique",
        "Cours 10 — L'Union européenne",
        "Cours 11 — Les présidents marquants",
        "Cours 12 — La culture française",
        "Cours 13 — Les grandes lois",
        "Cours 14 — La société multiculturelle",
        "Cours 15 — Les médias et l'information",
      ][i % 15]! + (i >= 15 ? " (suite)" : ""),
      source: `cours/lecon_${i + 1}.md`,
      bucket: "cours",
      theme: themes[i % themes.length]!,
      body:
        "# Cours pédagogique\n\nCe cours développe en profondeur un thème central du test civique. Il s'adresse aux candidats préparant la naturalisation, la carte de séjour ou la carte de résident.\n\n## Plan\n\n1. Mise en contexte historique\n2. Cadre constitutionnel\n3. Mises en pratique\n\n### Exemples\n\n- Cas concret 1\n- Cas concret 2\n",
      parentId: null,
      order: order++,
      visibility: i < 25 ? "published" : "draft",
      updatedAt: NOW,
    });
  }
  return out;
})();
