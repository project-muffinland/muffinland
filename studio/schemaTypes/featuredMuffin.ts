export default {
  name: 'featuredMuffin',
  title: 'Featured Muffin',
  type: 'object',
  fields: [
    {
      name: 'muffin',
      title: 'Muffin',
      type: 'reference',
      to: [{ type: 'muffin' }],
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'featuredFilling',
      title: 'Featured Filling',
      type: 'reference',
      to: [{ type: 'filling' }],
      description: 'Which filling to showcase for this muffin on the homepage.',
    },
  ],
  preview: {
    select: {
      title: 'muffin.title',
      fillingName: 'featuredFilling.name',
      media: 'muffin.mainImage',
    },
    prepare({ title, fillingName, media }: any) {
      return {
        title: title || 'No muffin selected',
        subtitle: fillingName ? `Filling: ${fillingName}` : 'No filling selected',
        media,
      };
    },
  },
};