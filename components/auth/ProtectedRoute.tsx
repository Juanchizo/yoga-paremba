"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthUser, getStoredUser, hasPermission, refreshUserFromDB } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldAlert, Loader2, ArrowLeft } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermission?: string
}

export default function ProtectedRoute({ children, requiredPermission }: ProtectedRouteProps) {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let mounted = true

    async function verifyAccess() {
      const localUser = getStoredUser()
      if (!localUser) {
        if (mounted) {
          setUser(null)
          setChecking(false)
        }
        return
      }

      // Mostrar de inmediato si ya está en caché y sincronizar con BD en segundo plano
      if (mounted) {
        setUser(localUser)
      }

      const freshUser = await refreshUserFromDB(localUser.email)
      if (mounted) {
        setUser(freshUser)
        setChecking(false)
      }
    }

    verifyAccess()

    function onAuthChange() {
      if (mounted) {
        setUser(getStoredUser())
      }
    }

    window.addEventListener("authChange", onAuthChange)
    return () => {
      mounted = false
      window.removeEventListener("authChange", onAuthChange)
    }
  }, [])

  if (checking && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-stone-500">
        <Loader2 className="w-7 h-7 animate-spin text-[#C47E63]" />
        <p className="text-sm font-light">Verificando permisos en la base de datos...</p>
      </div>
    )
  }

  // No ha iniciado sesión
  if (!user) {
    return (
      <div className="flex items-center justify-center py-14 px-4 min-h-[65vh]">
        <Card className="w-full max-w-md shadow-md border-[#C47E63]/20 bg-[var(--color-crema)] text-center p-6">
          <CardHeader>
            <div className="w-14 h-14 bg-[#C47E63]/15 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-7 h-7 text-[#C47E63]" />
            </div>
            <CardTitle className="text-xl font-light text-[#C47E63]">Inicia sesión para continuar</CardTitle>
            <CardDescription className="text-stone-600">
              Necesitas acceder con tu correo electrónico o Google para ver esta sección.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            <Button
              onClick={() => router.push("/acceso")}
              className="w-full !bg-[#C47E63] hover:opacity-90"
            >
              Ir a Acceso
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="w-full border-stone-300 text-stone-600"
            >
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Verificar si requiere un permiso específico y no lo posee
  if (requiredPermission && !hasPermission(user, requiredPermission)) {
    return (
      <div className="flex items-center justify-center py-14 px-4 min-h-[65vh]">
        <Card className="w-full max-w-md shadow-md border-red-200 bg-[var(--color-crema)] text-center p-6">
          <CardHeader>
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-7 h-7 text-red-600" />
            </div>
            <CardTitle className="text-xl font-light text-red-700">Acceso Restringido</CardTitle>
            <CardDescription className="text-stone-600">
              Tu cuenta (<strong className="text-stone-800">{user.email}</strong>) tiene el rol de{" "}
              <span className="font-medium text-[#C47E63]">{user.rol?.nombre || "Estudiante"}</span> y no cuenta con el permiso{" "}
              <code className="bg-stone-200/70 px-1.5 py-0.5 rounded text-xs">{requiredPermission}</code>.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Button
              onClick={() => router.push("/")}
              className="w-full !bg-[#C47E63] hover:opacity-90 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}

