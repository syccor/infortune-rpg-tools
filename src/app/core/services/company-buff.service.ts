import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  docData,
  getDocs,
  serverTimestamp,
  setDoc,
  writeBatch,
} from '@angular/fire/firestore';
import { firstValueFrom, map, Observable } from 'rxjs';
import {
  Character,
  Pet,
} from '@models/character.model';
import {
  CompanyBuffId,
  CompanyBuffState,
} from '@models/company-buff.model';

@Injectable({
  providedIn: 'root',
})
export class CompanyBuffService {
  private readonly firestore = inject(Firestore);
  private readonly buffDocRef = doc(this.firestore, 'company', 'companyBuff');
  private readonly charactersCollection = collection(this.firestore, 'characters');

  getBuffState(): Observable<CompanyBuffState> {
    return docData(this.buffDocRef).pipe(
      map((data) => {
        const buff = data as CompanyBuffState | undefined;

        return {
          activeBuff: buff?.activeBuff ?? 'none',
          activatedAt: buff?.activatedAt,
          updatedAt: buff?.updatedAt,
        };
      }),
    );
  }

  async setActiveBuff(nextBuff: CompanyBuffId): Promise<void> {
    const currentState = await firstValueFrom(this.getBuffState());
    const previousBuff = currentState.activeBuff;

    if (previousBuff === nextBuff) {
      return;
    }

    await this.applyComfortingStewCurrentHpDelta(previousBuff, nextBuff);

    await setDoc(
      this.buffDocRef,
      {
        activeBuff: nextBuff,
        activatedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }

  async clearBuff(): Promise<void> {
    await this.setActiveBuff('none');
  }

  private async applyComfortingStewCurrentHpDelta(
    previousBuff: CompanyBuffId,
    nextBuff: CompanyBuffId,
  ): Promise<void> {
    const wasStewActive = previousBuff === 'comforting-stew';
    const isStewActive = nextBuff === 'comforting-stew';

    if (wasStewActive === isStewActive) {
      return;
    }

    const delta = isStewActive ? 15 : -15;
    const snapshot = await getDocs(this.charactersCollection);

    if (snapshot.empty) {
      return;
    }

    const batch = writeBatch(this.firestore);

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as Character;

      const baseMaxHp = Number(data.maxHp ?? 0);
      const fallbackCurrentHp = baseMaxHp;
      const currentHp = Number(data.currentHp ?? fallbackCurrentHp);
      const nextMaxHp = isStewActive ? baseMaxHp + 15 : baseMaxHp;
      const nextCurrentHp = this.clamp(currentHp + delta, 0, nextMaxHp);

      const payload: Partial<Character> & {
        pet?: Pet | null;
        updatedAt: unknown;
      } = {
        currentHp: nextCurrentHp,
        updatedAt: serverTimestamp(),
      };

      if (data.pet) {
        const pet = data.pet;
        const petBaseMaxHp = Number(pet.maxHp ?? 0);
        const petFallbackCurrentHp = petBaseMaxHp;
        const petCurrentHp = Number(pet.currentHp ?? petFallbackCurrentHp);
        const petNextMaxHp = isStewActive ? petBaseMaxHp + 15 : petBaseMaxHp;
        const petNextCurrentHp = this.clamp(
          petCurrentHp + delta,
          0,
          petNextMaxHp,
        );

        payload.pet = {
          ...pet,
          currentHp: petNextCurrentHp,
        };
      }

      batch.update(docSnap.ref, payload);
    });

    await batch.commit();
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}