"use client"

import { useState } from "react"
import { FileGrid } from "@/components/browse/file-grid"
import { SearchFilters } from "@/components/browse/search-filters"
import { SearchSuggestions } from "@/components/browse/search-suggestions"
import { NotificationsDropdown } from "@/components/notifications/notifications-dropdown"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Upload, X, Filter, Grid, List, Heart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setShowSuggestions(false)
  }

  const addFilter = (filter: string) => {
    if (!activeFilters.includes(filter)) {
      setActiveFilters([...activeFilters, filter])
    }
  }

  const removeFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter((f) => f !== filter))
  }

  const clearAllFilters = () => {
    setActiveFilters([])
    setSearchQuery("")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-md border-b border-border netflix-slide">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-3">
                <Image src="/akadox-logo.png" alt="Akadox" width={40} height={40} className="akadox-glow" />
                <span className="font-serif font-black text-2xl akadox-text">Akadox</span>
              </Link>

              <nav className="hidden md:flex items-center gap-6">
                <Link href="/browse" className="text-primary font-semibold">
                  Explorar
                </Link>
                <Link href="/upload" className="text-foreground hover:text-primary transition-colors">
                  Carregar
                </Link>
                <Link href="/leaderboard" className="text-foreground hover:text-primary transition-colors">
                  Rankings
                </Link>
                <Link href="/favoritos" className="text-foreground hover:text-primary transition-colors">
                  Favoritos
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <NotificationsDropdown />
              <Button variant="ghost" size="sm" className="text-foreground hover:text-primary" asChild>
                <Link href="/favoritos">
                  <Heart className="w-5 h-5" />
                </Link>
              </Button>
              <Button className="bg-primary hover:bg-primary/90" asChild>
                <Link href="/upload">
                  <Upload className="w-4 h-4 mr-2" />
                  Carregar
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-20 pb-8">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <h1 className="font-serif font-black text-4xl md:text-6xl netflix-text mb-4">Explorar Recursos</h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Descobre materiais académicos partilhados pela comunidade universitária de Cabo Verde
            </p>
          </div>

          <div className="mb-8 space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 max-w-3xl">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Pesquisar por título, disciplina, universidade..."
                  className="pl-12 h-14 text-lg bg-card border-border focus:border-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                {showSuggestions && searchQuery && <SearchSuggestions query={searchQuery} onSelect={handleSearch} />}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="md:hidden bg-card border-border"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>

                <div className="flex border border-border rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    className="rounded-none"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    className="rounded-none"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-muted-foreground font-medium">Filtros ativos:</span>
                {activeFilters.map((filter) => (
                  <Badge key={filter} variant="secondary" className="gap-2 px-3 py-1">
                    {filter}
                    <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => removeFilter(filter)} />
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-primary hover:text-primary/80"
                >
                  Limpar todos
                </Button>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            <div className={`lg:col-span-1 ${showFilters ? "block" : "hidden lg:block"}`}>
              <div className="sticky top-24">
                <SearchFilters onFilterChange={addFilter} activeFilters={activeFilters} />
              </div>
            </div>
            <div className="lg:col-span-4">
              <FileGrid searchQuery={searchQuery} activeFilters={activeFilters} viewMode={viewMode} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
