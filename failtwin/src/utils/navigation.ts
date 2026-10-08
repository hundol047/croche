import type { useRouter } from 'expo-router';

/** Finish a learning flow without stacking duplicate dashboards behind it. */
export function goToMain(router: ReturnType<typeof useRouter>, destination: '/(tabs)' | '/(tabs)/report' = '/(tabs)'): void {
  if (router.canDismiss()) router.dismissAll();
  router.replace(destination);
}
