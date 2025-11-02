"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, Check, Tag, Info } from "lucide-react"
import { updateApprovalTag } from "@/lib/actions/profile"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface TagManagementProps {
  currentTag?: string | null
  userType?: string
}

export function TagManagement({ currentTag, userType }: TagManagementProps) {
  const [tag, setTag] = useState(currentTag || "")
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSave = async () => {
    setIsLoading(true)
    const result = await updateApprovalTag(tag)

    if (result.error) {
      toast({
        title: "Erro",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Sucesso",
        description: result.message,
      })
      router.refresh()
    }
    setIsLoading(false)
  }

  const handleCopy = () => {
    if (tag) {
      navigator.clipboard.writeText(`@${tag}`)
      setCopied(true)
      toast({
        title: "Copiado!",
        description: "Tag copiada para a área de transferência",
      })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const userTypeLabel = userType === "professor" ? "Professor" : "Diretor/Universidade"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="w-5 h-5" />
          Tag de Aprovação
        </CardTitle>
        <CardDescription>
          Crie uma tag única para que {userType === "professor" ? "alunos" : "utilizadores comuns"} possam solicitar a
          sua aprovação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            {userType === "professor"
              ? "Os alunos poderão usar a sua tag para solicitar aprovação de documentos. A tag aparecerá no formato @suatag"
              : "Os utilizadores comuns poderão usar a sua tag para solicitar associação à universidade. A tag aparecerá no formato @suatag"}
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tag">Sua Tag de {userTypeLabel}</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                <Input
                  id="tag"
                  value={tag}
                  onChange={(e) => setTag(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                  placeholder="minhatag"
                  className="pl-7"
                  maxLength={20}
                />
              </div>
              {tag && (
                <Button variant="outline" size="icon" onClick={handleCopy}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Apenas letras, números e underscore. Máximo 20 caracteres.</p>
          </div>

          {tag && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Pré-visualização:</p>
              <Badge variant="secondary" className="text-base">
                @{tag}
              </Badge>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Como funciona:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>
                {userType === "professor"
                  ? "Alunos verão a sua tag no dashboard deles"
                  : "Utilizadores comuns verão a sua tag ao solicitar associação"}
              </li>
              <li>Eles podem copiar e usar a tag para solicitar aprovação</li>
              <li>Você receberá notificações de todas as solicitações</li>
              <li>Pode aprovar ou rejeitar cada solicitação individualmente</li>
            </ul>
          </div>

          <Button onClick={handleSave} disabled={isLoading || !tag} className="w-full">
            {isLoading ? "A guardar..." : "Guardar Tag"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
