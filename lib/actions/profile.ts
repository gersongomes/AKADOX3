"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getUserProfile(userId?: string) {
  const supabase = await createServerClient()

  try {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    if (!currentUser && !userId) {
      return { error: "Não autenticado" }
    }

    const targetUserId = userId || currentUser?.id

    const { data, error } = await supabase
      .from("perfis_usuarios")
      .select("*, universidades(nome, codigo), cursos(nome, codigo)")
      .eq("id", targetUserId)
      .single()

    if (error) {
      console.error("[v0] Error fetching profile:", error)
      throw error
    }

    const isOwnProfile = currentUser?.id === targetUserId

    return { success: true, profile: data, isOwnProfile }
  } catch (error) {
    console.error("[v0] Error fetching profile:", error)
    return { error: "Erro ao carregar perfil" }
  }
}

export async function updateUserProfile(formData: {
  name?: string
  bio?: string
  avatar_url?: string | null
}) {
  const supabase = await createServerClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Não autenticado" }
    }

    const updateData: any = {}
    if (formData.name) updateData.nome_completo = formData.name
    if (formData.bio !== undefined) updateData.bio = formData.bio
    if (formData.avatar_url !== undefined) updateData.avatar_url = formData.avatar_url

    updateData.updated_at = new Date().toISOString()

    const { error } = await supabase.from("perfis_usuarios").update(updateData).eq("id", user.id)

    if (error) throw error

    revalidatePath("/profile")
    revalidatePath("/settings")
    return { success: true, message: "Perfil atualizado com sucesso!" }
  } catch (error) {
    console.error("[v0] Error updating profile:", error)
    return { error: "Erro ao atualizar perfil" }
  }
}

export async function getUserStats(userId: string) {
  const supabase = await createServerClient()

  try {
    const { count: uploadCount } = await supabase
      .from("documentos")
      .select("*", { count: "exact", head: true })
      .eq("autor_id", userId)
      .eq("aprovado", true)

    const { data: docs } = await supabase
      .from("documentos")
      .select("downloads")
      .eq("autor_id", userId)
      .eq("aprovado", true)

    const totalDownloads = docs?.reduce((sum, doc) => sum + (doc.downloads || 0), 0) || 0

    const { data: ratings } = await supabase
      .from("avaliacoes")
      .select("rating")
      .in("documento_id", docs?.map((d) => d.id) || [])

    const avgRating =
      ratings && ratings.length > 0 ? ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length : 0

    const followers = 0

    return {
      success: true,
      stats: {
        uploads: uploadCount || 0,
        downloads: totalDownloads,
        rating: avgRating,
        followers: followers,
      },
    }
  } catch (error) {
    console.error("[v0] Error fetching user stats:", error)
    return {
      success: false,
      error: "Erro ao carregar estatísticas",
      stats: { uploads: 0, downloads: 0, rating: 0, followers: 0 },
    }
  }
}

export async function getUserLevel(userId: string) {
  const supabase = await createServerClient()

  try {
    const { data: profile } = await supabase.from("perfis_usuarios").select("pontos").eq("id", userId).single()

    const currentPoints = profile?.pontos || 0

    const levels = [
      { name: "Bronze", min: 0, max: 100 },
      { name: "Prata", min: 101, max: 500 },
      { name: "Ouro", min: 501, max: 1000 },
      { name: "Diamante", min: 1001, max: Number.POSITIVE_INFINITY },
    ]

    const currentLevel = levels.find((l) => currentPoints >= l.min && currentPoints <= l.max) || levels[0]
    const nextLevel = levels[levels.indexOf(currentLevel) + 1]
    const nextLevelPoints = nextLevel ? nextLevel.min : currentLevel.max
    const progress = nextLevel ? ((currentPoints - currentLevel.min) / (nextLevelPoints - currentLevel.min)) * 100 : 100

    return {
      success: true,
      level: {
        currentPoints,
        nextLevelPoints,
        levelName: currentLevel.name,
        progress: Math.min(progress, 100),
      },
    }
  } catch (error) {
    console.error("[v0] Error fetching user level:", error)
    return {
      success: false,
      error: "Erro ao carregar nível",
      level: { currentPoints: 0, nextLevelPoints: 100, levelName: "Bronze", progress: 0 },
    }
  }
}

export async function getUserAchievements(userId: string) {
  const supabase = await createServerClient()

  try {
    const { data: userBadges } = await supabase.from("usuario_badges").select("*, badges(*)").eq("usuario_id", userId)

    // Define all possible achievements
    const allAchievements = [
      {
        id: "first-upload",
        title: "Primeiro Upload",
        description: "Partilhou o primeiro recurso",
        icon: "upload",
        rarity: "common",
      },
      {
        id: "star-rating",
        title: "Estrela Nascente",
        description: "Recebeu 5 avaliações de 5 estrelas",
        icon: "star",
        rarity: "uncommon",
      },
      {
        id: "popular",
        title: "Colaborador Popular",
        description: "Recursos descarregados 100+ vezes",
        icon: "download",
        rarity: "rare",
      },
      {
        id: "mentor",
        title: "Mentor da Comunidade",
        description: "Ajudou 50+ estudantes",
        icon: "users",
        rarity: "epic",
      },
      {
        id: "specialist",
        title: "Especialista",
        description: "10+ recursos partilhados",
        icon: "target",
        rarity: "rare",
      },
      {
        id: "speedster",
        title: "Velocista",
        description: "Partilhou 5 recursos numa semana",
        icon: "zap",
        rarity: "uncommon",
      },
      {
        id: "legend",
        title: "Lenda da Universidade",
        description: "Alcançou o top 10 do ranking",
        icon: "trophy",
        rarity: "legendary",
      },
      {
        id: "perfectionist",
        title: "Perfeccionista",
        description: "Manteve avaliação 4.5+ por 6 meses",
        icon: "award",
        rarity: "epic",
      },
    ]

    const achievements = allAchievements.map((achievement) => {
      const earned = userBadges?.some((ub) => ub.badges?.tipo === achievement.id)
      const badge = userBadges?.find((ub) => ub.badges?.tipo === achievement.id)

      return {
        ...achievement,
        earned,
        earnedAt: badge?.created_at || null,
      }
    })

    return {
      success: true,
      achievements,
    }
  } catch (error) {
    console.error("[v0] Error fetching achievements:", error)
    return {
      success: false,
      error: "Erro ao carregar conquistas",
      achievements: [],
    }
  }
}

export async function getUserRecentActivity(userId: string) {
  const supabase = await createServerClient()

  try {
    // Get recent uploads
    const { data: uploads } = await supabase
      .from("documentos")
      .select("id, titulo, created_at")
      .eq("autor_id", userId)
      .order("created_at", { ascending: false })
      .limit(3)

    // Get recent comments
    const { data: comments } = await supabase
      .from("comentarios")
      .select("id, conteudo, created_at, documentos(titulo)")
      .eq("usuario_id", userId)
      .order("created_at", { ascending: false })
      .limit(2)

    // Get recent badges
    const { data: badges } = await supabase
      .from("usuario_badges")
      .select("id, conquistado_em, badges(nome)")
      .eq("usuario_id", userId)
      .order("conquistado_em", { ascending: false })
      .limit(2)

    const activities = [
      ...(uploads?.map((u) => ({
        id: `upload-${u.id}`,
        type: "upload",
        title: `Carregou '${u.titulo}'`,
        time: getTimeAgo(u.created_at),
      })) || []),
      ...(comments?.map((c) => ({
        id: `comment-${c.id}`,
        type: "comment",
        title: `Comentou em '${c.documentos?.titulo}'`,
        time: getTimeAgo(c.created_at),
      })) || []),
      ...(badges?.map((b) => ({
        id: `badge-${b.id}`,
        type: "achievement",
        title: `Desbloqueou '${b.badges?.nome}'`,
        time: getTimeAgo(b.conquistado_em),
      })) || []),
    ]

    return {
      success: true,
      activities: activities.slice(0, 5),
    }
  } catch (error) {
    console.error("[v0] Error fetching recent activity:", error)
    return {
      success: false,
      error: "Erro ao carregar atividade",
      activities: [],
    }
  }
}

export async function getUserFiles(userId: string) {
  const supabase = await createServerClient()

  try {
    const { data: files } = await supabase
      .from("documentos")
      .select(`
        id,
        titulo,
        categoria,
        created_at,
        downloads,
        visualizacoes,
        avaliacoes(rating)
      `)
      .eq("autor_id", userId)
      .eq("aprovado", true)
      .order("created_at", { ascending: false })

    const filesWithRatings =
      files?.map((file) => {
        const ratings = file.avaliacoes || []
        const avgRating =
          ratings.length > 0 ? ratings.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / ratings.length : 0

        return {
          id: file.id,
          title: file.titulo,
          subject: file.categoria,
          uploadedAt: file.created_at,
          downloads: file.downloads || 0,
          rating: avgRating,
          views: file.visualizacoes || 0,
        }
      }) || []

    return {
      success: true,
      files: filesWithRatings,
    }
  } catch (error) {
    console.error("[v0] Error fetching user files:", error)
    return {
      success: false,
      error: "Erro ao carregar ficheiros",
      files: [],
    }
  }
}

// Helper function to calculate time ago
function getTimeAgo(date: string): string {
  const now = new Date()
  const past = new Date(date)
  const diffInMs = now.getTime() - past.getTime()
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInHours < 1) return "menos de 1 hora"
  if (diffInHours < 24) return `${diffInHours} hora${diffInHours > 1 ? "s" : ""}`
  if (diffInDays < 7) return `${diffInDays} dia${diffInDays > 1 ? "s" : ""}`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} semana${Math.floor(diffInDays / 7) > 1 ? "s" : ""}`
  return `${Math.floor(diffInDays / 30)} mês${Math.floor(diffInDays / 30) > 1 ? "es" : ""}`
}

export async function uploadAvatar(file: File) {
  const supabase = await createServerClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Não autenticado" }
    }

    // Create unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage.from("documents").upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (uploadError) {
      console.error("[v0] Avatar upload error:", uploadError)
      return { error: "Erro ao carregar imagem" }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("documents").getPublicUrl(filePath)

    return { success: true, url: publicUrl }
  } catch (error) {
    console.error("[v0] Avatar upload error:", error)
    return { error: "Erro ao carregar imagem" }
  }
}

export async function updateProfilePicture(file: File) {
  const supabase = await createServerClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Não autenticado" }
    }

    // Create unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage.from("documents").upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (uploadError) {
      console.error("[v0] Avatar upload error:", uploadError)
      return { error: "Erro ao carregar imagem" }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("documents").getPublicUrl(filePath)

    // Update profile with new avatar URL
    const { error: updateError } = await supabase
      .from("perfis_usuarios")
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq("id", user.id)

    if (updateError) {
      console.error("[v0] Profile update error:", updateError)
      return { error: "Erro ao atualizar perfil" }
    }

    revalidatePath("/profile")
    return { success: true, url: publicUrl }
  } catch (error) {
    console.error("[v0] Update profile picture error:", error)
    return { error: "Erro ao atualizar foto de perfil" }
  }
}

export async function deleteUserFile(fileId: string) {
  const supabase = await createServerClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Não autenticado" }
    }

    const { data: file } = await supabase.from("documentos").select("url_arquivo, autor_id").eq("id", fileId).single()

    if (!file) {
      return { error: "Ficheiro não encontrado" }
    }

    if (file.autor_id !== user.id) {
      return { error: "Sem permissão para eliminar este ficheiro" }
    }

    // Delete from storage
    const filePath = file.url_arquivo.split("/").slice(-3).join("/")
    await supabase.storage.from("documents").remove([filePath])

    // Delete from database
    const { error: deleteError } = await supabase.from("documentos").delete().eq("id", fileId)

    if (deleteError) {
      console.error("[v0] Error deleting file:", deleteError)
      return { error: "Erro ao eliminar ficheiro" }
    }

    revalidatePath("/profile")
    return { success: true, message: "Ficheiro eliminado com sucesso" }
  } catch (error) {
    console.error("[v0] Error deleting user file:", error)
    return { error: "Erro ao eliminar ficheiro" }
  }
}

export async function updateApprovalTag(tag: string) {
  const supabase = await createServerClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Não autenticado" }
    }

    // Verify user is professor or director
    const { data: profile } = await supabase.from("perfis_usuarios").select("tipo_usuario").eq("id", user.id).single()

    if (!profile || (profile.tipo_usuario !== "professor" && profile.tipo_usuario !== "diretor")) {
      return { error: "Apenas professores e diretores podem criar tags de aprovação" }
    }

    const { error } = await supabase
      .from("perfis_usuarios")
      .update({
        tag_aprovacao: tag.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) throw error

    revalidatePath("/settings")
    revalidatePath("/profile")
    return { success: true, message: "Tag de aprovação atualizada com sucesso!" }
  } catch (error) {
    console.error("[v0] Error updating approval tag:", error)
    return { error: "Erro ao atualizar tag de aprovação" }
  }
}

export async function getApprovalTag() {
  const supabase = await createServerClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Não autenticado" }
    }

    const { data: profile } = await supabase
      .from("perfis_usuarios")
      .select("tag_aprovacao, tipo_usuario")
      .eq("id", user.id)
      .single()

    if (!profile) {
      return { error: "Perfil não encontrado" }
    }

    return {
      success: true,
      tag: profile.tag_aprovacao,
      canCreateTag: profile.tipo_usuario === "professor" || profile.tipo_usuario === "diretor",
    }
  } catch (error) {
    console.error("[v0] Error getting approval tag:", error)
    return { error: "Erro ao carregar tag de aprovação" }
  }
}
