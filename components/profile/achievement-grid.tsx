import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, Upload, Download, Users, Award, Target, Zap } from "lucide-react"
import { getUserAchievements } from "@/lib/actions/profile"

interface AchievementGridProps {
  userId: string
}

const achievementIcons: Record<string, any> = {
  upload: Upload,
  star: Star,
  download: Download,
  users: Users,
  target: Target,
  zap: Zap,
  trophy: Trophy,
  award: Award,
}

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case "common":
      return "bg-gray-100 text-gray-800 border-gray-200"
    case "uncommon":
      return "bg-green-100 text-green-800 border-green-200"
    case "rare":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "epic":
      return "bg-purple-100 text-purple-800 border-purple-200"
    case "legendary":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getRarityLabel = (rarity: string) => {
  switch (rarity) {
    case "common":
      return "Comum"
    case "uncommon":
      return "Incomum"
    case "rare":
      return "Raro"
    case "epic":
      return "Épico"
    case "legendary":
      return "Lendário"
    default:
      return "Comum"
  }
}

export async function AchievementGrid({ userId }: AchievementGridProps) {
  const result = await getUserAchievements(userId)
  const achievements = result.success ? result.achievements : []

  const earnedAchievements = achievements.filter((a) => a.earned)
  const totalAchievements = achievements.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif font-bold text-xl text-foreground">Conquistas</h3>
        <Badge variant="outline">
          {earnedAchievements.length} / {totalAchievements}
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {achievements.map((achievement) => {
          const IconComponent = achievementIcons[achievement.icon] || Trophy

          return (
            <Card
              key={achievement.id}
              className={`border transition-all hover:shadow-md ${
                achievement.earned ? "border-border bg-card" : "border-dashed border-muted-foreground/30 bg-muted/20"
              }`}
            >
              <CardContent className="p-4 text-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    achievement.earned ? "bg-secondary/10 text-secondary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <IconComponent className="w-6 h-6" />
                </div>

                <h4
                  className={`font-medium text-sm mb-2 ${
                    achievement.earned ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {achievement.title}
                </h4>

                <p
                  className={`text-xs mb-3 ${achievement.earned ? "text-muted-foreground" : "text-muted-foreground/70"}`}
                >
                  {achievement.description}
                </p>

                <div className="space-y-2">
                  <Badge variant="outline" className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                    {getRarityLabel(achievement.rarity)}
                  </Badge>

                  {achievement.earned && achievement.earnedAt && (
                    <div className="text-xs text-muted-foreground">
                      {new Date(achievement.earnedAt).toLocaleDateString("pt-PT")}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
