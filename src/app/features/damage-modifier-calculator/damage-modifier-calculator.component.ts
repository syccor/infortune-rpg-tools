import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-damage-modifier-calculator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './damage-modifier-calculator.component.html',
  styleUrl: './damage-modifier-calculator.component.scss',
})
export class DamageModifierCalculatorComponent {
  readonly baseDamage = signal(0);

  readonly criticalSuccessDamage = computed(() => {
    return Math.round(this.baseDamage() * 1.25);
  });

  readonly criticalFailureDamage = computed(() => {
    return Math.round(this.baseDamage() * 1.5);
  });

  setBaseDamage(value: string): void {
    const parsedValue = Number(value);

    this.baseDamage.set(Number.isNaN(parsedValue) ? 0 : Math.max(0, parsedValue));
  }
}