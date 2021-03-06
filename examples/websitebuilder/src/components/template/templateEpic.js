// @flow strict

import { windowMousePositionCondition, windowMouseUpEvent } from '../../globalEvents'
import { type TemplateStateType, templateInitialState, setTemplateWidth } from './templateState'
import { componentRightCondition } from '../component/componentEvents'
import { templateWidthLeftResizeHandleMouseDown, templateWidthRightResizeHandleMouseDown, templateVcet } from './templateEvents'
import { templateInitialScope, type TemplateScopeType, resetTemplateDnd, templateInitDnd } from './templateScope'
import { createEpicWithScope, createUpdater } from '../../../../../src/epics'

const templateEpic = createEpicWithScope<TemplateStateType, TemplateScopeType, empty, empty>({
	vcet: templateVcet,
	initialState: templateInitialState,
	initialScope: templateInitialScope,
	updaters: {
		dnd: createUpdater({
			given: {
				componentRight: componentRightCondition,
				leftDown: templateWidthLeftResizeHandleMouseDown.condition.toOptional(),
				rightDown: templateWidthRightResizeHandleMouseDown.condition.toOptional(),
			},
			when: {
				mouseLeft: windowMousePositionCondition.withSelector(({ left }) => left),
				mouseUp: windowMouseUpEvent.condition.toOptional().resetConditionsByKeyAfterReducerCall(['leftDown', 'rightDown']),
			},
			then: ({ state, scope, values: { mouseLeft, leftDown, rightDown, componentRight }, changedActiveConditionsKeysMap, R }) => {
				if (!leftDown && !rightDown) return R.doNothing

				if (changedActiveConditionsKeysMap.mouseUp) {
					return R.mapScope(resetTemplateDnd)
				}

				const { dnd } = scope

				if (dnd.type === 'idle') {
					return R.mapScope(templateInitDnd({ startWidth: state.width, mouseStartLeft: mouseLeft }))
				}

				const { startWidth, mouseStartLeft } = dnd
				const leftDiff = mouseStartLeft - mouseLeft
				const nextWidth = Math.max(300, componentRight, leftDown ? startWidth + 2 * leftDiff : startWidth - 2 * leftDiff)

				return R.mapState(state => setTemplateWidth(nextWidth)(state))
			},
		}),
	},
})

export {
	templateEpic,
}
