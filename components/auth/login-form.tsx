"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2, User, Lock } from "lucide-react"
import { signIn, resendConfirmation } from "@/lib/actions/auth"
import { useRouter } from "next/navigation"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const [pendingEmail, setPendingEmail] = useState("")
  const [isResending, setIsResending] = useState(false)
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setNeedsConfirmation(false)

    try {
      console.log("[v0] Login attempt:", formData)

      const result = await signIn(formData.email, formData.password)

      if (result?.error) {
        setError(result.error)
        if (result.needsConfirmation) {
          setNeedsConfirmation(true)
          setPendingEmail(result.email || formData.email)
        }
      } else if (result?.success) {
        const redirectUrl =
          result.userType === "diretor" || result.userType === "universidade" ? "/dashboard/diretor" : "/dashboard"
        router.push(redirectUrl)
      }
    } catch (err) {
      console.error("[v0] Login error:", err)
      setError("Erro ao fazer login. Tenta novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    setIsResending(true)
    setError("")

    try {
      const result = await resendConfirmation(pendingEmail)

      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setError("")
        setNeedsConfirmation(false)
        setError("Email de confirmação reenviado! Verifica a tua caixa de entrada.")
      }
    } catch (err) {
      console.error("[v0] Resend confirmation error:", err)
      setError("Erro ao reenviar email de confirmação.")
    } finally {
      setIsResending(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert
          variant={error.includes("reenviado") ? "default" : "destructive"}
          className="border-white/20 bg-white/10 backdrop-blur-sm"
        >
          <AlertDescription className="text-white">{error}</AlertDescription>
        </Alert>
      )}

      {needsConfirmation && (
        <Alert className="border-white/20 bg-white/10 backdrop-blur-sm">
          <AlertDescription className="space-y-3 text-white">
            <p>O teu email ainda não foi confirmado. Verifica a tua caixa de entrada e clica no link de confirmação.</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResendConfirmation}
              disabled={isResending}
              className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />A reenviar...
                </>
              ) : (
                "Reenviar Email de Confirmação"
              )}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <div className="relative">
          <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Email ou usuário"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="pl-12 h-14 rounded-xl text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400 border-slate-600"
            style={{
              background: "rgba(15, 23, 42, 0.8)",
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Senha"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="pl-12 pr-12 h-14 rounded-xl text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400 border-slate-600"
            style={{
              background: "rgba(15, 23, 42, 0.8)",
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 h-auto p-0 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? <EyeOff className="h-5 w-5 text-cyan-400" /> : <Eye className="h-5 w-5 text-cyan-400" />}
          </Button>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full h-14 font-semibold text-lg rounded-xl border-0 text-slate-900 shadow-lg hover:opacity-90"
        disabled={isLoading}
        style={{
          background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
        }}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />A entrar...
          </>
        ) : (
          "Entrar"
        )}
      </Button>
    </form>
  )
}
