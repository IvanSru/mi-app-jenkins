import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import LoginScreen from '../screens/auth/LoginScreen';
import ClientNavigator from './ClientNavigator';
import BarberNavigator from './BarberNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : user.role === 'barber' || user.role === 'admin' ? (
          <Stack.Screen name="BarberRoot" component={BarberNavigator} />
        ) : (
          <Stack.Screen name="ClientRoot" component={ClientNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
