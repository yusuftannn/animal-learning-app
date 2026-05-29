import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  StatusBar as RNStatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, type ComponentProps } from 'react';

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
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onRestart: () => void;
};

export const AppHeader = ({
  activeTab,
  onRestart,
  onTabChange,
}: AppHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleTabChange = (tab: AppTab) => {
    setIsMenuOpen(false);
    onTabChange(tab);
  };

  const handleRestart = () => {
    setIsMenuOpen(false);
    onRestart();
    onTabChange('sounds');
  };

  return (
    <View style={chromeStyles.appHeader}>
    <View style={chromeStyles.brandGroup}>
      <Pressable
        accessibilityLabel="Menüyü aç"
        accessibilityRole="button"
        onPress={() => setIsMenuOpen(true)}
        style={({ pressed }) => [
          chromeStyles.menuButton,
          pressed && chromeStyles.pressedButton,
        ]}
      >
        <Ionicons color="#1F352E" name="menu" size={25} />
      </Pressable>
      <View style={chromeStyles.brandIcon}>
        <Ionicons color="#256D5A" name="paw" size={22} />
      </View>
      <View style={chromeStyles.brandText}>
        <Text numberOfLines={1} style={chromeStyles.appTitle}>Hayvan Sesleri</Text>
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
    <Modal
      animationType="fade"
      onRequestClose={() => setIsMenuOpen(false)}
      transparent
      visible={isMenuOpen}
    >
      <View style={chromeStyles.menuOverlay}>
        <Pressable
          accessibilityLabel="Menüyü kapat"
          onPress={() => setIsMenuOpen(false)}
          style={chromeStyles.menuBackdrop}
        />
        <View style={chromeStyles.drawerMenu}>
          <View style={chromeStyles.drawerHeader}>
            <View style={chromeStyles.drawerTitleGroup}>
              <Text style={chromeStyles.drawerTitle}>Menü</Text>
              <Text style={chromeStyles.drawerSubtitle}>
                Nereye gitmek istersin?
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Menüyü kapat"
              accessibilityRole="button"
              onPress={() => setIsMenuOpen(false)}
              style={({ pressed }) => [
                chromeStyles.drawerCloseButton,
                pressed && chromeStyles.pressedButton,
              ]}
            >
              <Ionicons color="#1F352E" name="close" size={22} />
            </Pressable>
          </View>

          <View style={chromeStyles.drawerTabs}>
            {bottomTabs.map((tab) => {
              const isActive = tab.key === activeTab;

              return (
                <Pressable
                  accessibilityLabel={`${tab.label} sayfasına git`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  key={tab.key}
                  onPress={() => handleTabChange(tab.key)}
                  style={({ pressed }) => [
                    chromeStyles.drawerTab,
                    isActive && chromeStyles.activeDrawerTab,
                    pressed && chromeStyles.pressedButton,
                  ]}
                >
                  <View
                    style={[
                      chromeStyles.drawerTabIcon,
                      isActive && chromeStyles.activeDrawerTabIcon,
                    ]}
                  >
                    <Ionicons
                      color={isActive ? '#FFFFFF' : '#256D5A'}
                      name={tab.icon}
                      size={21}
                    />
                  </View>
                  <Text
                    style={[
                      chromeStyles.drawerTabText,
                      isActive && chromeStyles.activeDrawerTabText,
                    ]}
                  >
                    {tab.label}
                  </Text>
                  {isActive ? (
                    <Ionicons color="#256D5A" name="checkmark-circle" size={21} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          <Pressable
            accessibilityLabel="Oyunu yeniden başlat"
            accessibilityRole="button"
            onPress={handleRestart}
            style={({ pressed }) => [
              chromeStyles.drawerRestartButton,
              pressed && chromeStyles.pressedButton,
            ]}
          >
            <Ionicons color="#FFFFFF" name="refresh" size={20} />
            <Text style={chromeStyles.drawerRestartText}>
              Oyunu yeniden başlat
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  </View>
  );
};

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
    gap: 8,
    minWidth: 0,
  },
  menuButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5D7B7',
    borderRadius: 8,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  brandIcon: {
    alignItems: 'center',
    backgroundColor: '#DCEFE8',
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  brandText: {
    flex: 1,
    minWidth: 0,
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
  menuOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  menuBackdrop: {
    backgroundColor: 'rgba(31, 53, 46, 0.42)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  drawerMenu: {
    backgroundColor: '#F7F3E8',
    borderRightColor: '#E5D7B7',
    borderRightWidth: 1,
    gap: 14,
    maxWidth: 330,
    paddingBottom: 22,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 0) + 18 : 54,
    width: '82%',
  },
  drawerHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  drawerTitleGroup: {
    flex: 1,
    minWidth: 0,
  },
  drawerTitle: {
    color: '#1F352E',
    fontSize: 24,
    fontWeight: '900',
  },
  drawerSubtitle: {
    color: '#7A5D2F',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  drawerCloseButton: {
    alignItems: 'center',
    backgroundColor: '#E6DDC6',
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  drawerTabs: {
    gap: 9,
  },
  drawerTab: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5D7B7',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 58,
    paddingHorizontal: 12,
  },
  activeDrawerTab: {
    backgroundColor: '#DCEFE8',
    borderColor: '#256D5A',
  },
  drawerTabIcon: {
    alignItems: 'center',
    backgroundColor: '#EEF0EC',
    borderRadius: 8,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  activeDrawerTabIcon: {
    backgroundColor: '#256D5A',
  },
  drawerTabText: {
    color: '#1F352E',
    flex: 1,
    fontSize: 16,
    fontWeight: '900',
  },
  activeDrawerTabText: {
    color: '#256D5A',
  },
  drawerRestartButton: {
    alignItems: 'center',
    backgroundColor: '#D97925',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 'auto',
    minHeight: 50,
    paddingHorizontal: 14,
  },
  drawerRestartText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
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
