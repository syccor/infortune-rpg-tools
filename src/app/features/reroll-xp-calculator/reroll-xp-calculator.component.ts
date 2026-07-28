import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

interface LevelProgress {
  level: number;
  currentLevelXp: number;
  requiredForNextLevel: number | null;
  remainingForNextLevel: number | null;
}

@Component({
  selector: 'app-reroll-xp-calculator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reroll-xp-calculator.component.html',
  styleUrl: './reroll-xp-calculator.component.scss',
})
export class RerollXpCalculatorComponent {
  readonly currentLevel = signal(1);
  readonly currentXpInLevel = signal(0);

  readonly originalTotalXp = computed(() => {
    return this.getTotalXpRequiredToReachLevel(this.currentLevel()) + this.currentXpInLevel();
  });

  readonly currentLevelRequiredXp = computed(() => {
    if (this.currentLevel() >= 10) {
      return null;
    }

    return this.getRequiredXpForNextLevel(this.currentLevel());
  });

  readonly rerollXp = computed(() => {
    return Math.round((this.originalTotalXp() * 0.5) / 10) * 10;
  });

  readonly levelProgress = computed(() => {
    return this.getLevelProgress(this.rerollXp());
  });

  readonly nextLevels = computed(() => {
    return Array.from({ length: 9 }, (_, index) => {
      const level = index + 1;

      return {
        from: level,
        to: level + 1,
        requiredXp: this.getRequiredXpForNextLevel(level),
      };
    });
  });

  setCurrentLevel(value: string): void {
    const parsedValue = this.toPositiveNumber(value);
    const safeLevel = Math.min(Math.max(parsedValue, 1), 10);

    this.currentLevel.set(safeLevel);
    this.fixCurrentXpIfNeeded();
  }

  setCurrentXpInLevel(value: string): void {
    const parsedValue = this.toPositiveNumber(value);

    if (this.currentLevel() >= 10) {
      this.currentXpInLevel.set(parsedValue);
      return;
    }

    const requiredXp = this.getRequiredXpForNextLevel(this.currentLevel());
    this.currentXpInLevel.set(Math.min(parsedValue, requiredXp - 1));
  }

  private fixCurrentXpIfNeeded(): void {
    if (this.currentLevel() >= 10) {
      return;
    }

    const requiredXp = this.getRequiredXpForNextLevel(this.currentLevel());

    if (this.currentXpInLevel() >= requiredXp) {
      this.currentXpInLevel.set(requiredXp - 1);
    }
  }

  private getRequiredXpForNextLevel(level: number): number {
    return 100 + ((level - 1) * 20);
  }

  private getTotalXpRequiredToReachLevel(level: number): number {
    let total = 0;

    for (let currentLevel = 1; currentLevel < level; currentLevel++) {
      total += this.getRequiredXpForNextLevel(currentLevel);
    }

    return total;
  }

  private getLevelProgress(totalXp: number): LevelProgress {
    let remainingXp = totalXp;
    let level = 1;

    while (level < 10) {
      const requiredXp = this.getRequiredXpForNextLevel(level);

      if (remainingXp < requiredXp) {
        return {
          level,
          currentLevelXp: remainingXp,
          requiredForNextLevel: requiredXp,
          remainingForNextLevel: requiredXp - remainingXp,
        };
      }

      remainingXp -= requiredXp;
      level++;
    }

    return {
      level: 10,
      currentLevelXp: remainingXp,
      requiredForNextLevel: null,
      remainingForNextLevel: null,
    };
  }

  private toPositiveNumber(value: string): number {
    const parsedValue = Number(value);

    if (Number.isNaN(parsedValue)) {
      return 0;
    }

    return Math.max(0, Math.floor(parsedValue));
  }
}