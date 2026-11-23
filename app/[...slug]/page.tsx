import React, { cache } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  EstrategiaSeoHead,
  DEFAULT_SEO_STRATEGY_DATA,
  buildGuttenbergToc,
  buildTocHtml,
  parseHtmlToBlocks,
  slugifyHeadingId,
  stripHtmlTags,
  DEFAULT_TOC_CONFIG,
  type GuttenbergTocItem,
  type SeoCategoryType,
  type SeoStrategyData,
} from "@profesorjand/astro-components/react"
import "@profesorjand/astro-components/guttenberg.css"
import { API_BASE_URL } from "@/lib/auth"
import { CmsContentRenderer } from "@/components/cms/CmsContentRenderer"
import { CmsTableOfContents } from "@/components/cms/CmsTableOfContents"

const SITE_ORIGIN = "https://tatimonteroyoga.com"
const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/tatifoto.png`
const STATIC_ASSET_RE =
  /\.(ico|png|jpg|jpeg|gif|svg|webp|woff2?|ttf|eot|css|js|mjs|map|json|xml|txt|pdf|mp4|webm|mp3)$/i

interface DBTranslationPage {
  id: number
  article_id: number
  locale: string
  slug: string
  canonical_url: string
  title: string
  html_content: string
  seo_head_html?: string | null
  guttenberg_json?: string | null
  seo_data_json?: string | null
  created_at?: string
  updated_at?: string
}

interface DBArticleParent {
  id: number
  category: string
  default_locale: string
  status: "draft" | "published" | "archived"
  theme_css?: string | null
  full_seo_json?: string | null
  created_at?: string
  updated_at?: string
}

interface DBAvailableLocale {
  locale: string
  slug: string
  canonical_url: string
  title: string
}

interface PublicPageApiResponse {
  ok: boolean
  status?: string
  page?: DBTranslationPage
  article?: DBArticleParent
  available_locales?: DBAvailableLocale[]
}

interface DynamicPageProps {
  params: Promise<{ slug: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

function normalizePathSegments(segments: string[]): string {
  return segments
    .map((s) => decodeURIComponent(s).trim().replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/")
    .toLowerCase()
}

function toPathname(canonicalOrSlug: string): string {
  if (!canonicalOrSlug) return "/"
  try {
    if (/^https?:\/\//i.test(canonicalOrSlug)) {
      const parsed = new URL(canonicalOrSlug)
      const cleaned = parsed.pathname.replace(/\/+$/, "")
      return cleaned || "/"
    }
  } catch {
    // fallback below
  }
  const cleaned = canonicalOrSlug.replace(/^\/+|\/+$/g, "")
  return cleaned ? `/${cleaned}` : "/"
}

function normalizeCanonical(canonicalOrPath?: string | null, fallbackPath?: string): string {
  const raw = (canonicalOrPath || "").trim()
  if (raw && /^https?:\/\//i.test(raw)) {
    return raw.replace(/\/+$/, "")
  }
  const cleanPath = (raw || fallbackPath || "").replace(/^\/+|\/+$/g, "")
  return cleanPath ? `${SITE_ORIGIN}/${cleanPath}` : SITE_ORIGIN
}

function parseSeoData(rawJson?: string | null): Partial<SeoStrategyData> {
  if (!rawJson || !rawJson.trim()) return {}
  try {
    const parsed = JSON.parse(rawJson)
    if (parsed && typeof parsed === "object") {
      return parsed.data && typeof parsed.data === "object"
        ? (parsed.data as Partial<SeoStrategyData>)
        : (parsed as Partial<SeoStrategyData>)
    }
  } catch {
    // ignorar JSON malformado
  }
  return {}
}

function extractTitleFromHeadHtml(headHtml?: string | null): string {
  if (!headHtml) return ""
  const match = headHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  return match ? match[1].trim() : ""
}

function extractMetaDescriptionFromHeadHtml(headHtml?: string | null): string {
  if (!headHtml) return ""
  const match = headHtml.match(
    /<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i
  )
  if (match) return match[1].trim()
  const revMatch = headHtml.match(
    /<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i
  )
  return revMatch ? revMatch[1].trim() : ""
}

function extractJsonLdBlocks(headHtml?: string | null): string[] {
  if (!headHtml) return []
  const matches: string[] = []
  const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let m: RegExpExecArray | null
  while ((m = regex.exec(headHtml)) !== null) {
    const content = m[1]?.trim()
    if (content) matches.push(content)
  }
  return matches
}

function stripHtmlSnippet(html: string, maxLength = 158): string {
  const plain = (html || "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  if (!plain) return ""
  if (plain.length <= maxLength) return plain
  return `${plain.slice(0, maxLength - 3).trim()}...`
}

function toOgLocale(locale?: string): string {
  const norm = (locale || "es").toLowerCase()
  if (norm === "en" || norm.startsWith("en-")) return "en_US"
  if (norm === "pt" || norm.startsWith("pt-")) return "pt_BR"
  return "es_ES"
}

function mapSeoCategory(cat?: string): SeoCategoryType {
  if (
    cat === "news_blog" ||
    cat === "event" ||
    cat === "biography" ||
    cat === "spotify_top" ||
    cat === "guide"
  ) {
    return cat
  }
  return "guide"
}

const fetchCmsPage = cache(
  async (routePath: string, isPreview: boolean): Promise<PublicPageApiResponse | null> => {
    if (!routePath) return null
    const lastSegment = routePath.split("/").pop() || ""
    if (
      routePath.startsWith("_next") ||
      routePath.startsWith("api/") ||
      STATIC_ASSET_RE.test(lastSegment)
    ) {
      return null
    }

    const endpoint = `${API_BASE_URL}/articles/articles.php?path=${encodeURIComponent(routePath)}${
      isPreview ? "&preview=1" : ""
    }`

    try {
      const res = await fetch(endpoint, { cache: "no-store" })
      if (!res.ok) return null
      const json = (await res.json()) as PublicPageApiResponse
      if (!json.ok || !json.page) return null
      return json
    } catch (error) {
      console.error("[CMS] Error cargando página dinámica:", routePath, error)
      return null
    }
  }
)

export async function generateMetadata({
  params,
  searchParams,
}: DynamicPageProps): Promise<Metadata> {
  const { slug } = await params
  const resolvedSearchParams = await searchParams
  const routePath = normalizePathSegments(slug || [])
  const previewParam = resolvedSearchParams?.preview
  const isPreview = previewParam === "1" || previewParam === "true"

  const data = await fetchCmsPage(routePath, isPreview)
  if (!data || !data.page) {
    return {
      title: "Página no encontrada | Tati Montero Yoga",
      robots: { index: false, follow: false },
    }
  }

  const { page, article, available_locales = [] } = data
  const seoData = {
    ...parseSeoData(article?.full_seo_json),
    ...parseSeoData(page.seo_data_json),
  }

  const title =
    seoData.headline?.trim() ||
    extractTitleFromHeadHtml(page.seo_head_html) ||
    page.title ||
    "Tati Montero Yoga"

  const description =
    seoData.metaDescription?.trim() ||
    extractMetaDescriptionFromHeadHtml(page.seo_head_html) ||
    stripHtmlSnippet(page.html_content) ||
    "Yoga prenatal, bienestar y acompañamiento consciente con Tati Montero."

  const canonicalUrl = normalizeCanonical(page.canonical_url || seoData.canonicalUrl, routePath)
  const ogImage = seoData.mainImageUrl?.trim() || DEFAULT_OG_IMAGE
  const ogImageAlt = seoData.mainImageAlt?.trim() || title
  const isPublished = article?.status === "published" && !isPreview

  // Hreflang para versiones multi-idioma si hay más de 1 traducción
  const languages: Record<string, string> = {}
  if (available_locales.length > 1) {
    for (const loc of available_locales) {
      if (loc.locale && (loc.canonical_url || loc.slug)) {
        languages[loc.locale] = normalizeCanonical(loc.canonical_url, loc.slug)
      }
    }
    const defaultLoc =
      available_locales.find((l) => l.locale === article?.default_locale) ||
      available_locales[0]
    if (defaultLoc) {
      languages["x-default"] = normalizeCanonical(defaultLoc.canonical_url, defaultLoc.slug)
    }
  }

  const ogType: "article" | "profile" | "website" =
    article?.category === "biography"
      ? "profile"
      : article?.category === "news_blog" || article?.category === "guide"
      ? "article"
      : "website"

  return {
    title,
    description,
    keywords: seoData.targetKeyword ? [seoData.targetKeyword] : undefined,
    authors: [{ name: seoData.authorName?.trim() || "Tati Montero" }],
    robots: isPublished
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        }
      : {
          index: false,
          follow: false,
        },
    alternates: {
      canonical: canonicalUrl,
      ...(Object.keys(languages).length > 1 ? { languages } : {}),
    },
    openGraph: {
      type: ogType,
      title,
      description,
      url: canonicalUrl,
      siteName: seoData.publisherName?.trim() || "Tati Montero Yoga",
      locale: toOgLocale(page.locale),
      images: [
        {
          url: ogImage,
          width: seoData.mainImageWidth || 1200,
          height: seoData.mainImageHeight || 675,
          alt: ogImageAlt,
        },
      ],
      ...(ogType === "article"
        ? {
            publishedTime: seoData.datePublished || page.created_at || article?.created_at,
            modifiedTime: seoData.dateModified || page.updated_at || article?.updated_at,
            authors: [seoData.authorName?.trim() || "Tati Montero"],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  }
}

function extractArticleToc(
  guttenbergJson?: string | null,
  htmlContent?: string
): { toc: GuttenbergTocItem[]; tocHtml: string } {
  // 1. Intentar leer desde guttenberg_json guardado en BD (muy rápido)
  if (guttenbergJson && guttenbergJson.trim()) {
    try {
      const parsed = JSON.parse(guttenbergJson)
      const toc = Array.isArray(parsed?.toc) ? (parsed.toc as GuttenbergTocItem[]) : []
      const tocHtml = typeof parsed?.tocHtml === "string" ? parsed.tocHtml : ""
      if (toc.length > 0) {
        return {
          toc,
          tocHtml: tocHtml || buildTocHtml(toc, DEFAULT_TOC_CONFIG),
        }
      }
    } catch {
      // Si el JSON falla o es antiguo, pasamos al fallback por HTML
    }
  }

  // 2. Fallback: Parsear bloques desde el HTML para artículos creados antes de v1.4.0
  if (htmlContent && htmlContent.trim()) {
    try {
      const blocks = parseHtmlToBlocks(htmlContent)
      const toc = buildGuttenbergToc(blocks, DEFAULT_TOC_CONFIG)
      const tocHtml = buildTocHtml(toc, DEFAULT_TOC_CONFIG)
      return { toc, tocHtml }
    } catch {
      // fallback vacío
    }
  }

  return { toc: [], tocHtml: "" }
}

function ensureHeadingIds(html: string, toc: GuttenbergTocItem[]): string {
  if (!html || toc.length === 0) return html

  let tocIndex = 0
  return html.replace(
    /<(h[1-4])(\s+[^>]*)?>([\s\S]*?)<\/\1>/gi,
    (match, tag, attrs = "", innerText) => {
      // Si ya tiene un id, lo respetamos
      if (/\bid\s*=\s*["'][^"']+["']/i.test(attrs)) {
        return match
      }

      const plainText = stripHtmlTags(innerText).trim()
      let matchedItem = toc.find(
        (item) => item.text.trim().toLowerCase() === plainText.toLowerCase()
      )
      if (!matchedItem && tocIndex < toc.length) {
        if (toc[tocIndex].level === tag.toLowerCase()) {
          matchedItem = toc[tocIndex]
        }
      }
      const resolvedId = matchedItem?.id || slugifyHeadingId(plainText, tocIndex + 1)
      tocIndex++

      const cleanAttrs = attrs.trim() ? ` ${attrs.trim()}` : ""
      return `<${tag} id="${resolvedId}"${cleanAttrs}>${innerText}</${tag}>`
    }
  )
}

export default async function DynamicCmsPage({
  params,
  searchParams,
}: DynamicPageProps) {
  const { slug } = await params
  const resolvedSearchParams = await searchParams
  const routePath = normalizePathSegments(slug || [])
  const previewParam = resolvedSearchParams?.preview
  const isPreview = previewParam === "1" || previewParam === "true"

  const data = await fetchCmsPage(routePath, isPreview)
  if (!data || !data.page) {
    notFound()
  }

  const { page, article, available_locales = [] } = data
  const themeCss = (article?.theme_css || "").trim()
  const compactThemeCss = themeCss.replace(/\s+/g, " ")
  const isDefaultThemeCss =
    Boolean(themeCss) &&
    compactThemeCss.includes("--gt-color-primario: #2563eb;") &&
    compactThemeCss.includes("--gt-color-secundario: #0f172a;") &&
    compactThemeCss.includes("--gt-color-titulo: #0f172a;") &&
    compactThemeCss.includes("--gt-color-texto: #334155;") &&
    compactThemeCss.includes("--gt-color-fondo-cita: #f8fafc;") &&
    compactThemeCss.includes(".gt-h1 { font-size: 2.5rem; }") &&
    compactThemeCss.includes(".gt-p { margin-top: 0; color: var(--gt-color-texto); font-size: 1.0625rem;")
  const shouldInjectCustomThemeCss = Boolean(themeCss) && !isDefaultThemeCss
  const htmlContent = page.html_content || ""
  const hasH1InContent = /<h1[\s>]/i.test(htmlContent)
  const canonicalUrl = normalizeCanonical(page.canonical_url, routePath)

  // Extracción del Índice (TOC): desde guttenberg_json o cálculo en vivo
  const { toc, tocHtml } = extractArticleToc(page.guttenberg_json, htmlContent)
  const hasToc = toc.length >= 2
  const normalizedHtml = hasToc ? ensureHeadingIds(htmlContent, toc) : htmlContent

  // Separación en tablet/móvil para colocar el TOC justo antes del primer H2
  let beforeH2 = normalizedHtml
  let afterH2 = ""

  if (hasToc) {
    const firstH2Match = normalizedHtml.search(/<h2[\s>]/i)
    if (firstH2Match !== -1) {
      beforeH2 = normalizedHtml.slice(0, firstH2Match)
      afterH2 = normalizedHtml.slice(firstH2Match)
    } else {
      const firstHeadingMatch = normalizedHtml.search(/<h[2-4][\s>]/i)
      if (firstHeadingMatch !== -1) {
        beforeH2 = normalizedHtml.slice(0, firstHeadingMatch)
        afterH2 = normalizedHtml.slice(firstHeadingMatch)
      } else {
        beforeH2 = ""
        afterH2 = normalizedHtml
      }
    }
  }

  const parsedSeo = {
    ...parseSeoData(article?.full_seo_json),
    ...parseSeoData(page.seo_data_json),
  }

  const resolvedSeoForJsonLd: SeoStrategyData = {
    ...DEFAULT_SEO_STRATEGY_DATA,
    ...parsedSeo,
    category: mapSeoCategory(parsedSeo.category || article?.category),
    inLanguage: parsedSeo.inLanguage || page.locale || "es",
    headline: parsedSeo.headline?.trim() || page.title || "Tati Montero Yoga",
    metaDescription:
      parsedSeo.metaDescription?.trim() ||
      extractMetaDescriptionFromHeadHtml(page.seo_head_html) ||
      stripHtmlSnippet(htmlContent) ||
      "Yoga prenatal y acompañamiento consciente con Tati Montero.",
    canonicalUrl,
    authorName: parsedSeo.authorName?.trim() || "Tati Montero",
    publisherName: parsedSeo.publisherName?.trim() || "Tati Montero Yoga",
    mainImageUrl: parsedSeo.mainImageUrl?.trim() || DEFAULT_OG_IMAGE,
    mainImageAlt: parsedSeo.mainImageAlt?.trim() || page.title || "Tati Montero Yoga",
    datePublished: parsedSeo.datePublished || page.created_at || DEFAULT_SEO_STRATEGY_DATA.datePublished,
    dateModified: parsedSeo.dateModified || page.updated_at || DEFAULT_SEO_STRATEGY_DATA.dateModified,
  }

  const savedJsonLdBlocks = extractJsonLdBlocks(page.seo_head_html)
  const hasStructuredSeoData = Boolean(
    page.seo_data_json && page.seo_data_json.trim() && page.seo_data_json.trim() !== "[]"
  )

  return (
    <main className="min-h-[70vh]">
      {/* CSS personalizado del editor Guttenberg guardado en la BD (solo si difiere del tema base) */}
      {shouldInjectCustomThemeCss ? (
        <style id="cms-page-theme-css" dangerouslySetInnerHTML={{ __html: themeCss }} />
      ) : null}

      {/* Schema JSON-LD estructurado para Google Rich Results */}
      {hasStructuredSeoData ? (
        <EstrategiaSeoHead data={resolvedSeoForJsonLd} />
      ) : savedJsonLdBlocks.length > 0 ? (
        savedJsonLdBlocks.map((jsonBlock, idx) => (
          <script
            key={idx}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonBlock }}
          />
        ))
      ) : (
        <EstrategiaSeoHead data={resolvedSeoForJsonLd} />
      )}

      {/* Aviso si está en modo Preview de borrador */}
      {isPreview && article?.status !== "published" && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-xs py-2 px-4 text-center">
          Modo Vista Previa (estado actual: <strong>{article?.status || "draft"}</strong>). Esta
          página aún no está indexada públicamente.
        </div>
      )}

      <article
        className={`mx-auto px-4 sm:px-6 py-10 md:py-14 space-y-6 ${
          hasToc ? "max-w-6xl" : "max-w-4xl"
        }`}
      >
        {/* Selector de idioma si la página tiene múltiples traducciones */}
        {available_locales.length > 1 && (
          <nav
            aria-label="Idiomas disponibles"
            className="flex flex-wrap items-center justify-end gap-2 text-xs"
          >
            <span className="text-stone-500">Idioma:</span>
            {available_locales.map((loc) => {
              const targetHref = toPathname(loc.canonical_url || loc.slug)
              const isCurrent = loc.locale.toLowerCase() === (page.locale || "").toLowerCase()
              return (
                <Link
                  key={loc.locale}
                  href={`${targetHref}${isPreview ? "?preview=1" : ""}`}
                  hrefLang={loc.locale}
                  className={`px-2.5 py-1 rounded-full uppercase font-medium transition-colors ${
                    isCurrent
                      ? "bg-[#6d8f8a] text-white"
                      : "bg-[var(--color-crema)] text-stone-700 hover:bg-[#C47E63] hover:text-white"
                  }`}
                >
                  {loc.locale}
                </Link>
              )
            })}
          </nav>
        )}

        {/* Fallback H1 únicamente si el contenido HTML no incluye ya su propio H1 */}
        {!hasH1InContent && page.title ? (
          <header className="mb-6">
            <h1 className="text-3xl md:text-4xl font-light text-[#6d8f8a] leading-tight">
              {page.title}
            </h1>
          </header>
        ) : null}

        {/* Renderizado con Índice inteligente (Desktop Sidebar + Tablet Tarjeta + Móvil Acordeón) */}
        {hasToc ? (
          <div className="lg:grid lg:grid-cols-12 lg:gap-10 items-start">
            {/* Columna Principal de Contenido (8 columnas en desktop) */}
            <div className="lg:col-span-8 space-y-6 min-w-0">
              {/* Sección previa al primer H2 (introducción, párrafos iniciales, etc.) */}
              {beforeH2 && beforeH2.trim() ? (
                <CmsContentRenderer htmlContent={beforeH2} />
              ) : null}

              {/* Índice para Tablet y Móvil: posicionado justo antes del primer H2 */}
              <div className="lg:hidden my-6">
                {/* Tablet (768px a 1023px): Tarjeta destacada abierta */}
                <div className="hidden md:block">
                  <CmsTableOfContents
                    items={toc}
                    tocHtml={tocHtml}
                    variant="card"
                    title="Índice del contenido"
                  />
                </div>

                {/* Móvil (< 768px): Acordeón plegable para ahorrar scroll inicial */}
                <div className="block md:hidden">
                  <CmsTableOfContents
                    items={toc}
                    tocHtml={tocHtml}
                    variant="accordion"
                    title="Índice del contenido"
                  />
                </div>
              </div>

              {/* Resto del artículo comenzando desde el primer H2 */}
              {afterH2 && afterH2.trim() ? (
                <CmsContentRenderer htmlContent={afterH2} />
              ) : null}
            </div>

            {/* Columna lateral para PC / Desktop (4 columnas): Sidebar flotante y pegajoso */}
            <aside className="hidden lg:block lg:col-span-4 sticky top-28 self-start">
              <CmsTableOfContents
                items={toc}
                tocHtml={tocHtml}
                variant="sidebar"
                title="Índice de contenido"
              />
            </aside>
          </div>
        ) : (
          <section className="cms-page-body gap-6 flex flex-col">
            <CmsContentRenderer htmlContent={htmlContent} className="w-full" />
          </section>
        )}
      </article>
    </main>
  )
}

