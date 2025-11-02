import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"

export default function PrivacyPage() {
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
          <h1 className="font-serif font-black text-4xl text-foreground mb-6">Política de Privacidade</h1>
          <p className="text-xl text-muted-foreground mb-8">
            A tua privacidade é importante para nós. Esta política explica como recolhemos e usamos os teus dados.
          </p>

          <div className="space-y-8">
            <div className="akadox-card p-6">
              <h3 className="font-serif font-bold text-xl mb-4">Recolha de Dados</h3>
              <p className="text-muted-foreground">
                Recolhemos apenas os dados necessários para o funcionamento da plataforma, incluindo informações de
                perfil, ficheiros carregados e interações na plataforma.
              </p>
            </div>

            <div className="akadox-card p-6">
              <h3 className="font-serif font-bold text-xl mb-4">Uso dos Dados</h3>
              <p className="text-muted-foreground">
                Os teus dados são usados para personalizar a experiência, melhorar os serviços e facilitar a partilha de
                conhecimento entre estudantes.
              </p>
            </div>

            <div className="akadox-card p-6">
              <h3 className="font-serif font-bold text-xl mb-4">Proteção de Dados</h3>
              <p className="text-muted-foreground">
                Implementamos medidas de segurança adequadas para proteger os teus dados pessoais contra acesso não
                autorizado, alteração, divulgação ou destruição.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
