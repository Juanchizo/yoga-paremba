"use client"

import React, { useState } from "react"
import { ChevronDown, List, BookOpen } from "lucide-react"
import type { GuttenbergTocItem } from "@profesorjand/astro-components/react"

export interface CmsTableOfContentsProps {
  /** Lista estructurada de elementos del índice generada por Guttenberg */
  items: GuttenbergTocItem[]
  /** HTML nativo del índice (<nav class="gt-toc">...</nav>) */
  tocHtml?: string
  /** Variante de visualización según dispositivo: "sidebar" (Desktop), "card" (Tablet), "accordion" (Móvil) */
  variant?: "sidebar" | "card" | "accordion"
  /** Título personalizado */
  title?: string
  /** Clases CSS adicionales */
  className?: string
}

export function CmsTableOfContents({
  items,
  tocHtml,
  variant = "sidebar",
  title = "Índice del contenido",
  className = "",
}: CmsTableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!items || items.length === 0) {
    return null
  }

  // Contenido compartido del Estilo 1 (Tati Montero Personalizado)
  const renderCustomTocList = () => (
    <nav aria-label="Tabla de contenidos personalizada" className="space-y-1.5">
      <ul className="space-y-1 text-xs">
        {items.map((item) => {
          const isH2 = item.level === "h2" || item.level === "h1"
          const isH3 = item.level === "h3"
          const isH4 = item.level === "h4"

          const paddingClass = isH4 ? "pl-6 text-[11px]" : isH3 ? "pl-3 text-[12px]" : "pl-0 text-xs font-medium"

          return (
            <li key={item.id} className={`${paddingClass} transition-colors`}>
              <a
                href={`#${item.id}`}
                className="group flex items-baseline gap-1.5 py-1 text-stone-700 hover:text-[#c47e63] transition-colors leading-relaxed"
              >
                <span className="font-mono font-semibold text-[#c47e63] text-[11px] shrink-0 select-none">
                  {item.number}
                </span>
                <span className="group-hover:underline decoration-[#c47e63]/40 underline-offset-2">
                  {item.text}
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )

  // Contenido compartido del Estilo 2 (HTML nativo de Guttenberg con clases .gt-toc)
  const renderNativeToc = () => {
    if (!tocHtml) return null
    return (
      <div className="pt-4 mt-4 border-t border-stone-200/80">
        <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1">
          <BookOpen className="w-3 h-3 text-stone-400" />
          <span>Vista nativa Guttenberg (.gt-toc)</span>
        </div>
        <div
          className="gt-toc-native-wrapper text-xs"
          dangerouslySetInnerHTML={{ __html: tocHtml }}
        />
      </div>
    )
  }

  // =========================================================================
  // VARIANTE 1: SIDEBAR (Para PC / Desktop >= 1024px)
  // =========================================================================
  if (variant === "sidebar") {
    return (
      <div
        className={`bg-[var(--color-crema)]/40 border border-[#c47e63]/25 rounded-2xl p-5 shadow-xs backdrop-blur-xs max-h-[calc(100vh-8rem)] overflow-y-auto ${className}`}
      >
        <div className="flex items-center gap-2 pb-3 mb-3 border-b border-[#c47e63]/20">
          <List className="w-4 h-4 text-[#c47e63]" />
          <h2 className="text-sm font-semibold text-[#6d8f8a] uppercase tracking-wide">
            {title}
          </h2>
        </div>

        {/* Estilo 1: Personalizado */}
        {renderCustomTocList()}

        {/* Estilo 2: Nativo Guttenberg debajo */}
        {renderNativeToc()}
      </div>
    )
  }

  // =========================================================================
  // VARIANTE 2: TARJETA DESTACADA (Para Tablet 768px - 1023px)
  // =========================================================================
  if (variant === "card") {
    return (
      <div
        className={`my-8 bg-[var(--color-crema)]/50 border border-[#c47e63]/30 rounded-2xl p-6 shadow-xs ${className}`}
      >
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#c47e63]/20">
          <List className="w-4 h-4 text-[#c47e63]" />
          <h2 className="text-base font-semibold text-[#6d8f8a]">
            {title}
          </h2>
          <span className="text-[11px] text-stone-500 font-mono ml-auto">
            {items.length} secciones
          </span>
        </div>

        {/* Estilo 1: Personalizado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
          {renderCustomTocList()}
        </div>

        {/* Estilo 2: Nativo Guttenberg debajo */}
        {renderNativeToc()}
      </div>
    )
  }

  // =========================================================================
  // VARIANTE 3: ACORDEÓN PLEGABLE (Para Móvil < 768px)
  // =========================================================================
  return (
    <div
      className={`my-6 bg-[var(--color-crema)]/40 border border-[#c47e63]/30 rounded-xl overflow-hidden shadow-xs ${className}`}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left cursor-pointer transition-colors hover:bg-[var(--color-crema)]/60"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <List className="w-4 h-4 text-[#c47e63]" />
          <span className="text-xs font-semibold text-[#6d8f8a] uppercase tracking-wide">
            {title}
          </span>
          <span className="text-[11px] text-stone-500 font-mono">
            ({items.length})
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-[#c47e63] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="p-4 pt-1 border-t border-[#c47e63]/15 space-y-4 animate-in fade-in duration-150">
          {/* Estilo 1: Personalizado */}
          {renderCustomTocList()}

          {/* Estilo 2: Nativo Guttenberg debajo */}
          {renderNativeToc()}
        </div>
      )}
    </div>
  )
}

export default CmsTableOfContents
