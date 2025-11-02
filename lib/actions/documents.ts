"use server"

import { createServerClient } from "@/lib/supabase/server"

export async function getDocuments(filters?: {
  searchQuery?: string
  universidade?: string
  categoria?: string
  tipo?: string
  minRating?: number
  limit?: number
  offset?: number
}) {
  const supabase = await createServerClient()

  console.log("[v0] Fetching documents with filters:", filters)

  let query = supabase
    .from("documentos")
    .select(
      `
      id,
      titulo,
      descricao,
      tipo_arquivo,
      categoria,
      tags,
      downloads,
      visualizacoes,
      ano_publicacao,
      thumbnail_url,
      created_at,
      aprovado,
      universidade_id,
      universidades (
        nome,
        codigo
      ),
      autor_id,
      perfis_usuarios!documentos_autor_id_fkey (
        nome_completo,
        avatar_url
      ),
      avaliacoes (
        rating
      ),
      comentarios (
        id
      )
    `,
    )
    .eq("aprovado", true)
    .order("created_at", { ascending: false })

  // Apply filters
  if (filters?.searchQuery) {
    query = query.or(
      `titulo.ilike.%${filters.searchQuery}%,descricao.ilike.%${filters.searchQuery}%,categoria.ilike.%${filters.searchQuery}%`,
    )
  }

  if (filters?.universidade) {
    query = query.eq("universidades.nome", filters.universidade)
  }

  if (filters?.categoria) {
    query = query.eq("categoria", filters.categoria)
  }

  if (filters?.tipo) {
    query = query.eq("tipo_arquivo", filters.tipo)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error fetching documents:", error.message)
    return []
  }

  console.log("[v0] Fetched documents:", data?.length || 0)

  const documentsWithRatings = (data || []).map((doc: any) => {
    const ratings = doc.avaliacoes || []
    const avgRating =
      ratings.length > 0 ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length : 0

    return {
      ...doc,
      averageRating: avgRating,
      ratingCount: ratings.length,
      total_comentarios: doc.comentarios?.length || 0,
    }
  })

  // Filter by minimum rating if specified
  if (filters?.minRating !== undefined && filters.minRating > 0) {
    return documentsWithRatings.filter((doc: any) => doc.averageRating >= filters.minRating)
  }

  return documentsWithRatings
}

export async function getDocumentById(id: string) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("documentos")
    .select(
      `
      *,
      universidades (
        nome,
        codigo,
        logo_url
      ),
      cursos (
        nome,
        codigo
      ),
      disciplinas (
        nome,
        codigo
      ),
      perfis_usuarios!documentos_autor_id_fkey (
        id,
        nome_completo,
        avatar_url,
        tipo_usuario
      ),
      aprovado_por_user:perfis_usuarios!documentos_aprovado_por_fkey (
        nome_completo,
        avatar_url
      ),
      avaliacoes (
        rating
      ),
      comentarios (
        id
      )
    `,
    )
    .eq("id", id)
    .single()

  if (error) {
    console.error("[v0] Error fetching document:", error)
    return null
  }

  const ratings = data.avaliacoes || []
  const avgRating = ratings.length > 0 ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length : 0

  // Increment view count
  await supabase
    .from("documentos")
    .update({ visualizacoes: (data.visualizacoes || 0) + 1 })
    .eq("id", id)

  return {
    ...data,
    avaliacao_media: avgRating,
    total_avaliacoes: ratings.length,
    total_comentarios: data.comentarios?.length || 0,
  }
}

export async function getPopularDocuments(limit = 10) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("documentos")
    .select(
      `
      id,
      titulo,
      descricao,
      tipo_arquivo,
      categoria,
      downloads,
      visualizacoes,
      thumbnail_url,
      created_at,
      universidades (
        nome
      ),
      autor_id:perfis_usuarios!documentos_autor_id_fkey (
        nome_completo
      )
    `,
    )
    .eq("aprovado", true)
    .order("downloads", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("[v0] Error fetching popular documents:", error)
    return []
  }

  return data || []
}

export async function getRecentDocuments(limit = 10) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("documentos")
    .select(
      `
      id,
      titulo,
      descricao,
      tipo_arquivo,
      categoria,
      downloads,
      visualizacoes,
      thumbnail_url,
      created_at,
      universidades (
        nome
      ),
      autor_id:perfis_usuarios!documentos_autor_id_fkey (
        nome_completo
      )
    `,
    )
    .eq("aprovado", true)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("[v0] Error fetching recent documents:", error)
    return []
  }

  return data || []
}

export async function incrementDownloads(documentId: string) {
  const supabase = await createServerClient()

  const { data: doc } = await supabase.from("documentos").select("downloads").eq("id", documentId).single()

  if (doc) {
    await supabase
      .from("documentos")
      .update({ downloads: (doc.downloads || 0) + 1 })
      .eq("id", documentId)
  }
}

export async function getDocumentDownloadUrl(documentId: string) {
  const supabase = await createServerClient()

  const { data: doc, error } = await supabase
    .from("documentos")
    .select("url_arquivo, titulo")
    .eq("id", documentId)
    .single()

  if (error || !doc) {
    return { error: "Documento não encontrado" }
  }

  return { url: doc.url_arquivo, titulo: doc.titulo }
}

export async function getProfessorTags(universidadeId?: string) {
  const supabase = await createServerClient()

  let query = supabase
    .from("perfis_usuarios")
    .select("id, nome_completo, tag_aprovacao, universidade_id, universidades(nome)")
    .eq("tipo_usuario", "professor")
    .not("tag_aprovacao", "is", null)

  if (universidadeId) {
    query = query.eq("universidade_id", universidadeId)
  }

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error fetching professor tags:", error)
    return []
  }

  return data || []
}

export async function getUniversityTags() {
  const supabase = await createServerClient()

  const { data, error } = await supabase.from("universidades").select("id, nome, codigo").eq("ativa", true)

  if (error) {
    console.error("[v0] Error fetching university tags:", error)
    return []
  }

  return data || []
}
