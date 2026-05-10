// Seedable PRNG so each session produces stable mock data.

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const rng = mulberry32(20260508);
export const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)]!;
export const randInt = (a: number, b: number) => Math.floor(rng() * (b - a + 1)) + a;

export function dateAgoStr(maxDaysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - randInt(0, maxDaysAgo));
  return d.toISOString().slice(0, 10);
}

export const FR_FIRST = ["Aïcha","Mehdi","Fatou","Jean","Marie","Karim","Léa","Yacine","Sofia","Camille","Olivier","Nadia","Amadou","Inès","Hugo","Khadija","Lucas","Emma","Mamadou","Chloé","Issa","Sarah","Diego","Aminata","Théo","Yasmine","Mathieu","Cheikh","Anaïs","Mohamed","Julie","Rachid","Fanta","Pierre","Awa","Tarik","Manon","Boubacar","Salma","Antoine","Zineb","Adama","Léon","Oumou","Étienne","Souad","Damien","Kadi","Nicolas","Fadila","Stéphane","Bilal","Marion","Imane","Vincent","Amine","Sophie","Lamine","Élise","Cédric","Mounir","Naïma","Abdou","Bérénice","Yves","Houda","Quentin","Soumaya","Romain","Djeneba","Patrick","Sadio","Béatrice","Idriss","Charline","Mokhtar","Élodie","Babacar","Assia","Bruno","Latifa"];
export const FR_LAST = ["Diallo","Martin","Ndiaye","Bernard","Traoré","Dubois","Fofana","Lefèvre","Konaté","Roux","Sylla","Garcia","El Amrani","Lambert","Benkhelifa","Mercier","Diop","Bonnet","Cissé","Petit","Touré","Vincent","Boucher","Camara","Marchand","Kanté","Roy","Renard","Dupont","Thomas","Bah","Lopez","Belkacem","Faure","Moreau","Robert","Sow","Aubert","Hassan","Perrin","Sanchez","Mansouri","Picard","Zidane","Henry","Boulanger","Karimi","Rousseau","Berger","Antoine"];
