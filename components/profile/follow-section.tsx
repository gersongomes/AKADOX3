"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus } from "lucide-react"
import { getFollowers, getFollowing, getFollowStats } from "@/lib/actions/follow"
import Link from "next/link"

interface FollowSectionProps {
  userId: string
  isOwnProfile: boolean
}

export function FollowSection({ userId, isOwnProfile }: FollowSectionProps) {
  const [followers, setFollowers] = useState<any[]>([])
  const [following, setFollowing] = useState<any[]>([])
  const [stats, setStats] = useState({ followers: 0, following: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFollowData()
  }, [userId])

  const loadFollowData = async () => {
    setLoading(true)
    const [followersData, followingData, statsData] = await Promise.all([
      getFollowers(userId),
      getFollowing(userId),
      getFollowStats(userId),
    ])

    setFollowers(followersData)
    setFollowing(followingData)
    setStats(statsData)
    setLoading(false)
  }

  // Only show to profile owner
  if (!isOwnProfile) {
    return null
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Seguidores & Seguindo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Seguidores & Seguindo
          <Badge variant="secondary" className="ml-auto">
            Privado
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Followers */}
        <div>
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Seguidores ({stats.followers})
          </h3>
          {followers.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ainda não tem seguidores</p>
          ) : (
            <div className="space-y-2">
              {followers.slice(0, 5).map((follower) => (
                <Link
                  key={follower.id}
                  href={`/profile/${follower.seguidor.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={follower.seguidor.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {follower.seguidor.nome_completo?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{follower.seguidor.nome_completo}</p>
                    <p className="text-xs text-muted-foreground">{follower.seguidor.tipo_usuario}</p>
                  </div>
                </Link>
              ))}
              {followers.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  +{followers.length - 5} mais seguidores
                </p>
              )}
            </div>
          )}
        </div>

        {/* Following */}
        <div>
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Seguindo ({stats.following})
          </h3>
          {following.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ainda não segue ninguém</p>
          ) : (
            <div className="space-y-2">
              {following.slice(0, 5).map((follow) => (
                <Link
                  key={follow.id}
                  href={`/profile/${follow.seguido.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={follow.seguido.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {follow.seguido.nome_completo?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{follow.seguido.nome_completo}</p>
                    <p className="text-xs text-muted-foreground">{follow.seguido.tipo_usuario}</p>
                  </div>
                </Link>
              ))}
              {following.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-2">+{following.length - 5} mais pessoas</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
