// @flow strict
import { type ZStateType } from './zState'
import { makeEpicCondition } from '../../../src/epics'

const zCondition = makeEpicCondition<ZStateType>('Z')
const zResultC = zCondition.wsk('result')

export {
	zCondition,
	zResultC,
}
