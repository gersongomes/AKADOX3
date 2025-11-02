"use server"

import { createServerClient } from "@/lib/supabase/server"

export async function getUsers(filters?: {
  universidade?: string
  tipo?: string
  search?: string
  limit?: number
  offset?: number
}) {
  const supabase = await createServerClient()

  try {
    let query = supabase
      .from("perfis_usuarios")
      .select(
        `
        id,
        nome_completo,
        email,
        tipo_usuario,
        pontos,
        nivel,
        avatar_url,
        bio,
        universidade_id,
        universidades:universidade_id (
          nome,
          codigo
        ),
        created_at
      `,
      )
      .eq("ativo", true)
      .eq("aprovado", true)
      .order("pontos", { ascending: false })

    if (filters?.universidade) {
      query = query.eq("universidade_id", filters.universidade)
    }

    if (filters?.tipo) {
      query = query.eq("tipo_usuario", filters.tipo)
    }

    if (filters?.search) {
      query = query.ilike("nome_completo", `%${filters.search}%`)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error("[v0] Error fetching users:", error)
      return { users: [], error: error.message }
    }

    // Count documents for each user
    const usersWithStats = await Promise.all(
      (data || []).map(async (user) => {
        const { count } = await supabase
          .from("documentos")
          .select("*", { count: "exact", head: true })
          .eq("autor_id", user.id)
          .eq("aprovado", true)

        return {
          ...user,
          documentCount: count || 0,
        }
      }),
    )

    return { users: usersWithStats, error: null }
  } catch (error) {
    console.error("[v0] Error fetching users:", error)
    return { users: [], error: "Erro ao carregar utilizadores" }
  }
}

export async function getUserStats() {
  const supabase = await createServerClient()

  try {
    const { count: totalUsers } = await supabase
      .from("perfis_usuarios")
      .select("*", { count: "exact", head: true })
      .eq("ativo", true)

    const { count: totalStudents } = await supabase
      .from("perfis_usuarios")
      .select("*", { count: "exact", head: true })
      .eq("tipo_usuario", "aluno")
      .eq("ativo", true)

    const { count: totalProfessors } = await supabase
      .from("perfis_usuarios")
      .select("*", { count: "exact", head: true })
      .eq("tipo_usuario", "professor")
      .eq("ativo", true)

    return {
      totalUsers: totalUsers || 0,
      totalStudents: totalStudents || 0,
      totalProfessors: totalProfessors || 0,
    }
  } catch (error) {
    console.error("[v0] Error fetching user stats:", error)
    return {
      totalUsers: 0,
      totalStudents: 0,
      totalProfessors: 0,
    }
  }
}
