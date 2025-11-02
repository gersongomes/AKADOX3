import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"

export default function TermsPage() {
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
          <h1 className="font-serif font-black text-4xl text-foreground mb-6">Termos de Uso</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Ao usar a plataforma Akadox, concordas com os seguintes termos e condições.
          </p>

          <div className="space-y-8">
            <div className="akadox-card p-6">
              <h3 className="font-serif font-bold text-xl mb-4">Uso Aceitável</h3>
              <p className="text-muted-foreground">
                A plataforma destina-se ao uso educacional. É proibido carregar conteúdo ofensivo, ilegal ou que viole
                direitos de autor.
              </p>
            </div>

            <div className="akadox-card p-6">
              <h3 className="font-serif font-bold text-xl mb-4">Propriedade Intelectual</h3>
              <p className="text-muted-foreground">
                Os utilizadores mantêm os direitos sobre o conteúdo que carregam, mas concedem à Akadox uma licença para
                distribuir esse conteúdo na plataforma.
              </p>
            </div>

            <div className="akadox-card p-6">
              <h3 className="font-serif font-bold text-xl mb-4">Responsabilidades</h3>
              <p className="text-muted-foreground">
                Os utilizadores são responsáveis pelo conteúdo que partilham e devem respeitar os direitos de outros
                utilizadores e terceiros.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
