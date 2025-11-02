"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Heart, Download, Eye, Star } from "lucide-react"
import { getFavorites } from "@/lib/actions/favorites"
import Link from "next/link"
import Image from "next/image"

export function FavoritesList({ userId }: { userId: string }) {
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    const data = await getFavorites(userId)
    setFavorites(data)
    setLoading(false)
  }

  if (loading) {
    return <div className="text-center py-8">Carregando favoritos...</div>
  }

  if (favorites.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-xl font-semibold mb-2">Nenhum favorito</h3>
        <p className="text-muted-foreground">Você ainda não adicionou nenhum documento aos favoritos</p>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {favorites.map((fav) => {
        const doc = fav.documentos
        return (
          <Link key={fav.id} href={`/browse/${doc.id}`}>
            <Card className="overflow-hidden hover:shadow-lg transition-all cursor-pointer">
              <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20">
                {doc.thumbnail_url ? (
                  <Image src={doc.thumbnail_url || "/placeholder.svg"} alt={doc.titulo} fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-6xl opacity-20">{doc.tipo_arquivo}</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-2 line-clamp-2">{doc.titulo}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{doc.descricao}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      {doc.downloads || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {doc.visualizacoes || 0}
                    </span>
                  </div>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    {doc.avaliacao_media || 0}
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
