// @flow
import { reduxWsbStore } from '../reduxWsbStore'
import {
	dlSelectComponentByClick,
} from '../../../websitebuilder/src/tests/domainLanguage/componentDL'
import {
	templateAreaMouseDownEvent,
} from '../../../websitebuilder/src/components/template/templateEvents'

const store = reduxWsbStore

beforeEach(() => {
	store.resetToInitialState()
})

describe('component', () => {
	it('got selected on componentMouseDownEvent + windowMouseUpEvent', () => {
		dlSelectComponentByClick(store)
		expect(store.getState().component.state.selected).toBe(true)
	})
	it('got deselected on templateAreaMouseDownEvent', () => {
		dlSelectComponentByClick(store)
		store.dispatch(templateAreaMouseDownEvent.create())
		expect(store.getState().component.state.selected).toBe(false)
	})
})
