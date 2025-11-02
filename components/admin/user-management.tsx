"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, AlertTriangle } from "lucide-react"
import { getAllUsers } from "@/lib/actions/admin"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface User {
  id: string
  nome_completo: string
  email: string
  tipo_usuario: string
  status: string
  pontos: number
  nivel: number
  created_at: string
  universidade_id: any
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        (user) =>
          user.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchTerm, users])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const result = await getAllUsers()

      if (result.error) {
        setError(result.error)
      } else {
        setUsers(result.data || [])
        setFilteredUsers(result.data || [])
      }
    } catch (err) {
      setError("Erro ao carregar utilizadores")
    } finally {
      setLoading(false)
    }
  }

  const getUserTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      pessoa_comum: "Pessoa Comum",
      aluno: "Aluno",
      professor: "Professor",
      diretor: "Diretor",
      admin: "Administrador",
    }
    return labels[type] || type
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      active: "default",
      pending_approval: "secondary",
      rejected: "destructive",
    }
    return variants[status] || "secondary"
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Gestão de Utilizadores ({filteredUsers.length})</span>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Pesquisar utilizadores..."
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={loadUsers} variant="outline" size="sm">
              Atualizar
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={`/.jpg?height=40&width=40&query=${user.nome_completo}`} />
                  <AvatarFallback>
                    {user.nome_completo
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-slate-900">{user.nome_completo}</h3>
                  <p className="text-sm text-slate-600">{user.email}</p>
                  <p className="text-xs text-slate-500">{user.universidade_id?.nome || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <Badge variant={getStatusBadge(user.status)}>{user.status}</Badge>
                  <p className="text-xs text-slate-500 mt-1">{getUserTypeLabel(user.tipo_usuario)}</p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium">Nível {user.nivel}</p>
                  <p className="text-xs text-slate-500">{user.pontos} pontos</p>
                </div>

                <div className="text-xs text-slate-500">{new Date(user.created_at).toLocaleDateString("pt-PT")}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
