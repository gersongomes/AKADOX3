"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, Settings, BookOpen, Bell, Heart } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { signOut } from "@/lib/actions/auth"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

export function AuthNav() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (isSupabaseConfigured) {
      checkUser()

      const supabase = getSupabaseClient()
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          checkUser()
        } else {
          setUser(null)
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    } else {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user && isSupabaseConfigured) {
      fetchUnreadCount()
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  const fetchUnreadCount = async () => {
    try {
      const supabase = getSupabaseClient()
      if (!supabase || !user) return

      const { count } = await supabase
        .from("notificacoes")
        .select("*", { count: "exact", head: true })
        .eq("usuario_id", user.id)
        .eq("lida", false)

      setUnreadCount(count || 0)
    } catch (error) {
      console.error("[v0] Error fetching unread count:", error)
    }
  }

  const checkUser = async () => {
    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        setLoading(false)
        return
      }

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (authUser) {
        const { data: profile } = await supabase
          .from("perfis_usuarios")
          .select("nome_completo, email, avatar_url, tipo_usuario")
          .eq("id", authUser.id)
          .single()

        setUser({
          ...authUser,
          name: profile?.nome_completo || authUser.email?.split("@")[0],
          avatar: profile?.avatar_url,
          tipo_usuario: profile?.tipo_usuario,
        })
      }
    } catch (error) {
      console.error("[v0] Error checking user:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      const result = await signOut()

      if (result.error) {
        toast({
          title: "Erro",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Sessão terminada",
        description: "Até breve!",
      })

      setUser(null)
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("[v0] Sign out error:", error)
      toast({
        title: "Erro",
        description: "Erro ao terminar sessão",
        variant: "destructive",
      })
    }
  }

  const getDashboardUrl = () => {
    if (!user?.tipo_usuario) return "/dashboard"

    switch (user.tipo_usuario) {
      case "admin":
        return "/dashboard/admin"
      case "professor":
        return "/dashboard/professor"
      case "diretor":
        return "/dashboard/diretor"
      case "aluno":
      case "pessoa_comum":
      default:
        return "/dashboard/aluno"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-4">
        <div className="h-9 w-20 bg-muted animate-pulse rounded" />
        <div className="h-9 w-24 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center gap-4">
        <Button variant="ghost" className="text-foreground hover:text-primary" asChild>
          <Link href="/login">Entrar</Link>
        </Button>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground akadox-glow" asChild>
          <Link href="/register">Registar</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" className="relative text-foreground hover:text-primary" asChild>
        <Link href="/notifications">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Link>
      </Button>

      <Button variant="ghost" size="sm" className="text-foreground hover:text-primary" asChild>
        <Link href="/favorites">
          <Heart className="w-5 h-5" />
        </Link>
      </Button>

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10 ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
              <AvatarImage src={user.avatar || undefined} alt={user.name} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" alignOffset={-8} sideOffset={8}>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile" className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={getDashboardUrl()} className="cursor-pointer">
              <BookOpen className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Definições</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Terminar Sessão</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
