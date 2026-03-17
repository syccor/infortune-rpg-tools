import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  getDocs,
  deleteDoc,
  writeBatch,
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { Character } from '../models/character.model';

@Injectable({
  providedIn: 'root',
})
export class CharactersService {
  private readonly firestore = inject(Firestore);
  private readonly charactersCollection = collection(this.firestore, 'characters');
  private readonly auth = inject(Auth);

  getCharacters(): Observable<Character[]> {
    return collectionData(this.charactersCollection, {
      idField: 'id',
    }) as Observable<Character[]>;
  }

  addCharacter(character: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>) {
    const user = this.auth.currentUser;

    if (!user) {
      throw new Error('Utilisateur non connecté');
    }
    return addDoc(this.charactersCollection, {
      ...character,
      isDead: false,
      ownerUid: user.uid,
      ownerEmail: user.email ?? null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  updateCharacterCombatState(
    characterId: string,
    data: {
      currentHp: number;
      healCapState: 'none' | 'cap50' | 'cap25';
      isDead?: boolean;
    },
  ) {
    const ref = doc(this.firestore, 'characters', characterId);
    return updateDoc(ref, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }
  private getTodayDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private diffDaysBetween(fromDateString: string, toDateString: string): number {
    const from = new Date(`${fromDateString}T00:00:00`);
    const to = new Date(`${toDateString}T00:00:00`);

    const diffMs = to.getTime() - from.getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  }

  async applyDailyRegenToAllCharacters(): Promise<number> {
    const snapshot = await getDocs(this.charactersCollection);
    const today = this.getTodayDateString();
    const batch = writeBatch(this.firestore);

    let updatedCount = 0;

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as any;
      const isDead = data.isDead ?? false;
      const pet = data.pet ?? null;

      if (isDead) {
        return;
      }
      const maxHp = Number(data.maxHp ?? 0);
      const currentHp = Number(data.currentHp ?? 0);
      const lastDailyRegenAt = data.lastDailyRegenAt ?? null;

      if (maxHp <= 0 || currentHp >= maxHp) {
        if (lastDailyRegenAt !== today) {
          batch.update(docSnap.ref, {
            lastDailyRegenAt: today,
            updatedAt: serverTimestamp(),
          });
          updatedCount++;
        }
        return;
      }

      let missedDays = 1;

      if (lastDailyRegenAt) {
        missedDays = this.diffDaysBetween(lastDailyRegenAt, today);
      }

      if (missedDays <= 0) {
        return;
      }

      const regenPerDay = Math.floor(maxHp * 0.1);
      const totalRegen = regenPerDay * missedDays;
      const newHp = Math.min(maxHp, currentHp + totalRegen);

      let updatedPet = pet;

      if (pet && !pet.isDead) {
        const petMaxHp = Number(pet.maxHp ?? 0);
        const petCurrentHp = Number(pet.currentHp ?? 0);
        const petLastDailyRegenAt = pet.lastDailyRegenAt ?? null;

        let petMissedDays = 1;

        if (petLastDailyRegenAt) {
          petMissedDays = this.diffDaysBetween(petLastDailyRegenAt, today);
        }

        if (petMissedDays > 0 && petCurrentHp < petMaxHp) {
          const petRegenPerDay = Math.floor(petMaxHp * 0.1);
          const petTotalRegen = petRegenPerDay * petMissedDays;
          const petNewHp = Math.min(petMaxHp, petCurrentHp + petTotalRegen);

          updatedPet = {
            ...pet,
            currentHp: petNewHp,
            lastDailyRegenAt: today,
          };
        } else if (petLastDailyRegenAt !== today) {
          updatedPet = {
            ...pet,
            lastDailyRegenAt: today,
          };
        }
      }

      batch.update(docSnap.ref, {
        currentHp: newHp,
        lastDailyRegenAt: today,
        pet: updatedPet,
        updatedAt: serverTimestamp(),
      });
      updatedCount++;
    });

    if (updatedCount > 0) {
      await batch.commit();
    }

    return updatedCount;
  }

  async activateCharacter(characterId: string): Promise<void> {
    const ref = doc(this.firestore, 'characters', characterId);

    await updateDoc(ref, {
      status: 'active',
      isActive: true,
      updatedAt: serverTimestamp(),
    });
  }

  async deleteCharacter(characterId: string): Promise<void> {
    const ref = doc(this.firestore, 'characters', characterId);
    await deleteDoc(ref);
  }

  async updatePetCombatState(
    characterId: string,
    data: {
      currentHp: number;
      isDead?: boolean;
      healCapState?: 'none' | 'cap50' | 'cap25';
    },
  ): Promise<void> {
    const snapshot = await getDoc(doc(this.firestore, 'characters', characterId));
    const character = snapshot.data() as Character | undefined;

    if (!character?.pet) {
      throw new Error('Familier introuvable');
    }

    const updatedPet = {
      ...character.pet,
      currentHp: data.currentHp,
      healCapState: data.healCapState ?? character.pet.healCapState ?? 'none',
      isDead: data.isDead ?? character.pet.isDead ?? false,
    };

    const ref = doc(this.firestore, 'characters', characterId);

    await updateDoc(ref, {
      pet: updatedPet,
      updatedAt: serverTimestamp(),
    });
  }
}
