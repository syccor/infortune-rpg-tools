import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  serverTimestamp,
  setDoc,
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { map, Observable } from 'rxjs';
import { TournamentProfile } from '../models/tournament.model';

@Injectable({
  providedIn: 'root',
})
export class TournamentProfilesService {
  private readonly firestore = inject(Firestore);
  private readonly auth = inject(Auth);
  private readonly collectionRef = collection(this.firestore, 'tournamentProfiles');

  getProfiles(): Observable<TournamentProfile[]> {
    return collectionData(this.collectionRef, { idField: 'characterId' }) as Observable<TournamentProfile[]>;
  }

  getProfileByCharacterId(characterId: string): Observable<TournamentProfile | null> {
    return docData(doc(this.firestore, 'tournamentProfiles', characterId), { idField: 'characterId' }).pipe(
      map((data) => (data as TournamentProfile | undefined) ?? null),
    );
  }

  async upsertProfile(profile: TournamentProfile): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    const ref = doc(this.firestore, 'tournamentProfiles', profile.characterId);
    await setDoc(
      ref,
      {
        ...profile,
        ownerUid: user.uid,
        ownerEmail: user.email ?? null,
        createdAt: profile.createdAt ?? serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }
}
