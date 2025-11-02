import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { UploadForm } from "@/components/upload/upload-form"
import { RecentUploads } from "@/components/upload/recent-uploads"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function UploadPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?redirect=/upload")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Link>
              </Button>
              <Logo size="sm" />
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" asChild>
                <Link href="/browse">Explorar</Link>
              </Button>
              <Button asChild>
                <Link href="/profile">Perfil</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h2 className="font-serif font-black text-3xl text-foreground mb-2">Partilhar Recurso</h2>
          <p className="text-muted-foreground text-lg">
            Carrega os teus materiais académicos para ajudar outros estudantes
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-serif">Carregar Ficheiro</CardTitle>
                <CardDescription>
                  Seleciona um ficheiro e preenche as informações para partilhar com a comunidade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UploadForm />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <RecentUploads />
          </div>
        </div>
      </div>
    </div>
  )
}
