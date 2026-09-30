import { createClient } from '@sanity/client';
import { SANITY_PROJECT_ID, SANITY_DATASET } from 'astro:env/server';

export const sanityClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  useCdn: true,
  apiVersion: '2024-01-01',
});

// MUST HAVE 'export' HERE
export async function getAllMuffins() {
  return await sanityClient.fetch(`
    *[_type == "muffin"]{
      title,
      "slug": slug.current,
      baseDescription,
      "imageUrl": mainImage.asset->url
    }
  `);
}

export async function getMuffinBySlug(slug: string) {
  return await sanityClient.fetch(`
    *[_type == "muffin" && slug.current == $slug][0]{
      title,
      baseDescription,
      "mainImageUrl": mainImage.asset->url,
      "boxOptions": boxOptions[]{
        count,
        price,
        "imageUrl": boxImage.asset->url
      },
      allowIndividualPackaging,
      individualPackagingFee,
      "availableFillings": availableFillings[]->{ name, extraPrice, allergens, description }
    }
  `, { slug });
}

export async function getHomepage() {
  return await sanityClient.fetch(`
    *[_type == "homepage"][0]{
      bestSellers[]{
        "muffinTitle": muffin->title,
        "muffinSlug": muffin->slug.current,
        "muffinImageUrl": muffin->mainImage.asset->url,
        "fillingName": featuredFilling->name,
        "fillingExtraPrice": featuredFilling->extraPrice
      },
      "heroImageUrl": heroImage.asset->url,
      "heroImageAlt": heroImage.alt,
      "storyImageUrl": storyImage.asset->url,
      "storyImageAlt": storyImage.alt,
      gallery[]{
        "imageUrl": image.asset->url,
        "alt": alt,
        "muffinSlug": linkedMuffin->slug.current,
        "muffinTitle": linkedMuffin->title
      }
    }
  `);
}

// ---- Подреди си сам (muffin sets) ----
export async function getAllMuffinSets() {
  return await sanityClient.fetch(`
    *[_type == "muffinSet"] | order(order asc, title asc) {
      title,
      "slug": slug.current,
      baseDescription,
      "mainImageUrl": mainImage.asset->url,
      "muffins": muffins[]{
        "id": _key,
        title,
        description,
        "imageUrl": image.asset->url
      }
    }
  `);
}

export async function getMuffinSetBySlug(slug: string) {
  return await sanityClient.fetch(`
    *[_type == "muffinSet" && slug.current == $slug][0]{
      title,
      "slug": slug.current,
      baseDescription,
      "mainImageUrl": mainImage.asset->url,
      "muffins": muffins[]{
        "id": _key,
        title,
        description,
        "imageUrl": image.asset->url
      },
      "availableFillings": availableFillings[]->{ name, extraPrice, allergens, description },
      "boxOptions": boxOptions[]{
        count,
        price,
        "imageUrl": boxImage.asset->url
      } | order(count asc),
      allowIndividualPackaging,
      individualPackagingFee
    }
  `, { slug });
}

// Flat list of every muffin from every set, each with its set's slug + title.
// For a future general gallery: click a muffin -> link to `/podredi-si-sam/${m.setSlug}`.
export async function getAllSetMuffins() {
  const sets = await sanityClient.fetch(`
    *[_type == "muffinSet"] | order(order asc, title asc) {
      "setSlug": slug.current,
      "setTitle": title,
      "muffins": muffins[]{
        "id": _key,
        title,
        description,
        "imageUrl": image.asset->url
      }
    }
  `);
  return sets.flatMap((s: any) =>
    (s.muffins || []).map((m: any) => ({ ...m, setSlug: s.setSlug, setTitle: s.setTitle }))
  );
}