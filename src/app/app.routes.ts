import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CharactersComponent } from './pages/characters/characters.component';
import { CharacterDetailComponent } from './pages/character-detail/character-detail.component';
import { CharactersCreationComponent } from './pages/characters-creation/characters-creation.component';
import { CombatComponent } from './pages/combat/combat.component';
import { RerollsComponent } from './pages/rerolls/rerolls.component';
import { CambuseComponent } from './pages/cambuse/cambuse.component';
import { AdminUsersComponent } from './pages/admin-users/admin-users.component';
import { TournamentComponent } from './pages/tournament/tournament.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },

  { path: 'admin/users', component: AdminUsersComponent, canActivate: [adminGuard] },
  { path: 'characters', component: CharactersComponent, canActivate: [authGuard] },
  { path: 'characters/create', component: CharactersCreationComponent, canActivate: [authGuard] },
  { path: 'characters/:id', component: CharacterDetailComponent, canActivate: [authGuard] },
  { path: 'rerolls', component: RerollsComponent, canActivate: [authGuard] },
  { path: 'combat', component: CombatComponent, canActivate: [authGuard] },
  { path: 'cambuse', component: CambuseComponent, canActivate: [adminGuard] },
  { path: 'tournament', component: TournamentComponent, canActivate: [authGuard] },

  { path: '**', redirectTo: '' },
];
