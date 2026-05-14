import { create } from 'zustand';

import { animalSoundService } from '../services/animalSound.service';
import type { Animal, AnswerResult, GameQuestion } from '../types/animal.types';

type AnimalSoundState = {
  animals: Animal[];
  currentQuestion?: GameQuestion;
  selectedAnimalId?: string;
  score: number;
  round: number;
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
      selectedAnimalId: undefined,
      currentQuestion: createQuestion(animals),
    });
  },

  answer: (animalId: string) => {
    const { currentQuestion, selectedAnimalId, score } = get();

    if (!currentQuestion || selectedAnimalId) {
      return undefined;
    }

    const isCorrect = animalId === currentQuestion.correctAnimal.id;

    set({
      selectedAnimalId: animalId,
      score: isCorrect ? score + 10 : score,
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
