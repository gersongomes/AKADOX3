"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Star } from "lucide-react"
import { getRatingBreakdown } from "@/lib/actions/ratings"

interface RatingBreakdownProps {
  fileId: string
}

export function RatingBreakdown({ fileId }: RatingBreakdownProps) {
  const [breakdown, setBreakdown] = useState({
    total: 0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    average: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadBreakdown() {
      const data = await getRatingBreakdown(fileId)
      setBreakdown(data)
      setIsLoading(false)
    }
    loadBreakdown()
  }, [fileId])

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Distribuição de Avaliações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">A carregar...</p>
        </CardContent>
      </Card>
    )
  }

  const stars = [5, 4, 3, 2, 1] as const

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="font-serif text-lg">Distribuição de Avaliações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-foreground">{breakdown.average.toFixed(1)}</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(breakdown.average) ? "fill-yellow-500 text-yellow-500" : "text-muted"
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {breakdown.total} avaliação{breakdown.total !== 1 ? "ões" : ""}
            </div>
          </div>

          <div className="flex-1 space-y-2">
            {stars.map((star) => {
              const count = breakdown.breakdown[star]
              const percentage = breakdown.total > 0 ? (count / breakdown.total) * 100 : 0

              return (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium text-foreground">{star}</span>
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  </div>
                  <Progress value={percentage} className="flex-1 h-2" />
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {count} ({percentage.toFixed(0)}%)
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
