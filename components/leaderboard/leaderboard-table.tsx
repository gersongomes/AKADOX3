"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Medal, Award, Star } from "lucide-react"
import { getLeaderboardUsers } from "@/lib/actions/leaderboard"

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="w-5 h-5 text-yellow-500" />
    case 2:
      return <Medal className="w-5 h-5 text-gray-400" />
    case 3:
      return <Award className="w-5 h-5 text-amber-600" />
    default:
      return (
        <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">
          #{rank}
        </span>
      )
  }
}

const getLevelColor = (level: string) => {
  switch (level) {
    case "Especialista":
      return "bg-purple-100 text-purple-800 border-purple-200"
    case "Colaborador Experiente":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "Colaborador Ativo":
      return "bg-green-100 text-green-800 border-green-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export function LeaderboardTable() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUsers() {
      const { users: fetchedUsers } = await getLeaderboardUsers()
      setUsers(fetchedUsers)
      setLoading(false)
    }
    loadUsers()
  }, [])

  if (loading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Ranking Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">A carregar classificações...</div>
        </CardContent>
      </Card>
    )
  }

  if (users.length === 0) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Ranking Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Ainda não há utilizadores no ranking.</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="font-serif text-lg">Ranking Geral</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user, index) => (
            <div
              key={user.id}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-colors hover:bg-muted/30 ${
                index < 3 ? "bg-muted/20 border-secondary/20" : "border-border"
              }`}
            >
              {/* Rank */}
              <div className="flex items-center justify-center w-8">{getRankIcon(index + 1)}</div>

              {/* Avatar and Info */}
              <div className="flex items-center gap-3 flex-1">
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src={`/diverse-students-studying.png?key=4vob5&height=40&width=40&query=student ${user.name}`}
                  />
                  <AvatarFallback className="text-sm font-medium">
                    {user.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground">{user.name}</h4>
                    <Badge variant="outline" className={`text-xs ${getLevelColor(user.level)}`}>
                      {user.level}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {user.course} • {user.university}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="hidden md:flex items-center gap-6 text-sm">
                <div className="text-center">
                  <div className="font-bold text-secondary">{user.points}</div>
                  <div className="text-muted-foreground">pontos</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-foreground">{user.uploads}</div>
                  <div className="text-muted-foreground">recursos</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-foreground">{user.downloads}</div>
                  <div className="text-muted-foreground">downloads</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center">
                    <Star className="w-3 h-3 fill-current text-yellow-500" />
                    <span className="font-bold text-foreground">{user.rating.toFixed(1)}</span>
                  </div>
                  <div className="text-muted-foreground">avaliação</div>
                </div>
              </div>

              {/* Mobile Stats */}
              <div className="md:hidden text-right">
                <div className="font-bold text-secondary text-lg">{user.points}</div>
                <div className="text-xs text-muted-foreground">pontos</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
