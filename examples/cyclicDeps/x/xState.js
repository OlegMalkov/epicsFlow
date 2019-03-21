// @flow strict
import { inc, dec } from '../utils'

type StateType = {| color: 'green' | 'red', value: number |}
opaque type XStateType: StateType = StateType

const incX = (x: XStateType): XStateType => ({ ...x, value: inc(x.value)})
const decX = (x: XStateType): XStateType => ({ ...x, value: dec(x.value)})
const setXColor = (color: 'green' | 'red') => (x: XStateType): XStateType => ({ ...x, color })
const initialXState: XStateType = { value: 4, color: 'green' }

// eslint-disable-next-line import/group-exports
export type {
	XStateType,
}

// eslint-disable-next-line import/group-exports
export {
	incX,
	decX,
	setXColor,
	initialXState,
}
