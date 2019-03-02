// @flow strict

import { x } from './x/xEpic'
import { y } from './y/yEpic'
import { z } from './z/z'
import { zClickedAC } from './z/zUpdaters'
import { xClickedAC } from './x/xAAC'
import { yClickedAC } from './y/yAAC'
import { CDE } from './utils'

const debug = { 
	warn: console.warn, // eslint-disable-line
	trace: console.log // eslint-disable-line
}

const epics = {
	x,
	y,
	z 
}

export const store = CDE.createStore<typeof epics>({
	epics,
	onStateChanged: (s) => {
		console.log('state changed', s) // eslint-disable-line
	},
	onMsg: () => {

	},
	debug
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

store.dispatch(xClickedAC())
assert(7, red, green)
store.dispatch(xClickedAC())
assert(6, green, red)
store.dispatch(yClickedAC())
assert(5, red, green)
store.dispatch(zClickedAC())
assert(10, green, red)
store.dispatch(zClickedAC())
assert(15, red, green)
store.dispatch(yClickedAC())
assert(18, green, red)
store.dispatch(xClickedAC())
assert(21, red, green)
store.dispatch(xClickedAC())
assert(18, green, red)