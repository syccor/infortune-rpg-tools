import { seedCollection } from '../seedUtils.js';

const weightClasses = [
  { id: 'feather', label: 'Plume', hpModifier: -25, dodgeModifier: 15, order: 1 },
  { id: 'very-light', label: 'Très léger', hpModifier: -15, dodgeModifier: 10, order: 2 },
  { id: 'light', label: 'Léger', hpModifier: -10, dodgeModifier: 5, order: 3 },
  { id: 'normal', label: 'Normal', hpModifier: 5, dodgeModifier: 0, order: 4 },
  { id: 'medium', label: 'Moyen', hpModifier: 10, dodgeModifier: 0, order: 5 },
  { id: 'heavy', label: 'Lourd', hpModifier: 15, dodgeModifier: -5, order: 6 },
  { id: 'very-heavy', label: 'Très lourd', hpModifier: 20, dodgeModifier: -10, order: 7 },
  { id: 'anvil', label: 'Enclume', hpModifier: 30, dodgeModifier: -20, order: 8 },
];

await seedCollection('weightClasses', weightClasses);
