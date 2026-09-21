export default {
  name: 'muffin',
  title: 'Muffins',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Muffin Name',
      type: 'string', // e.g., "Rose Petal Velvet"
    },
    {
      name: 'slug',
      title: 'Slug (URL identifier)',
      type: 'slug',
      options: { source: 'title' }
    },
    {
      name: 'baseDescription',
      title: 'Base & Flower Style Description',
      type: 'string', // e.g., "Tulip-shaped cup with sugar rose flower"
    },
    {
      name: 'mainImage',
      title: 'Muffin Base Image',
      type: 'image',
      options: { hotspot: true }
    },
    // Reference available fillings for this specific muffin
    {
      name: 'availableFillings',
      title: 'Available Fillings',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'filling' }] }]
    },
    // Box Quantities and Pricing
    {
      name: 'boxOptions',
      title: 'Box Quantity Options',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'count', title: 'Number of Muffins', type: 'number' }, // 4, 6, 12, or 24
            { name: 'price', title: 'Price for Box', type: 'number' },
            { name: 'boxImage', title: 'Image for this Box Size', type: 'image' } // Optional unique photo
          ]
        }
      ]
    },
    // Separate Packaging Option Toggle
    {
      name: 'allowIndividualPackaging',
      title: 'Allow Individual Packaging Inside Box?',
      type: 'boolean',
      initialValue: true
    },
    {
      name: 'individualPackagingFee',
      title: 'Extra Fee for Individual Packaging per Box',
      type: 'number',
      initialValue: 2.00 // e.g., $2.00 extra for wrapping each individually
    }
  ]
}