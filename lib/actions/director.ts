"use server"

import { createServerClient } from "@/lib/supabase/server"

async function verifyDirectorAccess() {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("Não autorizado")
  }

  const { data: profile } = await supabase
    .from("perfis_usuarios")
    .select("tipo_usuario, universidade_id")
    .eq("id", user.id)
    .single()

  if (!profile || profile.tipo_usuario !== "diretor") {
    throw new Error("Acesso negado - apenas diretores")
  }

  if (!profile.universidade_id) {
    throw new Error("Diretor sem universidade associada")
  }

  return { supabase, user, profile, universidadeId: profile.universidade_id }
}

export async function getDirectorStats() {
  try {
    const { supabase, universidadeId } = await verifyDirectorAccess()

    const [
      { count: totalStudents },
      { count: totalProfessors },
      { count: totalDocuments },
      { count: pendingDocuments },
    ] = await Promise.all([
      supabase
        .from("perfis_usuarios")
        .select("*", { count: "exact", head: true })
        .eq("universidade_id", universidadeId)
        .eq("tipo_usuario", "aluno"),
      supabase
        .from("perfis_usuarios")
        .select("*", { count: "exact", head: true })
        .eq("universidade_id", universidadeId)
        .eq("tipo_usuario", "professor"),
      supabase.from("documentos").select("*", { count: "exact", head: true }).eq("universidade_id", universidadeId),
      supabase
        .from("documentos")
        .select("*", { count: "exact", head: true })
        .eq("universidade_id", universidadeId)
        .eq("aprovado", false),
    ])

    return {
      success: true,
      data: {
        totalStudents: totalStudents || 0,
        totalProfessors: totalProfessors || 0,
        totalDocuments: totalDocuments || 0,
        pendingDocuments: pendingDocuments || 0,
      },
    }
  } catch (error) {
    console.error("[v0] Get director stats error:", error)
    return { error: error instanceof Error ? error.message : "Erro interno do servidor" }
  }
}

export async function getUniversityDocuments(filters?: { aprovado?: boolean }) {
  try {
    const { supabase, universidadeId } = await verifyDirectorAccess()

    let query = supabase
      .from("documentos")
      .select(`
        *,
        autor_id:perfis_usuarios!documentos_autor_id_fkey(nome_completo, email, tipo_usuario)
      `)
      .eq("universidade_id", universidadeId)
      .order("created_at", { ascending: false })

    if (filters?.aprovado !== undefined) {
      query = query.eq("aprovado", filters.aprovado)
    }

    const { data: documents, error } = await query

    if (error) {
      console.error("[v0] Error fetching university documents:", error)
      throw new Error("Erro ao buscar documentos")
    }

    return { success: true, data: documents || [] }
  } catch (error) {
    console.error("[v0] Get university documents error:", error)
    return { error: error instanceof Error ? error.message : "Erro interno do servidor" }
  }
}

export async function getUniversityProfessors() {
  try {
    const { supabase, universidadeId } = await verifyDirectorAccess()

    const { data: professors, error } = await supabase
      .from("perfis_usuarios")
      .select("*")
      .eq("universidade_id", universidadeId)
      .eq("tipo_usuario", "professor")
      .order("nome_completo", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching professors:", error)
      throw new Error("Erro ao buscar professores")
    }

    return { success: true, data: professors || [] }
  } catch (error) {
    console.error("[v0] Get professors error:", error)
    return { error: error instanceof Error ? error.message : "Erro interno do servidor" }
  }
}

export async function moderateUniversityDocument(documentId: string, approved: boolean) {
  try {
    const { supabase, user, universidadeId } = await verifyDirectorAccess()

    // Verify document belongs to this university
    const { data: doc } = await supabase.from("documentos").select("universidade_id").eq("id", documentId).single()

    if (!doc || doc.universidade_id !== universidadeId) {
      throw new Error("Documento não pertence a esta universidade")
    }

    const { error } = await supabase
      .from("documentos")
      .update({
        aprovado: approved,
        aprovado_por: user.id,
        aprovado_em: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", documentId)

    if (error) {
      console.error("[v0] Error moderating document:", error)
      throw new Error("Erro ao moderar documento")
    }

    return {
      success: true,
      message: approved ? "Documento aprovado com sucesso!" : "Documento recusado com sucesso!",
    }
  } catch (error) {
    console.error("[v0] Moderate document error:", error)
    return { error: error instanceof Error ? error.message : "Erro interno do servidor" }
  }
}

export async function deleteUniversityDocument(documentId: string) {
  try {
    const { supabase, universidadeId } = await verifyDirectorAccess()

    // Verify document belongs to this university
    const { data: doc } = await supabase
      .from("documentos")
      .select("universidade_id, autor_id")
      .eq("id", documentId)
      .single()

    if (!doc || doc.universidade_id !== universidadeId) {
      throw new Error("Documento não pertence a esta universidade")
    }

    const { error } = await supabase.from("documentos").delete().eq("id", documentId)

    if (error) {
      console.error("[v0] Error deleting document:", error)
      throw new Error("Erro ao eliminar documento")
    }

    return { success: true, message: "Documento eliminado com sucesso!" }
  } catch (error) {
    console.error("[v0] Delete document error:", error)
    return { error: error instanceof Error ? error.message : "Erro interno do servidor" }
  }
}

export async function addProfessor(email: string) {
  try {
    const { supabase, universidadeId } = await verifyDirectorAccess()

    // Check if user exists
    const { data: existingUser } = await supabase
      .from("perfis_usuarios")
      .select("id, tipo_usuario, universidade_id")
      .eq("email", email)
      .single()

    if (!existingUser) {
      throw new Error("Utilizador não encontrado")
    }

    if (existingUser.tipo_usuario === "professor" && existingUser.universidade_id === universidadeId) {
      throw new Error("Este utilizador já é professor desta universidade")
    }

    // Update user to professor
    const { error } = await supabase
      .from("perfis_usuarios")
      .update({
        tipo_usuario: "professor",
        universidade_id: universidadeId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingUser.id)

    if (error) {
      console.error("[v0] Error adding professor:", error)
      throw new Error("Erro ao adicionar professor")
    }

    // Create notification
    await supabase.from("notificacoes").insert({
      usuario_id: existingUser.id,
      tipo: "aprovacao",
      titulo: "Promovido a Professor",
      mensagem: "Você foi promovido a professor da universidade!",
      lida: false,
    })

    return { success: true, message: "Professor adicionado com sucesso!" }
  } catch (error) {
    console.error("[v0] Add professor error:", error)
    return { error: error instanceof Error ? error.message : "Erro interno do servidor" }
  }
}

export async function removeProfessor(professorId: string) {
  try {
    const { supabase, universidadeId } = await verifyDirectorAccess()

    // Verify professor belongs to this university
    const { data: professor } = await supabase
      .from("perfis_usuarios")
      .select("universidade_id, tipo_usuario")
      .eq("id", professorId)
      .single()

    if (!professor || professor.universidade_id !== universidadeId || professor.tipo_usuario !== "professor") {
      throw new Error("Professor não encontrado nesta universidade")
    }

    // Downgrade to student
    const { error } = await supabase
      .from("perfis_usuarios")
      .update({
        tipo_usuario: "aluno",
        updated_at: new Date().toISOString(),
      })
      .eq("id", professorId)

    if (error) {
      console.error("[v0] Error removing professor:", error)
      throw new Error("Erro ao remover professor")
    }

    // Create notification
    await supabase.from("notificacoes").insert({
      usuario_id: professorId,
      tipo: "aprovacao",
      titulo: "Status de Professor Removido",
      mensagem: "Seu status de professor foi removido.",
      lida: false,
    })

    return { success: true, message: "Professor removido com sucesso!" }
  } catch (error) {
    console.error("[v0] Remove professor error:", error)
    return { error: error instanceof Error ? error.message : "Erro interno do servidor" }
  }
}

export async function getCommonUserRequests() {
  try {
    const { supabase, universidadeId } = await verifyDirectorAccess()

    const { data: requests, error } = await supabase
      .from("solicitacoes_universidade")
      .select(`
        *,
        usuario:perfis_usuarios!solicitacoes_universidade_usuario_id_fkey(id, nome_completo, email, avatar_url)
      `)
      .eq("universidade_id", universidadeId)
      .eq("status", "pendente")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching requests:", error)
      throw new Error("Erro ao buscar solicitações")
    }

    return { success: true, data: requests || [] }
  } catch (error) {
    console.error("[v0] Get common user requests error:", error)
    return { error: error instanceof Error ? error.message : "Erro interno do servidor" }
  }
}

export async function moderateCommonUserRequest(requestId: string, approved: boolean) {
  try {
    const { supabase, user, universidadeId } = await verifyDirectorAccess()

    // Get request details
    const { data: request } = await supabase
      .from("solicitacoes_universidade")
      .select("usuario_id, universidade_id")
      .eq("id", requestId)
      .single()

    if (!request || request.universidade_id !== universidadeId) {
      throw new Error("Solicitação não encontrada")
    }

    // Update request status
    const { error: updateError } = await supabase
      .from("solicitacoes_universidade")
      .update({
        status: approved ? "aprovado" : "rejeitado",
        aprovado_por: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)

    if (updateError) {
      console.error("[v0] Error updating request:", updateError)
      throw new Error("Erro ao atualizar solicitação")
    }

    // If approved, update user to student
    if (approved) {
      const { error: userError } = await supabase
        .from("perfis_usuarios")
        .update({
          tipo_usuario: "aluno",
          universidade_id: universidadeId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", request.usuario_id)

      if (userError) {
        console.error("[v0] Error updating user:", userError)
        throw new Error("Erro ao atualizar utilizador")
      }

      // Award points
      await supabase.rpc("add_points", {
        user_id: request.usuario_id,
        points: 50,
      })
    }

    // Create notification
    await supabase.from("notificacoes").insert({
      usuario_id: request.usuario_id,
      tipo: "aprovacao",
      titulo: approved ? "Solicitação Aprovada" : "Solicitação Rejeitada",
      mensagem: approved
        ? "Sua solicitação para entrar na universidade foi aprovada!"
        : "Sua solicitação para entrar na universidade foi rejeitada.",
      lida: false,
    })

    return {
      success: true,
      message: approved ? "Solicitação aprovada com sucesso!" : "Solicitação rejeitada com sucesso!",
    }
  } catch (error) {
    console.error("[v0] Moderate request error:", error)
    return { error: error instanceof Error ? error.message : "Erro interno do servidor" }
  }
}

export async function getFollowingFollowers() {
  try {
    const { supabase, user } = await verifyDirectorAccess()

    const [{ data: following }, { data: followers }] = await Promise.all([
      supabase
        .from("seguidores")
        .select(`
          seguindo:perfis_usuarios!seguidores_seguindo_id_fkey(id, nome_completo, avatar_url, tipo_usuario)
        `)
        .eq("seguidor_id", user.id),
      supabase
        .from("seguidores")
        .select(`
          seguidor:perfis_usuarios!seguidores_seguidor_id_fkey(id, nome_completo, avatar_url, tipo_usuario)
        `)
        .eq("seguindo_id", user.id),
    ])

    return {
      success: true,
      data: {
        following: following || [],
        followers: followers || [],
      },
    }
  } catch (error) {
    console.error("[v0] Get following/followers error:", error)
    return { error: error instanceof Error ? error.message : "Erro interno do servidor" }
  }
}
