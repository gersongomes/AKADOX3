import { LoginForm } from "@/components/auth/login-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Logo } from "@/components/ui/logo"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, #0f1419 0%, #1a2332 50%, #0f1419 100%)",
      }}
    >
      <div className="particles">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${8 + Math.random() * 6}s`,
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex flex-col items-center gap-4 mb-6">
            <Logo size="xl" className="text-white" />
          </div>
        </div>

        <Card
          className="rounded-3xl overflow-hidden border-0 shadow-2xl"
          style={{
            background: "rgba(30, 41, 59, 0.9)",
            backdropFilter: "blur(10px)",
          }}
        >
          <CardHeader className="text-center pb-6 pt-8">
            <CardTitle className="font-sans font-bold text-2xl text-white">Entrar</CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <LoginForm />

            <div className="flex items-center justify-between mt-6 mb-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  className="border-slate-600 data-[state=checked]:bg-cyan-400 data-[state=checked]:text-slate-900"
                />
                <label htmlFor="remember" className="text-sm text-slate-300">
                  Lembrar-me
                </label>
              </div>
              <Link href="/forgot-password" className="text-sm text-cyan-400 hover:text-cyan-300">
                Esqueceu a senha?
              </Link>
            </div>

            <div className="text-center space-y-4">
              <p className="text-sm text-slate-400">
                Ganhe seus primeiros pontos <br />
                ao completar seu perfil! 🎮
              </p>
              <p className="text-sm text-slate-400">
                Não tens conta?{" "}
                <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-medium underline">
                  Registar
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
