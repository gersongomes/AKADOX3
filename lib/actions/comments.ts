"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getComments(documentId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("comentarios")
    .select(
      `
      id,
      conteudo,
      likes,
      dislikes,
      created_at,
      comentario_pai_id,
      usuario_id,
      perfis_usuarios!inner (
        nome_completo,
        avatar_url
      )
    `,
    )
    .eq("documento_id", documentId)
    .eq("aprovado", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching comments:", error)
    return []
  }

  return data
}

export async function addComment(documentId: string, content: string, parentId?: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Não autenticado" }
  }

  const { data, error } = await supabase
    .from("comentarios")
    .insert({
      documento_id: documentId,
      usuario_id: user.id,
      conteudo: content,
      comentario_pai_id: parentId || null,
      aprovado: true,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error adding comment:", error)
    return { success: false, error: "Erro ao adicionar comentário" }
  }

  revalidatePath(`/browse/${documentId}`)
  return { success: true, data }
}

export async function voteComment(commentId: string, voteType: "like" | "dislike", previousVote: string | null) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Não autenticado" }
  }

  // Get current comment
  const { data: comment } = await supabase.from("comentarios").select("likes, dislikes").eq("id", commentId).single()

  if (!comment) {
    return { success: false, error: "Comentário não encontrado" }
  }

  let newLikes = comment.likes
  let newDislikes = comment.dislikes

  // Remove previous vote
  if (previousVote === "like") newLikes--
  if (previousVote === "dislike") newDislikes--

  // Add new vote if different
  if (previousVote !== voteType) {
    if (voteType === "like") newLikes++
    if (voteType === "dislike") newDislikes++
  }

  const { error } = await supabase
    .from("comentarios")
    .update({
      likes: Math.max(0, newLikes),
      dislikes: Math.max(0, newDislikes),
    })
    .eq("id", commentId)

  if (error) {
    console.error("[v0] Error voting comment:", error)
    return { success: false, error: "Erro ao votar" }
  }

  return { success: true }
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Não autenticado" }
  }

  // Check if user owns the comment
  const { data: comment } = await supabase.from("comentarios").select("usuario_id").eq("id", commentId).single()

  if (!comment || comment.usuario_id !== user.id) {
    return { success: false, error: "Sem permissão" }
  }

  const { error } = await supabase.from("comentarios").delete().eq("id", commentId)

  if (error) {
    console.error("[v0] Error deleting comment:", error)
    return { success: false, error: "Erro ao eliminar comentário" }
  }

  return { success: true }
}
