import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { combineLatest, map } from 'rxjs';
import { Router, RouterLink } from '@angular/router';

import { CharactersService } from '../../core/services/characters.service';
import { GameDataService } from '../../core/services/game-data.service';
import { CharacterListItem } from '../../core/models/character.model';
import { HealthBarComponent } from '../../shared/health-bar/health-bar.component';

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [CommonModule, RouterLink, HealthBarComponent],
  templateUrl: './characters.component.html',
  styleUrls: ['./characters.component.scss'],
})
export class CharactersComponent {
  private readonly charactersService = inject(CharactersService);
  private readonly router = inject(Router);
  private readonly gameDataService = inject(GameDataService);
  isApplyingDailyRegen = false;
  dailyRegenMessage = '';

  readonly characters$ = combineLatest([
    this.charactersService.getCharacters(),
    this.gameDataService.getClassLabelMap(),
    this.gameDataService.getSubClassLabelMap(),
  ]).pipe(
    map(([characters, classMap, subClassMap]): CharacterListItem[] =>
      characters.map((character) => ({
        ...character,
        classLabel: classMap.get(character.classId) ?? character.classId,
        classProfileLabel: character.classProfiles
          ? (subClassMap.get(character.classProfiles) ?? character.classProfiles)
          : null,
      }))
    )
  );

  goToCharacter(characterId?: string): void {
    if (!characterId) return;
    this.router.navigate(['/characters', characterId]);
  };

  async applyDailyRegen(): Promise<void> {
    this.isApplyingDailyRegen = true;
    this.dailyRegenMessage = '';

    try {
      const updatedCount = await this.charactersService.applyDailyRegenToAllCharacters();
      this.dailyRegenMessage =
      updatedCount === 0
        ? 'Aucun personnage n’avait besoin de régénération.'
        : `${updatedCount} personnage(s) ont récupéré des PV.`;
    } catch (error) {
      console.error(error);
      this.dailyRegenMessage = 'Erreur lors de la régénération quotidienne.';
    } finally {
      this.isApplyingDailyRegen = false;
    }
  }
}