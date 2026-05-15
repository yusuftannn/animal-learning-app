import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  StatusBar as RNStatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

import { useAnimalAudioPlayer } from '../services/useAnimalAudioPlayer';
import { useAnimalSoundStore } from '../store/animalSound.store';

const bottomTabs = [
  { icon: 'volume-high', key: 'sounds', label: 'Sesler' },
  { icon: 'grid', key: 'animals', label: 'Hayvanlar' },
  { icon: 'trophy', key: 'scores', label: 'Başarılar' },
] as const;

export const AnimalSoundGame = () => {
  const {
    currentQuestion,
    error,
    isLoading,
    loadAnimals,
    nextQuestion,
    round,
    score,
    streak,
    bestStreak,
    selectedAnimalId,
    answer,
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

  if (isLoading || !currentQuestion) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ExpoStatusBar backgroundColor="#F7F3E8" style="dark" />
        <AppHeader onRestart={startGame} />
        <View style={styles.loadingContent}>
          <ActivityIndicator color="#256D5A" size="large" />
          <Text style={styles.loadingText}>Oyun hazırlanıyor...</Text>
        </View>
        <BottomMenu />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
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
                  : 'Firebase soundUrl bekleniyor'}
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
      <BottomMenu />
    </SafeAreaView>
  );
};

type AppHeaderProps = {
  onRestart: () => void;
};

const AppHeader = ({ onRestart }: AppHeaderProps) => (
  <View style={styles.appHeader}>
    <View style={styles.brandGroup}>
      <View style={styles.brandIcon}>
        <Ionicons color="#256D5A" name="paw" size={22} />
      </View>
      <View>
        <Text style={styles.appTitle}>Hayvan Sesleri</Text>
        <Text style={styles.appSubtitle}>Dinle ve öğren</Text>
      </View>
    </View>
    <Pressable
      accessibilityLabel="Oyunu yenile"
      accessibilityRole="button"
      onPress={onRestart}
      style={({ pressed }) => [
        styles.iconButton,
        pressed && styles.pressedIconButton,
      ]}
    >
      <Ionicons color="#1F352E" name="refresh" size={22} />
    </Pressable>
  </View>
);

const BottomMenu = () => (
  <View style={styles.bottomMenu}>
    {bottomTabs.map((tab) => {
      const isActive = tab.key === 'sounds';

      return (
        <Pressable
          accessibilityLabel={`${tab.label} sekmesi`}
          accessibilityRole="tab"
          accessibilityState={{ selected: isActive }}
          key={tab.key}
          style={({ pressed }) => [
            styles.bottomTab,
            isActive && styles.activeBottomTab,
            pressed && styles.pressedBottomTab,
          ]}
        >
          <Ionicons
            color={isActive ? '#FFFFFF' : '#61716A'}
            name={tab.icon}
            size={22}
          />
          <Text
            numberOfLines={1}
            style={[
              styles.bottomTabText,
              isActive && styles.activeBottomTabText,
            ]}
          >
            {tab.label}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F3E8',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  appHeader: {
    alignItems: 'center',
    backgroundColor: '#F7F3E8',
    borderBottomColor: '#E5D7B7',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 68,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  brandGroup: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    minWidth: 0,
  },
  brandIcon: {
    alignItems: 'center',
    backgroundColor: '#DCEFE8',
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  appTitle: {
    color: '#1F352E',
    fontSize: 19,
    fontWeight: '900',
  },
  appSubtitle: {
    color: '#7A5D2F',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
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
  iconButton: {
    alignItems: 'center',
    backgroundColor: '#E6DDC6',
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  pressedIconButton: {
    opacity: 0.74,
    transform: [{ scale: 0.97 }],
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
  bottomMenu: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E5D7B7',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 74,
    paddingBottom: Platform.OS === 'ios' ? 18 : 10,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  bottomTab: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    gap: 4,
    justifyContent: 'center',
    minHeight: 54,
  },
  activeBottomTab: {
    backgroundColor: '#256D5A',
  },
  pressedBottomTab: {
    opacity: 0.78,
  },
  bottomTabText: {
    color: '#61716A',
    fontSize: 11,
    fontWeight: '800',
  },
  activeBottomTabText: {
    color: '#FFFFFF',
  },
});
