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
  readonly originalXp = signal(0);

  readonly rerollXp = computed(() => {
    return Math.round((this.originalXp() * 0.5) / 10) * 10;
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

  setOriginalXp(value: string): void {
    const parsedValue = Number(value);

    this.originalXp.set(Number.isNaN(parsedValue) ? 0 : Math.max(0, parsedValue));
  }

  private getRequiredXpForNextLevel(level: number): number {
    return 100 + ((level - 1) * 20);
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
}