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
            case 'search':
              name = focused ? 'search' : 'search-outline';
              break;
            case 'trajet':
              name = focused ? 'bicycle' : 'bicycle-outline';
              break;
            case 'messages':
              name = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'profile':
              name = focused ? 'person' : 'person-outline';
              break;
          }
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="search" options={{ title: 'Search' }} />
      <Tabs.Screen name="trajet" options={{ title: 'Trajet' }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
