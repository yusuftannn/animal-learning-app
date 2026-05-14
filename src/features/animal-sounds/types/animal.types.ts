export type AnimalDifficulty = 'easy' | 'medium' | 'hard';

export type Animal = {
  id: string;
  name: string;
  emoji: string;
  soundUrl: string;
  category: string;
  difficulty: AnimalDifficulty;
  isActive: boolean;
};

export type GameQuestion = {
  id: string;
  correctAnimal: Animal;
  options: Animal[];
};

export type AnswerResult = {
  selectedAnimalId: string;
  isCorrect: boolean;
};
