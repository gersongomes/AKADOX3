"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, AlertTriangle, CheckCircle, X, Trash2 } from "lucide-react"
import { getAllDocuments, moderateDocument, deleteDocument } from "@/lib/actions/admin"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Document {
  id: string
  titulo: string
  descricao: string
  tipo_arquivo: string
  tamanho_arquivo: number
  aprovado: boolean
  created_at: string
  autor_id: any
  universidade_id: any
}

export function ContentModeration() {
  const [pendingDocs, setPendingDocs] = useState<Document[]>([])
  const [allDocs, setAllDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [processingDoc, setProcessingDoc] = useState<string | null>(null)

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const [pendingResult, allResult] = await Promise.all([getAllDocuments({ aprovado: false }), getAllDocuments()])

      if (pendingResult.error) {
        setError(pendingResult.error)
      } else {
        setPendingDocs(pendingResult.data || [])
      }

      if (allResult.error) {
        setError(allResult.error)
      } else {
        setAllDocs(allResult.data || [])
      }
    } catch (err) {
      setError("Erro ao carregar documentos")
    } finally {
      setLoading(false)
    }
  }

  const handleModerate = async (docId: string, approved: boolean) => {
    try {
      setProcessingDoc(docId)
      const result = await moderateDocument(docId, approved)

      if (result.error) {
        setError(result.error)
      } else {
        await loadDocuments()
        setError("")
      }
    } catch (err) {
      setError("Erro ao moderar documento")
    } finally {
      setProcessingDoc(null)
    }
  }

  const handleDelete = async (docId: string) => {
    if (!confirm("Tem certeza que deseja eliminar este documento? Esta ação não pode ser desfeita.")) {
      return
    }

    try {
      setProcessingDoc(docId)
      const result = await deleteDocument(docId)

      if (result.error) {
        setError(result.error)
      } else {
        await loadDocuments()
        setError("")
      }
    } catch (err) {
      setError("Erro ao eliminar documento")
    } finally {
      setProcessingDoc(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="pending" className="space-y-6">
      <TabsList>
        <TabsTrigger value="pending">
          Pendentes {pendingDocs.length > 0 && <Badge className="ml-2">{pendingDocs.length}</Badge>}
        </TabsTrigger>
        <TabsTrigger value="all">Todos os Documentos</TabsTrigger>
      </TabsList>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <TabsContent value="pending">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Documentos Aguardando Aprovação
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingDocs.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-slate-600">Não há documentos pendentes</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{doc.titulo}</h3>
                      <p className="text-sm text-slate-600 mt-1">{doc.descricao}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                        <span>Por: {doc.autor_id?.nome_completo || "Desconhecido"}</span>
                        <span>•</span>
                        <span>{doc.universidade_id?.nome || "N/A"}</span>
                        <span>•</span>
                        <span>{formatFileSize(doc.tamanho_arquivo || 0)}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Carregado em {new Date(doc.created_at).toLocaleDateString("pt-PT")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{doc.tipo_arquivo}</Badge>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleModerate(doc.id, false)}
                        disabled={processingDoc === doc.id}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Rejeitar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleModerate(doc.id, true)}
                        disabled={processingDoc === doc.id}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Aprovar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="all">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Todos os Documentos
              </div>
              <Button onClick={loadDocuments} variant="outline" size="sm">
                Atualizar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{doc.titulo}</h3>
                      <Badge variant={doc.aprovado ? "default" : "secondary"}>
                        {doc.aprovado ? "Aprovado" : "Pendente"}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{doc.descricao}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                      <span>Por: {doc.autor_id?.nome_completo || "Desconhecido"}</span>
                      <span>•</span>
                      <span>{formatFileSize(doc.tamanho_arquivo || 0)}</span>
                      <span>•</span>
                      <span>{new Date(doc.created_at).toLocaleDateString("pt-PT")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(doc.id)}
                      disabled={processingDoc === doc.id}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
