"use server"

import { createServerClient } from "@/lib/supabase/server"

export async function getUserNotifications(userId?: string) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Não autorizado" }
    }

    const targetUserId = userId || user.id

    const { data: notifications, error } = await supabase
      .from("notificacoes")
      .select("*")
      .eq("usuario_id", targetUserId)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      console.error("[v0] Error fetching notifications:", error)
      return { error: "Erro ao buscar notificações" }
    }

    return { success: true, data: notifications || [] }
  } catch (error) {
    console.error("[v0] Get notifications error:", error)
    return { error: "Erro interno do servidor" }
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const supabase = await createServerClient()

    const { error } = await supabase.from("notificacoes").update({ lida: true }).eq("id", notificationId)

    if (error) {
      console.error("[v0] Error marking notification as read:", error)
      return { error: "Erro ao marcar notificação como lida" }
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Mark notification as read error:", error)
    return { error: "Erro interno do servidor" }
  }
}

export async function getUnreadNotificationCount(userId?: string) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Não autorizado" }
    }

    const targetUserId = userId || user.id

    const { count, error } = await supabase
      .from("notificacoes")
      .select("*", { count: "exact", head: true })
      .eq("usuario_id", targetUserId)
      .eq("lida", false)

    if (error) {
      console.error("[v0] Error counting unread notifications:", error)
      return { error: "Erro ao contar notificações não lidas" }
    }

    return { success: true, count: count || 0 }
  } catch (error) {
    console.error("[v0] Get unread count error:", error)
    return { error: "Erro interno do servidor" }
  }
}

export async function createNotification(data: {
  usuario_id: string
  tipo: string
  titulo: string
  mensagem: string
  link?: string
}) {
  try {
    const supabase = await createServerClient()

    const { error } = await supabase.from("notificacoes").insert({
      usuario_id: data.usuario_id,
      tipo: data.tipo,
      titulo: data.titulo,
      mensagem: data.mensagem,
      link: data.link,
      lida: false,
    })

    if (error) {
      console.error("[v0] Error creating notification:", error)
      return { error: "Erro ao criar notificação" }
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Create notification error:", error)
    return { error: "Erro interno do servidor" }
  }
}
