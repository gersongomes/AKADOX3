import { Suspense } from "react"
import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { FavoritesList } from "@/components/favorites/favorites-list"
import { Logo } from "@/components/ui/logo"
import { AuthNav } from "@/components/navigation/auth-nav"
import Link from "next/link"

export default async function FavoritesPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-6">
          <Link href="/">
            <Logo size="md" />
          </Link>
          <AuthNav />
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-serif font-bold mb-8">Meus Favoritos</h1>
          <Suspense fallback={<div>Carregando favoritos...</div>}>
            <FavoritesList userId={user.id} />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
