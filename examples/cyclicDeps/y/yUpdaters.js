// @flow strict
import { type UpdaterType, makeUpdater } from '../../../src/epics'
import { zResultC } from '../z/zVAT'
import { type YStateType, setYColor, incY, decY } from './yState'
import { isOdd } from '../utils'
import { yClicked } from './yAAC'

type YUpdaterType = UpdaterType<YStateType, *, *, *>

const yClickedUpdater: YUpdaterType = makeUpdater({
	conditions: {
		zResult: zResultC.tp(),
		_yClicked: yClicked.condition,
	},
	reducer: ({ values: { zResult }, R }) => R.updateState(isOdd(zResult)? incY: decY),
})


const zRezultChanged: YUpdaterType = makeUpdater({
	conditions: { zResult: zResultC },
	reducer: ({ values: { zResult }, R }) => R.updateState(setYColor(isOdd(zResult) ? 'green' : 'red')),
})

export const yUpdaters = {
	yClicked: yClickedUpdater,
	zRezultChanged,
}
