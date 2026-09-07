import React from 'react';
import { Modal, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HelpSupportScreen from '../native/screens/HelpSupport/screens/HelpAndSupportScreen';
import { COLORS } from '../native/constants/colors';

interface HelpSupportHostProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Opens the help project's screen full-screen over the WebView. The screen owns
 * all of its own state — search, FAQ sheet, chat thread — and none of it is
 * persisted, so unlike the other two hosts there is nothing to seed or relay.
 *
 * HelpAndSupportScreen (and everything under native/screens/HelpSupport) is kept
 * byte-for-byte as shipped in HelpAndSupportApp-SDK57-FIXED.zip — it takes no
 * props, so this host doesn't pass any. Closing the modal is handled here:
 * onRequestClose covers the Android hardware back button, and OneBuddyScreen's
 * BackHandler also routes back-presses to onClose while this modal is open.
 */
export default function HelpSupportHost({
  visible,
  onClose,
}: HelpSupportHostProps): React.JSX.Element {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
      // Remounting on each open clears the previous search and chat draft.
      key={visible ? 'help-open' : 'help-closed'}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <HelpSupportScreen />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
});
