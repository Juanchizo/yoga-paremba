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

  useEffect(() => {
    if (activeTab === "usuarios" && hasPermission(user, "gestionar_usuarios")) {
      fetchUsuarios()
    } else if (activeTab === "permisos" && hasPermission(user, "gestionar_roles")) {
      fetchMatrizPermisos()
    }
  }, [activeTab, user, fetchUsuarios, fetchMatrizPermisos])

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

  const canUseEditor = hasPermission(user, "acceso_editor")
  const canManageUsers = hasPermission(user, "gestionar_usuarios")
  const canManageRoles = hasPermission(user, "gestionar_roles")

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
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
              <div>
                <h2 className="text-lg font-medium text-[#C47E63]">
                  Editor de Contenido Guttenberg
                </h2>
                <p className="text-xs text-stone-500">
                  Estás trabajando dentro de tu Panel (`/dashboard`). Los cambios se mantienen mientras navegas por el editor.
                </p>
              </div>

              <Button
                type="button"
                onClick={() => {
                  console.log("HTML actual:", htmlGuttenbergContent.html)
                  console.log("CSS guttenberg.css:", htmlGuttenbergContent.css)
                  guardarHtmlGuttenberg(htmlGuttenbergContent.html);

                  setStatusBanner({
                    type: "ok",
                    text: "Contenido HTML y CSS generados correctamente (revisa también la consola F12).",
                  })
                }}
                className="!bg-[#C47E63] hover:opacity-90 text-white text-xs cursor-pointer"
              >
                Guardar / Obtener HTML
              </Button>
            </div>

            <div className="bg-white rounded-xl shadow-xs border border-stone-200 overflow-hidden">
              <HtmlEditorGuttenberg
                id="editor-dashboard"
                name="contenido"
                styleMode="custom"
                enableCssEditor={true}
                onChange={(data) => {
                  console.log("Editando en vivo:", data.html)
                }}
                onSave={(data) => {
                  console.log("Guardado desde barra del editor:", data)
                  setStatusBanner({
                    type: "ok",
                    text: "¡Guardado emitido desde el editor Guttenberg!",
                  })
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

