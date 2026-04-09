import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

import { auth, ApiUser } from "@/lib/api";

type User = ApiUser;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("auth_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        if (!auth.getToken()) return;
        const me = await auth.me();
        if (cancelled) return;
        setUser(me.user);
        localStorage.setItem("auth_user", JSON.stringify(me.user));
      } catch {
        // token is missing/invalid; clear local user
        if (cancelled) return;
        setUser(null);
        localStorage.removeItem("auth_user");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await auth.login({ email, password });
    setUser(res.user);
    localStorage.setItem("auth_user", JSON.stringify(res.user));
  };

  const signup = async (name: string, email: string, password: string) => {
    const res = await auth.register({ name, email, password });
    setUser(res.user);
    localStorage.setItem("auth_user", JSON.stringify(res.user));
  };

  const logout = async () => {
    await auth.logout();
    setUser(null);
    localStorage.removeItem("auth_user");
  };

  const value = useMemo(() => ({ user, loading, login, signup, logout }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
