import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

type HpState = 'healthy' | 'warning' | 'danger' | 'critical';

@Component({
  selector: 'app-health-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './health-bar.component.html',
  styleUrls: ['./health-bar.component.scss'],
})
export class HealthBarComponent {
  private readonly _currentHp = signal(0);
  private readonly _maxHp = signal(0);
  private readonly _height = signal(14);
  private readonly _showValues = signal(true);

  @Input() set currentHp(value: number | null | undefined) {
    this._currentHp.set(Number(value ?? 0));
  }

  @Input() set maxHp(value: number | null | undefined) {
    this._maxHp.set(Number(value ?? 0));
  }

  @Input() set height(value: number | null | undefined) {
    this._height.set(Number(value ?? 14));
  }

  @Input() set showValues(value: boolean | '' | null | undefined) {
    this._showValues.set(value === '' ? true : Boolean(value));
  }

  readonly currentHpValue = computed(() => this._currentHp());
  readonly maxHpValue = computed(() => this._maxHp());
  readonly heightValue = computed(() => this._height());
  readonly showValuesValue = computed(() => this._showValues());

  readonly hpPercent = computed(() => {
    const max = this.maxHpValue();
    const current = this.currentHpValue();

    if (max <= 0) return 0;

    return Math.max(0, Math.min(100, (current / max) * 100));
  });

  readonly hpState = computed<HpState>(() => {
    const percent = this.hpPercent();

    if (percent <= 10) return 'critical';
    if (percent <= 25) return 'danger';
    if (percent <= 50) return 'warning';
    return 'healthy';
  });
}