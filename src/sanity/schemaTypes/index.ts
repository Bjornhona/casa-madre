import {type SchemaTypeDefinition} from 'sanity'

import {neighbourhood} from './neighbourhood'
import {property} from './property'
import {testimonial} from './testimonial'

export const schema: {types: SchemaTypeDefinition[]} = {
  types: [property, neighbourhood, testimonial],
}
