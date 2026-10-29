"use server";

interface ApiResponse {
  status: "success" | "error";
  message: string;
}

export async function sendPdfAction(nombre: string, email: string): Promise<ApiResponse> {
  const PHP_ENDPOINT = "https://api.guiadeparche.com/yogaparemba/correos_recursos_gratuitos.php";

  try {
    const res = await fetch(PHP_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Importante para que el firewall de cPanel/subdominio no bloquee a Next.js
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      body: JSON.stringify({ nombre, email }),
      cache: "no-store",
    });

    const data: ApiResponse = await res.json();

    if (!res.ok) {
      return { status: "error", message: data.message || "Error en el servidor" };
    }

    return data;
  } catch (error) {
    console.error("Error conectando con PHP:", error);
    return { status: "error", message: "No se pudo conectar con el servidor." };
  }
}