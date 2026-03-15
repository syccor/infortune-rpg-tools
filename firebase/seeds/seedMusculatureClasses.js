import { seedCollection } from "../seedUtils.js";

const musculatureClasses = [
  { id: "rachitique", label: "Rachitique", hpModifier: -30, order: 1 },
  { id: "faible", label: "Faible", hpModifier: -15, order: 2 },
  { id: "normale", label: "Normale", hpModifier: 0, order: 3 },
  { id: "fine", label: "Fine", hpModifier: 10, order: 4 },
  { id: "entretenue", label: "Entretenue", hpModifier: 15, order: 5 },
  { id: "solide", label: "Solide", hpModifier: 20, order: 6 },
  { id: "imposante", label: "Imposante", hpModifier: 25, minWeightClassOrder: 5, order: 7 },
  { id: "colossale", label: "Colossale", hpModifier: 40, minWeightClassOrder: 6, order: 8 }
];

await seedCollection("musculatureClasses", musculatureClasses);