// @flow strict
import { type UpdaterType, createUpdater } from '../../../src/epics'
import { zResultC } from '../z/zVAT'
import { setYColor, incY, decY, initialYState } from './yState'
import { isOdd } from '../utils'
import { yClicked } from './yAAC'

type YUpdaterType = UpdaterType<typeof initialYState, *, *, *>

const yClickedUpdater: YUpdaterType = createUpdater({
	given: { zResult: zResultC },
	when: {
		_yClicked: yClicked.condition,
	},
	then: ({ values: { zResult }, R }) => R.mapState(isOdd(zResult)? incY: decY),
})


const zRezultChanged: YUpdaterType = createUpdater({
	given: {},
	when: { zResult: zResultC },
	then: ({ values: { zResult }, R }) => R.mapState(setYColor(isOdd(zResult) ? 'green' : 'red')),
})

export const yUpdaters = {
	yClicked: yClickedUpdater,
	zRezultChanged,
}
