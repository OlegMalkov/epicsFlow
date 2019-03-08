// @flow strict
import { type Updater } from '../../../src/epics'
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
		reducer: ({ values: { zResult }, R }) => R.updateState(isEven(zResult)? incX : decX)
	}),
	zResultChanged: xUpdater = CDE.makeUpdater({
		conditions: { zResult: zResultC },
		reducer: ({ values: { zResult }, R }) => R.updateState(setXColor(isEven(zResult) ? 'green' : 'red'))
	})
    
export const xUpdaters = {
	xClicked,
	zResultChanged
}