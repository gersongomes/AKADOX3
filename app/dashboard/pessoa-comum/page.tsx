import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Star, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function DashboardPessoaComum() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-serif font-black text-3xl text-foreground mb-2">Dashboard Visitante</h1>
          <p className="text-muted-foreground">Explore conteúdos públicos e solicite permissões para partilhar</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Explorar Conteúdos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Acesse materiais públicos disponíveis</p>
              <Button asChild className="w-full">
                <Link href="/browse">Explorar</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-secondary/20 hover:border-secondary/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-secondary" />
                Solicitar Permissão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Solicite à universidade permissão para partilhar conteúdos
              </p>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/solicitar-permissao">Solicitar</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-accent/20 hover:border-accent/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-accent" />
                Favoritos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Acesse os seus materiais favoritos</p>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/favoritos">Ver Favoritos</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
