import type {APIRoute} from 'astro'
import {isISODate} from '../../lib/delivery-dates'
import {bookingId, getSanityClient, json, sha256} from '../../lib/sanity-server'

export const prerender = false

const MAX_AGE_MS = 15 * 60 * 1000 // a reservation can only be rolled back for 15 minutes

// POST /api/release-date { date, releaseToken }
// Rolls back a reservation when the order email/form failed to send.
export const POST: APIRoute = async ({request, locals}) => {
  let body: any
  try {
    body = await request.json()
  } catch {
    return json({error: 'bad_request'}, 400)
  }
  const {date, releaseToken} = body ?? {}
  if (!isISODate(date) || typeof releaseToken !== 'string') return json({error: 'bad_request'}, 400)

  try {
    const client = await getSanityClient(locals)
    const doc = await client.getDocument<{tokenHash?: string; bookedAt?: string}>(bookingId(date))
    if (!doc) return json({ok: true}) // already free

    const tokenOk = doc.tokenHash && doc.tokenHash === (await sha256(releaseToken))
    const fresh = doc.bookedAt && Date.now() - new Date(doc.bookedAt).getTime() < MAX_AGE_MS
    if (!tokenOk || !fresh) return json({error: 'forbidden'}, 403)

    await client.delete(bookingId(date))
    return json({ok: true})
  } catch (err) {
    console.error('release-date failed', err)
    return json({error: 'server_error'}, 500)
  }
}
