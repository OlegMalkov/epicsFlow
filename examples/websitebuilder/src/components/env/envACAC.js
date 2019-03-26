// @flow strict

import { type DimensionsType } from '../../types'
import { createACAC } from '../../epics'

const browserDimensions = createACAC<DimensionsType>('BROWSER_DIMENSIONS')

export {
	browserDimensions,
}
