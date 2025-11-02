"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export function LeaderboardFilters() {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="font-serif text-lg">Filtros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Período</label>
          <Select defaultValue="all-time">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-time">Todo o tempo</SelectItem>
              <SelectItem value="this-month">Este mês</SelectItem>
              <SelectItem value="this-week">Esta semana</SelectItem>
              <SelectItem value="today">Hoje</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Universidade</label>
          <Select defaultValue="all">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="uni-cv">Uni-CV</SelectItem>
              <SelectItem value="jean-piaget">Jean Piaget</SelectItem>
              <SelectItem value="iscee">ISCEE</SelectItem>
              <SelectItem value="meia">M_EIA</SelectItem>
              <SelectItem value="lusofona">Lusófona</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Curso</label>
          <Select defaultValue="all">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="engineering">Engenharia</SelectItem>
              <SelectItem value="management">Gestão</SelectItem>
              <SelectItem value="law">Direito</SelectItem>
              <SelectItem value="medicine">Medicina</SelectItem>
              <SelectItem value="psychology">Psicologia</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <Button variant="outline" className="w-full bg-transparent">
          Limpar Filtros
        </Button>
      </CardContent>
    </Card>
  )
}
