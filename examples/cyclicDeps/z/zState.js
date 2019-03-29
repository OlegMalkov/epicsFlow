// @flow strict
import { inc } from '../utils'

type StateType = {| multiplier: number, result: number |}
opaque type ZStateType: StateType = StateType

const zIncMultiplier = (z: ZStateType): ZStateType => ({ ...z, multiplier: inc(z.multiplier)})
const zComputeResult = (x: number, y: number) => (z: ZStateType): ZStateType => {
	return ({ ...z, result: (x + y) * z.multiplier })
}
const initialZState: ZStateType = { result: -1, multiplier: 1 }

export {
	zIncMultiplier,
	zComputeResult,
	initialZState,
}
