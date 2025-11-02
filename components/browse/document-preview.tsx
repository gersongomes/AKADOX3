"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Eye, FileText, ImageIcon, Video } from "lucide-react"

interface DocumentPreviewProps {
  documentUrl: string
  documentTitle: string
  documentType: string
}

export function DocumentPreview({ documentUrl, documentTitle, documentType }: DocumentPreviewProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState("")

  const handlePreview = () => {
    if (!documentUrl) {
      setError("URL do documento não disponível")
      return
    }
    // Open in new tab
    window.open(documentUrl, "_blank", "noopener,noreferrer")
  }

  const getPreviewIcon = () => {
    const fileExt = documentType.toLowerCase()
    if (fileExt === "pdf") return FileText
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(fileExt)) return ImageIcon
    if (["mp4", "webm", "ogg"].includes(fileExt)) return Video
    return Eye
  }

  const PreviewIcon = getPreviewIcon()

  const renderPreview = () => {
    const fileExt = documentType.toLowerCase()

    if (fileExt === "pdf") {
      return <iframe src={documentUrl} className="w-full h-full" title={documentTitle} />
    }

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(fileExt)) {
      return (
        <img src={documentUrl || "/placeholder.svg"} alt={documentTitle} className="w-full h-full object-contain" />
      )
    }

    if (["mp4", "webm", "ogg"].includes(fileExt)) {
      return (
        <video src={documentUrl} controls className="w-full h-full">
          O teu navegador não suporta vídeo.
        </video>
      )
    }

    // For other file types, show a message
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <FileText className="w-16 h-16 text-muted-foreground mb-4" />
        <p className="text-lg font-medium mb-2">Pré-visualização não disponível</p>
        <p className="text-muted-foreground mb-4">Este tipo de ficheiro não pode ser pré-visualizado no navegador.</p>
        <Button asChild>
          <a href={documentUrl} download target="_blank" rel="noopener noreferrer">
            Descarregar Ficheiro
          </a>
        </Button>
      </div>
    )
  }

  return (
    <Button variant="outline" size="lg" onClick={handlePreview}>
      <PreviewIcon className="w-5 h-5 mr-2" />
      Pré-visualizar
    </Button>
  )
}
