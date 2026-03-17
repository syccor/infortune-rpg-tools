import { seedCollection } from '../seedUtils.js';

const petClasses = [
  {
    id: 'protector',
    label: 'Protecteur',
    hpModifier: 50,
    armorModifier: 2,
    dodgeModifier: 0,
    attackModifier: 0,
    dodgeCap: 40,
    armorCap: 25,
  },
  {
    id: 'hunter',
    label: 'Chasseur',
    hpModifier: 20,
    armorModifier: 0,
    dodgeModifier: 10,
    attackModifier: 5,
    dodgeCap: 50,
    armorCap: 20,
  },
  {
    id: 'killer',
    label: 'Tueur',
    hpModifier: -10,
    armorModifier: 0,
    dodgeModifier: 30,
    attackModifier: 20,
    dodgeCap: 60,
    armorCap: 15,
  },
];

await seedCollection('petClasses', petClasses);