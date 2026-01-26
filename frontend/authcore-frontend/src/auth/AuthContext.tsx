import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { apiFetch } from "../api/client";
import type { UserRole } from "../api/getusers";
import { useToast } from "../contexts/ToastContexts";

export interface UserPermission {
  name: string;
  description: string
}


export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: UserRole[];
  is_superuser: boolean;
  permissions: UserPermission[];
}

export interface AuthContextProps {
  user: User | null;
  authenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const{ addToast } = useToast();

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

const formattedRoles = (profile.roles || []).map((r: string | UserRole, index: number) => ({
  role__id: typeof r === "string" ? `role-${index}` : r.role__id,
  role__name: typeof r === "string" ? r : r.role__name,
}));
;

setUser({
  ...profile,
  roles: formattedRoles,
  permissions: profile.permissions || [],
});

      setAuthenticated(true);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Verificar sesión al cargar la app
  useEffect(() => {
    checkAuth();
  }, []);

  // Escuchar logout forzado (token expirado) y redirige a login
  useEffect(() => {
    const handleLogout = () => {
      logout();
      addToast("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.", "info");
      window.location.href = "/"; // redirige automáticamente
    };

    window.addEventListener("auth:logout", handleLogout);

    return () => {
      window.removeEventListener("auth:logout", handleLogout);
    };
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
