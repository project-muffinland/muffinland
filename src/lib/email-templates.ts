// src/lib/email-templates.ts
// Simple HTML emails (inline styles, table layout = works in all mail clients).
// Edit the copy/styling here whenever you want to change the emails.

export type OrderEmailData = {
  orderNumber: string
  customerName: string
  address: string
  phone: string
  email: string
  notes?: string
  deliveryDate: string // YYYY-MM-DD
  totalPrice: number
  items: {
    title: string
    boxCount: number
    fillingName?: string
    quantity: number
    linePrice: number
    isPackaged?: boolean
    allergens?: string
  }[]
}

// All user-provided text goes through this before landing in HTML
const esc = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const eur = (n: number) => `€${Number(n).toFixed(2)}`
const bgDate = (iso: string) => iso.split('-').reverse().join('.')

function itemsTable(o: OrderEmailData) {
  const rows = o.items
    .map(
      (i) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #eee;vertical-align:top;">
          <strong>${esc(i.quantity)}× ${esc(i.title)}</strong> (кутия от ${esc(i.boxCount)})
          ${i.fillingName ? `<br><span style="color:#777;font-size:13px;">Пълнеж: ${esc(i.fillingName)}</span>` : ''}
          ${i.isPackaged ? `<br><span style="color:#777;font-size:13px;">Индивидуална опаковка</span>` : ''}
          ${i.allergens ? `<br><span style="color:#777;font-size:13px;">Алергени: ${esc(i.allergens)}</span>` : ''}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;vertical-align:top;white-space:nowrap;">${eur(i.linePrice)}</td>
      </tr>`,
    )
    .join('')
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;">
      ${rows}
      <tr>
        <td style="padding:14px 0 0;font-weight:bold;font-size:17px;">Общо</td>
        <td style="padding:14px 0 0;text-align:right;font-weight:bold;font-size:17px;">${eur(o.totalPrice)}</td>
      </tr>
    </table>`
}

function layout(title: string, inner: string) {
  return `<!doctype html>
<html lang="bg">
<body style="margin:0;padding:0;background:#f6f1ee;font-family:Arial,Helvetica,sans-serif;color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f1ee;padding:24px 12px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;padding:28px;">
        <tr><td>
          <h1 style="margin:0 0 20px;font-size:22px;color:#d6457b;">${esc(title)}</h1>
          ${inner}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ---------- Email to the customer ----------
export function clientEmail(o: OrderEmailData) {
  const html = layout(
    'Благодарим за поръчката!',
    `
    <p style="margin:0 0 16px;">Здравейте, ${esc(o.customerName)}!</p>
    <p style="margin:0 0 16px;">Получихме вашата поръчка <strong>${esc(o.orderNumber)}</strong>. Ще се свържем с вас скоро за потвърждение.</p>

    <h3 style="margin:24px 0 8px;font-size:16px;">Вашата поръчка</h3>
    ${itemsTable(o)}

    <h3 style="margin:24px 0 8px;font-size:16px;">Доставка</h3>
    <p style="margin:0;font-size:15px;line-height:1.5;">
      Дата: ${esc(bgDate(o.deliveryDate))}<br>
      Адрес: ${esc(o.address)}<br>
      Телефон: ${esc(o.phone)}
      ${o.notes ? `<br>Забележка: ${esc(o.notes)}` : ''}
    </p>

    <h3 style="margin:24px 0 8px;font-size:16px;">Начини на плащане</h3>
    <p style="margin:0;font-size:15px;line-height:1.5;">
      <!-- TODO: replace with the real payment info -->
      Информация за начините на плащане може да намерите тук.
    </p>

    <p style="margin:28px 0 0;color:#777;font-size:13px;">Муфинландия</p>`,
  )
  return {subject: `Вашата поръчка ${o.orderNumber} в Muffinland`, html}
}

// ---------- Email to the owner ----------
export function ownerEmail(o: OrderEmailData) {
  const html = layout(
    `Нова поръчка ${o.orderNumber}`,
    `
    <h3 style="margin:0 0 8px;font-size:16px;">Клиент</h3>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.5;">
      ${esc(o.customerName)}<br>
      Телефон: ${esc(o.phone)}<br>
      Имейл: ${esc(o.email)}<br>
      Адрес: ${esc(o.address)}<br>
      Дата на доставка: <strong>${esc(bgDate(o.deliveryDate))}</strong>
      ${o.notes ? `<br>Забележка: ${esc(o.notes)}` : ''}
    </p>

    <h3 style="margin:24px 0 8px;font-size:16px;">Продукти</h3>
    ${itemsTable(o)}`,
  )
  return {subject: `Нова поръчка ${o.orderNumber} – ${o.customerName}`, html}
}
