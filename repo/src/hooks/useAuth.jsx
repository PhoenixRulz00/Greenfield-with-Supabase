import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { getProfile, signIn as apiSignIn, signOut as apiSignOut } from "../lib/queries/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = loading, null = signed out
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active) setSession(data.session ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) {
      setProfile(null);
      return;
    }
    let active = true;
    getProfile(session.user.id)
      .then((p) => active && setProfile(p))
      .catch((err) => active && setError(err.message));
    return () => {
      active = false;
    };
  }, [session]);

  const login = async (email, password) => {
    setError("");
    try {
      await apiSignIn(email, password);
    } catch (err) {
      setError(err.message || "Sign in failed.");
      throw err;
    }
  };

  const logout = async () => {
    await apiSignOut();
    setProfile(null);
  };

  const loading = session === undefined || (session && profile === null && !error);

  return (
    <AuthContext.Provider value={{ session, profile, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
