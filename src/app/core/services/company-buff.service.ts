import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  doc,
  docData,
  serverTimestamp,
  setDoc,
} from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';
import { CompanyBuffId, CompanyBuffState } from '@models/company-buff.model';

@Injectable({
  providedIn: 'root',
})
export class CompanyBuffService {
  private readonly firestore = inject(Firestore);
  private readonly buffDocRef = doc(this.firestore, 'activeBuff', 'current');

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

  async setActiveBuff(activeBuff: CompanyBuffId): Promise<void> {
    await setDoc(
      this.buffDocRef,
      {
        activeBuff,
        activatedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }

  async clearBuff(): Promise<void> {
    await this.setActiveBuff('none');
  }
}
