import {type SchemaTypeDefinition} from 'sanity'

import {agent} from './agent'
import {journalPost} from './journalPost'
import {neighbourhood} from './neighbourhood'
import {property} from './property'
import {testimonial} from './testimonial'

export const schema: {types: SchemaTypeDefinition[]} = {
  types: [property, neighbourhood, testimonial, journalPost, agent],
}
