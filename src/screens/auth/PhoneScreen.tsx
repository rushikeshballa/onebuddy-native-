import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { brand, schemes } from '@/design/tokens';
import { useAppTheme } from '@/theme/ThemeContext';
import { useOtpAuth } from '@/auth/OtpAuthContext';
import { looksValidIdentifier } from '@/auth/otpProvider';
import type { RootScreenProps } from '@/navigation/types';

export default function PhoneScreen({ navigation }: RootScreenProps<'Phone'>) {
  const { scheme } = useAppTheme();
  const tokens = schemes[scheme];
  const insets = useSafeAreaInsets();
  const { sendOtp } = useOtpAuth();

  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = useCallback(async () => {
    if (!looksValidIdentifier(identifier)) {
      setError('Enter a valid email address or phone number.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await sendOtp(identifier);
      navigation.navigate('Otp', { identifier: identifier.trim() });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not send the code.');
    } finally {
      setBusy(false);
    }
  }, [identifier, navigation, sendOtp]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.root, { backgroundColor: tokens.bgDeep, paddingTop: insets.top + 48 }]}
    >
      <View style={styles.body}>
        <Text style={[styles.wordmark, { color: tokens.text }]}>
          One<Text style={{ color: brand.gold }}>Buddy</Text>
        </Text>
        <Text style={[styles.heading, { color: tokens.text }]}>Log in or sign up</Text>
        <Text style={[styles.sub, { color: tokens.textDim }]}>
          We'll send you a 6-digit code to confirm it's you.
        </Text>

        <TextInput
          value={identifier}
          onChangeText={(next) => {
            setIdentifier(next);
            if (error) setError(null);
          }}
          placeholder="Phone number or email"
          placeholderTextColor={tokens.textDim}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={submit}
          returnKeyType="send"
          style={[
            styles.input,
            {
              color: tokens.text,
              backgroundColor: tokens.ink(0.05),
              borderColor: error ? '#EF4444' : tokens.ink(0.1),
            },
          ]}
        />

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
            <Text style={styles.primaryLabel}>Send OTP</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 28 },
  body: { flex: 1 },
  wordmark: { fontSize: 28, fontWeight: '700', marginBottom: 40 },
  heading: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  sub: { fontSize: 14, marginBottom: 28, lineHeight: 20 },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
  },
  error: { color: '#EF4444', fontSize: 13, marginTop: 10 },
  primary: {
    marginTop: 24,
    height: 52,
    borderRadius: 40,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: { color: brand.ink, fontWeight: '600', fontSize: 16 },
});
