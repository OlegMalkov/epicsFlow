// @flow

import { type BBoxType, type BoxType } from './types'

const bboxToBox = ({ left, top, right, bottom }: BBoxType): BoxType => {
	return {
		left,
		top,
		width: right - left,
		height: bottom - top,
	}
}

const boxToBBox = ({ left, top, width, height }: BoxType): BBoxType => {
	return {
		left,
		top,
		right: left + width,
		bottom: top + height,
	}
}

type ScaleBoxPropsType = {|
	box: BoxType,
	scale: number,
|}

const scaleBox = ({ box: { width, height, left, top }, scale }: ScaleBoxPropsType) =>
	({ width: width * scale, height: height * scale, left: left * scale, top: top * scale })

function areBBoxIntersect(bbox1: BBoxType, bbox2: BBoxType) {
	return !(bbox2.left > bbox1.right ||
           bbox2.right < bbox1.left ||
           bbox2.top > bbox1.bottom ||
           bbox2.bottom < bbox1.top)
}

function areBoxIntersect(box1: BoxType, box2: BoxType) {
	return areBBoxIntersect(boxToBBox(box1), boxToBBox(box2))
}

export {
	bboxToBox,
	scaleBox,
	areBBoxIntersect,
	areBoxIntersect,
}
