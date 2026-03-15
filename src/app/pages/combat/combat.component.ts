import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { combineLatest, map, startWith } from 'rxjs';

import { CharactersService } from '../../core/services/characters.service';
import { GameDataService } from '../../core/services/game-data.service';
import { HealthBarComponent } from '../../shared/health-bar/health-bar.component';
import { applyCombatAction, CombatActionInput, CombatActionType} from '../../core/utils/combat-calculator';

type CombatLogEntry = {
  timestamp: string;
  characterName: string;
  type: CombatActionType;
  rawValue: number;
  resultText: string;
  hpBefore: number;
  hpAfter: number;
  applied: boolean;
};

@Component({
  selector: 'app-combat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HealthBarComponent],
  templateUrl: './combat.component.html',
  styleUrls: ['./combat.component.scss'],
})
export class CombatComponent {
  private readonly fb = inject(FormBuilder);
  private readonly charactersService = inject(CharactersService);
  private readonly gameDataService = inject(GameDataService);

  logs: CombatLogEntry[] = [];
  lastResult: any = null;
  isApplying = false;

  readonly form = this.fb.nonNullable.group({
    characterId: ['', Validators.required],
    type: ['damage' as 'damage' | 'piercing-damage' | 'heal' | 'divine-heal', Validators.required],
    rawValue: [0, [Validators.required, Validators.min(0)]],
    note: [''],
  });

  readonly characters$ = combineLatest([
    this.charactersService.getCharacters(),
    this.gameDataService.getClassLabelMap(),
    this.gameDataService.getSubClassLabelMap(),
  ]).pipe(
    map(([characters, classMap, subClassMap]) =>
      characters.map((character) => ({
        ...character,
        classLabel: classMap.get(character.classId) ?? character.classId,
        classProfileLabel: character.classProfiles
          ? (subClassMap.get(character.classProfiles) ?? character.classProfiles)
          : null,
      }))
    )
  );

  readonly selectedCharacter$ = combineLatest([
    this.characters$,
    this.form.controls.characterId.valueChanges.pipe(
      startWith(this.form.controls.characterId.value)
    ),
  ]).pipe(
    map(([characters, selectedId]) =>
      characters.find((character) => character.id === selectedId) ?? null
    )
  );

  simulate(character: any): void {
    if (!character || this.form.invalid) return;

    const raw = this.form.getRawValue();

    const result = applyCombatAction(
      {
        maxHp: character.maxHp,
        currentHp: character.currentHp,
        armor: character.armor,
        dodge: character.dodge,
        healCapState: character.healCapState ?? 'none',
      },
      {
        type: raw.type,
        rawValue: Number(raw.rawValue),
      }
    );

    this.lastResult = result;

    this.logs.unshift({
      timestamp: new Date().toLocaleTimeString(),
      characterName: character.name,
      type: raw.type,
      rawValue: Number(raw.rawValue),
      resultText: this.getResultText(result, raw.type),
      hpBefore: result.hpBefore,
      hpAfter: result.hpAfter,
      applied: false,
    });
  }

  async apply(character: any): Promise<void> {
    if (!character || this.form.invalid) return;

    const raw = this.form.getRawValue();

    const result = applyCombatAction(
      {
        maxHp: character.maxHp,
        currentHp: character.currentHp,
        armor: character.armor,
        dodge: character.dodge,
        healCapState: character.healCapState ?? 'none',
      },
      {
        type: raw.type,
        rawValue: Number(raw.rawValue),
      }
    );

    this.lastResult = result;
    this.isApplying = true;

    try {
      await this.charactersService.updateCharacterCombatState(character.id, {
        currentHp: result.hpAfter,
        healCapState: result.newHealCapState,
      });

      this.logs.unshift({
        timestamp: new Date().toLocaleTimeString(),
        characterName: character.name,
        type: raw.type,
        rawValue: Number(raw.rawValue),
        resultText: this.getResultText(result, raw.type),
        hpBefore: result.hpBefore,
        hpAfter: result.hpAfter,
        applied: true,
      });
    } finally {
      this.isApplying = false;
    }
  }

  private getResultText(result: any, actionType: string): string {
    switch (result.resolution) {
      case 'dodge':
        return 'Esquive';
      case 'block':
        return 'Blocage';
      case 'heal':
        if (actionType === 'divine-heal') {
          return `Soin divin (+${result.finalValue})`;
        }
        return result.healCapApplied
          ? `Soin limité (+${result.finalValue})`
          : `Soin (+${result.finalValue})`;
      default:
        return `${result.finalValue} dégâts subis`;
    }
  }

  async resetCombatState(character: any): Promise<void> {
    if (!character?.id) return;

    await this.charactersService.updateCharacterCombatState(character.id, {
      currentHp: character.maxHp,
      healCapState: 'none',
    });

    this.lastResult = null;
    this.logs = [];
  }

}