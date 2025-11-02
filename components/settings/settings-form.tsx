"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Upload, X } from "lucide-react"
import { updateUserProfile, uploadAvatar } from "@/lib/actions/profile"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface SettingsFormProps {
  profile: any
}

export function SettingsForm({ profile }: SettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>(profile?.avatar_url || "")
  const [formData, setFormData] = useState({
    name: profile?.nome_completo || "",
    bio: profile?.bio || "",
  })
  const { toast } = useToast()
  const router = useRouter()

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "A imagem deve ter menos de 5MB",
          variant: "destructive",
        })
        return
      }

      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let avatarUrl = profile?.avatar_url

      // Upload avatar if changed
      if (avatarFile) {
        const uploadResult = await uploadAvatar(avatarFile)
        if (uploadResult.error) {
          toast({
            title: "Erro",
            description: uploadResult.error,
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
        avatarUrl = uploadResult.url
      } else if (!avatarPreview && profile?.avatar_url) {
        // Avatar was removed
        avatarUrl = null
      }

      // Update profile
      const result = await updateUserProfile({
        name: formData.name,
        bio: formData.bio,
        avatar_url: avatarUrl,
      })

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
    } catch (error) {
      console.error("[v0] Settings update error:", error)
      toast({
        title: "Erro",
        description: "Erro ao atualizar definições",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Foto de Perfil</CardTitle>
          <CardDescription>Atualiza a tua foto de perfil</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={avatarPreview || undefined} />
              <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                {formData.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" asChild>
                  <label htmlFor="avatar-upload" className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Carregar Foto
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                      disabled={isLoading}
                    />
                  </label>
                </Button>
                {avatarPreview && (
                  <Button type="button" variant="outline" size="sm" onClick={handleRemoveAvatar} disabled={isLoading}>
                    <X className="w-4 h-4 mr-2" />
                    Remover
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">JPG, PNG ou GIF. Máximo 5MB.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>Atualiza as tuas informações pessoais</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={profile?.email} disabled />
            <p className="text-xs text-muted-foreground">O email não pode ser alterado</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="university">Universidade</Label>
            <Input id="university" value={profile?.universidades?.nome || "Não especificado"} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="course">Curso</Label>
            <Input id="course" value={profile?.cursos?.nome || "Não especificado"} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              placeholder="Conta-nos um pouco sobre ti..."
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />A guardar...
            </>
          ) : (
            "Guardar Alterações"
          )}
        </Button>
      </div>
    </form>
  )
}
