"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function EditorRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/dashboard?tab=editor")
  }, [router])

  return (
    <div className="flex items-center justify-center py-24 text-stone-500 text-sm font-light">
      Abriendo Editor dentro de tu Panel...
    </div>
  )
}
