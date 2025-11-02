import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, AlertTriangle, Shield } from "lucide-react"
import { AdminStats } from "@/components/admin/admin-stats"
import { UserManagement } from "@/components/admin/user-management"
import { ContentModeration } from "@/components/admin/content-moderation"
import { SystemAnalytics } from "@/components/admin/system-analytics"
import { PendingApprovals } from "@/components/admin/pending-approvals"
import { Logo } from "@/components/ui/logo"
import Link from "next/link"

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" />
            <nav className="flex items-center gap-6">
              <Link href="/dashboard" className="text-slate-600 hover:text-slate-900 transition-colors">
                Dashboard
              </Link>
              <Link href="/browse" className="text-slate-600 hover:text-slate-900 transition-colors">
                Explorar
              </Link>
              <Badge variant="secondary" className="bg-lime-100 text-lime-800">
                <Shield className="w-4 h-4 mr-1" />
                Administrador
              </Badge>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-cyan-800 mb-2">Painel Administrativo</h1>
              <p className="text-slate-600">Gestão do Repositório Colaborativo de Conhecimento Universitário</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <AdminStats />

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="approvals">Aprovações</TabsTrigger>
            <TabsTrigger value="users">Utilizadores</TabsTrigger>
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
            <TabsTrigger value="analytics">Análises</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Atividade Recente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: "Novo ficheiro carregado", user: "Maria Silva", time: "há 5 min", type: "upload" },
                      { action: "Pedido de aprovação", user: "João Santos", time: "há 15 min", type: "approval" },
                      { action: "Utilizador registado", user: "Ana Costa", time: "há 30 min", type: "user" },
                      { action: "Ficheiro aprovado", user: "Admin", time: "há 1 hora", type: "approval" },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              activity.type === "upload"
                                ? "bg-lime-500"
                                : activity.type === "approval"
                                  ? "bg-orange-500"
                                  : activity.type === "user"
                                    ? "bg-blue-500"
                                    : "bg-green-500"
                            }`}
                          />
                          <div>
                            <p className="font-medium text-slate-900">{activity.action}</p>
                            <p className="text-sm text-slate-600">{activity.user}</p>
                          </div>
                        </div>
                        <span className="text-sm text-slate-500">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pending Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Ações Pendentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Ficheiros para aprovar</span>
                      <Badge variant="destructive">12</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Comentários reportados</span>
                      <Badge variant="destructive">5</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Contas para verificar</span>
                      <Badge variant="secondary">3</Badge>
                    </div>
                    <Button className="w-full mt-4" size="sm">
                      Ver Todas as Ações
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="approvals">
            <PendingApprovals />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="content">
            <ContentModeration />
          </TabsContent>

          <TabsContent value="analytics">
            <SystemAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
