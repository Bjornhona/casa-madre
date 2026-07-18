import type {StructureResolver} from 'sanity/structure'
import {HomeIcon, PinIcon, CommentIcon, DocumentTextIcon, UsersIcon} from '@sanity/icons'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Casa Madre')
    .items([
      S.documentTypeListItem('property').title('Propiedades').icon(HomeIcon),
      S.documentTypeListItem('neighbourhood').title('Barrios').icon(PinIcon),
      S.documentTypeListItem('testimonial').title('Testimonios').icon(CommentIcon),
      S.documentTypeListItem('journalPost').title('Artículos del Journal').icon(DocumentTextIcon),
      S.documentTypeListItem('agent').title('Equipo').icon(UsersIcon),
    ])
