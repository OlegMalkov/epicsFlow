// @flow strict
import { createEpicCondition } from '../../../src/epics'
import { initialZState } from './zState'

const zCondition = createEpicCondition<typeof initialZState>('Z_VAT')
const zResultC = zCondition.wsk('result')

export {
	zCondition,
	zResultC,
}
