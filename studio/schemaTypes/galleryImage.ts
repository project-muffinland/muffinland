export default {
  name: 'galleryImage',
  title: 'Gallery Image',
  type: 'object',
  fields: [
    { name: 'image', title: 'Image', type: 'image', options: { hotspot: true },
      validation: (Rule: any) => Rule.required() },
    { name: 'alt', title: 'Alt Text', type: 'string', validation: (Rule: any) => Rule.required() },
    { name: 'linkedMuffin', title: 'Linked Muffin (optional)', type: 'reference', to: [{ type: 'muffin' }] },
  ],
  preview: {
    select: { media: 'image', title: 'alt', muffinTitle: 'linkedMuffin.title' },
    prepare({ media, title, muffinTitle }: any) {
      return { title, subtitle: muffinTitle ? `Links to: ${muffinTitle}` : undefined, media };
    },
  },
};