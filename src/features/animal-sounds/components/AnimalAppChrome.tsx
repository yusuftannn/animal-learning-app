import { Platform, Pressable, StyleSheet, Text, View, StatusBar as RNStatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

export type AppTab = 'sounds' | 'animals' | 'scores';

type TabItem = {
  icon: ComponentProps<typeof Ionicons>['name'];
  key: AppTab;
  label: string;
};

const bottomTabs: TabItem[] = [
  { icon: 'volume-high', key: 'sounds', label: 'Sesler' },
  { icon: 'grid', key: 'animals', label: 'Hayvanlar' },
  { icon: 'trophy', key: 'scores', label: 'Başarılar' },
];

type AppHeaderProps = {
  onRestart: () => void;
};

export const AppHeader = ({ onRestart }: AppHeaderProps) => (
  <View style={chromeStyles.appHeader}>
    <View style={chromeStyles.brandGroup}>
      <View style={chromeStyles.brandIcon}>
        <Ionicons color="#256D5A" name="paw" size={22} />
      </View>
      <View>
        <Text style={chromeStyles.appTitle}>Hayvan Sesleri</Text>
        <Text style={chromeStyles.appSubtitle}>Dinle ve öğren</Text>
      </View>
    </View>
    <Pressable
      accessibilityLabel="Oyunu yenile"
      accessibilityRole="button"
      onPress={onRestart}
      style={({ pressed }) => [
        chromeStyles.iconButton,
        pressed && chromeStyles.pressedButton,
      ]}
    >
      <Ionicons color="#1F352E" name="refresh" size={22} />
    </Pressable>
  </View>
);

type BottomMenuProps = {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
};

export const BottomMenu = ({ activeTab, onTabChange }: BottomMenuProps) => (
  <View style={chromeStyles.bottomMenu}>
    {bottomTabs.map((tab) => {
      const isActive = tab.key === activeTab;

      return (
        <Pressable
          accessibilityLabel={`${tab.label} sekmesi`}
          accessibilityRole="tab"
          accessibilityState={{ selected: isActive }}
          key={tab.key}
          onPress={() => onTabChange(tab.key)}
          style={({ pressed }) => [
            chromeStyles.bottomTab,
            isActive && chromeStyles.activeBottomTab,
            pressed && chromeStyles.pressedButton,
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
              chromeStyles.bottomTabText,
              isActive && chromeStyles.activeBottomTabText,
            ]}
          >
            {tab.label}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

export const chromeStyles = StyleSheet.create({
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
  iconButton: {
    alignItems: 'center',
    backgroundColor: '#E6DDC6',
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  pressedButton: {
    opacity: 0.74,
    transform: [{ scale: 0.97 }],
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
  bottomTabText: {
    color: '#61716A',
    fontSize: 11,
    fontWeight: '800',
  },
  activeBottomTabText: {
    color: '#FFFFFF',
  },
});
