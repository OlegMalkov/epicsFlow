// @flow strict

import { type LTPositionType, type DimensionsType } from '../../types'
import { setPropDeepCompare, T, F, SingleTypeContainer } from '../../../../../src/utils'

type DimensionsUpdateType = {| height?: number, width?: number |}
type PositionUpdateType = {| left?: number, top?: number |}

opaque type ComponentStateType: {| dimensions: *, position: * |} = {|
	dimensions: DimensionsType,
    position: LTPositionType,
|}

type ComponentsStatesByIdType = { [string]: ComponentStateType }

opaque type ComponentsStateType: {| byId: *, isMoving: *, isResizing: *, selectedComponentsIds: * |} = {|
	byId: ComponentsStatesByIdType,
    isMoving: bool,
    isResizing: bool,
    selectedComponentsIds: Array<string>,
|}

const _setComponentPosition = setPropDeepCompare<ComponentStateType, *>('position')
const _setComponentDimensions = setPropDeepCompare<ComponentStateType, *>('dimensions')
const componentsSetIsMoving = setPropDeepCompare<ComponentsStateType, *>('isMoving')
const componentsSetIsResizing = setPropDeepCompare<ComponentsStateType, *>('isResizing')
const componentsSetSelectedComponentsIds = setPropDeepCompare<ComponentsStateType, *>('selectedComponentsIds')
const componentSetByIdMap = setPropDeepCompare<ComponentsStateType, *>('byId')
const componentsInitialState: ComponentsStateType = {
	byId: {},
	selectedComponentsIds: [],
	isMoving: false,
	isResizing: false,
}
const componentsSetIsMovingTrue = componentsSetIsMoving(T)
const componentsSetIsMovingFalse = componentsSetIsMoving(F)
const componentsSetIsResizingTrue = componentsSetIsResizing(T)
const componentsSetIsResizingFalse = componentsSetIsResizing(F)
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
const componentsUpdateBBoxes = ({ bboxUpdate }: {| bboxUpdate: {| ...PositionUpdateType, ...DimensionsUpdateType |} |}) =>
	(componentState: ComponentStateType): ComponentStateType => {
		const newDimensions = {
			width: bboxUpdate.width || componentState.dimensions.width,
			height: bboxUpdate.height || componentState.dimensions.height,
		}
		const adjustedDimensions = adjustComponentsDimensions(newDimensions)
		const newPosition = { left: bboxUpdate.left || componentState.position.left, top:  bboxUpdate.top || componentState.position.top }
		const adjustedPosition = adjustComponentsPosition(newPosition)

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
	ComponentsStatesByIdType,
}

// eslint-disable-next-line import/group-exports
export {
	componentsSetSelectedComponentsIds,
	componentsInitialState,
	componentsSetIsMovingTrue,
	componentsSetIsMovingFalse,
	componentsSetIsResizingTrue,
	componentsSetIsResizingFalse,
	componentSetByIdMap,
}
