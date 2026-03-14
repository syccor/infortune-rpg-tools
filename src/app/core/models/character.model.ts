export interface CharacterInventoryItem {
  itemId: string;
  quantity: number;
}

export interface Character {
  id?: string;
  name: string;
  classId: string;
  classProfiles: string | null;

  maxHp: number;
  currentHp: number;
  dailyRegen: number;

  armor: number;
  dodge: number;
  luck: number;

  passives: string[];
  inventory: CharacterInventoryItem[];

  isActive: boolean;

  createdAt?: unknown;
  updatedAt?: unknown;
}