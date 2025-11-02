"use server"

import { generateApprovalToken } from "@/lib/utils/tokens"

interface ApprovalEmailData {
  userEmail: string
  userName: string
  userType: string
  university: string
  userId: string
}

interface ApprovalDecisionEmailData {
  userEmail: string
  userName: string
  approved: boolean
  userType: string
}

export async function sendApprovalRequestEmail(data: ApprovalEmailData) {
  const adminEmail = "ggomes.l21@us.edu.cv"
  const approvalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin/approve-user?userId=${data.userId}&token=${generateApprovalToken(data.userId)}`

  const userTypeLabel = data.userType === "universidade" ? "Diretor/Universidade" : "Administrador Total"

  const subject = `Novo pedido de aprovação - ${userTypeLabel}`
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0891b2;">Novo Pedido de Aprovação - AKADOX</h2>
      
      <p>Olá,</p>
      
      <p>Um novo utilizador solicitou aprovação para acesso especial ao Repositório Universitário AKADOX:</p>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Nome:</strong> ${data.userName}</p>
        <p><strong>Email:</strong> ${data.userEmail}</p>
        <p><strong>Tipo:</strong> ${userTypeLabel}</p>
        <p><strong>Universidade:</strong> ${data.university}</p>
      </div>
      
      <p>Para aprovar ou recusar este pedido, clique no botão abaixo:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${approvalUrl}" 
           style="background-color: #0891b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Gerir Aprovação
        </a>
      </div>
      
      <p>Ou acede diretamente ao painel de administração em:</p>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin">${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin</a></p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
      
      <p style="color: #64748b; font-size: 14px;">
        Cumprimentos,<br>
        Sistema AKADOX - Repositório Universitário de Cabo Verde
      </p>
    </div>
  `

  try {
    console.log(`[v0] Approval email would be sent to ${adminEmail}:`)
    console.log(`Subject: ${subject}`)
    console.log(`Approval URL: ${approvalUrl}`)
    console.log(`User: ${data.userName} (${data.userEmail})`)
    console.log(`Type: ${userTypeLabel}`)

    return { success: true }
  } catch (error) {
    console.error("[v0] Email sending error:", error)
    throw new Error("Falha ao enviar email de aprovação")
  }
}

export async function sendApprovalDecisionEmail(data: ApprovalDecisionEmailData) {
  const subject = data.approved
    ? "Conta aprovada - AKADOX Repositório Universitário"
    : "Pedido de conta recusado - AKADOX Repositório Universitário"

  const userTypeLabel = data.userType === "universidade" ? "Diretor/Universidade" : "Administrador Total"

  const htmlBody = data.approved
    ? `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">Conta Aprovada!</h2>
      
      <p>Olá ${data.userName},</p>
      
      <p>A tua conta como <strong>${userTypeLabel}</strong> foi aprovada com sucesso no AKADOX!</p>
      
      <p>Já podes aceder ao Repositório Universitário de Cabo Verde com todas as funcionalidades disponíveis para o teu tipo de utilizador.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/login" 
           style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Iniciar Sessão
        </a>
      </div>
      
      <p>Bem-vindo à nossa comunidade académica!</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
      
      <p style="color: #64748b; font-size: 14px;">
        Cumprimentos,<br>
        Equipa AKADOX - Repositório Universitário de Cabo Verde
      </p>
    </div>
  `
    : `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Pedido de Conta Recusado</h2>
      
      <p>Olá ${data.userName},</p>
      
      <p>Lamentamos informar que o teu pedido para uma conta como <strong>${userTypeLabel}</strong> foi recusado.</p>
      
      <p>Se acreditas que isto foi um erro ou tens questões sobre esta decisão, por favor contacta-nos através do email de suporte.</p>
      
      <p>Podes sempre registar-te como utilizador comum ou estudante se fores elegível para essas categorias.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/register" 
           style="background-color: #0891b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Registar Nova Conta
        </a>
      </div>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
      
      <p style="color: #64748b; font-size: 14px;">
        Cumprimentos,<br>
        Equipa AKADOX - Repositório Universitário de Cabo Verde
      </p>
    </div>
  `

  try {
    console.log(`[v0] Decision email would be sent to ${data.userEmail}:`)
    console.log(`Subject: ${subject}`)
    console.log(`Approved: ${data.approved}`)

    return { success: true }
  } catch (error) {
    console.error("[v0] Email sending error:", error)
    throw new Error("Falha ao enviar email de decisão")
  }
}
