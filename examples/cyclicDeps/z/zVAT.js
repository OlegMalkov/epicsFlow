// @flow strict 
import { type zState } from './zState'
import { CDE } from '../utils'

export const zCondition = CDE.makeEpicCondition<zState>('Z')
export const zResultC = zCondition.wsk('result')