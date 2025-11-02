"use server"

import { createServerClient } from "@/lib/supabase/server"
import { sendApprovalDecisionEmail } from "@/lib/email"

async function verifyAdminAccess() {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("Não autorizado")
  }

  const { data: profile } = await supabase.from("perfis_usuarios").select("tipo_usuario").eq("id", user.id).single()

  if (!profile || profile.tipo_usuario !== "admin") {
    throw new Error("Acesso negado - apenas administradores")
  }

  return { supabase, user, profile }
}

export async function getPendingApprovals() {
  try {
    const { supabase } = await verifyAdminAccess()

    const { data: pendingUsers, error } = await supabase
      .from("perfis_usuarios")
      .select(`
        *,
        universidade_id:universidades(nome, codigo)
      `)
      .in("tipo_usuario", ["diretor", "admin"])
      .eq("aprovado", false)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching pending approvals:", error)
      throw new Error("Erro ao buscar aprovações pendentes")
    }

    return { success: true, data: pendingUsers || [] }
  } catch (error) {
    console.error("[v0] Get pending approvals error:", error)
    return { error: error instanceof Error ? error.message : "Erro interno do servidor" }
  }
}

export async function approveUser(userId: string, approved: boolean) {
  try {
    const { supabase, user } = await verifyAdminAccess()

    const { data: targetUser, error: fetchError } = await supabase
      .from("perfis_usuarios")
      .select("email, nome_completo, tipo_usuario")
      .eq("id", userId)
      .single()

    if (fetchError || !targetUser) {
      throw new Error("Utilizador não encontrado")
    }

    if (approved) {
      const { error: updateError } = await supabase
        .from("perfis_usuarios")
        .update({
          aprovado: true,
          aprovado_por: user.id,
          aprovado_em: new Date().toISOString(),
          ativo: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (updateError) {
        console.error("[v0] Error approving user:", updateError)
        throw new Error("Erro ao aprovar utilizador")
      }

      try {
        await sendApprovalDecisionEmail({
          userEmail: targetUser.email,
          userName: targetUser.nome_completo,
          approved: true,
          userType: targetUser.tipo_usuario,
        })
      } catch (emailError) {
        console.error("[v0] Email sending error:", emailError)
      }

      console.log(`[v0] User ${targetUser.email} approved successfully`)
      return { success: true, message: "Utilizador aprovado com sucesso!" }
    } else {
      const { error: updateError } = await supabase
        .from("perfis_usuarios")
        .update({
          aprovado: false,
          ativo: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (updateError) {
        console.error("[v0] Error rejecting user:", updateError)
        throw new Error("Erro ao recusar utilizador")
      }

      try {
        await sendApprovalDecisionEmail({
          userEmail: targetUser.email,
          userName: targetUser.nome_completo,
          approved: false,
          userType: targetUser.tipo_usuario,
        })
      } catch (emailError) {
        console.error("[v0] Email sending error:", emailError)
      }

      console.log(`[v0] User ${targetUser.email} rejected`)
      return { success: true, message: "Utilizador recusado com sucesso!" }
    }
  } catch (error) {
    console.error("[v0] Approve user error:", error)
    return { error: error instanceof Error ? error.message : "Erro interno do servidor" }
  }
}

export async function getAllUsers(filters?: {
  tipo_usuario?: string
  universidade_id?: string
  status?: string
}) {
  try {
    const { supabase } = await verifyAdminAccess()

    let query = supabase
      .from("perfis_usuarios")
      .select(`
        *,
        universidade_id:universidades(nome, codigo)
      `)
      .order("created_at", { ascending: false })

    if (filters?.tipo_usuario) {
      query = query.eq("tipo_usuario", filters.tipo_usuario)
    }
    if (filters?.universidade_id) {
      query = query.eq("universidade_id", filters.universidade_id)
    }
    if (filters?.status) {
      query = query.eq("status", filters.status)
    }

    const { data: users, error } = await query

    if (error) {
      console.error("[v0] Error fetching users:", error)
      throw new Error("Erro ao buscar utilizadores")
    }

    return { success: true, data: users || [] }
  } catch (error) {
    console.error("[v0] Get all users error:", error)
    return { error: error instanceof Error ? error.message : "Erro interno do servidor" }
  }
}

export async function getAllDocuments(filters?: {
  aprovado?: boolean
  universidade_id?: string
  autor_id?: string
}) {
  try {
    const { supabase } = await verifyAdminAccess()

    let query = supabase
      .from("documentos")
      .select(`
        *,
        autor_id:perfis_usuarios!documentos_autor_id_fkey(nome_completo, email),
        universidade_id:universidades(nome, codigo)
      `)
      .order("created_at", { ascending: false })

    if (filters?.aprovado !== undefined) {
      query = query.eq("aprovado", filters.aprovado)
    }
    if (filters?.universidade_id) {
      query = query.eq("universidade_id", filters.universidade_id)
    }
    if (filters?.autor_id) {
      query = query.eq("autor_id", filters.autor_id)
    }

    const { data: documents, error } = await query

    if (error) {
      console.error("[v0] Error fetching documents:", error)
      throw new Error("Erro ao buscar documentos")
    }

    return { success: true, data: documents || [] }
  } catch (error) {
    console.error("[v0] Get all documents error:", error)
    return { error: error instanceof Error ? error.message : "Erro interno do servidor" }
  }
}

export async function deleteDocument(documentId: string) {
  try {
    const { supabase } = await verifyAdminAccess()

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

export async function moderateDocument(documentId: string, approved: boolean) {
  try {
    const { supabase, user } = await verifyAdminAccess()

    // Get document details
    const { data: document, error: docError } = await supabase
      .from("documentos")
      .select("autor_id, titulo")
      .eq("id", documentId)
      .single()

    if (docError || !document) {
      throw new Error("Documento não encontrado")
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

    if (approved && document.autor_id) {
      const { error: pointsError } = await supabase.rpc("increment_user_points", {
        user_id: document.autor_id,
        points_to_add: 10,
      })

      if (pointsError) {
        console.error("[v0] Error awarding points:", pointsError)
        // Don't fail the approval if points update fails
      }

      try {
        await supabase.from("notificacoes").insert({
          usuario_id: document.autor_id,
          tipo: "document_approved",
          titulo: "Documento Aprovado!",
          mensagem: `O seu documento "${document.titulo}" foi aprovado e você ganhou 10 pontos!`,
          lida: false,
        })
      } catch (notifError) {
        console.error("[v0] Error creating notification:", notifError)
      }
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

export async function getAllUniversities() {
  try {
    const { supabase } = await verifyAdminAccess()

    const { data: universities, error } = await supabase
      .from("universidades")
      .select("*")
      .order("nome", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching universities:", error)
      throw new Error("Erro ao buscar universidades")
    }

    return { success: true, data: universities || [] }
  } catch (error) {
    console.error("[v0] Get universities error:", error)
    return { error: error instanceof Error ? error.message : "Erro interno do servidor" }
  }
}

export async function getAdminStats() {
  try {
    const { supabase } = await verifyAdminAccess()

    const [
      { count: totalUsers },
      { count: totalDocuments },
      { count: pendingApprovals },
      { count: pendingDocuments },
      { count: totalUniversities },
    ] = await Promise.all([
      supabase.from("perfis_usuarios").select("*", { count: "exact", head: true }),
      supabase.from("documentos").select("*", { count: "exact", head: true }),
      supabase
        .from("perfis_usuarios")
        .select("*", { count: "exact", head: true })
        .eq("aprovado", false)
        .in("tipo_usuario", ["diretor", "admin"]),
      supabase.from("documentos").select("*", { count: "exact", head: true }).eq("aprovado", false),
      supabase.from("universidades").select("*", { count: "exact", head: true }),
    ])

    return {
      success: true,
      data: {
        totalUsers: totalUsers || 0,
        totalDocuments: totalDocuments || 0,
        pendingApprovals: pendingApprovals || 0,
        pendingDocuments: pendingDocuments || 0,
        totalUniversities: totalUniversities || 0,
      },
    }
  } catch (error) {
    console.error("[v0] Get admin stats error:", error)
    return { error: error instanceof Error ? error.message : "Erro interno do servidor" }
  }
}

export async function updateUser(
  userId: string,
  updates: {
    nome_completo?: string
    email?: string
    tipo_usuario?: string
    universidade_id?: string
    aprovado?: boolean
    ativo?: boolean
  },
) {
  try {
    const { supabase } = await verifyAdminAccess()

    const { error } = await supabase
      .from("perfis_usuarios")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      console.error("[v0] Error updating user:", error)
      throw new Error("Erro ao atualizar utilizador")
    }

    return { success: true, message: "Utilizador atualizado com sucesso!" }
  } catch (error) {
    console.error("[v0] Update user error:", error)
    return { error: error instanceof Error ? error.message : "Erro interno do servidor" }
  }
}

export async function deleteUser(userId: string) {
  try {
    const { supabase } = await verifyAdminAccess()

    // Soft delete - mark as inactive
    const { error } = await supabase
      .from("perfis_usuarios")
      .update({
        ativo: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      console.error("[v0] Error deleting user:", error)
      throw new Error("Erro ao eliminar utilizador")
    }

    return { success: true, message: "Utilizador eliminado com sucesso!" }
  } catch (error) {
    console.error("[v0] Delete user error:", error)
    return { error: error instanceof Error ? error.message : "Erro interno do servidor" }
  }
}

export async function createUniversity(data: {
  nome: string
  codigo: string
  endereco?: string
}) {
  try {
    const { supabase } = await verifyAdminAccess()

    const { error } = await supabase.from("universidades").insert({
      nome: data.nome,
      codigo: data.codigo,
      endereco: data.endereco,
    })

    if (error) {
      console.error("[v0] Error creating university:", error)
      throw new Error("Erro ao criar universidade")
    }

    return { success: true, message: "Universidade criada com sucesso!" }
  } catch (error) {
    console.error("[v0] Create university error:", error)
    return { error: error instanceof Error ? error.message : "Erro interno do servidor" }
  }
}

export async function updateUniversity(
  universityId: string,
  data: {
    nome?: string
    codigo?: string
    endereco?: string
  },
) {
  try {
    const { supabase } = await verifyAdminAccess()

    const { error } = await supabase
      .from("universidades")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", universityId)

    if (error) {
      console.error("[v0] Error updating university:", error)
      throw new Error("Erro ao atualizar universidade")
    }

    return { success: true, message: "Universidade atualizada com sucesso!" }
  } catch (error) {
    console.error("[v0] Update university error:", error)
    return { error: error instanceof Error ? error.message : "Erro interno do servidor" }
  }
}

export async function deleteUniversity(universityId: string) {
  try {
    const { supabase } = await verifyAdminAccess()

    const { error } = await supabase.from("universidades").delete().eq("id", universityId)

    if (error) {
      console.error("[v0] Error deleting university:", error)
      throw new Error("Erro ao eliminar universidade")
    }

    return { success: true, message: "Universidade eliminada com sucesso!" }
  } catch (error) {
    console.error("[v0] Delete university error:", error)
    return { error: error instanceof Error ? error.message : "Erro interno do servidor" }
  }
}
