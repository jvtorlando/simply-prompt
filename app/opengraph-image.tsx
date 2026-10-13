import { ImageResponse } from "next/og"

export const alt = "Simply Prompt — Transforme algumas respostas em um prompt feito para você."
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#f8f6f2",
          color: "#1c1a17",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 36, fontWeight: 600 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#1c1a17",
              color: "#f8f6f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="34" height="34" viewBox="0 0 32 32">
              <path d="M16 3c.7 6.6 4.4 10.3 11 11-6.6.7-10.3 4.4-11 11-.7-6.6-4.4-10.3-11-11 6.6-.7 10.3-4.4 11-11Z" fill="#f8f6f2" />
            </svg>
          </div>
          Simply Prompt
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05, maxWidth: 980 }}>
            Transforme algumas respostas em um prompt feito para você.
          </div>
          <div style={{ fontSize: 30, color: "#5b5650" }}>Treino · Estudos · Carreira · Inglês · Produtividade</div>
        </div>
        <div style={{ display: "flex", height: 8, width: 160, borderRadius: 8, background: "#e0603f" }} />
      </div>
    ),
    size,
  )
}
