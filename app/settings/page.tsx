import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Lock, Globe, Tag, ArrowLeft } from "lucide-react"
import { SettingsForm } from "@/components/settings/settings-form"
import { TagManagement } from "@/components/settings/tag-management"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"

export default async function SettingsPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("perfis_usuarios")
    .select("*, universidades(nome), cursos(nome)")
    .eq("id", user.id)
    .single()

  const canManageTags = profile?.tipo_usuario === "professor" || profile?.tipo_usuario === "diretor"

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 -mx-4 px-4 mb-6">
        <div className="py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Link>
            </Button>
            <Link href="/" className="transition-opacity hover:opacity-80">
              <Logo size="sm" />
            </Link>
          </div>
        </div>
      </header>

      <div className="mb-8">
        <h1 className="font-serif font-black text-3xl text-foreground mb-2">Definições</h1>
        <p className="text-muted-foreground">Gere as suas preferências e configurações da conta</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className={`grid w-full ${canManageTags ? "grid-cols-5" : "grid-cols-4"}`}>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Lock className="w-4 h-4 mr-2" />
            Privacidade
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Globe className="w-4 h-4 mr-2" />
            Preferências
          </TabsTrigger>
          {canManageTags && (
            <TabsTrigger value="tags">
              <Tag className="w-4 h-4 mr-2" />
              Tags
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile">
          <SettingsForm profile={profile} />
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>Configure como deseja receber notificações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">Receba atualizações importantes por email</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Novas Avaliações</Label>
                  <p className="text-sm text-muted-foreground">Notificar quando receber avaliações</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Novos Comentários</Label>
                  <p className="text-sm text-muted-foreground">Notificar sobre comentários nos seus recursos</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Aprovações de Upload</Label>
                  <p className="text-sm text-muted-foreground">Notificar quando uploads forem aprovados/recusados</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Conquistas Desbloqueadas</Label>
                  <p className="text-sm text-muted-foreground">Notificar sobre novas conquistas</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacidade</CardTitle>
              <CardDescription>Controle quem pode ver o seu perfil e atividade</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Visibilidade do Perfil</Label>
                <Select defaultValue="public">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Público - Todos podem ver</SelectItem>
                    <SelectItem value="university">Universidade - Apenas membros da universidade</SelectItem>
                    <SelectItem value="private">Privado - Apenas você</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mostrar Email</Label>
                  <p className="text-sm text-muted-foreground">Permitir que outros vejam o seu email</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mostrar Estatísticas</Label>
                  <p className="text-sm text-muted-foreground">Exibir downloads e visualizações no perfil</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Indexação em Motores de Busca</Label>
                  <p className="text-sm text-muted-foreground">Permitir que o perfil apareça em pesquisas</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Preferências</CardTitle>
              <CardDescription>Personalize a sua experiência na plataforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select defaultValue="pt">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt">Português</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tema</Label>
                <Select defaultValue="system">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Itens por Página</Label>
                <Select defaultValue="20">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Reprodução Automática de Vídeos</Label>
                  <p className="text-sm text-muted-foreground">Reproduzir vídeos automaticamente</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {canManageTags && (
          <TabsContent value="tags">
            <TagManagement currentTag={profile?.tag_aprovacao} userType={profile?.tipo_usuario} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
