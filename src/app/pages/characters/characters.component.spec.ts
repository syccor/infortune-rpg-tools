import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { CharactersComponent } from './characters.component';
import { CharactersService } from '@services/characters.service';
import { GameDataService } from '@services/game-data.service';
import { CompanyBuffService } from '@services/company-buff.service';
import { ActivatedRoute, Router } from '@angular/router';

describe('CharactersComponent', () => {
  let fixture: ComponentFixture<CharactersComponent>;
  let component: CharactersComponent;
  let charactersService: jasmine.SpyObj<CharactersService>;

  beforeEach(async () => {
    charactersService = jasmine.createSpyObj<CharactersService>('CharactersService', [
      'getCharacters',
      'deleteCharacter',
    ]);
    charactersService.getCharacters.and.returnValue(of([]));

    const gameDataService = jasmine.createSpyObj<GameDataService>('GameDataService', [
      'getClassLabelMap',
      'getClassProfileLabelMap',
      'getPetSpeciesLabelMap',
      'getPetClassLabelMap',
    ]);
    gameDataService.getClassLabelMap.and.returnValue(of(new Map()));
    gameDataService.getClassProfileLabelMap.and.returnValue(of(new Map()));
    gameDataService.getPetSpeciesLabelMap.and.returnValue(of(new Map()));
    gameDataService.getPetClassLabelMap.and.returnValue(of(new Map()));

    const companyBuffService = jasmine.createSpyObj<CompanyBuffService>('CompanyBuffService', [
      'getBuffState',
    ]);
    companyBuffService.getBuffState.and.returnValue(
      of({
        activeBuff: 'none',
      })
    );

    await TestBed.configureTestingModule({
      imports: [CharactersComponent],
      providers: [
        { provide: CharactersService, useValue: charactersService },
        { provide: GameDataService, useValue: gameDataService },
        { provide: CompanyBuffService, useValue: companyBuffService },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
        { provide: ActivatedRoute, useValue: { snapshot: {} } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CharactersComponent);
    component = fixture.componentInstance;
  });

  it('should delete a character when confirmed', async () => {
    spyOn(window, 'confirm').and.returnValue(true);

    await component.deleteCharacter('character-id');

    expect(charactersService.deleteCharacter).toHaveBeenCalledWith('character-id');
    expect(component.actionMessage).toContain('supprimé');
  });
});
