/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * OFFLINE TEST HARNESS — NOT part of the shipped app.
 *
 * Implements a tiny subset of Jest's global API (describe/it/expect/beforeEach)
 * so the unit tests in __tests__/*.test.ts can run with plain `tsc` + `node` in
 * this offline sandbox (Jest/ts-jest cannot be installed — npm is blocked).
 *
 * The SAME test files run under real Jest once dependencies are installed on a
 * networked machine (`npm test`), because they only use this common subset.
 */

type Fn = () => void | Promise<void>;

interface TestCase {
  name: string;
  fn: Fn;
  suite: string;
}

const tests: TestCase[] = [];
const beforeEachStack: { suite: string; fn: Fn }[] = [];
let currentSuite = '';

export function describe(name: string, fn: () => void): void {
  const prev = currentSuite;
  currentSuite = prev ? `${prev} › ${name}` : name;
  fn();
  currentSuite = prev;
}

export function it(name: string, fn: Fn): void {
  tests.push({ name, fn, suite: currentSuite });
}
export const test = it;

export function beforeEach(fn: Fn): void {
  beforeEachStack.push({ suite: currentSuite, fn });
}

class Expectation {
  constructor(private actual: any) {}
  private fail(msg: string): never {
    throw new Error(msg);
  }
  toBe(expected: any) {
    if (this.actual !== expected)
      this.fail(`expected ${fmt(this.actual)} to be ${fmt(expected)}`);
  }
  toEqual(expected: any) {
    if (!deepEqual(this.actual, expected))
      this.fail(`expected ${fmt(this.actual)} to equal ${fmt(expected)}`);
  }
  toBeCloseTo(expected: number, digits = 2) {
    const diff = Math.abs(this.actual - expected);
    if (diff > Math.pow(10, -digits) / 2)
      this.fail(`expected ${this.actual} to be close to ${expected}`);
  }
  toBeGreaterThan(n: number) {
    if (!(this.actual > n)) this.fail(`expected ${this.actual} > ${n}`);
  }
  toBeGreaterThanOrEqual(n: number) {
    if (!(this.actual >= n)) this.fail(`expected ${this.actual} >= ${n}`);
  }
  toBeLessThan(n: number) {
    if (!(this.actual < n)) this.fail(`expected ${this.actual} < ${n}`);
  }
  toBeLessThanOrEqual(n: number) {
    if (!(this.actual <= n)) this.fail(`expected ${this.actual} <= ${n}`);
  }
  toBeTruthy() {
    if (!this.actual) this.fail(`expected ${fmt(this.actual)} to be truthy`);
  }
  toBeFalsy() {
    if (this.actual) this.fail(`expected ${fmt(this.actual)} to be falsy`);
  }
  toBeDefined() {
    if (this.actual === undefined) this.fail('expected value to be defined');
  }
  toBeUndefined() {
    if (this.actual !== undefined) this.fail(`expected ${fmt(this.actual)} to be undefined`);
  }
  toContain(sub: any) {
    if (typeof this.actual === 'string') {
      if (!this.actual.includes(sub)) this.fail(`expected "${this.actual}" to contain "${sub}"`);
    } else if (Array.isArray(this.actual)) {
      if (!this.actual.includes(sub)) this.fail(`expected array to contain ${fmt(sub)}`);
    } else this.fail('toContain target must be string or array');
  }
  toHaveLength(n: number) {
    if (this.actual?.length !== n)
      this.fail(`expected length ${n}, got ${this.actual?.length}`);
  }
  get not() {
    return new NotExpectation(this.actual);
  }
}

class NotExpectation {
  constructor(private actual: any) {}
  private fail(msg: string): never {
    throw new Error(msg);
  }
  toBe(expected: any) {
    if (this.actual === expected) this.fail(`expected ${fmt(this.actual)} not to be ${fmt(expected)}`);
  }
  toEqual(expected: any) {
    if (deepEqual(this.actual, expected))
      this.fail(`expected values not to be equal`);
  }
  toContain(sub: any) {
    if (typeof this.actual === 'string' && this.actual.includes(sub))
      this.fail(`expected "${this.actual}" not to contain "${sub}"`);
    if (Array.isArray(this.actual) && this.actual.includes(sub))
      this.fail(`expected array not to contain ${fmt(sub)}`);
  }
}

export function expect(actual: any): Expectation {
  return new Expectation(actual);
}

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a && b && typeof a === 'object') {
    const ka = Object.keys(a);
    const kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    return ka.every((k) => deepEqual(a[k], b[k]));
  }
  return false;
}

function fmt(v: any): string {
  if (typeof v === 'string') return `"${v}"`;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

export async function run(): Promise<void> {
  let passed = 0;
  let failed = 0;
  const failures: string[] = [];

  for (const t of tests) {
    try {
      for (const be of beforeEachStack) {
        if (t.suite.startsWith(be.suite) || be.suite === '') await be.fn();
      }
      await t.fn();
      passed += 1;
      // eslint-disable-next-line no-console
      console.log(`  ✓ ${t.suite} › ${t.name}`);
    } catch (e) {
      failed += 1;
      const msg = `  ✗ ${t.suite} › ${t.name}\n      ${(e as Error).message}`;
      failures.push(msg);
      // eslint-disable-next-line no-console
      console.log(msg);
    }
  }

  // eslint-disable-next-line no-console
  console.log(`\n${passed} passed, ${failed} failed, ${tests.length} total`);
  if (failed > 0) {
    process.exitCode = 1;
  }
}
