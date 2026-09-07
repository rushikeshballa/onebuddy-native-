import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '../../firebase/context/AuthContext';
import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';
import { COLORS } from './authColors';

/**
 * Root-level gate: renders the signed-out flow (login/signup) while there's
 * no Firebase user, otherwise mounts the real app. If Firebase isn't
 * configured at all (`.env` missing — see `.env.example`), the app runs in
 * local-only mode exactly as it did before this backend layer existed,
 * rather than locking the person out.
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, initializing, enabled } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  if (!enabled) {
    return <>{children}</>;
  }

  if (initializing) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={COLORS.accentStart} size="large" />
      </View>
    );
  }

  if (!user) {
    return mode === 'login' ? (
      <LoginScreen onSwitchToSignup={() => setMode('signup')} />
    ) : (
      <SignupScreen onSwitchToLogin={() => setMode('login')} />
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
});
