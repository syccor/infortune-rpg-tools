import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

interface PvOption {
  label: string;
  description?: string;
  hp: number;
  evasion?: number;
}

@Component({
  selector: 'app-pv-calculator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pv-calculator.component.html',
  styleUrl: './pv-calculator.component.scss',
})
export class PvCalculatorComponent {
  readonly baseHp = 180;

  readonly sizes: PvOption[] = [
    { label: 'Lilliputien', description: '< 1m20', hp: -15, evasion: 15 },
    { label: 'Minuscule', description: '1m20 à 1m45', hp: -10, evasion: 10 },
    { label: 'Petit', description: '1m45 à 1m65', hp: -5, evasion: 5 },
    { label: 'Moyen', description: '1m65 à 1m80', hp: 5 },
    { label: 'Grand', description: '1m80 à 1m95', hp: 10 },
    { label: 'Très grand', description: '1m95 à 2m10', hp: 15 },
    { label: 'Immense', description: '2m10 à 2m35', hp: 20, evasion: -5 },
    { label: 'Titanesque', description: '> 2m35', hp: 25, evasion: -10 },
  ];

  readonly weights: PvOption[] = [
    { label: 'Plume', description: '< 35 kg', hp: -25, evasion: 15 },
    { label: 'Très léger', description: '35 à 45 kg', hp: -15, evasion: 10 },
    { label: 'Léger', description: '45 à 55 kg', hp: -10, evasion: 5 },
    { label: 'Normal', description: '55 à 70 kg', hp: 5 },
    { label: 'Moyen', description: '70 à 80 kg', hp: 10 },
    { label: 'Lourd', description: '80 à 90 kg', hp: 15, evasion: -5 },
    { label: 'Très lourd', description: '90 à 120 kg', hp: 20, evasion: -10 },
    { label: 'Enclume', description: '> 120 kg', hp: 30, evasion: -20 },
  ];

  readonly muscles: PvOption[] = [
    { label: 'Rachitique', description: 'Absence totale de force musculaire', hp: -30 },
    { label: 'Faible', description: 'Manque d’exercice chronique', hp: -15 },
    { label: 'Normale', description: 'Activité physique modérée', hp: 0 },
    { label: 'Fine', description: 'Entraînement quotidien soutenu', hp: 10 },
    { label: 'Entretenue', description: 'Athlétique, corps à corps non spécialisé', hp: 15 },
    { label: 'Solide', description: 'Soldat expérimenté, survivaliste, mercenaire aguerri', hp: 20 },
    { label: 'Imposante', description: 'Impossible si poids inférieur à Moyen', hp: 25 },
    { label: 'Colossale', description: 'Impossible si poids inférieur à Lourd', hp: 40 },
  ];

  readonly sizeIndex = signal(3);
  readonly weightIndex = signal(3);
  readonly muscleIndex = signal(2);

  readonly selectedSize = computed(() => this.sizes[this.sizeIndex()]);
  readonly selectedWeight = computed(() => this.weights[this.weightIndex()]);
  readonly selectedMuscle = computed(() => this.muscles[this.muscleIndex()]);

  readonly finalHp = computed(() => {
    return this.baseHp
      + this.selectedSize().hp
      + this.selectedWeight().hp
      + this.selectedMuscle().hp;
  });

  readonly finalEvasionModifier = computed(() => {
    return (this.selectedSize().evasion ?? 0)
      + (this.selectedWeight().evasion ?? 0)
      + (this.selectedMuscle().evasion ?? 0);
  });

  setSize(value: string): void {
    this.sizeIndex.set(Number(value));
  }

  setWeight(value: string): void {
    this.weightIndex.set(Number(value));
    this.fixMuscleIfNeeded();
  }

  setMuscle(value: string): void {
    const nextIndex = Number(value);

    if (this.isMuscleDisabled(nextIndex)) {
      return;
    }

    this.muscleIndex.set(nextIndex);
  }

  isMuscleDisabled(index: number): boolean {
    const weightIndex = this.weightIndex();

    const imposingIndex = 6;
    const colossalIndex = 7;

    const minimumWeightForImposing = 4; // Moyen
    const minimumWeightForColossal = 5; // Lourd

    if (index === imposingIndex && weightIndex < minimumWeightForImposing) {
      return true;
    }

    if (index === colossalIndex && weightIndex < minimumWeightForColossal) {
      return true;
    }

    return false;
  }

  private fixMuscleIfNeeded(): void {
    if (!this.isMuscleDisabled(this.muscleIndex())) {
      return;
    }

    if (this.weightIndex() >= 4) {
      this.muscleIndex.set(6);
      return;
    }

    this.muscleIndex.set(5);
  }

  trackByIndex(index: number): number {
    return index;
  }

  formatModifier(value: number | undefined): string {
    const safeValue = value ?? 0;

    if (safeValue > 0) {
      return `+${safeValue}`;
    }

    return `${safeValue}`;
  }
}