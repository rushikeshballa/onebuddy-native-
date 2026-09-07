import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { BRAND_IMAGES, schemes, type Service } from '@/design/tokens';
import { useAppTheme } from '@/theme/ThemeContext';

interface CategoryCardProps {
  service: Service;
  /** Care spanned both columns in the old grid; it keeps a wider ratio. */
  wide?: boolean;
  onPress: () => void;
}

/**
 * The old `.card-wrap` flipped on a `rotateY(180deg)` with
 * `backface-visibility: hidden`. That property is unreliable on Android — both
 * faces bleed through mid-turn — so the flip is not carried over. The card
 * shows its front face and navigates on tap, which is what the flip existed
 * to let you do.
 *
 * If the flip is wanted later: render both faces, interpolate two rotations
 * (0->180 and 180->360) off one value, and swap `opacity`/`zIndex` at the 90°
 * midpoint rather than relying on `backfaceVisibility`.
 */
export default function CategoryCard({ service, wide, onPress }: CategoryCardProps) {
  const { scheme } = useAppTheme();
  const tokens = schemes[scheme];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${service.label}. ${service.blurb}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrap,
        { aspectRatio: wide ? 11 / 7 : 3 / 4, shadowColor: tokens.shadow(1) },
        pressed && { transform: [{ scale: 0.98 }] },
      ]}
    >
      <View style={styles.card}>
        <Image
          source={BRAND_IMAGES.cards[service.id]}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        {/* .card-front::after — bottom scrim so the label stays legible */}
        <LinearGradient
          colors={['transparent', tokens.shadow(0.24)]}
          style={styles.scrim}
        />
        <View style={styles.labelRow}>
          <View style={styles.label}>
            <Text style={styles.labelText}>
              {service.emoji} {service.label}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    borderRadius: 20,
    shadowOpacity: 0.09,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  card: { flex: 1, borderRadius: 20, overflow: 'hidden' },
  scrim: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '60%' },
  labelRow: { flex: 1, justifyContent: 'flex-end', margin: 12 },
  label: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  labelText: { fontWeight: '600', fontSize: 14, color: '#FFFFFF' },
});
