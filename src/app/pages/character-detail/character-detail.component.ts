import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { combineLatest, map, switchMap } from 'rxjs';

import { CharactersService } from '@services/characters.service';
import { GameDataService } from '@services/game-data.service';
import { HealthBarComponent } from '../../shared/health-bar/health-bar.component';
import { CompanyBuffService } from '@services/company-buff.service';
import { getBuffedPet, getEffectiveCharacterStats } from '@utils/company-buff.utils';

@Component({
  selector: 'app-character-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, HealthBarComponent],
  templateUrl: './character-detail.component.html',
  styleUrls: ['./character-detail.component.scss'],
})
export class CharacterDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly charactersService = inject(CharactersService);
  private readonly gameDataService = inject(GameDataService);
  private readonly companyBuffService = inject(CompanyBuffService);

  readonly character$ = this.route.paramMap.pipe(
    map((params) => params.get('id')),
    switchMap((id) =>
      combineLatest([
        this.charactersService.getCharacters(),
        this.gameDataService.getCreationData(),
        this.companyBuffService.getBuffState(),
      ]).pipe(
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
