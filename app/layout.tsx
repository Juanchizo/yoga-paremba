import { Geist, Geist_Mono, Roboto_Slab, Noto_Serif } from "next/font/google"
import Header from "@/app/Header/page"
import Footer from "@/app/Footer/page"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";

const notoSerifHeading = Noto_Serif({subsets:['latin'],variable:'--font-heading'});

const robotoSlab = Roboto_Slab({subsets:['latin'],variable:'--font-serif'});

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontSans.variable, fontMono.variable, "font-serif", robotoSlab.variable, notoSerifHeading.variable)}
    >
      <body>
        <Header />
        <ThemeProvider>{children}</ThemeProvider>
        <Footer />
      </body>
    </html>
  )
}
