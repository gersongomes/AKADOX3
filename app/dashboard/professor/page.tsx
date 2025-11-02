import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { ProfessorDashboard } from "@/components/professor/professor-dashboard"

export default async function ProfessorDashboardPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("perfis_usuarios").select("tipo_usuario").eq("id", user.id).single()

  if (!profile || profile.tipo_usuario !== "professor") {
    redirect("/dashboard")
  }

  return <ProfessorDashboard />
}
