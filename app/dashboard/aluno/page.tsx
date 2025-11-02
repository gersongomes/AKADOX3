import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { StudentDashboard } from "@/components/student/student-dashboard"

export default async function StudentDashboardPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("perfis_usuarios").select("tipo_usuario").eq("id", user.id).single()

  if (!profile || profile.tipo_usuario !== "aluno") {
    redirect("/dashboard")
  }

  return <StudentDashboard />
}
