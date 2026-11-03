import { Injectable, inject, signal } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  authState,
  signInWithPopup,
  signOut,
  User,
} from '@angular/fire/auth';
import { Observable, of, switchMap } from 'rxjs';
import { UsersService, AppUser } from './users.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly provider = new GoogleAuthProvider();
  private readonly usersService = inject(UsersService);

  readonly user$: Observable<User | null> = authState(this.auth);

  readonly appUser$: Observable<AppUser | null> = this.user$.pipe(
    switchMap((user) => {
      if (!user) {
        return of(null);
      }

      return this.usersService.getUser(user.uid).pipe(switchMap((appUser) => of(appUser ?? null)));
    }),
  );

  /** Message affiché à l'utilisateur quand la connexion ou l'enregistrement du profil échoue. */
  readonly authError = signal<string | null>(null);

  async loginWithGoogle(): Promise<void> {
    this.authError.set(null);

    let credential;
    try {
      credential = await signInWithPopup(this.auth, this.provider);
    } catch (error) {
      console.error(error);
      const code = (error as { code?: string }).code;
      // Fenêtre fermée volontairement : pas d'erreur à afficher.
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        this.authError.set('La connexion avec Google a échoué. Réessaie dans un instant.');
      }
      return;
    }

    if (!credential.user) {
      return;
    }

    try {
      await this.usersService.ensureUserDocument(credential.user);
    } catch (error) {
      console.error(error);
      this.authError.set(
        'Tu es connecté, mais ton profil n’a pas pu être enregistré : tu n’apparaîtras pas dans ' +
          'l’administration et ne pourras pas recevoir de rôle. Déconnecte-toi puis reconnecte-toi ' +
          '(désactive un éventuel bloqueur de publicité) ; si ça persiste, préviens un administrateur.',
      );
    }
  }

  clearAuthError(): void {
    this.authError.set(null);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }
}
