import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useApp } from '@/state/AppContext';
import { colors } from '@/constants/theme';

/** Routing gate: wait for bootstrap, then send to onboarding or home. */
export default function Index() {
  const { ready, profile } = useApp();

  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand} size="large" />
      </View>
    );
  }

  return <Redirect href={profile ? '/(tabs)' : '/onboarding'} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
});
