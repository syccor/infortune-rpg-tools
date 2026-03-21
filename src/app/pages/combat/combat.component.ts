import { Component, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { combineLatest, map, startWith } from 'rxjs';

import { CharactersService } from '../../core/services/characters.service';
import { GameDataService } from '../../core/services/game-data.service';
import { HealthBarComponent } from '../../shared/health-bar/health-bar.component';
import {
  applyCombatAction,
  CombatActionType,
} from '@utils/combat-calculator';
import { CharacterListItem } from '@models/character.model';
import { AuthService } from '@services/auth.service';
import { CompanyBuffService } from '@services/company-buff.service';
import { getEffectiveCharacterStats } from '@utils/company-buff.utils';
import { getBuffedPet } from '@utils/company-buff.utils';

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

type CombatTarget = 'character' | 'pet';

type CombatCharacterView = CharacterListItem & {
  petSpeciesLabel?: string | null;
  petClassLabel?: string | null;
};

@Component({
  selector: 'app-combat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HealthBarComponent],
  templateUrl: './combat.component.html',
  styleUrls: ['./combat.component.scss'],
})
export class CombatComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly charactersService = inject(CharactersService);
  private readonly gameDataService = inject(GameDataService);
  private readonly authService = inject(AuthService);
  private readonly companyBuffService = inject(CompanyBuffService);

  logs: CombatLogEntry[] = [];
  lastResult: any = null;
  isApplying = false;

  readonly form = this.fb.nonNullable.group({
    characterId: ['', Validators.required],
    target: ['character' as CombatTarget, Validators.required],
    type: [
      'damage' as 'damage' | 'piercing-damage' | 'heal' | 'divine-heal',
      Validators.required,
    ],
    rawValue: [0, [Validators.required, Validators.min(0)]],
    note: [''],
  });

  readonly availableCharacters$ = combineLatest([
    this.charactersService.getCharacters(),
    this.gameDataService.getClassLabelMap(),
    this.gameDataService.getClassProfileLabelMap(),
    this.gameDataService.getPetSpeciesLabelMap(),
    this.gameDataService.getPetClassLabelMap(),
    this.authService.user$,
    this.authService.appUser$,
    this.companyBuffService.getBuffState(),
  ]).pipe(
    map(
      ([
        characters,
        classMap,
        classProfileMap,
        petSpeciesMap,
        petClassMap,
        firebaseUser,
        appUser,
        buffState,
      ]): CombatCharacterView[] => {
        const role = appUser?.role ?? null;

        let filteredCharacters = characters.filter(
          (character) => (character.status ?? 'active') === 'active',
        );

        if (!role) {
          filteredCharacters = [];
        } else if (role === 'pj' && firebaseUser) {
          filteredCharacters = filteredCharacters.filter(
            (character) => character.ownerUid === firebaseUser.uid,
          );
        }

        return filteredCharacters.map((character) => {
          const stats = getEffectiveCharacterStats(character, buffState.activeBuff);

          return {
            ...character,
            effectiveMaxHp: stats.effectiveMaxHp,
            effectiveDodge: stats.effectiveDodge,
            pet: getBuffedPet(character.pet, buffState.activeBuff),
            classLabel: classMap.get(character.classId) ?? character.classId,
            classProfileLabel: character.classProfiles
              ? (classProfileMap.get(character.classProfiles) ??
                character.classProfiles)
              : null,
            petSpeciesLabel: character.pet
              ? (petSpeciesMap.get(character.pet.speciesId) ??
                character.pet.speciesId)
              : null,
            petClassLabel: character.pet
              ? (petClassMap.get(character.pet.classId) ?? character.pet.classId)
              : null,
          };
        });
      },
    ),
  );

  readonly selectedCharacter$ = combineLatest([
    this.availableCharacters$,
    this.form.controls.characterId.valueChanges.pipe(
      startWith(this.form.controls.characterId.value),
    ),
  ]).pipe(
    map(
      ([characters, selectedId]) =>
        characters.find((character) => character.id === selectedId) ?? null,
    ),
  );

  ngOnInit(): void {
    this.selectedCharacter$
      .pipe(takeUntilDestroyed())
      .subscribe((character) => {
        if (!character?.pet && this.form.controls.target.value === 'pet') {
          this.form.controls.target.setValue('character');
        }
      });
  }

  private getTargetState(
    character: CombatCharacterView,
    target: CombatTarget,
  ): {
    maxHp: number;
    currentHp: number;
    armor: number;
    dodge: number;
    healCapState: 'none' | 'cap50' | 'cap25';
  } | null {
    if (target === 'pet') {
      if (!character.pet) {
        return null;
      }

      return {
        maxHp: character.pet.effectiveMaxHp,
        currentHp: character.pet.currentHp,
        armor: character.pet.armor,
        dodge: character.pet.effectiveDodge,
        healCapState: character.pet.healCapState ?? 'none',
      };
    }

    return {
      maxHp: character.effectiveMaxHp,
      currentHp: character.currentHp,
      armor: character.armor,
      dodge: character.effectiveDodge,
      healCapState: character.healCapState ?? 'none',
    };
  }

  private getTargetLabel(
    character: CombatCharacterView,
    target: CombatTarget,
  ): string {
    if (target === 'pet' && character.pet) {
      return `${character.name} → ${character.pet.name}`;
    }

    return character.name;
  }

  simulate(character: CombatCharacterView): void {
    if (!character || this.form.invalid) return;

    const raw = this.form.getRawValue();
    const target = raw.target as CombatTarget;

    const state = this.getTargetState(character, target);
    if (!state) return;

    const result = applyCombatAction(state, {
      type: raw.type,
      rawValue: Number(raw.rawValue),
    });

    this.lastResult = result;

    this.logs.unshift({
      timestamp: new Date().toLocaleTimeString(),
      characterName: this.getTargetLabel(character, target),
      type: raw.type,
      rawValue: Number(raw.rawValue),
      resultText: this.getResultText(result, raw.type),
      hpBefore: result.hpBefore,
      hpAfter: result.hpAfter,
      applied: false,
    });
  }

  async apply(character: CombatCharacterView): Promise<void> {
    if (!character || this.form.invalid) return;

    const raw = this.form.getRawValue();
    const target = raw.target as CombatTarget;
    const state = this.getTargetState(character, target);

    if (!state) return;

    const result = applyCombatAction(state, {
      type: raw.type,
      rawValue: Number(raw.rawValue),
    });

    this.lastResult = result;
    this.isApplying = true;

    try {
      if (target === 'pet' && character.pet) {
        await this.charactersService.updatePetCombatState(character.id!, {
          currentHp: result.hpAfter,
          isDead: result.hpAfter <= 0,
          healCapState: result.newHealCapState,
        });
      } else {
        await this.charactersService.updateCharacterCombatState(character.id!, {
          currentHp: result.hpAfter,
          healCapState: result.newHealCapState,
          isDead: result.hpAfter <= 0,
        });
      }

      this.logs.unshift({
        timestamp: new Date().toLocaleTimeString(),
        characterName: this.getTargetLabel(character, target),
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
  
  async resetCombatState(character: CombatCharacterView): Promise<void> {
    if (!character?.id) return;

    await this.charactersService.updateCharacterCombatState(character.id, {
      currentHp: character.effectiveMaxHp,
      healCapState: 'none',
      isDead: false,
    });

    if (character.pet) {
      await this.charactersService.updatePetCombatState(character.id, {
        currentHp: character.pet.effectiveMaxHp,
        healCapState: 'none',
        isDead: false,
      });
    }

    this.lastResult = null;
    this.logs = [];
  }
}
