"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { FileText, CheckCircle, XCircle, GraduationCap, Users, Heart, UserCheck, Award } from "lucide-react"
import {
  getProfessorStats,
  getPendingGradingDocuments,
  gradeAndApproveDocument,
  getApprovalRequests,
  moderateApprovalRequest,
  getGradingHistory,
  getFollowingFollowers,
} from "@/lib/actions/professor"
import { useToast } from "@/hooks/use-toast"
import { Logo } from "@/components/ui/logo"
import { AuthNav } from "@/components/navigation/auth-nav"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function ProfessorDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<any>(null)
  const [pendingDocs, setPendingDocs] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [followData, setFollowData] = useState<any>(null)
  const [selectedDoc, setSelectedDoc] = useState<any>(null)
  const [gradeForm, setGradeForm] = useState({ nota: 10, feedback: "", aprovado: true })
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [statsResult, docsResult, requestsResult, historyResult, followResult] = await Promise.all([
      getProfessorStats(),
      getPendingGradingDocuments(),
      getApprovalRequests(),
      getGradingHistory(),
      getFollowingFollowers(),
    ])

    if (statsResult.success) setStats(statsResult.data)
    if (docsResult.success) setPendingDocs(docsResult.data)
    if (requestsResult.success) setRequests(requestsResult.data)
    if (historyResult.success) setHistory(historyResult.data)
    if (followResult.success) setFollowData(followResult.data)
  }

  const handleOpenGradeDialog = (doc: any) => {
    setSelectedDoc(doc)
    setGradeForm({ nota: 10, feedback: "", aprovado: true })
    setIsGradeDialogOpen(true)
  }

  const handleGradeDocument = async () => {
    if (!selectedDoc) return

    if (gradeForm.nota < 0 || gradeForm.nota > 20) {
      toast({ title: "Erro", description: "A nota deve estar entre 0 e 20", variant: "destructive" })
      return
    }

    if (!gradeForm.feedback.trim()) {
      toast({ title: "Erro", description: "Por favor, forneça um feedback", variant: "destructive" })
      return
    }

    const result = await gradeAndApproveDocument({
      documentoId: selectedDoc.id,
      alunoId: selectedDoc.autor.id,
      nota: gradeForm.nota,
      feedback: gradeForm.feedback,
      aprovado: gradeForm.aprovado,
    })

    if (result.error) {
      toast({ title: "Erro", description: result.error, variant: "destructive" })
    } else {
      toast({ title: "Sucesso", description: result.message })
      setIsGradeDialogOpen(false)
      setSelectedDoc(null)
      loadData()
    }
  }

  const handleModerateRequest = async (requestId: string, approved: boolean) => {
    const result = await moderateApprovalRequest(requestId, approved)
    if (result.error) {
      toast({ title: "Erro", description: result.error, variant: "destructive" })
    } else {
      toast({ title: "Sucesso", description: result.message })
      loadData()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-6">
          <Link href="/">
            <Logo size="md" />
          </Link>
          <AuthNav />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="w-8 h-8 text-primary" />
            <h1 className="font-serif font-black text-3xl text-foreground">Dashboard do Professor</h1>
          </div>
          <p className="text-muted-foreground">Avalie trabalhos, aprove solicitações e acompanhe alunos</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="grading">Avaliar</TabsTrigger>
            <TabsTrigger value="requests">Solicitações</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="following">Seguindo</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                  <FileText className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.pendingGrades || 0}</div>
                  <p className="text-xs text-muted-foreground">Documentos para avaliar</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Avaliações</CardTitle>
                  <Award className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalGrades || 0}</div>
                  <p className="text-xs text-muted-foreground">Total realizadas</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Solicitações</CardTitle>
                  <Users className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.approvalRequests || 0}</div>
                  <p className="text-xs text-muted-foreground">Pedidos pendentes</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Meus Documentos</CardTitle>
                  <FileText className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.myDocuments || 0}</div>
                  <p className="text-xs text-muted-foreground">Partilhados</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="grading" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Documentos Pendentes de Avaliação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingDocs.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Nenhum documento pendente</p>
                  ) : (
                    pendingDocs.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold">{doc.titulo}</h3>
                          <p className="text-sm text-muted-foreground">
                            Por: {doc.autor?.nome_completo} • {doc.tipo_documento}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary">Pendente</Badge>
                            {doc.disciplina && <Badge variant="outline">{doc.disciplina}</Badge>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/browse/${doc.id}`}>Ver</Link>
                          </Button>
                          <Button size="sm" onClick={() => handleOpenGradeDialog(doc)}>
                            Avaliar
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Solicitações de Aprovação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requests.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Nenhuma solicitação pendente</p>
                  ) : (
                    requests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={request.solicitante?.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback>{request.solicitante?.nome_completo?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{request.solicitante?.nome_completo}</h3>
                            <p className="text-sm text-muted-foreground">{request.solicitante?.email}</p>
                            {request.documento && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Documento: {request.documento.titulo}
                              </p>
                            )}
                            {request.tag_usada && (
                              <Badge variant="outline" className="mt-1">
                                Tag: {request.tag_usada}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="default" onClick={() => handleModerateRequest(request.id, true)}>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleModerateRequest(request.id, false)}>
                            <XCircle className="w-4 h-4 mr-1" />
                            Recusar
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Avaliações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {history.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Nenhuma avaliação realizada</p>
                  ) : (
                    history.map((grade) => (
                      <div key={grade.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={grade.aluno?.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback>{grade.aluno?.nome_completo?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold">{grade.documento?.titulo}</h3>
                            <p className="text-sm text-muted-foreground">Aluno: {grade.aluno?.nome_completo}</p>
                            <p className="text-sm text-muted-foreground mt-1">{grade.comentario_privado}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{grade.nota}/20</div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(grade.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="following" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5" />
                    Seguindo ({followData?.following?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {followData?.following?.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">Não está a seguir ninguém</p>
                    ) : (
                      followData?.following?.map((item: any) => (
                        <div key={item.seguindo.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <Avatar>
                            <AvatarImage src={item.seguindo.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback>{item.seguindo.nome_completo?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{item.seguindo.nome_completo}</h4>
                            <Badge variant="outline" className="text-xs">
                              {item.seguindo.tipo_usuario}
                            </Badge>
                          </div>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/profile/${item.seguindo.id}`}>Ver Perfil</Link>
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Seguidores ({followData?.followers?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {followData?.followers?.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">Sem seguidores</p>
                    ) : (
                      followData?.followers?.map((item: any) => (
                        <div key={item.seguidor.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <Avatar>
                            <AvatarImage src={item.seguidor.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback>{item.seguidor.nome_completo?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{item.seguidor.nome_completo}</h4>
                            <Badge variant="outline" className="text-xs">
                              {item.seguidor.tipo_usuario}
                            </Badge>
                          </div>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/profile/${item.seguidor.id}`}>Ver Perfil</Link>
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Grade Dialog */}
      <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Avaliar Documento</DialogTitle>
            <DialogDescription>
              {selectedDoc?.titulo} - {selectedDoc?.autor?.nome_completo}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nota">Nota (0-20)</Label>
              <Input
                id="nota"
                type="number"
                min="0"
                max="20"
                step="0.5"
                value={gradeForm.nota}
                onChange={(e) => setGradeForm({ ...gradeForm, nota: Number.parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea
                id="feedback"
                rows={5}
                placeholder="Forneça feedback detalhado sobre o trabalho..."
                value={gradeForm.feedback}
                onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-4">
              <Label>Status:</Label>
              <div className="flex gap-2">
                <Button
                  variant={gradeForm.aprovado ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGradeForm({ ...gradeForm, aprovado: true })}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Aprovar
                </Button>
                <Button
                  variant={!gradeForm.aprovado ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => setGradeForm({ ...gradeForm, aprovado: false })}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Rejeitar
                </Button>
              </div>
            </div>
            <Button onClick={handleGradeDocument} className="w-full">
              Submeter Avaliação
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
