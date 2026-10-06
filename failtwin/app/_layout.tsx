import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '@/state/AppContext';
import { colors } from '@/constants/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="practice/index" options={{ presentation: 'card' }} />
          <Stack.Screen name="practice/solve" />
          <Stack.Screen name="analysis" />
          <Stack.Screen name="prediction" />
          <Stack.Screen name="trap/index" />
        </Stack>
      </AppProvider>
    </SafeAreaProvider>
  );
}
