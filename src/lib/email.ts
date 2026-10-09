// src/lib/email.ts
// Sends email through the Resend REST API using plain fetch(),
// so it works on Cloudflare Pages/Workers (no Node SDK, no Node APIs).
import {RESEND_API_KEY, EMAIL_FROM, OWNER_EMAIL} from 'astro:env/server'
import {clientEmail, ownerEmail, type OrderEmailData} from './email-templates'

const RESEND_URL = 'https://api.resend.com/emails'

// Same mechanism as sanity-server.ts: variables are declared in astro.config.mjs
// (env.schema) and imported from 'astro:env/server'.

async function sendEmail(
  apiKey: string,
  payload: {from: string; to: string[]; subject: string; html: string; reply_to?: string},
) {
  const res = await fetch(RESEND_URL, {
    method: 'POST',
    headers: {Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json'},
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`)
}

/**
 * Sends the owner notification + the customer confirmation.
 * Never throws: the order is already saved, so an email problem must not fail the checkout.
 */
export async function sendOrderEmails(_locals: unknown, order: OrderEmailData): Promise<void> {
  try {
    const apiKey = RESEND_API_KEY
    const from = EMAIL_FROM // e.g. "Muffinland <sales@muffinland.bg>"
    const owner = OWNER_EMAIL

    if (!apiKey || !from || !owner) {
      const missing = [
        !apiKey && 'RESEND_API_KEY',
        !from && 'EMAIL_FROM',
        !owner && 'OWNER_EMAIL',
      ].filter(Boolean)
      console.error('sendOrderEmails: missing env vars:', missing.join(', '))
      return
    }

    const ownerMsg = ownerEmail(order)
    const clientMsg = clientEmail(order)

    const results = await Promise.allSettled([
      sendEmail(apiKey, {from, to: [owner], subject: ownerMsg.subject, html: ownerMsg.html, reply_to: order.email}),
      sendEmail(apiKey, {from, to: [order.email], subject: clientMsg.subject, html: clientMsg.html, reply_to: owner}),
    ])
    results.forEach((r, i) => {
      if (r.status === 'rejected') console.error(`sendOrderEmails: ${i === 0 ? 'owner' : 'client'} email failed`, r.reason)
    })
  } catch (err) {
    // Anything unexpected is logged only: the order is already saved.
    console.error('sendOrderEmails: unexpected failure', err)
  }
}