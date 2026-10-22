import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { initialState, restoreState, type State } from "./store";
const KEY = "stillform-native-v1";
export const hashPassword = async (password: string, salt: string) =>
  Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}:${password}`,
  );
type Context = {
  state: State;
  ready: boolean;
  error: string;
  update: (fn: (state: State) => State | Promise<State>) => Promise<void>;
  retry: () => void;
};
const Store = createContext<Context | null>(null);
export function Provider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(initialState);
  const ref = useRef(state);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const queue = useRef(Promise.resolve());
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        const next = restoreState(raw ? JSON.parse(raw) : null);
        if (active) {
          ref.current = next;
          setState(next);
          setError("");
          setReady(true);
        }
      })
      .catch(() => {
        if (active)
          setError("We could not read your saved store. Please retry.");
      });
    return () => {
      active = false;
    };
  }, [attempt]);
  function update(fn: (state: State) => State | Promise<State>) {
    const next = queue.current.then(async () => {
      const value = await fn(ref.current);
      try {
        await AsyncStorage.setItem(KEY, JSON.stringify(value));
      } catch {
        throw new Error("We could not save your changes. Please try again.");
      }
      ref.current = value;
      setState(value);
    });
    queue.current = next.catch(() => {});
    return next;
  }
  return (
    <Store.Provider
      value={{
        state,
        ready,
        error,
        update,
        retry: () => setAttempt((n) => n + 1),
      }}
    >
      {children}
    </Store.Provider>
  );
}
export function useStore() {
  const value = useContext(Store);
  if (!value) throw new Error("Store provider is missing.");
  return value;
}
