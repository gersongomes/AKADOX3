"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, FileText, Building2, Search, Trash2, Edit, CheckCircle, XCircle, UserPlus, Shield } from "lucide-react"
import {
  getAllUsers,
  getAllDocuments,
  getAllUniversities,
  getAdminStats,
  deleteDocument,
  moderateDocument,
  updateUser,
  deleteUser,
  createUniversity,
  updateUniversity,
  deleteUniversity,
} from "@/lib/actions/admin"
import { useToast } from "@/hooks/use-toast"
import { Logo } from "@/components/ui/logo"
import { AuthNav } from "@/components/navigation/auth-nav"
import Link from "next/link"

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [universities, setUniversities] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")

  const [editUserDialog, setEditUserDialog] = useState(false)
  const [editUniversityDialog, setEditUniversityDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [selectedUniversity, setSelectedUniversity] = useState<any>(null)

  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [statsResult, usersResult, docsResult, univResult] = await Promise.all([
      getAdminStats(),
      getAllUsers(),
      getAllDocuments(),
      getAllUniversities(),
    ])

    if (statsResult.success) setStats(statsResult.data)
    if (usersResult.success) setUsers(usersResult.data)
    if (docsResult.success) setDocuments(docsResult.data)
    if (univResult.success) setUniversities(univResult.data)
  }

  const handleEditUser = (user: any) => {
    setSelectedUser(user)
    setEditUserDialog(true)
  }

  const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const result = await updateUser(selectedUser.id, {
      nome_completo: formData.get("nome_completo") as string,
      email: formData.get("email") as string,
      tipo_usuario: formData.get("tipo_usuario") as string,
    })

    if (result.error) {
      toast({ title: "Erro", description: result.error, variant: "destructive" })
    } else {
      toast({ title: "Sucesso", description: result.message })
      setEditUserDialog(false)
      loadData()
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Tem certeza que deseja eliminar este utilizador?")) return

    const result = await deleteUser(userId)
    if (result.error) {
      toast({ title: "Erro", description: result.error, variant: "destructive" })
    } else {
      toast({ title: "Sucesso", description: result.message })
      loadData()
    }
  }

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm("Tem certeza que deseja eliminar este documento?")) return

    const result = await deleteDocument(docId)
    if (result.error) {
      toast({ title: "Erro", description: result.error, variant: "destructive" })
    } else {
      toast({ title: "Sucesso", description: result.message })
      loadData()
    }
  }

  const handleModerateDocument = async (docId: string, approved: boolean) => {
    const result = await moderateDocument(docId, approved)
    if (result.error) {
      toast({ title: "Erro", description: result.error, variant: "destructive" })
    } else {
      toast({ title: "Sucesso", description: result.message })
      loadData()
    }
  }

  const handleEditUniversity = (uni: any) => {
    setSelectedUniversity(uni)
    setEditUniversityDialog(true)
  }

  const handleCreateUniversity = () => {
    setSelectedUniversity(null)
    setEditUniversityDialog(true)
  }

  const handleSaveUniversity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const data = {
      nome: formData.get("nome") as string,
      codigo: formData.get("codigo") as string,
      endereco: formData.get("endereco") as string,
    }

    const result = selectedUniversity
      ? await updateUniversity(selectedUniversity.id, data)
      : await createUniversity(data)

    if (result.error) {
      toast({ title: "Erro", description: result.error, variant: "destructive" })
    } else {
      toast({ title: "Sucesso", description: result.message })
      setEditUniversityDialog(false)
      loadData()
    }
  }

  const handleDeleteUniversity = async (uniId: string) => {
    if (!confirm("Tem certeza que deseja eliminar esta universidade?")) return

    const result = await deleteUniversity(uniId)
    if (result.error) {
      toast({ title: "Erro", description: result.error, variant: "destructive" })
    } else {
      toast({ title: "Sucesso", description: result.message })
      loadData()
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || user.tipo_usuario === filterType
    return matchesSearch && matchesType
  })

  const filteredDocuments = documents.filter((doc) => doc.titulo?.toLowerCase().includes(searchTerm.toLowerCase()))

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
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="font-serif font-black text-3xl text-foreground">Dashboard do Administrador</h1>
          </div>
          <p className="text-muted-foreground">Gestão completa da plataforma AKADOX</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="users">Utilizadores</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="universities">Universidades</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total de Utilizadores</CardTitle>
                  <Users className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total de Documentos</CardTitle>
                  <FileText className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalDocuments || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Aprovações Pendentes</CardTitle>
                  <Shield className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.pendingApprovals || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Universidades</CardTitle>
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalUniversities || 0}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Pesquisar utilizadores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="aluno">Alunos</SelectItem>
                  <SelectItem value="professor">Professores</SelectItem>
                  <SelectItem value="diretor">Diretores</SelectItem>
                  <SelectItem value="admin">Administradores</SelectItem>
                  <SelectItem value="pessoa_comum">Pessoas Comuns</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>{user.nome_completo?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{user.nome_completo}</h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{user.tipo_usuario}</Badge>
                            {user.universidade_id?.nome && (
                              <Badge variant="secondary">{user.universidade_id.nome}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditUser(user)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(user.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
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
                          <Badge variant={doc.aprovado ? "default" : "secondary"}>
                            {doc.aprovado ? "Aprovado" : "Pendente"}
                          </Badge>
                          {doc.categoria && <Badge variant="outline">{doc.categoria}</Badge>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/browse/${doc.id}`}>Ver</Link>
                        </Button>
                        {!doc.aprovado && (
                          <>
                            <Button size="sm" variant="default" onClick={() => handleModerateDocument(doc.id, true)}>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleModerateDocument(doc.id, false)}>
                              <XCircle className="w-4 h-4 mr-1" />
                              Recusar
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteDocument(doc.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="universities" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Universidades</h2>
              <Button onClick={handleCreateUniversity}>
                <UserPlus className="w-4 h-4 mr-2" />
                Adicionar Universidade
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {universities.map((uni) => (
                <Card key={uni.id}>
                  <CardHeader>
                    <CardTitle>{uni.nome}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">Código: {uni.codigo}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditUniversity(uni)}>
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteUniversity(uni.id)}>
                        <Trash2 className="w-4 h-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={editUserDialog} onOpenChange={setEditUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Utilizador</DialogTitle>
            <DialogDescription>Atualize as informações do utilizador</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome_completo">Nome Completo</Label>
                <Input id="nome_completo" name="nome_completo" defaultValue={selectedUser?.nome_completo} required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={selectedUser?.email} required />
              </div>
              <div>
                <Label htmlFor="tipo_usuario">Tipo de Utilizador</Label>
                <Select name="tipo_usuario" defaultValue={selectedUser?.tipo_usuario}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pessoa_comum">Pessoa Comum</SelectItem>
                    <SelectItem value="aluno">Aluno</SelectItem>
                    <SelectItem value="professor">Professor</SelectItem>
                    <SelectItem value="diretor">Diretor</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setEditUserDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editUniversityDialog} onOpenChange={setEditUniversityDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedUniversity ? "Editar" : "Adicionar"} Universidade</DialogTitle>
            <DialogDescription>
              {selectedUniversity ? "Atualize" : "Adicione"} as informações da universidade
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveUniversity}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" name="nome" defaultValue={selectedUniversity?.nome} required />
              </div>
              <div>
                <Label htmlFor="codigo">Código</Label>
                <Input id="codigo" name="codigo" defaultValue={selectedUniversity?.codigo} required />
              </div>
              <div>
                <Label htmlFor="endereco">Endereço</Label>
                <Input id="endereco" name="endereco" defaultValue={selectedUniversity?.endereco} />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setEditUniversityDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
