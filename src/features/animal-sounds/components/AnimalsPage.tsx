import { useEffect, useMemo, useRef, useState } from 'react';
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
import { useAnimalSoundStore } from '../store/animalSound.store';
import type { Animal } from '../types/animal.types';

type AnimalsPageProps = {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
};

const difficultyLabels: Record<Animal['difficulty'], string> = {
  easy: 'Kolay',
  medium: 'Orta',
  hard: 'Zor',
};

export const AnimalsPage = ({ activeTab, onTabChange }: AnimalsPageProps) => {
  const { animals, error, isLoading, loadAnimals, startGame } =
    useAnimalSoundStore();

  useEffect(() => {
    if (animals.length === 0) {
      void loadAnimals();
    }
  }, [animals.length, loadAnimals]);

  const categories = useMemo(() => {
    const categoryMap = animals.reduce<Record<string, Animal[]>>(
      (groups, animal) => {
        groups[animal.category] = [...(groups[animal.category] ?? []), animal];
        return groups;
      },
      {},
    );

    return Object.entries(categoryMap).sort(([first], [second]) =>
      first.localeCompare(second, 'tr'),
    );
  }, [animals]);

  return (
    <SafeAreaView style={chromeStyles.safeArea}>
      <ExpoStatusBar backgroundColor="#F7F3E8" style="dark" />
      <AppHeader onRestart={startGame} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        style={styles.contentScroll}
      >
        <View style={styles.hero}>
          <View style={styles.heroText}>
            <Text style={styles.eyebrow}>Hayvan arşivi</Text>
            <Text style={styles.title}>Hayvanları keşfet</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countValue}>{animals.length}</Text>
            <Text style={styles.countLabel}>hayvan</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryBox}>
            <Ionicons color="#256D5A" name="albums" size={20} />
            <Text style={styles.summaryValue}>{categories.length}</Text>
            <Text style={styles.summaryLabel}>Kategori</Text>
          </View>
          <View style={styles.summaryBox}>
            <Ionicons color="#D97925" name="musical-notes" size={20} />
            <Text style={styles.summaryValue}>
              {animals.filter((animal) => animal.soundUrl).length}
            </Text>
            <Text style={styles.summaryLabel}>Sesli kart</Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator color="#256D5A" size="large" />
            <Text style={styles.emptyText}>Hayvanlar yükleniyor...</Text>
          </View>
        ) : null}

        {!isLoading && error ? (
          <View style={styles.notice}>
            <Ionicons color="#B43A30" name="alert-circle" size={22} />
            <Text style={styles.noticeText}>{error}</Text>
          </View>
        ) : null}

        {!isLoading && animals.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons color="#829188" name="paw" size={38} />
            <Text style={styles.emptyText}>Henüz hayvan bulunamadı.</Text>
          </View>
        ) : null}

        {categories.map(([category, categoryAnimals]) => (
          <View key={category} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>{category}</Text>
              <Text style={styles.categoryCount}>{categoryAnimals.length}</Text>
            </View>
            <View style={styles.cardsGrid}>
              {categoryAnimals.map((animal) => (
                <AnimalCard animal={animal} key={animal.id} />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
      <BottomMenu activeTab={activeTab} onTabChange={onTabChange} />
    </SafeAreaView>
  );
};

type AnimalCardProps = {
  animal: Animal;
};

const AnimalCard = ({ animal }: AnimalCardProps) => {
  const { hasSound, play } = useAnimalAudioPlayer(animal);
  const [isPlaying, setIsPlaying] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handlePlay = async () => {
    if (!hasSound) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsPlaying(true);
    const didPlay = await play();

    if (!didPlay) {
      setIsPlaying(false);
      return;
    }

    timeoutRef.current = setTimeout(() => {
      setIsPlaying(false);
      timeoutRef.current = null;
    }, 1400);
  };

  return (
    <View style={styles.animalCard}>
      <View style={styles.emojiWrap}>
        <Text style={styles.animalEmoji}>{animal.emoji}</Text>
      </View>
      <Text numberOfLines={1} style={styles.animalName}>
        {animal.name}
      </Text>
      <Text numberOfLines={1} style={styles.animalMeta}>
        {difficultyLabels[animal.difficulty]}
      </Text>
      <Pressable
        accessibilityLabel={`${animal.name} sesini çal`}
        accessibilityRole="button"
        disabled={!hasSound}
        onPress={() => void handlePlay()}
        style={({ pressed }) => [
          styles.soundButton,
          isPlaying && styles.playingButton,
          !hasSound && styles.disabledButton,
          pressed && styles.pressedButton,
        ]}
      >
        <Ionicons
          color="#FFFFFF"
          name={isPlaying ? 'radio' : 'volume-high'}
          size={18}
        />
        <Text style={styles.soundButtonText}>
          {isPlaying ? 'Çalıyor' : 'Dinle'}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  contentScroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 26,
  },
  hero: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  heroText: {
    flex: 1,
    minWidth: 0,
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
  countBadge: {
    alignItems: 'center',
    backgroundColor: '#DCEFE8',
    borderRadius: 8,
    minWidth: 72,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  countValue: {
    color: '#1F352E',
    fontSize: 24,
    fontWeight: '900',
  },
  countLabel: {
    color: '#256D5A',
    fontSize: 11,
    fontWeight: '800',
    marginTop: -2,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  summaryBox: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5D7B7',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    padding: 14,
  },
  summaryValue: {
    color: '#1F352E',
    fontSize: 22,
    fontWeight: '900',
  },
  summaryLabel: {
    color: '#7B827D',
    fontSize: 12,
    fontWeight: '800',
  },
  notice: {
    alignItems: 'center',
    backgroundColor: '#F6DDDA',
    borderColor: '#E7B7B1',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    padding: 12,
  },
  noticeText: {
    color: '#7D2923',
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 34,
  },
  emptyText: {
    color: '#1F352E',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  categorySection: {
    marginTop: 8,
  },
  categoryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryTitle: {
    color: '#1F352E',
    fontSize: 19,
    fontWeight: '900',
  },
  categoryCount: {
    backgroundColor: '#E6DDC6',
    borderRadius: 8,
    color: '#5B4828',
    fontSize: 13,
    fontWeight: '900',
    minWidth: 32,
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 5,
    textAlign: 'center',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  animalCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5D7B7',
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 178,
    padding: 12,
    width: '48%',
  },
  emojiWrap: {
    alignItems: 'center',
    backgroundColor: '#FFF9EA',
    borderRadius: 8,
    height: 62,
    justifyContent: 'center',
    marginBottom: 10,
    width: 62,
  },
  animalEmoji: {
    fontSize: 38,
  },
  animalName: {
    color: '#1F352E',
    fontSize: 17,
    fontWeight: '900',
    maxWidth: '100%',
  },
  animalMeta: {
    color: '#7B827D',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 12,
    marginTop: 4,
  },
  soundButton: {
    alignItems: 'center',
    backgroundColor: '#256D5A',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginTop: 'auto',
    minHeight: 40,
    paddingHorizontal: 12,
    width: '100%',
  },
  playingButton: {
    backgroundColor: '#D97925',
  },
  disabledButton: {
    backgroundColor: '#829188',
  },
  pressedButton: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
  soundButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
});
