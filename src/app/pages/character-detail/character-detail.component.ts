import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { combineLatest, map, switchMap, tap } from 'rxjs';

import { CharactersService } from '@services/characters.service';
import { GameDataService } from '@services/game-data.service';
import { HealthBarComponent } from '../../shared/health-bar/health-bar.component';
import { CompanyBuffService } from '@services/company-buff.service';
import { getBuffedPet, getEffectiveCharacterStats } from '@utils/company-buff.utils';

@Component({
  selector: 'app-character-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, HealthBarComponent],
  templateUrl: './character-detail.component.html',
  styleUrls: ['./character-detail.component.scss'],
})
export class CharacterDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly charactersService = inject(CharactersService);
  private readonly gameDataService = inject(GameDataService);
  private readonly companyBuffService = inject(CompanyBuffService);

  currentCharacter: any = null;
  isEditing = false;

  readonly editForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    surname: new FormControl(''),
    lvl: new FormControl(1, [Validators.required, Validators.min(1)]),
    xp: new FormControl(0, [Validators.required, Validators.min(0)]),
    luckpoint: new FormControl(0, [Validators.required, Validators.min(0)]),
    armor: new FormControl(0, [Validators.required, Validators.min(0)]),
  });

  readonly character$ = this.route.paramMap.pipe(
    map((params) => params.get('id')),
    switchMap((id) =>
      combineLatest([
        this.charactersService.getCharacters(),
        this.gameDataService.getCreationData(),
        this.companyBuffService.getBuffState(),
      ]).pipe(
        tap(([characters]) => {
          const character = characters.find((item) => item.id === id);
          this.currentCharacter = character ?? null;

          if (character && !this.isEditing) {
            this.editForm.patchValue({
              name: character.name ?? '',
              surname: character.surname ?? '',
              lvl: Number(character.lvl ?? 1),
              xp: Number(character.xp ?? 0),
              luckpoint: Number(character.luckpoint ?? 0),
              armor: Number(character.armor ?? 0),
            }, { emitEvent: false });
          }
        }),
        map(([characters, refs, buffState]) => {
          const character = characters.find((item) => item.id === id);
          if (!character) return null;

          const classMap = new Map(refs.classes.map((item) => [item.id, item.label]));
          const subClassMap = new Map(refs.classProfiles.map((item) => [item.id, item.label]));
          const raceMap = new Map(refs.races.map((item) => [item.id, item.label]));
          const gradeMap = new Map(refs.grades.map((item) => [item.id, item.label]));
          const armorTypeMap = new Map(refs.armorTypes.map((item) => [item.id, item.label]));
          const shieldTypeMap = new Map(refs.shieldTypes.map((item) => [item.id, item.label]));
          const weightMap = new Map(refs.weightClasses.map((item) => [item.id, item.label]));
          const musculatureMap = new Map(
            refs.musculatureClasses.map((item) => [item.id, item.label]),
          );
          const sizeMap = new Map(refs.sizeClasses.map((item) => [item.id, item.label]));
          const petSpeciesMap = new Map(refs.petSpecies.map((item) => [item.id, item.label]));
          const petClassMap = new Map(refs.petClasses.map((item) => [item.id, item.label]));
          const stats = getEffectiveCharacterStats(character, buffState.activeBuff);

          return {
            ...character,
            effectiveMaxHp: stats.effectiveMaxHp,
            effectiveDodge: stats.effectiveDodge,
            pet: getBuffedPet(character.pet, buffState.activeBuff),
            activeBuff: buffState.activeBuff,
            classLabel: classMap.get(character.classId) ?? character.classId,
            classProfileLabel: character.classProfiles
              ? (subClassMap.get(character.classProfiles) ?? character.classProfiles)
              : null,
            raceLabel: raceMap.get(character.raceId) ?? character.raceId,
            gradeLabel: gradeMap.get(character.gradeId) ?? character.gradeId,
            armorTypeLabel: armorTypeMap.get(character.armorTypeId) ?? character.armorTypeId,
            shieldTypeLabel: character.shieldTypeId
              ? (shieldTypeMap.get(character.shieldTypeId) ?? character.shieldTypeId)
              : 'Aucun',
            weightLabel: weightMap.get(character.weightClassId) ?? character.weightClassId,
            musculatureLabel:
              musculatureMap.get(character.musculatureClassId) ?? character.musculatureClassId,
            sizeLabel: sizeMap.get(character.sizeClassId) ?? character.sizeClassId,
            hp50: stats.hp50,
            hp25: stats.hp25,
            hp10: stats.hp10,
            petSpeciesLabel: character.pet
              ? (petSpeciesMap.get(character.pet.speciesId) ?? character.pet.speciesId)
              : null,
            petClassLabel: character.pet
              ? (petClassMap.get(character.pet.classId) ?? character.pet.classId)
              : null,
          };
        }),
      ),
    ),
  );

  startEditing(): void {
    if (!this.currentCharacter) return;

    this.editForm.patchValue({
      name: this.currentCharacter.name ?? '',
      surname: this.currentCharacter.surname ?? '',
      lvl: Number(this.currentCharacter.lvl ?? 1),
      xp: Number(this.currentCharacter.xp ?? 0),
      luckpoint: Number(this.currentCharacter.luckpoint ?? 0),
      armor: Number(this.currentCharacter.armor ?? 0),
    });
    this.isEditing = true;
  }

  cancelEditing(): void {
    this.isEditing = false;
    if (this.currentCharacter) {
      this.editForm.patchValue({
        name: this.currentCharacter.name ?? '',
        surname: this.currentCharacter.surname ?? '',
        lvl: Number(this.currentCharacter.lvl ?? 1),
        xp: Number(this.currentCharacter.xp ?? 0),
        luckpoint: Number(this.currentCharacter.luckpoint ?? 0),
        armor: Number(this.currentCharacter.armor ?? 0),
      }, { emitEvent: false });
    }
  }

  async saveEdit(): Promise<void> {
    if (!this.currentCharacter || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const values = this.editForm.getRawValue();

    try {
      await this.charactersService.updateCharacter(this.currentCharacter.id, {
        name: String(values.name ?? '').trim(),
        surname: String(values.surname ?? '').trim(),
        lvl: Number(values.lvl),
        xp: Number(values.xp),
        luckpoint: Number(values.luckpoint),
        armor: Number(values.armor),
      });
      this.isEditing = false;
    } catch (error) {
      console.error(error);
    }
  }

  async copyDiscord(character: any): Promise<void> {
    const text = this.buildDiscordText(character);
    await navigator.clipboard.writeText(text);
  }

  private buildDiscordText(character: any): string {
    return `**Nom :** ${character.surname || ''}
**Prénom :** ${character.name || ''}
**Grade :** ${character.gradeLabel || ''}
**Description sommaire :** 

---

**Niveau :** ${character.lvl ?? ''}
**Barre d’expérience :** ${character.xp ?? ''}

---

**Silhouette :** ${character.sizeLabel || ''}
**Points de vie :** ${character.currentHp ?? 0} / ${character.effectiveMaxHp ?? character.maxHp ?? 0}
**PV à 50%, 25% et 10% :** ${character.hp50} / ${character.hp25} / ${character.hp10}
**Points de magie :** ${character.ressource ?? ''}
**Armure :** ${character.armor ?? 0}
**Esquive - Rand d'agilité :** ${character.effectiveDodge ?? character.dodge ?? 0} - R${character.agility ?? 100}

---

**Attaque (CAC / Distance) :** 
**Perception :** ${character.perception ?? 0}
**Régénération PV par tour :** 
**Régénération PV par jour :** ${character.dailyRegen ?? ''}
**Points de chance :** ${character.luckpoint ?? 0}${character.luckMax ? ` / ${character.luckMax}` : ''}

---

## Passif racial : ${character.race || ''}
## Classe / Profil classique : ${character.classLabel || ''}${character.classProfileLabel ? ` / ${character.classProfileLabel}` : ''}

---

## Techniques :
---

---

## Equipement :
---

--- 

## Consommables :

**Monnaie :** X PO / X PA / X PC
**Composants :** X`;
  }
}
