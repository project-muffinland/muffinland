import type {APIRoute} from 'astro'
import {getSanityClient, json} from '../../lib/sanity-server'
import {
  isValidBgPhone,
  isValidEmail,
  toInternationalPhone,
  PHONE_ERROR,
  EMAIL_ERROR,
} from '../../lib/validation'

export const prerender = false

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : null)
// Cart values can be stored as numeric strings (e.g. boxCount "6"), so accept both
const numLoose = (v: unknown) => {
  const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : v
  return typeof n === 'number' && Number.isFinite(n) && n >= 0 ? n : null
}
const round2 = (n: number) => Math.round(n * 100) / 100

export const POST: APIRoute = async ({request, locals}) => {
  let body: any
  try {
    body = await request.json()
  } catch {
    return json({ok: false, error: 'Невалидна заявка.'}, 400)
  }

  const customerName = str(body.customerName, 120)
  const address = str(body.address, 300)
  const phone = str(body.phone, 30)
  const email = str(body.email, 254)
  const notes = str(body.notes, 1000)
  const deliveryDate = str(body.deliveryDate, 10)

  // --- required fields ---
  if (!customerName || !address || !phone || !email || !deliveryDate) {
    return json({ok: false, error: 'Моля попълнете всички задължителни полета.'}, 422)
  }
  if (!isValidBgPhone(phone)) return json({ok: false, error: PHONE_ERROR, field: 'phone'}, 422)
  if (!isValidEmail(email)) return json({ok: false, error: EMAIL_ERROR, field: 'email'}, 422)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(deliveryDate) || Number.isNaN(Date.parse(deliveryDate))) {
    return json({ok: false, error: 'Невалидна дата за доставка.', field: 'deliveryDate'}, 422)
  }

  // --- items: identify only, never trust prices from the browser ---
  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 50) {
    return json({ok: false, error: 'Количката е празна.'}, 422)
  }
  const requested = body.items.map((raw: any) => ({
    title: str(raw?.title, 150),
    boxCount: numLoose(raw?.boxCount),
    fillingName: str(raw?.fillingName, 150),
    quantity: numLoose(raw?.quantity),
    isPackaged: Boolean(raw?.isPackaged),
    clientLinePrice: numLoose(raw?.linePrice),
    // "Подреди си сам" sets only
    setSlug: str(raw?.setSlug, 120),
    mix: Array.isArray(raw?.mix)
      ? raw.mix.slice(0, 50).map((x: any) => ({id: str(x?.id, 60), name: str(x?.name, 150), qty: numLoose(x?.qty)}))
      : [],
  }))
  if (requested.some((r: any) => !r.title || r.boxCount === null || !Number.isInteger(r.quantity) || r.quantity < 1 || r.quantity > 100)) {
    return json({ok: false, error: 'Невалидни продукти в поръчката.'}, 422)
  }

  let client
  try {
    client = await getSanityClient(locals)
  } catch (err) {
    console.error('create-order: client init failed', err)
    return json({ok: false, error: 'Неуспешен запис на поръчката.'}, 500)
  }

  // Real prices, straight from Sanity
  type Muffin = {
    title: string
    boxOptions?: {count: number; price: number}[]
    allowIndividualPackaging?: boolean
    individualPackagingFee?: number
    fillings?: {name: string; extraPrice?: number; allergens?: string[]}[]
  }
  const titles = [...new Set<string>(requested.map((r: any) => r.title))]
  let muffins: Muffin[]
  try {
    muffins = await client.fetch<Muffin[]>(
      `*[_type == "muffin" && title in $titles]{
        title,
        "boxOptions": boxOptions[]{count, price},
        allowIndividualPackaging,
        individualPackagingFee,
        "fillings": availableFillings[]->{name, extraPrice, allergens}
      }`,
      {titles},
    )
  } catch (err) {
    console.error('create-order: price lookup failed', err)
    return json({ok: false, error: 'Неуспешен запис на поръчката.'}, 500)
  }
  const byTitle = new Map(muffins.map((m) => [m.title, m]))

  // Build-your-own sets ("Подреди си сам") are priced from their own document type
  type MuffinSet = {
    title: string
    slug: string
    boxOptions?: {count: number; price: number}[]
    allowIndividualPackaging?: boolean
    individualPackagingFee?: number
    fillings?: {name: string; extraPrice?: number; allergens?: string[]}[]
    varieties?: {id: string; title: string}[]
  }
  const setSlugs = [...new Set<string>(requested.map((r: any) => r.setSlug).filter(Boolean))]
  let sets: MuffinSet[] = []
  if (setSlugs.length > 0) {
    try {
      sets = await client.fetch<MuffinSet[]>(
        `*[_type == "muffinSet" && slug.current in $slugs]{
          title,
          "slug": slug.current,
          "boxOptions": boxOptions[]{count, price},
          allowIndividualPackaging,
          individualPackagingFee,
          "fillings": availableFillings[]->{name, extraPrice, allergens},
          "varieties": muffins[]{"id": _key, title}
        }`,
        {slugs: setSlugs},
      )
    } catch (err) {
      console.error('create-order: set price lookup failed', err)
      return json({ok: false, error: 'Неуспешен запис на поръчката.'}, 500)
    }
  }
  const bySlug = new Map(sets.map((st) => [st.slug, st]))

  const items: Record<string, unknown>[] = []
  let sum = 0
  for (const r of requested) {
    // ---- "Подреди си сам" set box: same rules as a muffin box, plus the mix must add up ----
    if (r.setSlug) {
      const st = bySlug.get(r.setSlug)
      const sBox = st?.boxOptions?.find((b) => b.count === r.boxCount)
      if (!st || !sBox || typeof sBox.price !== 'number') {
        return json({ok: false, error: 'Продуктът вече не е наличен. Моля презаредете количката.'}, 409)
      }
      const sFillings = st.fillings ?? []
      const sFilling = sFillings.find((f) => f?.name === r.fillingName)
      if (sFillings.length > 0 && !sFilling) {
        return json({ok: false, error: 'Пълнежът вече не е наличен. Моля презаредете количката.'}, 409)
      }
      if (r.isPackaged && !st.allowIndividualPackaging) {
        return json({ok: false, error: 'Индивидуалната опаковка не е налична за този продукт.'}, 422)
      }

      // every chosen muffin must exist in the set, and the total must equal the box size.
      // Muffins are matched by their Sanity _key (not by text), so spaces/renames can't break it.
      const varieties = st.varieties ?? []
      const byId = new Map(varieties.map((v) => [v.id, v.title]))
      const mixMap = new Map<string, number>() // _key -> qty
      for (const x of r.mix) {
        // older carts (before ids existed) fall back to matching the name
        const id = byId.has(x.id) ? x.id : varieties.find((v) => (v.title ?? '').trim() === x.name)?.id
        if (!id || !Number.isInteger(x.qty) || x.qty < 1) {
          console.warn('create-order: invalid mix entry', {set: r.setSlug, entry: x, available: varieties})
          return json({ok: false, error: 'Невалиден избор на мъфини. Моля презаредете количката.'}, 409)
        }
        mixMap.set(id, (mixMap.get(id) ?? 0) + x.qty)
      }
      const mixTotal = [...mixMap.values()].reduce((a, b) => a + b, 0)
      if (mixTotal !== r.boxCount) {
        console.warn('create-order: mix total mismatch', {set: r.setSlug, mixTotal, boxCount: r.boxCount})
        return json({ok: false, error: 'Броят мъфини не съвпада с размера на кутията.'}, 422)
      }
      const mixText = [...mixMap.entries()].map(([id, qty]) => `${qty}× ${(byId.get(id) ?? '').trim()}`).join(', ')

      const sUnit = round2(
        sBox.price +
          (sFilling?.extraPrice ?? 0) * r.boxCount +
          (r.isPackaged ? (st.individualPackagingFee ?? 0) * r.boxCount : 0),
      )
      const sLinePrice = round2(sUnit * r.quantity)
      if (r.clientLinePrice === null || Math.abs(r.clientLinePrice - sLinePrice) > 0.01) {
        console.warn('create-order: set price mismatch', {set: r.setSlug, client: r.clientLinePrice, server: sLinePrice})
        return json({ok: false, error: 'Цените са променени. Моля презаредете количката.'}, 409)
      }

      sum += sLinePrice
      items.push({
        _type: 'orderItem',
        _key: crypto.randomUUID().slice(0, 12),
        title: `${st.title} (Подреди си сам)`,
        boxCount: r.boxCount,
        // mix is stored in the existing fillingName field so the order schema/Studio need no changes
        fillingName: [sFilling?.name, mixText].filter(Boolean).join(' | '),
        quantity: r.quantity,
        linePrice: sLinePrice,
        isPackaged: r.isPackaged,
        allergens: (sFilling?.allergens ?? []).join(', '),
      })
      continue
    }

    const m = byTitle.get(r.title)
    const box = m?.boxOptions?.find((b) => b.count === r.boxCount)
    if (!m || !box || typeof box.price !== 'number') {
      return json({ok: false, error: 'Продуктът вече не е наличен. Моля презаредете количката.'}, 409)
    }

    // Filling: must be one of the muffin's available fillings (if it has any)
    const fillings = m.fillings ?? []
    const filling = fillings.find((f) => f?.name === r.fillingName)
    if (fillings.length > 0 && !filling) {
      return json({ok: false, error: 'Пълнежът вече не е наличен. Моля презаредете количката.'}, 409)
    }

    if (r.isPackaged && !m.allowIndividualPackaging) {
      return json({ok: false, error: 'Индивидуалната опаковка не е налична за този продукт.'}, 422)
    }

    // unit (one box) = box price + filling extra per muffin * muffins in box + packaging fee
    const unit = round2(
      box.price +
        (filling?.extraPrice ?? 0) * r.boxCount +
        (r.isPackaged ? (m.individualPackagingFee ?? 0) * r.boxCount : 0),
    )
    const linePrice = round2(unit * r.quantity)

    // The customer saw a price in the cart. If it differs from the real one,
    // the cart is stale or was edited: reject instead of silently charging another price.
    if (r.clientLinePrice === null || Math.abs(r.clientLinePrice - linePrice) > 0.01) {
      console.warn('create-order: price mismatch', {title: r.title, client: r.clientLinePrice, server: linePrice})
      return json({ok: false, error: 'Цените са променени. Моля презаредете количката.'}, 409)
    }

    sum += linePrice
    items.push({
      _type: 'orderItem',
      _key: crypto.randomUUID().slice(0, 12),
      title: m.title,
      boxCount: r.boxCount,
      fillingName: filling?.name ?? '',
      quantity: r.quantity,
      linePrice,
      isPackaged: r.isPackaged,
      allergens: (filling?.allergens ?? []).join(', '),
    })
  }
  const totalPrice = round2(sum)
  const clientTotal = numLoose(body.totalPrice)
  if (clientTotal === null || Math.abs(clientTotal - totalPrice) > 0.01) {
    return json({ok: false, error: 'Цените са променени. Моля презаредете количката.'}, 409)
  }

  try {
    const doc = await client.create({
      _type: 'order',
      customerName,
      address,
      phone: toInternationalPhone(phone),
      email,
      ...(notes ? {notes} : {}),
      deliveryDate,
      items,
      totalPrice,
      status: 'pending',
      createdAt: new Date().toISOString(),
    })
    return json({ok: true, orderId: doc._id})
  } catch (err) {
    console.error('create-order failed', err)
    return json({ok: false, error: 'Неуспешен запис на поръчката.'}, 500)
  }
}