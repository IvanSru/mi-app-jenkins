import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { colors } from '../theme';
import DashboardScreen  from '../screens/barber/DashboardScreen';
import SolicitudesScreen from '../screens/barber/SolicitudesScreen';

const Tab = createBottomTabNavigator();

const tabIcon = (icon) => ({ focused }) => (
  <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>{icon}</Text>
);

export default function BarberNavigator() {
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
      <Tab.Screen name="Dashboard"   component={DashboardScreen}   options={{ tabBarIcon: tabIcon('📊'), title: 'Dashboard' }} />
      <Tab.Screen name="Solicitudes" component={SolicitudesScreen} options={{ tabBarIcon: tabIcon('🔔'), title: 'Solicitudes' }} />
    </Tab.Navigator>
  );
}
