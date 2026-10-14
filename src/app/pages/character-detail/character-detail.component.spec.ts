import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

import { CharacterDetailComponent } from './character-detail.component';
import { CharactersService } from '@services/characters.service';
import { GameDataService } from '@services/game-data.service';
import { CompanyBuffService } from '@services/company-buff.service';

describe('CharacterDetailComponent', () => {
  let fixture: ComponentFixture<CharacterDetailComponent>;
  let component: CharacterDetailComponent;
  let charactersService: jasmine.SpyObj<CharactersService>;

  beforeEach(async () => {
    charactersService = jasmine.createSpyObj<CharactersService>('CharactersService', [
      'getCharacters',
      'updateCharacter',
    ]) as jasmine.SpyObj<CharactersService>;
    charactersService.getCharacters.and.returnValue(
      of([
        {
          id: 'char-1',
          name: 'Alice',
          surname: 'Test',
          raceId: 'human',
          classId: 'light-fighter',
          classProfiles: null,
          gradeId: 'soldat',
          weightClassId: 'medium',
          musculatureClassId: 'average',
          sizeClassId: 'medium',
          armorTypeId: 'light',
          shieldTypeId: null,
          hasPet: false,
          mystique: false,
          lvl: 12,
          xp: 20,
          ressource: 0,
          maxHp: 100,
          currentHp: 80,
          armor: 5,
          dodge: 10,
          agility: 10,
          perception: 5,
          luckpoint: 4,
          hasShoulderPads: false,
          isActive: true,
          status: 'active',
          isDead: false,
        },
      ])
    );

    const gameDataService = jasmine.createSpyObj<GameDataService>('GameDataService', [
      'getCreationData',
    ] as any);
    gameDataService.getCreationData.and.returnValue(
      of({
        classes: [{ id: 'light-fighter', label: 'Guerrier léger' }],
        classProfiles: [],
        races: [{ id: 'human', label: 'Humain', hpBonus: 0, dodgeBonus: 0, armorBonus: 0, perceptionBonus: 0, requiredWeightIds: [], requiredMusculatureIds: [] }],
        grades: [{ id: 'soldat', label: 'Soldat' } as any],
        armorTypes: [{ id: 'light', label: 'Légère', shieldAllowed: false } as any],
        shieldTypes: [] as any,
        weightClasses: [{ id: 'medium', label: 'Moyen', order: 1 } as any],
        musculatureClasses: [{ id: 'average', label: 'Moyenne', minWeightClassOrder: 0 } as any],
        sizeClasses: [{ id: 'medium', label: 'Moyenne' } as any],
        petSpecies: [] as any,
        petClasses: [] as any,
      } as any)
    );

    const companyBuffService = jasmine.createSpyObj<CompanyBuffService>('CompanyBuffService', [
      'getBuffState',
    ]);
    companyBuffService.getBuffState.and.returnValue(
      of({
        activeBuff: 'none',
      })
    );

    await TestBed.configureTestingModule({
      imports: [CharacterDetailComponent],
      providers: [
        { provide: CharactersService, useValue: charactersService },
        { provide: GameDataService, useValue: gameDataService },
        { provide: CompanyBuffService, useValue: companyBuffService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: 'char-1' })),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CharacterDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should update name, level, xp, chance and armor when saving edits', async () => {
    component.startEditing();
    component.editForm.patchValue({
      name: 'Alicia',
      surname: 'Dumas',
      lvl: 42,
      xp: 999,
      luckpoint: 7,
      armor: 18,
    });

    await component.saveEdit();

    expect(charactersService.updateCharacter).toHaveBeenCalledWith(
      'char-1',
      jasmine.objectContaining({
        name: 'Alicia',
        surname: 'Dumas',
        lvl: 42,
        xp: 999,
        luckpoint: 7,
        armor: 18,
      })
    );
    expect(component.isEditing).toBeFalse();
  });
});
