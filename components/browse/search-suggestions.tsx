"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Search, BookOpen, User, Building } from "lucide-react"

interface SearchSuggestionsProps {
  query: string
  onSelect: (suggestion: string) => void
}

const suggestions = [
  { type: "recent", text: "cálculo diferencial", icon: Search },
  { type: "recent", text: "programação java", icon: Search },
  { type: "subject", text: "Matemática", icon: BookOpen },
  { type: "subject", text: "Programação", icon: BookOpen },
  { type: "university", text: "Universidade de Cabo Verde", icon: Building },
  { type: "author", text: "João Santos", icon: User },
]

export function SearchSuggestions({ query, onSelect }: SearchSuggestionsProps) {
  const filteredSuggestions = suggestions.filter((s) => s.text.toLowerCase().includes(query.toLowerCase()))

  if (filteredSuggestions.length === 0) return null

  return (
    <Card className="absolute top-full left-0 right-0 mt-1 border-border shadow-lg z-50">
      <CardContent className="p-2">
        {filteredSuggestions.slice(0, 6).map((suggestion, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-2 hover:bg-muted rounded cursor-pointer"
            onClick={() => onSelect(suggestion.text)}
          >
            <suggestion.icon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-foreground">{suggestion.text}</span>
            {suggestion.type === "recent" && <span className="text-xs text-muted-foreground ml-auto">recente</span>}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
