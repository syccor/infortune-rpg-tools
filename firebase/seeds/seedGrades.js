import { seedCollection } from '../seedUtils.js';

const grades = [
  {
    id: 'demi-solde',
    label: 'Demi-Solde',
    hasShoulderPads: false,
    solde: 1,
    isOfficer: false,
    order: 1,
  },
  {
    id: 'phallange',
    label: 'Phallange',
    hasShoulderPads: true,
    solde: 3,
    isOfficer: false,
    order: 2,
  },
  {
    id: 'double-solde',
    label: 'Double-Solde',
    hasShoulderPads: true,
    solde: 6,
    isOfficer: false,
    order: 3,
  },
  { id: 'sergent', label: 'Sergent', hasShoulderPads: true, solde: 7, isOfficer: false, orders: 4 },
  { id: 'prevot', label: 'Prévôt', hasShoulderPads: true, solde: 8, isOfficer: true, orders: 5 },
  {
    id: 'lieutenant',
    label: 'Lieutenant',
    hasShoulderPads: true,
    solde: 10,
    isOfficer: true,
    orders: 6,
  },
  {
    id: 'capitaine',
    label: 'Capitaine',
    hasShoulderPads: true,
    solde: 0,
    isOfficer: true,
    orders: 7,
  },
];

await seedCollection('grades', grades);
