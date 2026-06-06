import { createBrowserClient } from "@supabase/ssr";

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL. Add it to your .env.local file.",
    );
  }

  if (!key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Add it to your .env.local file.",
    );
  }

  return {
    url: url.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, ""),
    key,
  };
}

export function createBrowserSupabaseClient() {
  const { url, key } = getSupabaseEnv();
  return createBrowserClient(url, key);
}
