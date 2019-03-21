// @flow strict

import { type LTPositionType, type DimensionsType } from '../../types'
import {
	setPropDeepCompare,
	T,
	F,
	SingleTypeContainer,
} from '../../utils'
import './component.css'

type DimensionsUpdateType = {| height?: number, width?: number |}
type PositionUpdateType = {| left?: number, top?: number |}

opaque type ComponentStateType: { dimensions: *, isMoving: *, isResizing: *, position: *, selected: * } = {|
    dimensions: DimensionsType,
    isMoving: bool,
    isResizing: bool,
    position: LTPositionType,
    selected: bool,
|}

const _setComponentPosition = setPropDeepCompare<ComponentStateType, *>('position')
const _setComponentDimensions = setPropDeepCompare<ComponentStateType, *>('dimensions')
const setComponentIsMoving = setPropDeepCompare<ComponentStateType, *>('isMoving')
const setComponentIsResizing = setPropDeepCompare<ComponentStateType, *>('isResizing')
const setComponentSelected = setPropDeepCompare<ComponentStateType, *>('selected')
const componentInitialState: ComponentStateType = {
	position: { left: 100, top: 100 },
	dimensions: { width: 300, height: 200 },
	selected: false,
	isMoving: false,
	isResizing: false,
}
const setComponentIsMovingTrue = setComponentIsMoving(T)
const setComponentIsMovingFalse = setComponentIsMoving(F)
const setComponentIsResizingTrue = setComponentIsResizing(T)
const setComponentIsResizingFalse = setComponentIsResizing(F)
const adjustComponentPosition = ({ templateWidth, componentWidth }: {| componentWidth: number, templateWidth: number |}) =>
	(position: LTPositionType): LTPositionType => {
		let result = position

		if (result.top < 0) {
			result = { ...result, top: 0 }
		}

		if (result.left < 0) {
			result = { ...result, left: 0 }
		}

		const newRight = componentWidth + result.left

		if (newRight > templateWidth) {
			result = { ...result, left: templateWidth - componentWidth }
		}

		return result
	}
const adjustComponentDimensions = (dimensions: DimensionsType): DimensionsType => {
	let result = dimensions

	if (result.width < 1) {
		result = { ...result, width: 1 }
	}

	if (result.height < 1) {
		result = { ...result, height: 1 }
	}

	return result
}
const updateComponentBBox = ({ bboxUpdate, templateWidth }: {| bboxUpdate: {| ...PositionUpdateType, ...DimensionsUpdateType |}, templateWidth: number |}) =>
	(componentState: ComponentStateType): ComponentStateType => {
		const newDimensions = {
			width: bboxUpdate.width || componentState.dimensions.width,
			height: bboxUpdate.height || componentState.dimensions.height,
		}
		const adjustedDimensions = adjustComponentDimensions(newDimensions)
		const newPosition = { left: bboxUpdate.left || componentState.position.left, top:  bboxUpdate.top || componentState.position.top }
		const adjustedPosition = adjustComponentPosition({ templateWidth, componentWidth: componentState.dimensions.width })(newPosition)

		let	finalPosition = adjustedPosition

		let finalDimensions = adjustedDimensions

		if (newDimensions !== adjustedDimensions) {
			const adjustedHeightDiff = adjustedDimensions.height - newDimensions.height

			if (adjustedHeightDiff !== 0 && adjustedPosition.top !== componentState.position.top) {
				finalPosition = { ...finalPosition, top: adjustedPosition.top - adjustedHeightDiff }
			}

			const adjustedWidthDiff = adjustedDimensions.width - newDimensions.width

			if (adjustedWidthDiff !== 0 && adjustedPosition.left !== componentState.position.left) {
				finalPosition = { ...finalPosition, left: adjustedPosition.left - adjustedWidthDiff }
			}
		}

		if (newPosition !== adjustedPosition) {
			const adjustedTopDiff = adjustedPosition.top - newPosition.top

			if (adjustedTopDiff !== 0 && adjustedDimensions.height !== componentState.dimensions.height) {
				finalDimensions = { ...finalDimensions, height: adjustedDimensions.height - adjustedTopDiff }
			}

			const adjustedLeftDiff = adjustedPosition.left - newPosition.left

			if (adjustedLeftDiff !== 0 && adjustedDimensions.width !== componentState.dimensions.width) {
				finalDimensions = { ...finalDimensions, width: adjustedDimensions.width - adjustedTopDiff }
			}
		}

		// if left was adjusted and width changed, width should be readjusted

		return SingleTypeContainer(componentState)
			.pipe(_setComponentPosition(finalPosition))
			.pipe(_setComponentDimensions(finalDimensions))
			.value()
	}

// eslint-disable-next-line import/group-exports
export type {
	DimensionsUpdateType,
	PositionUpdateType,
	ComponentStateType,
}

// eslint-disable-next-line import/group-exports
export {
	setComponentSelected,
	componentInitialState,
	setComponentIsMovingTrue,
	setComponentIsMovingFalse,
	setComponentIsResizingTrue,
	setComponentIsResizingFalse,
	updateComponentBBox,
}
