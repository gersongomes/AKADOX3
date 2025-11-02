"use server"

import { createClient } from "@/lib/supabase/server"

export async function getLeaderboardUsers() {
  try {
    const supabase = await createClient()

    const { data: users, error } = await supabase
      .from("perfis_usuarios")
      .select(`
        id,
        nome_completo,
        universidade_id,
        curso,
        pontos,
        avatar_url,
        universidades (
          nome,
          codigo
        )
      `)
      .eq("ativo", true)
      .order("pontos", { ascending: false })
      .limit(50)

    if (error) {
      console.error("[v0] Error fetching leaderboard:", error)
      return { users: [], error: error.message }
    }

    const usersWithStats = await Promise.all(
      (users || []).map(async (user) => {
        const { count: uploads } = await supabase
          .from("documentos")
          .select("*", { count: "exact", head: true })
          .eq("autor_id", user.id)
          .eq("aprovado", true)

        const { data: docs } = await supabase
          .from("documentos")
          .select("downloads")
          .eq("autor_id", user.id)
          .eq("aprovado", true)

        const totalDownloads = docs?.reduce((sum, doc) => sum + (doc.downloads || 0), 0) || 0

        const { data: ratings } = await supabase
          .from("avaliacoes")
          .select("rating")
          .in("documento_id", docs?.map((d) => d.id) || [])

        const avgRating =
          ratings && ratings.length > 0 ? ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length : 0

        const levelData = calculateLevel(user.pontos || 0)

        return {
          id: user.id,
          name: user.nome_completo,
          avatar: user.avatar_url,
          university: user.universidades?.codigo || "N/A",
          course: user.curso || "Não especificado",
          points: user.pontos || 0,
          uploads: uploads || 0,
          downloads: totalDownloads,
          rating: Math.round(avgRating * 10) / 10,
          level: levelData.name,
        }
      }),
    )

    return { users: usersWithStats, error: null }
  } catch (error) {
    console.error("[v0] Error in getLeaderboardUsers:", error)
    return { users: [], error: "Erro ao carregar classificações" }
  }
}

function calculateLevel(points: number): { name: string; min: number; max: number } {
  const levels = [
    { name: "Bronze", min: 0, max: 100 },
    { name: "Prata", min: 101, max: 500 },
    { name: "Ouro", min: 501, max: 1000 },
    { name: "Diamante", min: 1001, max: Number.POSITIVE_INFINITY },
  ]

  return levels.find((l) => points >= l.min && points <= l.max) || levels[0]
}
