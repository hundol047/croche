import { createProxyClient, validProxyUrl } from '@/services/croche/client';
import type { ProxyFetch } from '@/services/croche/client';

const args = { model: 'verified-model', system: 'JSON only', user: '{}', context: [] };

describe('server-owned AI proxy boundary', () => {
  it('allows HTTPS and loopback development but rejects credential-bearing/insecure URLs', () => {
    expect(validProxyUrl('https://example.com/api/complete')).toBe(true);
    expect(validProxyUrl('http://127.0.0.1:9000/api/complete')).toBe(true);
    for (const u of ['http://example.com/api', 'https://key:secret@example.com', 'https://example.com?key=secret', 'javascript:alert(1)', 'http://localhost.evil/api', '']) {
      expect(validProxyUrl(u)).toBe(false);
    }
  });
  it('posts only the completion contract and uses server-session credentials', async () => {
    let received: Parameters<ProxyFetch>[1] | undefined;
    const fetcher: ProxyFetch = async (_, options) => { received = options; return { ok: true, text: async () => '{"isCorrect":true}' }; };
    let connected = false;
    const client = createProxyClient('https://example.com/api', { fetcher, onStatus: (status) => { connected = status; } })!;
    expect(await client.completeJson(args)).toEqual({ isCorrect: true });
    expect(received!.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(received!.credentials).toBe('include');
    expect(JSON.parse(received!.body)).toEqual(args);
    expect(connected).toBe(true);
  });
  it('does not expose failed server response bodies or credentials', async () => {
    const client = createProxyClient('https://example.com/api', { fetcher: async () => ({ ok: false, text: async () => 'SECRET_PROVIDER_KEY' }) })!;
    let message = '';
    try { await client.completeJson(args); } catch (e) { message = (e as Error).message; }
    expect(message).toContain('실패'); expect(message).not.toContain('SECRET_PROVIDER_KEY');
  });
  it('aborts a stalled request and reports connection failure without silently returning Mock', async () => {
    let signal: { aborted: boolean } | undefined; let connected = true;
    const fetcher: ProxyFetch = (_, options) => { signal = options.signal as { aborted: boolean }; return new Promise(() => undefined); };
    const client = createProxyClient('https://example.com/api', { fetcher, timeoutMs: 5, onStatus: (s) => { connected = s; } })!;
    let failed = false;
    try { await client.completeJson(args); } catch { failed = true; }
    expect(failed).toBe(true); expect(signal!.aborted).toBe(true); expect(connected).toBe(false);
  });
  it('rejects invalid JSON, scalar and excessive server bodies', async () => {
    for (const body of ['invalid', '42', '[{}]', '{}'.repeat(65000)]) {
      const client = createProxyClient('https://example.com/api', { fetcher: async () => ({ ok: true, text: async () => body }) })!;
      let failed = false;
      try { await client.completeJson(args); } catch { failed = true; }
      expect(failed).toBe(true);
    }
  });
});
