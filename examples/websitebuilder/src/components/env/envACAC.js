// @flow strict

import { type DimensionsType } from '../../types'
import { makeACAC } from '../../epics'

const browserDimensions = makeACAC<DimensionsType>('BROWSER_DIMENSIONS')

export {
	browserDimensions,
}
