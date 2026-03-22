export type TournamentCombatMode = 'armed' | 'unarmed';

export type TournamentFighterProfile =
  | 'poor'
  | 'mediocre'
  | 'correct'
  | 'good'
  | 'excellent';

export type TournamentTechniqueCategory =
  | 'aggressive'
  | 'offensive'
  | 'balanced'
  | 'prudent'
  | 'defensive';

export type TournamentRaceKey =
  | 'human'
  | 'elf'
  | 'kaldorei'
  | 'dwarf'
  | 'gnome'
  | 'draenei'
  | 'pandaren'
  | 'worgen';

export type TournamentFatigueProfile =
  | 'mediocre'
  | 'normal'
  | 'trained'
  | 'athlete';

export type TournamentWeaponStyle =
  | 'none'
  | 'dagger'
  | 'one-hand'
  | 'two-handed'
  | 'dual-one-hand'
  | 'one-hand-dagger'
  | 'dual-daggers'
  | 'small-shield'
  | 'large-shield';

export type TournamentFighterTechnique =
  | 'heroic-strike'
  | 'execution'
  | 'shield-break'
  | 'crash'
  | 'intimidation'
  | 'berserker'
  | 'parry'
  | 'shield-block'
  | 'roll'
  | 'feint'
  | 'sand'
  | 'brutal-blow'
  | 'no-mercy'
  | 'charge'
  | 'maim'
  | 'second-wind';

export interface TournamentCombatProfile {
  skillTier: TournamentFighterProfile;
  fighterStyle: TournamentTechniqueCategory;
  fatigueTier: TournamentFatigueProfile;
  techniques: TournamentFighterTechnique[];
}

export interface TournamentArmedProfile extends TournamentCombatProfile {
  weaponStyle: TournamentWeaponStyle;
}

export interface TournamentUnarmedProfile extends TournamentCombatProfile {
  enabled: boolean;
}

export interface TournamentProfile {
  characterId: string;
  characterName?: string;
  armed: TournamentArmedProfile;
  unarmed: TournamentUnarmedProfile;
  ownerUid?: string;
  ownerEmail?: string | null;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface TournamentCharacter {
  id: string;
  name: string;
  raceLabel: string;
  ownerUid?: string;
}

export interface TournamentSimulationRequest {
  left: TournamentCharacter;
  right: TournamentCharacter;
  leftProfile: TournamentProfile;
  rightProfile: TournamentProfile;
  mode: TournamentCombatMode;
}

export interface TournamentRoundLog {
  round: number;
  attacker: 'left' | 'right';
  leftAttackTotal: number;
  rightDefenseTotal: number;
  leftRoll: number;
  rightRoll: number;
  leftTechnique?: string | null;
  rightTechnique?: string | null;
  winner: 'left' | 'right';
  reason: string;
  score: string;
}

export interface TournamentSimulationResult {
  winner: 'left' | 'right';
  leftTouches: number;
  rightTouches: number;
  rounds: TournamentRoundLog[];
}

export interface TournamentPredictionResult {
  totalSimulations: number;
  leftWins: number;
  rightWins: number;
  leftWinRate: number;
  rightWinRate: number;
}

export interface TournamentSimulationFighterConfig {
  name: string;
  race: TournamentRaceKey;
  combatMode: TournamentCombatMode;
  weaponStyle: TournamentWeaponStyle;
  fighterProfile: TournamentFighterProfile;
  combatStyle: TournamentTechniqueCategory;
  fatigueProfile: TournamentFatigueProfile;
  techniques: TournamentFighterTechnique[];
}

export interface TournamentSimulationConfig {
  fighterA: TournamentSimulationFighterConfig;
  fighterB: TournamentSimulationFighterConfig;
}

export interface TournamentSimulationRound {
  roundNumber: number;
  attacker: string;
  defender: string;
  attackerTechniques: TournamentFighterTechnique[];
  defenderTechniques: TournamentFighterTechnique[];
  attackRoll: number;
  defenseRoll: number;
  attackTarget: number;
  defenseTarget: number;
  attackTotal: number;
  defenseTotal: number;
  attackCritical: boolean;
  defenseCritical: boolean;
  winner: string;
  scoreAfterRound: Record<string, number>;
}

export const TOURNAMENT_SKILL_TIERS: Array<{
  id: TournamentFighterProfile;
  label: string;
  attackBonus: number;
  defenseBonus: number;
  techniqueSlots: number;
}> = [
  { id: 'poor', label: 'Mauvais combattant', attackBonus: -20, defenseBonus: -20, techniqueSlots: 0 },
  { id: 'mediocre', label: 'Combattant médiocre', attackBonus: -10, defenseBonus: -10, techniqueSlots: 1 },
  { id: 'correct', label: 'Combattant correct', attackBonus: 0, defenseBonus: 0, techniqueSlots: 1 },
  { id: 'good', label: 'Bon combattant', attackBonus: 10, defenseBonus: 10, techniqueSlots: 2 },
  { id: 'excellent', label: 'Excellent combattant', attackBonus: 20, defenseBonus: 20, techniqueSlots: 2 },
];

export const TOURNAMENT_FIGHTER_STYLES: Array<{
  id: TournamentTechniqueCategory;
  label: string;
  attackBonus: number;
  defenseBonus: number;
}> = [
  { id: 'aggressive', label: 'Combattant agressif', attackBonus: 10, defenseBonus: -10 },
  { id: 'offensive', label: 'Combattant offensif', attackBonus: 5, defenseBonus: -5 },
  { id: 'balanced', label: 'Combattant équilibré', attackBonus: 0, defenseBonus: 0 },
  { id: 'prudent', label: 'Combattant prudent', attackBonus: -5, defenseBonus: 10 },
  { id: 'defensive', label: 'Combattant défensif', attackBonus: -10, defenseBonus: 15 },
];

export const TOURNAMENT_FATIGUE_TIERS: Array<{
  id: TournamentFatigueProfile;
  label: string;
  fatiguePerRound: number;
}> = [
  { id: 'mediocre', label: 'Médiocre', fatiguePerRound: 9 },
  { id: 'normal', label: 'Normal', fatiguePerRound: 8 },
  { id: 'trained', label: 'Entraîné', fatiguePerRound: 7 },
  { id: 'athlete', label: 'Athlète', fatiguePerRound: 6 },
];

export const TOURNAMENT_WEAPON_STYLES: Array<{
  id: TournamentWeaponStyle;
  label: string;
  attackBonus: number;
  defenseBonus: number;
  fatigueModifier: number;
  shieldBonus: number;
}> = [
  { id: 'none', label: 'Sans arme', attackBonus: 0, defenseBonus: 0, fatigueModifier: 0, shieldBonus: 0 },
  { id: 'dagger', label: 'Dague', attackBonus: 0, defenseBonus: -5, fatigueModifier: -2, shieldBonus: 0 },
  { id: 'one-hand', label: 'Arme à une main', attackBonus: 0, defenseBonus: 0, fatigueModifier: 0, shieldBonus: 0 },
  { id: 'two-handed', label: 'Arme à deux mains', attackBonus: 20, defenseBonus: -15, fatigueModifier: 3, shieldBonus: 0 },
  { id: 'dual-one-hand', label: 'Deux armes à une main', attackBonus: 15, defenseBonus: -10, fatigueModifier: 2, shieldBonus: 0 },
  { id: 'one-hand-dagger', label: 'Arme à une main + dague', attackBonus: 10, defenseBonus: -5, fatigueModifier: 0, shieldBonus: 0 },
  { id: 'dual-daggers', label: 'Deux dagues', attackBonus: 5, defenseBonus: -10, fatigueModifier: -1, shieldBonus: 0 },
  { id: 'small-shield', label: 'Petit bouclier', attackBonus: -5, defenseBonus: 15, fatigueModifier: 1, shieldBonus: 15 },
  { id: 'large-shield', label: 'Grand bouclier', attackBonus: -10, defenseBonus: 30, fatigueModifier: 2, shieldBonus: 30 },
];

export const TOURNAMENT_TECHNIQUES: Array<{
  id: TournamentFighterTechnique;
  label: string;
  description: string;
  mode: TournamentCombatMode | 'both';
  family: 'offensive' | 'defensive';
}> = [
  {
    id: 'heroic-strike',
    label: 'Frappe héroïque',
    description: 'Augmente le prochain jet d’attaque de 25.',
    mode: 'armed',
    family: 'offensive',
  },
  {
    id: 'execution',
    label: 'Exécution',
    description:
      'Augmente le prochain jet d’attaque de 50 mais diminue de 30 votre prochain jet de défense.',
    mode: 'armed',
    family: 'offensive',
  },
  {
    id: 'shield-break',
    label: 'Brise-bouclier',
    description:
      'Attaque et réduit la défense de l’adversaire de 30 pour ce tour de défense. Cumulable avec d’autres techniques.',
    mode: 'armed',
    family: 'offensive',
  },
  {
    id: 'crash',
    label: 'Fracas',
    description:
      'Si la prochaine manche est victorieuse, réduit la défense de l’adversaire de 15 pour le reste du combat.',
    mode: 'armed',
    family: 'offensive',
  },
  {
    id: 'intimidation',
    label: 'Intimidation',
    description:
      'Si la prochaine manche est victorieuse, réduit l’attaque de l’adversaire de 20 pour le reste du combat.',
    mode: 'both',
    family: 'offensive',
  },
  {
    id: 'berserker',
    label: 'Berserker',
    description:
      'Augmente le jet d’attaque de 10 à chaque manche perdue. Impossible avec un bouclier.',
    mode: 'armed',
    family: 'offensive',
  },
  {
    id: 'parry',
    label: 'Parade',
    description:
      'Augmente le prochain jet de défense de 30 en combat armé, ou de 25 sans armes.',
    mode: 'both',
    family: 'defensive',
  },
  {
    id: 'shield-block',
    label: 'Blocage au bouclier',
    description:
      'Augmente le jet de défense de 50 mais diminue le prochain jet d’attaque de 30. Nécessite un bouclier.',
    mode: 'armed',
    family: 'defensive',
  },
  {
    id: 'roll',
    label: 'Roulade',
    description:
      'Esquive entièrement une attaque ennemie, sauf critique, mais réduit de 70 votre prochain jet d’attaque.',
    mode: 'both',
    family: 'defensive',
  },
  {
    id: 'feint',
    label: 'Feinte',
    description:
      'Réduit le prochain jet d’attaque de l’adversaire de 25. Peut être utilisée en même temps qu’une attaque.',
    mode: 'both',
    family: 'defensive',
  },
  {
    id: 'sand',
    label: 'Sable dans les yeux',
    description:
      'Réduit le prochain jet de défense de l’adversaire de 10 et son prochain jet d’attaque de 15.',
    mode: 'both',
    family: 'defensive',
  },
  {
    id: 'brutal-blow',
    label: 'Coup brutal',
    description: 'Augmente le prochain jet d’attaque de 25.',
    mode: 'unarmed',
    family: 'offensive',
  },
  {
    id: 'no-mercy',
    label: 'Sans pitié',
    description:
      'Augmente le prochain jet d’attaque de 50 mais diminue de 30 votre prochain jet de défense.',
    mode: 'unarmed',
    family: 'offensive',
  },
  {
    id: 'charge',
    label: 'Charge',
    description:
      'Gagne automatiquement l’initiative en combat sans armes si l’adversaire ne possède pas aussi Charge.',
    mode: 'unarmed',
    family: 'offensive',
  },
  {
    id: 'maim',
    label: 'Estropier',
    description:
      'Si la prochaine manche est victorieuse, réduit la défense de l’adversaire de 15 pour le reste du combat.',
    mode: 'unarmed',
    family: 'offensive',
  },
  {
    id: 'second-wind',
    label: 'Second-souffle',
    description:
      'Récupère 10 points de défense perdus par la fatigue. Peut être utilisée en même temps qu’une attaque.',
    mode: 'unarmed',
    family: 'defensive',
  },
];

export function getTechniqueSlots(skillTier: TournamentFighterProfile): number {
  return TOURNAMENT_SKILL_TIERS.find((item) => item.id === skillTier)?.techniqueSlots ?? 0;
}
