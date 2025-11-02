"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Calendar, Award, Edit, Star, Save, X, Camera, Trash2 } from "lucide-react"
import { updateUserProfile, getUserStats, updateProfilePicture } from "@/lib/actions/profile"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"

interface ProfileHeaderProps {
  profile: any
  isOwnProfile: boolean
}

export function ProfileHeader({ profile, isOwnProfile }: ProfileHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: profile.nome_completo || "",
    course: profile.curso || "",
    year: profile.ano_ingresso || "",
    bio: profile.bio || "",
    location: profile.localizacao || "",
  })
  const [stats, setStats] = useState({ uploads: 0, downloads: 0, rating: 0, badges: 0 })
  const [loading, setLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadStats()
  }, [profile.id])

  const loadStats = async () => {
    const result = await getUserStats(profile.id)
    if (result.success && result.stats) {
      setStats(result.stats)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "A imagem deve ter no máximo 5MB",
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
    setAvatarPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSave = async () => {
    setLoading(true)

    if (avatarFile) {
      const avatarResult = await updateProfilePicture(avatarFile)
      if (avatarResult.error) {
        toast({
          title: "Erro",
          description: avatarResult.error,
          variant: "destructive",
        })
        setLoading(false)
        return
      }
    }

    const result = await updateUserProfile(formData)

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
      setIsEditing(false)
      // Reload page to show new avatar
      if (avatarFile) {
        window.location.reload()
      }
    }
    setLoading(false)
  }

  const handleCancel = () => {
    setFormData({
      name: profile.nome_completo || "",
      course: profile.curso || "",
      year: profile.ano_ingresso || "",
      bio: profile.bio || "",
      location: profile.localizacao || "",
    })
    setAvatarPreview(profile.avatar_url)
    setAvatarFile(null)
    setIsEditing(false)
  }

  return (
    <Card className="border-border">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col items-center md:items-start">
            <div className="relative mb-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={avatarPreview || "/university-student-portrait.png"} />
                <AvatarFallback className="text-2xl font-serif font-bold bg-primary text-primary-foreground">
                  {profile.nome_completo?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              {isOwnProfile && isEditing && (
                <div className="absolute -bottom-2 -right-2 flex gap-1">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                  {avatarPreview && (
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8 rounded-full"
                      onClick={handleRemoveAvatar}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            {isOwnProfile && !isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar Perfil
              </Button>
            )}
            {isEditing && (
              <div className="flex gap-2">
                <Button variant="default" size="sm" onClick={handleSave} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </Button>
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            )}
          </div>

          {/* User Details */}
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="course">Curso</Label>
                    <Input
                      id="course"
                      value={formData.course}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="year">Ano</Label>
                    <Input
                      id="year"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Localização</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                  <div>
                    <h1 className="font-serif font-black text-2xl text-foreground mb-2">{profile.nome_completo}</h1>
                    <p className="text-muted-foreground mb-2">{profile.email}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary" className="gap-1">
                        <Award className="w-3 h-3" />
                        Nível {profile.nivel || 1}
                      </Badge>
                      <Badge variant="outline">#{profile.ranking || "N/A"} no ranking</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-serif font-black text-secondary mb-1">{profile.pontos || 0}</div>
                    <div className="text-sm text-muted-foreground">pontos</div>
                  </div>
                </div>

                {/* Academic Info */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h3 className="font-medium text-foreground mb-2">Informação Académica</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>{profile.universidade}</div>
                      <div>
                        {profile.curso || "Curso não especificado"}{" "}
                        {profile.ano_ingresso && `- ${profile.ano_ingresso}`}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-2">Localização</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {profile.localizacao || "Não especificado"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Membro desde{" "}
                        {new Date(profile.created_at).toLocaleDateString("pt-PT", { month: "long", year: "numeric" })}
                      </div>
                    </div>
                  </div>
                </div>

                {profile.bio && (
                  <div className="mb-4">
                    <h3 className="font-medium text-foreground mb-2">Bio</h3>
                    <p className="text-sm text-muted-foreground">{profile.bio}</p>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="flex gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-foreground">{stats.uploads}</div>
                    <div className="text-muted-foreground">Recursos</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-foreground">{stats.downloads}</div>
                    <div className="text-muted-foreground">Downloads</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 justify-center">
                      <Star className="w-3 h-3 fill-current text-yellow-500" />
                      <span className="font-bold text-foreground">{stats.rating.toFixed(1)}</span>
                    </div>
                    <div className="text-muted-foreground">Avaliação</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-foreground">{stats.badges}</div>
                    <div className="text-muted-foreground">Badges</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
