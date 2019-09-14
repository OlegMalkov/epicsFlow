// @flow

import { type BoxType, type BBoxType } from './types'

const EventKind = {
	PEACE_INVOKING_CEREMONY: 'pic',
	SAMBODH_DHYAAN: 'sd',
	MAITRI_LIGHT: 'ml',
	SOUL_NOURISHING: 'sn',
	BODH_1: 'b1',
	BODH_2: 'b2',
	BODH_3: 'b3',
	BODH_4: 'b4',
	UNKNOWN: 'unknown',
}

const emptyBox: BoxType = {
	left: 0,
	top: 0,
	width: 0,
	height: 0,
}

const emptyBBox: BBoxType = {
	left: 0,
	top: 0,
	right: 0,
	bottom: 0,
}

export {
	EventKind,
	emptyBox,
	emptyBBox,
}
