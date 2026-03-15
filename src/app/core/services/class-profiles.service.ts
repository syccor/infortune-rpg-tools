import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ClassProfile } from '../models/class-profile.model';

@Injectable({
  providedIn: 'root',
})
export class ClassProfilesService {
  private readonly firestore = inject(Firestore);
  private readonly classProfilesCollection = collection(this.firestore, 'classProfiles');

  getClassProfiles(): Observable<ClassProfile[]> {
    return collectionData(this.classProfilesCollection, {
      idField: 'id',
    }) as Observable<ClassProfile[]>;
  }
}