import { createContext, useContext, useEffect, useState } from "react";
import supabase from "../Lib/supabase"; 
import { logAction } from "../services/auditLogService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      const currentUser = data?.session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", currentUser.id)
          .single();

        if (!error && profile) setRole(profile.role);
        else setRole("user");
      }

      setLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", currentUser.id)
          .single();

        if (!error && profile) setRole(profile.role);
        else setRole("user");
      } else {
        setRole(null);
      }

      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    if (data.user) {
      await logAction(data.user.id, "login", "User logged in");
    }

    return data;
  };

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;

    const userId = data.user?.id;
    if (userId) {
      await supabase.from("wallets").upsert({ user_id: userId, balance: 0 });
      await supabase.from("profiles").upsert({ user_id: userId, role: "user" });
      setRole("user");
    }

    return data;
  };

  const logout = async () => {
    if (user) {
      await logAction(user.id, "logout", "User logged out");
    }
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, signUp, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
