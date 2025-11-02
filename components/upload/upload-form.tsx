"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Upload, X, FileText, ImageIcon, Video, Archive, Loader2, Tag } from "lucide-react"
import { uploadFile } from "@/lib/actions/files"
import { getProfessorTags, getUniversityTags } from "@/lib/actions/documents"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { createBrowserClient } from "@/lib/supabase/client"

const universities = [
  "Universidade de Santiago",
  "Universidade de Cabo Verde (Uni-CV)",
  "Universidade Jean Piaget de Cabo Verde",
  "Instituto Superior de Ciências Económicas e Empresariais (ISCEE)",
  "Instituto Universitário de Arte, Tecnologia e Cultura (M_EIA)",
  "Universidade Lusófona de Cabo Verde",
]

const subjects = [
  "Matemática",
  "Física",
  "Química",
  "Programação",
  "Base de Dados",
  "Redes",
  "Gestão",
  "Marketing",
  "Contabilidade",
  "Direito Civil",
  "Direito Penal",
  "Psicologia Geral",
  "Anatomia",
  "Fisiologia",
]

const fileTypes = [
  { value: "notes", label: "Apontamentos", icon: FileText },
  { value: "slides", label: "Slides", icon: ImageIcon },
  { value: "exercises", label: "Exercícios", icon: FileText },
  { value: "exams", label: "Exames", icon: FileText },
  { value: "projects", label: "Projetos", icon: Archive },
  { value: "videos", label: "Vídeos", icon: Video },
]

export function UploadForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    university: "",
    subject: "",
    fileType: "",
    year: "",
  })
  const [professorTags, setProfessorTags] = useState<any[]>([])
  const [universityTags, setUniversityTags] = useState<any[]>([])
  const [selectedApprovalTag, setSelectedApprovalTag] = useState("")
  const [showTagSelector, setShowTagSelector] = useState(false)
  const [userType, setUserType] = useState<string>("")
  const [isLoadingUserType, setIsLoadingUserType] = useState(true)

  const { toast } = useToast()

  useEffect(() => {
    async function loadUserType() {
      try {
        const supabase = createBrowserClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data: profile } = await supabase
            .from("perfis_usuarios")
            .select("tipo_usuario")
            .eq("id", user.id)
            .single()

          if (profile) {
            setUserType(profile.tipo_usuario)
          }
        }
      } catch (err) {
        console.error("[v0] Error loading user type:", err)
      } finally {
        setIsLoadingUserType(false)
      }
    }

    loadUserType()
  }, [])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedThumbnail(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()])
      setCurrentTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    if (!selectedFile) {
      setError("Por favor seleciona um ficheiro")
      setIsLoading(false)
      return
    }

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("file", selectedFile)
      if (selectedThumbnail) {
        formDataToSend.append("thumbnail", selectedThumbnail)
      }
      formDataToSend.append("title", formData.title)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("university", formData.university)
      formDataToSend.append("subject", formData.subject)
      formDataToSend.append("fileType", formData.fileType)
      formDataToSend.append("year", formData.year)
      formDataToSend.append("tags", JSON.stringify(tags))
      if (selectedApprovalTag) {
        formDataToSend.append("approvalTag", selectedApprovalTag)
      }

      const result = await uploadFile(formDataToSend)

      if (!result.success) {
        setError(result.error || "Erro ao carregar ficheiro")
        toast({
          title: "Erro",
          description: result.error || "Erro ao carregar ficheiro",
          variant: "destructive",
        })
        return
      }

      let successMessage = "Ficheiro carregado com sucesso!"
      if (result.userType === "professor") {
        successMessage = "Upload bem-sucedido! O teu documento está disponível."
      } else if (result.userType === "aluno" && result.professorName) {
        successMessage = `Upload enviado para aprovação de ${result.professorName}`
      } else if (result.userType === "pessoa_comum" && result.universityName) {
        successMessage = `Pedido enviado à ${result.universityName} com a tag ${selectedApprovalTag}`
      }

      setSuccess(successMessage)
      toast({
        title: "Sucesso!",
        description: successMessage,
      })

      setSelectedFile(null)
      setSelectedThumbnail(null)
      setThumbnailPreview(null)
      setSelectedApprovalTag("")
      setFormData({
        title: "",
        description: "",
        university: "",
        subject: "",
        fileType: "",
        year: "",
      })
      setTags([])
    } catch (err) {
      console.error("[v0] Upload error:", err)
      setError("Erro ao carregar ficheiro. Tenta novamente.")
      toast({
        title: "Erro",
        description: "Erro ao carregar ficheiro. Tenta novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return ImageIcon
    if (file.type.startsWith("video/")) return Video
    if (file.type.includes("zip") || file.type.includes("rar")) return Archive
    return FileText
  }

  useEffect(() => {
    async function loadUserAndTags() {
      if (!isLoadingUserType && userType !== "professor") {
        const profTags = await getProfessorTags()
        const uniTags = await getUniversityTags()
        setProfessorTags(profTags)
        setUniversityTags(uniTags)
      }
    }
    loadUserAndTags()
  }, [userType, isLoadingUserType])

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-secondary text-secondary-foreground">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? "border-primary bg-primary/5"
            : selectedFile
              ? "border-secondary bg-secondary/5"
              : "border-border hover:border-primary/50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              {(() => {
                const IconComponent = getFileIcon(selectedFile)
                return <IconComponent className="w-12 h-12 text-secondary" />
              })()}
            </div>
            <div>
              <p className="font-medium text-foreground">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => setSelectedFile(null)}>
              <X className="w-4 h-4 mr-2" />
              Remover
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
            <div>
              <p className="text-lg font-medium text-foreground mb-2">
                Arrasta o ficheiro aqui ou clica para selecionar
              </p>
              <p className="text-sm text-muted-foreground">Suporta PDF, DOC, PPT, imagens, vídeos (máx. 50MB)</p>
            </div>
            <input
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.mp4,.zip,.rar"
            />
            <Button type="button" variant="outline" asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                Selecionar Ficheiro
              </label>
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="thumbnail">Thumbnail (opcional)</Label>
        <p className="text-sm text-muted-foreground mb-2">Adiciona uma imagem de pré-visualização para o teu recurso</p>

        {thumbnailPreview ? (
          <div className="relative w-full h-48 border-2 border-border rounded-lg overflow-hidden">
            <Image src={thumbnailPreview || "/placeholder.svg"} alt="Thumbnail preview" fill className="object-cover" />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => {
                setSelectedThumbnail(null)
                setThumbnailPreview(null)
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
            <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">Clica para adicionar thumbnail</p>
            <input
              type="file"
              onChange={handleThumbnailSelect}
              className="hidden"
              id="thumbnail-upload"
              accept="image/*"
            />
            <Button type="button" variant="outline" size="sm" asChild>
              <label htmlFor="thumbnail-upload" className="cursor-pointer">
                Selecionar Imagem
              </label>
            </Button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            placeholder="Ex: Apontamentos de Cálculo I"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fileType">Tipo de Recurso *</Label>
          <Select onValueChange={(value) => setFormData({ ...formData, fileType: value })} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Seleciona o tipo" />
            </SelectTrigger>
            <SelectContent>
              {fileTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <type.icon className="w-4 h-4" />
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          placeholder="Descreve o conteúdo do ficheiro..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          disabled={isLoading}
          rows={3}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="university">Universidade *</Label>
          <Select onValueChange={(value) => setFormData({ ...formData, university: value })} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Universidade" />
            </SelectTrigger>
            <SelectContent>
              {universities.map((uni) => (
                <SelectItem key={uni} value={uni}>
                  {uni}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Disciplina *</Label>
          <Select onValueChange={(value) => setFormData({ ...formData, subject: value })} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Disciplina" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Ano Académico</Label>
          <Select onValueChange={(value) => setFormData({ ...formData, year: value })} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024/2025">2024/2025</SelectItem>
              <SelectItem value="2023/2024">2023/2024</SelectItem>
              <SelectItem value="2022/2023">2022/2023</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (opcional)</Label>
        <div className="flex gap-2">
          <Input
            id="tags"
            placeholder="Ex: matemática, derivadas..."
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            disabled={isLoading}
          />
          <Button type="button" variant="outline" onClick={addTag} disabled={isLoading}>
            Adicionar
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => removeTag(tag)} />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {!isLoadingUserType && userType !== "professor" && (
        <div className="space-y-2">
          <Label htmlFor="approvalTag">Tag de Aprovação (Alunos e Pessoas Comuns)</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Seleciona a tag do professor (alunos) ou universidade (pessoas comuns) para aprovação
          </p>
          <Popover open={showTagSelector} onOpenChange={setShowTagSelector}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between bg-transparent">
                {selectedApprovalTag || "Selecionar tag de aprovação..."}
                <Tag className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Procurar tag..." />
                <CommandList>
                  <CommandEmpty>Nenhuma tag encontrada.</CommandEmpty>
                  {professorTags.length > 0 && (
                    <CommandGroup heading="Tags de Professores">
                      {professorTags.map((prof) => (
                        <CommandItem
                          key={prof.id}
                          value={prof.tag_aprovacao}
                          onSelect={() => {
                            setSelectedApprovalTag(prof.tag_aprovacao)
                            setShowTagSelector(false)
                          }}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{prof.tag_aprovacao}</span>
                            <span className="text-sm text-muted-foreground">
                              {prof.nome_completo} - {prof.universidades?.nome}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                  {universityTags.length > 0 && (
                    <CommandGroup heading="Tags de Universidades">
                      {universityTags.map((uni) => (
                        <CommandItem
                          key={uni.id}
                          value={uni.nome}
                          onSelect={() => {
                            setSelectedApprovalTag(uni.nome)
                            setShowTagSelector(false)
                          }}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{uni.nome}</span>
                            <span className="text-sm text-muted-foreground">{uni.codigo}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {selectedApprovalTag && (
            <Badge variant="secondary" className="mt-2">
              Tag selecionada: {selectedApprovalTag}
              <X
                className="ml-2 w-3 h-3 cursor-pointer hover:text-destructive"
                onClick={() => setSelectedApprovalTag("")}
              />
            </Badge>
          )}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading || !selectedFile}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />A carregar...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Partilhar Recurso
          </>
        )}
      </Button>
    </form>
  )
}
