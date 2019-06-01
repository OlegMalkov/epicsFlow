// @flow

import { remember, recall, startMove, stopMove, setSpeed, setSize, setHeading, setVision, setAll } from './globalHelpers'
import { type ScriptDataType, worldInitialState } from './models/World'
import { dummyWorm } from './models/Worm'

const initialData: ScriptDataType = {
	world: worldInitialState,
	me: dummyWorm,
}

describe('remember', () => {
	it('i can recall what i remembered', () => {
		const data = remember('apple', 'red')(initialData)
		const apple = recall('apple')(data)

		expect(apple).toBe('red')
	})
})

describe('start/stop', () => {
	it('i can start moving', () => {
		expect(initialData.me.move).toBe(false)
		const data = startMove(initialData)

		expect(data.me.move).toBe(true)
	})
	it('i can stop moving', () => {
		const data = stopMove(initialData)

		expect(data.me.move).toBe(true)

		const data1 = stopMove(initialData)

		expect(data1.me.move).toBe(false)
	})
})

describe('change my attributes', () => {
	it('i can set speed', () => {
		expect(initialData.me.speed).not.toBe(1000)
		const data = setSpeed(1000)(initialData)

		expect(data.me.speed).toBe(1000)
	})
	it('i can set size', () => {
		expect(initialData.me.size).not.toBe(1000)
		const data = setSize(1000)(initialData)

		expect(data.me.size).toBe(1000)
	})
	it('i can set vision', () => {
		expect(initialData.me.vision).not.toBe(1000)
		const data = setVision(1000)(initialData)

		expect(data.me.vision).toBe(1000)
	})
	it('i can set headingDegree', () => {
		expect(initialData.me.headingDegree).not.toBe(1000)
		const data = setHeading(1000)(initialData)

		expect(data.me.headingDegree).toBe(1000)
	})
	it('i can set all attrs in once', () => {
		expect(initialData.me.speed).not.toBe(1)
		expect(initialData.me.size).not.toBe(2)
		expect(initialData.me.vision).not.toBe(3)
		expect(initialData.me.headingDegree).not.toBe(4)
		expect(initialData.me.move).not.toBe(true)
		const data = setAll(1, 2, 3, 4, true)(initialData)

		expect(data.me.speed).toBe(1)
		expect(data.me.size).toBe(2)
		expect(data.me.vision).toBe(3)
		expect(data.me.headingDegree).toBe(4)
		expect(data.me.move).toBe(true)
	})
})

