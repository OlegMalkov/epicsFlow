// @flow strict

import {
	createStore,
	createEpic,
	createUpdater,
	createSimpleUpdater,
	createUpdaterWithReducer,
	createSimpleEvent,
} from '../../src/epics'

const RequestAnimationFrameEvent = createSimpleEvent('REQUEST_ANIMATION_FRAME')

type XStateType = number

const XUpBtnPressedEvent = createSimpleEvent('X_UP_BTN_PRESSED')
const XUpBtnDownEvent = createSimpleEvent('X_UP_BTN_DOWN')
const xEpic = createEpic<XStateType, *, *>({
	vcet: 'X_VCET',
	initialState: 0.1,
	updaters: {
		xBtnPressed: createUpdaterWithReducer(
			XUpBtnPressedEvent,
			state => state + 0.3
		),
		xBtnDownWithRaf: createUpdater({
			given: { down: XUpBtnDownEvent.condition },
			when: {
				_: RequestAnimationFrameEvent.condition,
				_reset: XUpBtnPressedEvent.condition.toOptional().resetConditionsByKey(['down']),
			},
			then: ({ R }) => R.mapState(s => s + 0.1),
		}),
	},
})


type RoundedXStateType = number

const roundedXEpic = createEpic<RoundedXStateType, *, *>({
	vcet: 'ROUNDED_X_VCET',
	initialState: -1,
	updaters: {
		xChanged: createSimpleUpdater(
			xEpic.condition,
			({ value, R }) => R.mapState(() => Math.round(value))
		),
	},
})

type YStateType = number

const YUpBtnPressedEvent = createSimpleEvent('Y_UP_BTN_PRESSED')
const yEpic = createEpic<YStateType, *, *>({
	vcet: 'Y_VCET',
	initialState: 0,
	updaters: {
		yUpBtnPressed: createUpdaterWithReducer(
			YUpBtnPressedEvent,
			state => state + 0.3
		),
	},
})

type RoundedXPlusYStateType = number

const roundedXPlusYEpic = createEpic<RoundedXPlusYStateType, *, *>({
	initialState: -1,
	updaters: {
		roundedXOrYChanged: createUpdater({
			given: {},
			when: {
				roundedX: roundedXEpic.condition,
				y: yEpic.condition,
			},
			then: ({ values: { roundedX, y }, R }) => R.mapState(() => roundedX + y),
		}),
	},
})

const epics = {
	x: xEpic,
	y: yEpic,
	roundedX: roundedXEpic,
	roundedXPlusY: roundedXPlusYEpic,
}

const store = createStore<typeof epics>({
	epics,
	debug: true,
})

// eslint-disable-next-line no-console
const printState = () => console.log(`x: ${store.getState().x}, roundedX: ${store.getState().roundedX}, y: ${store.getState().y}, roundedXPlusY: ${store.getState().roundedXPlusY}`)
const dispatchAndPrintState = (msgDef) => {
	store.dispatch(msgDef.create())
	printState()
}

printState()
dispatchAndPrintState(RequestAnimationFrameEvent)
dispatchAndPrintState(XUpBtnDownEvent)
dispatchAndPrintState(RequestAnimationFrameEvent)
dispatchAndPrintState(RequestAnimationFrameEvent)
dispatchAndPrintState(RequestAnimationFrameEvent)
dispatchAndPrintState(RequestAnimationFrameEvent)
dispatchAndPrintState(RequestAnimationFrameEvent)
dispatchAndPrintState(XUpBtnPressedEvent)
dispatchAndPrintState(XUpBtnPressedEvent)
dispatchAndPrintState(XUpBtnPressedEvent)
dispatchAndPrintState(RequestAnimationFrameEvent)
dispatchAndPrintState(YUpBtnPressedEvent)
dispatchAndPrintState(XUpBtnPressedEvent)

