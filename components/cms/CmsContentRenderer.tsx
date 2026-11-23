import React from "react"
import dynamic from "next/dynamic"
import HTMLReactParser, {
  Element,
  domToReact,
  attributesToProps,
  type HTMLReactParserOptions,
} from "html-react-parser"
import { HtmlViewerGuttenberg } from "@profesorjand/astro-components/react"

// ============================================================================
// REGISTRO DE COMPONENTES INTERACTIVOS CMS (CARGA DINÁMICA / LAZY LOADING)
// ============================================================================
// Cada componente se descarga en el navegador SOLO si la página contiene su etiqueta.
// Si un artículo no tiene <slider>, el navegador descarga 0 KB del slider.
// ============================================================================
export const CMS_COMPONENTS: Record<string, React.ComponentType<any>> = {
  slider: dynamic(() => import("./CmsSlider"), {
    loading: () => (
      <div className="w-full h-48 bg-stone-100/70 border border-stone-200 rounded-2xl flex items-center justify-center text-xs text-stone-400 animate-pulse my-4">
        Cargando carrusel...
      </div>
    ),
  }),
  carousel: dynamic(() => import("./CmsSlider"), {
    loading: () => (
      <div className="w-full h-48 bg-stone-100/70 border border-stone-200 rounded-2xl flex items-center justify-center text-xs text-stone-400 animate-pulse my-4">
        Cargando carrusel...
      </div>
    ),
  }),
  // Puedes añadir más componentes aquí en el futuro:
  // formulario: dynamic(() => import("@/components/MiFormulario")),
}

export interface CmsContentRendererProps {
  htmlContent: string
  className?: string
}

export function CmsContentRenderer({
  htmlContent,
  className = "w-full",
}: CmsContentRendererProps) {
  if (!htmlContent || !htmlContent.trim()) {
    return null
  }

  // 1. Verificación ultra-rápida:
  // Si no contiene ninguna de las etiquetas de componentes registrados,
  // renderizamos directamente con HtmlViewerGuttenberg sin pasar por el parser.
  const lowerHtml = htmlContent.toLowerCase()
  const registeredTags = Object.keys(CMS_COMPONENTS)
  const hasInteractiveComponents = registeredTags.some((tag) => lowerHtml.includes(`<${tag}`))

  if (!hasInteractiveComponents) {
    return (
      <HtmlViewerGuttenberg
        data={htmlContent}
        injectThemeCss={false}
        className={className}
      />
    )
  }

  // 2. Si contiene algún componente interactivo (<slider>, <carousel>, etc.):
  // Usamos el parser para reemplazar la etiqueta HTML por el componente React real.
  const options: HTMLReactParserOptions = {
    replace(domNode) {
      if (domNode instanceof Element) {
        const tagName = domNode.name.toLowerCase()
        const Component = CMS_COMPONENTS[tagName]

        if (Component) {
          const props = attributesToProps(domNode.attribs || {})
          const children =
            domNode.children && domNode.children.length > 0
              ? domToReact(domNode.children as any, options)
              : undefined

          return <Component {...props}>{children}</Component>
        }
      }
    },
  }

  const parsedContent = HTMLReactParser(htmlContent, options)

  return (
    <div className={`pj-guttenberg-viewer ${className}`}>
      {parsedContent}
    </div>
  )
}

export default CmsContentRenderer

