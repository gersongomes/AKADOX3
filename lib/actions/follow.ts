"use server"

import { createServerClient } from "@/lib/supabase/server"
import { createNotification } from "./notifications"

export async function toggleFollow(targetUserId: string) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Não autenticado" }
  }

  if (user.id === targetUserId) {
    return { error: "Não pode seguir a si mesmo" }
  }

  try {
    const { data: existing } = await supabase
      .from("seguidores")
      .select("id")
      .eq("seguidor_id", user.id)
      .eq("seguido_id", targetUserId)
      .maybeSingle()

    if (existing) {
      // Unfollow
      const { error } = await supabase.from("seguidores").delete().eq("id", existing.id)

      if (error) throw error

      return { success: true, following: false }
    } else {
      // Follow
      const { error } = await supabase.from("seguidores").insert({
        seguidor_id: user.id,
        seguido_id: targetUserId,
      })

      if (error) throw error

      // Create notification
      await createNotification({
        usuario_id: targetUserId,
        tipo: "seguidor",
        mensagem: "começou a seguir você",
        remetente_id: user.id,
      })

      return { success: true, following: true }
    }
  } catch (error) {
    console.error("[v0] Toggle follow error:", error)
    return { error: "Erro ao processar ação" }
  }
}

export async function isFollowing(targetUserId: string) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  const { data } = await supabase
    .from("seguidores")
    .select("id")
    .eq("seguidor_id", user.id)
    .eq("seguido_id", targetUserId)
    .maybeSingle()

  return !!data
}

export async function getFollowers(userId: string) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("seguidores")
    .select(`
      id,
      created_at,
      seguidor:perfis_usuarios!seguidores_seguidor_id_fkey(
        id,
        nome_completo,
        avatar_url,
        tipo_usuario
      )
    `)
    .eq("seguido_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching followers:", error)
    return []
  }

  return data || []
}

export async function getFollowing(userId: string) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("seguidores")
    .select(`
      id,
      created_at,
      seguido:perfis_usuarios!seguidores_seguido_id_fkey(
        id,
        nome_completo,
        avatar_url,
        tipo_usuario
      )
    `)
    .eq("seguidor_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching following:", error)
    return []
  }

  return data || []
}

export async function getFollowStats(userId: string) {
  const supabase = await createServerClient()

  const [{ count: followers }, { count: following }] = await Promise.all([
    supabase.from("seguidores").select("*", { count: "exact", head: true }).eq("seguido_id", userId),
    supabase.from("seguidores").select("*", { count: "exact", head: true }).eq("seguidor_id", userId),
  ])

  return {
    followers: followers || 0,
    following: following || 0,
  }
}
