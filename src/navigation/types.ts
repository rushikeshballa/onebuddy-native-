import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ServiceId } from '@/design/tokens';

/**
 * Replaces the old `WebViewMessageType` union in `src/webview/types.ts`.
 *
 * Every row that used to `postMessage({ type: 'openX' })` up to
 * `OneBuddyScreen` is now a route: the same destinations, checked at compile
 * time instead of at runtime on a device.
 */
export type RootStackParamList = {
  Splash: undefined;
  Phone: undefined;
  /** `identifier` is the email or phone the code was sent to. */
  Otp: { identifier: string };
  Tabs: undefined;

  /** Category sub-apps, opened from the dashboard cards. */
  Food: undefined;
  Groceries: undefined;

  /** Settings destinations — previously `openAppSettings` and friends. */
  AppSettings: undefined;
  SecurityPrivacy: undefined;
  HelpSupport: undefined;
  About: undefined;
  Payments: undefined;
  OrdersAndBookings: undefined;
  Addresses: undefined;
  Notifications: undefined;
};

export type TabParamList = {
  HomeTab: undefined;
  OrdersTab: undefined;
  AccountTab: undefined;
};

export type RootScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

/** Dashboard card -> route. Food and Groceries have real native sub-apps. */
export const SERVICE_ROUTE: Record<ServiceId, keyof RootStackParamList | null> = {
  food: 'Food',
  grocery: 'Groceries',
  ride: null,
  home: null,
  care: null,
};
