// @flow
import { makeUpdater, RT, type Updater } from '../../../src/epics'
import { zResultC } from '../z/zVat'
import { isEven } from '../utils'
import { incX, decX, setXColor, type xState } from './xState'
import { xClickedC } from './xAAC'

type xUpdater = Updater<xState, *, *, *>

const
	xClicked: xUpdater = makeUpdater({
		conditions: { 
			zResult: zResultC.p(), 
			_xClicked: xClickedC 
		},
		reducer: ({ values: { zResult }, state }) => RT.updateState((isEven(zResult)? incX: decX)(state))
	}),
	zResultChanged: xUpdater = makeUpdater({
		conditions: { zResult: zResultC },
		reducer: ({ values: { zResult }, state }) => RT.updateState(setXColor(isEven(zResult) ? 'green' : 'red')(state))
	})
    
export const xUpdaters = {
	xClicked,
	zResultChanged
}