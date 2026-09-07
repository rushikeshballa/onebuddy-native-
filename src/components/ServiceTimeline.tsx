import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { SERVICES, brand, schemes } from '@/design/tokens';
import { useAppTheme } from '@/theme/ThemeContext';

interface ServiceTimelineProps {
  activeIndex: number;
  onSelect: (index: number) => void;
}

/**
 * `.timeline` from base.css: a hairline track, a gradient progress fill, and
 * one node per vertical. Width animation cannot use the native driver, so the
 * fill runs on a scaleX with a left transform origin instead — same look,
 * still on the UI thread.
 */
export default function ServiceTimeline({ activeIndex, onSelect }: ServiceTimelineProps) {
  const { scheme } = useAppTheme();
  const tokens = schemes[scheme];
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: activeIndex / (SERVICES.length - 1),
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [activeIndex, progress]);

  return (
    <View style={styles.root}>
      <View style={styles.track}>
        <View style={[styles.line, { backgroundColor: tokens.ink(0.1) }]} />
        <Animated.View
          style={[
            styles.fill,
            {
              // scaleX about the left edge: shift by half the shortfall.
              transform: [
                { translateX: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-0.5, 0],
                  }) },
                { scaleX: progress },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={[brand.lavenderLight, brand.gold]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>

      <View style={styles.nodes}>
        {SERVICES.map((service, index) => {
          const active = index === activeIndex;
          const done = index < activeIndex;
          return (
            <Pressable
              key={service.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => onSelect(index)}
              style={styles.node}
            >
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: done ? brand.lavender : tokens.bgDeep,
                    borderColor: active
                      ? brand.gold
                      : done
                        ? brand.lavenderLight
                        : tokens.ink(0.2),
                  },
                ]}
              />
              <Text
                style={[
                  styles.label,
                  { color: active ? brand.gold : tokens.textDim },
                  active && styles.labelActive,
                ]}
              >
                {service.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { marginBottom: 24, maxWidth: 600, alignSelf: 'stretch' },
  track: { position: 'absolute', top: 12, left: 16, right: 16, height: 2 },
  line: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  nodes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  node: { alignItems: 'center', gap: 6 },
  dot: { width: 26, height: 26, borderRadius: 13, borderWidth: 2 },
  label: { fontSize: 10 },
  labelActive: { fontWeight: '600' },
});
