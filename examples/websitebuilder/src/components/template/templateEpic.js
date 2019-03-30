// @flow strict

import { windowMousePositionCondition, windowMouseUp } from '../../globalACAC'
import { type TemplateStateType, templateInitialState, setTemplateWidth } from './templateState'
import { componentRightCondition, componentDimensionsCondition } from '../component/componentACnC'
import { templateWidthLeftResizeHandleMouseDown, templateWidthRightResizeHandleMouseDown, templateVat } from './templateACnC'
import { templateInitialScope, type TemplateScopeType, resetTemplateDnd, templateInitDnd } from './templateScope'
import { createEpicWithScope, createUpdater } from '../../../../../src/epics'

const templateEpic = createEpicWithScope<TemplateStateType, TemplateScopeType, empty, empty>({
	vat: templateVat,
	initialState: templateInitialState,
	initialScope: templateInitialScope,
	updaters: {
		dnd: createUpdater({
			given: {
				componentWidth: componentDimensionsCondition.withSelectorKey('width'),
				leftDown: templateWidthLeftResizeHandleMouseDown.condition.toOptional(),
				rightDown: templateWidthRightResizeHandleMouseDown.condition.toOptional(),
			},
			when: {
				mouseLeft: windowMousePositionCondition.withSelector(({ left }) => left),
				mouseUp: windowMouseUp.condition.toOptional().resetConditionsByKeyAfterReducerCall(['leftDown', 'rightDown']),
			},
			then: ({ state, scope, values: { mouseLeft, leftDown, rightDown, componentWidth }, changedActiveConditionsKeysMap, R }) => {
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
				const nextWidth = Math.max(300, componentWidth, leftDown ? startWidth + 2 * leftDiff : startWidth - 2 * leftDiff)

				return R.mapState(state => setTemplateWidth(nextWidth)(state))
			},
		}),
		expandOnComponentMove: createUpdater({
			given: {},
			when: { componentRight: componentRightCondition },
			then: ({ values: { componentRight }, R, state: { width } }) => {
				if (width < componentRight) {
					return R.mapState(setTemplateWidth(componentRight))
				}

				return R.doNothing
			},
		}),
	},
})

export {
	templateEpic,
}
