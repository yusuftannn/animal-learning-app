import { collection, getDocs, query, where } from 'firebase/firestore';

import { db, isFirebaseConfigured } from '../../../shared/config/firebase';

import { fallbackAnimals } from './localAnimalData';
import type { Animal } from '../types/animal.types';

const ANIMALS_COLLECTION = 'animals';
const FIREBASE_LOAD_TIMEOUT_MS = 4500;

const withTimeout = async <T,>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('Firebase animal load timed out.'));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};

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

    try {
      const snapshot = await withTimeout(
        getDocs(animalsQuery),
        FIREBASE_LOAD_TIMEOUT_MS,
      );
      const animals = snapshot.docs.map((doc) => toAnimal(doc.id, doc.data()));

      return animals.length >= 2 ? animals : fallbackAnimals;
    } catch {
      return fallbackAnimals;
    }
  },
};
