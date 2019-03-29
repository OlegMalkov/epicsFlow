// @flow strict
import { type UpdaterType, createUpdater, makeSimpleActionCreatorAndCondition } from '../../../src/epics'
import { xValueCondition } from '../x/xAAC'
import { yValueC } from '../y/yAAC'

import { zComputeResult, zIncMultiplier, initialZState } from './zState'

const zClicked = makeSimpleActionCreatorAndCondition('Z_CLICKED')

type ZUpdaterType = UpdaterType<typeof initialZState, *, *, *>
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
