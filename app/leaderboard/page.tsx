import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table"
import { TopContributors } from "@/components/leaderboard/top-contributors"
import { LeaderboardFilters } from "@/components/leaderboard/leaderboard-filters"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { ArrowLeft, Trophy } from "lucide-react"
import Link from "next/link"

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Link>
              </Button>
              <Logo size="sm" />
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" asChild>
                <Link href="/browse">Explorar</Link>
              </Button>
              <Button asChild>
                <Link href="/profile">Perfil</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-secondary" />
            <h2 className="font-serif font-black text-3xl text-foreground">Classificações</h2>
          </div>
          <p className="text-muted-foreground text-lg">
            Os melhores contribuidores da comunidade académica de Cabo Verde
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <LeaderboardFilters />
          </div>
          <div className="lg:col-span-3 space-y-8">
            <TopContributors />
            <LeaderboardTable />
          </div>
        </div>
      </div>
    </div>
  )
}
