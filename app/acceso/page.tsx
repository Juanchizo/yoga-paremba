"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, RefreshCw, User, LogOut, LayoutDashboard } from "lucide-react"
import { getStoredUser, setStoredUser, removeStoredUser, hasPermission, AuthUser } from "@/lib/auth"

const API_BASE_URL = "https://api.tatimonteroyoga.com"

export default function AccesoPage() {
  const router = useRouter()

  // Estados de navegación del flujo
  const [step, setStep] = useState<"login" | "otp" | "register" | "success">("login")

  // Estado si ya está logueado previamente
  const [alreadyLoggedUser, setAlreadyLoggedUser] = useState<AuthUser | null>(null)

  // Datos de autenticación
  const [email, setEmail] = useState("")
  const [codigoOtp, setCodigoOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [infoMessage, setInfoMessage] = useState("")

  // Datos del formulario de registro
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [fechaNacimiento, setFechaNacimiento] = useState("")
  const [pais, setPais] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  
  // Concepción: 'fecha' | 'no_aplica' | 'aun_no_se'
  const [estadoConcepcion, setEstadoConcepcion] = useState<"fecha" | "no_aplica" | "aun_no_se">("no_aplica")
  const [fechaConcepcion, setFechaConcepcion] = useState("")

  // Modal final de bienvenida
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [mensajeBienvenida, setMensajeBienvenida] = useState("¡Registro completado con éxito!")
  const [detalleBienvenida, setDetalleBienvenida] = useState("")

  // 1. Verificar si ya hay sesión iniciada y cargar SDK de Google
  useEffect(() => {
    const user = getStoredUser()
    if (user) {
      setAlreadyLoggedUser(user)
    }

    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  // -------------------------------------------------------------
  // 1. MANEJO DE LOGIN CON GOOGLE (Popup OAuth2 Confiable)
  // -------------------------------------------------------------
  function handleGoogleLogin() {
    setErrorMessage("")
    setInfoMessage("")

    const clientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      "939920240885-pfvqac9avs2v7pe1q9ti5970587ma51l.apps.googleusercontent.com"
    if (!clientId) {
      setErrorMessage(
        "Falta configurar NEXT_PUBLIC_GOOGLE_CLIENT_ID en .env.local y en Vercel."
      )
      return
    }

    // @ts-expect-error - Google Identity Services está en window
    if (typeof window !== "undefined" && window.google?.accounts?.oauth2) {
      setLoading(true)

      // @ts-expect-error - Google OAuth2 Token Client
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "openid email profile",
        callback: async (tokenResponse: { access_token?: string; error?: string }) => {
          if (tokenResponse.error || !tokenResponse.access_token) {
            setLoading(false)
            return
          }

          try {
            // Obtener perfil del usuario autenticado desde Google
            const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            })
            const googleUser = await userInfoRes.json()

            if (!googleUser.email) {
              setErrorMessage("No se pudo obtener el correo de tu cuenta de Google.")
              setLoading(false)
              return
            }

            // Consultar en nuestra base de datos (GoDaddy)
            const res = await fetch(`${API_BASE_URL}/auth_google.php`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: googleUser.email,
                google_id: googleUser.sub,
                nombre: googleUser.given_name || "",
                apellido: googleUser.family_name || "",
              }),
            })

            const data = await res.json()
            if (data.status === "success") {
              setEmail(googleUser.email)
              if (data.nombre_sugerido) setNombre(data.nombre_sugerido)
              if (data.apellido_sugerido) setApellido(data.apellido_sugerido)

              if (data.requiere_registro) {
                setStep("register")
              } else {
                setStoredUser(data.usuario)
                if (hasPermission(data.usuario, "ver_dashboard")) {
                  router.push("/dashboard")
                } else {
                  router.push("/")
                }
              }
            } else {
              setErrorMessage(data.message || "Error al autenticar con Google.")
            }
          } catch (err) {
            console.error(err)
            setErrorMessage("Error de conexión al procesar tu cuenta de Google.")
          } finally {
            setLoading(false)
          }
        },
      })

      tokenClient.requestAccessToken({ prompt: "select_account" })
    } else {
      setErrorMessage("Cargando servicio de Google, intenta de nuevo en un segundo.")
    }
  }

  // -------------------------------------------------------------
  // 2. ENVIAR CÓDIGO TEMPORAL (OTP) POR CORREO
  // -------------------------------------------------------------
  async function handleEnviarCodigo(e: React.FormEvent) {
    e.preventDefault()
    setErrorMessage("")
    setInfoMessage("")

    if (!email || !email.includes("@")) {
      setErrorMessage("Por favor ingresa un correo electrónico válido.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/enviar_codigo.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })

      const data = await res.json()
      if (data.status === "success") {
        setInfoMessage(data.message)
        setStep("otp")
      } else {
        setErrorMessage(data.message || "No se pudo enviar el código.")
      }
    } catch (err) {
      console.error(err)
      setErrorMessage("Error de conexión con el servidor.")
    } finally {
      setLoading(false)
    }
  }

  // -------------------------------------------------------------
  // 3. VERIFICAR CÓDIGO OTP (30 MINUTOS)
  // -------------------------------------------------------------
  async function handleVerificarCodigo(e: React.FormEvent) {
    e.preventDefault()
    setErrorMessage("")
    setInfoMessage("")

    if (!codigoOtp || codigoOtp.trim().length < 6) {
      setErrorMessage("Ingresa el código completo de 6 dígitos.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/verificar_codigo.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          codigo: codigoOtp.trim(),
        }),
      })

      const data = await res.json()
      if (data.status === "success") {
        if (data.requiere_registro) {
          if (data.nombre_sugerido) setNombre(data.nombre_sugerido)
          if (data.apellido_sugerido) setApellido(data.apellido_sugerido)
          setStep("register")
        } else {
          setStoredUser(data.usuario)
          if (hasPermission(data.usuario, "ver_dashboard")) {
            router.push("/dashboard")
          } else {
            router.push("/")
          }
        }
      } else {
        setErrorMessage(data.message || "Código incorrecto o expirado.")
      }
    } catch (err) {
      console.error(err)
      setErrorMessage("Error de conexión al verificar el código.")
    } finally {
      setLoading(false)
    }
  }

  // -------------------------------------------------------------
  // 4. COMPLETAR REGISTRO DE DATOS Y ENVIAR GUÍA PDF
  // -------------------------------------------------------------
  async function handleCompletarRegistro(e: React.FormEvent) {
    e.preventDefault()
    setErrorMessage("")

    if (!nombre.trim() || !apellido.trim() || !pais.trim() || !fechaNacimiento) {
      setErrorMessage("Por favor completa los campos obligatorios.")
      return
    }

    if (estadoConcepcion === "fecha" && !fechaConcepcion) {
      setErrorMessage("Por favor selecciona la fecha de concepción o marca otra opción.")
      return
    }

    setLoading(true)
    try {
      const payload = {
        email: email.trim().toLowerCase(),
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        fecha_nacimiento: fechaNacimiento,
        pais: pais.trim(),
        whatsapp: whatsapp.trim() || null,
        estado_concepcion: estadoConcepcion,
        fecha_concepcion: estadoConcepcion === "fecha" ? fechaConcepcion : null,
        datos_adicionales: {
          origen_registro: "web_tatimontero",
          fecha_alta: new Date().toISOString(),
        },
      }

      const res = await fetch(`${API_BASE_URL}/completar_registro.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.status === "success") {
        if (data.usuario) {
          setStoredUser(data.usuario)
        }
        setMensajeBienvenida("¡Tu registro quedó confirmado con éxito!")
        setDetalleBienvenida("Te hemos enviado un correo electrónico con la 'Guía para Embarazadas' en PDF adjunta para que puedas comenzar a disfrutarla.")
        setShowSuccessModal(true)
      } else {
        setErrorMessage(data.message || "Ocurrió un error al guardar tus datos.")
      }
    } catch (err) {
      console.error(err)
      setErrorMessage("Error de conexión al registrar los datos.")
    } finally {
      setLoading(false)
    }
  }

  function handleCloseModal() {
    setShowSuccessModal(false)
    const logged = getStoredUser()
    if (hasPermission(logged, "ver_dashboard")) {
      router.push("/dashboard")
    } else {
      router.push("/")
    }
  }

  function handleLogout() {
    removeStoredUser()
    setAlreadyLoggedUser(null)
    setStep("login")
  }

  // -------------------------------------------------------------
  // CASO: EL USUARIO YA ESTÁ LOGUEADO
  // -------------------------------------------------------------
  if (alreadyLoggedUser) {
    const canGoDashboard = hasPermission(alreadyLoggedUser, "ver_dashboard")
    return (
      <div className="flex items-center justify-center py-12 px-4 min-h-[70vh]">
        <Card className="w-full max-w-md shadow-md border-[#C47E63]/20 bg-[var(--color-crema)] text-center p-6">
          <CardHeader>
            <div className="w-16 h-16 bg-[#C47E63]/15 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="w-8 h-8 text-[#C47E63]" />
            </div>
            <CardTitle className="text-2xl font-light text-[#C47E63]">Ya has iniciado sesión</CardTitle>
            <CardDescription className="text-stone-600">
              Estás conectada como <strong className="text-stone-800">{alreadyLoggedUser.nombre || alreadyLoggedUser.email}</strong>{" "}
              ({alreadyLoggedUser.rol?.nombre || "Estudiante"}).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {canGoDashboard && (
              <Button
                onClick={() => router.push("/dashboard")}
                className="w-full !bg-[#C47E63] hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Ir a mi Panel de Control
              </Button>
            )}
            <Button
              variant={canGoDashboard ? "outline" : "default"}
              onClick={() => router.push("/")}
              className={canGoDashboard ? "w-full border-[#C47E63]/30 !text-[#C47E63]" : "w-full !bg-[#C47E63] hover:opacity-90 transition-opacity"}
            >
              Ir a la página de inicio
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full border-stone-300 text-stone-600 hover:text-red-600 hover:bg-red-50 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-8 px-4 min-h-[75vh]">
      <Card className="w-full max-w-lg shadow-md border-[#C47E63]/20 bg-[var(--color-crema)] transition-all">
        
        {/* MENSAJES DE ALERTA O ERROR */}
        {errorMessage && (
          <div className="mx-6 mt-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {infoMessage && (
          <div className="mx-6 mt-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg flex items-center gap-2">
            <span>ℹ️</span>
            <span>{infoMessage}</span>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VISTA 1: ACCESO (GOOGLE O CORREO ELECTRÓNICO) */}
        {/* ------------------------------------------------------------- */}
        {step === "login" && (
          <div>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-light text-[#C47E63]">Acceso a Tati Yoga</CardTitle>
              <CardDescription className="mb-2">
                Ingresa a tu cuenta o regístrate para comenzar tu acompañamiento
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Opción 1: Botón Google */}
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-[var(--color-marfil)] hover:bg-white text-gray-700 border-stone-300 py-5 shadow-sm font-normal"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continuar con Google</span>
                </Button>
              </div>

              {/* Separador */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-[#C47E63]/20"></div>
                <span className="flex-shrink mx-4 text-xs uppercase tracking-wider text-stone-500">
                  o con tu correo
                </span>
                <div className="flex-grow border-t border-[#C47E63]/20"></div>
              </div>

              {/* Opción 2: Formulario de Correo */}
              <form onSubmit={handleEnviarCodigo} className="space-y-4">
                <Field>
                  <FieldLabel htmlFor="login_email">Correo electrónico</FieldLabel>
                  <div className="relative">
                    <Input
                      id="login_email"
                      type="email"
                      placeholder="nombre@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-[var(--color-marfil)] shadow-md px-4 pl-10 box-border"
                    />
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Te enviaremos un código temporal de 6 dígitos para acceder.
                  </p>
                </Field>

                <Button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full !bg-[#C47E63] hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Enviando código...</span>
                    </>
                  ) : (
                    <>
                      <span>Recibir código de acceso</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VISTA 2: VERIFICACIÓN DEL CÓDIGO OTP (30 MINUTOS) */}
        {/* ------------------------------------------------------------- */}
        {step === "otp" && (
          <div>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-light text-[#C47E63]">Verifica tu Código</CardTitle>
              <CardDescription className="mb-2">
                Enviamos un código de 6 dígitos a <strong className="text-stone-800">{email}</strong>
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleVerificarCodigo}>
              <CardContent className="space-y-4">
                <div className="bg-[var(--color-marfil)] p-4 rounded-xl text-center border border-[#C47E63]/15">
                  <ShieldCheck className="w-8 h-8 text-[#C47E63] mx-auto mb-2" />
                  <p className="text-xs text-stone-600">
                    Introduce el código que recibiste. Es válido durante <strong>30 minutos</strong>.
                  </p>
                </div>

                <Field>
                  <FieldLabel htmlFor="otp_input" className="text-center block">
                    Código de acceso
                  </FieldLabel>
                  <Input
                    id="otp_input"
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={codigoOtp}
                    onChange={(e) => setCodigoOtp(e.target.value.replace(/\D/g, ""))}
                    required
                    className="bg-[var(--color-marfil)] shadow-md text-center text-2xl font-semibold tracking-[8px] py-6 box-border"
                    autoFocus
                  />
                </Field>

                <div className="flex justify-between items-center text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("login")
                      setCodigoOtp("")
                      setErrorMessage("")
                    }}
                    className="text-stone-600 hover:text-stone-900 underline flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" /> Cambiar correo
                  </button>

                  <button
                    type="button"
                    onClick={handleEnviarCodigo}
                    disabled={loading}
                    className="text-[#C47E63] hover:underline font-medium"
                  >
                    Reenviar código
                  </button>
                </div>
              </CardContent>

              <CardFooter className="pt-2">
                <Button
                  type="submit"
                  disabled={loading || codigoOtp.length < 6}
                  className="w-full !bg-[#C47E63] hover:opacity-90 transition-opacity"
                >
                  {loading ? "Verificando..." : "Ingresar"}
                </Button>
              </CardFooter>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VISTA 3: COMPLETAR REGISTRO DE DATOS */}
        {/* ------------------------------------------------------------- */}
        {step === "register" && (
          <div>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-light text-[#C47E63]">Completa tu Perfil</CardTitle>
              <CardDescription className="mb-2">
                Déjanos tus datos para acompañarte de manera personalizada en tu embarazo
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleCompletarRegistro}>
              <CardContent>
                <FieldGroup className="space-y-4">
                  
                  {/* Nombre y Apellido */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field>
                      <FieldLabel htmlFor="reg_nombre">Nombre</FieldLabel>
                      <Input
                        id="reg_nombre"
                        placeholder="Tu nombre"
                        value={nombre}
                        className="bg-[var(--color-marfil)] shadow-md px-4 box-border"
                        onChange={(e) => setNombre(e.target.value)}
                        required
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="reg_apellido">Apellido</FieldLabel>
                      <Input
                        id="reg_apellido"
                        placeholder="Tu apellido"
                        value={apellido}
                        className="bg-[var(--color-marfil)] shadow-md px-4 box-border"
                        onChange={(e) => setApellido(e.target.value)}
                        required
                      />
                    </Field>
                  </div>

                  {/* Correo Electrónico (Solo Lectura) */}
                  <Field>
                    <FieldLabel htmlFor="reg_email">Correo verificado</FieldLabel>
                    <Input
                      id="reg_email"
                      type="email"
                      value={email}
                      disabled
                      className="bg-stone-100 text-stone-600 shadow-sm px-4 box-border cursor-not-allowed opacity-80"
                    />
                  </Field>

                  {/* País */}
                  <Field>
                    <FieldLabel htmlFor="reg_pais">País de residencia</FieldLabel>
                    <Input
                      id="reg_pais"
                      placeholder="Ej. Argentina, México, España, Chile..."
                      value={pais}
                      className="bg-[var(--color-marfil)] shadow-md px-4 box-border"
                      onChange={(e) => setPais(e.target.value)}
                      required
                    />
                  </Field>

                  {/* Fecha de Nacimiento */}
                  <Field>
                    <FieldLabel htmlFor="reg_dob">Fecha de nacimiento</FieldLabel>
                    <Input
                      id="reg_dob"
                      type="date"
                      value={fechaNacimiento}
                      className="bg-[var(--color-marfil)] shadow-md px-4 box-border"
                      onChange={(e) => setFechaNacimiento(e.target.value)}
                      required
                    />
                  </Field>

                  {/* WhatsApp (Opcional) */}
                  <Field>
                    <FieldLabel htmlFor="reg_whatsapp">
                      WhatsApp <span className="text-xs text-[#C47E63] font-normal">(opcional)</span>
                    </FieldLabel>
                    <Input
                      id="reg_whatsapp"
                      type="tel"
                      placeholder="+54 9 11 1234 5678"
                      className="bg-[var(--color-marfil)] shadow-md px-4 box-border"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                    />
                  </Field>

                  {/* Concepción o Fecundación */}
                  <Field className="pt-1">
                    <FieldLabel>¿Cuándo fue la concepción o fecundación?</FieldLabel>
                    
                    {/* Botones de selección de estado */}
                    <div className="grid grid-cols-3 gap-2 mt-1.5">
                      <button
                        type="button"
                        onClick={() => setEstadoConcepcion("fecha")}
                        className={`py-2 px-2 text-xs rounded-lg border transition-all text-center ${
                          estadoConcepcion === "fecha"
                            ? "bg-[#C47E63] text-white border-[#C47E63] font-medium shadow-sm"
                            : "bg-[var(--color-marfil)] text-stone-700 border-stone-300 hover:bg-stone-100"
                        }`}
                      >
                        Sé la fecha
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEstadoConcepcion("aun_no_se")
                          setFechaConcepcion("")
                        }}
                        className={`py-2 px-2 text-xs rounded-lg border transition-all text-center ${
                          estadoConcepcion === "aun_no_se"
                            ? "bg-[#C47E63] text-white border-[#C47E63] font-medium shadow-sm"
                            : "bg-[var(--color-marfil)] text-stone-700 border-stone-300 hover:bg-stone-100"
                        }`}
                      >
                        Aún no lo sé
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEstadoConcepcion("no_aplica")
                          setFechaConcepcion("")
                        }}
                        className={`py-2 px-2 text-xs rounded-lg border transition-all text-center ${
                          estadoConcepcion === "no_aplica"
                            ? "bg-[#C47E63] text-white border-[#C47E63] font-medium shadow-sm"
                            : "bg-[var(--color-marfil)] text-stone-700 border-stone-300 hover:bg-stone-100"
                        }`}
                      >
                        No aplica
                      </button>
                    </div>

                    {/* Si seleccionó "Sé la fecha", mostramos el input de fecha */}
                    {estadoConcepcion === "fecha" && (
                      <div className="mt-3 animate-in fade-in duration-200">
                        <Input
                          id="reg_concepcion_fecha"
                          type="date"
                          value={fechaConcepcion}
                          onChange={(e) => setFechaConcepcion(e.target.value)}
                          required
                          className="bg-[var(--color-marfil)] shadow-md px-4 box-border"
                        />
                      </div>
                    )}
                  </Field>

                </FieldGroup>
              </CardContent>

              <CardFooter className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full !bg-[#C47E63] hover:opacity-90 transition-opacity font-medium"
                >
                  {loading ? "Guardando..." : "Confirmar Registro"}
                </Button>
              </CardFooter>
            </form>
          </div>
        )}
      </Card>

      {/* ------------------------------------------------------------- */}
      {/* MODAL DE BIENVENIDA / ÉXITO CON AVISO DE PDF */}
      {/* ------------------------------------------------------------- */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-stone-50 rounded-2xl shadow-xl max-w-md w-full p-8 text-center relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors text-lg"
              aria-label="Cerrar"
            >
              ✕
            </button>
            <div className="flex justify-center mb-3">
              <CheckCircle2 className="w-12 h-12 text-[#C47E63]" />
            </div>
            <h2 className="text-2xl font-light text-[#C47E63] mb-3">🤍 Gracias por confiar en mí</h2>
            <div className="space-y-3 text-sm font-light leading-relaxed text-stone-700">
              <p className="font-medium text-gray-800">{mensajeBienvenida}</p>
              {detalleBienvenida ? (
                <p className="bg-[#C47E63]/10 text-[#C47E63] p-3 rounded-lg text-xs leading-relaxed font-normal">
                  📄 {detalleBienvenida}
                </p>
              ) : null}
              <p>
                Estoy creando un espacio pensado para acompañarte durante el embarazo, donde puedas
                moverte, respirar, relajarte y conectar con tu cuerpo y tu bebé.
              </p>
              <p>
                Mientras tanto, te invito a seguirme en Instagram, donde comparto herramientas y contenidos diarios.
              </p>
              <p>
                ¡Nos vemos muy pronto! 🌿
                <br />
                <span className="font-medium mt-1 inline-block text-gray-800">Tati Montero</span>
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <a
                href="https://www.instagram.com/tatimonteroyoga"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block bg-[#C47E63] text-white py-3 rounded-full text-sm font-medium hover:opacity-90 transition-all shadow-sm"
              >
                👉 Seguir en Instagram @tatimonteroyoga
              </a>
              <button
                onClick={handleCloseModal}
                className="text-sm text-gray-500 hover:text-gray-800 underline transition-colors"
              >
                Ir al inicio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

