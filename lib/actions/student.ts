"use server"

import { createServerClient } from "@/lib/supabase/server"
import { createNotification } from "./notifications"

async function verifyStudentAccess() {
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
    .select("tipo_usuario, universidade_id, nome_completo")
    .eq("id", user.id)
    .single()

  if (!profile || profile.tipo_usuario !== "aluno") {
    throw new Error("Acesso negado - apenas alunos")
  }

  return { supabase, user, profile }
}

export async function getStudentStats() {
  try {
    const { supabase, user } = await verifyStudentAccess()

    const [{ count: myDocuments }, { count: pendingDocuments }, { count: approvedDocuments }, { count: totalGrades }] =
      await Promise.all([
        supabase.from("documentos").select("*", { count: "exact", head: true }).eq("autor_id", user.id),
        supabase
          .from("documentos")
          .select("*", { count: "exact", head: true })
          .eq("autor_id", user.id)
          .eq("status", "pendente"),
        supabase
          .from("documentos")
          .select("*", { count: "exact", head: true })
          .eq("autor_id", user.id)
          .eq("status", "aprovado"),
        supabase.from("avaliacoes_privadas").select("*", { count: "exact", head: true }).eq("aluno_id", user.id),
      ])

    // Calculate average grade
    const { data: grades } = await supabase.from("avaliacoes_privadas").select("nota").eq("aluno_id", user.id)

    const averageGrade =
      grades && grades.length > 0 ? grades.reduce((sum, g) => sum + (g.nota || 0), 0) / grades.length : 0

    return {
      success: true,
      data: {
        myDocuments: myDocuments || 0,
        pendingDocuments: pendingDocuments || 0,
        approvedDocuments: approvedDocuments || 0,
        totalGrades: totalGrades || 0,
        averageGrade: Math.round(averageGrade * 10) / 10,
      },
    }
  } catch (error) {
    console.error("[v0] Get student stats error:", error)
    return { error: error instanceof Error ? error.message : "Erro interno do servidor" }
  }
}

export async function getStudentDocuments() {
  try {
    const { supabase, user } = await verifyStudentAccess()

    const { data: documents, error } = await supabase
      .from("documentos")
      .select(`
        *,
        professor:perfis_usuarios!documentos_professor_responsavel_id_fkey(id, nome_completo, avatar_url)
      `)
      .eq("autor_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching student documents:", error)
      throw new Error("Erro ao buscar documentos")
    }

    return { success: true, data: documents || [] }
  } catch (error) {
    console.error("[v0] Get student documents error:", error)
    return { error: error instanceof Error ? error.message : "Erro interno do servidor" }
  }
}

export async function getStudentGradesWithDetails() {
  try {
    const { supabase, user } = await verifyStudentAccess()

    const { data: grades, error } = await supabase
      .from("avaliacoes_privadas")
      .select(`
        *,
        documento:documentos(id, titulo, tipo_documento, disciplina),
        professor:perfis_usuarios!avaliacoes_privadas_professor_id_fkey(id, nome_completo, avatar_url)
      `)
      .eq("aluno_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching grades:", error)
      throw new Error("Erro ao buscar avaliações")
    }

    return { success: true, data: grades || [] }
  } catch (error) {
    console.error("[v0] Get student grades error:", error)
    return { error: error instanceof Error ? error.message : "Erro interno do servidor" }
  }
}

export async function submitApprovalRequest(data: {
  aprovadorId: string
  documentoId?: string
  mensagem?: string
  tagUsada?: string
}) {
  try {
    const { supabase, user, profile } = await verifyStudentAccess()

    // Check if request already exists
    const { data: existing } = await supabase
      .from("solicitacoes_aprovacao")
      .select("id")
      .eq("solicitante_id", user.id)
      .eq("aprovador_id", data.aprovadorId)
      .eq("status", "pendente")
      .single()

    if (existing) {
      throw new Error("Já existe uma solicitação pendente para este professor/diretor")
    }

    // Create approval request
    const { error } = await supabase.from("solicitacoes_aprovacao").insert({
      solicitante_id: user.id,
      aprovador_id: data.aprovadorId,
      documento_id: data.documentoId,
      mensagem: data.mensagem,
      tag_usada: data.tagUsada,
      status: "pendente",
    })

    if (error) {
      console.error("[v0] Error creating approval request:", error)
      throw new Error("Erro ao criar solicitação")
    }

    // Create notification for approver
    await createNotification({
      usuario_id: data.aprovadorId,
      tipo: "aprovacao",
      titulo: "Nova Solicitação de Aprovação",
      mensagem: `${profile.nome_completo} solicitou sua aprovação`,
      link: `/dashboard/professor`,
    })

    return { success: true, message: "Solicitação enviada com sucesso!" }
  } catch (error) {
    console.error("[v0] Submit approval request error:", error)
    return { error: error instanceof Error ? error.message : "Erro interno do servidor" }
  }
}

export async function getStudentApprovalRequests() {
  try {
    const { supabase, user } = await verifyStudentAccess()

    const { data: requests, error } = await supabase
      .from("solicitacoes_aprovacao")
      .select(`
        *,
        aprovador:perfis_usuarios!solicitacoes_aprovacao_aprovador_id_fkey(id, nome_completo, avatar_url, tipo_usuario),
        documento:documentos(id, titulo)
      `)
      .eq("solicitante_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching approval requests:", error)
      throw new Error("Erro ao buscar solicitações")
    }

    return { success: true, data: requests || [] }
  } catch (error) {
    console.error("[v0] Get student approval requests error:", error)
    return { error: error instanceof Error ? error.message : "Erro interno do servidor" }
  }
}

export async function getAvailableProfessors() {
  try {
    const { supabase, profile } = await verifyStudentAccess()

    const { data: professors, error } = await supabase
      .from("perfis_usuarios")
      .select("id, nome_completo, avatar_url, tag_aprovacao")
      .eq("tipo_usuario", "professor")
      .eq("universidade_id", profile.universidade_id)
      .not("tag_aprovacao", "is", null)
      .order("nome_completo", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching professors:", error)
      throw new Error("Erro ao buscar professores")
    }

    return { success: true, data: professors || [] }
  } catch (error) {
    console.error("[v0] Get available professors error:", error)
    return { error: error instanceof Error ? error.message : "Erro interno do servidor" }
  }
}

export async function getFollowingFollowers() {
  try {
    const { supabase, user } = await verifyStudentAccess()

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
