import React from 'react';
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import colors from '../../src/theme/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#888',
        tabBarIcon: ({ color, size, focused }) => {
          let name: keyof typeof Ionicons.glyphMap = 'ellipse';
          switch (route.name) {
            case 'home':
              name = focused ? 'home' : 'home-outline';
              break;
            case 'trajet':
              name = focused ? 'car' : 'car-outline';
              break;
            case 'notifications':
              name = focused ? 'notifications' : 'notifications-outline';
              break;
            case 'profile':
              name = focused ? 'person' : 'person-outline';
              break;
          }
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="home" options={{ title: 'Accueil' }} />
      <Tabs.Screen name="search" options={{ href: null }} />
      <Tabs.Screen name="trajet" options={{ title: 'Trajets' }} />
      <Tabs.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
    </Tabs>
  );
}
