"use client"
import React from 'react'

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"

import { Calendar } from "@/components/ui/calendar"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from 'react'


function fieldregis() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  const [data, setData] = useState([])

    useEffect(() => {
      async function fetchData() {
        try {
          // Haces la petición a tu endpoint interno
          const response = await fetch("/api/countries")
          const result = await response.json()
          setData(result)
        } catch (error) {
          console.error("Error cargando países:", error)
        }
      }

      fetchData()
    }, [])

  return (
    <div className="max-w-xl mx-auto p-4 my-auto">
      <FieldSet >
        <FieldLegend>Pre-Registro</FieldLegend>
        <FieldDescription>Rellena los Campos</FieldDescription>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor='nombre'>Nombre</FieldLabel>
            <Input id="nombre" autoComplete="off" placeholder="Pon tu Nombre" />
          </Field>
          <Field>
            <FieldLabel htmlFor='apellido'>Pais</FieldLabel>
            <Combobox>
              <ComboboxInput placeholder="Selecciona tu pais" />
            </Combobox>
          </Field>
          <Field>
            <FieldLabel htmlFor='fecha-nac'>Fecha de Nacimiento</FieldLabel>
            <FieldLabel>Tu fecha = "{date?.toLocaleDateString()}"</FieldLabel>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-lg border max-w-sm"
                  captionLayout="dropdown"
                  
                />
            
          </Field>
          <Field>
            <FieldLabel htmlFor='email'>Email</FieldLabel>
            <Input id="email" autoComplete="off" placeholder="Ejemplo: usuario@ejemplo.com" />
          </Field>
          <Field>
            <FieldLabel htmlFor='whatsapp'>Whatsapp</FieldLabel>
            <Input id="whatsapp" autoComplete="off" placeholder="Ejemplo: 1234567890" />
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>
  )
}

export default fieldregis
