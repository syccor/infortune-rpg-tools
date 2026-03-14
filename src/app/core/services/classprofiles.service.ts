import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Classprofile } from '../models/classprofile.model';

@Injectable({
  providedIn: 'root',
})
export class ClassprofilesService {
  private readonly firestore = inject(Firestore);
  private readonly classprofilesCollection = collection(this.firestore, 'classProfiles');

  getSubprofiles(): Observable<Classprofile[]> {
    return collectionData(this.classprofilesCollection, {
      idField: 'id',
    }) as Observable<Classprofile[]>;
  }
}