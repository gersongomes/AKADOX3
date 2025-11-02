"use client"

import { useState, useEffect } from "react"
import { FileCard } from "./file-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import { getDocuments } from "@/lib/actions/documents"

interface FileGridProps {
  searchQuery: string
  activeFilters: string[]
  viewMode?: "grid" | "list"
}

export function FileGrid({ searchQuery, activeFilters, viewMode = "grid" }: FileGridProps) {
  const [sortBy, setSortBy] = useState("recent")
  const [files, setFiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [minRating, setMinRating] = useState(0)

  useEffect(() => {
    async function loadDocuments() {
      console.log("[v0] Loading documents with searchQuery:", searchQuery, "activeFilters:", activeFilters)
      setIsLoading(true)

      const ratingFilter = activeFilters.find((f) => f.startsWith("rating:"))
      const extractedMinRating = ratingFilter ? Number.parseFloat(ratingFilter.split(":")[1]) : 0
      setMinRating(extractedMinRating)

      const documents = await getDocuments({
        searchQuery: searchQuery || undefined,
        minRating: extractedMinRating,
        limit: 50,
      })
      console.log("[v0] Loaded documents:", documents.length)
      setFiles(documents)
      setIsLoading(false)
    }
    loadDocuments()
  }, [searchQuery, activeFilters])

  const filteredFiles = files.filter((file) => {
    const nonRatingFilters = activeFilters.filter((f) => !f.startsWith("rating:"))
    if (nonRatingFilters.length === 0) return true

    return nonRatingFilters.some((filter) => {
      return (
        file.categoria?.includes(filter) ||
        file.universidades?.nome?.includes(filter) ||
        file.tipo_arquivo?.toLowerCase() === filter.toLowerCase()
      )
    })
  })

  // Sort files
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return (b.downloads || 0) - (a.downloads || 0)
      case "rating":
        return (b.averageRating || 0) - (a.averageRating || 0)
      case "views":
        return (b.visualizacoes || 0) - (a.visualizacoes || 0)
      case "title":
        return a.titulo.localeCompare(b.titulo)
      case "recent":
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">A carregar documentos...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-serif font-bold text-foreground">
            {searchQuery ? `Resultados para "${searchQuery}"` : "Todos os Recursos"}
          </h2>
          <p className="text-muted-foreground">
            <span className="text-primary font-semibold">{sortedFiles.length}</span> recursos encontrados
            {activeFilters.length > 0 && (
              <span className="ml-2">
                • {activeFilters.filter((f) => !f.startsWith("rating:")).length} filtros ativos
              </span>
            )}
            {minRating > 0 && <span className="ml-2">• Avaliação mínima: {minRating.toFixed(1)} ⭐</span>}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48 bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">📅 Mais recentes</SelectItem>
              <SelectItem value="popular">🔥 Mais populares</SelectItem>
              <SelectItem value="rating">⭐ Melhor avaliados</SelectItem>
              <SelectItem value="views">👁️ Mais visualizados</SelectItem>
              <SelectItem value="title">🔤 Título (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {sortedFiles.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <Filter className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-foreground mb-2">Nenhum recurso encontrado</h3>
          <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">
            Tenta ajustar os filtros ou usar termos de pesquisa diferentes para encontrar o que procuras.
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Limpar filtros
          </Button>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"
          }
        >
          {sortedFiles.map((file) => (
            <FileCard
              key={file.id}
              file={{
                id: file.id,
                title: file.titulo,
                description: file.descricao,
                type: file.tipo_arquivo,
                subject: file.categoria,
                university: file.universidades?.nome || "Universidade não especificada",
                author: file.perfis_usuarios?.nome_completo || "Anónimo",
                uploadedAt: file.created_at,
                downloads: file.downloads || 0,
                rating: file.averageRating || 0,
                tags: file.tags || [],
                year: file.ano_publicacao?.toString() || new Date().getFullYear().toString(),
                commentsCount: file.total_comentarios || 0,
                thumbnail: file.thumbnail_url || "/academic-document.jpg",
              }}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  )
}
