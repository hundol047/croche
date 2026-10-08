/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * OFFLINE VERIFICATION SHIM — NOT part of the shipped app.
 *
 * This is a tiny, dependency-free re-implementation of the subset of the `zod`
 * API that FailTwin's schemas.ts / tools.ts use. It exists ONLY so the pure-TS
 * domain logic can be type-checked and unit-tested in this offline sandbox,
 * where the real `zod` package cannot be installed (npm registry blocked).
 *
 * The production app uses the REAL `zod` from node_modules (see package.json).
 * `tsconfig.logic.json` maps `zod` → this shim; the Expo tsconfig does not.
 *
 * It implements real validation semantics for the constraints we rely on so the
 * tests are meaningful (not a no-op).
 */

export interface ZodIssue {
  path: (string | number)[];
  message: string;
}
export type SafeParseReturn<T> =
  | { success: true; data: T }
  | { success: false; error: { issues: ZodIssue[] } };

abstract class ZodBase<T> {
  _isOptional = false;
  _default: (() => T) | undefined;

  abstract _check(value: unknown, path: (string | number)[]): ZodIssue[];
  abstract _coerce(value: unknown): unknown;

  optional(): this {
    const c = this.clone();
    c._isOptional = true;
    return c;
  }
  default(v: T): this {
    const c = this.clone();
    c._default = () => v;
    c._isOptional = true;
    return c;
  }
  protected clone(): this {
    const copy = Object.create(Object.getPrototypeOf(this));
    Object.assign(copy, this);
    return copy;
  }

  safeParse(value: unknown): SafeParseReturn<T> {
    const issues = this._root(value, []);
    if (issues.length) return { success: false, error: { issues } };
    return { success: true, data: this._finalize(value) as T };
  }
  _root(value: unknown, path: (string | number)[]): ZodIssue[] {
    if (value === undefined) {
      if (this._isOptional) return [];
      return [{ path, message: 'required' }];
    }
    return this._check(value, path);
  }
  _finalize(value: unknown): unknown {
    if (value === undefined && this._default) return this._default();
    return this._coerce(value);
  }
}

class ZodString extends ZodBase<string> {
  private _min?: number;
  private _max?: number;
  private _regex?: { re: RegExp; msg: string };
  min(n: number) {
    const c = this.clone();
    c._min = n;
    return c;
  }
  max(n: number) {
    const c = this.clone();
    c._max = n;
    return c;
  }
  regex(re: RegExp, msg = 'invalid format') {
    const c = this.clone();
    c._regex = { re, msg };
    return c;
  }
  _check(value: unknown, path: (string | number)[]): ZodIssue[] {
    if (typeof value !== 'string') return [{ path, message: 'expected string' }];
    if (this._min !== undefined && value.length < this._min)
      return [{ path, message: `min length ${this._min}` }];
    if (this._max !== undefined && value.length > this._max)
      return [{ path, message: `max length ${this._max}` }];
    if (this._regex && !this._regex.re.test(value))
      return [{ path, message: this._regex.msg }];
    return [];
  }
  _coerce(v: unknown) {
    return v;
  }
}

class ZodNumber extends ZodBase<number> {
  private _min?: number;
  private _max?: number;
  private _int = false;
  min(n: number) {
    const c = this.clone();
    c._min = n;
    return c;
  }
  max(n: number) {
    const c = this.clone();
    c._max = n;
    return c;
  }
  int() {
    const c = this.clone();
    c._int = true;
    return c;
  }
  _check(value: unknown, path: (string | number)[]): ZodIssue[] {
    if (typeof value !== 'number' || Number.isNaN(value))
      return [{ path, message: 'expected number' }];
    if (this._int && !Number.isInteger(value)) return [{ path, message: 'expected integer' }];
    if (this._min !== undefined && value < this._min)
      return [{ path, message: `min ${this._min}` }];
    if (this._max !== undefined && value > this._max)
      return [{ path, message: `max ${this._max}` }];
    return [];
  }
  _coerce(v: unknown) {
    return v;
  }
}

class ZodBoolean extends ZodBase<boolean> {
  _check(value: unknown, path: (string | number)[]): ZodIssue[] {
    return typeof value === 'boolean' ? [] : [{ path, message: 'expected boolean' }];
  }
  _coerce(v: unknown) {
    return v;
  }
}

class ZodEnum<T extends string> extends ZodBase<T> {
  constructor(private values: readonly T[]) {
    super();
  }
  _check(value: unknown, path: (string | number)[]): ZodIssue[] {
    return this.values.includes(value as T)
      ? []
      : [{ path, message: `expected one of ${this.values.join(', ')}` }];
  }
  _coerce(v: unknown) {
    return v;
  }
}

class ZodArray<T> extends ZodBase<T[]> {
  private _min?: number;
  private _max?: number;
  constructor(private element: ZodBase<T>) {
    super();
  }
  min(n: number) {
    const c = this.clone();
    c._min = n;
    return c;
  }
  max(n: number) {
    const c = this.clone();
    c._max = n;
    return c;
  }
  _check(value: unknown, path: (string | number)[]): ZodIssue[] {
    if (!Array.isArray(value)) return [{ path, message: 'expected array' }];
    if (this._min !== undefined && value.length < this._min)
      return [{ path, message: `min items ${this._min}` }];
    if (this._max !== undefined && value.length > this._max)
      return [{ path, message: `max items ${this._max}` }];
    const issues: ZodIssue[] = [];
    value.forEach((v, i) => issues.push(...this.element._root(v, [...path, i])));
    return issues;
  }
  _coerce(value: unknown) {
    return (value as unknown[]).map((v) => this.element._finalize(v));
  }
}

type Shape = Record<string, ZodBase<any>>;
class ZodObject<T> extends ZodBase<T> {
  private refinements: { fn: (v: any) => boolean; msg: string; path: (string | number)[] }[] = [];
  constructor(private shape: Shape) {
    super();
  }
  _check(value: unknown, path: (string | number)[]): ZodIssue[] {
    if (typeof value !== 'object' || value === null || Array.isArray(value))
      return [{ path, message: 'expected object' }];
    const obj = value as Record<string, unknown>;
    const issues: ZodIssue[] = [];
    for (const key of Object.keys(this.shape)) {
      issues.push(...this.shape[key]!._root(obj[key], [...path, key]));
    }
    if (issues.length) return issues;
    const finalized = this._coerce(value);
    for (const r of this.refinements) {
      if (!r.fn(finalized)) issues.push({ path: [...path, ...r.path], message: r.msg });
    }
    return issues;
  }
  _coerce(value: unknown) {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(this.shape)) {
      const field = this.shape[key]!;
      const raw = obj[key];
      if (raw === undefined && !field._default) continue;
      out[key] = field._finalize(raw);
    }
    return out;
  }
  refine(fn: (v: T) => boolean, opts: { message: string; path?: (string | number)[] }) {
    const c = this.clone();
    c.refinements = [...this.refinements, { fn, msg: opts.message, path: opts.path ?? [] }];
    return c;
  }
}

export const z = {
  string: () => new ZodString(),
  number: () => new ZodNumber(),
  boolean: () => new ZodBoolean(),
  enum: <T extends string>(values: readonly T[]) => new ZodEnum<T>(values),
  array: <T>(el: ZodBase<T>) => new ZodArray<T>(el),
  object: <T = any>(shape: Shape) => new ZodObject<T>(shape),
};

export type ZodType<T> = ZodBase<T>;
export type SafeParseReturnType<_I, T> = SafeParseReturn<T>;

// Allow `z.infer<typeof schema>`, `z.ZodType<T>` and `z.ZodTypeAny` style usage
// by merging a namespace with the `z` value above.
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace z {
  export type infer<S> = S extends ZodBase<infer T> ? T : never;
  export type ZodType<T> = ZodBase<T>;
  export type SafeParseReturnType<_I, T> = SafeParseReturn<T>;
  export type ZodTypeAny = ZodBase<any>;
}
