import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CharactersComponent } from './pages/characters/characters.component';
import { CharacterDetailComponent } from './pages/character-detail/character-detail.component';
import { CharactersCreationComponent } from './pages/characters-creation/characters-creation.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'characters', component: CharactersComponent },
  { path: 'characters/create', component: CharactersCreationComponent },
  { path: 'characters/:id', component: CharacterDetailComponent },
  { path: '**', redirectTo: '' },
];