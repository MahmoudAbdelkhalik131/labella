import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api, tokenStore } from "@/services/api";
import type { ApiSingle, User } from "@/services/types";

type AuthContextValue = { user: User | null; loading: boolean; isAuthed: boolean; refresh: () => Promise<void>; login: (email: string, password: string, admin?: boolean) => Promise<void>; logout: () => void };
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const refresh = async () => {
    if (!tokenStore.get()) { setUser(null); setLoading(false); return; }
    try { const res = await api.get<ApiSingle<User>>("/profile/me"); setUser(res.data); }
    catch { tokenStore.clear(); setUser(null); }
    finally { setLoading(false); }
  };
  useEffect(() => { const cookieToken = document.cookie.split("; ").find((r) => r.startsWith("token="))?.split("=")[1]; if (cookieToken && !localStorage.getItem("make_it_real_token")) tokenStore.set(decodeURIComponent(cookieToken)); void refresh(); }, []);
  const login = async (email: string, password: string, admin = false) => { const res = await api.login({ email, password }, admin); tokenStore.set(res.token); await refresh(); toast.success("Welcome back to Make It Real"); };
  const logout = () => { tokenStore.clear(); setUser(null); toast("Signed out"); };
  const value = useMemo(() => ({ user, loading, isAuthed: !!user, refresh, login, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => { const ctx = useContext(AuthContext); if (!ctx) throw new Error("useAuth must be used inside AuthProvider"); return ctx; };
