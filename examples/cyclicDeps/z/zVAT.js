// @flow 
import { type zState } from './zState'
import { makeEpicCondition } from '../../../src/epics'

export const zCondition = makeEpicCondition<zState>('Z')
export const zResultC = zCondition.sk('result')