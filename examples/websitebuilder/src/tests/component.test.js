// @flow
import { wsbStore } from '../wsbStore'
import { dlSelectComponentByClick } from './domainLanguage/componentDL'
import { templateAreaMouseDown } from '../components/template/templateACnC'

const store = wsbStore

beforeEach(() => {
	store.resetToInitialState()
})

describe('component', () => {
	it('got selected on componentMouseDown + windowMouseUp', () => {
		dlSelectComponentByClick(store)
		expect(store.getState().component.selected).toBe(true)
	})
	it('got deselected on templateAreaMouseDown', () => {
		dlSelectComponentByClick(store)
		store.dispatch(templateAreaMouseDown.ac())
		expect(store.getState().component.selected).toBe(false)
	})
})
