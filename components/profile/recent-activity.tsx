import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Download, Star, MessageCircle, Award, Clock } from "lucide-react"
import { getUserRecentActivity } from "@/lib/actions/profile"

interface RecentActivityProps {
  userId: string
}

const activityIcons: Record<string, any> = {
  upload: Upload,
  achievement: Award,
  rating: Star,
  comment: MessageCircle,
  download: Download,
}

const activityColors: Record<string, string> = {
  upload: "text-secondary",
  achievement: "text-yellow-500",
  rating: "text-yellow-500",
  comment: "text-blue-500",
  download: "text-green-500",
}

export async function RecentActivity({ userId }: RecentActivityProps) {
  const result = await getUserRecentActivity(userId)
  const activities = result.success ? result.activities : []

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="font-serif text-lg">Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhuma atividade recente</p>
        ) : (
          activities.map((activity) => {
            const IconComponent = activityIcons[activity.type] || Upload
            const colorClass = activityColors[activity.type] || "text-secondary"

            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0`}>
                  <IconComponent className={`w-4 h-4 ${colorClass}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{activity.title}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    há {activity.time}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
