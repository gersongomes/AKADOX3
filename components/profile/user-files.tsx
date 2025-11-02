"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, Star, Eye, MoreHorizontal, Trash2, Edit } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { deleteUserFile } from "@/lib/actions/profile"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface UserFilesProps {
  userId: string
  isOwnProfile: boolean
  files?: Array<{
    id: string
    title: string
    subject: string
    uploadedAt: string
    downloads: number
    rating: number
    views: number
  }>
}

export function UserFiles({ userId, isOwnProfile, files: initialFiles = [] }: UserFilesProps) {
  const [files, setFiles] = useState(initialFiles)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()

  const handleDelete = async (fileId: string) => {
    setDeletingId(fileId)
    try {
      const result = await deleteUserFile(fileId)
      if (result.error) {
        toast({
          title: "Erro",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Sucesso",
          description: result.message || "Ficheiro eliminado com sucesso",
        })
        setFiles(files.filter((f) => f.id !== fileId))
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao eliminar ficheiro",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif font-bold text-xl text-foreground">Meus Recursos</h3>
        {files.length > 3 && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/browse?author=${userId}`}>Ver Todos</Link>
          </Button>
        )}
      </div>

      {files.length === 0 ? (
        <Card className="border-border">
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {isOwnProfile ? "Ainda não partilhaste nenhum recurso" : "Este utilizador ainda não partilhou recursos"}
            </p>
            {isOwnProfile && (
              <Button className="mt-4" asChild>
                <Link href="/upload">Carregar Recurso</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {files.slice(0, 5).map((file) => (
            <Card key={file.id} className="border-border hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/browse/${file.id}`} className="hover:text-primary transition-colors">
                        <h4 className="font-medium text-foreground mb-1">{file.title}</h4>
                      </Link>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          {file.subject}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(file.uploadedAt).toLocaleDateString("pt-PT")}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {file.downloads}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current text-yellow-500" />
                          {file.rating.toFixed(1)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {file.views}
                        </div>
                      </div>
                    </div>
                  </div>
                  {isOwnProfile && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={deletingId === file.id}>
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/browse/${file.id}/edit`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(file.id)}
                          disabled={deletingId === file.id}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {deletingId === file.id ? "A eliminar..." : "Eliminar"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
