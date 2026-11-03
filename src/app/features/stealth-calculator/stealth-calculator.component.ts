import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

export type StealthKind = 'difficulty' | 'bonus';

export interface StealthOption {
  id: string;
  label: string;
  kind: StealthKind;
  value: number;
}

export interface StealthGroup {
  id: string;
  label: string;
  options: StealthOption[];
  /** Si vrai, une option est toujours sélectionnée (pas de choix « Aucun »). */
  required?: boolean;
}

export interface StealthOutcome {
  id: 'success' | 'minor' | 'suspicion' | 'spotted' | 'discovered';
  label: string;
  description: string;
}

export const BASE_THRESHOLD = 51;

const OUTCOMES: Record<StealthOutcome['id'], StealthOutcome> = {
  success: { id: 'success', label: 'Furtivité réussie', description: 'Le personnage reste discret.' },
  minor: {
    id: 'minor',
    label: 'Incident mineur',
    description: 'Bruit léger, ombre aperçue, objet déplacé.',
  },
  suspicion: {
    id: 'suspicion',
    label: 'Suspicion',
    description: 'Un garde s’immobilise, écoute ou commence à inspecter les environs.',
  },
  spotted: {
    id: 'spotted',
    label: 'Repérage',
    description: 'Un PNJ identifie une présence suspecte et cherche à la localiser.',
  },
  discovered: {
    id: 'discovered',
    label: 'Découverte',
    description: 'Le personnage est clairement repéré si la situation le permet.',
  },
};

/** Écart (seuil - jet total) → conséquence de l'échec. */
export function getStealthOutcome(gap: number): StealthOutcome {
  if (gap <= 0) return OUTCOMES.success;
  if (gap <= 5) return OUTCOMES.minor;
  if (gap <= 15) return OUTCOMES.suspicion;
  if (gap <= 25) return OUTCOMES.spotted;
  return OUTCOMES.discovered;
}

@Component({
  selector: 'app-stealth-calculator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stealth-calculator.component.html',
  styleUrl: './stealth-calculator.component.scss',
})
export class StealthCalculatorComponent {
  readonly baseThreshold = BASE_THRESHOLD;

  /** Vigilance : un seul état, toujours défini (remplace « PNJ aux aguets »). */
  readonly vigilance: StealthGroup = {
    id: 'vigilance',
    label: 'Vigilance du garde',
    required: true,
    options: [
      { id: 'insouciant', label: 'Insouciant', kind: 'difficulty', value: 0 },
      { id: 'de-garde', label: 'De garde', kind: 'difficulty', value: 10 },
      { id: 'suspicieux', label: 'Suspicieux', kind: 'difficulty', value: 20 },
      { id: 'aux-aguets', label: 'Aux aguets', kind: 'difficulty', value: 40 },
      { id: 'alerte', label: 'Alerte', kind: 'difficulty', value: 50 },
    ],
  };

  /** Lumière : source proche (case libre, difficulté) + ambiance (choix unique, bonus). Les deux se cumulent. */
  readonly torch: StealthOption = {
    id: 'torche',
    label: 'Source de lumière proche (torche, lanterne…)',
    kind: 'difficulty',
    value: 20,
  };

  readonly lightGroup: StealthGroup = {
    id: 'light',
    label: 'Lumière',
    options: [
      { id: 'penombre', label: 'Présence d’ombres ou de pénombre', kind: 'bonus', value: 20 },
      { id: 'obscurite', label: 'Obscurité presque totale', kind: 'bonus', value: 30 },
    ],
  };

  /** État du garde (distrait ou endormi) : se combine avec n'importe quelle vigilance. */
  readonly guardStateGroup: StealthGroup = {
    id: 'target',
    label: 'État du garde',
    options: [
      { id: 'distrait', label: 'PNJ distrait ou occupé', kind: 'bonus', value: 20 },
      { id: 'endormi', label: 'PNJ endormi', kind: 'bonus', value: 30 },
    ],
  };

  /** Autres groupes à choix unique (cocher une option décoche les autres du groupe). */
  readonly exclusiveGroups: StealthGroup[] = [
    {
      id: 'movement',
      label: 'Mouvement',
      options: [
        { id: 'immobile', label: 'Position immobile', kind: 'bonus', value: 20 },
        { id: 'lent', label: 'Déplacement lent et précautionneux', kind: 'bonus', value: 10 },
        { id: 'rapide', label: 'Déplacement rapide ou précipité', kind: 'difficulty', value: 20 },
      ],
    },
  ];

  readonly freeDifficulties: StealthOption[] = [
    { id: 'boss', label: 'PNJ majeur / Boss à proximité', kind: 'difficulty', value: 20 },
    { id: 'terrain', label: 'Terrain difficile (graviers, débris, végétation)', kind: 'difficulty', value: 10 },
    { id: 'encombrant', label: 'Équipement encombrant', kind: 'difficulty', value: 10 },
    { id: 'silence', label: 'Zone particulièrement silencieuse', kind: 'difficulty', value: 10 },
    { id: 'blesse', label: 'Personnage blessé (sous 50 % PV)', kind: 'difficulty', value: 10 },
    { id: 'surveillance', label: 'Surveillance renforcée (patrouilles, postes)', kind: 'difficulty', value: 20 },
  ];

  readonly freeBonuses: StealthOption[] = [
    { id: 'couverture', label: 'Couverture physique (muret, caisse, mobilier)', kind: 'bonus', value: 20 },
    { id: 'bruit', label: 'Bruit ambiant masquant les déplacements', kind: 'bonus', value: 10 },
    { id: 'diversion', label: 'Diversion réussie', kind: 'bonus', value: 20 },
  ];

  /** Option sélectionnée par groupe (null = aucune). */
  readonly selection = signal<Record<string, string | null>>({
    vigilance: 'insouciant',
    light: null,
    movement: null,
    target: null,
  });

  readonly checked = signal<ReadonlySet<string>>(new Set());
  /** Agilité de base du personnage : valeur maximale du rand (100 par défaut). */
  readonly agility = signal(100);
  readonly dieRoll = signal<number | null>(null);

  private readonly allOptions: StealthOption[] = [
    ...this.vigilance.options,
    ...this.lightGroup.options,
    ...this.guardStateGroup.options,
    ...this.exclusiveGroups.flatMap((group) => group.options),
    this.torch,
    ...this.freeDifficulties,
    ...this.freeBonuses,
  ];

  private readonly activeOptions = computed(() => {
    const selection = this.selection();
    const checked = this.checked();
    const active = new Set<string>(checked);
    for (const id of Object.values(selection)) {
      if (id) active.add(id);
    }
    return this.allOptions.filter((option) => active.has(option.id));
  });

  readonly difficulty = computed(() =>
    this.activeOptions()
      .filter((option) => option.kind === 'difficulty')
      .reduce((sum, option) => sum + option.value, 0),
  );

  readonly rollModifier = computed(() =>
    this.activeOptions()
      .filter((option) => option.kind === 'bonus')
      .reduce((sum, option) => sum + option.value, 0),
  );

  readonly threshold = computed(() => BASE_THRESHOLD + this.difficulty());

  /** Seuil équivalent sur le rand d'Agilité sans modificateur. */
  readonly simplifiedThreshold = computed(() => this.threshold() - this.rollModifier());

  readonly rollRange = computed(() => ({
    min: 1 + this.rollModifier(),
    max: this.agility() + this.rollModifier(),
  }));

  readonly feasibility = computed<'impossible' | 'automatic' | 'normal'>(() => {
    if (this.threshold() > this.rollRange().max) return 'impossible';
    if (this.threshold() <= this.rollRange().min) return 'automatic';
    return 'normal';
  });

  readonly totalRoll = computed(() => {
    const die = this.dieRoll();
    return die === null ? null : die + this.rollModifier();
  });

  readonly outcome = computed<StealthOutcome | null>(() => {
    const total = this.totalRoll();
    return total === null ? null : getStealthOutcome(this.threshold() - total);
  });

  readonly gap = computed(() => {
    const total = this.totalRoll();
    return total === null ? null : Math.max(0, this.threshold() - total);
  });

  isSelected(group: StealthGroup, optionId: string): boolean {
    return this.selection()[group.id] === optionId;
  }

  select(group: StealthGroup, optionId: string | null): void {
    this.selection.update((current) => ({ ...current, [group.id]: optionId }));
  }

  isChecked(optionId: string): boolean {
    return this.checked().has(optionId);
  }

  toggle(optionId: string): void {
    this.checked.update((current) => {
      const next = new Set(current);
      if (!next.delete(optionId)) next.add(optionId);
      return next;
    });
  }

  setAgility(value: string): void {
    const parsed = Number(value);
    if (value.trim() === '' || Number.isNaN(parsed)) return;
    const agility = Math.max(1, Math.round(parsed));
    this.agility.set(agility);
    const die = this.dieRoll();
    if (die !== null && die > agility) this.dieRoll.set(agility);
  }

  setDieRoll(value: string): void {
    if (value.trim() === '') {
      this.dieRoll.set(null);
      return;
    }
    const parsed = Number(value);
    this.dieRoll.set(Number.isNaN(parsed) ? null : Math.min(this.agility(), Math.max(1, Math.round(parsed))));
  }

  reset(): void {
    this.selection.set({ vigilance: 'insouciant', light: null, movement: null, target: null });
    this.checked.set(new Set());
    this.agility.set(100);
    this.dieRoll.set(null);
  }

  formatSigned(value: number): string {
    return value >= 0 ? `+${value}` : `${value}`;
  }
}
