"use client"

import { useEffect, useState } from "react"
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
import { useRouter } from "next/navigation"

export default function Preregistro() {
  const router = useRouter()
  const [nombre, setNombre] = useState("")
  const [pais, setPais] = useState("")
  const [fechaNacimiento, setFechaNacimiento] = useState("")
  const [email, setEmail] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [semanasEmbarazo, setSemanasEmbarazo] = useState("")
  
  const [avisoCorreo, setAvisoCorreo] = useState(false)
  const [avisoWhatsapp, setAvisoWhatsapp] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showExistModal, setShowExistModal] = useState(false)

  // Ya no necesitamos los useEffect que desmarcan los checkboxes
  // porque el flujo es al revés: primero marcan, luego escriben.

  useEffect(() => {
    const header = document.querySelector("header")
    const previousDisplay = header?.style.display
    if (header) {
      header.style.display = "none"
    }
    return () => {
      if (header) {
        header.style.display = previousDisplay || ""
      }
    }
  }, [])

  async function registrar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    let preferencia_aviso = "ninguno";
    if (avisoCorreo && avisoWhatsapp) preferencia_aviso = "ambos";
    else if (avisoCorreo) preferencia_aviso = "correo";
    else if (avisoWhatsapp) preferencia_aviso = "whatsapp";

    const payload = {
      nombre,
      pais,
      fecha_nacimiento: fechaNacimiento,
      email: avisoCorreo ? email : "",
      whatsapp: avisoWhatsapp ? whatsapp : "",
      semanas_embarazo: semanasEmbarazo ? parseInt(semanasEmbarazo) : 0,
      preferencia_aviso
    };

    try {
      const res = await fetch("https://api.guiadeparche.com/yogaparemba/registro_usuario.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("No JSON response:", text);
        data = { status: "error", error: "Respuesta inválida del servidor" };
      }

      if (data.status === "exists") {
        setShowExistModal(true);
      } else if (data.status === "success" || data.message) {
        setShowModal(true);
      } else {
        alert(data.error || "Ocurrió un error al guardar");
      }
    } catch (err) {
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  function handleCloseModal() {
    setShowModal(false);
    setShowExistModal(false);
    router.push("/");
  }

  // Validación estricta para habilitar el botón
  const isBaseValid = nombre.trim() !== "" && pais.trim() !== "" && fechaNacimiento.trim() !== "" && semanasEmbarazo.trim() !== "";
  const isCheckValid = avisoCorreo || avisoWhatsapp;
  const isEmailValid = avisoCorreo ? email.trim() !== "" : true;
  const isWhatsappValid = avisoWhatsapp ? whatsapp.trim() !== "" : true;
  
  const canSubmit = isBaseValid && isCheckValid && isEmailValid && isWhatsappValid && !loading;

  return (
    <div className="min-h-screen flex items-center justify-center py-10 px-4">
        <Card className="w-full max-w-lg shadow-md border-[#C47E63]/20">
          <form onSubmit={registrar}>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-light text-[#C47E63]">Pre-Registro</CardTitle>
              <CardDescription>Déjanos tus datos para avisarte cuando abra la membresía</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup className="space-y-4">
                <Field>
                  <FieldLabel htmlFor="input_nombre">Nombre completo</FieldLabel>
                  <Input
                    id="input_nombre"
                    placeholder="Tu nombre y apellido"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="input_pais">País</FieldLabel>
                  <Input
                    id="input_pais"
                    placeholder="Ej. Argentina, México, España..."
                    value={pais}
                    onChange={(e) => setPais(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="input_dob">Fecha de nacimiento</FieldLabel>
                  <Input
                    id="input_dob"
                    type="date"
                    value={fechaNacimiento}
                    onChange={(e) => setFechaNacimiento(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="input_semanas">¿En qué semana de embarazo estás?</FieldLabel>
                  <Input
                    id="input_semanas"
                    type="number"
                    min="1"
                    max="42"
                    placeholder="Ej. 20"
                    value={semanasEmbarazo}
                    onChange={(e) => setSemanasEmbarazo(e.target.value)}
                    required
                  />
                </Field>
                
                <div className="pt-2">
                  <FieldLabel className="mb-2 block text-sm font-medium">¿Cómo te gustaría que te avisemos cuando abra la membresía?</FieldLabel>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 accent-[#C47E63] rounded border-gray-300" 
                        checked={avisoCorreo} 
                        onChange={(e) => {
                          setAvisoCorreo(e.target.checked);
                          if (!e.target.checked) setEmail(""); // limpiar si se desmarca
                        }} 
                      />
                      Correo
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 accent-[#C47E63] rounded border-gray-300" 
                        checked={avisoWhatsapp} 
                        onChange={(e) => {
                          setAvisoWhatsapp(e.target.checked);
                          if (!e.target.checked) setWhatsapp(""); // limpiar si se desmarca
                        }} 
                      />
                      WhatsApp
                    </label>
                  </div>
                </div>

                {avisoCorreo && (
                  <Field className="animate-in fade-in zoom-in-95 duration-200">
                    <FieldLabel htmlFor="input_email">Email</FieldLabel>
                    <Input
                      id="input_email"
                      type="email"
                      placeholder="yoga@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required={avisoCorreo}
                    />
                  </Field>
                )}

                {avisoWhatsapp && (
                  <Field className="animate-in fade-in zoom-in-95 duration-200">
                    <FieldLabel htmlFor="input_wa">WhatsApp</FieldLabel>
                    <Input
                      id="input_wa"
                      type="tel"
                      placeholder="+54 9 11 1234 5678"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      required={avisoWhatsapp}
                    />
                  </Field>
                )}
              </FieldGroup>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full !bg-[#C47E63] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed" disabled={!canSubmit}>
                {loading ? "Registrando..." : "Confirmar Pre-Registro"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Modal de Agradecimiento */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="bg-stone-50 rounded-2xl shadow-xl max-w-md w-full p-8 text-center relative animate-in fade-in zoom-in duration-200">
              <button 
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors text-lg"
                aria-label="Cerrar"
              >
                ✕
              </button>
              <h2 className="text-2xl font-light text-[#C47E63] mb-4">🤍 Gracias por confiar en mí</h2>
              <div className="text-gray-600 space-y-3 text-sm font-light leading-relaxed">
                <p className="font-medium text-gray-800">Tu pre-registro ya quedó confirmado.</p>
                <p>Estoy creando un espacio pensado para acompañarte durante el embarazo, donde puedas moverte, respirar, relajarte y conectar con tu bebé, siempre respetando el momento único que estás viviendo.</p>
                <p>Mientras tanto, te invito a seguirme en Instagram, donde comparto información, consejos y herramientas que pueden acompañarte en esta etapa.</p>
                <p>¡Nos vemos muy pronto! 🌿<br/><span className="font-medium mt-1 inline-block text-gray-800">Tati</span></p>
              </div>
              <div className="mt-8 flex flex-col gap-3">
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
                  Volver al inicio
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Email Existente */}
        {showExistModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="bg-stone-50 rounded-2xl shadow-xl max-w-md w-full p-8 text-center relative animate-in fade-in zoom-in duration-200">
              <button 
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors text-lg"
                aria-label="Cerrar"
              >
                ✕
              </button>
              <h2 className="text-2xl font-light text-[#C47E63] mb-4">Aviso</h2>
              <div className="text-gray-600 space-y-3 text-sm font-light leading-relaxed">
                <p className="font-medium text-gray-800">Ya existe ese correo electrónico.</p>
                <p>Cuando tengamos activada la membresía te contactaremos.</p>
              </div>
              <div className="mt-8 flex flex-col gap-3">
                <button 
                  onClick={handleCloseModal}
                  className="w-full block bg-[#C47E63] text-white py-3 rounded-full text-sm font-medium hover:opacity-90 transition-all shadow-sm"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}