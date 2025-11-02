import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
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

      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif font-black text-4xl text-foreground mb-6">Comunidade Akadox</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Conecta-te com estudantes de toda Cabo Verde e partilha conhecimento.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="akadox-card p-6">
              <h3 className="font-serif font-bold text-xl mb-4">Fóruns de Discussão</h3>
              <p className="text-muted-foreground">
                Participa em discussões sobre disciplinas, projetos e vida académica.
              </p>
            </div>

            <div className="akadox-card p-6">
              <h3 className="font-serif font-bold text-xl mb-4">Grupos de Estudo</h3>
              <p className="text-muted-foreground">Forma ou junta-te a grupos de estudo com colegas da tua área.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
