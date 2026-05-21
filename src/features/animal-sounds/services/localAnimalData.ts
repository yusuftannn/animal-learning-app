import type { Animal } from "../types/animal.types";

export const fallbackAnimals: Animal[] = [
  {
    id: "cat",
    name: "Kedi",
    emoji: "🐱",
    soundUrl: "https://assets.mixkit.co/active_storage/sfx/93/93-preview.mp3",
    category: "Evcil",
    difficulty: "easy",
    isActive: true,
  },
  {
    id: "dog",
    name: "Köpek",
    emoji: "🐶",
    soundUrl: "https://actions.google.com/sounds/v1/animals/dog_barking.ogg",
    category: "Evcil",
    difficulty: "easy",
    isActive: true,
  },
  {
    id: "cow",
    name: "İnek",
    emoji: "🐮",
    soundUrl:
      "https://audio-previews.elements.envatousercontent.com/files/272118241/preview.mp3",
    category: "Çiftlik",
    difficulty: "easy",
    isActive: true,
  },
  {
    id: "bird",
    name: "Kuş",
    emoji: "🐦",
    soundUrl:
      "https://audio-previews.elements.envatousercontent.com/files/485635651/preview.mp3",
    category: "Evcil",
    difficulty: "easy",
    isActive: true,
  },
  {
    id: "bee",
    name: "Arı",
    emoji: "🐝",
    soundUrl: "https://actions.google.com/sounds/v1/animals/bee_buzz.ogg",
    category: "Böcek",
    difficulty: "easy",
    isActive: true,
  },
];
