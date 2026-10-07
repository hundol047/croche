import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from '@/state/AppContext';
import { Screen } from '@/components/Screen';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { colors } from '@/constants/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <AppNavigation />
      </AppProvider>
    </SafeAreaProvider>
  );
}

function AppNavigation() {
  const { ready, profile, bootstrapError, retryBootstrap } = useApp();
  const router = useRouter();
  const segments = useSegments();
  useEffect(() => {
    if (ready && !profile && segments[0] !== 'onboarding') router.replace('/onboarding');
  }, [ready, profile, router, segments]);
  if (!ready) return <Screen>{bootstrapError
    ? <ErrorState message="학습 기록을 불러오지 못했어요. 브라우저의 저장 공간을 확인하고 다시 시도해주세요." onRetry={retryBootstrap} />
    : <LoadingState message="학습 기록을 불러오고 있어요" />}</Screen>;
  return (
    <View style={styles.canvas}><View style={styles.frame}>
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
    </View></View>
  );
}

const styles = StyleSheet.create({
  canvas: { flex: 1, backgroundColor: colors.bg },
  frame: { flex: 1, width: '100%', maxWidth: 600, alignSelf: 'center' },
});
