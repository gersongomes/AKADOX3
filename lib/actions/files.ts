"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function uploadFile(formData: FormData) {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: "Utilizador não autenticado" }
  }

  try {
    const { data: userProfile, error: profileError } = await supabase
      .from("perfis_usuarios")
      .select("id, tipo_usuario, nome_completo")
      .eq("id", user.id)
      .single()

    if (profileError || !userProfile) {
      console.log("[v0] User profile not found, creating one...")

      const { error: createProfileError } = await supabase.from("perfis_usuarios").insert({
        id: user.id,
        email: user.email || "",
        nome_completo: user.user_metadata?.name || user.email?.split("@")[0] || "Utilizador",
        tipo_usuario: "pessoa_comum",
        pontos: 0,
        nivel: 1,
        aprovado: true,
        ativo: true,
      })

      if (createProfileError) {
        console.error("[v0] Error creating profile:", createProfileError)
        return {
          success: false,
          error: "Erro ao criar perfil. Por favor, contacte o suporte.",
        }
      }
    }

    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const university = formData.get("university") as string
    const subject = formData.get("subject") as string
    const fileType = formData.get("fileType") as string
    const year = formData.get("year") as string
    const tags = JSON.parse((formData.get("tags") as string) || "[]")
    const approvalTag = formData.get("approvalTag") as string

    if (!file || !title || !university || !subject || !fileType) {
      return { success: false, error: "Campos obrigatórios em falta" }
    }

    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `uploads/${user.id}/${fileName}`

    const { error: uploadError } = await supabase.storage.from("documents").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (uploadError) {
      console.error("[v0] Upload error:", uploadError)
      return { success: false, error: "Erro ao carregar ficheiro" }
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("documents").getPublicUrl(filePath)

    const { data: universityData } = await supabase.from("universidades").select("id").eq("nome", university).single()

    const isAutoApproved = userProfile?.tipo_usuario === "professor"

    const { data: document, error: insertError } = await supabase
      .from("documentos")
      .insert({
        titulo: title,
        descricao: description,
        tipo_arquivo: fileType,
        tamanho_arquivo: file.size,
        url_arquivo: publicUrl,
        universidade_id: universityData?.id,
        autor_id: user.id,
        ano_publicacao: year ? Number.parseInt(year.split("/")[0]) : new Date().getFullYear(),
        tags: tags,
        categoria: subject,
        aprovado: isAutoApproved,
      })
      .select()
      .single()

    if (insertError) {
      console.error("[v0] Insert error:", insertError)
      await supabase.storage.from("documents").remove([filePath])
      return { success: false, error: "Erro ao guardar metadados" }
    }

    let notificationMessage = ""
    let professorName = ""
    let universityName = ""

    if (userProfile?.tipo_usuario === "professor") {
      await supabase.from("notificacoes").insert({
        usuario_id: user.id,
        tipo: "upload_success",
        titulo: "Upload bem-sucedido",
        mensagem: `O teu documento "${title}" foi carregado com sucesso e está disponível.`,
        link: `/browse/${document.id}`,
      })
      notificationMessage = "Upload bem-sucedido! O teu documento está disponível."
    } else if (userProfile?.tipo_usuario === "aluno" && approvalTag) {
      const { data: professor } = await supabase
        .from("perfis_usuarios")
        .select("id, nome_completo")
        .eq("professor_tag", approvalTag)
        .single()

      if (professor) {
        professorName = professor.nome_completo
        await supabase.from("notificacoes").insert([
          {
            usuario_id: user.id,
            tipo: "upload_pending",
            titulo: "Upload enviado para aprovação",
            mensagem: `O teu documento "${title}" foi enviado para aprovação de ${professor.nome_completo}.`,
            link: `/browse/${document.id}`,
          },
          {
            usuario_id: professor.id,
            tipo: "approval_request",
            titulo: "Novo pedido de aprovação",
            mensagem: `${userProfile.nome_completo} enviou "${title}" para a tua aprovação.`,
            link: `/dashboard/professor`,
          },
        ])
      }
    } else if (userProfile?.tipo_usuario === "pessoa_comum" && approvalTag) {
      const { data: university } = await supabase
        .from("universidades")
        .select("id, nome")
        .eq("university_tag", approvalTag)
        .single()

      if (university) {
        universityName = university.nome
        await supabase.from("notificacoes").insert({
          usuario_id: user.id,
          tipo: "upload_pending",
          titulo: "Pedido enviado à universidade",
          mensagem: `O teu pedido "${title}" foi enviado à ${university.nome}.`,
          link: `/browse/${document.id}`,
        })

        const { data: directors } = await supabase
          .from("perfis_usuarios")
          .select("id")
          .eq("tipo_usuario", "diretor")
          .eq("universidade_id", university.id)

        if (directors && directors.length > 0) {
          const directorNotifications = directors.map((director) => ({
            usuario_id: director.id,
            tipo: "approval_request",
            titulo: "Novo pedido de aprovação",
            mensagem: `${userProfile.nome_completo} enviou "${title}" para aprovação da universidade.`,
            link: `/dashboard/diretor`,
          }))
          await supabase.from("notificacoes").insert(directorNotifications)
        }
      }
    }

    revalidatePath("/upload")
    revalidatePath("/browse")

    return {
      success: true,
      data: document,
      userType: userProfile?.tipo_usuario,
      professorName,
      universityName,
    }
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return { success: false, error: "Erro inesperado ao carregar ficheiro" }
  }
}

export async function getRecentUploads(userId: string, limit = 5) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("documentos")
    .select(
      `
      id,
      titulo,
      tipo_arquivo,
      categoria,
      created_at,
      visualizacoes
    `,
    )
    .eq("autor_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("[v0] Error fetching recent uploads:", error)
    return []
  }

  return data
}

export async function downloadFile(documentId: string) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Não autenticado" }
  }

  try {
    const { data: document, error: docError } = await supabase
      .from("documentos")
      .select("url_arquivo, titulo, downloads, tipo_arquivo")
      .eq("id", documentId)
      .single()

    if (docError || !document) {
      console.error("[v0] Error fetching document:", docError)
      return { success: false, error: "Documento não encontrado" }
    }

    const { error: updateError } = await supabase
      .from("documentos")
      .update({ downloads: (document.downloads || 0) + 1 })
      .eq("id", documentId)

    if (updateError) {
      console.error("[v0] Error updating download count:", updateError)
    }

    if (document.url_arquivo.startsWith("http")) {
      return { success: true, url: document.url_arquivo, filename: document.titulo }
    }

    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from("documents")
      .createSignedUrl(document.url_arquivo, 60, {
        download: true,
      })

    if (urlError || !signedUrlData) {
      console.error("[v0] Error creating signed URL:", urlError)
      const {
        data: { publicUrl },
      } = supabase.storage.from("documents").getPublicUrl(document.url_arquivo)
      return { success: true, url: publicUrl, filename: document.titulo }
    }

    revalidatePath(`/browse/${documentId}`)
    return { success: true, url: signedUrlData.signedUrl, filename: document.titulo }
  } catch (error) {
    console.error("[v0] Download error:", error)
    return { success: false, error: "Erro ao preparar download" }
  }
}

export async function deleteFile(fileId: string) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Não autenticado" }
  }

  const { data: file } = await supabase.from("documentos").select("url_arquivo, autor_id").eq("id", fileId).single()

  if (!file || file.autor_id !== user.id) {
    return { success: false, error: "Sem permissão" }
  }

  const filePath = file.url_arquivo.split("/").slice(-3).join("/")
  await supabase.storage.from("documents").remove([filePath])

  const { error } = await supabase.from("documentos").delete().eq("id", fileId)

  if (error) {
    return { success: false, error: "Erro ao eliminar ficheiro" }
  }

  revalidatePath("/profile")
  return { success: true }
}
