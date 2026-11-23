"use client"

import React, { useEffect, useState, useCallback } from "react"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import {
  AuthUser,
  API_BASE_URL,
  getStoredUser,
  hasPermission,
  refreshUserFromDB,
} from "@/lib/auth"
import {
  HtmlEditorGuttenberg,
  htmlGuttenbergContent,
  setHtmlGuttenbergContent,
  setDataGuttenbergContent,
  EstrategiaSeo,
  seoStrategyContent,
  setSeoStrategyContent,
  buildFullSeoStrategyOutput,
  DEFAULT_SEO_STRATEGY_DATA,
  type SeoCategoryType,
  type SeoStrategyData,
} from "@profesorjand/astro-components/react"
import "@profesorjand/astro-components/guttenberg.css"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  User,
  FileEdit,
  Users,
  ShieldCheck,
  Search,
  RefreshCw,
  CheckCircle2,
  Lock,
  Sparkles,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Plus,
  Save,
  Upload,
  Trash2,
  FileText,
  Code2,
  X,
  Globe,
  ExternalLink,
} from "lucide-react"

interface DBUserRow {
  id: number
  email: string
  rol_id: number
  rol_clave: string
  rol_nombre: string
  metodo_registro: string
  nombre: string | null
  apellido: string | null
  fecha_nacimiento: string | null
  pais: string | null
  whatsapp: string | null
  estado_concepcion: string | null
  fecha_concepcion: string | null
  registro_completo: number
  ultimo_acceso: string | null
  created_at: string
}

interface DBRole {
  id: number
  clave: string
  nombre: string
  descripcion: string
}

interface DBPermiso {
  id: number
  clave: string
  nombre: string
  descripcion: string
  modulo: string
  exclusivo_super_admin: number
}

interface DBAsignacion {
  rol_id: number
  permiso_id: number
}

interface DBArticleItem {
  id: number
  category: string
  default_locale: string
  status: "draft" | "published" | "archived"
  updated_at: string
  created_at: string
  locale: string
  slug: string
  canonical_url: string
  title: string
}

type DashboardTab = "resumen" | "editor" | "usuarios" | "permisos"

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [activeTab, setActiveTab] = useState<DashboardTab>("resumen")
  const [statusBanner, setStatusBanner] = useState<{ type: "ok" | "err"; text: string } | null>(null)

  // Estados para Gestión de Usuarios (Super Admin)
  const [usuariosList, setUsuariosList] = useState<DBUserRow[]>([])
  const [rolesList, setRolesList] = useState<DBRole[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null)

  // Estados para Matriz de Roles y Permisos (Super Admin)
  const [permisosList, setPermisosList] = useState<DBPermiso[]>([])
  const [asignaciones, setAsignaciones] = useState<DBAsignacion[]>([])
  const [loadingMatrix, setLoadingMatrix] = useState(false)
  const [togglingCell, setTogglingCell] = useState<string | null>(null)

  // Estados para Artículos, Rutas Canónicas y Editor Guttenberg + SEO
  const [articlesList, setArticlesList] = useState<DBArticleItem[]>([])
  const [loadingArticles, setLoadingArticles] = useState(false)
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null)
  const [articleTitle, setArticleTitle] = useState("")
  const [articleSlug, setArticleSlug] = useState("")
  const [articleLocale, setArticleLocale] = useState("es")
  const [articleMetaDescription, setArticleMetaDescription] = useState("")
  const [articleCategory, setArticleCategory] = useState("guide")
  const [articleStatus, setArticleStatus] = useState<"draft" | "published" | "archived">("published")
  const [editorSubTab, setEditorSubTab] = useState<"visual" | "seo">("visual")
  const [seoScore, setSeoScore] = useState<number>(0)
  const [savingArticle, setSavingArticle] = useState(false)
  const [deletingArticle, setDeletingArticle] = useState(false)
  const [showImportHtmlModal, setShowImportHtmlModal] = useState(false)
  const [rawHtmlToImport, setRawHtmlToImport] = useState("")

  // Sincronizar usuario actual y revisar si viene ?tab=editor
  useEffect(() => {
    const stored = getStoredUser()
    setUser(stored)

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const tabParam = params.get("tab") as DashboardTab | null
      if (tabParam && ["resumen", "editor", "usuarios", "permisos"].includes(tabParam)) {
        setActiveTab(tabParam)
      }
    }

    if (stored?.email) {
      refreshUserFromDB(stored.email).then((fresh) => {
        if (fresh) setUser(fresh)
      })
    }

    function handleAuthUpdate() {
      setUser(getStoredUser())
    }
    window.addEventListener("authChange", handleAuthUpdate)
    return () => window.removeEventListener("authChange", handleAuthUpdate)
  }, [])

  const canUseEditor = hasPermission(user, "acceso_editor")
  const canManageUsers = hasPermission(user, "gestionar_usuarios")
  const canManageRoles = hasPermission(user, "gestionar_roles")

  // Cargar lista de usuarios cuando se abre la pestaña 'usuarios'
  const fetchUsuarios = useCallback(async () => {
    if (!user?.email) return
    setLoadingUsers(true)
    setStatusBanner(null)
    try {
      const res = await fetch(
        `${API_BASE_URL}/admin_usuarios.php?solicitante=${encodeURIComponent(user.email)}`
      )
      const data = await res.json()
      if (data.status === "success") {
        setUsuariosList(data.usuarios || [])
        setRolesList(data.roles || [])
      } else {
        setStatusBanner({ type: "err", text: data.message || "No se pudo cargar la lista de usuarios." })
      }
    } catch (e) {
      console.error(e)
      setStatusBanner({ type: "err", text: "Error de conexión al cargar usuarios." })
    } finally {
      setLoadingUsers(false)
    }
  }, [user?.email])

  // Cargar matriz de roles y permisos cuando se abre la pestaña 'permisos'
  const fetchMatrizPermisos = useCallback(async () => {
    if (!user?.email) return
    setLoadingMatrix(true)
    setStatusBanner(null)
    try {
      const res = await fetch(
        `${API_BASE_URL}/admin_roles.php?solicitante=${encodeURIComponent(user.email)}`
      )
      const data = await res.json()
      if (data.status === "success") {
        setRolesList(data.roles || [])
        setPermisosList(data.permisos || [])
        setAsignaciones(data.asignaciones || [])
      } else {
        setStatusBanner({ type: "err", text: data.message || "No se pudo cargar la matriz de permisos." })
      }
    } catch (e) {
      console.error(e)
      setStatusBanner({ type: "err", text: "Error de conexión al cargar permisos." })
    } finally {
      setLoadingMatrix(false)
    }
  }, [user?.email])

  // Cargar lista de artículos para el editor Guttenberg
  const fetchArticles = useCallback(async () => {
    setLoadingArticles(true)
    try {
      const res = await fetch(`${API_BASE_URL}/articles/articles.php`)
      const data = await res.json()
      if (data.ok && Array.isArray(data.articles)) {
        setArticlesList(data.articles)
      }
    } catch (e) {
      console.error("Error al cargar artículos:", e)
    } finally {
      setLoadingArticles(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === "editor" && canUseEditor) {
      fetchArticles()
    } else if (activeTab === "usuarios" && hasPermission(user, "gestionar_usuarios")) {
      fetchUsuarios()
    } else if (activeTab === "permisos" && hasPermission(user, "gestionar_roles")) {
      fetchMatrizPermisos()
    }
  }, [activeTab, user, canUseEditor, fetchArticles, fetchUsuarios, fetchMatrizPermisos])

  // Cambiar rol de un usuario en la BD
  async function handleChangeUserRole(usuarioId: number, nuevoRolId: number) {
    if (!user?.email) return
    setUpdatingUserId(usuarioId)
    setStatusBanner(null)

    try {
      const res = await fetch(`${API_BASE_URL}/admin_usuarios.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          solicitante: user.email,
          usuario_id: usuarioId,
          rol_id: nuevoRolId,
        }),
      })
      const data = await res.json()
      if (data.status === "success") {
        setStatusBanner({ type: "ok", text: data.message || "Rol actualizado con éxito." })
        await fetchUsuarios()
      } else {
        setStatusBanner({ type: "err", text: data.message || "No se pudo cambiar el rol." })
      }
    } catch (e) {
      console.error(e)
      setStatusBanner({ type: "err", text: "Error de conexión al cambiar rol." })
    } finally {
      setUpdatingUserId(null)
    }
  }

  // Verificar si un rol tiene asignado un permiso en la matriz
  function isPermisoAssigned(rolId: number, permisoId: number, rolClave: string): boolean {
    if (rolClave === "super_admin") return true
    return asignaciones.some(
      (a) => Number(a.rol_id) === Number(rolId) && Number(a.permiso_id) === Number(permisoId)
    )
  }

  // Alternar un permiso en la matriz interactiva
  async function handleToggleMatrixCell(rol: DBRole, permiso: DBPermiso) {
    if (!user?.email) return
    if (rol.clave === "super_admin" || Number(permiso.exclusivo_super_admin) === 1) {
      return
    }

    const currentlyActive = isPermisoAssigned(rol.id, permiso.id, rol.clave)
    const nextState = !currentlyActive
    const cellKey = `${rol.id}-${permiso.id}`
    setTogglingCell(cellKey)
    setStatusBanner(null)

    try {
      const res = await fetch(`${API_BASE_URL}/admin_roles.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          solicitante: user.email,
          rol_id: rol.id,
          permiso_id: permiso.id,
          activo: nextState,
        }),
      })
      const data = await res.json()
      if (data.status === "success") {
        if (nextState) {
          setAsignaciones((prev) => [...prev, { rol_id: rol.id, permiso_id: permiso.id }])
        } else {
          setAsignaciones((prev) =>
            prev.filter(
              (a) => !(Number(a.rol_id) === Number(rol.id) && Number(a.permiso_id) === Number(permiso.id))
            )
          )
        }
        setStatusBanner({
          type: "ok",
          text: `Permiso "${permiso.clave}" ${nextState ? "activado" : "desactivado"} para el rol ${rol.nombre}.`,
        })
      } else {
        setStatusBanner({ type: "err", text: data.message || "Error al actualizar permiso." })
      }
    } catch (e) {
      console.error(e)
      setStatusBanner({ type: "err", text: "Error de red al guardar el permiso." })
    } finally {
      setTogglingCell(null)
    }
  }

  // Filtrado de usuarios por buscador
  const filteredUsers = usuariosList.filter((u) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      u.email.toLowerCase().includes(q) ||
      (u.nombre && u.nombre.toLowerCase().includes(q)) ||
      (u.apellido && u.apellido.toLowerCase().includes(q)) ||
      (u.pais && u.pais.toLowerCase().includes(q)) ||
      (u.rol_nombre && u.rol_nombre.toLowerCase().includes(q))
    )
  })

  function formatConcepcion(estado?: string | null, fecha?: string | null) {
    if (estado === "fecha" && fecha) return `Fecha: ${fecha}`
    if (estado === "aun_no_se") return "Aún no lo sabe"
    return "No aplica"
  }

  function slugify(text: string) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
  }

  function normalizeRoutePathForInput(raw: string): string {
    let val = raw.trimStart().toLowerCase()
    val = val.replace(/^https?:\/\/[^/]+\/?/i, "")
    val = val
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-_/]/g, "-")
      .replace(/\/+/g, "/")
      .replace(/^\/+/, "")
    return val
  }

  function normalizeRoutePathForSave(raw: string): string {
    let val = raw.trim().split(/[?#]/)[0] || ""
    val = val.replace(/^https?:\/\/[^/]+\/?/i, "")
    return val
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .split("/")
      .map((seg) => seg.replace(/[^a-z0-9\-_]+/g, "-").replace(/(^-|-$)+/g, ""))
      .filter(Boolean)
      .join("/")
  }

  function buildCanonicalUrl(rawPath: string): string {
    const clean = normalizeRoutePathForSave(rawPath)
    return clean ? `https://tatimonteroyoga.com/${clean}` : "https://tatimonteroyoga.com"
  }

  function extractPathFromCanonical(canonicalUrl?: string | null, fallbackSlug?: string | null): string {
    if (canonicalUrl && canonicalUrl.trim()) {
      const cleaned = normalizeRoutePathForSave(canonicalUrl)
      if (cleaned) return cleaned
    }
    return normalizeRoutePathForSave(fallbackSlug || "")
  }

  function mapToSeoCategory(cat: string): SeoCategoryType {
    if (cat === "news_blog" || cat === "event" || cat === "biography" || cat === "spotify_top" || cat === "guide") {
      return cat
    }
    return "guide"
  }

  function syncSeoQuickFields(partial: Partial<SeoStrategyData>) {
    try {
      seoStrategyContent.updateData(partial, "seo-dashboard")
    } catch {
      // Ignorar si el panel SEO aún está inicializando
    }
  }

  // Cargar un artículo existente o iniciar uno nuevo
  async function handleSelectArticle(id: number | null) {
    if (!id) {
      setSelectedArticleId(null)
      setArticleTitle("")
      setArticleSlug("")
      setArticleLocale("es")
      setArticleMetaDescription("")
      setArticleCategory("guide")
      setArticleStatus("published")
      setHtmlGuttenbergContent("<p>Comienza a redactar tu contenido aquí...</p>")
      const resetSeo = setSeoStrategyContent(
        {
          ...DEFAULT_SEO_STRATEGY_DATA,
          category: "guide",
          inLanguage: "es",
          headline: "",
          metaDescription: "",
          canonicalUrl: "https://tatimonteroyoga.com/",
          authorName: "Tati Montero",
          publisherName: "Tati Montero Yoga",
          mainImageUrl: "https://tatimonteroyoga.com/tatifoto.png",
          mainImageAlt: "Tati Montero Yoga Prenatal",
        },
        "seo-dashboard"
      )
      setSeoScore(resetSeo?.score || 0)
      return
    }

    setLoadingArticles(true)
    setStatusBanner(null)
    try {
      const res = await fetch(`${API_BASE_URL}/articles/articles.php?id=${id}`)
      const data = await res.json()
      if (data.ok && data.article) {
        const art = data.article
        const translationsArr = Array.isArray(data.translations) ? data.translations : []
        const trans =
          translationsArr.find((t: { locale?: string }) => t.locale === art.default_locale) ||
          translationsArr[0] ||
          null

        const loadedLocale = trans?.locale || art.default_locale || "es"
        const loadedPath = extractPathFromCanonical(trans?.canonical_url, trans?.slug)
        const loadedTitle = trans?.title || ""
        const loadedCategory = art.category || "guide"

        setSelectedArticleId(art.id)
        setArticleCategory(loadedCategory)
        setArticleStatus(art.status || "published")
        setArticleLocale(loadedLocale)
        setArticleTitle(loadedTitle)
        setArticleSlug(loadedPath)

        // Restaurar estado completo en Guttenberg
        if (art.full_guttenberg_json) {
          try {
            const parsed =
              typeof art.full_guttenberg_json === "string"
                ? JSON.parse(art.full_guttenberg_json)
                : art.full_guttenberg_json
            setDataGuttenbergContent(parsed)
          } catch {
            if (trans?.html_content) {
              setHtmlGuttenbergContent(trans.html_content)
            }
          }
        } else if (trans?.html_content) {
          setHtmlGuttenbergContent(trans.html_content)
        }

        // Restaurar estado SEO completo (desde trans.seo_data_json o art.full_seo_json)
        let seoSource: Partial<SeoStrategyData> | string | null =
          trans?.seo_data_json || art.full_seo_json || null
        let parsedSeoObj: Partial<SeoStrategyData> = {}
        if (typeof seoSource === "string" && seoSource.trim()) {
          try {
            const rawParsed = JSON.parse(seoSource)
            parsedSeoObj = rawParsed?.data ? rawParsed.data : rawParsed
          } catch {
            parsedSeoObj = {}
          }
        } else if (seoSource && typeof seoSource === "object") {
          parsedSeoObj = (seoSource as { data?: Partial<SeoStrategyData> }).data || (seoSource as Partial<SeoStrategyData>)
        }

        const mergedSeoData: Partial<SeoStrategyData> = {
          ...DEFAULT_SEO_STRATEGY_DATA,
          ...parsedSeoObj,
          category: mapToSeoCategory(parsedSeoObj.category || loadedCategory),
          inLanguage: parsedSeoObj.inLanguage || loadedLocale,
          headline: parsedSeoObj.headline || loadedTitle,
          canonicalUrl: parsedSeoObj.canonicalUrl || trans?.canonical_url || buildCanonicalUrl(loadedPath),
          authorName: parsedSeoObj.authorName || "Tati Montero",
          publisherName: parsedSeoObj.publisherName || "Tati Montero Yoga",
          mainImageUrl: parsedSeoObj.mainImageUrl || "https://tatimonteroyoga.com/tatifoto.png",
        }
        const loadedSeoOut = setSeoStrategyContent(mergedSeoData, "seo-dashboard")
        setArticleMetaDescription(mergedSeoData.metaDescription || "")
        setSeoScore(loadedSeoOut?.score || 0)

        setStatusBanner({
          type: "ok",
          text: `Página #${art.id} ("${loadedTitle || art.id}" -> /${loadedPath}) cargada en el editor.`,
        })
      } else {
        setStatusBanner({
          type: "err",
          text: data.message || "No se pudo cargar el artículo seleccionado.",
        })
      }
    } catch (err) {
      console.error(err)
      setStatusBanner({ type: "err", text: "Error de red al cargar el artículo." })
    } finally {
      setLoadingArticles(false)
    }
  }

  // Guardar (Crear o Actualizar) en MySQL incluyendo Rutas Canónicas y SEO Completo
  async function handleSaveArticle() {
    if (!user?.email) return
    const finalTitle = articleTitle.trim() || "Página sin título"
    let cleanPath = normalizeRoutePathForSave(articleSlug)
    if (!cleanPath) {
      cleanPath = slugify(finalTitle) || `pagina-${Date.now()}`
      setArticleSlug(cleanPath)
    }

    const primaryLocale = articleLocale || "es"
    const primaryCanonical = buildCanonicalUrl(cleanPath)

    setSavingArticle(true)
    setStatusBanner(null)

    const isUpdate = selectedArticleId !== null && selectedArticleId > 0
    const endpoint = isUpdate
      ? `${API_BASE_URL}/articles/articles.php?id=${selectedArticleId}&_method=PUT`
      : `${API_BASE_URL}/articles/articles.php`
    const method = "POST"

    const gtOut = htmlGuttenbergContent.get("editor-dashboard")
    const currentHtml = gtOut?.html || htmlGuttenbergContent.html || ""
    const currentCss = gtOut?.css || htmlGuttenbergContent.css || ""
    const currentJson = gtOut ? JSON.stringify(gtOut) : (htmlGuttenbergContent.json || "")

    const currentSeoOut = seoStrategyContent.get("seo-dashboard")
    const baseSeoData: SeoStrategyData = {
      ...DEFAULT_SEO_STRATEGY_DATA,
      ...(currentSeoOut?.data || {}),
      category: mapToSeoCategory(articleCategory),
      inLanguage: primaryLocale,
      headline: (currentSeoOut?.data?.headline || "").trim() || finalTitle,
      metaDescription:
        articleMetaDescription.trim() ||
        (currentSeoOut?.data?.metaDescription || "").trim() ||
        `${finalTitle} — Tati Montero Yoga`,
      canonicalUrl: primaryCanonical,
      authorName: (currentSeoOut?.data?.authorName || "").trim() || "Tati Montero",
      publisherName: (currentSeoOut?.data?.publisherName || "").trim() || "Tati Montero Yoga",
      mainImageUrl:
        (currentSeoOut?.data?.mainImageUrl || "").trim() || "https://tatimonteroyoga.com/tatifoto.png",
      mainImageAlt:
        (currentSeoOut?.data?.mainImageAlt || "").trim() || finalTitle,
    }

    // Construir mapa multi-idioma si existen traducciones adicionales activas
    const canonicalByLocale: Record<string, string> = {
      [primaryLocale]: primaryCanonical,
    }
    const gtTranslations = gtOut?.translations || htmlGuttenbergContent.translations || {}
    const seoTranslations = seoStrategyContent.translations || {}
    const extraLocales = new Set<string>()

    for (const loc of Object.keys(seoTranslations)) {
      if (loc === primaryLocale) continue
      const tr = seoTranslations[loc]
      const gtTr = gtTranslations[loc]
      const hasCustomSeo = Boolean(tr?.data?.headline && tr.data.headline.trim())
      const hasCustomHtml = Boolean(gtTr?.html && gtTr.html.trim() && gtTr.blocks?.length)
      if (hasCustomSeo || hasCustomHtml) {
        extraLocales.add(loc)
        const altPath = tr?.canonicalUrl
          ? normalizeRoutePathForSave(tr.canonicalUrl)
          : `${loc}/${cleanPath.replace(new RegExp(`^${primaryLocale}/`), "")}`
        canonicalByLocale[loc] = buildCanonicalUrl(altPath)
      }
    }

    const finalPrimarySeoOut = buildFullSeoStrategyOutput(baseSeoData, {
      baseLocale: primaryLocale,
      baseCanonicalUrl: primaryCanonical,
      canonicalByLocale,
    })
    setSeoScore(finalPrimarySeoOut.score)

    const translationsPayload = [
      {
        locale: primaryLocale,
        slug: cleanPath,
        canonical_url: primaryCanonical,
        title: finalTitle,
        html_content: currentHtml,
        seo_head_html: finalPrimarySeoOut.headHtml,
        guttenberg_json: currentJson,
        seo_data_json: finalPrimarySeoOut.json,
      },
    ]

    for (const loc of extraLocales) {
      const gtTr = gtTranslations[loc]
      const seoTr = seoTranslations[loc]
      const locCanonical = canonicalByLocale[loc]
      const locSlug = extractPathFromCanonical(locCanonical, `${loc}/${cleanPath}`)
      const locTitle = (seoTr?.data?.headline || "").trim() || `${finalTitle} (${loc.toUpperCase()})`
      const locSeoData: SeoStrategyData = {
        ...baseSeoData,
        ...(seoTr?.data || {}),
        inLanguage: loc,
        headline: locTitle,
        canonicalUrl: locCanonical,
      }
      const locSeoOut = buildFullSeoStrategyOutput(locSeoData, {
        baseLocale: primaryLocale,
        baseCanonicalUrl: primaryCanonical,
        canonicalByLocale,
      })
      translationsPayload.push({
        locale: loc,
        slug: locSlug,
        canonical_url: locCanonical,
        title: locTitle,
        html_content: gtTr?.html || currentHtml,
        seo_head_html: locSeoOut.headHtml,
        guttenberg_json: gtTr ? JSON.stringify(gtTr) : currentJson,
        seo_data_json: locSeoOut.json,
      })
    }

    const payload = {
      _method: isUpdate ? "PUT" : "POST",
      solicitante: user.email,
      id: selectedArticleId,
      category: articleCategory,
      default_locale: primaryLocale,
      status: articleStatus,
      theme_css: currentCss,
      full_guttenberg_json: currentJson,
      full_seo_json: finalPrimarySeoOut.json,
      translations: translationsPayload,
    }

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.ok || data.status === "success") {
        if (!isUpdate && data.article_id) {
          setSelectedArticleId(data.article_id)
        }
        setArticleSlug(cleanPath)
        setStatusBanner({
          type: "ok",
          text: isUpdate
            ? `¡Página #${selectedArticleId} actualizada! URL pública: ${primaryCanonical}`
            : `¡Página creada con ID #${data.article_id}! URL pública: ${primaryCanonical}`,
        })
        await fetchArticles()
      } else {
        setStatusBanner({
          type: "err",
          text: data.message || "No se pudo guardar el artículo.",
        })
      }
    } catch (err) {
      console.error(err)
      setStatusBanner({ type: "err", text: "Error de red al guardar el artículo." })
    } finally {
      setSavingArticle(false)
    }
  }

  // Eliminar artículo seleccionado
  async function handleDeleteArticle() {
    if (!selectedArticleId || !user?.email) return
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar permanentemente el artículo #${selectedArticleId} ("${articleTitle || "Sin título"}")?`
    )
    if (!confirmed) return

    setDeletingArticle(true)
    setStatusBanner(null)
    try {
      const res = await fetch(
        `${API_BASE_URL}/articles/articles.php?id=${selectedArticleId}&_method=DELETE&solicitante=${encodeURIComponent(user.email)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            _method: "DELETE",
            id: selectedArticleId,
            solicitante: user.email,
          }),
        }
      )
      const data = await res.json()
      if (data.ok || data.status === "success") {
        setStatusBanner({
          type: "ok",
          text: `Artículo #${selectedArticleId} eliminado correctamente de la base de datos.`,
        })
        await handleSelectArticle(null)
        await fetchArticles()
      } else {
        setStatusBanner({ type: "err", text: data.message || "Error al eliminar el artículo." })
      }
    } catch (err) {
      console.error(err)
      setStatusBanner({ type: "err", text: "Error de red al eliminar el artículo." })
    } finally {
      setDeletingArticle(false)
    }
  }

  // Importar HTML externo y convertirlo a bloques de Guttenberg
  function handleImportRawHtml() {
    if (!rawHtmlToImport.trim()) return
    setHtmlGuttenbergContent(rawHtmlToImport)
    setShowImportHtmlModal(false)
    setRawHtmlToImport("")
    setStatusBanner({
      type: "ok",
      text: "Código HTML importado y transformado en bloques de Guttenberg.",
    })
  }

  return (
    <ProtectedRoute requiredPermission="ver_dashboard">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-6 min-h-[80vh]">
        
        {/* CABECERA DEL DASHBOARD */}
        <div className="bg-[var(--color-crema)] border border-[#C47E63]/20 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-light text-[#C47E63]">
                Panel de Control
              </h1>
              <span className="text-xs px-3 py-1 rounded-full bg-[#C47E63] text-white font-medium shadow-xs">
                {user?.rol?.nombre || "Usuario"}
              </span>
            </div>
            <p className="text-sm text-stone-600 font-light">
              Bienvenida/o, <strong className="font-medium text-stone-800">{user?.nombre} {user?.apellido}</strong> ({user?.email})
            </p>
          </div>

          {/* BARRA DE PESTAÑAS INTERNAS (Mantiene la ruta /dashboard siempre) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("resumen")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === "resumen"
                  ? "bg-[#C47E63] text-white shadow-sm"
                  : "bg-[var(--color-marfil)] text-stone-700 hover:bg-white border border-stone-200"
              }`}
            >
              <User className="w-4 h-4" />
              Mi Panel y Accesos
            </button>

            {canUseEditor && (
              <button
                type="button"
                onClick={() => setActiveTab("editor")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  activeTab === "editor"
                    ? "bg-[#C47E63] text-white shadow-sm"
                    : "bg-[var(--color-marfil)] text-stone-700 hover:bg-white border border-stone-200"
                }`}
              >
                <FileEdit className="w-4 h-4" />
                Editor Guttenberg
              </button>
            )}

            {canManageUsers && (
              <button
                type="button"
                onClick={() => setActiveTab("usuarios")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  activeTab === "usuarios"
                    ? "bg-[#C47E63] text-white shadow-sm"
                    : "bg-[var(--color-marfil)] text-stone-700 hover:bg-white border border-stone-200"
                }`}
              >
                <Users className="w-4 h-4" />
                Usuarios ({usuariosList.length || "..."})
              </button>
            )}

            {canManageRoles && (
              <button
                type="button"
                onClick={() => setActiveTab("permisos")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  activeTab === "permisos"
                    ? "bg-[#C47E63] text-white shadow-sm"
                    : "bg-[var(--color-marfil)] text-stone-700 hover:bg-white border border-stone-200"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Matriz de Permisos
              </button>
            )}
          </div>
        </div>

        {/* AVISOS DE ESTADO */}
        {statusBanner && (
          <div
            className={`p-3.5 rounded-xl border text-sm flex items-center justify-between ${
              statusBanner.type === "ok"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            <span>
              {statusBanner.type === "ok" ? "✅ " : "⚠️ "}
              {statusBanner.text}
            </span>
            <button
              type="button"
              onClick={() => setStatusBanner(null)}
              className="text-xs underline ml-4 opacity-75 hover:opacity-100"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* ============================================================= */}
        {/* PESTAÑA 1: RESUMEN, ACCESOS Y DATOS COMPLETOS DEL REGISTRO */}
        {/* ============================================================= */}
        {activeTab === "resumen" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Herramientas a las que tiene acceso según su rol */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-[#C47E63]/20 bg-[var(--color-marfil)] shadow-xs">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-[#C47E63] flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Módulos habilitados para tu cuenta
                  </CardTitle>
                  <CardDescription>
                    Selecciona una herramienta para trabajar directamente sin salir de tu panel
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {canUseEditor && (
                    <div className="p-5 rounded-xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between gap-4">
                      <div>
                        <div className="w-10 h-10 rounded-lg bg-[#C47E63]/15 flex items-center justify-center mb-3">
                          <FileEdit className="w-5 h-5 text-[#C47E63]" />
                        </div>
                        <h3 className="font-medium text-stone-800 text-base">Editor Visual Guttenberg</h3>
                        <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                          Diseña páginas, artículos y bloques con estilos CSS responsive integrados.
                        </p>
                      </div>
                      <Button
                        onClick={() => setActiveTab("editor")}
                        className="w-full !bg-[#C47E63] hover:opacity-90 text-xs"
                      >
                        Abrir Editor aquí
                      </Button>
                    </div>
                  )}

                  {canManageUsers && (
                    <div className="p-5 rounded-xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between gap-4">
                      <div>
                        <div className="w-10 h-10 rounded-lg bg-[#6d8f8a]/15 flex items-center justify-center mb-3">
                          <Users className="w-5 h-5 text-[#6d8f8a]" />
                        </div>
                        <h3 className="font-medium text-stone-800 text-base">Gestión de Usuarios</h3>
                        <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                          Visualiza todos los datos de inscripción y asigna roles (`estudiante`, `docente`, `admin`).
                        </p>
                      </div>
                      <Button
                        onClick={() => setActiveTab("usuarios")}
                        className="w-full !bg-[#6d8f8a] hover:opacity-90 text-xs text-white"
                      >
                        Administrar Usuarios
                      </Button>
                    </div>
                  )}

                  {canManageRoles && (
                    <div className="p-5 rounded-xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between gap-4">
                      <div>
                        <div className="w-10 h-10 rounded-lg bg-[#8fae9c]/20 flex items-center justify-center mb-3">
                          <ShieldCheck className="w-5 h-5 text-[#6d8f8a]" />
                        </div>
                        <h3 className="font-medium text-stone-800 text-base">Matriz de Roles y Permisos</h3>
                        <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                          Configura en la tabla interactiva qué permisos tiene cada rol del sistema.
                        </p>
                      </div>
                      <Button
                        onClick={() => setActiveTab("permisos")}
                        variant="outline"
                        className="w-full border-[#C47E63] !text-[#C47E63] hover:bg-[#C47E63]/10 text-xs"
                      >
                        Ver Matriz de Permisos
                      </Button>
                    </div>
                  )}

                </CardContent>
              </Card>

              {/* Permisos activos en la base de datos para este correo */}
              <Card className="border-stone-200 bg-white shadow-xs">
                <CardHeader>
                  <CardTitle className="text-base font-medium text-stone-800">
                    Permisos verificados en Base de Datos
                  </CardTitle>
                  <CardDescription>
                    Estos son los permisos activos asociados actualmente a tu rol ({user?.rol?.clave})
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {user?.permisos && user.permisos.length > 0 ? (
                    user.permisos.map((perm) => (
                      <span
                        key={perm}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {perm}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-stone-500">Sin permisos especiales asignados.</span>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Ficha con todos los datos recolectados en el Registro */}
            <Card className="border-[#C47E63]/20 bg-[var(--color-marfil)] shadow-xs h-fit">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-[#C47E63]">
                  Mis Datos de Registro
                </CardTitle>
                <CardDescription>
                  Información almacenada en tu perfil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="p-3 rounded-lg bg-white border border-stone-200/80 space-y-2.5">
                  <div className="flex items-center gap-2 text-stone-700">
                    <User className="w-4 h-4 text-[#C47E63] shrink-0" />
                    <div>
                      <p className="text-[11px] text-stone-400 uppercase">Nombre Completo</p>
                      <p className="font-medium">{user?.nombre || "-"} {user?.apellido || ""}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-stone-700">
                    <Mail className="w-4 h-4 text-[#C47E63] shrink-0" />
                    <div>
                      <p className="text-[11px] text-stone-400 uppercase">Correo ({user?.metodo_registro || "email"})</p>
                      <p className="font-medium break-all">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-stone-700">
                    <MapPin className="w-4 h-4 text-[#C47E63] shrink-0" />
                    <div>
                      <p className="text-[11px] text-stone-400 uppercase">País</p>
                      <p className="font-medium">{user?.pais || "No especificado"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-stone-700">
                    <Phone className="w-4 h-4 text-[#C47E63] shrink-0" />
                    <div>
                      <p className="text-[11px] text-stone-400 uppercase">WhatsApp</p>
                      <p className="font-medium">{user?.whatsapp || "No especificado"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-stone-700">
                    <Calendar className="w-4 h-4 text-[#C47E63] shrink-0" />
                    <div>
                      <p className="text-[11px] text-stone-400 uppercase">Fecha de Nacimiento</p>
                      <p className="font-medium">{user?.fecha_nacimiento || "No especificada"}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100">
                    <p className="text-[11px] text-stone-400 uppercase">Concepción / Fecundación</p>
                    <p className="font-medium text-stone-700">
                      {formatConcepcion(user?.estado_concepcion, user?.fecha_concepcion)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ============================================================= */}
        {/* PESTAÑA 2: EDITOR GUTTENBERG INTEGRADO EN EL DASHBOARD */}
        {/* ============================================================= */}
        {activeTab === "editor" && canUseEditor && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* BARRA SUPERIOR DE GESTIÓN DE ARTÍCULOS */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-medium text-[#C47E63]">
                      Editor Visual Guttenberg
                    </h2>
                    {selectedArticleId ? (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#C47E63]/15 text-[#C47E63] font-medium border border-[#C47E63]/30">
                        Editando ID #{selectedArticleId}
                      </span>
                    ) : (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium border border-emerald-200">
                        Nuevo Artículo
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Crea, actualiza e importa contenidos directamente en la base de datos MySQL (tatimonteroyoga.com).
                  </p>
                </div>

                {/* BOTONES DE ACCIÓN */}
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSelectArticle(null)}
                    className="border-stone-200 text-stone-700 hover:bg-stone-50 text-xs gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Nuevo
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowImportHtmlModal(true)}
                    className="border-[#6d8f8a]/40 text-[#6d8f8a] hover:bg-[#6d8f8a]/10 text-xs gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Importar HTML plano
                  </Button>

                  {selectedArticleId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleDeleteArticle}
                      disabled={deletingArticle}
                      className="border-red-200 text-red-600 hover:bg-red-50 text-xs gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {deletingArticle ? "Borrando..." : "Eliminar"}
                    </Button>
                  )}

                  <Button
                    type="button"
                    onClick={handleSaveArticle}
                    disabled={savingArticle}
                    className="!bg-[#C47E63] hover:opacity-90 text-white text-xs gap-1.5 shadow-sm font-medium"
                  >
                    {savingArticle ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    {savingArticle
                      ? "Guardando en BD..."
                      : selectedArticleId
                      ? "Actualizar en BD"
                      : "Guardar en Base de Datos"}
                  </Button>
                </div>
              </div>

              {/* SELECTOR DE ARTÍCULOS EXISTENTES DESDE BD */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3 border-t border-stone-100">
                <div className="flex items-center gap-2 text-xs text-stone-600 font-medium shrink-0">
                  <FileText className="w-4 h-4 text-[#C47E63]" />
                  <span>Cargar desde BD:</span>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <select
                    value={selectedArticleId || ""}
                    onChange={(e) => {
                      const val = e.target.value ? Number(e.target.value) : null
                      handleSelectArticle(val)
                    }}
                    disabled={loadingArticles}
                    className="w-full bg-[var(--color-marfil)] border border-stone-300 rounded-lg px-3 py-2 text-xs font-medium text-stone-800 focus:outline-none focus:border-[#C47E63] disabled:opacity-60 cursor-pointer"
                  >
                    <option value="">➕ [Nuevo Artículo - Vacío]</option>
                    {articlesList.map((art) => (
                      <option key={art.id} value={art.id}>
                        #{art.id} — {art.title || "(Sin título)"} [/
                        {extractPathFromCanonical(art.canonical_url, art.slug) || "sin-ruta"}] (
                        {art.status})
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchArticles}
                    disabled={loadingArticles}
                    title="Recargar lista de artículos desde la BD"
                    className="shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingArticles ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </div>

              {/* CAMPOS DE METADATOS (TÍTULO, RUTA URL CANÓNICA, IDIOMA, SEO, CATEGORÍA, ESTADO) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 uppercase mb-1">
                    Título Principal (H1 / OG)
                  </label>
                  <Input
                    type="text"
                    placeholder="Ej. Primera Página de Yoga Prenatal"
                    value={articleTitle}
                    onChange={(e) => {
                      const val = e.target.value
                      setArticleTitle(val)
                      syncSeoQuickFields({ headline: val })
                      if (!selectedArticleId && !articleSlug) {
                        const autoSlug = slugify(val)
                        setArticleSlug(autoSlug)
                        syncSeoQuickFields({ canonicalUrl: buildCanonicalUrl(autoSlug) })
                      }
                    }}
                    className="text-xs bg-[var(--color-marfil)]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-stone-600 uppercase mb-1">
                    Ruta URL Pública (Canonical)
                  </label>
                  <div className="flex items-center bg-[var(--color-marfil)] border border-stone-300 rounded-lg overflow-hidden focus-within:border-[#C47E63]">
                    <span className="px-2.5 py-2 text-[11px] font-mono text-stone-500 bg-stone-100 border-r border-stone-200 shrink-0 select-none">
                      https://tatimonteroyoga.com/
                    </span>
                    <input
                      type="text"
                      placeholder="primera-pagina o catalogo/catalogo-1"
                      value={articleSlug}
                      onChange={(e) => {
                        const nextPath = normalizeRoutePathForInput(e.target.value)
                        setArticleSlug(nextPath)
                        syncSeoQuickFields({ canonicalUrl: buildCanonicalUrl(nextPath) })
                      }}
                      className="w-full px-2.5 py-2 text-xs font-mono text-stone-800 bg-transparent focus:outline-none"
                    />
                    {selectedArticleId && normalizeRoutePathForSave(articleSlug) && (
                      <a
                        href={`/${normalizeRoutePathForSave(articleSlug)}${
                          articleStatus !== "published" ? "?preview=1" : ""
                        }`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Abrir página pública en una pestaña nueva"
                        className="px-2.5 py-2 text-[11px] font-medium text-[#6d8f8a] hover:text-[#55746f] flex items-center gap-1 shrink-0 border-l border-stone-200 bg-white/60"
                      >
                        Ver <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-[10px] text-stone-400 mt-1">
                    Soporta rutas simples o multinivel: <code className="text-stone-600">primera-pagina</code>,{" "}
                    <code className="text-stone-600">es/primera-pagina</code>,{" "}
                    <code className="text-stone-600">primera-pagina/seguimiento</code>,{" "}
                    <code className="text-stone-600">catalogo/catalogo-1</code>
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-600 uppercase mb-1">
                    Idioma Base
                  </label>
                  <select
                    value={articleLocale}
                    onChange={(e) => {
                      const val = e.target.value
                      setArticleLocale(val)
                      syncSeoQuickFields({ inLanguage: val })
                    }}
                    className="w-full bg-[var(--color-marfil)] border border-stone-300 rounded-lg px-3 py-2 text-xs font-medium text-stone-800 focus:outline-none focus:border-[#C47E63] cursor-pointer"
                  >
                    <option value="es">🇪🇸 Español (es)</option>
                    <option value="en">🇬🇧 English (en)</option>
                    <option value="pt">🇧🇷 Português (pt)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-medium text-stone-600 uppercase">
                      Meta Descripción SEO (Google SERP)
                    </label>
                    <span
                      className={`text-[10px] font-mono ${
                        articleMetaDescription.length >= 110 && articleMetaDescription.length <= 160
                          ? "text-emerald-600"
                          : "text-stone-400"
                      }`}
                    >
                      {articleMetaDescription.length}/160 car.
                    </span>
                  </div>
                  <Input
                    type="text"
                    maxLength={180}
                    placeholder="Descripción breve que aparecerá en Google (ideal 120-160 caracteres)..."
                    value={articleMetaDescription}
                    onChange={(e) => {
                      const val = e.target.value
                      setArticleMetaDescription(val)
                      syncSeoQuickFields({ metaDescription: val })
                    }}
                    className="text-xs bg-[var(--color-marfil)]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-600 uppercase mb-1">
                    Categoría / Schema SEO
                  </label>
                  <select
                    value={articleCategory}
                    onChange={(e) => {
                      const val = e.target.value
                      setArticleCategory(val)
                      syncSeoQuickFields({ category: mapToSeoCategory(val) })
                    }}
                    className="w-full bg-[var(--color-marfil)] border border-stone-300 rounded-lg px-3 py-2 text-xs font-medium text-stone-800 focus:outline-none focus:border-[#C47E63] cursor-pointer"
                  >
                    <option value="guide">Guía / Práctica (HowTo / FAQ)</option>
                    <option value="news_blog">Noticias y Blog (Article)</option>
                    <option value="event">Retiro / Evento (Event)</option>
                    <option value="biography">Biografía / Acerca de (Profile)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-600 uppercase mb-1">
                    Estado de Publicación
                  </label>
                  <select
                    value={articleStatus}
                    onChange={(e) =>
                      setArticleStatus(e.target.value as "draft" | "published" | "archived")
                    }
                    className="w-full bg-[var(--color-marfil)] border border-stone-300 rounded-lg px-3 py-2 text-xs font-medium text-stone-800 focus:outline-none focus:border-[#C47E63] cursor-pointer"
                  >
                    <option value="published">🟢 Publicado (Visible en Web)</option>
                    <option value="draft">🟡 Borrador (Solo Preview)</option>
                    <option value="archived">⚪ Archivado (Oculto)</option>
                  </select>
                </div>
              </div>

              {/* SUB-PESTAÑAS DEL EDITOR: CONTENIDO VISUAL vs SEO ESTRATEGIA */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditorSubTab("visual")}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      editorSubTab === "visual"
                        ? "bg-[#6d8f8a] text-white shadow-xs"
                        : "bg-[var(--color-marfil)] text-stone-700 hover:bg-stone-100 border border-stone-200"
                    }`}
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    Contenido Visual (Guttenberg)
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditorSubTab("seo")}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      editorSubTab === "seo"
                        ? "bg-[#C47E63] text-white shadow-xs"
                        : "bg-[var(--color-marfil)] text-stone-700 hover:bg-stone-100 border border-stone-200"
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    SEO Avanzado, Schema & Posición 0
                    <span
                      className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        editorSubTab === "seo"
                          ? "bg-white/25 text-white"
                          : seoScore >= 75
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {seoScore}/100
                    </span>
                  </button>
                </div>

                <span className="text-[11px] text-stone-400">
                  Ambos paneles se guardan juntos al presionar &quot;
                  {selectedArticleId ? "Actualizar en BD" : "Guardar en Base de Datos"}&quot;.
                </span>
              </div>
            </div>

            {/* MODAL PARA IMPORTAR HTML PLANO */}
            {showImportHtmlModal && (
              <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border border-stone-200 animate-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-5 h-5 text-[#C47E63]" />
                      <h3 className="font-medium text-base text-stone-800">
                        Importar Código HTML al Editor Guttenberg
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowImportHtmlModal(false)}
                      className="text-stone-400 hover:text-stone-600 p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-xs text-stone-500 leading-relaxed">
                    Pega cualquier código HTML externo (de blogs anteriores, documentos, exports o CMS).
                    El motor de Guttenberg lo convertirá automáticamente en bloques interactivos
                    (párrafos, títulos, listas, columnas, tablas o imágenes) listos para seguir editando.
                  </p>

                  <textarea
                    rows={10}
                    value={rawHtmlToImport}
                    onChange={(e) => setRawHtmlToImport(e.target.value)}
                    placeholder="<h2>Título del artículo</h2><p>Contenido del párrafo...</p><ul><li>Elemento 1</li></ul>"
                    className="w-full p-3 font-mono text-xs border border-stone-300 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:border-[#C47E63]"
                  />

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowImportHtmlModal(false)}
                      className="text-xs"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      onClick={handleImportRawHtml}
                      disabled={!rawHtmlToImport.trim()}
                      className="!bg-[#C47E63] hover:opacity-90 text-white text-xs gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Convertir y Cargar en Editor
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* CONTENEDORES MONTADOS DE GUTTENBERG + ESTRATEGIA SEO (CAMBIO POR CSS PARA NO PERDER ESTADO) */}
            <div
              className={`bg-white rounded-2xl shadow-xs border border-stone-200 overflow-hidden ${
                editorSubTab === "visual" ? "block" : "hidden"
              }`}
            >
              <HtmlEditorGuttenberg
                id="editor-dashboard"
                name="contenido"
                styleMode="custom"
                enableCssEditor={true}
                onSave={() => {
                  handleSaveArticle()
                }}
              />
            </div>

            <div
              className={`bg-white rounded-2xl shadow-xs border border-stone-200 overflow-hidden ${
                editorSubTab === "seo" ? "block" : "hidden"
              }`}
            >
              <EstrategiaSeo
                id="seo-dashboard"
                name="seo_dashboard"
                initialCategory="guide"
                useGtClasses={true}
                baseLocale="es"
                initialLocales={["es"]}
                targetEditorId="editor-dashboard"
                initialData={{
                  category: "guide",
                  inLanguage: "es",
                  authorName: "Tati Montero",
                  publisherName: "Tati Montero Yoga",
                  mainImageUrl: "https://tatimonteroyoga.com/tatifoto.png",
                }}
                onChange={(out) => {
                  setSeoScore(out.score)
                  if (out.data?.metaDescription !== undefined) {
                    setArticleMetaDescription(out.data.metaDescription)
                  }
                }}
                onSave={() => {
                  handleSaveArticle()
                }}
              />
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* PESTAÑA 3: GESTIÓN DE USUARIOS Y CAMBIO DE ROL (SUPER ADMIN) */}
        {/* ============================================================= */}
        {activeTab === "usuarios" && canManageUsers && (
          <Card className="border-[#C47E63]/20 bg-white shadow-xs animate-in fade-in duration-200">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100">
              <div>
                <CardTitle className="text-lg font-medium text-[#C47E63]">
                  Gestión de Usuarios Registrados
                </CardTitle>
                <CardDescription>
                  Exclusivo para Super Admin: visualiza todos los datos de registro y cambia el rol de cualquier persona
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Input
                    placeholder="Buscar por nombre, email, país..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 text-xs bg-[var(--color-marfil)]"
                  />
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchUsuarios}
                  disabled={loadingUsers}
                  title="Recargar lista"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingUsers ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[var(--color-marfil)] text-stone-600 border-b border-stone-200 uppercase text-[11px]">
                    <th className="py-3.5 px-4">Usuario / Correo</th>
                    <th className="py-3.5 px-4">País / WhatsApp</th>
                    <th className="py-3.5 px-4">Nacimiento</th>
                    <th className="py-3.5 px-4">Concepción</th>
                    <th className="py-3.5 px-4">Método / Estado</th>
                    <th className="py-3.5 px-4">Rol Asignado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-stone-400">
                        Cargando usuarios desde la base de datos...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-stone-400">
                        No se encontraron usuarios que coincidan con la búsqueda.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-medium text-stone-800">
                            {u.nombre || "(Sin nombre)"} {u.apellido || ""}
                          </p>
                          <p className="text-stone-500">{u.email}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="text-stone-700">{u.pais || "-"}</p>
                          <p className="text-stone-400">{u.whatsapp || "Sin WA"}</p>
                        </td>
                        <td className="py-3.5 px-4 text-stone-600">
                          {u.fecha_nacimiento || "-"}
                        </td>
                        <td className="py-3.5 px-4 text-stone-600">
                          {formatConcepcion(u.estado_concepcion, u.fecha_concepcion)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2 py-0.5 rounded bg-stone-100 text-stone-600 capitalize mr-1">
                            {u.metodo_registro}
                          </span>
                          {Number(u.registro_completo) === 1 ? (
                            <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                              Completo
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded bg-amber-50 text-amber-700">
                              Pendiente
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={u.rol_id || 4}
                            disabled={
                              updatingUserId === u.id || u.email === "profesorjand@gmail.com"
                            }
                            onChange={(e) =>
                              handleChangeUserRole(u.id, Number(e.target.value))
                            }
                            className="bg-[var(--color-marfil)] border border-stone-300 rounded-lg px-3 py-1.5 text-xs font-medium text-stone-800 focus:outline-none focus:border-[#C47E63] disabled:opacity-60 cursor-pointer"
                          >
                            {rolesList.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.nombre} ({r.clave})
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* ============================================================= */}
        {/* PESTAÑA 4: MATRIZ INTERACTIVA DE ROLES Y PERMISOS */}
        {/* ============================================================= */}
        {activeTab === "permisos" && canManageRoles && (
          <Card className="border-[#C47E63]/20 bg-white shadow-xs animate-in fade-in duration-200">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100">
              <div>
                <CardTitle className="text-lg font-medium text-[#C47E63]">
                  Matriz Inicial y Gestión de Roles y Permisos
                </CardTitle>
                <CardDescription>
                  Haz clic en cualquier casilla (✅ / ❌) para activar o desactivar permisos en tiempo real en la base de datos
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchMatrizPermisos}
                disabled={loadingMatrix}
              >
                <RefreshCw className={`w-4 h-4 mr-1.5 ${loadingMatrix ? "animate-spin" : ""}`} />
                Refrescar Tabla
              </Button>
            </CardHeader>

            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[var(--color-marfil)] text-stone-700 border-b border-stone-200">
                    <th className="py-4 px-5 font-semibold">Permiso (`clave`)</th>
                    <th className="py-4 px-5 font-semibold">Descripción</th>
                    {rolesList.map((rol) => (
                      <th key={rol.id} className="py-4 px-4 text-center font-semibold">
                        <div className="text-stone-800">{rol.nombre}</div>
                        <code className="text-[10px] text-[#C47E63] font-normal">
                          {rol.clave}
                        </code>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {loadingMatrix ? (
                    <tr>
                      <td colSpan={2 + rolesList.length} className="py-10 text-center text-stone-400">
                        Cargando matriz de permisos...
                      </td>
                    </tr>
                  ) : (
                    permisosList.map((permiso) => {
                      const isExclusive = Number(permiso.exclusivo_super_admin) === 1
                      return (
                        <tr key={permiso.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="py-4 px-5 font-mono text-stone-800 font-medium">
                            {permiso.clave}
                          </td>
                          <td className="py-4 px-5 text-stone-600">
                            {permiso.descripcion}
                          </td>

                          {rolesList.map((rol) => {
                            const active = isPermisoAssigned(rol.id, permiso.id, rol.clave)
                            const isSuperAdminCol = rol.clave === "super_admin"
                            const locked = isSuperAdminCol || isExclusive
                            const cellKey = `${rol.id}-${permiso.id}`
                            const isSaving = togglingCell === cellKey

                            return (
                              <td key={rol.id} className="py-4 px-4 text-center">
                                <button
                                  type="button"
                                  disabled={locked || isSaving}
                                  onClick={() => handleToggleMatrixCell(rol, permiso)}
                                  title={
                                    isSuperAdminCol
                                      ? "Super Admin posee siempre todos los permisos"
                                      : isExclusive
                                      ? "Este permiso es exclusivo del Super Admin"
                                      : "Haz clic para cambiar este permiso"
                                  }
                                  className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                                    active
                                      ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium"
                                      : "bg-stone-50 border-stone-200 text-stone-400"
                                  } ${
                                    locked
                                      ? "opacity-80 cursor-not-allowed"
                                      : "hover:scale-105 hover:shadow-xs cursor-pointer"
                                  }`}
                                >
                                  {isSaving ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C47E63]" />
                                  ) : active ? (
                                    <>
                                      <span>✅</span>
                                      {isExclusive && isSuperAdminCol && (
                                        <span className="text-[10px] text-emerald-700 font-normal">
                                          (Exclusivo)
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      <span>❌</span>
                                      {isExclusive && (
                                        <Lock className="w-3 h-3 text-stone-300" />
                                      )}
                                    </>
                                  )}
                                </button>
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

      </div>
    </ProtectedRoute>
  )
}

