// @flow

import { type BBoxType, type LTPositionType, type DimensionsType } from './types'

function areBBoxIntersect(bbox1: BBoxType, bbox2: BBoxType) {
	return !(bbox2.left > bbox1.right ||
           bbox2.right < bbox1.left ||
           bbox2.top > bbox1.bottom ||
           bbox2.bottom < bbox1.top)
}

function computeBBoxFromPositionAndDimensions({ left, top }: LTPositionType, dimensions: DimensionsType): BBoxType {
	return {
		left,
		top,
		right: left + dimensions.width,
		bottom: top + dimensions.height,
	}
}

export {
	areBBoxIntersect,
	computeBBoxFromPositionAndDimensions,
}
