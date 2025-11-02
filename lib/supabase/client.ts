import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"

let clientInstance: ReturnType<typeof createSupabaseBrowserClient> | null = null

const SUPABASE_URL = "https://nkpescypvlpiijwlvmax.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rcGVzY3lwdmxwaWlqd2x2bWF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNzY1NDEsImV4cCI6MjA3NTg1MjU0MX0.USWB_VbMLOAZ2r7nGn_9ESL-TdzHME9P38XWh-OcW-w"

export function createClient() {
  return createSupabaseBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

export function createBrowserClient() {
  return createClient()
}

export const isSupabaseConfigured = true

export function getSupabaseClient() {
  if (!clientInstance) {
    clientInstance = createClient()
  }

  return clientInstance
}

export const supabase = getSupabaseClient()
