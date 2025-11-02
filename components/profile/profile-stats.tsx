import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Download, Star, Users } from "lucide-react"
import { getUserStats, getUserLevel } from "@/lib/actions/profile"

interface ProfileStatsProps {
  userId: string
}

export async function ProfileStats({ userId }: ProfileStatsProps) {
  const statsResult = await getUserStats(userId)
  const levelResult = await getUserLevel(userId)

  const stats = statsResult.success
    ? statsResult.stats
    : {
        uploads: 0,
        downloads: 0,
        rating: 0,
        followers: 0,
      }

  const levelData = levelResult.success
    ? levelResult.level
    : {
        currentPoints: 0,
        nextLevelPoints: 100,
        levelName: "Bronze",
        progress: 0,
      }

  const statsDisplay = [
    {
      title: "Total de Downloads",
      value: stats.downloads.toLocaleString(),
      change: "+12%",
      trend: "up",
      icon: Download,
    },
    {
      title: "Avaliação Média",
      value: stats.rating.toFixed(1),
      change: "+0.2",
      trend: "up",
      icon: Star,
    },
    {
      title: "Recursos Partilhados",
      value: stats.uploads.toString(),
      change: "+3",
      trend: "up",
      icon: TrendingUp,
    },
    {
      title: "Seguidores",
      value: stats.followers.toString(),
      change: "+7",
      trend: "up",
      icon: Users,
    },
  ]

  return (
    <div className="space-y-6">
      <h3 className="font-serif font-bold text-xl text-foreground">Estatísticas</h3>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsDisplay.map((stat) => (
          <Card key={stat.title} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs text-secondary font-medium">{stat.change}</span>
              </div>
              <div className="text-2xl font-serif font-black text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.title}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Level Progress */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Progresso de Nível</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{levelData.levelName}</span>
              <span className="text-sm text-muted-foreground">
                {levelData.currentPoints.toLocaleString()} / {levelData.nextLevelPoints.toLocaleString()} pontos
              </span>
            </div>
            <Progress value={levelData.progress} className="h-2" />
            <div className="text-sm text-muted-foreground">
              Faltam{" "}
              <span className="font-medium text-foreground">
                {(levelData.nextLevelPoints - levelData.currentPoints).toLocaleString()} pontos
              </span>{" "}
              para o próximo nível
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
