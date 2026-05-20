import { useEffect, useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

import {
  AppHeader,
  BottomMenu,
  chromeStyles,
  type AppTab,
} from './AnimalAppChrome';
import { useAnimalSoundStore } from '../store/animalSound.store';

type ScoresPageProps = {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
};

type Achievement = {
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  isComplete: boolean;
  title: string;
};

export const ScoresPage = ({ activeTab, onTabChange }: ScoresPageProps) => {
  const {
    animals,
    bestStreak,
    error,
    isLoading,
    loadAnimals,
    round,
    score,
    startGame,
    streak,
  } = useAnimalSoundStore();

  useEffect(() => {
    if (animals.length === 0) {
      void loadAnimals();
    }
  }, [animals.length, loadAnimals]);

  const completedRounds = Math.max(round - 1, 0);
  const categoryCount = useMemo(
    () => new Set(animals.map((animal) => animal.category)).size,
    [animals],
  );

  const achievements: Achievement[] = [
    {
      description: 'İlk doğru cevabını ver ve puan toplamaya başla.',
      icon: 'sparkles',
      isComplete: score > 0,
      title: 'İlk başarı',
    },
    {
      description: 'Üst üste 3 doğru cevapla seri yakala.',
      icon: 'flame',
      isComplete: bestStreak >= 3,
      title: 'Seri ustası',
    },
    {
      description: 'En az 50 puana ulaş.',
      icon: 'star',
      isComplete: score >= 50,
      title: 'Puan avcısı',
    },
    {
      description: 'Hayvan arşivinde 3 kategori gör.',
      icon: 'albums',
      isComplete: categoryCount >= 3,
      title: 'Kaşif',
    },
  ];

  const completedAchievementCount = achievements.filter(
    (achievement) => achievement.isComplete,
  ).length;

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
            <Text style={styles.eyebrow}>Başarılar</Text>
            <Text style={styles.title}>İlerlemeni takip et</Text>
          </View>
          <View style={styles.trophyBadge}>
            <Ionicons color="#D97925" name="trophy" size={30} />
          </View>
        </View>

        <View style={styles.scorePanel}>
          <Text style={styles.scoreLabel}>Toplam puan</Text>
          <Text style={styles.scoreValue}>{score}</Text>
          <Text style={styles.scoreHint}>
            Her doğru cevap 10 puan, uzun seriler ekstra bonus kazandırır.
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <StatTile icon="repeat" label="Tamamlanan tur" value={completedRounds} />
          <StatTile icon="flame" label="Güncel seri" value={streak} />
          <StatTile icon="ribbon" label="En iyi seri" value={bestStreak} />
          <StatTile icon="checkmark-circle" label="Kazanılan rozet" value={completedAchievementCount} />
        </View>

        {isLoading ? (
          <View style={styles.notice}>
            <ActivityIndicator color="#256D5A" size="small" />
            <Text style={styles.noticeText}>Başarılar hazırlanıyor...</Text>
          </View>
        ) : null}

        {!isLoading && error ? (
          <View style={[styles.notice, styles.errorNotice]}>
            <Ionicons color="#B43A30" name="alert-circle" size={22} />
            <Text style={[styles.noticeText, styles.errorText]}>{error}</Text>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Rozetler</Text>
        <View style={styles.achievementList}>
          {achievements.map((achievement) => (
            <View
              key={achievement.title}
              style={[
                styles.achievementCard,
                achievement.isComplete && styles.completedAchievement,
              ]}
            >
              <View
                style={[
                  styles.achievementIcon,
                  achievement.isComplete && styles.completedAchievementIcon,
                ]}
              >
                <Ionicons
                  color={achievement.isComplete ? '#FFFFFF' : '#829188'}
                  name={achievement.icon}
                  size={22}
                />
              </View>
              <View style={styles.achievementText}>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementDescription}>
                  {achievement.description}
                </Text>
              </View>
              <Ionicons
                color={achievement.isComplete ? '#256D5A' : '#C9BDA3'}
                name={achievement.isComplete ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
              />
            </View>
          ))}
        </View>
      </ScrollView>
      <BottomMenu activeTab={activeTab} onTabChange={onTabChange} />
    </SafeAreaView>
  );
};

type StatTileProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
};

const StatTile = ({ icon, label, value }: StatTileProps) => (
  <View style={styles.statTile}>
    <Ionicons color="#256D5A" name={icon} size={20} />
    <Text style={styles.statValue}>{value}</Text>
    <Text numberOfLines={2} style={styles.statLabel}>
      {label}
    </Text>
  </View>
);

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
  trophyBadge: {
    alignItems: 'center',
    backgroundColor: '#FFF1D9',
    borderRadius: 8,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  scorePanel: {
    backgroundColor: '#256D5A',
    borderRadius: 8,
    marginBottom: 14,
    padding: 18,
  },
  scoreLabel: {
    color: '#DCEFE8',
    fontSize: 13,
    fontWeight: '800',
  },
  scoreValue: {
    color: '#FFFFFF',
    fontSize: 44,
    fontWeight: '900',
    marginTop: 2,
  },
  scoreHint: {
    color: '#EFF8F4',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18,
  },
  statTile: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5D7B7',
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 104,
    padding: 12,
    width: '48%',
  },
  statValue: {
    color: '#1F352E',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4,
  },
  statLabel: {
    color: '#7B827D',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
    textAlign: 'center',
  },
  notice: {
    alignItems: 'center',
    backgroundColor: '#DCEFE8',
    borderColor: '#B9DCD0',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    padding: 12,
  },
  errorNotice: {
    backgroundColor: '#F6DDDA',
    borderColor: '#E7B7B1',
  },
  noticeText: {
    color: '#1F352E',
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  errorText: {
    color: '#7D2923',
  },
  sectionTitle: {
    color: '#1F352E',
    fontSize: 19,
    fontWeight: '900',
    marginBottom: 10,
  },
  achievementList: {
    gap: 10,
  },
  achievementCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5D7B7',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 82,
    padding: 12,
  },
  completedAchievement: {
    backgroundColor: '#FFF9EA',
    borderColor: '#D97925',
  },
  achievementIcon: {
    alignItems: 'center',
    backgroundColor: '#EEF0EC',
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  completedAchievementIcon: {
    backgroundColor: '#D97925',
  },
  achievementText: {
    flex: 1,
    minWidth: 0,
  },
  achievementTitle: {
    color: '#1F352E',
    fontSize: 16,
    fontWeight: '900',
  },
  achievementDescription: {
    color: '#7B827D',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    marginTop: 3,
  },
});
