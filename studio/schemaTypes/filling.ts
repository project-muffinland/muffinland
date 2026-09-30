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
      name: 'description',
      title: 'Description (ingredients, etc.)',
      description: 'Показва се на страницата, когато клиентът избере този пълнеж. Можеш да правиш текст удебелен, курсив, подчертан и да добавяш списъци.',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }],
          lists: [
            { title: 'Bullet list', value: 'bullet' },
            { title: 'Numbered list', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
              { title: 'Underline', value: 'underline' },
            ],
            annotations: [],
          },
        },
      ],
    },
    {
      name: 'extraPrice',
      title: 'Extra Cost per Muffin',
      type: 'number',
      initialValue: 0
    },
    {
      name: 'allergens',
      title: 'Алергенииииии (Allergens)',
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