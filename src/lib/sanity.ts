import { createClient } from '@sanity/client';

export const sanityClient = createClient({
  projectId: 'jfsf87io',
  dataset: 'production',
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
      "availableFillings": availableFillings[]->{ name, extraPrice, allergens }
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