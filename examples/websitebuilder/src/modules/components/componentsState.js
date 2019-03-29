// @flow strict

import { type LTPositionType, type DimensionsType } from '../../types'
import { setPropDeepCompare, T, F, SingleTypeContainer } from '../../../../../src/utils'

type DimensionsUpdateType = {| height?: number, width?: number |}
type PositionUpdateType = {| left?: number, top?: number |}

opaque type ComponentsStateType: {| dimensions: *, isMoving: *, isResizing: *, position: *, selected: * |} = {|
    dimensions: DimensionsType,
    isMoving: bool,
    isResizing: bool,
    position: LTPositionType,
    selected: bool,
|}

const _setComponentsPosition = setPropDeepCompare<ComponentsStateType, *>('position')
const _setComponentsDimensions = setPropDeepCompare<ComponentsStateType, *>('dimensions')
const setComponentsIsMoving = setPropDeepCompare<ComponentsStateType, *>('isMoving')
const setComponentsIsResizing = setPropDeepCompare<ComponentsStateType, *>('isResizing')
const componentsSetSelected = setPropDeepCompare<ComponentsStateType, *>('selected')
const componentsInitialState: ComponentsStateType = {
	position: { left: 100, top: 100 },
	dimensions: { width: 300, height: 200 },
	selected: false,
	isMoving: false,
	isResizing: false,
}
const componentsSetIsMovingTrue = setComponentsIsMoving(T)
const componentsSetIsMovingFalse = setComponentsIsMoving(F)
const setComponentsIsResizingTrue = setComponentsIsResizing(T)
const setComponentsIsResizingFalse = setComponentsIsResizing(F)
const adjustComponentsPosition = (position: LTPositionType): LTPositionType => {
	let result = position

	if (result.top < 0) {
		result = { ...result, top: 0 }
	}

	return result
}

const adjustComponentsDimensions = (dimensions: DimensionsType): DimensionsType => {
	let result = dimensions

	if (result.width < 1) {
		result = { ...result, width: 1 }
	}

	if (result.height < 1) {
		result = { ...result, height: 1 }
	}

	return result
}
const componentsUpdateBBox = ({ bboxUpdate }: {| bboxUpdate: {| ...PositionUpdateType, ...DimensionsUpdateType |} |}) =>
	(componentsState: ComponentsStateType): ComponentsStateType => {
		const newDimensions = {
			width: bboxUpdate.width || componentsState.dimensions.width,
			height: bboxUpdate.height || componentsState.dimensions.height,
		}
		const adjustedDimensions = adjustComponentsDimensions(newDimensions)
		const newPosition = { left: bboxUpdate.left || componentsState.position.left, top:  bboxUpdate.top || componentsState.position.top }
		const adjustedPosition = adjustComponentsPosition(newPosition)

		let	finalPosition = adjustedPosition

		let finalDimensions = adjustedDimensions

		if (newDimensions !== adjustedDimensions) {
			const adjustedHeightDiff = adjustedDimensions.height - newDimensions.height

			if (adjustedHeightDiff !== 0 && adjustedPosition.top !== componentsState.position.top) {
				finalPosition = { ...finalPosition, top: adjustedPosition.top - adjustedHeightDiff }
			}

			const adjustedWidthDiff = adjustedDimensions.width - newDimensions.width

			if (adjustedWidthDiff !== 0 && adjustedPosition.left !== componentsState.position.left) {
				finalPosition = { ...finalPosition, left: adjustedPosition.left - adjustedWidthDiff }
			}
		}

		if (newPosition !== adjustedPosition) {
			const adjustedTopDiff = adjustedPosition.top - newPosition.top

			if (adjustedTopDiff !== 0 && adjustedDimensions.height !== componentsState.dimensions.height) {
				finalDimensions = { ...finalDimensions, height: adjustedDimensions.height - adjustedTopDiff }
			}

			const adjustedLeftDiff = adjustedPosition.left - newPosition.left

			if (adjustedLeftDiff !== 0 && adjustedDimensions.width !== componentsState.dimensions.width) {
				finalDimensions = { ...finalDimensions, width: adjustedDimensions.width - adjustedTopDiff }
			}
		}

		// if left was adjusted and width changed, width should be readjusted

		return SingleTypeContainer(componentsState)
			.pipe(_setComponentsPosition(finalPosition))
			.pipe(_setComponentsDimensions(finalDimensions))
			.value()
	}

export {
	componentsSetSelected,
	componentsInitialState,
	componentsSetIsMovingTrue,
	componentsSetIsMovingFalse,
	setComponentsIsResizingTrue,
	setComponentsIsResizingFalse,
	componentsUpdateBBox,
}
