import React from 'react';
import { Modal, StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import FoodApp from '../categories/food/App';
import { colors } from '../categories/groceries/src/theme';

interface FoodHostProps {
  visible: boolean;
  onClose: () => void;
}

/**
  * FoodHost
  * Hosts the complete React Native Food sub-application from src/categories/food/native-buddy-food
  * full-screen over the OneBuddy WebView dashboard.
  */
export default function FoodHost({
  visible,
  onClose,
}: FoodHostProps): React.JSX.Element | null {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
      key={visible ? 'food-open' : 'food-closed'}
    >
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors?.white || '#FFFFFF'} />
        <FoodApp />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors?.background || '#FFFFFF',
  },
});
