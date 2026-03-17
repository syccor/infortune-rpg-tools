import { seedCollection } from '../seedUtils.js';

const classProfiles = [
  // PASSIFS CLASSIQUES

  {
    id: 'escrimeur',
    classId: 'light-fighter',
    label: 'Escrimeur',
    description:
      "Augmente le max d'esquive de 5 et le jet d'attaque de 5. Une esquive réussie augmente le prochain jet d’attaque de 5.",
    order: 1,
  },

  {
    id: 'preparation',
    classId: 'shooter',
    label: 'Préparation',
    description:
      "Les échecs simples en attaque des tirs (2 à 9) n'infligent pas de dégâts au tireur. Augmente le jet d’attaque de 10 si le tireur ne s’est pas déplacé à ce tour.",
    order: 2,
  },

  {
    id: 'vivacite',
    classId: 'light-fighter',
    label: 'Vivacité',
    description:
      'Permet de se déplacer avant ou après avoir attaqué. Ne subit jamais de jets de repli.',
    order: 3,
  },

  {
    id: 'vivacite-shooter',
    classId: 'shooter',
    label: 'Vivacité',
    description:
      'Permet de se déplacer avant ou après avoir attaqué. Ne subit jamais de jets de repli.',
    order: 4,
  },

  {
    id: 'medecine',
    classId: 'all',
    label: 'Médecine',
    description: 'Donne accès aux profils de médecin de bataille.',
    order: 5,
  },

  {
    id: 'detonation',
    classId: 'all',
    label: 'Détonation',
    description:
      'Augmente le transport de consommables de 1 et l’armure contre les dégâts de zone de 25 au-delà de la limite de 25.',
    order: 6,
  },

  {
    id: 'resilience',
    classId: 'heavy-fighter',
    label: 'Résilience',
    description:
      'Augmente de 5 le jet de blocage au petit bouclier et de 10 au grand bouclier. Un blocage parfait augmente le prochain jet de blocage de 10.',
    order: 7,
  },

  {
    id: 'brutalite',
    classId: 'heavy-fighter',
    label: 'Brutalité',
    description:
      'Augmente le jet d’attaque au corps à corps de 5. Passe à 15 contre plus de deux ennemis avec arme lourde ou double arme.',
    order: 8,
  },

  {
    id: 'combativite',
    classId: 'heavy-fighter',
    label: 'Combativité',
    description:
      'Au corps à corps : choisir +5 attaque ou +5 blocage. Gagne 4 PV si action au tour précédent.',
    order: 9,
  },

  // FURTIF

  {
    id: 'stealth-assassin',
    classId: 'stealth',
    label: 'Assassin',
    description: "Augmente le jet d'attaque de 20 dans le dos et de 10 depuis les ombres.",
    order: 1,
  },

  {
    id: 'stealth-poisoner',
    classId: 'stealth',
    label: 'Empoisonneur',
    description: 'Les coups infligent 1R20-50 sans armure au tour suivant.',
    order: 2,
  },

  {
    id: 'stealth-spy',
    classId: 'stealth',
    label: 'Espion',
    description: 'Permet de relancer perception et furtivité ratées une fois chacune.',
    order: 3,
  },

  // DEMONISTE

  {
    id: 'demonist-destruction',
    classId: 'demonist',
    label: 'Destruction',
    description: "Augmente les bonus de dégâts des fragments d'âme de 10.",
    order: 1,
  },

  {
    id: 'demonist-demonology',
    classId: 'demonist',
    label: 'Démonologie',
    description:
      "Diminue le coût d'invocation des démons de 1 fragment et augmente leurs PV de 10.",
    order: 2,
  },

  {
    id: 'demonist-affliction',
    classId: 'demonist',
    label: 'Affliction',
    description: "Augmente le jet de 10 et la limite basse des sorts d'affliction de 15.",
    order: 3,
  },

  // PRÊTRE

  {
    id: 'priest-faith',
    classId: 'priest',
    label: 'Foi inviolable',
    description: 'Prêtre sacré classique.',
    order: 1,
  },

  {
    id: 'priest-balance',
    classId: 'priest',
    label: 'Équilibre périlleux',
    description: 'Les points de puissance sacrée deviennent des points de foi.',
    order: 2,
  },

  {
    id: 'priest-abyss',
    classId: 'priest',
    label: 'Tombé dans l’abîme',
    description: 'Ne peut plus utiliser la magie lumineuse, améliore les sorts du Vide.',
    order: 3,
  },

  // PALADIN

  {
    id: 'paladin-healer',
    classId: 'paladin',
    label: 'Guérisseur dévot',
    description: 'Coûts de sorts inchangés.',
    order: 1,
  },

  {
    id: 'paladin-warrior',
    classId: 'paladin',
    label: 'Guerrier sacré',
    description: 'Coûts modifiés pour Juger, Consacrer et soins.',
    order: 2,
  },

  {
    id: 'paladin-zealot',
    classId: 'paladin',
    label: 'Zélote',
    description: 'La Lumière peut toucher tout le monde mais inflige moins de dégâts.',
    order: 3,
  },

  // DRUIDE

  {
    id: 'druid-restoration',
    classId: 'druid',
    label: 'Restauration',
    description: 'Améliore les sorts de soin.',
    order: 1,
  },

  {
    id: 'druid-balance',
    classId: 'druid',
    label: 'Équilibre',
    description: 'Améliore les sorts offensifs.',
    order: 2,
  },

  {
    id: 'druid-shapeshift',
    classId: 'druid',
    label: 'Changeforme',
    description: 'Permet une forme animale définitive.',
    order: 3,
  },

  // MOINE

  {
    id: 'monk-windwalker',
    classId: 'monk',
    label: 'Marche-vent',
    description: '+10 attaque et esquive, esquive max 60.',
    order: 1,
  },

  {
    id: 'monk-brewmaster',
    classId: 'monk',
    label: 'Maître brasseur',
    description: '+20 PV et +10 esquive, esquive max 65.',
    order: 2,
  },

  {
    id: 'monk-mistweaver',
    classId: 'monk',
    label: 'Tisse-brume',
    description: '+10 esquive, +2 chi, modifications des coûts de techniques.',
    order: 3,
  },
];

await seedCollection('classProfiles', classProfiles);
