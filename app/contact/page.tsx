"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { sendContactMessage } from "@/lib/actions/contact"
import { useToast } from "@/hooks/use-toast"

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      message: formData.get("message") as string,
    }

    const result = await sendContactMessage(data)

    if (result.success) {
      toast({
        title: "Mensagem enviada!",
        description: "Entraremos em contacto em breve.",
      })
      ;(e.target as HTMLFormElement).reset()
    } else {
      toast({
        title: "Erro",
        description: result.error || "Erro ao enviar mensagem",
        variant: "destructive",
      })
    }

    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Link>
            </Button>
            <Link href="/" className="transition-opacity hover:opacity-80">
              <Logo size="sm" />
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif font-black text-4xl text-foreground mb-6">Contacto</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Entra em contacto connosco para qualquer questão ou sugestão.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="akadox-card p-6">
              <h3 className="font-serif font-bold text-xl mb-4">Informações de Contacto</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground">Nome:</h4>
                  <p className="text-muted-foreground">Gerson Da Luz Gomes</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Telefone:</h4>
                  <p className="text-muted-foreground">+238 599 0941</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Email:</h4>
                  <p className="text-muted-foreground">ggomes.l21@us.edu.cv</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Morada:</h4>
                  <p className="text-muted-foreground">Sal, Santa Maria, Cabo Verde</p>
                </div>
              </div>
            </div>

            <div className="akadox-card p-6">
              <h3 className="font-serif font-bold text-xl mb-4">Enviar Mensagem</h3>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Nome</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full p-3 bg-secondary/20 border border-secondary/30 rounded-lg text-foreground"
                    placeholder="O teu nome"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full p-3 bg-secondary/20 border border-secondary/30 rounded-lg text-foreground"
                    placeholder="O teu email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Mensagem</label>
                  <textarea
                    name="message"
                    rows={4}
                    required
                    className="w-full p-3 bg-secondary/20 border border-secondary/30 rounded-lg text-foreground"
                    placeholder="A tua mensagem"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? "A enviar..." : "Enviar Mensagem"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
