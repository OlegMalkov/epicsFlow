// @flow

import { type DispatchType } from '../../../../../src/epics'
import { GapiSeekerJorneySheetDataFetched } from './gapiEvents'
import { SeekerJorneySpreadsheetId, SeekerJorneySpreadsheetDataOffset } from '../constants'

declare var gapi: Object

function initGapiAndFetchSeekersJorneyData(dispatch: DispatchType) {
	function makeApiCall() {
		const request = gapi.client.sheets.spreadsheets.get({
			spreadsheetId: SeekerJorneySpreadsheetId,
			includeGridData: true,
		})

		request.then(function(response) {
			//S.No.	Name	Phone	Email	Maitri Sambodh Dhyaan	Maitri Light 	Peace Invoking Ceremony (Havan)	Soul Nourishing Class	Bodh 1 - Awakening to Self Reaization	Bodh 2 - Purification	Bodh 3 - Path Divine 	Bodh 4 - Heal the soul	DDD by D	Other event	Becoming Sevak	Bodh seva started	Mitr / Maitreyi	SP Medium
			const data = response.result.sheets[0].data[0].rowData.slice(SeekerJorneySpreadsheetDataOffset).map(({ values }) => {
				if (!values || values.every(x => !x.formattedValue)) return null
				const [id, num, name, phone, email, e_msd, e_ml, e_poc, e_snc, e_b1, e_b2, e_b3, e_b4, e_ddd, e_other, becoming_sevak, seva_started, mitr, sp_medium] = values

				return ({
					id: id && id.formattedValue,
					num: num && num.formattedValue,
					name: name && name.formattedValue,
					phone: phone && phone.formattedValue,
					email: email && email.formattedValue,
					e_msd: e_msd && e_msd.formattedValue,
					e_ml: e_ml && e_ml.formattedValue,
					e_poc: e_poc && e_poc.formattedValue,
					e_snc: e_snc && e_snc.formattedValue,
					e_b1: e_b1 && e_b1.formattedValue,
					e_b2: e_b2 && e_b2.formattedValue,
					e_b3: e_b3 && e_b3.formattedValue,
					e_b4: e_b4 && e_b4.formattedValue,
					e_ddd: e_ddd && e_ddd.formattedValue,
					e_other: e_other && e_other.formattedValue,
					becoming_sevak: becoming_sevak && becoming_sevak.formattedValue,
					seva_started: seva_started && seva_started.formattedValue,
					mitr: mitr && mitr.formattedValue,
					sp_medium: sp_medium && sp_medium.formattedValue,
				})
			}).filter(x => x)

			dispatch(GapiSeekerJorneySheetDataFetched.create({ rows: data.map(({ id }) => ({ id })) }))
		}, function(reason) {
			alert(`fetching seeker jorney stylesheet error: ${ reason.result.error.message}`)
		})
	}

	function initClient() {
		gapi.client.init({
			apiKey: 'AIzaSyCMD6aTlYpJMvrE0Q-NGVDmGYjbuyrvy-A',
			scope: 'https://www.googleapis.com/auth/spreadsheets',
			clientId: '987164261211-hnh43un54t1tvo6ipme60icu83hckqoe.apps.googleusercontent.com',
			discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
		}).then(function() {
			gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus)
			updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get())
		})
	}

	function updateSignInStatus(isSignedIn) {
		if (isSignedIn) {
			makeApiCall()
		} else {
			gapi.auth2.getAuthInstance().signIn()
		}
	}

	initClient()
}
// 1. Load the JavaScript client library.
gapi.load('client:auth2', () => null)

const googleApi = gapi

export {
	initGapiAndFetchSeekersJorneyData,
	googleApi as gapi,
}
