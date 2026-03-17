import { seedCollection } from '../seedUtils.js';

const shieldTypes = [
  { id: 'none', label: 'Aucun', armorBonus: 0, dodgeModifier: 0, attackModifier: 0, order: 1 },
  {
    id: 'small-shield',
    label: 'Petit bouclier',
    armorBonus: 2,
    dodgeModifier: -5,
    attackModifier: 0,
    order: 2,
  },
  {
    id: 'large-shield',
    label: 'Grand bouclier',
    armorBonus: 4,
    dodgeModifier: -5,
    attackModifier: -10,
    order: 3,
  },
];

await seedCollection('shieldTypes', shieldTypes);
