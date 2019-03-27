// @flow strict

import { type DimensionsType } from '../../types'
import { createACAC } from '../../../../../src/epics'

const browserDimensions = createACAC<DimensionsType>('BROWSER_DIMENSIONS')

export {
	browserDimensions,
}
