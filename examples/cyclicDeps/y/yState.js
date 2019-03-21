// @flow strict
import { inc, dec } from '../utils'

type StateType = {| color: 'green' | 'red', value: number |}
opaque type YStateType: StateType = StateType

const incY = (y: YStateType): YStateType => ({ ...y, value: inc(y.value)})
const decY = (y: YStateType): YStateType => ({ ...y, value: dec(y.value)})
const setYColor = (color: 'green' | 'red') => (y: YStateType): YStateType => ({ ...y, color })
const initialYState: YStateType = { value: 2, color: 'red' }

// eslint-disable-next-line import/group-exports
export type {
	YStateType,
}

// eslint-disable-next-line import/group-exports
export {
	incY,
	decY,
	setYColor,
	initialYState,
}
