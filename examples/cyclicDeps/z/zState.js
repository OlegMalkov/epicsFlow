// @flow strict
import { inc } from '../utils'

type state = {| result: number, multiplier: number |}
export opaque type zState: state = state

export const zIncMultiplier = (z: zState): zState => ({ ...z, multiplier: inc(z.multiplier)})
export const zComputeResult = (x: number, y: number) => (z: zState): zState => { 
	console.log('---zComputeResult---', x, y) // eslint-disable-line
	return ({ ...z, result: (x + y) * z.multiplier })
}

export const initialZState: zState = { result: -1, multiplier: 1 }