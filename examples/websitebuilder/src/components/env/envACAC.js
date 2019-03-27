// @flow strict

import { type DimensionsType } from '../../types'
import { makeActionCreatorAndCondition } from '../../../../../src/epics'

const browserDimensions = makeActionCreatorAndCondition<DimensionsType>('BROWSER_DIMENSIONS')

export {
	browserDimensions,
}
