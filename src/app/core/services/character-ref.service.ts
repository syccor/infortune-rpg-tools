import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import {
  ArmorType,
  ClassProfile,
  GameClass,
  Grade,
  MusculatureClass,
  Race,
  ShieldType,
  SizeClass,
  WeightClass,
} from '../models/reference.model';

@Injectable({
  providedIn: 'root',
})
export class CharacterRefsService {
  private readonly firestore = inject(Firestore);

  getClasses(): Observable<GameClass[]> {
    return collectionData(collection(this.firestore, 'classes'), {
      idField: 'id',
    }) as Observable<GameClass[]>;
  }

  getClassProfiles(): Observable<ClassProfile[]> {
    return collectionData(collection(this.firestore, 'classProfiles'), {
      idField: 'id',
    }) as Observable<ClassProfile[]>;
  }

  getRaces(): Observable<Race[]> {
    return collectionData(collection(this.firestore, 'races'), {
      idField: 'id',
    }) as Observable<Race[]>;
  }

  getGrades(): Observable<Grade[]> {
    return collectionData(collection(this.firestore, 'grades'), {
      idField: 'id',
    }) as Observable<Grade[]>;
  }

  getWeightClasses(): Observable<WeightClass[]> {
    return collectionData(collection(this.firestore, 'weightClasses'), {
      idField: 'id',
    }) as Observable<WeightClass[]>;
  }

  getMusculatureClasses(): Observable<MusculatureClass[]> {
    return collectionData(collection(this.firestore, 'musculatureClasses'), {
      idField: 'id',
    }) as Observable<MusculatureClass[]>;
  }

  getSizeClasses(): Observable<SizeClass[]> {
    return collectionData(collection(this.firestore, 'sizeClasses'), {
      idField: 'id',
    }) as Observable<SizeClass[]>;
  }

  getArmorTypes(): Observable<ArmorType[]> {
    return collectionData(collection(this.firestore, 'armorTypes'), {
      idField: 'id',
    }) as Observable<ArmorType[]>;
  }

  getShieldTypes(): Observable<ShieldType[]> {
    return collectionData(collection(this.firestore, 'shieldTypes'), {
      idField: 'id',
    }) as Observable<ShieldType[]>;
  }
}