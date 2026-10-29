"use server";

interface ApiResponse {
  status: "success" | "error";
  message: string;
}

export async function sendPdfAction(nombre: string, email: string): Promise<ApiResponse> {
  const PHP_ENDPOINT = "https://api.guiadeparche.com/yogaparemba/correos_recursos_gratuitos.php"; // Cambia por tu dominio real

  try {
    const res = await fetch(PHP_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nombre, email }),
      cache: "no-store",
    });

    const data: ApiResponse = await res.json();

    if (!res.ok) {
      return { status: "error", message: datas.message};
    }

    return data;
  } catch (error) {
    console.error("Error conectando con PHP:", error);
    return { status: "error", message: "No se pudo conectar con el servidor." };
  }
}