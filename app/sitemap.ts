import type { MetadataRoute } from "next"
import { API_BASE_URL } from "@/lib/auth"

const SITE_ORIGIN = "https://tatimonteroyoga.com"

interface SitemapTranslationItem {
  locale: string
  slug: string
  canonical_url: string
  title?: string
  updated_at?: string
}

interface SitemapArticleGroup {
  article_id: number
  category?: string
  default_locale?: string
  updated_at?: string
  translations?: SitemapTranslationItem[]
}

function normalizeUrl(rawCanonical?: string, slug?: string): string {
  const val = (rawCanonical || "").trim()
  if (val && /^https?:\/\//i.test(val)) {
    return val.replace(/\/+$/, "")
  }
  const clean = (val || slug || "").replace(/^\/+|\/+$/g, "")
  return clean ? `${SITE_ORIGIN}/${clean}` : SITE_ORIGIN
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: SITE_ORIGIN,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_ORIGIN}/yoga-embarazadas`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_ORIGIN}/guia-embarazadas`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${SITE_ORIGIN}/pre-registro`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_ORIGIN}/politicas`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_ORIGIN}/terminos`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]

  const seenUrls = new Set<string>(staticEntries.map((item) => item.url))
  const dynamicEntries: MetadataRoute.Sitemap = []

  try {
    const res = await fetch(`${API_BASE_URL}/articles/articles.php?sitemap=1`, {
      next: { revalidate: 300 },
    })

    if (res.ok) {
      const json = (await res.json()) as {
        ok?: boolean
        articles?: SitemapArticleGroup[]
      }

      const articles = Array.isArray(json.articles) ? json.articles : []

      for (const art of articles) {
        const translations = Array.isArray(art.translations) ? art.translations : []
        if (translations.length === 0) continue

        const languages: Record<string, string> = {}
        if (translations.length > 1) {
          for (const tr of translations) {
            if (tr.locale) {
              languages[tr.locale] = normalizeUrl(tr.canonical_url, tr.slug)
            }
          }
          const defaultTr =
            translations.find((t) => t.locale === art.default_locale) || translations[0]
          if (defaultTr) {
            languages["x-default"] = normalizeUrl(defaultTr.canonical_url, defaultTr.slug)
          }
        }

        for (const tr of translations) {
          const url = normalizeUrl(tr.canonical_url, tr.slug)
          if (!url || seenUrls.has(url)) continue
          seenUrls.add(url)

          const rawDate = tr.updated_at || art.updated_at
          const parsedDate = rawDate ? new Date(rawDate) : now
          const lastModified = Number.isNaN(parsedDate.getTime()) ? now : parsedDate

          dynamicEntries.push({
            url,
            lastModified,
            changeFrequency: "weekly",
            priority: 0.8,
            ...(Object.keys(languages).length > 1
              ? { alternates: { languages } }
              : {}),
          })
        }
      }
    }
  } catch (error) {
    console.warn("[Sitemap] No se pudieron cargar rutas dinámicas desde la API PHP:", error)
  }

  return [...staticEntries, ...dynamicEntries]
}

