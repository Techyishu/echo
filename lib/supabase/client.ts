import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

const SUPABASE_CONFIGURED =
  !!SUPABASE_URL &&
  SUPABASE_URL !== "your_supabase_project_url" &&
  !!SUPABASE_KEY &&
  SUPABASE_KEY !== "your_supabase_anon_key";

// Stub returned when env vars are not yet set
const stubClient = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    signInWithPassword: async () => ({ error: { message: "Supabase not configured" } }),
    signUp: async () => ({ error: { message: "Supabase not configured" } }),
    signOut: async () => ({}),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
} as unknown as ReturnType<typeof createBrowserClient>;

export function createClient() {
  if (!SUPABASE_CONFIGURED) return stubClient;
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
}
