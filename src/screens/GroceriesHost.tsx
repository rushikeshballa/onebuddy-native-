import React from 'react';
import { Modal, StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { UserProvider } from '../categories/groceries/src/context/UserContext';
import { CartProvider } from '../categories/groceries/src/context/CartContext';
import { WishlistProvider } from '../categories/groceries/src/context/WishlistContext';
import { GroceriesExitContext } from '../categories/groceries/src/context/GroceriesExitContext';
import { RootNavigator } from '../categories/groceries/src/navigation/RootNavigator';
import { colors } from '../categories/groceries/src/theme';

interface GroceriesHostProps {
  visible: boolean;
  onClose: () => void;
}

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.white,
    text: colors.textPrimary,
    border: colors.borderLight,
    primary: colors.primary,
  },
};

/**
  * GroceriesHost
  * Hosts the complete React Native Grocery sub-application from src/categories/groceries
  * full-screen over the OneBuddy WebView dashboard.
  */
export default function GroceriesHost({
  visible,
  onClose,
}: GroceriesHostProps): React.JSX.Element | null {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
      key={visible ? 'groceries-open' : 'groceries-closed'}
    >
      <SafeAreaProvider>
        <UserProvider>
          <CartProvider>
            <WishlistProvider>
              <GroceriesExitContext.Provider value={{ onClose }}>
                <View style={styles.container}>
                  <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
                  <NavigationContainer theme={navigationTheme}>
                    <RootNavigator />
                  </NavigationContainer>
                </View>
              </GroceriesExitContext.Provider>
            </WishlistProvider>
          </CartProvider>
        </UserProvider>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
