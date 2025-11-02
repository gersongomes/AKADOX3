import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DirectorDashboard } from "@/components/director/director-dashboard"

export default async function DirectorDashboardPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("perfis_usuarios")
    .select("tipo_usuario, universidade_id")
    .eq("id", user.id)
    .single()

  if (!profile || profile.tipo_usuario !== "diretor") {
    redirect("/dashboard")
  }

  return <DirectorDashboard />
}
