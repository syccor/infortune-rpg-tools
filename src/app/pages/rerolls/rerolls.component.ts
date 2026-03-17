import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { combineLatest, map } from 'rxjs';

import { CharactersService } from '../../core/services/characters.service';
import { GameDataService } from '../../core/services/game-data.service';
import { AuthService } from '../../core/services/auth.service';
import { HealthBarComponent } from '../../shared/health-bar/health-bar.component';

@Component({
  selector: 'app-rerolls',
  standalone: true,
  imports: [CommonModule, RouterLink, HealthBarComponent],
  templateUrl: './rerolls.component.html',
  styleUrls: ['./rerolls.component.scss'],
})
export class RerollsComponent {
  private readonly charactersService = inject(CharactersService);
  private readonly gameDataService = inject(GameDataService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isProcessing = false;
  actionMessage = '';

  readonly rerolls$ = combineLatest([
    this.charactersService.getCharacters(),
    this.gameDataService.getClassLabelMap(),
    this.gameDataService.getClassProfileLabelMap(),
    this.authService.user$,
  ]).pipe(
    map(([characters, classMap, classProfileMap, user]) => {
      if (!user) {
        return [];
      }

      return characters
        .filter(
          (character) =>
            (character.status ?? 'active') === 'draft' &&
            character.ownerUid === user.uid
        )
        .map((character) => ({
          ...character,
          classLabel: classMap.get(character.classId) ?? character.classId,
          classProfileLabel: character.classProfiles
            ? (classProfileMap.get(character.classProfiles) ?? character.classProfiles)
            : null,
        }));
    })
  );

  goToCharacter(characterId?: string): void {
    if (!characterId) return;
    this.router.navigate(['/characters', characterId]);
  }

  async activateReroll(characterId?: string, event?: Event): Promise<void> {
    event?.stopPropagation();
    if (!characterId) return;

    this.isProcessing = true;
    this.actionMessage = '';

    try {
      await this.charactersService.activateCharacter(characterId);
      this.actionMessage = 'Le reroll est maintenant un personnage actif.';
    } catch (error) {
      console.error(error);
      this.actionMessage = 'Erreur lors de l’activation du reroll.';
    } finally {
      this.isProcessing = false;
    }
  }

  async deleteReroll(characterId?: string, event?: Event): Promise<void> {
    event?.stopPropagation();
    if (!characterId) return;

    const confirmed = window.confirm(
      'Supprimer définitivement ce reroll ? Cette action est irréversible.'
    );

    if (!confirmed) return;

    this.isProcessing = true;
    this.actionMessage = '';

    try {
      await this.charactersService.deleteCharacter(characterId);
      this.actionMessage = 'Le reroll a été supprimé.';
    } catch (error) {
      console.error(error);
      this.actionMessage = 'Erreur lors de la suppression du reroll.';
    } finally {
      this.isProcessing = false;
    }
  }
}