import {
  getAIService,
  setAIService,
  getServiceStatus,
  resolveMode,
  MockCrocheAIService,
} from '@/services/ai';

describe('AI service factory & status', () => {
  it('defaults to mock mode and reports mock status', () => {
    setAIService(null); // reset singleton
    const svc = getAIService('mock');
    expect(svc.kind).toBe('mock');
    expect(getServiceStatus()).toBe('mock');
  });

  it('falls back to Mock and reports real-unavailable when real is requested but no client exists', () => {
    setAIService(null);
    // No EXPO_PUBLIC_CROCHE_BASE_URL set -> createCrocheClient() returns null.
    const svc = getAIService('real');
    expect(svc.kind).toBe('mock'); // functional fallback
    expect(getServiceStatus()).toBe('real-unavailable'); // honest status, not "real"
  });

  it('setAIService records the injected service kind as status', () => {
    setAIService(new MockCrocheAIService({ latencyMs: 0 }));
    expect(getServiceStatus()).toBe('mock');
    setAIService(null);
  });

  it('resolveMode reads env (defaults to mock)', () => {
    const prev = process.env.EXPO_PUBLIC_CROCHE_MODE;
    delete process.env.EXPO_PUBLIC_CROCHE_MODE;
    expect(resolveMode()).toBe('mock');
    process.env.EXPO_PUBLIC_CROCHE_MODE = 'real';
    expect(resolveMode()).toBe('real');
    process.env.EXPO_PUBLIC_CROCHE_MODE = prev;
  });
});
