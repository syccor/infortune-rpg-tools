import { seedCollection } from '../seedUtils.js';

const sizeClasses = [
  { id: 'lilliputian', label: 'Lilliputien', hpModifier: -15, dodgeModifier: 15, order: 1 },
  { id: 'tiny', label: 'Minuscule', hpModifier: -10, dodgeModifier: 10, order: 2 },
  { id: 'small', label: 'Petit', hpModifier: -5, dodgeModifier: 5, order: 3 },
  { id: 'medium', label: 'Moyen', hpModifier: 5, dodgeModifier: 0, order: 4 },
  { id: 'tall', label: 'Grand', hpModifier: 10, dodgeModifier: 0, order: 5 },
  { id: 'very-tall', label: 'Très grand', hpModifier: 15, dodgeModifier: 0, order: 6 },
  { id: 'huge', label: 'Immense', hpModifier: 20, dodgeModifier: -5, order: 7 },
  { id: 'titanic', label: 'Titanesque', hpModifier: 25, dodgeModifier: -10, order: 8 },
];

await seedCollection('sizeClasses', sizeClasses);
