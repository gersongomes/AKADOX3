import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"

export default function HelpPage() {
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
          <h1 className="font-serif font-black text-4xl text-foreground mb-6">Centro de Ajuda</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Encontra respostas às tuas perguntas sobre a plataforma Akadox.
          </p>

          <div className="space-y-6">
            <div className="akadox-card p-6">
              <h3 className="font-serif font-bold text-xl mb-4">Como carregar ficheiros?</h3>
              <p className="text-muted-foreground">
                Vai à secção "Carregar", seleciona o ficheiro, preenche as informações e submete.
              </p>
            </div>

            <div className="akadox-card p-6">
              <h3 className="font-serif font-bold text-xl mb-4">Como ganhar pontos?</h3>
              <p className="text-muted-foreground">
                Ganha pontos carregando conteúdo, recebendo avaliações positivas e participando na comunidade.
              </p>
            </div>

            <div className="akadox-card p-6">
              <h3 className="font-serif font-bold text-xl mb-4">Problemas técnicos?</h3>
              <p className="text-muted-foreground">
                Se encontrares algum problema, contacta-nos através da página de contacto.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
