// @flow strict
import { RT, type Updater } from '../../../src/epics'
import { zResultC } from '../z/zVat'
import { isEven, CDE } from '../utils'
import { incX, decX, setXColor, type xState } from './xState'
import { xClickedC } from './xAAC'

type xUpdater = Updater<xState, *, *, *>

const
	xClicked: xUpdater = CDE.makeUpdater({
		conditions: { 
			zResult: zResultC.tp(), 
			_xClicked: xClickedC 
		},
		reducer: ({ values: { zResult }, state }) => RT.updateState((isEven(zResult)? incX: decX)(state))
	}),
	zResultChanged: xUpdater = CDE.makeUpdater({
		conditions: { zResult: zResultC },
		reducer: ({ values: { zResult }, state }) => RT.updateState(setXColor(isEven(zResult) ? 'green' : 'red')(state))
	})
    
export const xUpdaters = {
	xClicked,
	zResultChanged
}