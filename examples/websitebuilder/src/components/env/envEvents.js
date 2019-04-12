// @flow strict

import { type DimensionsType } from '../../types'
import { makeEvent } from '../../../../../src/epics'

const browserDimensions = makeEvent<DimensionsType>('BROWSER_DIMENSIONS')

export {
	browserDimensions,
}
