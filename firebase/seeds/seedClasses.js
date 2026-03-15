import { seedCollection } from '../seedUtils.js';

const classes = [
  { id: 'heavy-fighter', label: 'Combattant lourd', family: 'martial', isMystic: false, order: 1 },
  { id: 'light-fighter', label: 'Combattant léger', family: 'martial', isMystic: false, order: 2 },
  { id: 'shooter', label: 'Tireur', family: 'martial', isMystic: false, order: 3 },
  { id: 'stealth', label: 'Furtif', family: 'martial', isMystic: false, order: 4 },
  { id: 'mage', label: 'Mage', family: 'mystic', isMystic: true, order: 5 },
  { id: 'demonist', label: 'Démoniste', family: 'mystic', isMystic: true, order: 6 },
  { id: 'priest', label: 'Prêtre', family: 'mystic', isMystic: true, order: 7 },
  { id: 'paladin', label: 'Paladin', family: 'mystic', isMystic: true, order: 8 },
  { id: 'druid', label: 'Druide', family: 'mystic', isMystic: true, order: 9 },
  { id: 'shaman', label: 'Chaman', family: 'mystic', isMystic: true, order: 10 },
  { id: 'monk', label: 'Moine', family: 'mystic', isMystic: true, order: 11 },
];

await seedCollection('classes', classes);