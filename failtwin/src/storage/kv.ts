/**
 * Minimal async key-value abstraction. Platform-selected at runtime:
 *  - native: @react-native-async-storage/async-storage
 *  - web: window.localStorage
 *  - test/node: in-memory map
 *
 * The RN/web implementations are loaded lazily so the pure-logic bundle (and
 * node-based tests) never import react-native.
 */
export interface KVStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  getAllKeys(): Promise<string[]>;
}

export class MemoryKVStore implements KVStore {
  private map = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    return this.map.has(key) ? this.map.get(key)! : null;
  }
  async setItem(key: string, value: string): Promise<void> {
    this.map.set(key, value);
  }
  async removeItem(key: string): Promise<void> {
    this.map.delete(key);
  }
  async getAllKeys(): Promise<string[]> {
    return [...this.map.keys()];
  }
}

interface WebStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  readonly length: number;
  key(index: number): string | null;
}

function webStorage(): WebStorageLike {
  return (globalThis as unknown as { localStorage: WebStorageLike }).localStorage;
}

class WebKVStore implements KVStore {
  async getItem(key: string): Promise<string | null> {
    return webStorage().getItem(key);
  }
  async setItem(key: string, value: string): Promise<void> {
    webStorage().setItem(key, value);
  }
  async removeItem(key: string): Promise<void> {
    webStorage().removeItem(key);
  }
  async getAllKeys(): Promise<string[]> {
    const ls = webStorage();
    const out: string[] = [];
    for (let i = 0; i < ls.length; i += 1) {
      const k = ls.key(i);
      if (k) out.push(k);
    }
    return out;
  }
}

let singleton: KVStore | null = null;

/**
 * Resolve the platform store. Uses dynamic require so that importing this
 * module in a node/test context does not pull in react-native.
 */
export function getKV(): KVStore {
  if (singleton) return singleton;

  const g = globalThis as unknown as {
    localStorage?: unknown;
    navigator?: { product?: string };
  };

  const isReactNative = g.navigator?.product === 'ReactNative';
  if (isReactNative) {
    try {
      // `require` is available in React Native (Metro) and CommonJS. Dynamic so
      // the pure-logic / web bundles never eagerly import react-native.
      // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
      const mod = require('@react-native-async-storage/async-storage') as { default: KVStore };
      singleton = mod.default;
      return singleton;
    } catch {
      // fall through to other stores
    }
  }

  if (typeof g.localStorage !== 'undefined') {
    singleton = new WebKVStore();
    return singleton;
  }

  singleton = new MemoryKVStore();
  return singleton;
}

/** Test/seed hook to inject a specific store. */
export function setKV(store: KVStore): void {
  singleton = store;
}
