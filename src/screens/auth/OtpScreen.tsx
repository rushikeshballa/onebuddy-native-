import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { brand, schemes } from '@/design/tokens';
import { useAppTheme } from '@/theme/ThemeContext';
import { useOtpAuth } from '@/auth/OtpAuthContext';
import { OTP_LENGTH, OTP_RESEND_SECONDS } from '@/auth/otpProvider';
import type { RootScreenProps } from '@/navigation/types';

export default function OtpScreen({ route }: RootScreenProps<'Otp'>) {
  const { identifier } = route.params;
  const { scheme } = useAppTheme();
  const tokens = schemes[scheme];
  const insets = useSafeAreaInsets();
  const { sendOtp, verifyOtp } = useOtpAuth();

  const [digits, setDigits] = useState<string[]>(() => Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(OTP_RESEND_SECONDS);

  const inputs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const tick = setInterval(() => setSecondsLeft((value) => value - 1), 1000);
    return () => clearInterval(tick);
  }, [secondsLeft]);

  useEffect(() => {
    const focus = setTimeout(() => inputs.current[0]?.focus(), 200);
    return () => clearTimeout(focus);
  }, []);

  const setDigit = useCallback((index: number, value: string) => {
    // A paste lands as several characters in one box; spread it across.
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length > 1) {
      setDigits((current) => {
        const next = [...current];
        for (let i = 0; i < cleaned.length && index + i < OTP_LENGTH; i += 1) {
          next[index + i] = cleaned[i];
        }
        return next;
      });
      const landing = Math.min(index + cleaned.length, OTP_LENGTH - 1);
      inputs.current[landing]?.focus();
      return;
    }

    setDigits((current) => {
      const next = [...current];
      next[index] = cleaned.slice(-1);
      return next;
    });
    if (cleaned && index < OTP_LENGTH - 1) inputs.current[index + 1]?.focus();
  }, []);

  const onKeyPress = useCallback(
    (index: number) => (event: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
      if (event.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
        inputs.current[index - 1]?.focus();
      }
    },
    [digits]
  );

  const submit = useCallback(async () => {
    if (digits.some((digit) => digit === '')) {
      setError(`Enter all ${OTP_LENGTH} digits of the OTP.`);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      // On success the navigator swaps to the app; this screen unmounts.
      await verifyOtp(identifier, digits.join(''));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not verify that code.');
      setBusy(false);
    }
  }, [digits, identifier, verifyOtp]);

  const resend = useCallback(async () => {
    if (secondsLeft > 0) return;
    try {
      await sendOtp(identifier);
      setDigits(Array(OTP_LENGTH).fill(''));
      setSecondsLeft(OTP_RESEND_SECONDS);
      inputs.current[0]?.focus();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not resend the code.');
    }
  }, [identifier, secondsLeft, sendOtp]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.root, { backgroundColor: tokens.bgDeep, paddingTop: insets.top + 48 }]}
    >
      <Text style={[styles.heading, { color: tokens.text }]}>Enter the code</Text>
      <Text style={[styles.sub, { color: tokens.textDim }]}>
        Code sent to <Text style={{ color: tokens.text, fontWeight: '600' }}>{identifier}</Text>
      </Text>

      <View style={styles.row}>
        {digits.map((digit, index) => (
          <TextInput
            key={index}
            ref={(element) => {
              inputs.current[index] = element;
            }}
            value={digit}
            onChangeText={(value) => setDigit(index, value)}
            onKeyPress={onKeyPress(index)}
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            selectTextOnFocus
            accessibilityLabel={`Digit ${index + 1} of ${OTP_LENGTH}`}
            style={[
              styles.box,
              {
                color: tokens.text,
                backgroundColor: tokens.ink(0.05),
                borderColor: digit ? brand.gold : tokens.ink(0.12),
              },
            ]}
          />
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        accessibilityRole="button"
        disabled={busy}
        onPress={submit}
        style={({ pressed }) => [
          styles.primary,
          busy && { opacity: 0.7 },
          pressed && { transform: [{ scale: 0.98 }] },
        ]}
      >
        <LinearGradient
          colors={[brand.goldLight, brand.gold]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
        {busy ? (
          <ActivityIndicator color={brand.ink} />
        ) : (
          <Text style={styles.primaryLabel}>Verify & continue</Text>
        )}
      </Pressable>

      <Pressable
        accessibilityRole="button"
        disabled={secondsLeft > 0}
        onPress={resend}
        style={styles.resend}
      >
        <Text style={[styles.resendLabel, { color: secondsLeft > 0 ? tokens.textDim : brand.gold }]}>
          {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : 'Resend OTP'}
        </Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 28 },
  heading: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  sub: { fontSize: 14, marginBottom: 28, lineHeight: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  box: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '600',
  },
  error: { color: '#EF4444', fontSize: 13, marginTop: 12 },
  primary: {
    marginTop: 24,
    height: 52,
    borderRadius: 40,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: { color: brand.ink, fontWeight: '600', fontSize: 16 },
  resend: { marginTop: 20, alignSelf: 'center' },
  resendLabel: { fontSize: 14, fontWeight: '500' },
});
