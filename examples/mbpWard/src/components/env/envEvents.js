// @flow strict

import { type DimensionsType } from '../../types'
import { createEvent } from '../../../../../src/epics'

const BrowserDimensionsEvent = createEvent<DimensionsType>('BROWSER_DIMENSIONS')

export {
	BrowserDimensionsEvent,
}
