"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users,
  FileText,
  Search,
  Trash2,
  CheckCircle,
  XCircle,
  GraduationCap,
  Building2,
  UserPlus,
  UserMinus,
  Heart,
  UserCheck,
} from "lucide-react"
import {
  getDirectorStats,
  getUniversityDocuments,
  getUniversityProfessors,
  moderateUniversityDocument,
  deleteUniversityDocument,
  addProfessor,
  removeProfessor,
  getCommonUserRequests,
  moderateCommonUserRequest,
  getFollowingFollowers,
} from "@/lib/actions/director"
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
import { Label } from "@/components/ui/label"

export function DirectorDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<any>(null)
  const [documents, setDocuments] = useState<any[]>([])
  const [professors, setProfessors] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [followData, setFollowData] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [newProfessorEmail, setNewProfessorEmail] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [statsResult, docsResult, profsResult, requestsResult, followResult] = await Promise.all([
      getDirectorStats(),
      getUniversityDocuments(),
      getUniversityProfessors(),
      getCommonUserRequests(),
      getFollowingFollowers(),
    ])

    if (statsResult.success) setStats(statsResult.data)
    if (docsResult.success) setDocuments(docsResult.data)
    if (profsResult.success) setProfessors(profsResult.data)
    if (requestsResult.success) setRequests(requestsResult.data)
    if (followResult.success) setFollowData(followResult.data)
  }

  const handleModerateDocument = async (docId: string, approved: boolean) => {
    const result = await moderateUniversityDocument(docId, approved)
    if (result.error) {
      toast({ title: "Erro", description: result.error, variant: "destructive" })
    } else {
      toast({ title: "Sucesso", description: result.message })
      loadData()
    }
  }

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm("Tem certeza que deseja eliminar este documento?")) return

    const result = await deleteUniversityDocument(docId)
    if (result.error) {
      toast({ title: "Erro", description: result.error, variant: "destructive" })
    } else {
      toast({ title: "Sucesso", description: result.message })
      loadData()
    }
  }

  const handleAddProfessor = async () => {
    if (!newProfessorEmail.trim()) {
      toast({ title: "Erro", description: "Por favor, insira um email", variant: "destructive" })
      return
    }

    const result = await addProfessor(newProfessorEmail)
    if (result.error) {
      toast({ title: "Erro", description: result.error, variant: "destructive" })
    } else {
      toast({ title: "Sucesso", description: result.message })
      setNewProfessorEmail("")
      setIsAddDialogOpen(false)
      loadData()
    }
  }

  const handleRemoveProfessor = async (professorId: string) => {
    if (!confirm("Tem certeza que deseja remover este professor?")) return

    const result = await removeProfessor(professorId)
    if (result.error) {
      toast({ title: "Erro", description: result.error, variant: "destructive" })
    } else {
      toast({ title: "Sucesso", description: result.message })
      loadData()
    }
  }

  const handleModerateRequest = async (requestId: string, approved: boolean) => {
    const result = await moderateCommonUserRequest(requestId, approved)
    if (result.error) {
      toast({ title: "Erro", description: result.error, variant: "destructive" })
    } else {
      toast({ title: "Sucesso", description: result.message })
      loadData()
    }
  }

  const filteredDocuments = documents.filter((doc) => doc.titulo?.toLowerCase().includes(searchTerm.toLowerCase()))

  const pendingDocs = documents.filter((doc) => doc.status === "pendente")
  const studentDocs = documents.filter((doc) => doc.autor_id?.tipo_usuario === "aluno")

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
            <Building2 className="w-8 h-8 text-primary" />
            <h1 className="font-serif font-black text-3xl text-foreground">Dashboard do Diretor</h1>
          </div>
          <p className="text-muted-foreground">Gestão da universidade e aprovação de documentos</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="requests">Solicitações</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="professors">Professores</TabsTrigger>
            <TabsTrigger value="following">Seguindo</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Alunos</CardTitle>
                  <GraduationCap className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Professores</CardTitle>
                  <Users className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalProfessors || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Documentos</CardTitle>
                  <FileText className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalDocuments || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                  <FileText className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.pendingDocuments || 0}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Pesquisar documentos pendentes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {pendingDocs.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Nenhum documento pendente</p>
                  ) : (
                    pendingDocs.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold">{doc.titulo}</h3>
                          <p className="text-sm text-muted-foreground">
                            Por: {doc.autor_id?.nome_completo} ({doc.autor_id?.tipo_usuario})
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
                          <Button size="sm" variant="default" onClick={() => handleModerateDocument(doc.id, true)}>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleModerateDocument(doc.id, false)}>
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

          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Solicitações de Pessoas Comuns</CardTitle>
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
                            <AvatarImage src={request.usuario?.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback>{request.usuario?.nome_completo?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{request.usuario?.nome_completo}</h3>
                            <p className="text-sm text-muted-foreground">{request.usuario?.email}</p>
                            {request.mensagem && (
                              <p className="text-sm text-muted-foreground mt-1">{request.mensagem}</p>
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

          <TabsContent value="documents" className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Pesquisar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {filteredDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{doc.titulo}</h3>
                        <p className="text-sm text-muted-foreground">
                          Por: {doc.autor_id?.nome_completo} • {doc.downloads || 0} downloads
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={doc.status === "aprovado" ? "default" : "secondary"}>
                            {doc.status === "aprovado" ? "Aprovado" : "Pendente"}
                          </Badge>
                          {doc.disciplina && <Badge variant="outline">{doc.disciplina}</Badge>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/browse/${doc.id}`}>Ver</Link>
                        </Button>
                        {doc.autor_id?.tipo_usuario === "aluno" && (
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteDocument(doc.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="professors" className="space-y-6">
            <div className="flex justify-end">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Adicionar Professor
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Professor</DialogTitle>
                    <DialogDescription>Insira o email do utilizador que deseja promover a professor</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email do Utilizador</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="exemplo@email.com"
                        value={newProfessorEmail}
                        onChange={(e) => setNewProfessorEmail(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleAddProfessor} className="w-full">
                      Adicionar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Professores da Universidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {professors.map((prof) => (
                    <div key={prof.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={prof.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>{prof.nome_completo?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{prof.nome_completo}</h3>
                          <p className="text-sm text-muted-foreground">{prof.email}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">Professor</Badge>
                            <Badge variant="secondary">Nível {prof.nivel || 1}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{prof.pontos || 0} pontos</p>
                        </div>
                        <Button size="sm" variant="destructive" onClick={() => handleRemoveProfessor(prof.id)}>
                          <UserMinus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
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
