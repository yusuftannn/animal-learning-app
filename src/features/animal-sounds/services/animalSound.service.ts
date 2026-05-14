import { collection, getDocs, query, where } from 'firebase/firestore';

import { db, isFirebaseConfigured } from '../../../shared/config/firebase';

import { fallbackAnimals } from './localAnimalData';
import type { Animal } from '../types/animal.types';

const ANIMALS_COLLECTION = 'animals';

const toAnimal = (id: string, data: Record<string, unknown>): Animal => ({
  id,
  name: String(data.name ?? ''),
  emoji: String(data.emoji ?? '🐾'),
  soundUrl: String(data.soundUrl ?? ''),
  category: String(data.category ?? 'Genel'),
  difficulty: (data.difficulty as Animal['difficulty']) ?? 'easy',
  isActive: Boolean(data.isActive ?? true),
});

export const animalSoundService = {
  async getAnimals(): Promise<Animal[]> {
    if (!isFirebaseConfigured || !db) {
      return fallbackAnimals;
    }

    const animalsQuery = query(
      collection(db, ANIMALS_COLLECTION),
      where('isActive', '==', true),
    );
    const snapshot = await getDocs(animalsQuery);
    const animals = snapshot.docs.map((doc) => toAnimal(doc.id, doc.data()));

    return animals.length > 0 ? animals : fallbackAnimals;
  },
};
