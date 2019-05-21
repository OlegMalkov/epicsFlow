// @flow strict

import { type DimensionsType } from '../../types'
import { createEvent } from '../../../../../src/epics'

const browserDimensions = createEvent<DimensionsType>('BROWSER_DIMENSIONS')

export {
	browserDimensions,
}
