import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

import {
  AppHeader,
  BottomMenu,
  chromeStyles,
  type AppTab,
} from './AnimalAppChrome';
import { useAnimalAudioPlayer } from '../services/useAnimalAudioPlayer';
import {
  useAnimalSoundStore,
  type GameDifficulty,
} from '../store/animalSound.store';

type AnimalSoundGameProps = {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
};

const difficultyModes: Array<{ label: string; value: GameDifficulty }> = [
  { label: 'Karışık', value: 'all' },
  { label: 'Kolay', value: 'easy' },
  { label: 'Orta', value: 'medium' },
  { label: 'Zor', value: 'hard' },
];

const difficultyLabels: Record<GameDifficulty, string> = {
  all: 'Karışık',
  easy: 'Kolay',
  medium: 'Orta',
  hard: 'Zor',
};

export const AnimalSoundGame = ({
  activeTab,
  onTabChange,
}: AnimalSoundGameProps) => {
  const {
    animals,
    currentQuestion,
    error,
    gameDifficulty,
    isLoading,
    loadAnimals,
    nextQuestion,
    round,
    score,
    streak,
    bestStreak,
    selectedAnimalId,
    answer,
    setGameDifficulty,
    startGame,
  } = useAnimalSoundStore();

  const { hasSound, play } = useAnimalAudioPlayer(currentQuestion?.correctAnimal);
  const [isPlaying, setIsPlaying] = useState(false);
  const playingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    void loadAnimals();
  }, [loadAnimals]);

  useEffect(() => {
    return () => {
      if (playingTimeoutRef.current) {
        clearTimeout(playingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!selectedAnimalId) {
      return undefined;
    }

    const nextQuestionTimeout = setTimeout(() => {
      nextQuestion();
    }, 1100);

    return () => clearTimeout(nextQuestionTimeout);
  }, [currentQuestion?.id, nextQuestion, selectedAnimalId]);

  const handlePlay = async () => {
    if (!hasSound) {
      return;
    }

    if (playingTimeoutRef.current) {
      clearTimeout(playingTimeoutRef.current);
    }

    setIsPlaying(true);
    const didPlay = await play();

    if (!didPlay) {
      setIsPlaying(false);
      return;
    }

    playingTimeoutRef.current = setTimeout(() => {
      setIsPlaying(false);
      playingTimeoutRef.current = null;
    }, 1400);
  };

  const selectedIsCorrect =
    selectedAnimalId === currentQuestion?.correctAnimal.id;

  if (isLoading) {
    return (
      <SafeAreaView style={chromeStyles.safeArea}>
        <ExpoStatusBar backgroundColor="#F7F3E8" style="dark" />
        <AppHeader onRestart={startGame} />
        <View style={styles.loadingContent}>
          <ActivityIndicator color="#256D5A" size="large" />
          <Text style={styles.loadingText}>Oyun hazırlanıyor...</Text>
        </View>
        <BottomMenu activeTab={activeTab} onTabChange={onTabChange} />
      </SafeAreaView>
    );
  }

  if (!currentQuestion) {
    return (
      <SafeAreaView style={chromeStyles.safeArea}>
        <ExpoStatusBar backgroundColor="#F7F3E8" style="dark" />
        <AppHeader onRestart={startGame} />
        <View style={styles.loadingContent}>
          <Ionicons color="#B43A30" name="alert-circle" size={38} />
          <Text style={styles.loadingText}>
            {error ?? 'Oyun başlatılamadı.'}
          </Text>
          <Pressable
            accessibilityLabel="Oyunu tekrar dene"
            accessibilityRole="button"
            onPress={() => void loadAnimals()}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.pressedPlayButton,
            ]}
          >
            <Ionicons color="#FFFFFF" name="refresh" size={20} />
            <Text style={styles.playButtonText}>Tekrar dene</Text>
          </Pressable>
        </View>
        <BottomMenu activeTab={activeTab} onTabChange={onTabChange} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={chromeStyles.safeArea}>
      <ExpoStatusBar backgroundColor="#F7F3E8" style="dark" />
      <AppHeader onRestart={startGame} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        style={styles.contentScroll}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Günün oyunu</Text>
            <Text style={styles.title}>Sesi dinle, hayvanı bul</Text>
          </View>
        </View>

        <View style={styles.scoreRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Puan</Text>
            <Text style={styles.statValue}>{score}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Tur</Text>
            <Text style={styles.statValue}>{round}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Seri</Text>
            <Text style={styles.statValue}>{streak}</Text>
          </View>
        </View>

        <View style={styles.levelPanel}>
          <View style={styles.levelHeader}>
            <View style={styles.levelTitleGroup}>
              <Ionicons color="#256D5A" name="options" size={18} />
              <Text style={styles.levelTitle}>Oyun seviyesi</Text>
            </View>
            <Text style={styles.levelStatus}>{difficultyLabels[gameDifficulty]}</Text>
          </View>
          <ScrollView
            contentContainerStyle={styles.levelModes}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {difficultyModes.map((mode) => {
              const isSelected = mode.value === gameDifficulty;
              const animalCount =
                mode.value === 'all'
                  ? animals.length
                  : animals.filter((animal) => animal.difficulty === mode.value)
                      .length;
              const isDisabled =
                mode.value === 'all' ? animals.length < 2 : animalCount === 0;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: isDisabled, selected: isSelected }}
                  disabled={isDisabled}
                  key={mode.value}
                  onPress={() => {
                    if (!isSelected) {
                      setGameDifficulty(mode.value);
                    }
                  }}
                  style={({ pressed }) => [
                    styles.levelMode,
                    isSelected && styles.selectedLevelMode,
                    isDisabled && styles.disabledLevelMode,
                    pressed && !isDisabled && styles.pressedPlayButton,
                  ]}
                >
                  <Text
                    style={[
                      styles.levelModeLabel,
                      isSelected && styles.selectedLevelModeText,
                    ]}
                  >
                    {mode.label}
                  </Text>
                  <Text
                    style={[
                      styles.levelModeCount,
                      isSelected && styles.selectedLevelModeCount,
                    ]}
                  >
                    {animalCount}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.streakPanel}>
          <View style={styles.streakBadge}>
            <Ionicons color="#D97925" name="flame" size={18} />
            <Text style={styles.streakBadgeText}>En iyi seri: {bestStreak}</Text>
          </View>
          <Text style={styles.streakHint}>
            Ardışık doğrular bonus puan kazandırır.
          </Text>
        </View>

        <View style={styles.soundPanel}>
          <Text style={styles.soundEmoji}>🔊</Text>
          <Text style={styles.soundTitle}>Bu hangi hayvanın sesi?</Text>
          <Pressable
            accessibilityLabel={hasSound ? 'Sesi çal' : 'Ses bağlantısı bekleniyor'}
            accessibilityRole="button"
            disabled={!hasSound}
            onPress={() => void handlePlay()}
            style={({ pressed }) => [
              styles.playButton,
              pressed && styles.pressedPlayButton,
              isPlaying && styles.playingButton,
              !hasSound && styles.disabledButton,
            ]}
          >
            <Ionicons
              color="#FFFFFF"
              name={isPlaying ? 'radio' : 'volume-high'}
              size={22}
            />
            <Text style={styles.playButtonText}>
              {isPlaying
                ? 'Çalıyor...'
                : hasSound
                  ? 'Sesi Çal'
                  : 'Ses bağlantısı bekleniyor'}
            </Text>
          </Pressable>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.optionsGrid}>
          {currentQuestion.options.map((animal) => {
            const isSelected = selectedAnimalId === animal.id;
            const isCorrect = currentQuestion.correctAnimal.id === animal.id;
            const showCorrect = selectedAnimalId && isCorrect;

            return (
              <Pressable
                accessibilityRole="button"
                disabled={Boolean(selectedAnimalId)}
                key={animal.id}
                onPress={() => answer(animal.id)}
                style={[
                  styles.optionCard,
                  isSelected && styles.selectedOption,
                  showCorrect && styles.correctOption,
                  isSelected && !isCorrect && styles.wrongOption,
                ]}
              >
                <Text style={styles.optionEmoji}>{animal.emoji}</Text>
                <Text style={styles.optionName}>{animal.name}</Text>
                <Text style={styles.optionCategory}>{animal.category}</Text>
              </Pressable>
            );
          })}
        </View>

        {selectedAnimalId ? (
          <View style={styles.resultPanel}>
            <Text style={styles.resultText}>
              {selectedIsCorrect
                ? streak > 1
                  ? `Doğru bildin! ${streak} cevaplık seri!`
                  : 'Doğru bildin!'
                : `Doğru cevap: ${currentQuestion.correctAnimal.name}`}
            </Text>
            <View style={styles.nextStatus}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.nextStatusText}>Yeni ses geliyor...</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
      <BottomMenu activeTab={activeTab} onTabChange={onTabChange} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  contentScroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 20,
  },
  loadingContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  eyebrow: {
    color: '#7A5D2F',
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    color: '#1F352E',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 4,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statBox: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5D7B7',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: 14,
  },
  statLabel: {
    color: '#7B827D',
    fontSize: 13,
    fontWeight: '700',
  },
  statValue: {
    color: '#1F352E',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },
  streakPanel: {
    alignItems: 'center',
    backgroundColor: '#FFF9EA',
    borderColor: '#E5D7B7',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    marginBottom: 18,
    padding: 12,
  },
  levelPanel: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5D7B7',
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    marginBottom: 12,
    padding: 12,
  },
  levelHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  levelTitleGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  levelTitle: {
    color: '#1F352E',
    fontSize: 14,
    fontWeight: '900',
  },
  levelStatus: {
    backgroundColor: '#DCEFE8',
    borderRadius: 8,
    color: '#256D5A',
    fontSize: 12,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  levelModes: {
    gap: 8,
    paddingRight: 4,
  },
  levelMode: {
    alignItems: 'center',
    backgroundColor: '#EEF0EC',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    minHeight: 40,
    minWidth: 76,
    paddingHorizontal: 11,
  },
  selectedLevelMode: {
    backgroundColor: '#1F352E',
  },
  disabledLevelMode: {
    opacity: 0.45,
  },
  levelModeLabel: {
    color: '#61716A',
    fontSize: 13,
    fontWeight: '900',
  },
  levelModeCount: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    color: '#61716A',
    fontSize: 11,
    fontWeight: '900',
    minWidth: 22,
    overflow: 'hidden',
    paddingHorizontal: 6,
    paddingVertical: 3,
    textAlign: 'center',
  },
  selectedLevelModeText: {
    color: '#FFFFFF',
  },
  selectedLevelModeCount: {
    backgroundColor: '#DCEFE8',
    color: '#1F352E',
  },
  streakBadge: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  streakBadgeText: {
    color: '#1F352E',
    fontSize: 14,
    fontWeight: '800',
  },
  streakHint: {
    color: '#7B827D',
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
  },
  soundPanel: {
    alignItems: 'center',
    backgroundColor: '#256D5A',
    borderRadius: 8,
    marginBottom: 18,
    padding: 24,
  },
  soundEmoji: {
    fontSize: 46,
  },
  soundTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 18,
    marginTop: 8,
    textAlign: 'center',
  },
  playButton: {
    alignItems: 'center',
    backgroundColor: '#D97925',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 18,
  },
  pressedPlayButton: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },
  playingButton: {
    backgroundColor: '#B85E17',
    borderColor: '#FFE2B9',
    borderWidth: 2,
  },
  disabledButton: {
    backgroundColor: '#829188',
  },
  retryButton: {
    alignItems: 'center',
    backgroundColor: '#256D5A',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
    minHeight: 48,
    paddingHorizontal: 18,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  errorText: {
    color: '#B43A30',
    fontWeight: '700',
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderColor: '#E5D7B7',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    padding: 12,
    width: '48%',
  },
  selectedOption: {
    borderColor: '#D97925',
    borderWidth: 2,
  },
  correctOption: {
    backgroundColor: '#DCEFE8',
    borderColor: '#256D5A',
  },
  wrongOption: {
    backgroundColor: '#F6DDDA',
    borderColor: '#B43A30',
  },
  optionEmoji: {
    fontSize: 42,
    marginBottom: 8,
  },
  optionName: {
    color: '#1F352E',
    fontSize: 18,
    fontWeight: '800',
  },
  optionCategory: {
    color: '#7B827D',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  resultPanel: {
    marginTop: 'auto',
    paddingTop: 18,
  },
  resultText: {
    color: '#1F352E',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  nextStatus: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#1F352E',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 18,
  },
  nextStatusText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  loadingText: {
    color: '#1F352E',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 14,
    textAlign: 'center',
  },
});
