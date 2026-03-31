import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Auth, user } from '@angular/fire/auth';
import { AuthService } from '@services/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { combineLatest, firstValueFrom, map } from 'rxjs';

import { CharactersService } from '@services/characters.service';
import { GameDataService } from '@services/game-data.service';
import { TournamentProfilesService } from '@services/tournament-profiles.service';
import {
  getTechniqueSlots,
  TOURNAMENT_FATIGUE_TIERS,
  TOURNAMENT_FIGHTER_STYLES,
  TOURNAMENT_SKILL_TIERS,
  TOURNAMENT_TECHNIQUES,
  TOURNAMENT_WEAPON_STYLES,
  TournamentRaceKey,
  TournamentSimulationConfig,
  TournamentWeaponStyle,
  TournamentCombatMode,
  TournamentProfile,
  TournamentFighterTechnique,
} from '@models/tournament.model';

import { simulateTournamentFight, simulateTournamentPrediction } from '@utils/tournament-simulator';

interface TournamentCharacterView {
  id: string;
  name: string;
  raceLabel: string;
  ownerUid?: string;
  hasProfile: boolean;
  profile?: TournamentProfile | null;
}

@Component({
  selector: 'app-tournament',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tournament.component.html',
  styleUrls: ['./tournament.component.scss'],
})
export class TournamentComponent {
  private readonly fb = inject(FormBuilder);
  private readonly charactersService = inject(CharactersService);
  private readonly gameDataService = inject(GameDataService);
  private readonly tournamentProfilesService = inject(TournamentProfilesService);
  private readonly auth = inject(Auth);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);

  readonly skillOptions = TOURNAMENT_SKILL_TIERS;
  readonly styleOptions = TOURNAMENT_FIGHTER_STYLES;
  readonly fatigueOptions = TOURNAMENT_FATIGUE_TIERS;
  readonly weaponOptions = TOURNAMENT_WEAPON_STYLES.filter((item) => item.id !== 'none');
  readonly armedTechniques = TOURNAMENT_TECHNIQUES.filter((item) => item.mode === 'armed' || item.mode === 'both');
  readonly unarmedTechniques = TOURNAMENT_TECHNIQUES.filter((item) => item.mode === 'unarmed' || item.mode === 'both');

  activeTab: 'profiles' | 'simulation' = 'profiles';
  profileMessage = '';
  simulationMessage = '';
  isSavingProfile = false;
  simulationResult: ReturnType<typeof simulateTournamentFight> | null = null;
  predictionResult: ReturnType<typeof simulateTournamentPrediction> | null = null;

  private cachedCharacters: TournamentCharacterView[] = [];

  readonly profileForm = this.fb.group({
    characterId: ['', Validators.required],
    armedSkillTier: ['correct', Validators.required],
    armedFighterStyle: ['balanced', Validators.required],
    armedFatigueTier: ['normal', Validators.required],
    weaponStyle: ['one-handed', Validators.required],
    armedTechniques: this.fb.nonNullable.control<TournamentFighterTechnique[]>([]),
    unarmedEnabled: [false, Validators.required],
    unarmedSkillTier: ['correct', Validators.required],
    unarmedFighterStyle: ['balanced', Validators.required],
    unarmedFatigueTier: ['normal', Validators.required],
    unarmedTechniques: this.fb.nonNullable.control<TournamentFighterTechnique[]>([]),
  });

  readonly duelForm = this.fb.group({
    leftCharacterId: ['', Validators.required],
    rightCharacterId: ['', Validators.required],
    mode: ['armed' as TournamentCombatMode, Validators.required],
    predictionCount: [20, Validators.required],
    targetScore: [3 as 3 | 5, Validators.required],
  });

  readonly characters$ = combineLatest([
    this.charactersService.getCharacters(),
    this.gameDataService.getCreationData(),
    this.tournamentProfilesService.getProfiles(),
  ]).pipe(
    map(([characters, refs, profiles]) => {
      const raceMap = new Map(refs.races.map((item) => [item.id, item.label]));
      const profilesMap = new Map(profiles.map((item) => [item.characterId, item]));

      return characters
        .filter((character) => (character.status ?? 'active') === 'active' && !!character.id)
        .map((character) => ({
          id: character.id!,
          name: character.name,
          raceLabel: raceMap.get(character.raceId) ?? character.raceId,
          ownerUid: character.ownerUid,
          hasProfile: profilesMap.has(character.id!),
          profile: profilesMap.get(character.id!) ?? null,
        }));
    }),
  );

  readonly techniqueLabelMap = new Map(
    TOURNAMENT_TECHNIQUES.map((technique) => [technique.id, technique.label]),
  );

  readonly ownCharacters$ = combineLatest([
    this.characters$,
    this.authService.user$,
    this.authService.appUser$,
  ]).pipe(
  map(([characters, firebaseUser, appUser]) => {
    const role = appUser?.role ?? null;

    if (!role) {
      return [];
    }

    if (role === 'mj' || role === 'dev') {
      return characters;
    }

    if (role === 'pj' && firebaseUser) {
      return characters.filter((item) => item.ownerUid === firebaseUser.uid);
    }

    return [];
  }),
);

  readonly duelCandidates$ = this.characters$.pipe(
    map((characters) => characters.filter((item) => item.hasProfile)),
  );

  constructor() {
    this.characters$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((characters) => {
      this.cachedCharacters = characters;
    });

    this.profileForm.controls.characterId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((characterId) => {
        if (!characterId) return;
        void this.loadProfile(characterId);
      });
  }

  getArmedSlots(): number {
    return getTechniqueSlots(this.profileForm.controls.armedSkillTier.value as any);
  }

  getUnarmedSlots(): number {
    return getTechniqueSlots(this.profileForm.controls.unarmedSkillTier.value as any);
  }

  isTechniqueChecked(controlName: 'armedTechniques' | 'unarmedTechniques', techniqueId: TournamentFighterTechnique): boolean {
    return this.profileForm.controls[controlName].value.includes(techniqueId);
  }

  isTechniqueDisabled(controlName: 'armedTechniques' | 'unarmedTechniques', techniqueId: TournamentFighterTechnique): boolean {
    const selected = this.profileForm.controls[controlName].value;
    const slots = controlName === 'armedTechniques' ? this.getArmedSlots() : this.getUnarmedSlots();
    return !selected.includes(techniqueId) && selected.length >= slots;
  }

  toggleTechnique(controlName: 'armedTechniques' | 'unarmedTechniques', techniqueId: TournamentFighterTechnique): void {
    const control = this.profileForm.controls[controlName];
    const current = control.value;
    if (current.includes(techniqueId)) {
      control.setValue(current.filter((item) => item !== techniqueId));
      return;
    }

    const slots = controlName === 'armedTechniques' ? this.getArmedSlots() : this.getUnarmedSlots();
    if (current.length >= slots) {
      return;
    }

    control.setValue([...current, techniqueId]);
  }

  async saveProfile(): Promise<void> {
    if (this.profileForm.invalid) {
      this.profileMessage = 'Le profil tournoi est incomplet.';
      return;
    }

    const raw = this.profileForm.getRawValue();
    this.isSavingProfile = true;
    this.profileMessage = '';

    try {
      const character = this.cachedCharacters.find((item) => item.id === raw.characterId);
      if (!character) {
        throw new Error('Personnage introuvable.');
      }

      const profile: TournamentProfile = {
        characterId: raw.characterId!,
        characterName: character.name,
        armed: {
          skillTier: raw.armedSkillTier as any,
          fighterStyle: raw.armedFighterStyle as any,
          fatigueTier: raw.armedFatigueTier as any,
          weaponStyle: raw.weaponStyle as any,
          techniques: raw.armedTechniques.slice(0, this.getArmedSlots()),
        },
        unarmed: {
          enabled: !!raw.unarmedEnabled,
          skillTier: raw.unarmedSkillTier as any,
          fighterStyle: raw.unarmedFighterStyle as any,
          fatigueTier: raw.unarmedFatigueTier as any,
          techniques: raw.unarmedTechniques.slice(0, this.getUnarmedSlots()),
        },
      };

      await this.tournamentProfilesService.upsertProfile(profile);
      this.profileMessage = 'Profil tournoi enregistré.';
    } catch (error) {
      console.error(error);
      this.profileMessage = 'Erreur lors de l’enregistrement du profil tournoi.';
    } finally {
      this.isSavingProfile = false;
    }
  }

  async runSimulation(): Promise<void> {
    this.simulationMessage = '';
    this.predictionResult = null;

    const request = await this.buildSimulationRequest();
    if (!request) {
      return;
    }

    this.simulationResult = simulateTournamentFight(request);
  }

  async runPrediction(): Promise<void> {
    this.simulationMessage = '';
    this.simulationResult = null;

    const request = await this.buildSimulationRequest();
    if (!request) {
      return;
    }

    const total = Number(this.duelForm.controls.predictionCount.value ?? 20);
    this.predictionResult = simulateTournamentPrediction(request, total);
  }

  private async buildSimulationRequest(): Promise<TournamentSimulationConfig | null> {
    const raw = this.duelForm.getRawValue();

    if (!raw.leftCharacterId || !raw.rightCharacterId) {
      this.simulationMessage = 'Sélectionne deux personnages.';
      return null;
    }

    if (raw.leftCharacterId === raw.rightCharacterId) {
      this.simulationMessage = 'Le tournoi demande deux personnages différents.';
      return null;
    }

    const left = this.cachedCharacters.find((item) => item.id === raw.leftCharacterId);
    const right = this.cachedCharacters.find((item) => item.id === raw.rightCharacterId);

    if (!left || !right || !left.profile || !right.profile) {
      this.simulationMessage = 'Un des deux personnages n’a pas encore de profil tournoi.';
      return null;
    }

    const mode: TournamentCombatMode = raw.mode ?? 'armed';

    if (mode === 'unarmed' && (!left.profile.unarmed.enabled || !right.profile.unarmed.enabled)) {
      this.simulationMessage = 'Le mode sans armes demande un profil sans armes pour les deux personnages.';
      return null;
    }

    return {
      fighterA: {
        name: left.name,
        race: this.mapRaceLabelToTournamentRace(left.raceLabel),
        combatMode: mode,
        weaponStyle: this.mapWeaponStyle(left.profile, mode),
        fighterProfile:
          mode === 'unarmed'
            ? (left.profile.unarmed.skillTier as any)
            : (left.profile.armed.skillTier as any),
        combatStyle:
          mode === 'unarmed'
            ? (left.profile.unarmed.fighterStyle as any)
            : (left.profile.armed.fighterStyle as any),
        fatigueProfile:
          mode === 'unarmed'
            ? (left.profile.unarmed.fatigueTier as any)
            : (left.profile.armed.fatigueTier as any),
        techniques:
          mode === 'unarmed'
            ? left.profile.unarmed.techniques
            : left.profile.armed.techniques,
      },
      fighterB: {
        name: right.name,
        race: this.mapRaceLabelToTournamentRace(right.raceLabel),
        combatMode: mode,
        weaponStyle: this.mapWeaponStyle(right.profile, mode),
        fighterProfile:
          mode === 'unarmed'
            ? (right.profile.unarmed.skillTier as any)
            : (right.profile.armed.skillTier as any),
        combatStyle:
          mode === 'unarmed'
            ? (right.profile.unarmed.fighterStyle as any)
            : (right.profile.armed.fighterStyle as any),
        fatigueProfile:
          mode === 'unarmed'
            ? (right.profile.unarmed.fatigueTier as any)
            : (right.profile.armed.fatigueTier as any),
        techniques:
          mode === 'unarmed'
            ? right.profile.unarmed.techniques
            : right.profile.armed.techniques,
      },
      targetScore: (raw.targetScore ?? 3) as 3 | 5,
    };
  }

  private mapWeaponStyle(profile: TournamentProfile, mode: TournamentCombatMode): TournamentWeaponStyle {
    if (mode === 'unarmed') {
      return 'none';
    }

    return profile.armed.weaponStyle as TournamentWeaponStyle;
  }

  private mapRaceLabelToTournamentRace(raceLabel: string): TournamentRaceKey {
    const label = raceLabel.toLowerCase();

    if (label.includes('humain')) return 'human';
    if (label.includes('kaldorei')) return 'kaldorei';
    if (label.includes('nain')) return 'dwarf';
    if (label.includes('gnome')) return 'gnome';
    if (label.includes('draene')) return 'draenei';
    if (label.includes('pandaren')) return 'pandaren';
    if (label.includes('worgen')) return 'worgen';
    if (
      label.includes('elfe') ||
      label.includes("sin’dorei") ||
      label.includes("sin'dorei") ||
      label.includes("quel’dorei") ||
      label.includes("quel'dorei") ||
      label.includes("ren’dorei") ||
      label.includes("ren'dorei")
    ) {
      return 'elf';
    }

    return 'human';
  }

  private async loadProfile(characterId: string): Promise<void> {
    const profile = await firstValueFrom(this.tournamentProfilesService.getProfileByCharacterId(characterId));
    if (!profile) {
      this.profileForm.patchValue({
        armedSkillTier: 'correct',
        armedFighterStyle: 'balanced',
        armedFatigueTier: 'normal',
        weaponStyle: 'one-handed',
        armedTechniques: [],
        unarmedEnabled: false,
        unarmedSkillTier: 'correct',
        unarmedFighterStyle: 'balanced',
        unarmedFatigueTier: 'normal',
        unarmedTechniques: [],
      });
      return;
    }

    this.profileForm.patchValue({
      armedSkillTier: profile.armed.skillTier,
      armedFighterStyle: profile.armed.fighterStyle,
      armedFatigueTier: profile.armed.fatigueTier,
      weaponStyle: profile.armed.weaponStyle,
      armedTechniques: profile.armed.techniques,
      unarmedEnabled: profile.unarmed.enabled,
      unarmedSkillTier: profile.unarmed.skillTier,
      unarmedFighterStyle: profile.unarmed.fighterStyle,
      unarmedFatigueTier: profile.unarmed.fatigueTier,
      unarmedTechniques: profile.unarmed.techniques,
    }, { emitEvent: false });
  }

  get leftCharacterName(): string {
    const id = this.duelForm.controls.leftCharacterId.value;
    return this.cachedCharacters.find((item) => item.id === id)?.name ?? 'Gauche';
  }

  get rightCharacterName(): string {
    const id = this.duelForm.controls.rightCharacterId.value;
    return this.cachedCharacters.find((item) => item.id === id)?.name ?? 'Droite';
  }

  getTechniqueLabel(techniqueId: string | null | undefined): string {
    if (!techniqueId) {
      return 'Aucune';
    }

    return this.techniqueLabelMap.get(techniqueId as TournamentFighterTechnique) ?? techniqueId;
  }
}
