// @flow

import { type BoxType } from './types'

const EventKind = {
	PEACE_INVOKING_CEREMONY: 'PEACE_INVOKING_CEREMONY',
	SAMBODH_DHYAAN: 'SAMBODH_DHYAAN',
	MAITRI_LIGHT: 'MAITRI_LIGHT',
	SOUL_NOURISHING: 'SOUL_NOURISHING',
	BODH_1: 'BODH_1',
	BODH_2: 'BODH_2',
	BODH_3: 'BODH_3',
	BODH_4: 'BODH_4',
}

const emptyBox: BoxType = {
	left: 0,
	top: 0,
	width: 0,
	height: 0,
}

export {
	EventKind,
	emptyBox,
}
