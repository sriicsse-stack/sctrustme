import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isUrlValid = (url?: string) => {
  if (typeof url !== "string" || url.length === 0) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

export const isSupabaseConfigured =
  isUrlValid(supabaseUrl) &&
  typeof supabaseAnonKey === "string" &&
  supabaseAnonKey.length > 0;

const createFallbackSupabaseClient = (): SupabaseClient => {
  const authStub = {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: (_event: any, _callback: any) => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
    signInWithOAuth: async () => ({
      error: { message: "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY." },
    }),
    signOut: async () => ({
      error: { message: "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY." },
    }),
    signInWithPassword: async () => ({
      data: null,
      error: { message: "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY." },
    }),
    signUp: async () => ({
      data: null,
      error: { message: "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY." },
    }),
    signInWithOtp: async () => ({
      error: { message: "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY." },
    }),
  };

  return {
    auth: authStub,
  } as unknown as SupabaseClient;
};

export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: "sb-auth-session",
      },
    })
  : createFallbackSupabaseClient();
