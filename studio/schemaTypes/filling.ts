export default {
  name: 'filling',
  title: 'Fillings & Toppings',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Filling Name',
      type: 'string', // e.g., "Nutella", "Blueberry Jam", "Vanilla Cream"
    },
    {
      name: 'extraPrice',
      title: 'Extra Cost per Muffin',
      type: 'number', // Set to 0 if free
      initialValue: 0
    }
  ]
}