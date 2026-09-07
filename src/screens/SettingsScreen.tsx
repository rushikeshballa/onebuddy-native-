import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/theme/ThemeContext";
import { useSettings } from "@/context/SettingsContext";
import { useTranslation } from "@/i18n/useTranslation";
import { useResponsive } from "@/utils/responsive";
import { CardGroup, SettingsRow } from "@/components/SettingsRow";

import { SectionLabel } from "@/components/SectionLabel";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import { SavedToast } from "@/components/SavedToast";
import { LanguageModal } from "@/components/LanguageModal";
import { languageLabel, LANGUAGES } from "@/i18n/translations";
import { ChevronLeft, ChevronRight, GlobeIcon, PinIcon, ThemeIcon, UsageIcon, WalletIcon, X } from "@/components/icons";
import { ThemeSetting } from "@/types";
import PaymentsScreen from "../native/screens/Payments/PaymentsScreen";

interface SettingsScreenProps {
  /** Wire these to your navigation stack, e.g. navigation.goBack(). */
  onBack?: () => void;
  onClose?: () => void;
  onOpenPayments?: () => void;
}

export function SettingsScreen({ onBack, onClose, onOpenPayments }: SettingsScreenProps) {
  const { colors, scheme } = useAppTheme();
  const { state, setTheme, toggleLocationAccess, toggleShareUsageData } = useSettings();
  const { t } = useTranslation();
  const { moderateScale, horizontalPadding, contentMaxWidth, isTablet } = useResponsive();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [paymentsVisible, setPaymentsVisible] = useState(false);

  const currentLanguage =
    LANGUAGES.find((l) => l.code === state.language) ?? LANGUAGES[0];

  if (paymentsVisible) {
    return (
      <PaymentsScreen
        onBack={() => setPaymentsVisible(false)}
      />
    );
  }



  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.sheetBg }]}>
      <StatusBar barStyle={scheme === "dark" ? "light-content" : "dark-content"} />

      <View style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel={t("settings_back")}
          style={[styles.backBtn, { backgroundColor: colors.iconBg }]}
        >
          <ChevronLeft size={20} color={colors.text} />
          <Text style={[styles.backBtnLabel, { color: colors.text }]}>
            {t("settings_back")}
          </Text>
        </Pressable>

        <View style={styles.titleWrap}>
          <Text
            style={[styles.headerTitle, { color: colors.text, fontSize: moderateScale(19, 0.25) }]}
          >
            {t("settings_title")}
          </Text>
          <Text
            style={[styles.headerSubtitle, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {t("settings_autosave")}
          </Text>
        </View>

        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t("settings_close")}
          style={[styles.iconBtn, { backgroundColor: colors.iconBg }]}
        >
          <X size={20} color={colors.text} />
        </Pressable>
      </View>
      <View style={[styles.divider, { backgroundColor: colors.divider }]} />

      {/* On tablets/landscape the column caps out and stays centered so
          rows never stretch into an awkward full-bleed line. */}
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingHorizontal: horizontalPadding,
            alignItems: isTablet ? "center" : "stretch"
          }
        ]}
      >
        <View style={{ width: "100%", maxWidth: contentMaxWidth }}>
          {/* APPEARANCE */}
          <SectionLabel>{t("settings_section_appearance")}</SectionLabel>
          <CardGroup>
            <SettingsRow
              icon={<ThemeIcon color={colors.accentStart} />}
              title={t("settings_theme_dark")}
              right={
                <ToggleSwitch
                  value={state.theme === "dark"}
                  onValueChange={() => setTheme(state.theme === "dark" ? "light" : "dark")}
                  accessibilityLabel={t("settings_theme_dark")}
                />
              }
            />
            <SettingsRow
              icon={<ThemeIcon color={colors.accentStart} />}
              title={t("settings_theme_system")}
              right={
                <ToggleSwitch
                  value={state.theme === "system"}
                  onValueChange={() => setTheme(state.theme === "system" ? "light" : "system")}
                  accessibilityLabel={t("settings_theme_system")}
                />
              }
              isLast
            />
          </CardGroup>

          {/* LANGUAGE */}
          <SectionLabel>{t("settings_section_language")}</SectionLabel>
          <CardGroup>
            <SettingsRow
              icon={<GlobeIcon color={colors.text} />}
              title={t("settings_section_language")}
              onPress={() => setLanguageModalVisible(true)}
              right={
                <>
                  <Text style={[styles.rowValue, { color: colors.accentStart }]}>
                    {languageLabel(currentLanguage).split(" · ")[0]}
                  </Text>
                  <View style={styles.chevronGap}>
                    <ChevronRight size={16} color={colors.textTertiary} />
                  </View>
                </>
              }
              isLast
            />
          </CardGroup>

          {/* LOCATION — silent toggle: no toast/warning on change, ever. */}
          <SectionLabel>{t("settings_section_location")}</SectionLabel>
          <CardGroup>
            <SettingsRow
              icon={<PinIcon color={colors.text} />}
              title={t("settings_location_title")}
              subtitle={t("settings_location_desc")}
              right={
                <ToggleSwitch
                  value={state.locationAccess}
                  onValueChange={toggleLocationAccess}
                  accessibilityLabel={t("settings_location_title")}
                />
              }
              isLast
            />
          </CardGroup>

          {/* PAYMENTS */}
          <SectionLabel>{t("settings_section_payments")}</SectionLabel>
          <CardGroup>
            <SettingsRow
              icon={<WalletIcon color={colors.accentStart} />}
              title={t("settings_payments_title")}
              subtitle={t("settings_payments_desc")}
              onPress={() => {
                setPaymentsVisible(true);
                onOpenPayments?.();
              }}
              right={
                <View style={styles.chevronGap}>
                  <ChevronRight size={16} color={colors.textTertiary} />
                </View>
              }
              isLast
            />
          </CardGroup>

          {/* PRIVACY */}
          <SectionLabel>{t("settings_section_privacy")}</SectionLabel>
          <CardGroup>
            <SettingsRow
              icon={<UsageIcon color={colors.text} />}
              title={t("settings_usage_title")}
              subtitle={t("settings_usage_desc")}
              right={
                <ToggleSwitch
                  value={state.shareUsageData}
                  onValueChange={toggleShareUsageData}
                  accessibilityLabel={t("settings_usage_title")}
                />
              }
              isLast
            />
          </CardGroup>
        </View>
      </ScrollView>

      <SavedToast />
      <LanguageModal
        visible={languageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12
  },
  titleWrap: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8
  },
  headerTitle: { fontWeight: "800", textAlign: "center" },
  headerSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    paddingTop: 2,
    textAlign: "center"
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center"
  },
  backBtn: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    paddingHorizontal: 6
  },
  backBtnLabel: {
    fontSize: 10,
    marginTop: 2
  },
  divider: { height: 1 },
  scroll: { paddingBottom: Platform.select({ ios: 32, default: 24 }) },
  rowValue: { fontSize: 13, fontWeight: "700" },
  chevronGap: { marginLeft: 6, opacity: 0.6 }
});