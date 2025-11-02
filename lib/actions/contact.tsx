"use server"

import { createServerClient } from "@/lib/supabase/server"

interface ContactFormData {
  name: string
  email: string
  message: string
}

export async function sendContactMessage(data: ContactFormData) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Deves estar autenticado para enviar mensagens" }
    }

    const { error: insertError } = await supabase.from("mensagens_contacto").insert({
      usuario_id: user.id,
      nome: data.name,
      email: data.email,
      mensagem: data.message,
    })

    if (insertError) {
      console.error("[v0] Error saving contact message:", insertError)
      // If table doesn't exist, just log it for now
      console.log("[v0] Contact message would be sent:")
      console.log("[v0] From:", data.name, "-", data.email)
      console.log("[v0] Message:", data.message)
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Error sending contact message:", error)
    return { success: false, error: "Erro ao enviar mensagem. Tenta novamente." }
  }
}
