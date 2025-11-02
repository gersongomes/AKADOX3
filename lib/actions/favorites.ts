"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function toggleFavorite(documentId: string) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Não autenticado" }
  }

  try {
    const { data: existing } = await supabase
      .from("favoritos")
      .select("id")
      .eq("usuario_id", user.id)
      .eq("documento_id", documentId)
      .maybeSingle()

    if (existing) {
      // Remove from favorites
      const { error } = await supabase.from("favoritos").delete().eq("id", existing.id)

      if (error) {
        console.error("[v0] Error removing favorite:", error)
        return { success: false, error: "Erro ao remover dos favoritos" }
      }

      revalidatePath("/favoritos")
      revalidatePath(`/browse/${documentId}`)
      return { success: true, favorited: false }
    } else {
      // Add to favorites
      const { error } = await supabase.from("favoritos").insert({
        usuario_id: user.id,
        documento_id: documentId,
      })

      if (error) {
        console.error("[v0] Error adding favorite:", error)
        return { success: false, error: "Erro ao adicionar aos favoritos" }
      }

      revalidatePath("/favoritos")
      revalidatePath(`/browse/${documentId}`)
      return { success: true, favorited: true }
    }
  } catch (error) {
    console.error("[v0] Toggle favorite error:", error)
    return { success: false, error: "Erro inesperado" }
  }
}

export async function isFavorited(documentId: string) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  const { data } = await supabase
    .from("favoritos")
    .select("id")
    .eq("usuario_id", user.id)
    .eq("documento_id", documentId)
    .maybeSingle()

  return !!data
}

export async function getFavorites(userId?: string) {
  const supabase = await createServerClient()

  let targetUserId = userId

  if (!targetUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return []
    targetUserId = user.id
  }

  const { data, error } = await supabase
    .from("favoritos")
    .select(
      `
      id,
      created_at,
      documentos!inner (
        id,
        titulo,
        descricao,
        tipo_arquivo,
        categoria,
        downloads,
        visualizacoes,
        tags,
        created_at,
        perfis_usuarios!documentos_autor_id_fkey (
          nome_completo
        ),
        universidades (
          nome
        )
      )
    `,
    )
    .eq("usuario_id", targetUserId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching favorites:", error)
    return []
  }

  return data
}
