// @flow
import { makeUpdater, RT, type Updater } from '../../../src/epics'
import { zResultC } from '../z/zVat'
import { type yState, setYColor, incY, decY } from './yState'
import { isOdd } from '../utils'
import { yClickedC } from './yAAC'

type yUpdater = Updater<yState, *, *, *>

const
	yClicked: yUpdater = makeUpdater({
		conditions: { 
			zResult: zResultC.p(), 
			_yClicked: yClickedC
		},
		reducer: ({ values: { zResult }, state }) => {
			const op = isOdd(zResult)? incY: decY
			return RT.updateState(op(state))
		}
	}),
	zRezultChanged: yUpdater = makeUpdater({
		conditions: { zResult: zResultC },
		reducer: ({ values: { zResult }, state }) => RT.updateState(setYColor(isOdd(zResult) ? 'green' : 'red')(state))
	})
    
export const yUpdaters = {
	yClicked,
	zRezultChanged
}