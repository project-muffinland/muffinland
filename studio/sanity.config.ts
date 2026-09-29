import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

const HIDDEN_FROM_DEFAULT_LIST = ['blockedDate', 'bookedDate', 'order']

export default defineConfig({
  name: 'default',
  title: 'muffinland',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  dataset: process.env.SANITY_STUDIO_DATASET!,

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Orders')
              .schemaType('order')
              .child(
                S.documentTypeList('order')
                  .title('Orders')
                  .defaultOrdering([{field: 'createdAt', direction: 'desc'}]),
              ),
            S.listItem()
              .title('Delivery calendar')
              .child(
                S.list()
                  .title('Delivery calendar')
                  .items([
                    S.listItem()
                      .title('Blocked days (holidays, days off)')
                      .schemaType('blockedDate')
                      .child(
                        S.documentTypeList('blockedDate')
                          .title('Blocked days')
                          .defaultOrdering([{field: 'from', direction: 'asc'}]),
                      ),
                    S.listItem()
                      .title('Booked days (from orders)')
                      .schemaType('bookedDate')
                      .child(
                        // documentList (not documentTypeList) => no "create" button
                        S.documentList()
                          .title('Booked days')
                          .schemaType('bookedDate')
                          .filter('_type == "bookedDate"')
                          .defaultOrdering([{field: 'date', direction: 'asc'}]),
                      ),
                  ]),
              ),
            S.divider(),
            ...S.documentTypeListItems().filter(
              (item) => !HIDDEN_FROM_DEFAULT_LIST.includes(item.getId() as string),
            ),
          ]),
    }),
    visionTool(),
  ],

  schema: {types: schemaTypes},

  document: {
    // Booked days are created by the API only, never by hand
    newDocumentOptions: (prev) => prev.filter((o) => o.templateId !== 'bookedDate'),
  },
})