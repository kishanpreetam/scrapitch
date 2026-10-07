import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// The signed-in user for a route handler, or null. getUser() verifies the
// session with Supabase rather than trusting the cookie contents, so a
// forged or expired cookie doesn't count as signed in.
export async function getSignedInUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        // proxy.ts refreshes sessions; route handlers only read them.
        setAll: () => {},
      },
    },
  );
  const { data, error } = await supabase.auth.getUser();
  return error ? null : data.user;
}
