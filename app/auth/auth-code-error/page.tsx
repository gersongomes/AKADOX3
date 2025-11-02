import { Logo } from "@/components/ui/logo"
import Link from "next/link"

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center">
          <div className="mb-6">
            <Logo size="lg" href={null} className="justify-center text-slate-800" />
          </div>

          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro na Confirmação</h1>
          <p className="text-gray-600 mb-6">
            Houve um problema ao confirmar seu email. O link pode ter expirado ou já foi usado.
          </p>
          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full bg-cyan-600 text-white py-2 px-4 rounded-lg hover:bg-cyan-700 transition-colors"
            >
              Tentar Login Novamente
            </Link>
            <Link
              href="/register"
              className="block w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Criar Nova Conta
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
