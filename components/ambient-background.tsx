/** Manchas de cor suaves e fixas atrás da página: dão ao vidro algo para refratar. Só transform, pausadas com movimento reduzido. */
export function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="sp-orb sp-orb-a" />
      <div className="sp-orb sp-orb-b" />
      <div className="sp-orb sp-orb-c" />
    </div>
  )
}
