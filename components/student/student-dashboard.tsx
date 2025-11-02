"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { FileText, Award, Clock, CheckCircle, TrendingUp, Heart, UserCheck, Send } from "lucide-react"
import {
  getStudentStats,
  getStudentDocuments,
  getStudentGradesWithDetails,
  submitApprovalRequest,
  getStudentApprovalRequests,
  getAvailableProfessors,
  getFollowingFollowers,
} from "@/lib/actions/student"
import { useToast } from "@/hooks/use-toast"
import { Logo } from "@/components/ui/logo"
import { AuthNav } from "@/components/navigation/auth-nav"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<any>(null)
  const [documents, setDocuments] = useState<any[]>([])
  const [grades, setGrades] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [professors, setProfessors] = useState<any[]>([])
  const [followData, setFollowData] = useState<any>(null)
  const [requestForm, setRequestForm] = useState({ professorId: "", tag: "", mensagem: "" })
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [statsResult, docsResult, gradesResult, requestsResult, profsResult, followResult] = await Promise.all([
      getStudentStats(),
      getStudentDocuments(),
      getStudentGradesWithDetails(),
      getStudentApprovalRequests(),
      getAvailableProfessors(),
      getFollowingFollowers(),
    ])

    if (statsResult.success) setStats(statsResult.data)
    if (docsResult.success) setDocuments(docsResult.data)
    if (gradesResult.success) setGrades(gradesResult.data)
    if (requestsResult.success) setRequests(requestsResult.data)
    if (profsResult.success) setProfessors(profsResult.data)
    if (followResult.success) setFollowData(followResult.data)
  }

  const handleSubmitRequest = async () => {
    if (!requestForm.professorId) {
      toast({ title: "Erro", description: "Selecione um professor", variant: "destructive" })
      return
    }

    const selectedProf = professors.find((p) => p.id === requestForm.professorId)
    const result = await submitApprovalRequest({
      aprovadorId: requestForm.professorId,
      mensagem: requestForm.mensagem,
      tagUsada: selectedProf?.tag_aprovacao || requestForm.tag,
    })

    if (result.error) {
      toast({ title: "Erro", description: result.error, variant: "destructive" })
    } else {
      toast({ title: "Sucesso", description: result.message })
      setIsRequestDialogOpen(false)
      setRequestForm({ professorId: "", tag: "", mensagem: "" })
      loadData()
    }
  }

  const getGradeColor = (nota: number) => {
    if (nota >= 16) return "text-green-600"
    if (nota >= 10) return "text-blue-600"
    return "text-red-600"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "aprovado":
        return <Badge variant="default">Aprovado</Badge>
      case "rejeitado":
        return <Badge variant="destructive">Rejeitado</Badge>
      case "pendente":
        return <Badge variant="secondary">Pendente</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
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
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-8 h-8 text-primary" />
                <h1 className="font-serif font-black text-3xl text-foreground">Dashboard do Aluno</h1>
              </div>
              <p className="text-muted-foreground">Acompanhe o seu progresso e avaliações</p>
            </div>
            <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Send className="w-4 h-4 mr-2" />
                  Solicitar Aprovação
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Solicitar Aprovação de Professor</DialogTitle>
                  <DialogDescription>
                    Envie uma solicitação para um professor se tornar seu orientador
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="professor">Professor</Label>
                    <Select
                      value={requestForm.professorId}
                      onValueChange={(value) => setRequestForm({ ...requestForm, professorId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um professor" />
                      </SelectTrigger>
                      <SelectContent>
                        {professors.map((prof) => (
                          <SelectItem key={prof.id} value={prof.id}>
                            {prof.nome_completo} {prof.tag_aprovacao && `(@${prof.tag_aprovacao})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="mensagem">Mensagem (opcional)</Label>
                    <Textarea
                      id="mensagem"
                      rows={4}
                      placeholder="Explique por que gostaria deste professor como orientador..."
                      value={requestForm.mensagem}
                      onChange={(e) => setRequestForm({ ...requestForm, mensagem: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleSubmitRequest} className="w-full">
                    Enviar Solicitação
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="grades">Avaliações</TabsTrigger>
            <TabsTrigger value="requests">Solicitações</TabsTrigger>
            <TabsTrigger value="following">Seguindo</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Documentos</CardTitle>
                  <FileText className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.myDocuments || 0}</div>
                  <p className="text-xs text-muted-foreground">Total partilhados</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.pendingDocuments || 0}</div>
                  <p className="text-xs text-muted-foreground">Aguardando avaliação</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
                  <CheckCircle className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.approvedDocuments || 0}</div>
                  <p className="text-xs text-muted-foreground">Documentos aprovados</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Média</CardTitle>
                  <Award className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.averageGrade || 0}/20</div>
                  <p className="text-xs text-muted-foreground">{stats?.totalGrades || 0} avaliações</p>
                </CardContent>
              </Card>
            </div>

            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle>Progresso Académico</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Taxa de Aprovação</span>
                    <span className="text-sm text-muted-foreground">
                      {stats?.myDocuments > 0 ? Math.round((stats.approvedDocuments / stats.myDocuments) * 100) : 0}%
                    </span>
                  </div>
                  <Progress
                    value={stats?.myDocuments > 0 ? (stats.approvedDocuments / stats.myDocuments) * 100 : 0}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Meus Documentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documents.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Nenhum documento partilhado</p>
                  ) : (
                    documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold">{doc.titulo}</h3>
                          <p className="text-sm text-muted-foreground">
                            {doc.tipo_documento} • {new Date(doc.created_at).toLocaleDateString()}
                          </p>
                          {doc.professor && (
                            <p className="text-sm text-muted-foreground">Orientador: {doc.professor.nome_completo}</p>
                          )}
                          <div className="flex gap-2 mt-2">
                            {getStatusBadge(doc.status)}
                            {doc.disciplina && <Badge variant="outline">{doc.disciplina}</Badge>}
                            {doc.nota && (
                              <Badge variant="outline" className={getGradeColor(doc.nota)}>
                                {doc.nota}/20
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/browse/${doc.id}`}>Ver</Link>
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grades" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Minhas Avaliações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {grades.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Nenhuma avaliação recebida</p>
                  ) : (
                    grades.map((grade) => (
                      <div key={grade.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4 flex-1">
                          <Avatar>
                            <AvatarImage src={grade.professor?.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback>{grade.professor?.nome_completo?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold">{grade.documento?.titulo}</h3>
                            <p className="text-sm text-muted-foreground">Professor: {grade.professor?.nome_completo}</p>
                            <p className="text-sm text-muted-foreground mt-1">{grade.comentario_privado}</p>
                            {grade.documento?.disciplina && (
                              <Badge variant="outline" className="mt-2">
                                {grade.documento.disciplina}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-3xl font-bold ${getGradeColor(grade.nota)}`}>{grade.nota}/20</div>
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

          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Solicitações de Aprovação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requests.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Nenhuma solicitação enviada</p>
                  ) : (
                    requests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={request.aprovador?.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback>{request.aprovador?.nome_completo?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{request.aprovador?.nome_completo}</h3>
                            <p className="text-sm text-muted-foreground">
                              {request.aprovador?.tipo_usuario === "professor" ? "Professor" : "Diretor"}
                            </p>
                            {request.mensagem && (
                              <p className="text-sm text-muted-foreground mt-1">{request.mensagem}</p>
                            )}
                            {request.tag_usada && (
                              <Badge variant="outline" className="mt-1">
                                @{request.tag_usada}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div>
                          {request.status === "pendente" && <Badge variant="secondary">Pendente</Badge>}
                          {request.status === "aprovado" && <Badge variant="default">Aprovado</Badge>}
                          {request.status === "rejeitado" && <Badge variant="destructive">Rejeitado</Badge>}
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
    </div>
  )
}
