import { seedCollection } from '../seedUtils.js';

const raceMorphologies = [
  {
    id: 'elf',
    label: 'Haut Elfe / Elfe de Sang / Elfe du vide',
    maleHeightCm: 189.4,
    femaleHeightCm: 175.9,
    maleWeightMinKg: 46.3,
    maleWeightMaxKg: 78.0,
    femaleWeightMinKg: 41.7,
    femaleWeightMaxKg: 73.5,
    averageWeightMinKg: 45.4,
    averageWeightMaxKg: 79.4,
    notes: 'Poids basé sur la ligne High elf / Blood elf.'
  },
  {
    id: 'draenei',
    label: 'Draenei / Sancteforge',
    maleHeightCm: 226.3,
    femaleHeightCm: 215.0,
    maleWeightMinKg: 145,
    maleWeightMaxKg: 172,

    femaleWeightMinKg: 109,
    femaleWeightMaxKg: 136,

    averageWeightMinKg: 145,
    averageWeightMaxKg: 172,
    notes: 'Poids non fourni dans la capture source.'
  },
  {
    id: 'dwarf',
    label: 'Nain',
    maleHeightCm: 142.5,
    femaleHeightCm: 137.6,
    maleWeightMinKg: 60.8,
    maleWeightMaxKg: 102.5,
    femaleWeightMinKg: 47.2,
    femaleWeightMaxKg: 88.9,
    averageWeightMinKg: 63.5,
    averageWeightMaxKg: 72.6,
    notes: 'Poids basé sur la ligne Ironforge dwarf / Dwarf.'
  },
  {
    id: 'gnome',
    label: 'Gnome',
    maleHeightCm: 105.6,
    femaleHeightCm: 101.2,
    maleWeightMinKg: 19.1,
    maleWeightMaxKg: 21.8,
    femaleWeightMinKg: 16.8,
    femaleWeightMaxKg: 19.5,
    averageWeightMinKg: null,
    averageWeightMaxKg: null,
    notes: ''
  },
  {
    id: 'mechagnome',
    label: 'Mecagnome',
    maleHeightCm: 105.6,
    femaleHeightCm: 101.2,
    maleWeightMinKg: 19.1,
    maleWeightMaxKg: 21.8,
    femaleWeightMinKg: 16.8,
    femaleWeightMaxKg: 19.5,
    averageWeightMinKg: null,
    averageWeightMaxKg: null,
    notes: 'Poids basé sur la ligne Gnome.'
  },
  {
    id: 'human',
    label: 'Humain',
    maleHeightCm: 185.0,
    femaleHeightCm: 173.9,
    maleWeightMinKg: 56.2,
    maleWeightMaxKg: 127.0,
    femaleWeightMinKg: 40.4,
    femaleWeightMaxKg: 111.1,
    averageWeightMinKg: 81.6,
    averageWeightMaxKg: 81.6,
    notes: ''
  },
  {
    id: 'kul-tiran',
    label: 'Kul Tirassien',
    maleHeightCm: 237.3,
    femaleHeightCm: 220.9,
    maleWeightMinKg: null,
    maleWeightMaxKg: null,
    femaleWeightMinKg: null,
    femaleWeightMaxKg: null,
    averageWeightMinKg: null,
    averageWeightMaxKg: null,
    notes: 'Poids non fourni dans la capture source.'
  },
  {
    id: 'night-elf',
    label: 'Elfe de la nuit',
    maleHeightCm: 221.3,
    femaleHeightCm: 206.8,
    maleWeightMinKg: 83.5,
    maleWeightMaxKg: 147.0,
    femaleWeightMinKg: 78.9,
    femaleWeightMaxKg: 144.2,
    averageWeightMinKg: null,
    averageWeightMaxKg: null,
    notes: ''
  },
  {
    id: 'pandaren',
    label: 'Pandaren',
    maleHeightCm: 216.5,
    femaleHeightCm: 199.4,
    maleWeightMinKg: null,
    maleWeightMaxKg: null,
    femaleWeightMinKg: null,
    femaleWeightMaxKg: null,
    averageWeightMinKg: null,
    averageWeightMaxKg: null,
    notes: 'Poids non fourni dans la capture source.'
  },
  {
    id: 'worgen',
    label: 'Worgen',
    maleHeightCm: 235.6,
    femaleHeightCm: 211.8,
    maleWeightMinKg: null,
    maleWeightMaxKg: null,
    femaleWeightMinKg: null,
    femaleWeightMaxKg: null,
    averageWeightMinKg: null,
    averageWeightMaxKg: null,
    notes: 'Poids non fourni dans la capture source.'
  },
];

await seedCollection('raceMorphologies', raceMorphologies);