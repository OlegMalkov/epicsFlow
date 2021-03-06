// @flow strict
import { type UpdaterType, createUpdater, createSimpleEvent } from '../../../src/epics'
import { xValueCondition } from '../x/xAAC'
import { yValueC } from '../y/yAAC'

import { zComputeResult, zIncMultiplier, type ZStateType } from './zState'

const zClicked = createSimpleEvent('Z_CLICKED')

type ZUpdaterType = UpdaterType<ZStateType, *, *, *>
const
	zClickedUpdater: ZUpdaterType = createUpdater({
		given: {
			x: xValueCondition,
			y: yValueC,
		},
		when: {
			_zClicked: zClicked.condition,
		},
		then: ({ values: { x, y }, R }) => R
			.mapState(zIncMultiplier)
			.mapState(zComputeResult(x,y)),
	})


const xOrYChanged: ZUpdaterType = createUpdater({
	given: {},
	when: {
		x: xValueCondition,
		y: yValueC,
	},
	then: ({ values: { x , y }, R }) => R.mapState(zComputeResult(x,y)),
})

const zUpdaters = {
	zClicked: zClickedUpdater,
	xOrYChanged,
}

export {
	zClicked,
	zUpdaters,
}
