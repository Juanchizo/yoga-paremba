"use client"
import { supabase } from "@/lib/client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldGroup, Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function Preregistro() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

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

  async function registrar() {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      console.log(error.message)
    }

    console.log(data)
  }

  return (
    <div className="min-h-screen flex items-center justify-center justify-between">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Pre-Registro</CardTitle>
            <CardDescription>Registrate rellenando el formulario</CardDescription>
            <CardAction>
              <Button variant="link">Log In</Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="inputgmail">Email</FieldLabel>
                <Input
                  id="inputgmail"
                  placeholder="yoga123@gmail.com"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <FieldDescription>Coloca tu Email</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="inputpass">Contraseña</FieldLabel>
                <Input
                  id="inputpass"
                  type="password"
                  placeholder="ejemplo: Yoga_123*"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <FieldDescription>Coloca tu Contraseña</FieldDescription>
              </Field>
              <Field>
                <FieldLabel>¿En qué semana de embarazo estás?</FieldLabel>
                
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter>
            <Button className="w-full !bg-[#C47E63]" onClick={registrar}>
              Registrarse
            </Button>
          </CardFooter>
        </Card>
    </div>
  )
}

export default Preregistro