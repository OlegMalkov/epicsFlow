// @flow strict
import { type UpdaterType, makeUpdater } from '../../../src/epics'
import { zResultC } from '../z/zVAT'
import { isEven } from '../utils'
import { incX, decX, setXColor, type XStateType } from './xState'
import { xClicked } from './xAAC'

type XUpdaterType = UpdaterType<XStateType, *, *, *>

const xClickedUpdater: XUpdaterType = makeUpdater({
	conditions: {
		zResult: zResultC.tp(),
		_xClicked: xClicked.condition,
	},
	reducer: ({ values: { zResult }, R }) => R.updateState(isEven(zResult)? incX : decX),
})


const zResultChanged: XUpdaterType = makeUpdater({
	conditions: { zResult: zResultC },
	reducer: ({ values: { zResult }, R }) => R.updateState(setXColor(isEven(zResult) ? 'green' : 'red')),
})

export const xUpdaters = {
	xClicked: xClickedUpdater,
	zResultChanged,
}
