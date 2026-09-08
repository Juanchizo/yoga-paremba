import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Aquí process.env.API_KEY SÍ se lee correctamente
    const response = await fetch("https://api.restcountries.com/countries/v5", {
      headers: {
        Authorization: `Bearer ${process.env.API_KEY}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: "Error al consultar la API externa" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}