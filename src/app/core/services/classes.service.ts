import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { GameClass } from '../models/class.model';

@Injectable({
  providedIn: 'root',
})
export class ClassesService {
  private readonly firestore = inject(Firestore);
  private readonly classesCollection = collection(this.firestore, 'classes');

  getClasses(): Observable<GameClass[]> {
    return collectionData(this.classesCollection, {
      idField: 'id',
    }) as Observable<GameClass[]>;
  }
}