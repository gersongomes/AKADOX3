"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import {
  Bell,
  CheckCircle,
  Info,
  AlertTriangle,
  AlertCircle,
  Award,
  MessageSquare,
  Heart,
  UserPlus,
} from "lucide-react"
import { getUserNotifications, markNotificationAsRead } from "@/lib/actions/notifications"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Notification {
  id: string
  tipo: string
  titulo: string
  mensagem: string
  link?: string
  lida: boolean
  created_at: string
}

export function NotificationsList({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    const result = await getUserNotifications(userId)
    if (result.success && result.data) {
      setNotifications(result.data)
    }
    setLoading(false)
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.lida) {
      await markNotificationAsRead(notification.id)
      setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, lida: true } : n)))
    }
    if (notification.link) {
      router.push(notification.link)
    }
  }

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case "badge":
        return <Award className="w-5 h-5 text-yellow-500" />
      case "comment":
        return <MessageSquare className="w-5 h-5 text-blue-500" />
      case "like":
        return <Heart className="w-5 h-5 text-red-500" />
      case "follow":
        return <UserPlus className="w-5 h-5 text-green-500" />
      case "approval":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  if (loading) {
    return <div className="text-center py-8">Carregando notificações...</div>
  }

  if (notifications.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-xl font-semibold mb-2">Nenhuma notificação</h3>
        <p className="text-muted-foreground">Você não tem notificações no momento</p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className={`p-4 cursor-pointer transition-all hover:shadow-md ${
            !notification.lida ? "bg-primary/5 border-primary/20" : ""
          }`}
          onClick={() => handleNotificationClick(notification)}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.tipo)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-sm">{notification.titulo}</h4>
                {!notification.lida && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 ml-2" />}
              </div>
              <p className="text-sm text-muted-foreground mb-2">{notification.mensagem}</p>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
