"use client"

import * as React from "react"

type Theme = "light" | "dark"

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Asegurarse de que la clase "dark" se remueva siempre y nunca se agregue
  React.useEffect(() => {
    document.documentElement.classList.remove("dark")
  }, [])

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme: "light",
      resolvedTheme: "light",
      setTheme: () => {}, // Desactivamos el cambio de tema
    }),
    []
  )

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

function useTheme() {
  const context = React.useContext(ThemeContext)

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}

export { ThemeProvider, useTheme }
