export default {
  name: 'muffinSet',
  title: 'Muffin Sets (Подреди си сам)',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Set Name',
      type: 'string', // e.g., "Пролетна колекция"
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug (URL identifier)',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'order',
      title: 'Display Order (lower = first)',
      type: 'number',
      initialValue: 100,
    },
    {
      name: 'baseDescription',
      title: 'Set Description',
      type: 'string',
    },
    {
      name: 'mainImage',
      title: 'Set Cover Image',
      type: 'image',
      options: { hotspot: true },
    },

    // ---- The different muffin looks that live inside this set ----
    {
      name: 'muffins',
      title: 'Muffins in this Set',
      description:
        'Всички видове мъфини в комплекта. Клиентът избира колко от кой вид да има в кутията си.',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'setMuffin',
          fields: [
            { name: 'title', title: 'Muffin Name', type: 'string', validation: (Rule: any) => Rule.required() },
            { name: 'image', title: 'Muffin Image', type: 'image', options: { hotspot: true } },
            { name: 'description', title: 'Short Description (optional)', type: 'string' },
          ],
          preview: {
            select: { title: 'title', media: 'image', subtitle: 'description' },
          },
        },
      ],
      validation: (Rule: any) => Rule.min(1),
    },

    // ---- Same as muffin.ts ----
    {
      name: 'availableFillings',
      title: 'Available Fillings',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'filling' }] }],
    },
    {
      name: 'boxOptions',
      title: 'Box Quantity Options',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'count', title: 'Number of Muffins', type: 'number' }, // 4, 6, 12, 24 or custom
            { name: 'price', title: 'Price for Box', type: 'number' },
            { name: 'boxImage', title: 'Image for this Box Size', type: 'image' },
          ],
          preview: {
            select: { count: 'count', price: 'price', media: 'boxImage' },
            prepare: ({ count, price, media }: any) => ({
              title: `${count} бр.`,
              subtitle: `€${price}`,
              media,
            }),
          },
        },
      ],
    },
    {
      name: 'allowIndividualPackaging',
      title: 'Allow Individual Packaging Inside Box?',
      type: 'boolean',
      initialValue: true,
    },
    {
      name: 'individualPackagingFee',
      title: 'Extra Fee for Individual Packaging per Muffin',
      type: 'number',
      initialValue: 2.0,
    },
  ],
  preview: {
    select: { title: 'title', media: 'mainImage' },
  },
}