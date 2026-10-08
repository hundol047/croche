import {
  getAIService,
  setAIService,
  getServiceStatus,
  resolveMode,
  MockCrocheAIService,
} from '@/services/ai';

describe('AI service factory & status', () => {
  it('does not send placeholder model identifiers even if a proxy URL is configured', () => {
    const url = process.env.EXPO_PUBLIC_CROCHE_PROXY_URL;
    const cheap = process.env.EXPO_PUBLIC_CROCHE_MODEL_CHEAP;
    const quality = process.env.EXPO_PUBLIC_CROCHE_MODEL_QUALITY;
    process.env.EXPO_PUBLIC_CROCHE_PROXY_URL = 'https://example.com/api';
    delete process.env.EXPO_PUBLIC_CROCHE_MODEL_CHEAP;
    delete process.env.EXPO_PUBLIC_CROCHE_MODEL_QUALITY;
    setAIService(null);
    expect(getAIService('real').kind).toBe('mock');
    expect(getServiceStatus()).toBe('real-unavailable');
    if (url === undefined) delete process.env.EXPO_PUBLIC_CROCHE_PROXY_URL; else process.env.EXPO_PUBLIC_CROCHE_PROXY_URL = url;
    if (cheap === undefined) delete process.env.EXPO_PUBLIC_CROCHE_MODEL_CHEAP; else process.env.EXPO_PUBLIC_CROCHE_MODEL_CHEAP = cheap;
    if (quality === undefined) delete process.env.EXPO_PUBLIC_CROCHE_MODEL_QUALITY; else process.env.EXPO_PUBLIC_CROCHE_MODEL_QUALITY = quality;
    setAIService(null);
  });
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
