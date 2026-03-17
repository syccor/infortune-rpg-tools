import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map, switchMap } from 'rxjs';

import { CharactersService } from '../../core/services/characters.service';
import { GameDataService } from '../../core/services/game-data.service';
import { HealthBarComponent } from '../../shared/health-bar/health-bar.component';

@Component({
  selector: 'app-character-detail',
  standalone: true,
  imports: [CommonModule, HealthBarComponent],
  templateUrl: './character-detail.component.html',
  styleUrls: ['./character-detail.component.scss'],
})
export class CharacterDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly charactersService = inject(CharactersService);
  private readonly gameDataService = inject(GameDataService);

  readonly character$ = this.route.paramMap.pipe(
    map((params) => params.get('id')),
    switchMap((id) =>
      combineLatest([
        this.charactersService.getCharacters(),
        this.gameDataService.getCreationData(),
      ]).pipe(
        map(([characters, refs]) => {
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

          const maxHp = character.maxHp ?? 0;

          return {
            ...character,
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
            hp50: Math.floor(maxHp * 0.5),
            hp25: Math.floor(maxHp * 0.25),
            hp10: Math.floor(maxHp * 0.1),
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
**Points de vie :** ${character.currentHp ?? 0} / ${character.maxHp ?? 0}
**PV à 50%, 25% et 10% :** ${character.hp50} / ${character.hp25} / ${character.hp10}
**Points de magie :** ${character.ressource ?? ''}
**Armure :** ${character.armor ?? 0}
**Esquive - Rand d'agilité :** ${character.dodge ?? 0} - R${character.agility ?? 100}

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
