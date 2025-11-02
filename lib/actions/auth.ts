"use server"

import { createServerClient } from "@/lib/supabase/server"
import { sendApprovalRequestEmail } from "@/lib/email"

export async function signUp(formData: {
  name: string
  email: string
  password: string
  university: string
  course?: string
  year?: string
  userType: string
}) {
  const supabase = await createServerClient()

  try {
    console.log("[v0] Registration attempt:", formData)

    let tipoUsuario = formData.userType
    if (formData.userType === "comum" || formData.userType === "pessoa_comum") {
      tipoUsuario = "pessoa_comum"
    } else if (formData.userType === "administrador_total" || formData.userType === "universidade") {
      tipoUsuario = formData.userType === "administrador_total" ? "admin" : "diretor"
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        data: {
          name: formData.name,
        },
      },
    })

    if (authError) {
      console.error("[v0] Auth error:", authError)
      return { error: authError.message }
    }

    if (!authData.user) {
      return { error: "Erro ao criar utilizador" }
    }

    let universidadeId: string | null = null

    // Only lookup/create university if user type requires it
    if (tipoUsuario !== "admin" && formData.university) {
      const { data: universityData, error: uniError } = await supabase
        .from("universidades")
        .select("id")
        .eq("nome", formData.university)
        .maybeSingle()

      if (uniError) {
        console.error("[v0] University lookup error:", uniError)
      }

      if (universityData) {
        universidadeId = universityData.id
      } else if (formData.university) {
        console.log("[v0] Creating new university:", formData.university)

        const codeMatch = formData.university.match(/$$([^)]+)$$/)
        const codigo = codeMatch ? codeMatch[1] : formData.university.substring(0, 10).toUpperCase()

        const { data: newUni, error: createError } = await supabase
          .from("universidades")
          .insert({
            nome: formData.university,
            codigo: codigo,
            ativa: true,
          })
          .select("id")
          .single()

        if (createError) {
          console.error("[v0] University creation error:", createError)
        } else if (newUni) {
          universidadeId = newUni.id
        }
      }
    }

    const { count: totalUsers } = await supabase.from("perfis_usuarios").select("*", { count: "exact", head: true })

    const isFirst1000 = (totalUsers || 0) < 1000
    const bonusPoints = isFirst1000 ? 10 : 0

    const needsApproval = formData.userType === "universidade" || formData.userType === "administrador_total"

    const { error: profileError } = await supabase.from("perfis_usuarios").insert({
      id: authData.user.id,
      email: formData.email,
      nome_completo: formData.name,
      universidade_id: universidadeId,
      tipo_usuario: tipoUsuario,
      pontos: bonusPoints,
      nivel: 1,
      aprovado: !needsApproval,
      ativo: true,
    })

    if (profileError) {
      console.error("[v0] Profile creation error:", profileError)
      try {
        await supabase.auth.signOut()
      } catch (e) {
        console.error("[v0] Cleanup error:", e)
      }
      return { error: "Erro ao criar perfil de utilizador. Por favor, contacta o suporte." }
    }

    if (isFirst1000) {
      try {
        await supabase.from("notifications").insert({
          user_id: authData.user.id,
          title: "Parabéns! 🎉",
          message: "Ganhou 10 pontos por estar entre os 1000 primeiros a se inscreverem!",
          type: "success",
          read: false,
        })
      } catch (notifError) {
        console.error("[v0] Notification creation error:", notifError)
      }
    }

    if (needsApproval) {
      try {
        await sendApprovalRequestEmail({
          userEmail: formData.email,
          userName: formData.name,
          userType: formData.userType,
          university: formData.university,
          userId: authData.user.id,
        })
      } catch (emailError) {
        console.error("[v0] Email sending error:", emailError)
      }
    }

    console.log("[v0] User registered successfully:", formData.email)

    const message = needsApproval
      ? `Conta criada com sucesso! O teu pedido foi enviado para aprovação para ggomes.l21@us.edu.cv. Receberás um email quando for aprovado.`
      : "Conta criada com sucesso! Verifica o teu email para confirmar."

    return { success: true, message, bonusPoints: isFirst1000 ? bonusPoints : 0, needsApproval }
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return { error: "Erro interno do servidor" }
  }
}

export async function resendConfirmation(email: string) {
  const supabase = await createServerClient()

  try {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    if (error) {
      console.error("[v0] Resend confirmation error:", error)
      return { error: error.message }
    }

    console.log("[v0] Confirmation email resent to:", email)
    return { success: true, message: "Email de confirmação reenviado! Verifica a tua caixa de entrada." }
  } catch (error) {
    console.error("[v0] Resend confirmation error:", error)
    return { error: "Erro ao reenviar email de confirmação" }
  }
}

export async function signIn(email: string, password: string) {
  const supabase = await createServerClient()

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("[v0] Sign in error:", error)
      if (error.message === "Email not confirmed") {
        return {
          error: "Email não confirmado",
          needsConfirmation: true,
          email: email,
        }
      }
      return { error: error.message }
    }

    // Get user profile to check user type
    const { data: profile } = await supabase
      .from("perfis_usuarios")
      .select("tipo_usuario")
      .eq("id", data.user.id)
      .single()

    console.log("[v0] User signed in successfully:", email, "Type:", profile?.tipo_usuario)
    return { success: true, userType: profile?.tipo_usuario }
  } catch (error) {
    console.error("[v0] Sign in error:", error)
    return { error: "Erro interno do servidor" }
  }
}

export async function signOut() {
  const supabase = await createServerClient()

  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("[v0] Sign out error:", error)
      return { error: error.message }
    }

    console.log("[v0] User signed out successfully")
    return { success: true }
  } catch (error) {
    console.error("[v0] Sign out error:", error)
    return { error: "Erro ao terminar sessão" }
  }
}

function generateApprovalToken(userId: string): string {
  return Buffer.from(`${userId}:${Date.now()}`).toString("base64")
}
