import type {APIRoute} from 'astro'
import {getBookingWindow, isISODate} from '../../lib/delivery-dates'
import {bookingId, getSanityClient, getUnavailableDates, json, sha256} from '../../lib/sanity-server'

export const prerender = false

// POST /api/book-date  { date: "YYYY-MM-DD" }
//  200 -> { ok: true, releaseToken }   date reserved
//  409 -> date already booked / blocked
//  422 -> invalid or outside the allowed window
export const POST: APIRoute = async ({request, locals}) => {
  let body: any
  try {
    body = await request.json()
  } catch {
    return json({error: 'bad_request'}, 400)
  }

  const date = body?.date
  const {min, max} = getBookingWindow()

  // 1) Server-side rules (never trust the browser)
  if (!isISODate(date) || date < min || date > max) return json({error: 'invalid_date'}, 422)

  try {
    const client = await getSanityClient(locals)

    // 2) Friendly pre-check: blocked days, and bookings created by hand in Studio
    const unavailable = await getUnavailableDates(client, date, date)
    if (unavailable.has(date)) return json({error: 'date_unavailable'}, 409)

    // 3) THE LOCK: create() with a deterministic _id is atomic.
    //    If two requests race, Sanity accepts one and rejects the other with 409.
    const releaseToken = crypto.randomUUID()
    try {
      await client.create({
        _id: bookingId(date),
        _type: 'bookedDate',
        date,
        bookedAt: new Date().toISOString(),
        tokenHash: await sha256(releaseToken),
      })
    } catch (err: any) {
      if (err?.statusCode === 409 || /already exists/i.test(err?.message ?? '')) {
        return json({error: 'date_unavailable'}, 409)
      }
      throw err
    }

    return json({ok: true, releaseToken})
  } catch (err) {
    console.error('book-date failed', err)
    return json({error: 'server_error'}, 500)
  }
}
