import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { combineLatest, map } from 'rxjs';
import { Router } from '@angular/router';

import { CharactersService } from '../../core/services/characters.service';
import { ClassesService } from '../../core/services/classes.service';
import { ClassProfilesService } from '../../core/services/class-profiles.service';

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './characters.component.html',
  styleUrls: ['./characters.component.scss'],
})
export class CharactersComponent {
  private readonly charactersService = inject(CharactersService);
  private readonly classesService = inject(ClassesService);
  private readonly classProfilesService = inject(ClassProfilesService);
  private readonly router = inject(Router);

  readonly characters$ = combineLatest([
    this.charactersService.getCharacters(),
    this.classesService.getClasses(),
    this.classProfilesService.getClassProfiles(),
  ]).pipe(
    map(([characters, classes, classProfiles]) => {
      const classMap = new Map(classes.map((c) => [c.id, c.label]));
      const classprofileMap = new Map(classProfiles.map((s) => [s.id, s.label]));

      return characters.map((character) => {
        const hpPercent = character.maxHp > 0
          ? Math.max(0, Math.min(100, (character.currentHp / character.maxHp) * 100))
          : 0;

        return {
          ...character,
          classLabel: classMap.get(character.classId) ?? character.classId,
          classprofileLabel: character.classProfiles
            ? (classprofileMap.get(character.classProfiles) ?? character.classProfiles)
            : null,
          hpPercent,
          hpState: this.getHpState(hpPercent),
        };
      });
    })
  );

  goToCharacter(characterId?: string): void {
    if (!characterId) return;

    // route détail à venir
    this.router.navigate(['/characters', characterId]);
  }

  private getHpState(percent: number): 'healthy' | 'warning' | 'danger' | 'critical' {
    if (percent <= 10) return 'critical';
    if (percent <= 25) return 'danger';
    if (percent <= 50) return 'warning';
    return 'healthy';
  }
}