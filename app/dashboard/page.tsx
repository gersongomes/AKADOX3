import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Logo } from "@/components/ui/logo"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("perfis_usuarios").select("tipo_usuario").eq("id", user.id).single()

  if (!profile) {
    redirect("/login")
  }

  switch (profile.tipo_usuario) {
    case "admin":
      redirect("/dashboard/admin")
    case "diretor":
      redirect("/dashboard/diretor")
    case "professor":
      redirect("/dashboard/professor")
    case "aluno":
      redirect("/dashboard/aluno")
    case "pessoa_comum":
      redirect("/dashboard/pessoa-comum")
    default:
      redirect("/browse")
  }

  const userMetadata = user.user_metadata || {}

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" className="text-white" />
            <nav className="flex items-center gap-6">
              <Link href="/browse" className="text-white/80 hover:text-white transition-colors">
                Explorar
              </Link>
              <Link href="/upload" className="text-white/80 hover:text-white transition-colors">
                Carregar
              </Link>
              <Link href="/profile" className="text-white/80 hover:text-white transition-colors">
                Perfil
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
            <h1 className="text-3xl font-bold text-white mb-6">Bem-vindo, {userMetadata.name || user.email}!</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Perfil</h2>
                <div className="space-y-2 text-gray-300">
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>Universidade:</strong> {userMetadata.university || "Não especificada"}
                  </p>
                  <p>
                    <strong>Curso:</strong> {userMetadata.course || "Não especificado"}
                  </p>
                  <p>
                    <strong>Tipo:</strong> {userMetadata.user_type || "comum"}
                  </p>
                  <p>
                    <strong>Nível:</strong> {userMetadata.level || 1}
                  </p>
                  <p>
                    <strong>Pontos:</strong> {userMetadata.points || 0}
                  </p>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Ações Rápidas</h2>
                <div className="space-y-3">
                  <Link
                    href="/browse"
                    className="block w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2 px-4 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all text-center"
                  >
                    Explorar Conteúdos
                  </Link>
                  <Link
                    href="/upload"
                    className="block w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all text-center"
                  >
                    Partilhar Documento
                  </Link>
                  <Link
                    href="/leaderboard"
                    className="block w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 px-4 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all text-center"
                  >
                    Ver Ranking
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
