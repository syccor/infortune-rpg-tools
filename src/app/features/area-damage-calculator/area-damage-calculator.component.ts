import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

interface AreaSize {
  label: string;
  maxGroups: number;
}

interface EnemyGroup {
  id: number;
  name: string;
  size: number;
}

interface GroupDamageResult {
  id: number;
  name: string;
  size: number;
  isAffectedByZoneLimit: boolean;
  touchedTargets: number;
  damage: number;
}

@Component({
  selector: 'app-area-damage-calculator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './area-damage-calculator.component.html',
  styleUrl: './area-damage-calculator.component.scss',
})
export class AreaDamageCalculatorComponent {
  readonly areaSizes: AreaSize[] = [
    { label: 'Zone restreinte', maxGroups: 1 },
    { label: 'Petite zone', maxGroups: 2 },
    { label: 'Zone moyenne', maxGroups: 3 },
    { label: 'Grande zone', maxGroups: 4 },
  ];

  readonly attackRoll = signal(0);
  readonly selectedAreaIndex = signal(2);
  readonly targetRoll = signal(2);
  readonly allyCount = signal(0);

  readonly groups = signal<EnemyGroup[]>([
    { id: 1, name: 'Groupe 1', size: 5 },
    { id: 2, name: 'Groupe 2', size: 3 },
    { id: 3, name: 'PNJ solitaire', size: 1 },
  ]);

  readonly selectedArea = computed(() => {
    return this.areaSizes[this.selectedAreaIndex()];
  });

  readonly largestGroupSize = computed(() => {
    const sizes = this.groups().map(group => group.size);
    return Math.max(1, ...sizes);
  });

  readonly recommendedTargetRoll = computed(() => {
    const maxSize = this.largestGroupSize();

    if (maxSize <= 1) {
      return '1 cible automatique';
    }

    return `1R2-${maxSize}`;
  });

  readonly cappedTargetRoll = computed(() => {
    const maxSize = this.largestGroupSize();

    if (maxSize <= 1) {
      return 1;
    }

    return Math.min(Math.max(2, this.targetRoll()), maxSize);
  });

  readonly results = computed<GroupDamageResult[]>(() => {
    const maxGroups = this.selectedArea().maxGroups;
    const attack = this.attackRoll();
    const touchedTargetsFromRoll = this.cappedTargetRoll();

    return this.groups().map((group, index) => {
      const isAffectedByZoneLimit = index < maxGroups;
      const touchedTargets = isAffectedByZoneLimit
        ? Math.min(touchedTargetsFromRoll, group.size)
        : 0;

      return {
        id: group.id,
        name: group.name,
        size: group.size,
        isAffectedByZoneLimit,
        touchedTargets,
        damage: attack * touchedTargets,
      };
    });
  });

  readonly enemyTotalDamage = computed(() => {
    return this.results().reduce((total, result) => total + result.damage, 0);
  });

  readonly allyDamage = computed(() => {
    return this.attackRoll() * this.allyCount();
  });

  readonly totalPotentialDamage = computed(() => {
    return this.enemyTotalDamage() + this.allyDamage();
  });

  setAttackRoll(value: string): void {
    this.attackRoll.set(this.toPositiveNumber(value));
  }

  setSelectedArea(value: string): void {
    this.selectedAreaIndex.set(this.toPositiveNumber(value));
  }

  setTargetRoll(value: string): void {
    this.targetRoll.set(this.toPositiveNumber(value));
  }

  setAllyCount(value: string): void {
    this.allyCount.set(this.toPositiveNumber(value));
  }

  updateGroupSize(groupId: number, value: string): void {
    const nextSize = Math.max(1, this.toPositiveNumber(value));

    this.groups.update(groups =>
      groups.map(group =>
        group.id === groupId
          ? { ...group, size: nextSize }
          : group
      )
    );
  }

  updateGroupName(groupId: number, value: string): void {
    this.groups.update(groups =>
      groups.map(group =>
        group.id === groupId
          ? { ...group, name: value || `Groupe ${group.id}` }
          : group
      )
    );
  }

  addGroup(): void {
    const nextId = Math.max(0, ...this.groups().map(group => group.id)) + 1;

    this.groups.update(groups => [
      ...groups,
      {
        id: nextId,
        name: `Groupe ${nextId}`,
        size: 1,
      },
    ]);
  }

  removeGroup(groupId: number): void {
    this.groups.update(groups => {
      if (groups.length <= 1) {
        return groups;
      }

      return groups.filter(group => group.id !== groupId);
    });
  }

  trackByGroupId(_: number, group: EnemyGroup): number {
    return group.id;
  }

  private toPositiveNumber(value: string): number {
    const parsedValue = Number(value);

    if (Number.isNaN(parsedValue)) {
      return 0;
    }

    return Math.max(0, Math.floor(parsedValue));
  }
}