export interface UserRole {
  id: number
  clave: "super_admin" | "admin" | "docente" | "estudiante" | string
  nombre: string
  descripcion?: string
}

export interface AuthUser {
  id?: number
  email: string
  metodo_registro?: "google" | "email" | string
  nombre?: string
  apellido?: string
  fecha_nacimiento?: string | null
  pais?: string | null
  whatsapp?: string | null
  estado_concepcion?: "fecha" | "no_aplica" | "aun_no_se" | string | null
  fecha_concepcion?: string | null
  datos_adicionales?: Record<string, unknown> | null
  registro_completo?: number
  ultimo_acceso?: string | null
  created_at?: string | null
  rol?: UserRole
  permisos?: string[]
}

const STORAGE_KEY = "tati_user"
export const API_BASE_URL = "https://api.tatimonteroyoga.com"

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setStoredUser(user: AuthUser): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    window.dispatchEvent(new Event("authChange"))
  } catch (e) {
    console.error("Error guardando sesión:", e)
  }
}

export function removeStoredUser(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new Event("authChange"))
  } catch (e) {
    console.error("Error eliminando sesión:", e)
  }
}

/**
 * Comprueba si el usuario tiene un permiso específico o es super_admin.
 */
export function hasPermission(user: AuthUser | null, permisoClave: string): boolean {
  if (!user) return false
  if (user.rol?.clave === "super_admin") return true
  if (!Array.isArray(user.permisos)) return false
  return user.permisos.includes(permisoClave)
}

/**
 * Comprueba si el usuario tiene un rol específico.
 */
export function hasRole(user: AuthUser | null, rolClave: string): boolean {
  if (!user || !user.rol) return false
  return user.rol.clave === rolClave
}

/**
 * Consulta la base de datos en tiempo real para actualizar los datos,
 * rol y permisos vigentes del correo electrónico conectado.
 */
export async function refreshUserFromDB(emailOverride?: string): Promise<AuthUser | null> {
  const current = getStoredUser()
  const email = emailOverride || current?.email
  if (!email) return null

  try {
    const res = await fetch(`${API_BASE_URL}/obtener_perfil.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    if (data.status === "success" && data.usuario) {
      setStoredUser(data.usuario)
      return data.usuario
    }
  } catch (err) {
    console.error("No se pudo sincronizar el perfil con la BD:", err)
  }
  return current
}
