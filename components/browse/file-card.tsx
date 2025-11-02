"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  FileText,
  ImageIcon,
  Video,
  Archive,
  Download,
  Star,
  Calendar,
  MessageCircle,
  Heart,
  Share2,
  Play,
  MoreHorizontal,
} from "lucide-react"
import Link from "next/link"
import { ShareModal } from "@/components/share-modal"
import { toggleFavorite, isFavorited } from "@/lib/actions/favorites"
import { useToast } from "@/hooks/use-toast"

interface FileCardProps {
  file: {
    id: number
    title: string
    description: string
    type: string
    subject: string
    university: string
    author: string
    uploadedAt: string
    downloads: number
    rating: number
    tags: string[]
    year?: string
    commentsCount?: number
    thumbnail_url?: string
  }
  viewMode?: "grid" | "list"
}

const getFileIcon = (type: string) => {
  switch (type) {
    case "slides":
      return ImageIcon
    case "videos":
      return Video
    case "projects":
      return Archive
    default:
      return FileText
  }
}

const getFileTypeLabel = (type: string) => {
  switch (type) {
    case "notes":
      return "Apontamentos"
    case "slides":
      return "Slides"
    case "exercises":
      return "Exercícios"
    case "exams":
      return "Exames"
    case "projects":
      return "Projetos"
    case "videos":
      return "Vídeos"
    default:
      return "Documento"
  }
}

export function FileCard({ file, viewMode = "grid" }: FileCardProps) {
  const [isFavoritedState, setIsFavoritedState] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const { toast } = useToast()
  const IconComponent = getFileIcon(file.type)

  useEffect(() => {
    async function loadFavoriteStatus() {
      const favorited = await isFavorited(file.id.toString())
      setIsFavoritedState(favorited)
    }
    loadFavoriteStatus()
  }, [file.id])

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const result = await toggleFavorite(file.id.toString())

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

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowShareModal(true)
  }

  if (viewMode === "list") {
    return (
      <>
        <Card className="netflix-card border-border bg-card hover:bg-card/80 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <div className="relative w-32 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                {file.thumbnail_url ? (
                  <img
                    src={file.thumbnail_url || "/placeholder.svg"}
                    alt={file.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <IconComponent className="w-8 h-8 text-primary" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <Link href={`/browse/${file.id}`}>
                      <h3 className="font-serif font-bold text-xl text-foreground hover:text-primary transition-colors line-clamp-2">
                        {file.title}
                      </h3>
                    </Link>
                    <p className="text-muted-foreground line-clamp-2 mt-2 text-base">{file.description}</p>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleFavorite}
                      className={`hover:bg-primary/10 ${isFavoritedState ? "text-primary" : "text-muted-foreground"}`}
                    >
                      <Heart className={`w-4 h-4 ${isFavoritedState ? "fill-current" : ""}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleShare}
                      className="hover:bg-primary/10 text-primary hover:text-primary/80"
                      title="Partilhar documento"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="hover:bg-primary/10 text-muted-foreground">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        {getFileTypeLabel(file.type)}
                      </Badge>
                      <Badge variant="outline" className="border-muted-foreground/20">
                        {file.subject}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {file.author.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{file.author}</span>
                      <span>•</span>
                      <span>{file.university}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      {file.downloads}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current text-yellow-500" />
                      {file.rating}
                    </div>
                    {file.commentsCount && (
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {file.commentsCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} file={file} />
      </>
    )
  }

  return (
    <>
      <Card className="netflix-card border-border bg-card hover:bg-card/80 transition-all duration-300 group overflow-hidden">
        <div className="relative aspect-video bg-muted overflow-hidden">
          {file.thumbnail_url ? (
            <img
              src={file.thumbnail_url || "/placeholder.svg"}
              alt={file.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <IconComponent className="w-12 h-12 text-primary" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="flex gap-2">
              <Button size="sm" className="bg-white text-black hover:bg-white/90" asChild>
                <Link href={`/browse/${file.id}`}>
                  <Play className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={handleFavorite}>
                <Heart className={`w-4 h-4 ${isFavoritedState ? "fill-current text-primary" : ""}`} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={handleShare}
                title="Partilhar documento"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-black/80 text-white border-none">
              {getFileTypeLabel(file.type)}
            </Badge>
          </div>

          <div className="absolute top-2 right-2">
            <div className="flex items-center gap-1 bg-black/80 text-white px-2 py-1 rounded text-xs">
              <Star className="w-3 h-3 fill-current text-yellow-500" />
              {file.rating}
            </div>
          </div>
        </div>

        <CardHeader className="pb-3">
          <Link href={`/browse/${file.id}`}>
            <CardTitle className="font-serif text-lg leading-tight line-clamp-2 hover:text-primary transition-colors group-hover:text-primary">
              {file.title}
            </CardTitle>
          </Link>
          <CardDescription className="text-sm line-clamp-2 mt-2">{file.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {file.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs px-2 py-0 border-muted-foreground/20">
                {tag}
              </Badge>
            ))}
            {file.tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-0 border-muted-foreground/20">
                +{file.tags.length - 3}
              </Badge>
            )}
          </div>

          {/* Author and University */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Avatar className="w-5 h-5">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">{file.author.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="truncate">{file.author}</span>
            <span>•</span>
            <span className="truncate">{file.university}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                {file.downloads}
              </div>
              {file.commentsCount && (
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  {file.commentsCount}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(file.uploadedAt).toLocaleDateString("pt-PT")}
            </div>
          </div>
        </CardContent>
      </Card>

      <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} file={file} />
    </>
  )
}
