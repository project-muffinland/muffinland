import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'order',
  title: 'Order',
  type: 'document',
  fields: [
    defineField({name: 'customerName', title: 'Customer name', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'address', title: 'Delivery address', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'phone', title: 'Phone', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'email', title: 'Email', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'notes', title: 'Additional notes', type: 'text', rows: 3}),
    defineField({name: 'deliveryDate', title: 'Delivery date', type: 'date', validation: (r) => r.required()}),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'orderItem',
          fields: [
            defineField({name: 'title', title: 'Muffin', type: 'string'}),
            defineField({name: 'boxCount', title: 'Muffins per box', type: 'number'}),
            defineField({name: 'fillingName', title: 'Filling', type: 'string'}),
            defineField({name: 'quantity', title: 'Quantity (boxes)', type: 'number'}),
            defineField({name: 'linePrice', title: 'Line price (€)', type: 'number'}),
            defineField({name: 'isPackaged', title: 'Individually packaged', type: 'boolean'}),
            defineField({name: 'allergens', title: 'Allergens', type: 'string'}),
          ],
          preview: {
            select: {title: 'title', quantity: 'quantity', boxCount: 'boxCount', filling: 'fillingName', price: 'linePrice'},
            prepare: ({title, quantity, boxCount, filling, price}) => ({
              title: `${quantity}× ${title} (box of ${boxCount})`,
              subtitle: `${filling ?? ''} · €${Number(price ?? 0).toFixed(2)}`,
            }),
          },
        },
      ],
    }),
    defineField({name: 'totalPrice', title: 'Total (€)', type: 'number'}),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      initialValue: 'pending',
      options: {
        list: [
          {title: 'Pending', value: 'pending'},
          {title: 'Confirmed', value: 'confirmed'},
          {title: 'Delivered', value: 'delivered'},
        ],
        layout: 'radio',
      },
    }),
    defineField({name: 'createdAt', title: 'Created at', type: 'datetime', readOnly: true}),
  ],
  orderings: [
    {title: 'Newest first', name: 'createdAtDesc', by: [{field: 'createdAt', direction: 'desc'}]},
    {title: 'Delivery date', name: 'deliveryDateAsc', by: [{field: 'deliveryDate', direction: 'asc'}]},
  ],
  preview: {
    select: {name: 'customerName', date: 'deliveryDate', total: 'totalPrice', status: 'status'},
    prepare: ({name, date, total, status}) => ({
      title: `${name ?? 'Order'} — €${Number(total ?? 0).toFixed(2)}`,
      subtitle: `${status ?? 'pending'} · delivery ${date ?? '?'}`,
    }),
  },
})
