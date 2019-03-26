// @flow strict
import { type UpdaterType, createUpdater } from '../../../src/epics'
import { zResultC } from '../z/zVAT'
import { isEven } from '../utils'
import { incX, decX, setXColor, type XStateType } from './xState'
import { xClicked } from './xAAC'

type XUpdaterType = UpdaterType<XStateType, *, *, *>

const xClickedUpdater: XUpdaterType = createUpdater({
	dependsOn: { zResult: zResultC },
	when: {
		_xClicked: xClicked.condition,
	},
	then: ({ values: { zResult }, R }) => R.updateState(isEven(zResult)? incX : decX),
})


const zResultChanged: XUpdaterType = createUpdater({
	dependsOn: { },
	when: { zResult: zResultC },
	then: ({ values: { zResult }, R }) => R.updateState(setXColor(isEven(zResult) ? 'green' : 'red')),
})

export const xUpdaters = {
	xClicked: xClickedUpdater,
	zResultChanged,
}
