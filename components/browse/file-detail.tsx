"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { FileText, Download, Star, Eye, Calendar, Building, BookOpen, Heart, Share2, UserPlus } from "lucide-react"
import { RatingSection } from "./rating-section"
import { CommentsSection } from "./comments-section"
import { DocumentPreview } from "./document-preview"
import { toggleFavorite, isFavorited } from "@/lib/actions/favorites"
import { downloadFile } from "@/lib/actions/files"
import { getDocumentById } from "@/lib/actions/documents"
import { toggleFollow, isFollowing as checkFollowing } from "@/lib/actions/follow"
import { getAverageRating } from "@/lib/actions/ratings"
import Link from "next/link"
import { RatingBreakdown } from "./rating-breakdown"

interface FileDetailProps {
  fileId: string
}

export function FileDetail({ fileId }: FileDetailProps) {
  const { toast } = useToast()
  const [isFavoritedState, setIsFavoritedState] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [document, setDocument] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [ratingData, setRatingData] = useState({ average: 0, count: 0 })

  useEffect(() => {
    async function loadDocument() {
      setIsLoading(true)
      const doc = await getDocumentById(fileId)
      setDocument(doc)
      setIsLoading(false)

      if (doc?.perfis_usuarios?.id) {
        const following = await checkFollowing(doc.perfis_usuarios.id)
        setIsFollowing(following)
      }

      const ratings = await getAverageRating(fileId)
      setRatingData(ratings)
    }
    loadDocument()
  }, [fileId])

  useEffect(() => {
    async function loadFavoriteStatus() {
      const favorited = await isFavorited(fileId)
      setIsFavoritedState(favorited)
    }
    loadFavoriteStatus()
  }, [fileId])

  const handleDownload = async () => {
    if (!document) return

    setIsDownloading(true)
    toast({
      title: "A preparar download",
      description: `A preparar "${document.titulo}"...`,
    })

    const result = await downloadFile(fileId)

    if (result.success && result.url) {
      const link = window.document.createElement("a")
      link.href = result.url
      link.download = result.filename || document.titulo
      link.target = "_blank"
      window.document.body.appendChild(link)
      link.click()
      window.document.body.removeChild(link)

      toast({
        title: "Download iniciado",
        description: "O ficheiro está a ser descarregado.",
      })
    } else {
      toast({
        title: "Erro no download",
        description: result.error || "Não foi possível descarregar o ficheiro.",
        variant: "destructive",
      })
    }

    setIsDownloading(false)
  }

  const handleFavorite = async () => {
    const result = await toggleFavorite(fileId)

    if (result.success) {
      setIsFavoritedState(result.favorited || false)
      toast({
        title: result.favorited ? "Adicionado aos favoritos" : "Removido dos favoritos",
        description: result.favorited
          ? "O documento foi adicionado aos seus favoritos."
          : "O documento foi removido dos seus favoritos.",
      })
    } else {
      toast({
        title: "Erro",
        description: result.error || "Não foi possível atualizar os favoritos.",
        variant: "destructive",
      })
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast({
      title: "Link copiado",
      description: "O link foi copiado para a área de transferência.",
    })
  }

  const handleFollow = async () => {
    if (!document?.perfis_usuarios?.id) return

    const result = await toggleFollow(document.perfis_usuarios.id)
    if (result.success) {
      setIsFollowing(result.following || false)
      toast({
        title: result.following ? "A seguir" : "Deixou de seguir",
        description: result.following
          ? `Agora está a seguir ${document.perfis_usuarios.nome_completo}.`
          : `Deixou de seguir ${document.perfis_usuarios.nome_completo}.`,
      })
    } else {
      toast({
        title: "Erro",
        description: result.error || "Não foi possível atualizar.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">A carregar documento...</p>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Documento não encontrado.</p>
      </div>
    )
  }

  const getFileTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      notes: "Apontamentos",
      slides: "Slides",
      exercises: "Exercícios",
      exams: "Exames",
      projects: "Projetos",
      videos: "Vídeos",
    }
    return labels[type] || "Documento"
  }

  return (
    <div className="space-y-6">
      {/* Main File Info */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="font-serif font-black text-2xl text-foreground mb-2">{document.titulo}</CardTitle>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="secondary">{getFileTypeLabel(document.tipo_arquivo)}</Badge>
                <Badge variant="outline">{document.categoria}</Badge>
                {document.ano_publicacao && <Badge variant="outline">{document.ano_publicacao}</Badge>}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  {document.downloads || 0} downloads
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {document.visualizacoes || 0} visualizações
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current text-yellow-500" />
                  {ratingData.average.toFixed(1)} ({ratingData.count} avaliação{ratingData.count !== 1 ? "ões" : ""})
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <CardDescription className="text-base leading-relaxed">{document.descricao}</CardDescription>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <DocumentPreview
              documentUrl={document.url_arquivo}
              documentTitle={document.titulo}
              documentType={document.tipo_arquivo}
            />
            <Button size="lg" className="flex-1 min-w-40" onClick={handleDownload} disabled={isDownloading}>
              <Download className="w-5 h-5 mr-2" />
              {isDownloading ? "A descarregar..." : `Descarregar (${document.tipo_arquivo.toUpperCase()})`}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleFavorite}
              className={isFavoritedState ? "border-red-500 text-red-500" : ""}
            >
              <Heart className={`w-5 h-5 mr-2 ${isFavoritedState ? "fill-current" : ""}`} />
              {isFavoritedState ? "Favoritado" : "Favoritar"}
            </Button>
            <Button variant="outline" size="lg" onClick={handleShare}>
              <Share2 className="w-5 h-5 mr-2" />
              Partilhar
            </Button>
          </div>

          {/* Tags */}
          {document.tags && document.tags.length > 0 && (
            <div>
              <h4 className="font-medium text-foreground mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {document.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Author Info */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Autor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              {document.perfis_usuarios?.avatar_url && (
                <AvatarImage
                  src={document.perfis_usuarios.avatar_url || "/placeholder.svg"}
                  alt={document.perfis_usuarios.nome_completo}
                />
              )}
              <AvatarFallback className="text-lg font-bold">
                {document.perfis_usuarios?.nome_completo?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-medium text-foreground">{document.perfis_usuarios?.nome_completo || "Anónimo"}</h4>
              {document.universidades && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building className="w-3 h-3" />
                  {document.universidades.nome}
                </div>
              )}
              {document.cursos && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="w-3 h-3" />
                  {document.cursos.nome}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {document.perfis_usuarios?.id && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFollow}
                  className={isFollowing ? "border-primary text-primary" : ""}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {isFollowing ? "A seguir" : "Seguir"}
                </Button>
              )}
              {document.perfis_usuarios?.id && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/profile/${document.perfis_usuarios.id}`}>Ver Perfil</Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Details */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Detalhes do Ficheiro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-3">
              {document.universidades && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Universidade:</span>
                  <span className="font-medium text-foreground">{document.universidades.nome}</span>
                </div>
              )}
              {document.cursos && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Curso:</span>
                  <span className="font-medium text-foreground">{document.cursos.nome}</span>
                </div>
              )}
              {document.disciplinas && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Disciplina:</span>
                  <span className="font-medium text-foreground">{document.disciplinas.nome}</span>
                </div>
              )}
              {document.ano_publicacao && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ano Académico:</span>
                  <span className="font-medium text-foreground">{document.ano_publicacao}</span>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Formato:</span>
                <span className="font-medium text-foreground">{document.tipo_arquivo.toUpperCase()}</span>
              </div>
              {document.tamanho_arquivo && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tamanho:</span>
                  <span className="font-medium text-foreground">
                    {(document.tamanho_arquivo / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              )}
              {document.numero_paginas && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Páginas:</span>
                  <span className="font-medium text-foreground">{document.numero_paginas}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Idioma:</span>
                <span className="font-medium text-foreground">Português</span>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            Carregado em{" "}
            {new Date(document.created_at).toLocaleDateString("pt-PT", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </CardContent>
      </Card>

      {/* Rating Breakdown Dashboard */}
      <RatingBreakdown fileId={fileId} />

      {/* Rating Section */}
      <RatingSection fileId={fileId} currentRating={ratingData.average} ratingCount={ratingData.count} />

      {/* Comments Section */}
      <CommentsSection fileId={fileId} />
    </div>
  )
}
