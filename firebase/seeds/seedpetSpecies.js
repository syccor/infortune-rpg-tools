import { seedCollection } from '../seedUtils.js';

const petSpecies = [
  { id: 'bear', label: 'Ours', baseHp: 220, baseArmor: 5, baseAttack: 100, baseDodge: 5, allowedClassIds: ['protector', 'hunter'] },
  { id: 'gorilla', label: 'Gorille', baseHp: 200, baseArmor: 3, baseAttack: 105, baseDodge: 5, allowedClassIds: ['protector', 'hunter', 'killer'] },
  { id: 'boar', label: 'Sanglier', baseHp: 190, baseArmor: 6, baseAttack: 100, baseDodge: 5, allowedClassIds: ['protector', 'hunter'] },
  { id: 'worg', label: 'Worg', baseHp: 190, baseArmor: 5, baseAttack: 100, baseDodge: 5, allowedClassIds: ['protector', 'hunter'] },
  { id: 'wolf', label: 'Loup', baseHp: 180, baseArmor: 4, baseAttack: 100, baseDodge: 10, allowedClassIds: ['protector', 'hunter', 'killer'] },
  { id: 'feline', label: 'Félin', baseHp: 160, baseArmor: 4, baseAttack: 105, baseDodge: 15, allowedClassIds: ['hunter', 'killer'] },
  { id: 'whelp', label: 'Wyrmelin', baseHp: 160, baseArmor: 3, baseAttack: 105, baseDodge: 20, allowedClassIds: ['hunter', 'killer'] },
  { id: 'dog', label: 'Chien', baseHp: 150, baseArmor: 3, baseAttack: 100, baseDodge: 10, allowedClassIds: ['protector', 'hunter', 'killer'] },
  { id: 'fox', label: 'Renard', baseHp: 130, baseArmor: 2, baseAttack: 105, baseDodge: 15, allowedClassIds: ['hunter', 'killer'] },
  { id: 'raptor', label: 'Rapace', baseHp: 110, baseArmor: 1, baseAttack: 110, baseDodge: 25, allowedClassIds: ['hunter', 'killer'] },
  { id: 'arcane-familiar', label: 'Familier arcanique', baseHp: 150, baseArmor: 5, baseAttack: 100, baseDodge: 0, allowedClassIds: ['protector', 'hunter', 'killer'] },
];

await seedCollection('petSpecies', petSpecies);