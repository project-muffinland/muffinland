export default {
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  fields: [
    { name: 'title', title: 'Internal Title', type: 'string', initialValue: 'Homepage', readOnly: true },

    { name: 'bestSellers', title: 'Best-Selling Muffins', type: 'array',
      of: [{ type: 'featuredMuffin' }], validation: (Rule: any) => Rule.max(6) },

    { name: 'heroImage', title: 'Hero Image', type: 'image', options: { hotspot: true },
      fields: [{ name: 'alt', title: 'Alt Text', type: 'string' }] },

    { name: 'storyImage', title: 'Story Section Image', type: 'image', options: { hotspot: true },
      fields: [{ name: 'alt', title: 'Alt Text', type: 'string' }] },

    // Add one field per additional structural slot as needed

    { name: 'gallery', title: 'Image Gallery', type: 'array', of: [{ type: 'galleryImage' }] },
  ],
};