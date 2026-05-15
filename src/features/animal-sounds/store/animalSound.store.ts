import { create } from 'zustand';

import { animalSoundService } from '../services/animalSound.service';
import type { Animal, AnswerResult, GameQuestion } from '../types/animal.types';

type AnimalSoundState = {
  animals: Animal[];
  currentQuestion?: GameQuestion;
  selectedAnimalId?: string;
  score: number;
  round: number;
  streak: number;
  bestStreak: number;
  isLoading: boolean;
  error?: string;
  loadAnimals: () => Promise<void>;
  startGame: () => void;
  answer: (animalId: string) => AnswerResult | undefined;
  nextQuestion: () => void;
};

const shuffle = <T,>(items: T[]): T[] => {
  return [...items].sort(() => Math.random() - 0.5);
};

const createQuestion = (animals: Animal[]): GameQuestion | undefined => {
  if (animals.length < 2) {
    return undefined;
  }

  const correctAnimal = shuffle(animals)[0];
  const wrongOptions = shuffle(
    animals.filter((animal) => animal.id !== correctAnimal.id),
  ).slice(0, 3);
  const options = shuffle([correctAnimal, ...wrongOptions]);

  return {
    id: `${correctAnimal.id}-${Date.now()}`,
    correctAnimal,
    options,
  };
};

export const useAnimalSoundStore = create<AnimalSoundState>((set, get) => ({
  animals: [],
  score: 0,
  round: 1,
  streak: 0,
  bestStreak: 0,
  isLoading: false,

  loadAnimals: async () => {
    set({ isLoading: true, error: undefined });

    try {
      const animals = await animalSoundService.getAnimals();
      set({
        animals,
        currentQuestion: createQuestion(animals),
        isLoading: false,
      });
    } catch {
      set({
        error: 'Hayvanlar yüklenirken bir sorun oluştu.',
        isLoading: false,
      });
    }
  },

  startGame: () => {
    const { animals } = get();
    set({
      score: 0,
      round: 1,
      streak: 0,
      selectedAnimalId: undefined,
      currentQuestion: createQuestion(animals),
    });
  },

  answer: (animalId: string) => {
    const { bestStreak, currentQuestion, selectedAnimalId, score, streak } = get();

    if (!currentQuestion || selectedAnimalId) {
      return undefined;
    }

    const isCorrect = animalId === currentQuestion.correctAnimal.id;
    const nextStreak = isCorrect ? streak + 1 : 0;
    const streakBonus = isCorrect && nextStreak > 1 ? Math.min(nextStreak * 2, 10) : 0;

    set({
      selectedAnimalId: animalId,
      score: isCorrect ? score + 10 + streakBonus : score,
      streak: nextStreak,
      bestStreak: Math.max(bestStreak, nextStreak),
    });

    return {
      selectedAnimalId: animalId,
      isCorrect,
    };
  },

  nextQuestion: () => {
    const { animals, round } = get();
    set({
      round: round + 1,
      selectedAnimalId: undefined,
      currentQuestion: createQuestion(animals),
    });
  },
}));
