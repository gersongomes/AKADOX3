import { RegisterForm } from "@/components/auth/register-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/ui/logo"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Logo size="lg" />
            <div>
              <p className="text-sm text-muted-foreground">Plataforma Académica</p>
            </div>
          </div>
        </div>

        <Card className="border-border">
          <CardHeader className="text-center">
            <CardTitle className="font-serif font-bold text-2xl">Criar conta</CardTitle>
            <CardDescription>Junta-te à comunidade académica de Cabo Verde</CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground">
                Já tens conta?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Entra aqui
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
