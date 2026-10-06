/* OFFLINE UI VERIFICATION AMBIENTS — NOT part of the shipped app.
 *
 * Minimal type stubs for the React Native / Expo surface FailTwin's screens and
 * components actually use, so the .tsx layer can be type-checked offline where
 * node_modules (react-native, expo, expo-router, react-native-svg, async-storage,
 * safe-area-context) cannot be installed. The production build uses the REAL
 * types from node_modules; these ambients are excluded from app tsconfig. */

declare namespace React {
  type ReactNode =
    | string
    | number
    | boolean
    | null
    | undefined
    | ReactElement
    | ReactNode[];
  interface ReactElement {
    type: unknown;
    props: unknown;
    key: string | number | null;
  }
  type FC<P = Record<string, unknown>> = (props: P) => ReactElement | null;
  interface Context<T> {
    Provider: (props: { value: T; children?: ReactNode }) => JSX.Element;
    Consumer: (props: { children: (v: T) => ReactNode }) => JSX.Element;
  }
  function createContext<T>(def: T): Context<T>;
  function useContext<T>(ctx: Context<T>): T;
  function useState<S>(initial: S | (() => S)): [S, (v: S | ((p: S) => S)) => void];
  function useEffect(fn: () => void | (() => void), deps?: unknown[]): void;
  function useMemo<T>(fn: () => T, deps: unknown[]): T;
  function useCallback<T>(fn: T, deps: unknown[]): T;
  function useRef<T>(initial: T): { current: T };
  function createElement(type: unknown, props?: unknown, ...children: unknown[]): ReactElement;
  const Fragment: (p: { children?: ReactNode }) => ReactElement;
}

declare module 'react' {
  export = React;
  export as namespace React;
}

/* The JSX element/attribute model lives in verify/jsx-runtime.d.ts (automatic
 * runtime). We still provide a minimal global JSX namespace for any classic
 * references. */
declare global {
  namespace JSX {
    interface Element {
      type: unknown;
      props: unknown;
      key: string | number | null;
    }
    interface IntrinsicAttributes {
      key?: string | number;
    }
    interface IntrinsicElements {
      [elem: string]: unknown;
    }
  }
}

declare module 'react-native' {
  export type ViewStyle = Record<string, unknown>;
  export type TextStyle = Record<string, unknown>;
  export interface ViewProps {
    style?: unknown;
    children?: ReactNode;
    [k: string]: unknown;
  }
  type Comp = (p: ViewProps) => JSX.Element;
  export interface PressableProps extends Omit<ViewProps, 'style'> {
    style?: unknown | ((state: { pressed: boolean }) => unknown);
  }
  export const View: Comp;
  export const Text: Comp;
  export const ScrollView: Comp;
  export const Pressable: (p: PressableProps) => JSX.Element;
  export const TextInput: Comp;
  export const ActivityIndicator: Comp;
  export const Animated: {
    View: Comp;
    Value: new (v: number) => unknown;
    timing: (v: unknown, cfg: Record<string, unknown>) => { start: (cb?: () => void) => void };
    spring: (v: unknown, cfg: Record<string, unknown>) => { start: (cb?: () => void) => void };
    sequence: (a: unknown[]) => { start: () => void };
    loop: (a: unknown) => { start: () => void; stop: () => void };
  };
  export const Easing: { inOut: (f: unknown) => unknown; ease: unknown };
  export const StyleSheet: {
    create<T extends Record<string, ViewStyle | TextStyle>>(styles: T): T;
    absoluteFill: ViewStyle;
    hairlineWidth: number;
  };
  export function useWindowDimensions(): { width: number; height: number };
}

declare module 'react-native-safe-area-context' {
  export const SafeAreaProvider: (p: { children?: ReactNode }) => JSX.Element;
  export const SafeAreaView: (p: {
    children?: ReactNode;
    style?: unknown;
    edges?: string[];
  }) => JSX.Element;
}

declare module 'react-native-svg' {
  type Comp = (p: Record<string, unknown>) => JSX.Element;
  const C: Comp;
  export default C;
  export const Svg: Comp;
  export const Path: Comp;
  export const Circle: Comp;
  export const Line: Comp;
  export const Rect: Comp;
  export const Polyline: Comp;
  export const Text: Comp;
  export const Defs: Comp;
  export const LinearGradient: Comp;
  export const Stop: Comp;
  export const G: Comp;
}

declare module 'expo-router' {
  export function useRouter(): {
    push: (href: string) => void;
    replace: (href: string) => void;
    back: () => void;
  };
  export function useFocusEffect(cb: () => void | (() => void)): void;
  export const Redirect: (p: { href: string }) => JSX.Element;
  export const Stack: ((p: { children?: ReactNode; screenOptions?: unknown }) => JSX.Element) & {
    Screen: (p: Record<string, unknown>) => JSX.Element;
  };
  export const Tabs: ((p: { children?: ReactNode; screenOptions?: unknown }) => JSX.Element) & {
    Screen: (p: Record<string, unknown>) => JSX.Element;
  };
}

declare module 'expo-status-bar' {
  export const StatusBar: (p: { style?: string }) => JSX.Element;
}

declare module '@react-native-async-storage/async-storage' {
  const AsyncStorage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    getAllKeys(): Promise<string[]>;
  };
  export default AsyncStorage;
}
