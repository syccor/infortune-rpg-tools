import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, serverTimestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Character } from '../models/character.model';

@Injectable({
  providedIn: 'root',
})
export class CharactersService {
  private readonly firestore = inject(Firestore);
  private readonly charactersCollection = collection(this.firestore, 'characters');

  getCharacters(): Observable<Character[]> {
    return collectionData(this.charactersCollection, {
      idField: 'id',
    }) as Observable<Character[]>;
  }

  addCharacter(character: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>) {
    return addDoc(this.charactersCollection, {
      ...character,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}