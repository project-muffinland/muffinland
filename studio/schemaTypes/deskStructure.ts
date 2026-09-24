import { StructureBuilder } from 'sanity/desk';

export const structure = (S: StructureBuilder) =>
  S.list().title('Content').items([
    S.listItem()
      .title('Homepage')
      .id('homepage-singleton')
      .child(S.document().schemaType('homepage').documentId('homepage')),
    S.divider(),
    ...S.documentTypeListItems().filter((item) => item.getId() !== 'homepage'),
  ]);