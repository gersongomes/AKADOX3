"use client"

import { useState } from "react"
import { Share2, Link2, Mail, MessageCircle, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  file: {
    id: number | string
    title: string
    [key: string]: any
  }
}

export function ShareModal({ isOpen, onClose, file }: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  const fileUrl = `https://akadox.netlify.app/browse/${file.id}`
  const fileTitle = file.title || "Documento AKADOX"

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fileUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Erro ao copiar link:", err)
    }
  }

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Documento: ${fileTitle}`)
    const body = encodeURIComponent(
      `Olá! Encontrei este documento interessante e queria partilhar contigo: ${fileTitle}\n\nPodes aceder aqui: ${fileUrl}`,
    )
    if (typeof window !== "undefined") {
      window.open(`mailto:?subject=${subject}&body=${body}`)
    }
  }

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Documento: ${fileTitle}\n${fileUrl}`)
    if (typeof window !== "undefined") {
      window.open(`https://wa.me/?text=${text}`)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Share2 className="w-5 h-5 text-primary" />
            Partilhar Documento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <p className="text-muted-foreground text-sm mb-2">Documento:</p>
            <p className="text-foreground font-medium">{fileTitle}</p>
          </div>

          <div>
            <p className="text-muted-foreground text-sm mb-2">Link do documento:</p>
            <div className="flex gap-2">
              <Input
                value={fileUrl}
                readOnly
                className="bg-secondary border-border text-blue-600 flex-1 font-mono text-sm"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="sm"
                className="border-border hover:bg-secondary bg-transparent"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-muted-foreground text-sm">Partilhar via:</p>

            <Button
              onClick={handleEmailShare}
              variant="outline"
              className="w-full justify-start gap-3 border-border hover:bg-secondary bg-transparent"
            >
              <Mail className="w-5 h-5 text-blue-500" />
              Email
            </Button>

            <Button
              onClick={handleWhatsAppShare}
              variant="outline"
              className="w-full justify-start gap-3 border-border hover:bg-secondary bg-transparent"
            >
              <MessageCircle className="w-5 h-5 text-green-500" />
              WhatsApp
            </Button>

            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="w-full justify-start gap-3 border-border hover:bg-secondary bg-transparent"
            >
              <Link2 className="w-5 h-5 text-purple-500" />
              Copiar Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ShareModal
