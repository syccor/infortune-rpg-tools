import { Component, inject, OnInit  } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { combineLatest, map } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CharactersService } from '../../core/services/characters.service';
import { ClassesService } from '../../core/services/classes.service';
import { ClassprofilesService } from '../../core/services/classprofiles.service';
import { Character } from '../../core/models/character.model';

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [CommonModule, AsyncPipe, ReactiveFormsModule],
  templateUrl: './characters.component.html',
  styleUrl: './characters.component.scss',
})
export class CharactersComponent implements OnInit {
  private readonly charactersService = inject(CharactersService);
  private readonly classesService = inject(ClassesService);
  private readonly classprofilesService = inject(ClassprofilesService);
  private readonly fb = inject(FormBuilder);

  readonly characters$ = combineLatest([
    this.charactersService.getCharacters(),
    this.classesService.getClasses(),
    this.classprofilesService.getSubprofiles(),
  ]).pipe(
    map(([characters, classes, classprofiles]) => {
      const classMap = new Map(classes.map((c) => [c.id, c.label]));
      const classprofileMap = new Map(classprofiles.map((s) => [s.id, s.label]));

      return characters.map((character) => ({
        ...character,
        classLabel: classMap.get(character.classId) ?? character.classId,
        classprofileLabel: character.classProfiles
          ? (classprofileMap.get(character.classProfiles) ?? character.classProfiles)
          : null,
      }));
    })
  );

  showForm = false;
  isSaving = false;
  errorMessage = '';

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(60)]],
    classId: ['', Validators.required],
    classprofileId: [''],
    maxHp: [100, [Validators.required, Validators.min(1)]],
    currentHp: [100, [Validators.required, Validators.min(0)]],
    dailyRegen: [10, [Validators.required, Validators.min(0)]],
    armor: [0, [Validators.required, Validators.min(0)]],
    dodge: [0, [Validators.required, Validators.min(0)]],
    luck: [0, [Validators.required, Validators.min(0)]],
  });


    ngOnInit(): void {
    this.characters$.subscribe({
      next: (data) => console.log('CHARACTERS =>', data),
      error: (err) => console.error('FIRESTORE ERROR =>', err),
    });
  }
  
  toggleForm(): void {
    this.showForm = !this.showForm;
    this.errorMessage = '';
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const raw = this.form.getRawValue();

    const payload: Omit<Character, 'id' | 'createdAt' | 'updatedAt'> = {
      name: raw.name.trim(),
      classId: raw.classId,
      classProfiles: raw.classprofileId || null,
      maxHp: raw.maxHp,
      currentHp: raw.currentHp,
      dailyRegen: raw.dailyRegen,
      armor: raw.armor,
      dodge: raw.dodge,
      luck: raw.luck,
      passives: [],
      inventory: [],
      isActive: true,
    };

    try {
      await this.charactersService.addCharacter(payload);
      this.form.reset({
        name: '',
        classId: '',
        classprofileId: '',
        maxHp: 100,
        currentHp: 100,
        dailyRegen: 10,
        armor: 0,
        dodge: 0,
        luck: 0,
      });
      this.showForm = false;
    } catch (error) {
      console.error(error);
      this.errorMessage = "Impossible d'ajouter le personnage.";
    } finally {
      this.isSaving = false;
    }
  }
}