import type {APIRoute} from 'astro'
import {getBookingWindow} from '../../lib/delivery-dates'
import {getSanityClient, getUnavailableDates, json} from '../../lib/sanity-server'

export const prerender = false

// GET /api/delivery-dates -> { min, max, unavailable: ["2026-10-05", ...] }
export const GET: APIRoute = async ({locals}) => {
  try {
    const {min, max} = getBookingWindow()
    const client = await getSanityClient(locals)
    const unavailable = [...(await getUnavailableDates(client, min, max))].sort()
    return json({min, max, unavailable})
  } catch (err) {
    console.error('delivery-dates GET failed', err)
    return json({error: 'unavailable'}, 500)
  }
}
