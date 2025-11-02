"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Flag, Send } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ReportButtonProps {
  contentId?: string
  contentType?: "file" | "comment" | "user" | "general"
  className?: string
}

export function ReportButton({ contentId, contentType = "general", className }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [reportType, setReportType] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const reportData = {
        to: "ggomes.l21@us.edu.cv",
        subject: `🚨 Nova Reclamação - ${reportType}`,
        body: `
          NOVA RECLAMAÇÃO NO AKADOX
          
          Tipo de Conteúdo: ${contentType}
          ID do Conteúdo: ${contentId || "N/A"}
          Tipo de Reclamação: ${reportType}
          
          Descrição:
          ${description}
          
          Data: ${new Date().toLocaleString("pt-PT")}
          
          ---
          Sistema AKADOX - Repositório Colaborativo Universitário de Cabo Verde
        `,
      }

      // Simular envio de email (em produção, usar API real)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "✅ Reclamação Enviada!",
        description: "Sua reclamação foi enviada para análise. Obrigado pelo feedback!",
      })

      setIsOpen(false)
      setReportType("")
      setDescription("")
    } catch (error) {
      toast({
        title: "❌ Erro ao Enviar",
        description: "Ocorreu um erro. Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`border-destructive text-destructive hover:bg-destructive hover:text-white ${className}`}
        >
          <Flag className="w-4 h-4 mr-2" />
          Relatar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-destructive" />
            Relatar Problema
          </DialogTitle>
          <DialogDescription>
            Descreva o problema encontrado. Sua reclamação será enviada para análise.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="reportType">Tipo de Problema</Label>
            <Select value={reportType} onValueChange={setReportType} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de problema" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conteudo-inapropriado">Conteúdo Inapropriado</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="violacao-direitos">Violação de Direitos Autorais</SelectItem>
                <SelectItem value="informacao-incorreta">Informação Incorreta</SelectItem>
                <SelectItem value="bug-tecnico">Bug Técnico</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Descrição do Problema</Label>
            <Textarea
              id="description"
              placeholder="Descreva detalhadamente o problema encontrado..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">
              {isSubmitting ? (
                "Enviando..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Reclamação
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
