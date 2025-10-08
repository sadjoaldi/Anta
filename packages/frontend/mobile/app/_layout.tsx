import { ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import React from "react";
import { AuthProvider } from "../src/contexts/AuthContext";
import { navTheme } from "../src/theme/navTheme";

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider value={navTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/register" />
          <Stack.Screen name="auth/verify-otp" options={{ headerShown: false }} />
          <Stack.Screen name="auth/complete-profile" options={{ headerShown: false }} />
          <Stack.Screen 
            name="driver/register" 
            options={{ 
              headerShown: true,
              title: "Devenir chauffeur",
              headerBackTitle: "Retour"
            }} 
          />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}
