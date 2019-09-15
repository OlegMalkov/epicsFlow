// @flow strict

import { createEvent } from '../../../../../src/epics'

const GapiSeekerJorneySheetDataFetched = createEvent<{| rows: Array<{| id: string |}> |}>('GAPI_SEEKER_JORNEY_DATA_FETCHED')

export {
	GapiSeekerJorneySheetDataFetched,
}
