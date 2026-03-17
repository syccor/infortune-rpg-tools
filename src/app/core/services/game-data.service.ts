import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable, combineLatest, map, shareReplay } from 'rxjs';
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
export class GameDataService {
  private readonly firestore = inject(Firestore);

  readonly classes$ = this.getCollection<GameClass>('classes');
  readonly classProfiles$ = this.getCollection<ClassProfile>('classProfiles');
  readonly races$ = this.getCollection<Race>('races');
  readonly grades$ = this.getCollection<Grade>('grades');
  readonly armorTypes$ = this.getCollection<ArmorType>('armorTypes');
  readonly shieldTypes$ = this.getCollection<ShieldType>('shieldTypes');
  readonly weightClasses$ = this.getCollection<WeightClass>('weightClasses');
  readonly musculatureClasses$ = this.getCollection<MusculatureClass>('musculatureClasses');
  readonly sizeClasses$ = this.getCollection<SizeClass>('sizeClasses');

  readonly creationData$ = combineLatest([
    this.classes$,
    this.classProfiles$,
    this.races$,
    this.grades$,
    this.armorTypes$,
    this.shieldTypes$,
    this.weightClasses$,
    this.musculatureClasses$,
    this.sizeClasses$,
  ]).pipe(
    map(
      ([
        classes,
        classProfiles,
        races,
        grades,
        armorTypes,
        shieldTypes,
        weightClasses,
        musculatureClasses,
        sizeClasses,
      ]) => ({
        classes: this.sortByOrder(classes),
        classProfiles: this.sortByOrder(classProfiles),
        races: this.sortByOrder(races),
        grades: this.sortByOrder(grades),
        armorTypes: this.sortByOrder(armorTypes),
        shieldTypes: this.sortByOrder(shieldTypes),
        weightClasses: this.sortByOrder(weightClasses),
        musculatureClasses: this.sortByOrder(musculatureClasses),
        sizeClasses: this.sortByOrder(sizeClasses),
      }),
    ),
    shareReplay(1),
  );

  getClasses(): Observable<GameClass[]> {
    return this.getCollection<GameClass>('classes');
  }

  getClassProfiles(): Observable<ClassProfile[]> {
    return this.getCollection<ClassProfile>('classProfiles');
  }

  getRaces(): Observable<Race[]> {
    return this.getCollection<Race>('races');
  }

  getGrades(): Observable<Grade[]> {
    return this.getCollection<Grade>('grades');
  }

  getArmorTypes(): Observable<ArmorType[]> {
    return this.getCollection<ArmorType>('armorTypes');
  }

  getShieldTypes(): Observable<ShieldType[]> {
    return this.getCollection<ShieldType>('shieldTypes');
  }

  getWeightClasses(): Observable<WeightClass[]> {
    return this.getCollection<WeightClass>('weightClasses');
  }

  getMusculatureClasses(): Observable<MusculatureClass[]> {
    return this.getCollection<MusculatureClass>('musculatureClasses');
  }

  getSizeClasses(): Observable<SizeClass[]> {
    return this.getCollection<SizeClass>('sizeClasses');
  }

  getCreationData() {
    return this.creationData$;
  }

  getClassLabelMap() {
    return this.classes$.pipe(
      map((items) => new Map(items.map((item) => [item.id, item.label]))),
      shareReplay(1),
    );
  }

  getClassProfileLabelMap() {
    return this.classProfiles$.pipe(
      map((items) => new Map(items.map((item) => [item.id, item.label]))),
      shareReplay(1),
    );
  }

  getSubClassesForClass(classId: string) {
    return this.classProfiles$.pipe(
      map((items) => this.sortByOrder(items.filter((item) => item.classId === classId))),
    );
  }

  private getCollection<T>(collectionName: string): Observable<T[]> {
    return collectionData(collection(this.firestore, collectionName), {
      idField: 'id',
    }) as Observable<T[]>;
  }

  private sortByOrder<T extends { order?: number }>(items: T[]): T[] {
    return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }
}
