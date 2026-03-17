import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { User } from '@angular/fire/auth';
import { Observable } from 'rxjs';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role?: 'dev' | 'mj' | 'pj' | null;
  createdAt?: unknown;
  updatedAt?: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly firestore = inject(Firestore);

  async ensureUserDocument(user: User): Promise<void> {
    const ref = doc(this.firestore, 'users', user.uid);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      await setDoc(ref, {
        uid: user.uid,
        email: user.email ?? null,
        displayName: user.displayName ?? null,
        role: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return;
    }

    await updateDoc(ref, {
      email: user.email ?? null,
      displayName: user.displayName ?? null,
      updatedAt: serverTimestamp(),
    });
  }

  getUser(uid: string): Observable<AppUser | undefined> {
    const ref = doc(this.firestore, 'users', uid);
    return docData(ref) as Observable<AppUser | undefined>;
  }

  getUsers(): Observable<AppUser[]> {
    const ref = collection(this.firestore, 'users');
    return collectionData(ref, { idField: 'uid' }) as Observable<AppUser[]>;
  }

  async assignRole(uid: string, role: 'pj' | 'mj'): Promise<void> {
    const ref = doc(this.firestore, 'users', uid);

    await updateDoc(ref, {
      role,
      updatedAt: serverTimestamp(),
    });
  }
}
