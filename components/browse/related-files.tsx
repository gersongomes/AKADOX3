"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, Star } from "lucide-react"
import Link from "next/link"
import { getDocuments } from "@/lib/actions/documents"

interface RelatedFilesProps {
  fileId: string
}

export function RelatedFiles({ fileId }: RelatedFilesProps) {
  const [relatedFiles, setRelatedFiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadRelatedFiles() {
      setIsLoading(true)
      const documents = await getDocuments({ limit: 5 })
      // Filter out the current document
      const filtered = documents.filter((doc) => doc.id.toString() !== fileId)
      setRelatedFiles(filtered.slice(0, 3))
      setIsLoading(false)
    }
    loadRelatedFiles()
  }, [fileId])

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground text-sm">A carregar recursos relacionados...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Recursos Relacionados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {relatedFiles.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum recurso relacionado encontrado.</p>
          ) : (
            relatedFiles.map((file) => (
              <div key={file.id} className="p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/browse/${file.id}`}>
                      <h4 className="font-medium text-sm text-foreground hover:text-primary transition-colors line-clamp-2">
                        {file.titulo}
                      </h4>
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {file.categoria}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>por {file.perfis_usuarios?.nome_completo || "Anónimo"}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current text-yellow-500" />
                          {file.avaliacao_media || 0}
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {file.downloads || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Sugestões para Ti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/20">
              <h4 className="font-medium text-foreground mb-1">Explora mais recursos</h4>
              <p className="text-muted-foreground text-xs">Encontra mais materiais académicos</p>
              <Button variant="outline" size="sm" className="mt-2 w-full bg-transparent" asChild>
                <Link href="/browse">Ver Recursos</Link>
              </Button>
            </div>

            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <h4 className="font-medium text-foreground mb-1">Partilha os teus recursos</h4>
              <p className="text-muted-foreground text-xs">Ajuda a comunidade académica</p>
              <Button variant="outline" size="sm" className="mt-2 w-full bg-transparent" asChild>
                <Link href="/upload">Carregar Ficheiro</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
