import {defineField, defineType} from 'sanity'

// Created ONLY by the API route (document _id = "bookedDate-YYYY-MM-DD").
// In Studio you can add a note, or DELETE the document to free the date again.
export default defineType({
  name: 'bookedDate',
  title: 'Booked day',
  type: 'document',
  fields: [
    defineField({
      name: 'date',
      title: 'Delivery date',
      type: 'date',
      readOnly: true, // must always match the document _id
      description: 'Read-only. To free this date, delete the document.',
    }),
    defineField({name: 'bookedAt', title: 'Booked at', type: 'datetime', readOnly: true}),
    defineField({
      name: 'note',
      title: 'Internal note',
      type: 'text',
      rows: 2,
      description: 'e.g. order reference, who it is for',
    }),
    // Hash of the one-time release token (used to roll back a failed checkout)
    defineField({name: 'tokenHash', type: 'string', hidden: true, readOnly: true}),
  ],
  orderings: [
    {title: 'Date, soonest first', name: 'dateAsc', by: [{field: 'date', direction: 'asc'}]},
  ],
  preview: {
    select: {date: 'date', note: 'note'},
    prepare: ({date, note}) => ({title: date || 'No date', subtitle: note || 'Booked'}),
  },
})
