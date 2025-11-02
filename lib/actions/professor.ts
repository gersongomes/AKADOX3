"use server"

import { createServerClient } from "@/lib/supabase/server"
import { createNotification } from "./notifications"

async function verifyProfessorAccess() {
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

  if (!profile || profile.tipo_usuario !== "professor") {
    throw new Error("Acesso negado - apenas professores")
  }

  return { supabase, user, profile }
}

export async function getProfessorStats() {
  try {
    const { supabase, user } = await verifyProfessorAccess()

    const [{ count: pendingGrades }, { count: totalGrades }, { count: approvalRequests }, { count: myDocuments }] =
      await Promise.all([
        supabase
          .from("documentos")
          .select("*", { count: "exact", head: true })
          .eq("professor_responsavel_id", user.id)
          .eq("status", "pendente"),
        supabase.from("avaliacoes_privadas").select("*", { count: "exact", head: true }).eq("professor_id", user.id),
        supabase
          .from("solicitacoes_aprovacao")
          .select("*", { count: "exact", head: true })
          .eq("aprovador_id", user.id)
          .eq("status", "pendente"),
        supabase.from("documentos").select("*", { count: "exact", head: true }).eq("autor_id", user.id),
      ])

    return {
      success: true,
      data: {
        pendingGrades: pendingGrades || 0,
        totalGrades: totalGrades || 0,
        approvalRequests: approvalRequests || 0,
        myDocuments: myDocuments || 0,
      },
    }
  } catch (error) {
    console.error("[v0] Get professor stats error:", error)
    return { error: error instanceof Error ? error.message : "Erro interno do servidor" }
  }
}

export async function getPendingGradingDocuments() {
  try {
    const { supabase, user } = await verifyProfessorAccess()

    const { data: documents, error } = await supabase
      .from("documentos")
      .select(`
        *,
        autor:perfis_usuarios!documentos_autor_id_fkey(id, nome_completo, email, avatar_url)
      `)
      .eq("professor_responsavel_id", user.id)
      .eq("status", "pendente")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching pending documents:", error)
      throw new Error("Erro ao buscar documentos pendentes")
    }

    return { success: true, data: documents || [] }
  } catch (error) {
    console.error("[v0] Get pending grading documents error:", error)
    return { error: error instanceof Error ? error.message : "Erro interno do servidor" }
  }
}

export async function gradeAndApproveDocument(data: {
  documentoId: string
  alunoId: string
  nota: number
  feedback: string
  aprovado: boolean
}) {
  try {
    const { supabase, user, profile } = await verifyProfessorAccess()

    // Update document status
    const { error: docError } = await supabase
      .from("documentos")
      .update({
        status: data.aprovado ? "aprovado" : "rejeitado",
        aprovado_por: user.id,
        nota: data.nota,
        feedback: data.feedback,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.documentoId)

    if (docError) {
      console.error("[v0] Error updating document:", docError)
      throw new Error("Erro ao atualizar documento")
    }

    // Create private grade
    const { error: gradeError } = await supabase.from("avaliacoes_privadas").insert({
      documento_id: data.documentoId,
      aluno_id: data.alunoId,
      professor_id: user.id,
      nota: data.nota,
      comentario_privado: data.feedback,
    })

    if (gradeError) {
      console.error("[v0] Error creating grade:", gradeError)
    }

    // Award points if approved
    if (data.aprovado) {
      await supabase.rpc("add_points", {
        user_id: data.alunoId,
        points: 50,
      })
    }

    // Create notification
    await createNotification({
      usuario_id: data.alunoId,
      tipo: "nota",
      titulo: data.aprovado ? "Documento Aprovado" : "Documento Rejeitado",
      mensagem: `${profile.nome_completo} avaliou o seu documento com nota ${data.nota}/20`,
      link: `/dashboard/aluno`,
    })

    return {
      success: true,
      message: data.aprovado ? "Documento aprovado e avaliado!" : "Documento rejeitado com feedback",
    }
  } catch (error) {
    console.error("[v0] Grade and approve document error:", error)
    return { error: error instanceof Error ? error.message : "Erro interno do servidor" }
  }
}

export async function getApprovalRequests() {
  try {
    const { supabase, user } = await verifyProfessorAccess()

    const { data: requests, error } = await supabase
      .from("solicitacoes_aprovacao")
      .select(`
        *,
        solicitante:perfis_usuarios!solicitacoes_aprovacao_solicitante_id_fkey(id, nome_completo, email, avatar_url),
        documento:documentos(id, titulo, tipo_documento)
      `)
      .eq("aprovador_id", user.id)
      .eq("status", "pendente")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching approval requests:", error)
      throw new Error("Erro ao buscar solicitações")
    }

    return { success: true, data: requests || [] }
  } catch (error) {
    console.error("[v0] Get approval requests error:", error)
    return { error: error instanceof Error ? error.message : "Erro interno do servidor" }
  }
}

export async function moderateApprovalRequest(requestId: string, approved: boolean) {
  try {
    const { supabase, user, profile } = await verifyProfessorAccess()

    // Get request details
    const { data: request } = await supabase
      .from("solicitacoes_aprovacao")
      .select("solicitante_id, documento_id")
      .eq("id", requestId)
      .single()

    if (!request) {
      throw new Error("Solicitação não encontrada")
    }

    // Update request status
    const { error: updateError } = await supabase
      .from("solicitacoes_aprovacao")
      .update({
        status: approved ? "aprovado" : "rejeitado",
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)

    if (updateError) {
      console.error("[v0] Error updating request:", updateError)
      throw new Error("Erro ao atualizar solicitação")
    }

    // If approved, assign professor to document
    if (approved && request.documento_id) {
      await supabase
        .from("documentos")
        .update({
          professor_responsavel_id: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", request.documento_id)
    }

    // Create notification
    await createNotification({
      usuario_id: request.solicitante_id,
      tipo: "aprovacao",
      titulo: approved ? "Solicitação Aprovada" : "Solicitação Rejeitada",
      mensagem: approved
        ? `${profile.nome_completo} aceitou ser seu orientador`
        : `${profile.nome_completo} rejeitou sua solicitação`,
      link: `/dashboard/aluno`,
    })

    return {
      success: true,
      message: approved ? "Solicitação aprovada!" : "Solicitação rejeitada",
    }
  } catch (error) {
    console.error("[v0] Moderate approval request error:", error)
    return { error: error instanceof Error ? error.message : "Erro interno do servidor" }
  }
}

export async function getGradingHistory() {
  try {
    const { supabase, user } = await verifyProfessorAccess()

    const { data: grades, error } = await supabase
      .from("avaliacoes_privadas")
      .select(`
        *,
        documento:documentos(id, titulo, tipo_documento),
        aluno:perfis_usuarios!avaliacoes_privadas_aluno_id_fkey(id, nome_completo, avatar_url)
      `)
      .eq("professor_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) {
      console.error("[v0] Error fetching grading history:", error)
      throw new Error("Erro ao buscar histórico")
    }

    return { success: true, data: grades || [] }
  } catch (error) {
    console.error("[v0] Get grading history error:", error)
    return { error: error instanceof Error ? error.message : "Erro interno do servidor" }
  }
}

export async function getFollowingFollowers() {
  try {
    const { supabase, user } = await verifyProfessorAccess()

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
