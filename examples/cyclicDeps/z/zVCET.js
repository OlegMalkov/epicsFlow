// @flow strict
import { type ZStateType } from './zState'
import { createEpicCondition } from '../../../src/epics'

const zCondition = createEpicCondition<ZStateType>('Z_VCET')
const zResultC = zCondition.wsk('result')

export {
	zCondition,
	zResultC,
}
