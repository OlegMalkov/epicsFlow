// @flow strict
import { RT, type Updater } from '../../../src/epics'
import { zResultC } from '../z/zVat'
import { type yState, setYColor, incY, decY } from './yState'
import { isOdd, CDE } from '../utils'
import { yClickedC } from './yAAC'

type yUpdater = Updater<yState, *, *, *>

const
	yClicked: yUpdater = CDE.makeUpdater({
		conditions: { 
			zResult: zResultC.tp(), 
			_yClicked: yClickedC
		},
		reducer: ({ values: { zResult }, state }) => {
			const op = isOdd(zResult)? incY: decY
			return RT.updateState(op(state))
		}
	}),
	zRezultChanged: yUpdater = CDE.makeUpdater({
		conditions: { zResult: zResultC },
		reducer: ({ values: { zResult }, state }) => RT.updateState(setYColor(isOdd(zResult) ? 'green' : 'red')(state))
	})
    
export const yUpdaters = {
	yClicked,
	zRezultChanged
}