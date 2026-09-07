/**
 * Auth screens render above `SettingsProvider`/`ThemeProvider` (they gate
 * whether the rest of the app — including those providers — mounts at all),
 * so they can't use `useAppTheme()`. This mirrors the dark palette from
 * `src/theme/colors.ts` and `AddressHost`'s `APP_BG` so there's no visible
 * flash when the gate hands off to the main app.
 */
export const COLORS = {
  bg: '#121214',
  cardBg: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.08)',
  text: '#F1F1EC',
  textSecondary: '#9BA08F',
  placeholder: '#6B7266',
  accentStart: '#5FA300',
  accentText: '#FFFFFF',
  danger: '#EF4444',
};
