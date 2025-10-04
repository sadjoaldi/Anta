import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../src/hooks/useAuth';

export default function Index() {
  const { isAuthenticated, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0E7C7B" />
      </View>
    );
  }

  // Redirect based on auth state
  return <Redirect href={isAuthenticated ? '/(tabs)' : '/auth/login'} />;
}
