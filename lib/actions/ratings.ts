"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getRatings(documentId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("avaliacoes")
    .select(
      `
      id,
      rating,
      comentario,
      created_at,
      perfis_usuarios!inner (
        nome_completo,
        avatar_url
      )
    `,
    )
    .eq("documento_id", documentId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching ratings:", error)
    return []
  }

  return data
}

export async function addRating(documentId: string, rating: number, comment?: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Não autenticado" }
  }

  if (rating < 1 || rating > 5) {
    return { success: false, error: "Avaliação inválida" }
  }

  // Check if user already rated
  const { data: existing } = await supabase
    .from("avaliacoes")
    .select("id")
    .eq("documento_id", documentId)
    .eq("usuario_id", user.id)
    .single()

  if (existing) {
    // Update existing rating
    const { error } = await supabase
      .from("avaliacoes")
      .update({
        rating,
        comentario: comment || null,
      })
      .eq("id", existing.id)

    if (error) {
      console.error("[v0] Error updating rating:", error)
      return { success: false, error: "Erro ao atualizar avaliação" }
    }
  } else {
    // Insert new rating
    const { error } = await supabase.from("avaliacoes").insert({
      documento_id: documentId,
      usuario_id: user.id,
      rating,
      comentario: comment || null,
    })

    if (error) {
      console.error("[v0] Error adding rating:", error)
      return { success: false, error: "Erro ao adicionar avaliação" }
    }
  }

  revalidatePath(`/browse/${documentId}`)
  return { success: true }
}

export async function getUserRating(documentId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data } = await supabase
    .from("avaliacoes")
    .select("rating, comentario")
    .eq("documento_id", documentId)
    .eq("usuario_id", user.id)
    .single()

  return data
}

export async function getAverageRating(documentId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.from("avaliacoes").select("rating").eq("documento_id", documentId)

  if (error || !data || data.length === 0) {
    return { average: 0, count: 0 }
  }

  const sum = data.reduce((acc, curr) => acc + curr.rating, 0)
  const average = sum / data.length

  return {
    average: Math.round(average * 10) / 10,
    count: data.length,
  }
}

export async function getRatingBreakdown(documentId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.from("avaliacoes").select("rating").eq("documento_id", documentId)

  if (error || !data || data.length === 0) {
    return {
      total: 0,
      breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      average: 0,
    }
  }

  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  let sum = 0

  data.forEach((item) => {
    const rating = Math.round(item.rating) as 1 | 2 | 3 | 4 | 5
    breakdown[rating]++
    sum += item.rating
  })

  return {
    total: data.length,
    breakdown,
    average: Math.round((sum / data.length) * 10) / 10,
  }
}
