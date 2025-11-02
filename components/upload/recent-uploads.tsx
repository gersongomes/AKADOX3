"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, ImageIcon, Video, Clock, Eye } from "lucide-react"
import { getRecentUploads } from "@/lib/actions/files"
import { getSupabaseClient } from "@/lib/supabase/client"

const getFileIcon = (type: string) => {
  switch (type) {
    case "slides":
      return ImageIcon
    case "videos":
      return Video
    default:
      return FileText
  }
}

export function RecentUploads() {
  const [recentFiles, setRecentFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadRecentUploads() {
      const supabase = getSupabaseClient()
      if (!supabase) {
        setLoading(false)
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const uploads = await getRecentUploads(user.id)
        setRecentFiles(uploads)
      }

      setLoading(false)
    }

    loadRecentUploads()
  }, [])

  if (loading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Carregamentos Recentes</CardTitle>
          <CardDescription>A carregar...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="font-serif text-lg">Carregamentos Recentes</CardTitle>
        <CardDescription>Os teus últimos recursos partilhados</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentFiles.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Ainda não carregaste nenhum ficheiro</p>
        ) : (
          recentFiles.map((file) => {
            const IconComponent = getFileIcon(file.tipo_arquivo)
            return (
              <div
                key={file.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <IconComponent className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-foreground truncate">{file.titulo}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {file.categoria}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(file.created_at).toLocaleDateString("pt-PT")}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {file.visualizacoes}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
