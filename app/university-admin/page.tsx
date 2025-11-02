"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Shield, Users, FileText, MessageSquare, Trash2, UserPlus, UserMinus, Heart, Eye } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import Link from "next/link"

export default function UniversityAdminPanel() {
  const [activeTab, setActiveTab] = useState("pedidos")

  const pendingRequests = [
    {
      id: 1,
      author: "joao.silva@email.com",
      title: "Algoritmos e Estruturas de Dados",
      category: "Eng. Informática",
      type: "aluno",
      date: "2024-03-20",
    },
    {
      id: 2,
      author: "maria.costa@email.com",
      title: "Anatomia Humana Básica",
      category: "Medicina",
      type: "pessoa_comum",
      date: "2024-03-19",
    },
    {
      id: 3,
      author: "ana.santos@email.com",
      title: "Direito Constitucional",
      category: "Direito",
      type: "aluno",
      date: "2024-03-18",
    },
  ]

  const publications = [
    {
      id: 1,
      title: "Algoritmos e Estruturas de Dados",
      category: "Eng. Informática",
      author: "João Silva",
      likes: 24,
      comments: 8,
      views: 156,
    },
  ]

  const faculty = [
    {
      id: 1,
      name: "Prof. Carlos Mendes",
      email: "carlos.mendes@unicv.edu.cv",
      department: "Eng. Informática",
      status: "Ativo",
      joinDate: "2020-09-01",
    },
    {
      id: 2,
      name: "Prof. Ana Rodrigues",
      email: "ana.rodrigues@unicv.edu.cv",
      department: "Medicina",
      status: "Ativo",
      joinDate: "2019-02-15",
    },
  ]

  const handleApprove = (id: number) => {
    console.log(`[v0] Aprovando pedido ${id}`)
    // Implementar lógica de aprovação
  }

  const handleReject = (id: number) => {
    console.log(`[v0] Recusando pedido ${id}`)
    // Implementar lógica de recusa
  }

  const handleDeletePost = (id: number) => {
    console.log(`[v0] Eliminando publicação ${id}`)
    // Implementar lógica de eliminação
  }

  const handleAddFaculty = () => {
    console.log(`[v0] Adicionando novo docente`)
    // Implementar lógica de adição
  }

  const handleRemoveFaculty = (id: number) => {
    console.log(`[v0] Removendo docente ${id}`)
    // Implementar lógica de remoção
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo size="lg" className="text-white" />
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search"
                    className="pl-10 w-64 bg-slate-800 border-slate-700 text-white placeholder-gray-400"
                  />
                </div>
              </div>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/dashboard" className="text-white/80 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Shield className="w-4 h-4 mr-1" />
                Admin Universitário
              </Badge>
            </nav>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 space-y-2">
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-cyan-400 mb-4">
                <Shield className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </div>
              <div className="flex items-center gap-2 text-cyan-400 mb-4">
                <FileText className="w-5 h-5" />
                <span className="font-medium">Pedidos</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 mb-4">
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium">Publicações</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Users className="w-5 h-5" />
                <span className="font-medium">Docentes</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">Painel de Controle da Universidade</h1>
              <h2 className="text-2xl text-gray-300">Universidade de Cabo Verde</h2>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-slate-800 border-slate-700">
                <TabsTrigger value="pedidos" className="data-[state=active]:bg-cyan-600">
                  Pedidos
                </TabsTrigger>
                <TabsTrigger value="publicacoes" className="data-[state=active]:bg-cyan-600">
                  Publicações
                </TabsTrigger>
                <TabsTrigger value="docentes" className="data-[state=active]:bg-cyan-600">
                  Docentes
                </TabsTrigger>
              </TabsList>

              {/* Pedidos Tab */}
              <TabsContent value="pedidos">
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Table Header */}
                      <div className="grid grid-cols-5 gap-4 text-gray-400 text-sm font-medium border-b border-slate-700 pb-2">
                        <span>Autor</span>
                        <span>Título</span>
                        <span>Categoria</span>
                        <span>Ações</span>
                        <span></span>
                      </div>

                      {/* Table Rows */}
                      {pendingRequests.map((request) => (
                        <div
                          key={request.id}
                          className="grid grid-cols-5 gap-4 items-center py-3 border-b border-slate-700 last:border-b-0"
                        >
                          <span className="text-white">{request.author}</span>
                          <span className="text-white">{request.title}</span>
                          <span className="text-white">{request.category}</span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-cyan-600 hover:bg-cyan-700"
                              onClick={() => handleApprove(request.id)}
                            >
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-600 text-gray-300 hover:bg-slate-700 bg-transparent"
                              onClick={() => handleReject(request.id)}
                            >
                              Recusar
                            </Button>
                          </div>
                          <span></span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Publicações Tab */}
              <TabsContent value="publicacoes">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-white">Publicações</h3>

                  {publications.map((post) => (
                    <Card key={post.id} className="bg-slate-800 border-slate-700">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-xl font-semibold text-white mb-2">{post.title}</h4>
                            <p className="text-gray-400 mb-4">{post.category}</p>

                            <div className="flex items-center gap-6 text-sm text-gray-400">
                              <div className="flex items-center gap-1">
                                <Heart className="w-4 h-4" />
                                <span>{post.likes}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                <span>{post.comments}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                <span>{post.views}</span>
                              </div>
                            </div>
                          </div>

                          <Button
                            size="sm"
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Eliminar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Docentes Tab */}
              <TabsContent value="docentes">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">Gestão de Docentes</CardTitle>
                      <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={handleAddFaculty}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Adicionar Docente
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {faculty.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarImage src={`/.jpg?height=40&width=40&query=${member.name}`} />
                              <AvatarFallback className="bg-cyan-600 text-white">
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-white">{member.name}</h3>
                              <p className="text-sm text-gray-400">{member.email}</p>
                              <p className="text-xs text-gray-500">{member.department}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <Badge
                              variant={member.status === "Ativo" ? "default" : "secondary"}
                              className="bg-green-600"
                            >
                              {member.status}
                            </Badge>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleRemoveFaculty(member.id)}
                            >
                              <UserMinus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
