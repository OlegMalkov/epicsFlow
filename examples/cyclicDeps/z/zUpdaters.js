// @flow
import { makeUpdater, makeCondition, RT, type Updater } from '../../../src/epics'
import { xValueC } from '../x/xAAC'
import { yValueC } from '../y/yAAC'
import { compose2 } from '../utils'
import { zComputeResult, zIncMultiplier, type zState } from './zState'

const zClickedAT = 'Z_CLICKED'
export const zClickedAC = () => ({ type: zClickedAT })
const zClickedC = makeCondition(zClickedAT)

type zUpdater = Updater<zState, *, *, *>
const 
	zClicked: zUpdater = makeUpdater({
		conditions: {
			x: xValueC.p(),
			y: yValueC.p(),
			_zClicked: zClickedC 
		},
		reducer: ({ values: { x, y }, state }) => {
			return RT.updateState(compose2(zComputeResult(x,y), zIncMultiplier, state))
		}
	}),
	xOrYChanged: zUpdater = makeUpdater({
		conditions: { 
			x: xValueC, 
			y: yValueC
		},
		reducer: ({ values: { x, y }, state }) => {
			return RT.updateState(zComputeResult(x,y)(state))
		}
	})

export const zUpdaters = {
	zClicked,
	xOrYChanged
}