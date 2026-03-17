import { Injectable, inject } from '@angular/core';
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

  async loginWithGoogle(): Promise<void> {
    const credential = await signInWithPopup(this.auth, this.provider);

    if (credential.user) {
      await this.usersService.ensureUserDocument(credential.user);
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }
}
