import { updateSession } from "@/lib/supabase/middleware"
import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Update session first
  const response = await updateSession(request)

  // Handle dashboard routing based on user type
  if (request.nextUrl.pathname === "/dashboard") {
    try {
      const supabase = await createServerClient()
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
          switch (profile.tipo_usuario) {
            case "admin":
              return NextResponse.redirect(new URL("/dashboard/admin", request.url))
            case "professor":
              return NextResponse.redirect(new URL("/dashboard/professor", request.url))
            case "diretor":
              return NextResponse.redirect(new URL("/dashboard/diretor", request.url))
            case "aluno":
            case "pessoa_comum":
            default:
              return NextResponse.redirect(new URL("/dashboard/aluno", request.url))
          }
        }
      }
    } catch (error) {
      console.error("[v0] Middleware error:", error)
    }
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
