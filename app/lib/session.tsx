"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type User = { name: string };

const STORAGE_KEY = "av_user";

type SessionContextValue = {
  user: User | null;
  login: (user: User) => void;
  signOut: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Lectura de localStorage diferida al montaje (no disponible durante el
    // render en el servidor); el estado inicial null evita un mismatch de
    // hidratación entre el HTML del servidor y el primer render del cliente.
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(raw ? (JSON.parse(raw) as User) : null);
    } catch {
      setUser(null);
    }
  }, []);

  const login = (u: User) => {
    setUser(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <SessionContext.Provider value={{ user, login, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession debe usarse dentro de SessionProvider");
  return ctx;
}
