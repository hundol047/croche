/* Minimal ambient declarations for the offline verification compile only.
 * Real builds use @types/node, react-native and DOM libs from node_modules. */
declare const process: {
  env: Record<string, string | undefined>;
  exitCode?: number;
};
declare function require(id: string): any;
declare function setTimeout(fn: (...args: unknown[]) => void, ms?: number): unknown;

declare const navigator: { product?: string } | undefined;
declare const localStorage:
  | {
      getItem(key: string): string | null;
      setItem(key: string, value: string): void;
      removeItem(key: string): void;
      length: number;
      key(i: number): string | null;
    }
  | undefined;

declare const console: {
  log(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
};
