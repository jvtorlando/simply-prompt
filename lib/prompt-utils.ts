/** Texto sem espaços sobrando nas pontas e sem espaço antes de quebra de linha. */
export const clean = (value: string) => value.trim().replace(/\s+\n/g, "\n")

/** Converte "2026-12-01" em "01/12/2026". Outros formatos voltam como vieram. */
export function formatDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value.trim()
}

export const bulletList = (items: string[]) => items.map((item) => `- ${item}`).join("\n")
export const numberedList = (items: string[]) => items.map((item, i) => `${i + 1}. ${item}`).join("\n")
