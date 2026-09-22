export default {
  name: 'filling',
  title: 'Fillings & Toppings',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Filling Name',
      type: 'string', 
    },
    {
      name: 'extraPrice',
      title: 'Extra Cost per Muffin',
      type: 'number',
      initialValue: 0
    },
    {
      name: 'allergens',
      title: 'Алергени (Allergens)',
      description: 'Изберете алергените, които се съдържат в този пълнеж.',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        // By providing only the list (without layout: 'tags'), Sanity automatically renders checkboxes
        list: [
          { title: 'Ядки (Nuts)', value: 'Ядки' },
          { title: 'Млечни (Dairy)', value: 'Млечни продукти' },
          { title: 'Глутен (Gluten)', value: 'Глутен' },
          { title: 'Яйца (Eggs)', value: 'Яйца' },
          { title: 'Соя (Soy)', value: 'Соя' }
        ]
      }
    }
  ]
}