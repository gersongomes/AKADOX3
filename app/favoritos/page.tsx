"use client"

import { useState, useEffect } from "react"
import { Heart, Download, Eye, Calendar, BookOpen, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { getFavorites, toggleFavorite } from "@/lib/actions/favorites"
import { downloadFile } from "@/lib/actions/files"

export default function FavoritosPage() {
  const { toast } = useToast()
  const [favoriteFiles, setFavoriteFiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadFavorites() {
      setIsLoading(true)
      const favorites = await getFavorites()
      setFavoriteFiles(favorites)
      setIsLoading(false)
    }
    loadFavorites()
  }, [])

  const removeFromFavorites = async (fileId: string) => {
    const result = await toggleFavorite(fileId)

    if (result.success) {
      setFavoriteFiles((prev) => prev.filter((fav) => fav.documentos.id !== fileId))
      toast({
        title: "Removido dos favoritos",
        description: "O documento foi removido da sua lista de favoritos.",
      })
    } else {
      toast({
        title: "Erro",
        description: result.error || "Não foi possível remover dos favoritos.",
        variant: "destructive",
      })
    }
  }

  const handleDownload = async (fileId: string, title: string) => {
    toast({
      title: "A preparar download",
      description: `A preparar "${title}"...`,
    })

    const result = await downloadFile(fileId)

    if (result.success && result.url) {
      if (typeof window !== "undefined") {
        const link = window.document.createElement("a")
        link.href = result.url
        link.download = result.filename || title
        link.target = "_blank"
        window.document.body.appendChild(link)
        link.click()
        window.document.body.removeChild(link)
      }

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
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Link>
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" asChild>
                <Link href="/browse">Explorar</Link>
              </Button>
              <Button asChild>
                <Link href="/profile">Perfil</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            Os Meus Favoritos
          </h1>
          <p className="text-muted-foreground">Documentos que guardaste para consulta posterior</p>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">A carregar favoritos...</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {favoriteFiles.map((favorite) => {
              const doc = favorite.documentos
              return (
                <Card
                  key={favorite.id}
                  className="bg-card border-border hover:border-primary/50 transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <BookOpen className="w-5 h-5 text-primary" />
                          <Link
                            href={`/browse/${doc.id}`}
                            className="text-xl font-semibold text-foreground hover:text-primary transition-colors"
                          >
                            {doc.titulo}
                          </Link>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <span className="text-muted-foreground text-sm">Autor:</span>
                            <p className="text-foreground font-medium">
                              {doc.perfis_usuarios?.nome_completo || "Desconhecido"}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-sm">Universidade:</span>
                            <p className="text-primary font-medium">{doc.universidades?.nome || "N/A"}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-sm">Categoria:</span>
                            <p className="text-secondary font-medium">{doc.categoria || "Geral"}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-sm">Tipo:</span>
                            <p className="text-accent font-medium">{doc.tipo_arquivo || "PDF"}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            <span>{doc.downloads || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{doc.visualizacoes || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Adicionado em {new Date(favorite.created_at).toLocaleDateString("pt-PT")}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                          onClick={() => removeFromFavorites(doc.id)}
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                          onClick={() => handleDownload(doc.id, doc.titulo)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {!isLoading && favoriteFiles.length === 0 && (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">Nenhum favorito ainda</h3>
            <p className="text-muted-foreground">
              Comece a adicionar documentos aos seus favoritos para os encontrar facilmente aqui.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
