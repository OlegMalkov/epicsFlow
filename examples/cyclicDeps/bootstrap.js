// @flow strict

import { x } from './x/xEpic'
import { y } from './y/yEpic'
import { z } from './z/z'
import { zClicked } from './z/zUpdaters'
import { xClicked } from './x/xAAC'
import { yClicked } from './y/yAAC'
import { createStore } from '../../src/epics'

const epics = {
	x,
	y,
	z,
}

export const store = createStore<typeof epics>({
	epics,
	debug: true,
})
const red = 'red'
const green = 'green'
const assert = (result, xColor, yColor) => {
	console.log('asserting', result, xColor, yColor) // eslint-disable-line
	const state = store.getState()

	if (state.z.result !== result) {
		throw new Error(`Expected ${result} but got ${state.z.result} for result`)
	}
	if (state.x.color !== xColor) {
		throw new Error(`Expected ${xColor} but got ${state.x.color} for xColor`)
	}
	if (state.y.color !== yColor) {
		throw new Error(`Expected ${yColor} but got ${state.y.color} for yColor`)
	}
}

store.dispatch(xClicked.ac())
assert(7, red, green)
store.dispatch(xClicked.ac())
assert(6, green, red)
store.dispatch(yClicked.ac())
assert(5, red, green)
store.dispatch(zClicked.ac())
assert(10, green, red)
store.dispatch(zClicked.ac())
assert(15, red, green)
store.dispatch(yClicked.ac())
assert(18, green, red)
store.dispatch(xClicked.ac())
assert(21, red, green)
store.dispatch(xClicked.ac())
assert(18, green, red)
