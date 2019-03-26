// @flow strict
import { type UpdaterType, makeUpdater, makeSACAC } from '../../../src/epics'
import { xValueCondition } from '../x/xAAC'
import { yValueC } from '../y/yAAC'

import { zComputeResult, zIncMultiplier, type ZStateType } from './zState'

const zClicked = makeSACAC('Z_CLICKED')

type ZUpdaterType = UpdaterType<ZStateType, *, *, *>
const
	zClickedUpdater: ZUpdaterType = makeUpdater({
		dependsOn: {
			x: xValueCondition,
			y: yValueC,
		},
		when: {
			_zClicked: zClicked.condition,
		},
		then: ({ values: { x, y }, R }) => R
			.updateState(zIncMultiplier)
			.updateState(zComputeResult(x,y)),
	})


const xOrYChanged: ZUpdaterType = makeUpdater({
	dependsOn: {},
	when: {
		x: xValueCondition,
		y: yValueC,
	},
	then: ({ values: { x , y }, R }) => R.updateState(zComputeResult(x,y)),
})

const zUpdaters = {
	zClicked: zClickedUpdater,
	xOrYChanged,
}

export {
	zClicked,
	zUpdaters,
}
