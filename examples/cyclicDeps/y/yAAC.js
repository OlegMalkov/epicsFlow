// @flow strict 
import { type yState } from './yState'
import { CDE } from '../utils'

export const 
	yVat = 'Y',
	yC = CDE.makeEpicCondition<yState>(yVat),
	yValueC = yC.wsk('value'),
	yColorC = yC.wsk('color')


const yClickedAT = 'Y_CLICKED'
export const 
	yClickedAC = () => ({ type: yClickedAT }),
	yClickedC = CDE.makeCondition<empty>(yClickedAT)
