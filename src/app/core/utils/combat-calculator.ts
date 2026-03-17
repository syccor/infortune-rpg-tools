export type HealCapState = 'none' | 'cap50' | 'cap25';
export type CombatResolution = 'dodge' | 'block' | 'hit' | 'heal';

export type CombatActionType = 'damage' | 'piercing-damage' | 'heal' | 'divine-heal';

export interface CombatState {
  maxHp: number;
  currentHp: number;
  armor: number;
  dodge: number;
  healCapState: HealCapState;
}

export interface CombatActionInput {
  type: CombatActionType;
  rawValue: number;
}

export interface CombatActionResult {
  hpBefore: number;
  hpAfter: number;
  finalValue: number;
  resolution: CombatResolution;
  armorReduction: number;
  healCapApplied: boolean;
  newHealCapState: HealCapState;
}

export function applyCombatAction(
  state: CombatState,
  action: CombatActionInput,
): CombatActionResult {
  const hpBefore = state.currentHp;
  let hpAfter = state.currentHp;
  let finalValue = 0;
  let armorReduction = 0;
  let healCapApplied = false;
  let newHealCapState = state.healCapState;
  let resolution: CombatResolution = 'hit';

  if (action.type === 'damage' || action.type === 'piercing-damage') {
    if (action.rawValue <= state.dodge) {
      resolution = 'dodge';
      finalValue = 0;
    } else if (action.type === 'damage' && action.rawValue <= state.armor) {
      resolution = 'block';
      finalValue = 0;
      armorReduction = action.rawValue;
    } else {
      resolution = 'hit';

      if (action.type === 'damage') {
        armorReduction = state.armor;
        finalValue = Math.max(0, action.rawValue - state.armor);
      } else {
        armorReduction = 0;
        finalValue = Math.max(0, action.rawValue);
      }

      hpAfter = Math.max(0, state.currentHp - finalValue);
    }

    const ratio = hpAfter / state.maxHp;

    if (ratio < 0.1) {
      newHealCapState = 'cap25';
    } else if (ratio < 0.25 && newHealCapState !== 'cap25') {
      newHealCapState = 'cap50';
    }
  }

  if (action.type === 'heal' || action.type === 'divine-heal') {
    resolution = 'heal';

    const requestedHeal = Math.max(0, action.rawValue);
    let cap = state.maxHp;

    if (action.type !== 'divine-heal') {
      if (state.healCapState === 'cap50') {
        cap = Math.floor(state.maxHp * 0.5);
        healCapApplied = true;
      }

      if (state.healCapState === 'cap25') {
        cap = Math.floor(state.maxHp * 0.25);
        healCapApplied = true;
      }
    }

    hpAfter = Math.min(cap, state.currentHp + requestedHeal);
    finalValue = hpAfter - state.currentHp;

    const ratioAfterHeal = hpAfter / state.maxHp;

    if (action.type === 'divine-heal') {
      newHealCapState = 'none';
      healCapApplied = false;
    } else {
      if (state.healCapState === 'cap25' && ratioAfterHeal > 0.25) {
        newHealCapState = 'none';
        healCapApplied = false;
      }

      if (state.healCapState === 'cap50' && ratioAfterHeal > 0.5) {
        newHealCapState = 'none';
        healCapApplied = false;
      }
    }
  }

  return {
    hpBefore,
    hpAfter,
    finalValue,
    resolution,
    armorReduction,
    healCapApplied,
    newHealCapState,
  };
}
