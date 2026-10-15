import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"
import { Bricolage_Grotesque, Geist_Mono, Instrument_Sans } from "next/font/google"
import "./globals.css"

// Títulos com personalidade, texto de leitura neutro e mono só para o texto do prompt.
const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz"],
})

const text = Instrument_Sans({
  variable: "--font-text",
  subsets: ["latin"],
})

const mono = Geist_Mono({
  variable: "--font-mono-prompt",
  subsets: ["latin"],
})

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000"

const title = "Simply Prompt — Prompts personalizados para o seu dia a dia"
const description =
  "Responda perguntas rápidas e gere prompts personalizados para treino, estudos, carreira, inglês e produtividade."

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: "Simply Prompt",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Simply Prompt",
    title,
    description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
}

export const viewport: Viewport = {
  themeColor: "#f8f6f2",
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${text.variable} ${mono.variable} antialiased`}
      style={{ colorScheme: "light" }}>
      <body className="min-h-dvh bg-background text-foreground">{children}</body>
    </html>
  )
}
