import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"
import { Geist_Mono, Inter } from "next/font/google"
import { AmbientBackground } from "@/components/ambient-background"
import "./globals.css"

// A fonte da Apple (SF Pro) vem do sistema, pela pilha -apple-system; a licença não permite embuti-la.
// Fora dos aparelhos Apple, o Inter (o mais próximo) assume.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

// Mono só para o texto do prompt.
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
    <html lang="pt-BR" className={`${inter.variable} ${mono.variable} antialiased`}
      style={{ colorScheme: "light" }}>
      <body className="min-h-dvh text-foreground">
        <AmbientBackground />
        {children}
      </body>
    </html>
  )
}
