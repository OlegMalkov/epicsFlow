// @flow
import { wsbStore } from '../wsbStore'
import { dlSelectComponentByClick } from './domainLanguage/componentDL'
import { templateAreaMouseDownEvent } from '../components/template/templateEvents'

const store = wsbStore

beforeEach(() => {
	store.resetToInitialState()
})

describe('component', () => {
	it('got selected on componentMouseDownEvent + windowMouseUpEvent', () => {
		dlSelectComponentByClick(store)
		expect(store.getState().component.selected).toBe(true)
	})
	it('got deselected on templateAreaMouseDownEvent', () => {
		dlSelectComponentByClick(store)
		store.dispatch(templateAreaMouseDownEvent.create())
		expect(store.getState().component.selected).toBe(false)
	})
})
