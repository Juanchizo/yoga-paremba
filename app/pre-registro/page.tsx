"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function PreRegistroRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/acceso")
  }, [router])

  return (
    <div className="flex items-center justify-center py-24 text-stone-500 text-sm font-light">
      Redirigiendo a Acceso...
    </div>
  )
}
