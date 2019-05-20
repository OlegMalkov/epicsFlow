// @flow strict

import {
	createEpic,
	createUpdater,
	createSimpleUpdater,
	createStore,
} from '../epics'

describe('createStore', () => {
	it('computes initial states of epics on store creations', async () => {
		const xEpic = createEpic<number, *, *>({
			vcet: 'x',
			initialState: 0.1,
			updaters: {},
		})
		const yEpic = createEpic<number, *, *>({
			vcet: 'y',
			initialState: 0,
			updaters: {},
		})
		const roundedXEpic = createEpic<number, *, *>({
			vcet: 'roundedX',
			initialState: -1,
			updaters: {
				xChanged: createSimpleUpdater(xEpic.condition, ({ R, value }) => R.mapState(() => Math.round(value))),
			},
		})
		const roundedXPlusYEpic = createEpic<number, *, *>({
			vcet: 'xPlusRoundedX',
			initialState: -10,
			updaters: {
				roundedXPlusYChanged: createUpdater({
					given: {},
					when: { roundedX: roundedXEpic.condition, y: yEpic.condition },
					then: ({ R, values: { roundedX, y } }) => R.mapState(() => roundedX + y),
				}),
			},
		})
		const store = createStore({
			epics: {
				x: xEpic,
				roundedX: roundedXEpic,
				y: yEpic,
				roundedXPlusY: roundedXPlusYEpic,
			},
			debug: true,
		})

		expect(store.getState().x).toBe(0.1)
		expect(store.getState().y).toBe(0)
		expect(store.getState().roundedX).toBe(0)
		expect(store.getState().roundedXPlusY).toBe(0)
	})
})
