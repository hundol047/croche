/* Offline JSX automatic-runtime stub so `jsx: react-jsx` resolves without
 * @types/react. NOT part of the shipped app.
 *
 * Under the automatic runtime, TS reads the JSX namespace exported from
 * `react/jsx-runtime` — so the element/attribute model lives here (not in the
 * global JSX namespace). */
declare module 'react/jsx-runtime' {
  export function jsx(type: unknown, props: unknown, key?: unknown): JSX.Element;
  export function jsxs(type: unknown, props: unknown, key?: unknown): JSX.Element;
  export const Fragment: unknown;

  export namespace JSX {
    interface Element {
      type: unknown;
      props: unknown;
      key: string | number | null;
    }
    interface ElementClass {
      render(): unknown;
    }
    interface ElementChildrenAttribute {
      children: Record<string, never>;
    }
    interface IntrinsicAttributes {
      key?: string | number;
    }
    interface IntrinsicElements {
      [elem: string]: unknown;
    }
    /* Make `children` always-optional so nested JSX (which the hand-rolled stub
     * can't model precisely) type-checks; real @types/react handles this. */
    type LibraryManagedAttributes<_C, P> = Omit<P, 'children'> & {
      children?: unknown;
      key?: string | number;
    };
  }
}
declare module 'react/jsx-dev-runtime' {
  export function jsxDEV(type: unknown, props: unknown, key?: unknown): JSX.Element;
  export const Fragment: unknown;
}
