import {
  TournamentCombatMode,
  TournamentFatigueProfile,
  TournamentFighterProfile,
  TournamentFighterTechnique,
  TournamentPredictionResult,
  TournamentRaceKey,
  TournamentRoundLog,
  TournamentSimulationConfig,
  TournamentSimulationResult,
  TournamentTechniqueCategory,
  TournamentWeaponStyle,
} from '@models/tournament.model';

type Side = 'left' | 'right';

interface RuntimeFighter {
  side: Side;
  name: string;
  race: TournamentRaceKey;
  combatMode: TournamentCombatMode;
  weaponStyle: TournamentWeaponStyle;
  fighterProfile: TournamentFighterProfile;
  combatStyle: TournamentTechniqueCategory;
  fatigueProfile: TournamentFatigueProfile;
  techniques: TournamentFighterTechnique[];

  touches: number;

  attackBase: number;
  defenseBase: number;
  shieldBonus: number;
  fatiguePerRound: number;
  fatiguePenalty: number;

  permanentAttackMod: number;
  permanentDefenseMod: number;

  nextAttackMod: number;
  nextDefenseMod: number;
  nextAttackFloor50: boolean;
  nextDefenseFloor50: boolean;

  usedTechniques: Set<TournamentFighterTechnique>;
}

interface InternalRound {
  roundNumber: number;
  attacker: Side;
  attackerName: string;
  defenderName: string;
  attackerTechnique: TournamentFighterTechnique | null;
  defenderTechnique: TournamentFighterTechnique | null;

  attackThreshold: number;
  defenseThreshold: number;

  attackRoll: number;
  defenseRoll: number;

  attackResult: number;
  defenseResult: number;

  attackCritical: boolean;
  defenseCritical: boolean;

  winner: Side;
  reason: string;
  leftTouches: number;
  rightTouches: number;
}

function rand100(): number {
  return Math.floor(Math.random() * 100) + 1;
}

function clampThreshold(value: number): number {
  return Math.max(1, value);
}

function randOnThreshold(threshold: number): number {
  const capped = clampThreshold(threshold);
  return Math.floor(Math.random() * capped) + 1;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function isUnarmed(mode: TournamentCombatMode): boolean {
  return mode === 'unarmed';
}

function hasShield(style: TournamentWeaponStyle): boolean {
  return style === 'small-shield' || style === 'large-shield';
}

function isTwoHanded(style: TournamentWeaponStyle): boolean {
  return style === 'two-handed';
}

function getSkillModifiers(profile: TournamentFighterProfile): {
  attack: number;
  defense: number;
  techniqueSlots: number;
} {
  switch (profile) {
    case 'poor':
      return { attack: -20, defense: -20, techniqueSlots: 0 };
    case 'mediocre':
      return { attack: -10, defense: -10, techniqueSlots: 1 };
    case 'correct':
      return { attack: 0, defense: 0, techniqueSlots: 1 };
    case 'good':
      return { attack: 10, defense: 10, techniqueSlots: 2 };
    case 'excellent':
      return { attack: 20, defense: 20, techniqueSlots: 2 };
  }
}

function getRaceModifiers(race: TournamentRaceKey): {
  attack: number;
  defense: number;
  fatigueReduction: number;
} {
  switch (race) {
    case 'human':
      return { attack: 0, defense: 0, fatigueReduction: 0 };
    case 'elf':
      return { attack: 5, defense: 0, fatigueReduction: 0 };
    case 'kaldorei':
      return { attack: 5, defense: 5, fatigueReduction: 0 };
    case 'dwarf':
      return { attack: -5, defense: 10, fatigueReduction: 0 };
    case 'gnome':
      return { attack: -10, defense: 5, fatigueReduction: 0 };
    case 'draenei':
    case 'pandaren':
      return { attack: 0, defense: 10, fatigueReduction: 0 };
    case 'worgen':
      return { attack: 5, defense: 0, fatigueReduction: 1 };
  }
}

function getWeaponModifiers(style: TournamentWeaponStyle): {
  attack: number;
  defense: number;
  fatigueModifier: number;
  shieldBonus: number;
} {
  switch (style) {
    case 'none':
      return { attack: 0, defense: 0, fatigueModifier: 0, shieldBonus: 0 };
    case 'dagger':
      return { attack: 0, defense: -5, fatigueModifier: -2, shieldBonus: 0 };
    case 'one-hand':
      return { attack: 0, defense: 0, fatigueModifier: 0, shieldBonus: 0 };
    case 'two-handed':
      return { attack: 20, defense: -15, fatigueModifier: 3, shieldBonus: 0 };
    case 'dual-one-hand':
      return { attack: 15, defense: -10, fatigueModifier: 2, shieldBonus: 0 };
    case 'one-hand-dagger':
      return { attack: 10, defense: -5, fatigueModifier: 0, shieldBonus: 0 };
    case 'dual-daggers':
      return { attack: 5, defense: -10, fatigueModifier: -1, shieldBonus: 0 };
    case 'small-shield':
      return { attack: -5, defense: 15, fatigueModifier: 1, shieldBonus: 15 };
    case 'large-shield':
      return { attack: -10, defense: 30, fatigueModifier: 2, shieldBonus: 30 };
  }
}

function getCombatStyleModifiers(style: TournamentTechniqueCategory): {
  attack: number;
  defense: number;
} {
  switch (style) {
    case 'aggressive':
      return { attack: 10, defense: -10 };
    case 'offensive':
      return { attack: 5, defense: -5 };
    case 'balanced':
      return { attack: 0, defense: 0 };
    case 'prudent':
      return { attack: -5, defense: 10 };
    case 'defensive':
      return { attack: -10, defense: 15 };
  }
}

function getFatiguePerRound(profile: TournamentFatigueProfile): number {
  switch (profile) {
    case 'mediocre':
      return 9;
    case 'normal':
      return 8;
    case 'trained':
      return 7;
    case 'athlete':
      return 6;
  }
}

function getAllowedTechniques(
  fighterProfile: TournamentFighterProfile,
  techniques: TournamentFighterTechnique[],
): TournamentFighterTechnique[] {
  const slots = getSkillModifiers(fighterProfile).techniqueSlots;
  return Array.from(new Set(techniques)).slice(0, slots);
}

function createRuntimeFighter(
  side: Side,
  config: TournamentSimulationConfig['fighterA'] | TournamentSimulationConfig['fighterB'],
): RuntimeFighter {
  const skill = getSkillModifiers(config.fighterProfile);
  const race = getRaceModifiers(config.race);
  const weapon = isUnarmed(config.combatMode)
    ? getWeaponModifiers('none')
    : getWeaponModifiers(config.weaponStyle);
  const style = getCombatStyleModifiers(config.combatStyle);

  const fatiguePerRound = Math.max(
    0,
    getFatiguePerRound(config.fatigueProfile) +
      weapon.fatigueModifier -
      race.fatigueReduction,
  );

  return {
    side,
    name: config.name,
    race: config.race,
    combatMode: config.combatMode,
    weaponStyle: config.weaponStyle,
    fighterProfile: config.fighterProfile,
    combatStyle: config.combatStyle,
    fatigueProfile: config.fatigueProfile,
    techniques: getAllowedTechniques(config.fighterProfile, config.techniques),

    touches: 0,

    attackBase: skill.attack + race.attack + weapon.attack + style.attack,
    defenseBase: skill.defense + race.defense + weapon.defense + style.defense,
    shieldBonus: weapon.shieldBonus,
    fatiguePerRound,
    fatiguePenalty: 0,

    permanentAttackMod: 0,
    permanentDefenseMod: 0,

    nextAttackMod: 0,
    nextDefenseMod: 0,
    nextAttackFloor50: false,
    nextDefenseFloor50: false,

    usedTechniques: new Set<TournamentFighterTechnique>(),
  };
}

function hasTechnique(
  fighter: RuntimeFighter,
  technique: TournamentFighterTechnique,
): boolean {
  return fighter.techniques.includes(technique) && !fighter.usedTechniques.has(technique);
}

function currentAttackThreshold(
  fighter: RuntimeFighter,
  opponent: RuntimeFighter,
): number {
  const berserkerBonus =
    fighter.techniques.includes('berserker') && !hasShield(fighter.weaponStyle)
      ? opponent.touches * 10
      : 0;

  const raw =
    100 +
    fighter.attackBase +
    fighter.permanentAttackMod +
    berserkerBonus +
    fighter.nextAttackMod;

  return fighter.nextAttackFloor50 ? Math.max(raw, 50) : raw;
}

function currentDefenseThreshold(fighter: RuntimeFighter): number {
  const raw =
    100 +
    fighter.defenseBase +
    fighter.permanentDefenseMod +
    fighter.nextDefenseMod -
    fighter.fatiguePenalty;

  return Math.max(raw, 50 + fighter.shieldBonus);
}

function isCritical(roll: number, threshold: number): boolean {
  return roll === threshold;
}

function chooseAttackerTechnique(
  attacker: RuntimeFighter,
  defender: RuntimeFighter,
  targetScore: number,
): TournamentFighterTechnique | null {
  const remainingToWin = targetScore - attacker.touches;
  const earlyFight = isEarlyFight(attacker, defender);

  if (isUnarmed(attacker.combatMode)) {
    if (hasTechnique(attacker, 'no-mercy') && remainingToWin === 1) {
      return 'no-mercy';
    }

    if (hasTechnique(attacker, 'intimidation') && earlyFight) {
      return 'intimidation';
    }

    if (hasTechnique(attacker, 'maim') && earlyFight) {
      return 'maim';
    }

    if (hasTechnique(attacker, 'brutal-blow')) {
      return 'brutal-blow';
    }

    return null;
  }

  if (hasTechnique(attacker, 'execution') && remainingToWin === 1) {
    return 'execution';
  }

  if (hasTechnique(attacker, 'intimidation') && earlyFight) {
    return 'intimidation';
  }

  if (hasTechnique(attacker, 'crash') && earlyFight) {
    return 'crash';
  }

  if (hasTechnique(attacker, 'shield-break')) {
    return 'shield-break';
  }

  if (hasTechnique(attacker, 'heroic-strike')) {
    return 'heroic-strike';
  }

  return null;
}

function chooseDefenderTechnique(
  defender: RuntimeFighter,
  attacker: RuntimeFighter,
  attackerTechnique: TournamentFighterTechnique | null,
): TournamentFighterTechnique | null {
  const attackThreshold = currentAttackThreshold(attacker, defender);
  const defenseThreshold = currentDefenseThreshold(defender);
  const gap = attackThreshold - defenseThreshold;
  const currentRound = getCurrentRoundNumber(attacker, defender);
  const dangerousAttack = isDangerousAttackTechnique(attackerTechnique);
  const lethalPoint = attacker.touches >= 2;

  if (
     hasTechnique(defender, 'roll') &&
    !hasShield(defender.weaponStyle) &&
    !isTwoHanded(defender.weaponStyle) &&
    (
      dangerousAttack ||
      (lethalPoint && gap >= 30) ||
      (currentRound >= 3 && gap >= 20)
    )
  ) {
    return 'roll';
  }

  if (
    hasTechnique(defender, 'shield-block') &&
    hasShield(defender.weaponStyle) &&
    (dangerousAttack || attacker.touches >= 2)
  ) {
    return 'shield-block';
  }

  if (
    hasTechnique(defender, 'parry') &&
    (dangerousAttack || gap >= 0)
  ) {
    return 'parry';
  }

  if (
    isUnarmed(defender.combatMode) &&
    hasTechnique(defender, 'second-wind') &&
    currentRound >= 3 &&
    defender.fatiguePenalty >= 10
  ) {
    return 'second-wind';
  }

  if (hasTechnique(defender, 'feint') && dangerousAttack) {
    return 'feint';
  }

  if (hasTechnique(defender, 'sand') && currentRound <= 2) {
    return 'sand';
  }

  if (hasTechnique(defender, 'feint')) {
    return 'feint';
  }

  if (hasTechnique(defender, 'sand')) {
    return 'sand';
  }

  return null;
}

function applyTechniqueBeforeRoll(
  fighter: RuntimeFighter,
  opponent: RuntimeFighter,
  technique: TournamentFighterTechnique | null,
  actingAs: 'attacker' | 'defender',
): void {
  if (!technique) return;

  fighter.usedTechniques.add(technique);

  switch (technique) {
    case 'heroic-strike':
    case 'brutal-blow':
      fighter.nextAttackMod += 25;
      break;

    case 'execution':
    case 'no-mercy':
      fighter.nextAttackMod += 50;
      fighter.nextDefenseMod -= 30;
      fighter.nextDefenseFloor50 = true;
      break;

    case 'shield-break':
      opponent.nextDefenseMod -= 30;
      break;

    case 'parry':
      fighter.nextDefenseMod += isUnarmed(fighter.combatMode) ? 25 : 30;
      break;

    case 'shield-block':
      fighter.nextDefenseMod += 50;
      fighter.nextAttackMod -= 30;
      fighter.nextAttackFloor50 = true;
      break;

    case 'feint':
      opponent.nextAttackMod -= 25;
      break;

    case 'sand':
      opponent.nextAttackMod -= 15;
      opponent.nextDefenseMod -= 10;
      break;

    case 'second-wind':
      fighter.fatiguePenalty = Math.max(0, fighter.fatiguePenalty - 10);
      break;

    case 'intimidation':
    case 'crash':
    case 'maim':
    case 'roll':
    case 'charge':
      break;

    default:
      break;
  }

  if (actingAs === 'defender' && technique === 'roll') {
    // effet géré dans la résolution de manche
  }
}

function clearConsumedAttackState(fighter: RuntimeFighter): void {
  fighter.nextAttackMod = 0;
  fighter.nextAttackFloor50 = false;
}

function clearConsumedDefenseState(fighter: RuntimeFighter): void {
  fighter.nextDefenseMod = 0;
  fighter.nextDefenseFloor50 = false;
}

function resolveInitiative(
  left: RuntimeFighter,
  right: RuntimeFighter,
): Side {
  const leftHasCharge = isUnarmed(left.combatMode) && hasTechnique(left, 'charge');
  const rightHasCharge = isUnarmed(right.combatMode) && hasTechnique(right, 'charge');

  if (leftHasCharge && !rightHasCharge) {
    left.usedTechniques.add('charge');
    return 'left';
  }

  if (rightHasCharge && !leftHasCharge) {
    right.usedTechniques.add('charge');
    return 'right';
  }

  const leftRoll = rand100();
  const rightRoll = rand100();

  return leftRoll >= rightRoll ? 'left' : 'right';
}

function runRound(
  roundNumber: number,
  attacker: RuntimeFighter,
  defender: RuntimeFighter,
  targetScore: number,
): InternalRound {
const attackerTechnique = chooseAttackerTechnique(attacker, defender, targetScore);
const defenderTechnique = chooseDefenderTechnique(
  defender,
  attacker,
  attackerTechnique,
);

applyTechniqueBeforeRoll(attacker, defender, attackerTechnique, 'attacker');
applyTechniqueBeforeRoll(defender, attacker, defenderTechnique, 'defender');

  const attackThreshold = currentAttackThreshold(attacker, defender);
  const defenseThreshold = currentDefenseThreshold(defender);

  const attackRoll = randOnThreshold(attackThreshold);
  const defenseRoll = randOnThreshold(defenseThreshold);

  const attackResult = attackRoll;
  const defenseResult = defenseRoll;

  const attackCritical = isCritical(attackRoll, attackThreshold);
  const defenseCritical = isCritical(defenseRoll, defenseThreshold);

  let winner: Side;
  let reason = '';

  if (defenderTechnique === 'roll' && !attackCritical) {
    winner = defender.side;
    reason = 'Roulade réussie';
  } else if (attackCritical && !defenseCritical) {
    winner = attacker.side;
    reason = 'Critique de l’attaquant';
  } else if (defenseCritical && !attackCritical) {
    winner = defender.side;
    reason = 'Critique du défenseur';
  } else if (attackResult > defenseResult) {
    winner = attacker.side;
    reason = 'Attaque supérieure';
  } else {
    winner = defender.side;
    reason = 'Défense supérieure';
  }

  if (winner === attacker.side) {
    attacker.touches += 1;

    if (attackerTechnique === 'crash' || attackerTechnique === 'maim') {
      defender.permanentDefenseMod -= 15;
    }

    if (attackerTechnique === 'intimidation') {
      defender.permanentAttackMod -= 20;
    }
  }

  clearConsumedAttackState(attacker);
  clearConsumedDefenseState(defender);

  defender.fatiguePenalty += defender.fatiguePerRound;

  return {
    roundNumber,
    attacker: attacker.side,
    attackerName: attacker.name,
    defenderName: defender.name,
    attackerTechnique,
    defenderTechnique,
    attackThreshold,
    defenseThreshold,
    attackRoll,
    defenseRoll,
    attackResult,
    defenseResult,
    attackCritical,
    defenseCritical,
    winner,
    reason,
    leftTouches: attacker.side === 'left' ? attacker.touches : defender.touches,
    rightTouches: attacker.side === 'right' ? attacker.touches : defender.touches,
  };
}

function toRoundLog(round: InternalRound): TournamentRoundLog {
  const manche = Math.ceil(round.roundNumber / 2);
  const isRiposte = round.roundNumber % 2 === 0;

  return {
    round: round.roundNumber,
    manche,
    isRiposte,
    attacker: round.attacker,

    leftThreshold:
      round.attacker === 'left' ? round.attackThreshold : round.defenseThreshold,
    rightThreshold:
      round.attacker === 'left' ? round.defenseThreshold : round.attackThreshold,

    leftRoll:
      round.attacker === 'left' ? round.attackRoll : round.defenseRoll,
    rightRoll:
      round.attacker === 'left' ? round.defenseRoll : round.attackRoll,

    leftResult:
      round.attacker === 'left' ? round.attackResult : round.defenseResult,
    rightResult:
      round.attacker === 'left' ? round.defenseResult : round.attackResult,

    leftTechnique:
      round.attacker === 'left' ? round.attackerTechnique : round.defenderTechnique,
    rightTechnique:
      round.attacker === 'left' ? round.defenderTechnique : round.attackerTechnique,

    winner: round.winner,
    reason: round.reason,
    score: `${round.leftTouches} - ${round.rightTouches}`,
  };
}


export function simulateTournamentFight(
  config: TournamentSimulationConfig,
): TournamentSimulationResult {
  const left = createRuntimeFighter('left', config.fighterA);
  const right = createRuntimeFighter('right', config.fighterB);

  const initiativeWinner = resolveInitiative(left, right);

  let currentAttacker = initiativeWinner === 'left' ? left : right;
  let currentDefender = initiativeWinner === 'left' ? right : left;

  const rounds: TournamentRoundLog[] = [];
  let roundNumber = 1;

  while (left.touches < config.targetScore && right.touches < config.targetScore) {
    const internalRound = runRound(roundNumber, currentAttacker, currentDefender, config.targetScore);
    rounds.push(toRoundLog(internalRound));

    [currentAttacker, currentDefender] = [currentDefender, currentAttacker];
    roundNumber += 1;
  }

  return {
    winner: left.touches >= config.targetScore ? 'left' : 'right',
    leftTouches: left.touches,
    rightTouches: right.touches,
    rounds,
  };
}

export function simulateTournamentPrediction(
  config: TournamentSimulationConfig,
  totalSimulations: number,
): TournamentPredictionResult {
  let leftWins = 0;
  let rightWins = 0;

  for (let i = 0; i < totalSimulations; i += 1) {
    const result = simulateTournamentFight(config);
    if (result.winner === 'left') {
      leftWins += 1;
    } else {
      rightWins += 1;
    }
  }

  return {
    totalSimulations,
    leftWins,
    rightWins,
    leftWinRate: Number(((leftWins / totalSimulations) * 100).toFixed(1)),
    rightWinRate: Number(((rightWins / totalSimulations) * 100).toFixed(1)),
  };
}

function getCurrentRoundNumber(attacker: RuntimeFighter, defender: RuntimeFighter): number {
  return attacker.touches + defender.touches + 1;
}

function isDangerousAttackTechnique(
  technique: TournamentFighterTechnique | null,
): boolean {
  return (
    technique === 'execution' ||
    technique === 'no-mercy' ||
    technique === 'heroic-strike' ||
    technique === 'brutal-blow' ||
    technique === 'shield-break'
  );
}

function isEarlyFight(attacker: RuntimeFighter, defender: RuntimeFighter): boolean {
  return getCurrentRoundNumber(attacker, defender) <= 2;
}
