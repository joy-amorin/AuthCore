// src/auth/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { apiFetch } from "../api/client";

interface AuthContextProps {
  user: any | null;
  authenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    setLoading(true);
    const access = localStorage.getItem("access_token");
    if (!access) {
      setAuthenticated(false);
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const profile = await apiFetch("/api/me");
      setUser(profile);
      setAuthenticated(true);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const { access, refresh } = await apiFetch("/api/login/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
    });

    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);

    await checkAuth();
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, authenticated, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
