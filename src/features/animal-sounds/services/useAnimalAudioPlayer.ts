import { useCallback, useMemo } from 'react';
import { useAudioPlayer } from 'expo-audio';

import type { Animal } from '../types/animal.types';

export const useAnimalAudioPlayer = (animal?: Animal) => {
  const source = useMemo(() => {
    return animal?.soundUrl ? { uri: animal.soundUrl } : null;
  }, [animal?.soundUrl]);

  const player = useAudioPlayer(source);

  const play = useCallback(async () => {
    if (!animal?.soundUrl) {
      return false;
    }

    await player.seekTo(0);
    player.play();
    return true;
  }, [animal?.soundUrl, player]);

  return {
    play,
    hasSound: Boolean(animal?.soundUrl),
  };
};
