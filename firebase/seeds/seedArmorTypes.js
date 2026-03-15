import { seedCollection } from '../seedUtils.js';

const armorTypes =
[
  {
    id: 'plate',
    label: 'Plaques',
    baseArmor: 8,
    baseDodgeModifier: -10,
    shoulderArmorBonus: 1,
    shoulderDodgeModifier: -5,
    perceptionBonus: 0,
    shieldAllowed: true,
    order: 1
  },
  {
    id: 'mail',
    label: 'Mailles',
    baseArmor: 6,
    baseDodgeModifier: -5,
    shoulderArmorBonus: 1,
    shoulderDodgeModifier: 0,
    perceptionBonus: 0,
    shieldAllowed: false,
    order: 2
  },
  {
    id: 'leather',
    label: 'Cuir',
    baseArmor: 4,
    baseDodgeModifier: 5,
    shoulderArmorBonus: 1,
    shoulderDodgeModifier: 0,
    perceptionBonus: 0,
    shieldAllowed: false,
    order: 3
  },
  {
    id: 'cloth',
    label: 'Tissu renforcé',
    baseArmor: 3,
    baseDodgeModifier: 10,
    shoulderArmorBonus: 0,
    shoulderDodgeModifier: 0,
    perceptionBonus: 5,
    shieldAllowed: false,
    order: 4
  }
];

await seedCollection('armorTypes', armorTypes);
