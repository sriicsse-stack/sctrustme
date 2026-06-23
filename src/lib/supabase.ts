import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = typeof supabaseUrl === "string" && supabaseUrl.length > 0 && typeof supabaseAnonKey === "string" && supabaseAnonKey.length > 0;

if (!isConfigured) {
  console.warn(
    "Supabase is not fully configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file for auth and database access."
  );
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl ?? "",
  supabaseAnonKey ?? "",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: "sb-auth-session",
    },
  }
);

export const isSupabaseConfigured = isConfigured;
