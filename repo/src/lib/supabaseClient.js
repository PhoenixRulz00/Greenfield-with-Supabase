import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Fails loudly and early rather than silently breaking every query later.
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env.local and fill in your project's values from Settings > API in the Supabase dashboard."
  );
}

if (typeof window !== "undefined") {
  Object.keys(window.localStorage)
    .filter((key) => key.startsWith("sb-") && (key.includes("-auth-token") || key.includes("-auth-token-code-verifier")))
    .forEach((key) => window.localStorage.removeItem(key));
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
