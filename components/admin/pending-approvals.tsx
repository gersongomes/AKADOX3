"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react"
import { getPendingApprovals, approveUser } from "@/lib/actions/admin"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PendingUser {
  id: string
  email: string
  nome_completo: string
  tipo_usuario: string
  universidade_id: string
  created_at: string
  aprovado: boolean
}

export function PendingApprovals() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [processingUser, setProcessingUser] = useState<string | null>(null)

  useEffect(() => {
    loadPendingApprovals()
  }, [])

  const loadPendingApprovals = async () => {
    try {
      setLoading(true)
      const result = await getPendingApprovals()

      if (result.error) {
        setError(result.error)
      } else {
        setPendingUsers(result.data || [])
      }
    } catch (err) {
      setError("Erro ao carregar aprovações pendentes")
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (userId: string, approved: boolean) => {
    try {
      setProcessingUser(userId)
      const result = await approveUser(userId, approved)

      if (result.error) {
        setError(result.error)
      } else {
        // Remove user from pending list
        setPendingUsers((prev) => prev.filter((user) => user.id !== userId))
        setError("") // Clear any previous errors
      }
    } catch (err) {
      setError("Erro ao processar aprovação")
    } finally {
      setProcessingUser(null)
    }
  }

  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case "diretor":
        return "Diretor/Universidade"
      case "admin":
        return "Administrador Total"
      default:
        return type
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Aprovações Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
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
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Aprovações Pendentes
            {pendingUsers.length > 0 && <Badge variant="destructive">{pendingUsers.length}</Badge>}
          </div>
          <Button onClick={loadPendingApprovals} variant="outline" size="sm">
            Atualizar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {pendingUsers.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-slate-600">Não há aprovações pendentes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
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
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{getUserTypeLabel(user.tipo_usuario)}</Badge>
                      <span className="text-xs text-slate-500">
                        {new Date(user.created_at).toLocaleDateString("pt-PT")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 border-green-600 hover:bg-green-50 bg-transparent"
                    onClick={() => handleApproval(user.id, true)}
                    disabled={processingUser === user.id}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                    onClick={() => handleApproval(user.id, false)}
                    disabled={processingUser === user.id}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Recusar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
