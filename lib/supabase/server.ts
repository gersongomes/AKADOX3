import { createServerClient as createSupabaseServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const SUPABASE_URL = "https://nkpescypvlpiijwlvmax.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rcGVzY3lwdmxwaWlqd2x2bWF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNzY1NDEsImV4cCI6MjA3NTg1MjU0MX0.USWB_VbMLOAZ2r7nGn_9ESL-TdzHME9P38XWh-OcW-w"

export async function createServerClient() {
  const cookieStore = await cookies()

  return createSupabaseServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The "setAll" method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

export const createClient = createServerClient

export const isSupabaseConfigured = true
