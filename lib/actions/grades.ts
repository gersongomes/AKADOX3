"use server"

import { createServerClient } from "@/lib/supabase/server"
import { createNotification } from "./notifications"

export async function gradeDocument(data: {
  documento_id: string
  aluno_id: string
  nota: number
  comentario_privado: string
}) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Não autorizado" }
    }

    // Verify professor
    const { data: profile } = await supabase
      .from("perfis_usuarios")
      .select("tipo_usuario, nome_completo")
      .eq("id", user.id)
      .single()

    if (!profile || profile.tipo_usuario !== "professor") {
      return { error: "Apenas professores podem avaliar" }
    }

    // Insert or update grade
    const { error: gradeError } = await supabase.from("avaliacoes_privadas").upsert({
      documento_id: data.documento_id,
      aluno_id: data.aluno_id,
      professor_id: user.id,
      nota: data.nota,
      comentario_privado: data.comentario_privado,
      updated_at: new Date().toISOString(),
    })

    if (gradeError) {
      console.error("[v0] Error grading document:", gradeError)
      return { error: "Erro ao avaliar documento" }
    }

    // Create notification for student
    await createNotification({
      usuario_id: data.aluno_id,
      tipo: "avaliacao",
      titulo: "Nova Avaliação Recebida",
      mensagem: `${profile.nome_completo} avaliou o seu trabalho com nota ${data.nota}/20`,
      link: `/dashboard/aluno/notas`,
    })

    return { success: true, message: "Avaliação registada com sucesso!" }
  } catch (error) {
    console.error("[v0] Grade document error:", error)
    return { error: "Erro interno do servidor" }
  }
}

export async function getStudentGrades(alunoId?: string) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Não autorizado" }
    }

    const targetId = alunoId || user.id

    const { data: grades, error } = await supabase
      .from("avaliacoes_privadas")
      .select(`
        *,
        documento_id:documentos(titulo, tipo_arquivo),
        professor_id:perfis_usuarios!avaliacoes_privadas_professor_id_fkey(nome_completo, avatar_url)
      `)
      .eq("aluno_id", targetId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching grades:", error)
      return { error: "Erro ao buscar avaliações" }
    }

    return { success: true, data: grades || [] }
  } catch (error) {
    console.error("[v0] Get student grades error:", error)
    return { error: "Erro interno do servidor" }
  }
}

export async function getProfessorPendingGrades() {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Não autorizado" }
    }

    // Get documents that need grading (tagged to this professor, not yet graded)
    const { data: documents, error } = await supabase
      .from("documentos")
      .select(`
        *,
        autor_id:perfis_usuarios!documentos_autor_id_fkey(nome_completo, email, avatar_url, tipo_usuario)
      `)
      .eq("professor_responsavel_id", user.id)
      .eq("aprovado", false)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching pending grades:", error)
      return { error: "Erro ao buscar documentos pendentes" }
    }

    return { success: true, data: documents || [] }
  } catch (error) {
    console.error("[v0] Get pending grades error:", error)
    return { error: "Erro interno do servidor" }
  }
}
