"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { useState, useEffect } from "react"

interface SearchFiltersProps {
  onFilterChange: (filter: string) => void
  activeFilters: string[]
}

const universities = [
  "Universidade de Cabo Verde",
  "Universidade de Santiago",
  "Universidade Jean Piaget",
  "ISCEE",
  "Universidade Lusófona",
  "Universidade de Sotavento",
]

const subjects = ["Matemática", "Programação", "Física", "Química", "Gestão", "Direito", "Psicologia", "Medicina"]

const fileTypes = ["Apontamentos", "Slides", "Exercícios", "Exames", "Projetos", "Vídeos"]

const years = ["2024/2025", "2023/2024", "2022/2023", "2021/2022"]

export function SearchFilters({ onFilterChange, activeFilters }: SearchFiltersProps) {
  const [minRating, setMinRating] = useState(0)
  const isFilterActive = (filter: string) => activeFilters.includes(filter)

  useEffect(() => {
    const ratingFilter = activeFilters.find((f) => f.startsWith("rating:"))
    if (ratingFilter) {
      const rating = Number.parseFloat(ratingFilter.split(":")[1])
      setMinRating(rating)
    }
  }, [])

  const handleRatingChange = (value: number[]) => {
    const newRating = value[0]
    setMinRating(newRating)

    const oldRatingFilter = activeFilters.find((f) => f.startsWith("rating:"))
    if (oldRatingFilter) {
      onFilterChange(oldRatingFilter) // Remove old
    }
    if (newRating > 0) {
      onFilterChange(`rating:${newRating}`) // Add new
    }
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="font-serif text-lg">Filtros</CardTitle>
        {activeFilters.filter((f) => !f.startsWith("rating:")).length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Filtros ativos:</p>
            <div className="flex flex-wrap gap-2">
              {activeFilters
                .filter((f) => !f.startsWith("rating:"))
                .map((filter) => (
                  <Badge key={filter} variant="secondary" className="gap-1">
                    {filter}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-destructive"
                      onClick={() => onFilterChange(filter)}
                    />
                  </Badge>
                ))}
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Types */}
        <div>
          <h4 className="font-medium text-sm text-foreground mb-3">Tipo de Recurso</h4>
          <div className="space-y-2">
            {fileTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type}`}
                  checked={isFilterActive(type)}
                  onCheckedChange={() => onFilterChange(type)}
                />
                <Label htmlFor={`type-${type}`} className="text-sm">
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Universities */}
        <div>
          <h4 className="font-medium text-sm text-foreground mb-3">Universidade</h4>
          <div className="space-y-2">
            {universities.map((uni) => (
              <div key={uni} className="flex items-center space-x-2">
                <Checkbox id={`uni-${uni}`} checked={isFilterActive(uni)} onCheckedChange={() => onFilterChange(uni)} />
                <Label htmlFor={`uni-${uni}`} className="text-sm">
                  {uni}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Subjects */}
        <div>
          <h4 className="font-medium text-sm text-foreground mb-3">Disciplina</h4>
          <div className="space-y-2">
            {subjects.map((subject) => (
              <div key={subject} className="flex items-center space-x-2">
                <Checkbox
                  id={`subject-${subject}`}
                  checked={isFilterActive(subject)}
                  onCheckedChange={() => onFilterChange(subject)}
                />
                <Label htmlFor={`subject-${subject}`} className="text-sm">
                  {subject}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Academic Year */}
        <div>
          <h4 className="font-medium text-sm text-foreground mb-3">Ano Académico</h4>
          <div className="space-y-2">
            {years.map((year) => (
              <div key={year} className="flex items-center space-x-2">
                <Checkbox
                  id={`year-${year}`}
                  checked={isFilterActive(year)}
                  onCheckedChange={() => onFilterChange(year)}
                />
                <Label htmlFor={`year-${year}`} className="text-sm">
                  {year}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Rating Filter */}
        <div>
          <h4 className="font-medium text-sm text-foreground mb-3">Avaliação Mínima</h4>
          <div className="space-y-3">
            <Slider
              value={[minRating]}
              onValueChange={handleRatingChange}
              max={5}
              min={0}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0 estrelas</span>
              <span className="font-medium text-foreground">{minRating.toFixed(1)} ⭐</span>
              <span>5 estrelas</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Popular Filters */}
        <div>
          <h4 className="font-medium text-sm text-foreground mb-3">Filtros Populares</h4>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-secondary"
              onClick={() => onFilterChange("Mais descarregados")}
            >
              Mais descarregados
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-secondary"
              onClick={() => onFilterChange("Melhor avaliados")}
            >
              Melhor avaliados
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-secondary"
              onClick={() => onFilterChange("Recentes")}
            >
              Recentes
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
