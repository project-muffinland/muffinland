import {createClient, type SanityClient} from '@sanity/client'
import {SANITY_PROJECT_ID, SANITY_DATASET, SANITY_WRITE_TOKEN} from 'astro:env/server'
import {expandRange} from './delivery-dates'

export async function getSanityClient(locals?: any): Promise<SanityClient> {
  return createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    apiVersion: '2024-03-21',
    useCdn: false, // always fresh, never cached
    perspective: 'published',
    token: SANITY_WRITE_TOKEN,
  })
}

/** Every date in [min, max] that is booked or blocked. */
export async function getUnavailableDates(
  client: SanityClient,
  min: string,
  max: string,
): Promise<Set<string>> {
  const [booked, blocked] = await Promise.all([
    client.fetch<string[]>(`*[_type == "bookedDate" && date >= $min && date <= $max].date`, {min, max}),
    client.fetch<{from: string; to: string}[]>(
      `*[_type == "blockedDate" && from <= $max && coalesce(to, from) >= $min]{from, "to": coalesce(to, from)}`,
      {min, max},
    ),
  ])
  const set = new Set<string>(booked)
  for (const b of blocked) expandRange(b.from, b.to, min, max).forEach((d) => set.add(d))
  return set
}

export const bookingId = (date: string) => `bookedDate-${date}`

export async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {'Content-Type': 'application/json', 'Cache-Control': 'no-store'},
  })
