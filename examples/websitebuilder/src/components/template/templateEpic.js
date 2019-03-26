// @flow strict

import { windowMousePositionCondition, windowMouseUp } from '../../globalACAC'
import { type TemplateStateType, templateInitialState, setTemplateWidth } from './templateState'
import { componentRightCondition } from '../component/componentACAC'
import { templateWidthLeftResizeHandleMouseDown, templateWidthRightResizeHandleMouseDown, templateVat } from './templateACAC'
import { templateInitialScope, type TemplateScopeType, resetTemplateDnd, templateInitDnd } from './templateScope'
import { makeEpicWithScope, makeUpdater } from '../../epics'

const templateEpic = makeEpicWithScope<TemplateStateType, TemplateScopeType, empty, empty>({
	vat: templateVat,
	initialState: templateInitialState,
	initialScope: templateInitialScope,
	updaters: {
		dnd: makeUpdater({
			dependsOn: {
				componentRight: componentRightCondition,
				leftDown: templateWidthLeftResizeHandleMouseDown.condition.toOptional(),
				rightDown: templateWidthRightResizeHandleMouseDown.condition.toOptional(),
			},
			reactsTo: {
				mouseLeft: windowMousePositionCondition.withSelector(({ left }) => left),
				mouseUp: windowMouseUp.condition.toOptional().resetConditionsByKeyAfterReducerCall(['leftDown', 'rightDown']),
			},
			exec: ({ state, scope, values: { mouseLeft, leftDown, rightDown, componentRight }, changedActiveConditionsKeysMap, R }) => {
				if (!leftDown && !rightDown) return R.doNothing

				if (changedActiveConditionsKeysMap.mouseUp) {
					return R.updateScope(resetTemplateDnd)
				}

				const { dnd } = scope

				if (dnd.type === 'idle') {
					return R.updateScope(templateInitDnd({ startWidth: state.width, mouseStartLeft: mouseLeft }))
				}

				const { startWidth, mouseStartLeft } = dnd
				const leftDiff = mouseStartLeft - mouseLeft
				const nextWidth = Math.max(300, componentRight, leftDown ? startWidth + 2 * leftDiff : startWidth - 2 * leftDiff)

				return R.updateState(setTemplateWidth(nextWidth))
			},
		}),
	},
})

export {
	templateEpic,
}
