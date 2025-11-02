"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"
import { addRating, getUserRating, getAverageRating } from "@/lib/actions/ratings"
import { useToast } from "@/hooks/use-toast"

interface RatingSectionProps {
  fileId: string
  currentRating: number
  ratingCount: number
}

export function RatingSection({ fileId, currentRating: initialRating, ratingCount: initialCount }: RatingSectionProps) {
  const { toast } = useToast()
  const [userRating, setUserRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [hasRated, setHasRated] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentRating, setCurrentRating] = useState(initialRating)
  const [ratingCount, setRatingCount] = useState(initialCount)

  useEffect(() => {
    async function loadUserRating() {
      const rating = await getUserRating(fileId)
      if (rating) {
        setUserRating(rating.rating)
        setHasRated(true)
      }
    }

    async function loadRatingStats() {
      const stats = await getAverageRating(fileId)
      if (stats) {
        setCurrentRating(stats.average)
        setRatingCount(stats.count)
      }
    }

    loadUserRating()
    loadRatingStats()
  }, [fileId])

  const handleRating = async (rating: number) => {
    if (isSubmitting) return

    setIsSubmitting(true)
    const result = await addRating(fileId, rating)

    if (result.success) {
      setUserRating(rating)
      setHasRated(true)

      // Refresh rating stats
      const stats = await getAverageRating(fileId)
      if (stats) {
        setCurrentRating(stats.average)
        setRatingCount(stats.count)
      }

      toast({
        title: "Avaliação registada",
        description: `Avaliaste este recurso com ${rating} estrela${rating !== 1 ? "s" : ""}`,
      })
    } else {
      toast({
        title: "Erro",
        description: result.error || "Não foi possível registar a avaliação",
        variant: "destructive",
      })
    }

    setIsSubmitting(false)
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="font-serif text-lg">Avaliações e Comentários</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-4xl font-serif font-black text-foreground mb-1">{currentRating.toFixed(1)}</div>
            <div className="flex items-center justify-center gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(currentRating) ? "fill-current text-yellow-500" : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              {ratingCount} avaliação{ratingCount !== 1 ? "ões" : ""}
            </div>
          </div>

          <div className="flex-1 space-y-2"></div>
        </div>

        {/* User Rating */}
        {!hasRated ? (
          <div className="p-4 rounded-lg bg-muted/30 border border-border">
            <h4 className="font-medium text-foreground mb-3">Avalia este recurso</h4>
            <div className="flex items-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className="p-1 hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => handleRating(star)}
                  disabled={isSubmitting}
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= (hoveredRating || userRating)
                        ? "fill-current text-yellow-500"
                        : "text-muted-foreground hover:text-yellow-400"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {isSubmitting ? "A guardar avaliação..." : "Clica nas estrelas para avaliar a qualidade deste recurso"}
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
            <div className="flex items-center gap-2 text-secondary">
              <Star className="w-5 h-5 fill-current" />
              <span className="font-medium">Obrigado pela tua avaliação!</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Avaliaste este recurso com {userRating} estrela{userRating !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
