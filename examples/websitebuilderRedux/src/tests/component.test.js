// @flow
import { reduxWsbStore } from '../reduxWsbStore'
import {
	dlSelectComponentByClick,
} from '../../../websitebuilder/src/tests/domainLanguage/componentDL'
import {
	templateAreaMouseDown,
} from '../../../websitebuilder/src/components/template/templateACnC'

const store = reduxWsbStore

beforeEach(() => {
	store.resetToInitialState()
})

describe('component', () => {
	it('got selected on componentMouseDown + windowMouseUp', () => {
		dlSelectComponentByClick(store)
		expect(store.getState().component.state.selected).toBe(true)
	})
	it('got deselected on templateAreaMouseDown', () => {
		dlSelectComponentByClick(store)
		store.dispatch(templateAreaMouseDown.ac())
		expect(store.getState().component.state.selected).toBe(false)
	})
})
