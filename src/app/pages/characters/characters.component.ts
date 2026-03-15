import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { combineLatest, map } from 'rxjs';
import { Router, RouterLink } from '@angular/router';

import { CharactersService } from '../../core/services/characters.service';
import { GameDataService } from '../../core/services/game-data.service';
import { CharacterListItem } from '../../core/models/character.model';

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './characters.component.html',
  styleUrls: ['./characters.component.scss'],
})
export class CharactersComponent {
  private readonly charactersService = inject(CharactersService);
  private readonly router = inject(Router);
  private readonly gameDataService = inject(GameDataService);

    readonly characters$ = combineLatest([
    this.charactersService.getCharacters(),
    this.gameDataService.getClassLabelMap(),
    this.gameDataService.getSubClassLabelMap(),
  ]).pipe(
    map(([characters, classMap, subClassMap]): CharacterListItem[] =>
      characters.map((character) => {
        const hpPercent =
          character.maxHp > 0
            ? Math.max(0, Math.min(100, (character.currentHp / character.maxHp) * 100))
            : 0;

        return {
          ...character,
          classLabel: classMap.get(character.classId) ?? character.classId,
          classProfileLabel: character.classProfiles
            ? (subClassMap.get(character.classProfiles) ?? character.classProfiles)
            : null,
          hpPercent,
          hpState: this.getHpState(hpPercent),
        };
      })
    )
  );

  goToCharacter(characterId?: string): void {
    if (!characterId) return;

    // route détail à venir
    this.router.navigate(['/characters', characterId]);
  }

  goToCreate(): void {
    this.router.navigate(['/characters/create']);
  }

  private getHpState(percent: number): 'healthy' | 'warning' | 'danger' | 'critical' {
    if (percent <= 10) return 'critical';
    if (percent <= 25) return 'danger';
    if (percent <= 50) return 'warning';
    return 'healthy';
  }
}