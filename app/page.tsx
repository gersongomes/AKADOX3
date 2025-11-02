import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, Award, Upload, Search, Star, Trophy, Zap, Crown, Shield, Play } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Logo } from "@/components/ui/logo"
import { AuthNav } from "@/components/navigation/auth-nav"
import { createServerClient } from "@/lib/supabase/server"

export default async function HomePage() {
  const supabase = await createServerClient()

  const [
    { count: totalDocuments },
    { count: totalUsers },
    { data: universities },
    { data: popularDocs },
    { data: cursos },
  ] = await Promise.all([
    supabase.from("documentos").select("*", { count: "exact", head: true }).eq("aprovado", true),
    supabase.from("perfis_usuarios").select("*", { count: "exact", head: true }),
    supabase.from("universidades").select("id, nome, codigo").eq("ativa", true).order("nome"),
    supabase
      .from("documentos")
      .select(
        `
        id,
        titulo,
        visualizacoes,
        downloads,
        tipo_arquivo,
        universidades(nome)
      `,
      )
      .eq("aprovado", true)
      .order("visualizacoes", { ascending: false })
      .limit(4),
    supabase.from("cursos").select("id, nome").eq("ativo", true),
  ])

  const docsWithRatings = await Promise.all(
    (popularDocs || []).map(async (doc) => {
      const { data: ratings } = await supabase.from("avaliacoes").select("rating").eq("documento_id", doc.id)

      const avgRating =
        ratings && ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0

      return {
        ...doc,
        rating: avgRating,
      }
    }),
  )

  const universidadesData =
    universities
      ?.map((uni, index) => ({
        nome: uni.nome,
        codigo: uni.codigo,
        cor: `bg-chart-${(index % 5) + 1}`,
        estudantes: "N/A",
        destaque: uni.nome.toLowerCase().includes("santiago"),
      }))
      .sort((a, b) => {
        // Santiago universities first
        if (a.destaque && !b.destaque) return -1
        if (!a.destaque && b.destaque) return 1
        return a.nome.localeCompare(b.nome)
      }) || []

  const conteudosPopulares = docsWithRatings.map((doc) => ({
    id: doc.id,
    titulo: doc.titulo,
    curso: "Geral",
    views: doc.visualizacoes?.toString() || "0",
    rating: doc.rating,
    cor: "bg-gradient-to-br from-primary to-secondary",
    thumbnail: `/placeholder.svg?height=120&width=120&query=${doc.tipo_arquivo}`,
  }))

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <header className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Logo size="lg" />

              <nav className="hidden md:flex items-center gap-6">
                <Link
                  href="/browse"
                  className="text-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  Explorar
                </Link>
                <Link
                  href="/upload"
                  className="text-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Carregar
                </Link>
                <Link
                  href="/leaderboard"
                  className="text-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Trophy className="w-4 h-4" />
                  Classificações
                </Link>
                <Link
                  href="/community"
                  className="text-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Comunidade
                </Link>
              </nav>
            </div>

            <AuthNav />
          </div>
        </div>
      </header>

      <section className="pt-20 pb-12 px-6 relative min-h-[80vh] flex items-center">
        <div className="absolute inset-0 akadox-gradient opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>

        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl">
            {/* Removed the Cape Verde badge button */}

            <h1 className="font-serif font-black text-5xl md:text-7xl lg:text-8xl mb-6 akadox-text">
              Conhecimento
              <br />
              Sem Limites
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
              A plataforma mais avançada para estudantes universitários de Cabo Verde. Descobre, partilha e colabora com
              a melhor comunidade académica.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-4 akadox-glow"
                asChild
              >
                <Link href="/register">
                  <Play className="w-5 h-5 mr-2" />
                  Começar Agora
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary/30 text-foreground hover:bg-primary/10 text-lg px-8 py-4 bg-transparent"
                asChild
              >
                <Link href="/browse">Explorar Conteúdo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif font-bold text-3xl text-foreground">Conteúdos Populares</h2>
            <Link href="/browse" className="text-primary hover:text-primary/80 font-semibold">
              Ver Todos
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {conteudosPopulares.map((conteudo) => (
              <Link
                key={conteudo.id}
                href={`/browse/${conteudo.id}`}
                className="akadox-card rounded-xl p-6 cursor-pointer group"
              >
                <div className="relative mb-4">
                  <Image
                    src={conteudo.thumbnail || "/placeholder.svg"}
                    alt={conteudo.titulo}
                    width={120}
                    height={120}
                    className="w-full h-24 object-cover rounded-lg group-hover:scale-105 transition-transform"
                  />
                  <div className={`absolute inset-0 ${conteudo.cor} opacity-20 rounded-lg`}></div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm line-clamp-2 text-foreground">{conteudo.titulo}</h3>
                  <p className="text-xs text-muted-foreground">{conteudo.curso}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{conteudo.views} views</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-primary text-primary" />
                      <span className="text-primary">{conteudo.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="container mx-auto">
          <h2 className="font-serif font-bold text-3xl text-foreground mb-8">Universidades Participantes</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {universidadesData.map((uni) => (
              <Link key={uni.codigo} href={`/browse?universidade=${uni.codigo}`}>
                <Card className={`akadox-card ${uni.destaque ? "border-primary akadox-glow" : ""}`}>
                  <CardHeader className="text-center p-6">
                    <div
                      className={`w-16 h-16 ${uni.cor} rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-black text-white`}
                    >
                      {uni.codigo}
                    </div>
                    <CardTitle className="font-serif text-lg text-foreground">{uni.nome}</CardTitle>
                    <CardDescription>
                      <span className="text-primary font-bold">{uni.estudantes}</span> estudantes
                    </CardDescription>
                    {uni.destaque && (
                      <Badge className="bg-primary text-primary-foreground mt-2">
                        <Crown className="w-3 h-3 mr-1" />
                        Destaque
                      </Badge>
                    )}
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h3 className="font-serif font-black text-4xl text-foreground mb-6 akadox-text">
              Sistema de Ranking Espetacular
            </h3>
            <p className="text-muted-foreground text-xl">
              Sistema de gamificação avançado - Sobe de nível e destaca-te!
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="akadox-card border-2 border-chart-5 hover:scale-105 transition-all">
              <CardHeader className="text-center">
                <Trophy className="w-12 h-12 text-chart-5 mx-auto mb-4" />
                <CardTitle className="text-chart-5">Bronze</CardTitle>
                <CardDescription>0 - 100 pontos</CardDescription>
              </CardHeader>
            </Card>

            <Card className="akadox-card border-2 border-chart-2 hover:scale-105 transition-all">
              <CardHeader className="text-center">
                <Shield className="w-12 h-12 text-chart-2 mx-auto mb-4" />
                <CardTitle className="text-chart-2">Prata</CardTitle>
                <CardDescription>101 - 500 pontos</CardDescription>
              </CardHeader>
            </Card>

            <Card className="akadox-card border-2 border-chart-5 hover:scale-105 transition-all">
              <CardHeader className="text-center">
                <Crown className="w-12 h-12 text-chart-5 mx-auto mb-4" />
                <CardTitle className="text-chart-5">Ouro</CardTitle>
                <CardDescription>501 - 1000 pontos</CardDescription>
              </CardHeader>
            </Card>

            <Card className="akadox-card border-2 border-primary hover:scale-105 transition-all akadox-glow">
              <CardHeader className="text-center">
                <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-primary">Diamante</CardTitle>
                <CardDescription>1000+ pontos</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="hover:scale-110 transition-all">
              <div className="text-5xl font-serif font-black text-primary mb-4 pulse-neon">{totalDocuments || 0}+</div>
              <div className="text-muted-foreground text-lg">Recursos Partilhados</div>
            </div>
            <div className="hover:scale-110 transition-all">
              <div className="text-5xl font-serif font-black text-primary mb-4 pulse-neon">{totalUsers || 0}+</div>
              <div className="text-muted-foreground text-lg">Estudantes Ativos</div>
            </div>
            <div className="hover:scale-110 transition-all">
              <div className="text-5xl font-serif font-black text-accent mb-4 pulse-neon">
                {universities?.length || 0}
              </div>
              <div className="text-muted-foreground text-lg">Universidades</div>
            </div>
            <div className="hover:scale-110 transition-all">
              <div className="text-5xl font-serif font-black text-chart-4 mb-4 pulse-neon">{cursos?.length || 0}+</div>
              <div className="text-muted-foreground text-lg">Cursos Cobertos</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="font-serif font-bold text-3xl text-foreground mb-4">Como funciona a plataforma</h3>
            <p className="text-muted-foreground text-lg">Ferramentas simples para uma colaboração eficaz</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-serif">Partilha Recursos</CardTitle>
                <CardDescription>Carrega e partilha os teus materiais académicos com colegas</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle className="font-serif">Descobre Conteúdo</CardTitle>
                <CardDescription>Encontra recursos por curso, disciplina ou universidade</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="font-serif">Colabora</CardTitle>
                <CardDescription>Comenta, avalia e melhora recursos em conjunto</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-chart-1/10 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-chart-1" />
                </div>
                <CardTitle className="font-serif">Ganha Pontos</CardTitle>
                <CardDescription>Sistema de gamificação com badges e classificações</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-chart-2" />
                </div>
                <CardTitle className="font-serif">Qualidade</CardTitle>
                <CardDescription>Conteúdo verificado e avaliado pela comunidade</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-chart-3/10 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-chart-3" />
                </div>
                <CardTitle className="font-serif">Organização</CardTitle>
                <CardDescription>Recursos organizados por categorias e tags</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 akadox-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <h3 className="font-serif font-black text-4xl md:text-6xl mb-8 text-white">
            Junta-te à Revolução Académica!
          </h3>
          <p className="text-2xl mb-12 text-white/90">
            Faz parte da comunidade mais <span className="font-black">espetacular</span> de estudantes de Cabo Verde!
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="text-2xl px-12 py-6 akadox-glow bg-white text-background hover:bg-white/90"
            asChild
          >
            <Link href="/register">Criar Conta GRÁTIS</Link>
          </Button>
        </div>
      </section>

      <footer className="py-12 px-4 border-t border-border bg-card/50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Logo size="md" className="mb-4" />
              <p className="text-muted-foreground text-sm">
                Plataforma académica avançada para estudantes de Cabo Verde
              </p>
            </div>
            <div>
              <h4 className="font-serif font-bold mb-4 text-foreground">Plataforma</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/browse" className="hover:text-primary">
                    Explorar
                  </Link>
                </li>
                <li>
                  <Link href="/upload" className="hover:text-primary">
                    Carregar
                  </Link>
                </li>
                <li>
                  <Link href="/leaderboard" className="hover:text-primary">
                    Classificações
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-serif font-bold mb-4 text-foreground">Comunidade</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/community" className="hover:text-primary">
                    Comunidade
                  </Link>
                </li>
                <li>
                  <Link href="/users" className="hover:text-primary">
                    Utilizadores
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-primary">
                    Ajuda
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-primary">
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-serif font-bold mb-4 text-foreground">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/privacy" className="hover:text-primary">
                    Privacidade
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-primary">
                    Termos
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2025 Akadox. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
