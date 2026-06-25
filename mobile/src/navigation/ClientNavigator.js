import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { colors } from '../theme';
import HomeScreen      from '../screens/client/HomeScreen';
import BarberosScreen  from '../screens/client/BarberosScreen';
import BookingScreen   from '../screens/client/BookingScreen';
import MisCitasScreen  from '../screens/client/MisCitasScreen';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function BarberStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BarberosList" component={BarberosScreen} />
      <Stack.Screen name="Booking"      component={BookingScreen} />
    </Stack.Navigator>
  );
}

const tabIcon = (icon) => ({ focused }) => (
  <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>{icon}</Text>
);

export default function ClientNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.sub,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tab.Screen name="Inicio"    component={HomeScreen}    options={{ tabBarIcon: tabIcon('🏠'), title: 'Inicio' }} />
      <Tab.Screen name="Barberos"  component={BarberStack}   options={{ tabBarIcon: tabIcon('✂️'), title: 'Barberos' }} />
      <Tab.Screen name="MisCitas"  component={MisCitasScreen} options={{ tabBarIcon: tabIcon('📅'), title: 'Mis citas' }} />
    </Tab.Navigator>
  );
}
