import type { CrocheAIService } from './CrocheAIService';
import { MockCrocheAIService } from './MockCrocheAIService';
import { RealCrocheAIService } from './RealCrocheAIService';
import { createCrocheClient } from '@/services/croche/client';

export type CrocheMode = 'mock' | 'real';

export function resolveMode(): CrocheMode {
  const env = (process.env.EXPO_PUBLIC_CROCHE_MODE ?? 'mock').toLowerCase();
  return env === 'real' ? 'real' : 'mock';
}

let singleton: CrocheAIService | null = null;

/**
 * The single factory the app uses to obtain the AI service.
 *
 * - mode=real + a configured client → RealCrocheAIService
 * - otherwise → MockCrocheAIService (always works, no network/SDK)
 *
 * This is the ONE place to flip once Croche access is granted.
 */
export function getAIService(mode: CrocheMode = resolveMode()): CrocheAIService {
  if (singleton) return singleton;

  if (mode === 'real') {
    const client = createCrocheClient();
    if (client) {
      singleton = new RealCrocheAIService(client);
      return singleton;
    }
    // Configured for real but no client available → fall back to mock so the
    // app still runs. (Logged for the developer.)
    // eslint-disable-next-line no-console
    console.warn(
      '[FailTwin] CROCHE_MODE=real but no Croche client configured. Falling back to MockCrocheAIService.',
    );
  }

  singleton = new MockCrocheAIService();
  return singleton;
}

/** Test hook. */
export function setAIService(svc: CrocheAIService | null): void {
  singleton = svc;
}

export type { CrocheAIService } from './CrocheAIService';
export { MockCrocheAIService } from './MockCrocheAIService';
export { RealCrocheAIService } from './RealCrocheAIService';
