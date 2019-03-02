// @flow strict 
import { type xState } from './xState'
import { CDE } from '../utils'

export const
	xVat = 'X',
	xC = CDE.makeEpicCondition<xState>(xVat),
	xValueC = xC.wsk('value')


const xClickedAT = 'X_CLICKED'
export const    
	xClickedAC = () => ({ type: xClickedAT }),
	// putting <empty> for condition value type is not true, but in case there is not any useful payload in action it's ok, any way there is nothing you can take from this action
	xClickedC = CDE.makeCondition<empty>(xClickedAT)