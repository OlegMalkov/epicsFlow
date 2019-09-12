// @flow

import {
	createEpic,
	createUpdater,
	createEpicCondition,
	dispatchMsgEffectCreator,
	type BuiltInEffectType,
} from '../../../../../src/epics'
import { setProp, setPropDeepCompare } from '../../../../../src/utils'
import { type BoxType, type PositionType } from '../types'
import { windowMouseUpEvent, windowMousePositionCondition, windowMouseDownEvent } from '../../globalEvents'
import { SelectionFrameSelectionCompleteEvent } from './selectionFrameMsgs'

type SelectionFrameStateType = {|
    box: BoxType,
    active: bool,
    startPosition: PositionType,
    currentPosition: PositionType,
|}

const initialState: SelectionFrameStateType = {
	startPosition: { left: 0, top: 0},
	currentPosition: { left: 0, top: 0 },
	active: false,
	box: { left: 0, top: 0, width: 0, height: 0 },
}

const vcet = 'SELECTION_FRAME_VCET'
const SelectionFrameStateChanged = createEpicCondition<SelectionFrameStateType>(vcet)
const SelectionFrameStartPositionChanged = SelectionFrameStateChanged.wsk('startPosition')
const SelectionFrameCurrentPositionChanged = SelectionFrameStateChanged.wsk('currentPosition')
const SelectionFrameActiveChanged = SelectionFrameStateChanged.wsk('active')

const setStartPosition = setProp<SelectionFrameStateType, *>('startPosition')
const setCurrentPosition = setProp<SelectionFrameStateType, *>('currentPosition')
const setActive = setProp<SelectionFrameStateType, *>('active')
const setBox = setPropDeepCompare<SelectionFrameStateType, *>('box')

const selectionFrameEpic = createEpic<SelectionFrameStateType, BuiltInEffectType, empty>({
	vcet,
	initialState,
	updaters: {
		dnd: createUpdater({
			given: {},
			when: {
				mouseDown: windowMouseDownEvent.condition,
				mousePosition: windowMousePositionCondition,
				mouseUp: windowMouseUpEvent.condition.toOptional().resetConditionsByKeyAfterReducerCall(['mouseDown']),
			},
			then: ({
				state,
				values: { mousePosition },
				changedActiveConditionsKeysMap: { mouseDown, mouseUp },
				R,
			}) => {
				if (mouseDown) {
					return R.mapState(setStartPosition(mousePosition))
				}

				if (mouseUp) {
					if (state.active) {
						return R
							.mapState(setActive(false))
							.sideEffect(dispatchMsgEffectCreator(SelectionFrameSelectionCompleteEvent.create({ box: state.box })))
					}
					return R
				}

				let result = R

				if (!state.active) {
					result = R.mapState(setActive(true))
				}

				return result.mapState(setCurrentPosition(mousePosition))
			},
		}),
		computeBox: createUpdater({
			given: {},
			when: {
				startPosition: SelectionFrameStartPositionChanged,
				currentPosition: SelectionFrameCurrentPositionChanged,
				active: SelectionFrameActiveChanged,
			},
			then: ({ R, values: { startPosition, currentPosition, active } }) => {
				if (!active) {
					return R.mapState(setBox(initialState.box))
				}
				const startPos = {
					left: Math.min(startPosition.left, currentPosition.left),
					top: Math.min(startPosition.top, currentPosition.top),
				}
				const endPos = {
					left: Math.max(startPosition.left, currentPosition.left),
					top: Math.max(startPosition.top, currentPosition.top),
				}

				return R.mapState(setBox({
					...startPos,
					width: endPos.left - startPos.left,
					height: endPos.top - startPos.top,
				}))
			},
		}),
	},
})

// eslint-disable-next-line import/group-exports
export {
	selectionFrameEpic,
}

// eslint-disable-next-line import/group-exports
export type {
	SelectionFrameStateType,
}
