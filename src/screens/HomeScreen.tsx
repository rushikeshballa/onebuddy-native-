import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Sidebar, { type SidebarItem } from '@/components/Sidebar';
import CategoryCard from '@/components/CategoryCard';
import ServiceTimeline from '@/components/ServiceTimeline';
import { SERVICES, brand, schemes } from '@/design/tokens';
import { useAppTheme } from '@/theme/ThemeContext';
import { useSettings } from '@/context/SettingsContext';
import { SERVICE_ROUTE, type RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

/** The old `startCycle` walked the timeline 1.2s per card, forever. */
const CYCLE_MS = 1200;
const CYCLE_START_DELAY_MS = 1500;

export default function HomeScreen() {
  const { scheme } = useAppTheme();
  const tokens = schemes[scheme];
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { state, setTheme, trackServiceUsage } = useSettings();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [query, setQuery] = useState('');

  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 420,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      useNativeDriver: true,
    }).start();
  }, [enter]);

  // Timeline auto-advance, same cadence the document used.
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      interval = setInterval(() => {
        setActiveIndex((current) => (current + 1) % SERVICES.length);
      }, CYCLE_MS);
    }, CYCLE_START_DELAY_MS);
    return () => {
      clearTimeout(start);
      if (interval) clearInterval(interval);
    };
  }, []);

  const openService = useCallback(
    (index: number) => {
      const service = SERVICES[index];
      trackServiceUsage(service.label);
      const route = SERVICE_ROUTE[service.id];
      if (route) {
        navigation.navigate(route as never);
      }
    },
    [navigation, trackServiceUsage]
  );

  const toggleTheme = useCallback(() => {
    setTheme(scheme === 'dark' ? 'light' : 'dark');
  }, [scheme, setTheme]);

  const sidebarItems = useMemo<readonly SidebarItem[]>(
    () => [
      { icon: '⚙️', label: 'Settings', onPress: () => go('AppSettings') },
      { icon: '❓', label: "FAQ's", onPress: () => go('HelpSupport') },
      { icon: '💬', label: 'Chat Support', onPress: () => go('HelpSupport') },
      { icon: '📝', label: 'Send a Query', onPress: () => go('HelpSupport') },
      { icon: '📋', label: 'My Orders', onPress: () => go('OrdersAndBookings') },
      { icon: '📍', label: 'Addresses', onPress: () => go('Addresses') },
      { icon: '💳', label: 'Payments', onPress: () => go('Payments') },
      { icon: '⭐', label: 'About OneBuddy', onPress: () => go('About') },
    ],
    // `go` is stable because navigation is.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  function go(route: keyof RootStackParamList) {
    setSidebarOpen(false);
    // Let the drawer finish closing first, as the document's 260ms did.
    setTimeout(() => navigation.navigate(route as never), 260);
  }

  return (
    <View style={[styles.root, { backgroundColor: tokens.bgDeep }]}>
      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top + 12,
            backgroundColor: tokens.bgTint(0.92),
            borderBottomColor: tokens.ink(0.05),
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit your profile"
          onPress={() => go('AppSettings')}
          style={styles.avatar}
        />

        <Text style={[styles.wordmark, { color: tokens.text }]}>
          One<Text style={{ color: brand.gold }}>Buddy</Text>
        </Text>

        <View style={styles.actions}>
          <IconButton label="Notifications" onPress={() => go('Notifications')} glyph="🔔" />
          <IconButton
            label="Switch between light and dark mode"
            onPress={toggleTheme}
            glyph={scheme === 'dark' ? '☀️' : '🌙'}
          />
          <IconButton
            label="Open menu"
            onPress={() => setSidebarOpen(true)}
            glyph="☰"
          />
        </View>
      </View>

      <Animated.ScrollView
        style={{ opacity: enter }}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.searchBar,
            { backgroundColor: tokens.ink(0.05), borderColor: tokens.ink(0.1) },
          ]}
        >
          <Text style={[styles.searchIcon, { color: tokens.textDim }]}>⌕</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search for food, grocery, rides..."
            placeholderTextColor={tokens.textDim}
            style={[styles.searchInput, { color: tokens.text }]}
            returnKeyType="search"
          />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => go('Addresses')}
          style={[styles.location, { backgroundColor: tokens.ink(0.05) }]}
        >
          <Text style={styles.locationPin}>📍</Text>
          <Text style={[styles.locationText, { color: tokens.textDim }]}>
            Hyderabad, Telangana
          </Text>
          <Text style={[styles.locationCaret, { color: tokens.textDim }]}>▾</Text>
        </Pressable>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: tokens.text }]}>Explore Categories</Text>
          <Text style={[styles.sectionSub, { color: tokens.textDim }]}>
            Pick a service to get started
          </Text>
        </View>

        <ServiceTimeline activeIndex={activeIndex} onSelect={setActiveIndex} />

        <View style={styles.grid}>
          <View style={styles.gridRow}>
            <CategoryCard service={SERVICES[0]} onPress={() => openService(0)} />
            <CategoryCard service={SERVICES[1]} onPress={() => openService(1)} />
          </View>
          <View style={styles.gridRow}>
            <CategoryCard service={SERVICES[2]} onPress={() => openService(2)} />
            <CategoryCard service={SERVICES[3]} onPress={() => openService(3)} />
          </View>
          <View style={styles.gridRow}>
            <CategoryCard service={SERVICES[4]} wide onPress={() => openService(4)} />
          </View>
        </View>

        <View style={[styles.footer, { borderTopColor: tokens.ink(0.05) }]}>
          <Text style={[styles.footerCopy, { color: tokens.textDim }]}>
            © 2026 onebuddy — All services, one platform
          </Text>
        </View>
      </Animated.ScrollView>

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        profileName={state.language ? 'Set up your profile' : 'Set up your profile'}
        onEditProfile={() => go('AppSettings')}
        items={sidebarItems}
      />
    </View>
  );
}

function IconButton({
  label,
  glyph,
  onPress,
}: {
  label: string;
  glyph: string;
  onPress: () => void;
}) {
  const { scheme } = useAppTheme();
  const tokens = schemes[scheme];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        {
          backgroundColor: pressed ? tokens.ink(0.12) : tokens.ink(0.06),
          borderColor: tokens.ink(0.12),
        },
      ]}
    >
      <Text style={styles.iconGlyph}>{glyph}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: brand.lavenderLight,
  },
  wordmark: { fontSize: 19, fontWeight: '700' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlyph: { fontSize: 15 },
  content: { padding: 24 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 4,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchIcon: { fontSize: 20, marginRight: 12 },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 10 },
  location: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 32,
  },
  locationPin: { fontSize: 13 },
  locationText: { fontSize: 13, fontWeight: '500' },
  locationCaret: { fontSize: 11 },
  sectionHeader: { marginBottom: 24 },
  sectionTitle: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  sectionSub: { fontSize: 14 },
  grid: { gap: 16 },
  gridRow: { flexDirection: 'row', gap: 16 },
  footer: { paddingTop: 40, marginTop: 40, borderTopWidth: 1, alignItems: 'center' },
  footerCopy: { fontSize: 12 },
});
