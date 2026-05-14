import type { Animal } from '../types/animal.types';

export const fallbackAnimals: Animal[] = [
  {
    id: 'cat',
    name: 'Kedi',
    emoji: '🐱',
    soundUrl: '',
    category: 'Evcil',
    difficulty: 'easy',
    isActive: true,
  },
  {
    id: 'dog',
    name: 'Köpek',
    emoji: '🐶',
    soundUrl: '',
    category: 'Evcil',
    difficulty: 'easy',
    isActive: true,
  },
  {
    id: 'cow',
    name: 'İnek',
    emoji: '🐮',
    soundUrl: '',
    category: 'Çiftlik',
    difficulty: 'easy',
    isActive: true,
  },
  {
    id: 'lion',
    name: 'Aslan',
    emoji: '🦁',
    soundUrl: '',
    category: 'Vahşi',
    difficulty: 'medium',
    isActive: true,
  },
];
