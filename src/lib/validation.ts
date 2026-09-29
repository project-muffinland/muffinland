// Shared by the browser (cart.astro) and the server (api/create-order.ts)

/** Strips spaces, dashes, dots and parentheses: "0888 123-456" -> "0888123456" */
export function normalizePhone(raw: string): string {
  return raw.trim().replace(/[\s\-.()]/g, '')
}

/**
 * Bulgarian numbers, with 0 / +359 / 00359 prefix:
 *  - mobile:   87x, 88x, 89x + 7 digits   (e.g. 0888 123 456)
 *  - landline: 2 + 7 digits (Sofia) or other area codes + 6-8 digits
 */
const BG_PHONE_RE = /^(?:\+359|00359|0)(?:8[7-9]\d{7}|2\d{7}|[3-79]\d{7,8}|8[0-6]\d{6,7})$/

export function isValidBgPhone(raw: string): boolean {
  return BG_PHONE_RE.test(normalizePhone(raw))
}

/** Canonical form for storage: +359888123456 */
export function toInternationalPhone(raw: string): string {
  const p = normalizePhone(raw)
  if (p.startsWith('+359')) return p
  if (p.startsWith('00359')) return '+' + p.slice(2)
  return '+359' + p.slice(1)
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isValidEmail(raw: string): boolean {
  const v = raw.trim()
  return v.length <= 254 && EMAIL_RE.test(v)
}

export const PHONE_ERROR = 'Моля въведете валиден български телефон (напр. 0888 123 456 или +359 888 123 456).'
export const EMAIL_ERROR = 'Моля въведете валиден имейл адрес (напр. example@domain.bg).'
