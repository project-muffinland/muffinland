import {defineField, defineType} from 'sanity'

// Managed by hand in Studio: holidays, days off, vacations.
export default defineType({
  name: 'blockedDate',
  title: 'Blocked day(s)',
  type: 'document',
  fields: [
    defineField({
      name: 'from',
      title: 'Date (or first day of the range)',
      type: 'date',
      options: {dateFormat: 'YYYY-MM-DD'},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'to',
      title: 'Last day (optional, leave empty for a single day)',
      type: 'date',
      options: {dateFormat: 'YYYY-MM-DD'},
      validation: (r) =>
        r.custom((to, ctx) => {
          const from = (ctx.document as any)?.from
          if (to && from && to < from) return 'The last day must be on or after the first day'
          return true
        }),
    }),
    defineField({
      name: 'reason',
      title: 'Reason (internal note)',
      type: 'string',
      placeholder: 'e.g. Public holiday, day off',
    }),
  ],
  orderings: [
    {title: 'Date, soonest first', name: 'fromAsc', by: [{field: 'from', direction: 'asc'}]},
  ],
  preview: {
    select: {from: 'from', to: 'to', reason: 'reason'},
    prepare: ({from, to, reason}) => ({
      title: to && to !== from ? `${from} → ${to}` : from || 'No date',
      subtitle: reason || 'Blocked',
    }),
  },
})
