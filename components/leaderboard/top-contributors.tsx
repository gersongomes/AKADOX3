import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award } from "lucide-react"

const topThree = [
  {
    rank: 1,
    name: "Maria Silva",
    university: "US - Universidade de Santiago",
    points: 5200,
    avatar: "/top-student-1.png",
  },
  {
    rank: 2,
    name: "João Santos",
    university: "Uni-CV",
    points: 4850,
    avatar: "/top-student-2.png",
  },
  {
    rank: 3,
    name: "Ana Costa",
    university: "Jean Piaget",
    points: 4200,
    avatar: "/top-student-3.png",
  },
]

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="w-6 h-6 text-yellow-500" />
    case 2:
      return <Medal className="w-6 h-6 text-gray-400" />
    case 3:
      return <Award className="w-6 h-6 text-amber-600" />
    default:
      return null
  }
}

const getRankColor = (rank: number) => {
  switch (rank) {
    case 1:
      return "border-yellow-200 bg-yellow-50"
    case 2:
      return "border-gray-200 bg-gray-50"
    case 3:
      return "border-amber-200 bg-amber-50"
    default:
      return "border-border bg-card"
  }
}

export function TopContributors() {
  return (
    <div className="space-y-6">
      <h3 className="font-serif font-bold text-xl text-foreground">Top Contribuidores</h3>

      <div className="grid md:grid-cols-3 gap-4">
        {topThree.map((user) => (
          <Card key={user.rank} className={`border-2 ${getRankColor(user.rank)} text-center`}>
            <CardContent className="p-6">
              <div className="flex justify-center mb-4">{getRankIcon(user.rank)}</div>

              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarImage src={user.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-lg font-bold">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <h4 className="font-serif font-bold text-lg text-foreground mb-1">{user.name}</h4>
              <p className="text-sm text-muted-foreground mb-3">{user.university}</p>

              <div className="text-2xl font-serif font-black text-secondary mb-1">{user.points}</div>
              <div className="text-sm text-muted-foreground">pontos</div>

              <Badge variant="outline" className="mt-3">
                #{user.rank} Posição
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
