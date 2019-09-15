// @flow

import { type BoxType, type BBoxType } from './types'

const EventKind = {
	HAVAN: 'pic',
	SAMBODH_DHYAAN: 'sd',
	MAITRI_LIGHT: 'ml',
	SOUL_NOURISHING: 'sn',
	BODH_1: 'b1',
	BODH_2: 'b2',
	BODH_3: 'b3',
	BODH_4: 'b4',
	UNKNOWN: 'unknown',
}

const EventKindToString = Object.keys(EventKind).reduce((a,k) => {
	a[EventKind[k]] = k
	return a
},{})

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

const SeekerJorneySpreadsheetId = '1GaD30yoKNxD3etVqnIb8UFN6MEFL-dg425vRc61IWYw'
const SeekerJorneySpreadsheetDataOffset = 5

export {
	EventKind,
	emptyBox,
	emptyBBox,
	EventKindToString,
	SeekerJorneySpreadsheetId,
	SeekerJorneySpreadsheetDataOffset,
}
