import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { startWith } from 'rxjs';

import { CharactersService } from '../../core/services/characters.service';
import { GameDataService } from '../../core/services/game-data.service';
import {
  ArmorType,
  ClassProfile,
  GameClass,
  Grade,
  MusculatureClass,
  Race,
  ShieldType,
  SizeClass,
  WeightClass,
} from '../../core/models/reference.model';
import { Character } from '../../core/models/character.model';
import {
  CharacterPreviewStats,
  calculateCharacterStats,
} from '../../core/utils/character-calculator';

@Component({
  selector: 'app-characters-creation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './characters-creation.component.html',
  styleUrls: ['./characters-creation.component.scss'],
})
export class CharactersCreationComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly charactersService = inject(CharactersService);
  private readonly router = inject(Router);
  private readonly gameDataService = inject(GameDataService);

  classes: GameClass[] = [];
  classProfiles: ClassProfile[] = [];
  races: Race[] = [];
  grades: Grade[] = [];
  weightClasses: WeightClass[] = [];
  musculatureClasses: MusculatureClass[] = [];
  sizeClasses: SizeClass[] = [];
  armorTypes: ArmorType[] = [];
  shieldTypes: ShieldType[] = [];

  filteredProfiles: ClassProfile[] = [];
  filteredShields: ShieldType[] = [];

  preview: CharacterPreviewStats | null = null;
  validationMessage = '';
  isSaving = false;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    surname: [''],

    raceId: ['', Validators.required],
    classId: ['', Validators.required],
    classProfiles: this.fb.control({ value: '', disabled: true }),

    gradeId: ['demi-solde', Validators.required],

    weightClassId: ['', Validators.required],
    musculatureClassId: ['', Validators.required],
    sizeClassId: ['', Validators.required],

    armorTypeId: ['', Validators.required],
    shieldTypeId: ['none'],

    hasPet: [false],
    lvl: [1, [Validators.required, Validators.min(1)]],
    xp: [0, [Validators.required, Validators.min(0)]],
    ressource: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.loadReferences();

    this.form.controls.classId.valueChanges
      .pipe(startWith(this.form.controls.classId.value))
      .subscribe((classId) => {
    const profileControl = this.form.controls.classProfiles;

    if (!classId) {
      this.filteredProfiles = [];
      profileControl.setValue('');
      profileControl.disable({ emitEvent: false });
      return;
    }

    const classicClasses = ['heavy-fighter', 'light-fighter', 'shooter'];

    this.filteredProfiles = this.classProfiles
      .filter((profile) => {
        if (profile.classId === classId) {
          return true;
        }

        if (profile.classId === 'classic' && classicClasses.includes(classId)) {
          return true;
        }

        return false;
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      profileControl.enable({ emitEvent: false });

      const currentProfile = profileControl.value;
      if (
        currentProfile &&
        !this.filteredProfiles.some((profile) => profile.id === currentProfile)
      ) {
        profileControl.setValue('');
      }
    });

    this.form.controls.armorTypeId.valueChanges
      .pipe(startWith(this.form.controls.armorTypeId.value))
      .subscribe((armorTypeId) => {
        const armorType = this.armorTypes.find((item) => item.id === armorTypeId);

        if (!armorType?.shieldAllowed) {
          this.filteredShields = this.shieldTypes.filter((shield) => shield.id === 'none');
          this.form.controls.shieldTypeId.setValue('none');
          return;
        }

        this.filteredShields = [...this.shieldTypes];
      });

    this.form.valueChanges
      .pipe(startWith(this.form.getRawValue()))
      .subscribe(() => this.updatePreview());
  }

  private loadReferences(): void {
    this.gameDataService.getCreationData().subscribe((data) => {
      console.log('CREATION DATA =>', data);
      this.classes = data.classes;
      this.classProfiles = data.classProfiles;
      this.races = data.races;
      this.grades = data.grades;
      this.armorTypes = data.armorTypes;
      this.shieldTypes = data.shieldTypes;
      this.weightClasses = data.weightClasses;
      this.musculatureClasses = data.musculatureClasses;
      this.sizeClasses = data.sizeClasses;

      this.filteredProfiles = data.classProfiles;
      this.filteredShields = data.shieldTypes;
    });
  }

  private updatePreview(): void {
    this.validationMessage = '';
    this.preview = null;

    const raw = this.form.getRawValue();

    const weight = this.weightClasses.find((item) => item.id === raw.weightClassId);
    const musculature = this.musculatureClasses.find((item) => item.id === raw.musculatureClassId);
    const size = this.sizeClasses.find((item) => item.id === raw.sizeClassId);
    const race = this.races.find((item) => item.id === raw.raceId);
    const grade = this.grades.find((item) => item.id === raw.gradeId);
    const armorType = this.armorTypes.find((item) => item.id === raw.armorTypeId);
    const shieldType =
      raw.shieldTypeId && raw.shieldTypeId !== 'none'
        ? this.shieldTypes.find((item) => item.id === raw.shieldTypeId) ?? null
        : null;

    if (!weight || !musculature || !size || !race || !grade || !armorType) {
      return;
    }

    if (
      musculature.minWeightClassOrder &&
      (weight.order ?? 0) < musculature.minWeightClassOrder
    ) {
      this.validationMessage =
        'Cette musculature est incompatible avec la catégorie de poids choisie.';
      return;
    }

    if (
      race.requiredWeightIds?.length &&
      !race.requiredWeightIds.includes(weight.id ?? '')
    ) {
      this.validationMessage =
        'Cette race impose une catégorie de poids spécifique.';
      return;
    }

    if (
      race.requiredMusculatureIds?.length &&
      !race.requiredMusculatureIds.includes(musculature.id ?? '')
    ) {
      this.validationMessage =
        'Cette race impose une musculature spécifique.';
      return;
    }

    if (shieldType && !armorType.shieldAllowed) {
      this.validationMessage =
        'Ce type de bouclier n’est pas autorisé avec cette armure.';
      return;
    }

    this.preview = calculateCharacterStats({
      weight,
      musculature,
      size,
      race,
      grade,
      armorType,
      shieldType,
    });
  }

  async submit(): Promise<void> {
    this.form.markAllAsTouched();

    if (this.form.invalid || !this.preview || this.validationMessage) {
      return;
    }

    this.isSaving = true;

    const raw = this.form.getRawValue();

    const nonMysticClasses = ['heavy-fighter', 'light-fighter', 'shooter'];
    const mystique = !nonMysticClasses.includes(raw.classId);

    const payload: Omit<Character, 'id' | 'createdAt' | 'updatedAt'> = {
      name: raw.name.trim(),
      surname: raw.surname?.trim() || '',

      raceId: raw.raceId,
      classId: raw.classId,
      classProfiles: raw.classProfiles || null,

      gradeId: raw.gradeId,

      weightClassId: raw.weightClassId,
      musculatureClassId: raw.musculatureClassId,
      sizeClassId: raw.sizeClassId,

      armorTypeId: raw.armorTypeId,
      shieldTypeId: raw.shieldTypeId === 'none' ? null : raw.shieldTypeId,

      hasPet: raw.hasPet,
      mystique: mystique,
      lvl: Number(raw.lvl),
      xp: Number(raw.xp),
      ressource: Number(raw.ressource),

      maxHp: this.preview.maxHp,
      currentHp: this.preview.currentHp,
      armor: this.preview.armor,
      dodge: this.preview.dodge,
      agility: this.preview.agility,
      perception: this.preview.perception,
      luckpoint: this.preview.luckpoint,
      hasShoulderPads: this.preview.hasShoulderPads,

     /**  inventory: [],
      passives: [], */
      isActive: true,
    };

    try {
      await this.charactersService.addCharacter(payload);
      this.router.navigate(['/characters']);
    } finally {
      this.isSaving = false;
    }
  }
}