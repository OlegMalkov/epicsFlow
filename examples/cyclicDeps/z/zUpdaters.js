// @flow strict
import { type Updater } from '../../../src/epics'
import { xValueC } from '../x/xAAC'
import { yValueC } from '../y/yAAC'
import { compose2, CDE } from '../utils'
import { zComputeResult, zIncMultiplier, type zState } from './zState'

const zClickedAT = 'Z_CLICKED'
export const zClickedAC = () => ({ type: zClickedAT })
const zClickedC = CDE.makeCondition(zClickedAT)

type zUpdater = Updater<zState, *, *, *>
const 
	zClicked: zUpdater = CDE.makeUpdater({
		conditions: {
			x: xValueC.tp(),
			y: yValueC.tp(),
			_zClicked: zClickedC 
		},
		reducer: ({ values: { x, y }, R }) => R
			.updateState(zIncMultiplier)
			.updateState(zComputeResult(x,y))
	}),
	xOrYChanged: zUpdater = CDE.makeUpdater({
		conditions: { 
			x: xValueC, 
			y: yValueC
		},
		reducer: ({ values: { x, y }, R }) => R.updateState(zComputeResult(x,y))
	})

export const zUpdaters = {
	zClicked,
	xOrYChanged
}