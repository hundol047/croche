/* Ambient Jest-style globals for the offline verification compile.
 * Under real Jest, @types/jest provides these instead. */
declare function describe(name: string, fn: () => void): void;
declare function it(name: string, fn: () => void | Promise<void>): void;
declare function test(name: string, fn: () => void | Promise<void>): void;
declare function beforeEach(fn: () => void | Promise<void>): void;

interface JestExpect {
  toBe(expected: unknown): void;
  toEqual(expected: unknown): void;
  toBeCloseTo(expected: number, digits?: number): void;
  toBeGreaterThan(n: number): void;
  toBeGreaterThanOrEqual(n: number): void;
  toBeLessThan(n: number): void;
  toBeLessThanOrEqual(n: number): void;
  toBeTruthy(): void;
  toBeFalsy(): void;
  toBeDefined(): void;
  toBeUndefined(): void;
  toContain(sub: unknown): void;
  toHaveLength(n: number): void;
  readonly not: JestExpect;
}
declare function expect(actual: unknown): JestExpect;
