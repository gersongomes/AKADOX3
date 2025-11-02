"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react"
import { signUp } from "@/lib/actions/auth"

const universities = [
  "Universidade de Santiago (US)",
  "Universidade de Cabo Verde (Uni-CV)",
  "Universidade Jean Piaget de Cabo Verde",
  "Instituto Superior de Ciências Económicas e Empresariais (ISCEE)",
  "Instituto Universitário de Arte, Tecnologia e Cultura (M_EIA)",
  "Universidade Lusófona de Cabo Verde",
]

const userTypes = [
  { value: "pessoa_comum", label: "Pessoa Comum" },
  { value: "aluno", label: "Aluno" },
  { value: "professor", label: "Professor/Orientador" },
  { value: "universidade", label: "Diretor/Universidade" },
  { value: "administrador_total", label: "Administrador Total" },
]

const courses = [
  "Engenharia Informática",
  "Gestão e Administração",
  "Direito",
  "Economia",
  "Psicologia",
  "Educação",
  "Medicina",
  "Enfermagem",
  "Arquitetura",
  "Engenharia Civil",
  "Comunicação Social",
  "Turismo",
]

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    university: "",
    course: "",
    year: "",
    userType: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError("As palavras-passe não coincidem")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("A palavra-passe deve ter pelo menos 6 caracteres")
      setIsLoading(false)
      return
    }

    if (!formData.name || !formData.email || !formData.university || !formData.userType) {
      setError("Por favor, preenche todos os campos obrigatórios")
      setIsLoading(false)
      return
    }

    try {
      console.log("[v0] Registration attempt:", formData)

      const result = await signUp({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        university: formData.university,
        course: formData.course,
        year: formData.year,
        userType: formData.userType,
      })

      if (result.error) {
        setError(result.error)
      } else {
        if (result.needsApproval) {
          setSuccess(
            `${result.message}\n\nEnquanto aguardas aprovação, podes explorar o repositório mas não poderás fazer upload de documentos.`,
          )
        } else {
          setSuccess(result.message || "Conta criada com sucesso!")
        }
        // Reset form on success
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          university: "",
          course: "",
          year: "",
          userType: "",
        })
      }
    } catch (err) {
      console.error("[v0] Registration error:", err)
      setError("Erro ao criar conta. Tenta novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const shouldShowAcademicFields =
    formData.userType &&
    formData.userType !== "pessoa_comum" &&
    formData.userType !== "universidade" &&
    formData.userType !== "administrador_total"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nome completo</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="O teu nome completo"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="teu.email@exemplo.com"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="userType">Tipo de Utilizador</Label>
        <Select onValueChange={(value) => handleSelectChange("userType", value)} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue placeholder="Seleciona o teu tipo de utilizador" />
          </SelectTrigger>
          <SelectContent>
            {userTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="university">Universidade</Label>
        <Select onValueChange={(value) => handleSelectChange("university", value)} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue placeholder="Seleciona a tua universidade" />
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

      {shouldShowAcademicFields && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="course">Curso</Label>
            <Select onValueChange={(value) => handleSelectChange("course", value)} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Curso" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course} value={course}>
                    {course}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Ano</Label>
            <Select onValueChange={(value) => handleSelectChange("year", value)} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1º Ano</SelectItem>
                <SelectItem value="2">2º Ano</SelectItem>
                <SelectItem value="3">3º Ano</SelectItem>
                <SelectItem value="4">4º Ano</SelectItem>
                <SelectItem value="5">5º Ano</SelectItem>
                <SelectItem value="mestrado">Mestrado</SelectItem>
                <SelectItem value="doutoramento">Doutoramento</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="password">Palavra-passe</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar palavra-passe</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={isLoading}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />A criar conta...
          </>
        ) : (
          "Criar Conta"
        )}
      </Button>
    </form>
  )
}
