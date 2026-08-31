import "server-only";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars"
  );
}

// Server-only client using the service_role key. This bypasses RLS, so it
// must never be imported from client components or exposed to the browser.
export const supabaseServer = createClient(url, serviceRoleKey, {
  auth: { persistSession: false },
});
