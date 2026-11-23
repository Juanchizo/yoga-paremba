"use client"

import React, { useCallback, useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { ChevronLeft, ChevronRight } from "lucide-react"

export interface CmsSliderProps {
  /** Lista de URLs separadas por coma o JSON array: "/img1.jpg, /img2.jpg" */
  images?: string
  /** Textos alternativos separados por coma: "Foto 1, Foto 2" */
  alts?: string
  /** Activar reproducción automática: "true", "false", o milisegundos (ej: "3500") */
  autoplay?: string | boolean
  /** Relación de aspecto o altura: "video" (16/9), "square" (1/1), "tall" (4/5) o "auto" */
  aspect?: "video" | "square" | "tall" | "auto"
  /** Clases CSS adicionales */
  className?: string
  /** Elementos hijos opcionales si se colocan directamente dentro del tag en HTML */
  children?: React.ReactNode
}

export default function CmsSlider({
  images,
  alts,
  autoplay = "false",
  aspect = "video",
  className = "",
  children,
}: CmsSliderProps) {
  const isAutoplayActive =
    autoplay === true || autoplay === "true" || (!Number.isNaN(Number(autoplay)) && Number(autoplay) > 0)
  const autoplayDelay =
    typeof autoplay === "string" && !Number.isNaN(Number(autoplay)) && Number(autoplay) > 0
      ? Number(autoplay)
      : 4000

  const plugins = isAutoplayActive
    ? [Autoplay({ delay: autoplayDelay, stopOnInteraction: false, stopOnMouseEnter: true })]
    : []

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" }, plugins)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    setScrollSnaps(emblaApi.scrollSnapList())
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi, onSelect])

  // Parsear lista de imágenes si viene por atributo
  let imageList: string[] = []
  if (images && typeof images === "string") {
    const trimmed = images.trim()
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) imageList = parsed
      } catch {
        imageList = trimmed.slice(1, -1).split(",").map((s) => s.trim().replace(/^['"]|['"]$/g, ""))
      }
    } else {
      imageList = trimmed.split(",").map((s) => s.trim()).filter(Boolean)
    }
  }

  const altList: string[] = alts ? alts.split(",").map((s) => s.trim()) : []

  // Si no hay imágenes por atributo ni hijos directos, mostrar placeholder instructivo
  const hasSlides = imageList.length > 0 || React.Children.count(children) > 0
  if (!hasSlides) {
    return (
      <div className="w-full my-6 p-6 rounded-2xl border-2 border-dashed border-[#c47e63]/40 bg-[var(--color-crema)]/40 text-center text-xs text-stone-600 space-y-1">
        <p className="font-medium text-[#c47e63]">Componente &lt;Slider&gt; detectado</p>
        <p className="text-[11px] text-stone-500">
          Uso en HTML: <code>&lt;slider images=&quot;/foto1.jpg, /foto2.jpg&quot; autoplay=&quot;true&quot;&gt;&lt;/slider&gt;</code>
        </p>
      </div>
    )
  }

  const aspectClass =
    aspect === "square"
      ? "aspect-square"
      : aspect === "tall"
      ? "aspect-[4/5]"
      : aspect === "auto"
      ? ""
      : "aspect-[16/9]"

  return (
    <div className={`relative w-full my-6 select-none group ${className}`}>
      {/* Contenedor del carrusel Embla */}
      <div ref={emblaRef} className="overflow-hidden rounded-2xl shadow-sm bg-stone-100">
        <div className="flex">
          {imageList.length > 0
            ? imageList.map((src, idx) => (
                <div key={idx} className="relative flex-[0_0_100%] min-w-0">
                  <div className={`w-full overflow-hidden ${aspectClass}`}>
                    <img
                      src={src}
                      alt={altList[idx] || `Diapositiva ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading={idx === 0 ? "eager" : "lazy"}
                    />
                  </div>
                </div>
              ))
            : React.Children.map(children, (child, idx) => (
                <div key={idx} className="flex-[0_0_100%] min-w-0">
                  {child}
                </div>
              ))}
        </div>
      </div>

      {/* Flechas de navegación */}
      <button
        type="button"
        onClick={scrollPrev}
        aria-label="Anterior"
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#c47e63] shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={scrollNext}
        aria-label="Siguiente"
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#c47e63] shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Puntos de paginación (Dots) */}
      {scrollSnaps.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {scrollSnaps.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollTo(idx)}
              aria-label={`Ir a diapositiva ${idx + 1}`}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                selectedIndex === idx
                  ? "w-6 bg-[#c47e63]"
                  : "w-2 bg-[#6d8f8a]/30 hover:bg-[#6d8f8a]/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

