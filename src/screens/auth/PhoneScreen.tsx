/**
 * PhoneScreen — combined Login / Sign-Up entry screen.
 *
 * UI matches the design reference:
 *   • Light cream background
 *   • Login | Sign Up pill toggle at the top
 *   • Animated orbiting logo in the centre (reused from SplashScreen)
 *   • "Sign In" / "Create Account" heading + subtitle
 *   • Mobile number field
 *   • OTP row (5 digit boxes) with inline "Send OTP" link
 *   • Large green "Send OTP" / "Verify" CTA button
 *   • Footer link to switch between Login and Sign Up
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { brand } from '@/design/tokens';
import { useOtpAuth } from '@/auth/OtpAuthContext';
import { looksValidIdentifier, OTP_LENGTH, OTP_RESEND_SECONDS } from '@/auth/otpProvider';
import type { RootScreenProps } from '@/navigation/types';
import OrbitingLogo from '@/components/OrbitingLogo';

/* ── palette ── */
const C = {
  bg: '#F2F4EC',        // cream background from the image
  card: '#E8EBE2',      // slightly darker for input cards
  border: '#D8DDD0',
  text: '#1B1B1B',
  textDim: '#6B7266',
  green: '#5FA300',
  greenLight: '#7EC400',
  greenInk: '#17240A',
  white: '#FFFFFF',
  error: '#D93025',
  otpBox: '#EAEEE3',
  otpActive: '#5FA300',
} as const;

type Tab = 'login' | 'signup';
type Step = 'phone' | 'otp';

export default function PhoneScreen({ navigation }: RootScreenProps<'Phone'>) {
  const insets = useSafeAreaInsets();
  const { sendOtp, verifyOtp } = useOtpAuth();

  /* ── state ── */
  const [tab, setTab] = useState<Tab>('login');
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [digits, setDigits] = useState<string[]>(() => Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  /* ── OTP digit refs ── */
  const digitRefs = useRef<Array<TextInput | null>>([]);

  /* ── countdown ── */
  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const id = setInterval(() => setSecondsLeft((v) => v - 1), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  /* ── send OTP ── */
  const handleSendOtp = useCallback(async () => {
    if (!looksValidIdentifier(phone)) {
      setError('Enter a valid 10-digit mobile number or email.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await sendOtp(phone);
      setDigits(Array(OTP_LENGTH).fill(''));
      setStep('otp');
      setSecondsLeft(OTP_RESEND_SECONDS);
      setTimeout(() => digitRefs.current[0]?.focus(), 250);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send the code.');
    } finally {
      setBusy(false);
    }
  }, [phone, sendOtp]);

  /* ── verify OTP ── */
  const handleVerify = useCallback(async () => {
    if (digits.some((d) => d === '')) {
      setError(`Enter all ${OTP_LENGTH} digits.`);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await verifyOtp(phone, digits.join(''));
      // On success the navigator replaces this screen with the app.
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That code is not right. Try again.');
      setBusy(false);
    }
  }, [digits, phone, verifyOtp]);

  /* ── digit helpers ── */
  const setDigit = useCallback((index: number, value: string) => {
    const clean = value.replace(/\D/g, '');
    if (clean.length > 1) {
      setDigits((cur) => {
        const next = [...cur];
        for (let i = 0; i < clean.length && index + i < OTP_LENGTH; i++) {
          next[index + i] = clean[i];
        }
        return next;
      });
      const land = Math.min(index + clean.length, OTP_LENGTH - 1);
      digitRefs.current[land]?.focus();
      return;
    }
    setDigits((cur) => {
      const next = [...cur];
      next[index] = clean.slice(-1);
      return next;
    });
    if (clean && index < OTP_LENGTH - 1) digitRefs.current[index + 1]?.focus();
  }, []);

  const onKeyPress = useCallback(
    (index: number) => (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
      if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
        digitRefs.current[index - 1]?.focus();
      }
    },
    [digits]
  );

  /* ── tab switch resets flow ── */
  const switchTab = (t: Tab) => {
    setTab(t);
    setStep('phone');
    setPhone('');
    setDigits(Array(OTP_LENGTH).fill(''));
    setError(null);
  };

  const isLogin = tab === 'login';
  const heading = step === 'phone'
    ? (isLogin ? 'Sign In' : 'Create Account')
    : 'Enter OTP';
  const subtitle = step === 'phone'
    ? (isLogin ? 'Welcome back! Please enter your details.' : 'Join OneBuddy to get started.')
    : `Code sent to ${phone}`;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* ── back button ── */}
      {step === 'otp' ? (
        <Pressable
          onPress={() => { setStep('phone'); setError(null); }}
          style={[styles.back, { marginTop: 8 }]}
          hitSlop={12}
        >
          <Text style={styles.backText}>{'< Back'}</Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={() => navigation.canGoBack() && navigation.goBack()}
          style={[styles.back, { marginTop: 8 }]}
          hitSlop={12}
        >
          <Text style={styles.backText}>{'< Back'}</Text>
        </Pressable>
      )}

      {/* ── Login | Sign Up tab ── */}
      <View style={styles.tabBar}>
        <Pressable
          onPress={() => switchTab('login')}
          style={[styles.tab, isLogin && styles.tabActive]}
        >
          <Text style={[styles.tabLabel, isLogin && styles.tabLabelActive]}>Login</Text>
        </Pressable>
        <Pressable
          onPress={() => switchTab('signup')}
          style={[styles.tab, !isLogin && styles.tabActive]}
        >
          <Text style={[styles.tabLabel, !isLogin && styles.tabLabelActive]}>Sign Up</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── animated orbiting logo ── */}
        <View style={styles.logoWrap}>
          <OrbitingLogo />
        </View>

        {/* ── heading ── */}
        <Text style={styles.heading}>{heading}</Text>
        <Text style={styles.sub}>{subtitle}</Text>

        {/* ── phone input ── */}
        {step === 'phone' && (
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>MOBILE NUMBER</Text>
            <TextInput
              value={phone}
              onChangeText={(v) => { setPhone(v); setError(null); }}
              placeholder="Enter 10-digit mobile number"
              placeholderTextColor={C.textDim}
              keyboardType="phone-pad"
              returnKeyType="send"
              onSubmitEditing={handleSendOtp}
              style={styles.input}
            />
          </View>
        )}

        {/* ── OTP section ── */}
        {step === 'otp' && (
          <View style={styles.otpCard}>
            <View style={styles.otpHeader}>
              <Text style={styles.inputLabel}>OTP</Text>
              <Pressable
                onPress={secondsLeft > 0 ? undefined : handleSendOtp}
                hitSlop={8}
              >
                <Text style={[styles.sendOtpLink, secondsLeft > 0 && { color: C.textDim }]}>
                  {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : 'Send OTP'}
                </Text>
              </Pressable>
            </View>
            <View style={styles.digitRow}>
              {digits.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={(el) => { digitRefs.current[i] = el; }}
                  value={digit}
                  onChangeText={(v) => setDigit(i, v)}
                  onKeyPress={onKeyPress(i)}
                  keyboardType="number-pad"
                  maxLength={OTP_LENGTH}
                  selectTextOnFocus
                  accessibilityLabel={`OTP digit ${i + 1}`}
                  style={[
                    styles.digitBox,
                    digit ? { borderColor: C.otpActive } : { borderColor: C.border },
                  ]}
                />
              ))}
            </View>
          </View>
        )}

        {/* ── error ── */}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* ── CTA button ── */}
        <Pressable
          onPress={step === 'phone' ? handleSendOtp : handleVerify}
          disabled={busy}
          style={({ pressed }) => [
            styles.cta,
            busy && { opacity: 0.7 },
            pressed && { transform: [{ scale: 0.97 }] },
          ]}
        >
          <LinearGradient
            colors={[C.greenLight, C.green]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
          {busy ? (
            <ActivityIndicator color={C.greenInk} />
          ) : (
            <Text style={styles.ctaLabel}>
              {step === 'phone' ? 'Send OTP' : 'Verify & Continue'}
            </Text>
          )}
        </Pressable>

        {/* ── footer ── */}
        <Text style={styles.footer}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <Text
            style={styles.footerLink}
            onPress={() => switchTab(isLogin ? 'signup' : 'login')}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  back: {
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  backText: {
    fontSize: 15,
    color: C.textDim,
    fontWeight: '500',
  },

  /* tab bar */
  tabBar: {
    flexDirection: 'row',
    backgroundColor: C.card,
    borderRadius: 40,
    marginHorizontal: 24,
    marginTop: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 36,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: C.green,
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textDim,
  },
  tabLabelActive: {
    color: C.white,
  },

  /* scroll */
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },

  /* logo */
  logoWrap: {
    marginTop: 8,
    marginBottom: 4,
  },

  /* heading */
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: C.text,
    marginTop: 4,
    textAlign: 'center',
  },
  sub: {
    fontSize: 14,
    color: C.textDim,
    marginTop: 6,
    marginBottom: 22,
    textAlign: 'center',
    lineHeight: 20,
  },

  /* phone input card */
  inputCard: {
    width: '100%',
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textDim,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    color: C.text,
    paddingVertical: 4,
  },

  /* OTP card */
  otpCard: {
    width: '100%',
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  otpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sendOtpLink: {
    fontSize: 13,
    fontWeight: '600',
    color: C.green,
  },
  digitRow: {
    flexDirection: 'row',
    gap: 8,
  },
  digitBox: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: C.otpBox,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
  },

  /* error */
  error: {
    color: C.error,
    fontSize: 13,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },

  /* CTA */
  cta: {
    width: '100%',
    height: 54,
    borderRadius: 40,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  ctaLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: C.greenInk,
  },

  /* footer */
  footer: {
    fontSize: 14,
    color: C.textDim,
    textAlign: 'center',
  },
  footerLink: {
    color: C.green,
    fontWeight: '700',
  },
});
