import type {StructureResolver} from 'sanity/structure'
import {HomeIcon, PinIcon, CommentIcon, DocumentTextIcon} from '@sanity/icons'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Casa Madre')
    .items([
      S.documentTypeListItem('property').title('Properties').icon(HomeIcon),
      S.documentTypeListItem('neighbourhood').title('Neighbourhoods').icon(PinIcon),
      S.documentTypeListItem('testimonial').title('Testimonials').icon(CommentIcon),
      S.documentTypeListItem('journalPost').title('Artículos del Journal').icon(DocumentTextIcon),
    ])
