/** FailTwin-owned proxy contract. This is not an assumed Croche API endpoint. */
export interface CrocheCompletion {
  model: string;
  system: string;
  user: string;
  context: string[];
}
export interface CrocheClient { completeJson(args: CrocheCompletion): Promise<unknown> }
interface AbortHandle { signal: unknown; abort(): void }
export type ProxyFetch = (url: string, options: {
  method: string; headers: Record<string, string>; body: string; credentials: 'include'; signal: unknown;
}) => Promise<{ ok: boolean; text(): Promise<string> }>;

export function validProxyUrl(endpoint: string): boolean {
  try {
    const url = new URL(endpoint);
    if (url.username || url.password || url.search || url.hash) return false;
    return url.protocol === 'https:' || (url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname));
  } catch { return false; }
}

export function createProxyClient(endpoint: string, options: {
  fetcher?: ProxyFetch; timeoutMs?: number; onStatus?: (connected: boolean) => void;
} = {}): CrocheClient | null {
  if (!validProxyUrl(endpoint)) return null;
  const runtime = globalThis as unknown as { fetch: ProxyFetch; AbortController: new () => AbortHandle };
  const fetcher = options.fetcher ?? runtime.fetch;
  if (!fetcher || !runtime.AbortController) return null;
  return {
    async completeJson(args) {
      const controller = new runtime.AbortController();
      let timer: ReturnType<typeof setTimeout> | undefined;
      const deadline = new Promise<never>((_, reject) => {
        timer = setTimeout(() => { controller.abort(); reject(new Error('AI 서버 응답 시간이 초과됐습니다.')); }, options.timeoutMs ?? 12000);
      });
      try {
        const request = (async () => {
          const response = await fetcher(endpoint, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            credentials: 'include', signal: controller.signal, body: JSON.stringify(args),
          });
          if (!response.ok) throw new Error('AI 서버에 연결하지 못했습니다.');
          const body = await response.text();
          if (body.length > 128000) throw new Error('AI 서버 응답이 너무 큽니다.');
          // Each purpose is further validated by the Real service's Zod schema.
          const data: unknown = JSON.parse(body);
          if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('AI 서버 응답 형식이 잘못됐습니다.');
          return data;
        })();
        const result = await Promise.race([request, deadline]);
        options.onStatus?.(true);
        return result;
      } catch {
        options.onStatus?.(false);
        // Never expose upstream messages, keys, submitted answers or server bodies.
        throw new Error('AI 서버 요청에 실패했습니다. 연결 상태를 확인하고 다시 시도해주세요.');
      } finally { if (timer !== undefined) clearTimeout(timer); }
    },
  };
}

export function createCrocheClient(onStatus?: (connected: boolean) => void): CrocheClient | null {
  if (!process.env.EXPO_PUBLIC_CROCHE_MODEL_CHEAP?.trim() || !process.env.EXPO_PUBLIC_CROCHE_MODEL_QUALITY?.trim()) return null;
  // Only the URL of an authenticated, server-owned proxy is public.
  // The official SDK, model allowlist and CROCHE_API_KEY belong on that server.
  return createProxyClient(process.env.EXPO_PUBLIC_CROCHE_PROXY_URL ?? '', { onStatus });
}
