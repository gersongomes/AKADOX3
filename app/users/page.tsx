import Link from "next/link"
import { ArrowLeft, Users, GraduationCap, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { getUsers, getUserStats } from "@/lib/actions/users"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default async function UsersPage() {
  const { users } = await getUsers({ limit: 50 })
  const stats = await getUserStats()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Link>
            </Button>
            <Link href="/">
              <Logo size="sm" />
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="font-serif font-black text-4xl text-foreground mb-4">Utilizadores Akadox</h1>
            <p className="text-xl text-muted-foreground mb-6">
              Descobre e conecta-te com outros membros da comunidade académica.
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="akadox-card p-4">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.totalUsers}</p>
                    <p className="text-sm text-muted-foreground">Total de Utilizadores</p>
                  </div>
                </div>
              </div>
              <div className="akadox-card p-4">
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.totalStudents}</p>
                    <p className="text-sm text-muted-foreground">Alunos</p>
                  </div>
                </div>
              </div>
              <div className="akadox-card p-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.totalProfessors}</p>
                    <p className="text-sm text-muted-foreground">Professores</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum utilizador encontrado</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {users.map((user) => (
                <Link key={user.id} href={`/profile/${user.id}`}>
                  <div className="akadox-card p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
                    <Avatar className="w-16 h-16 mx-auto mb-4">
                      <AvatarImage src={user.avatar_url || undefined} alt={user.nome_completo} />
                      <AvatarFallback className="bg-primary/20 text-primary font-bold text-xl">
                        {user.nome_completo
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-foreground mb-2">{user.nome_completo}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {user.universidades?.nome || "Sem universidade"}
                    </p>
                    <div className="flex justify-center gap-4 text-sm">
                      <span className="text-primary font-semibold">{user.pontos} pontos</span>
                      <span className="text-muted-foreground">{user.documentCount} recursos</span>
                    </div>
                    {user.bio && <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{user.bio}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
