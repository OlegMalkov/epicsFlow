// @flow strict
import { type UpdaterType } from '../../../src/epics'
import { zResultC } from '../z/zVat'
import { type yState, setYColor, incY, decY } from './yState'
import { isOdd, CDE } from '../utils'
import { yClickedC } from './yAAC'

type yUpdater = UpdaterType<yState, *, *, *>

const
	yClicked: yUpdater = CDE.makeUpdater({
		conditions: { 
			zResult: zResultC.tp(), 
			_yClicked: yClickedC
		},
		reducer: ({ values: { zResult }, R }) => R.updateState(isOdd(zResult)? incY: decY)
	}),
	zRezultChanged: yUpdater = CDE.makeUpdater({
		conditions: { zResult: zResultC },
		reducer: ({ values: { zResult }, R }) => R.updateState(setYColor(isOdd(zResult) ? 'green' : 'red'))
	})
    
export const yUpdaters = {
	yClicked,
	zRezultChanged
}