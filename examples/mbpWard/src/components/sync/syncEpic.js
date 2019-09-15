// @flow strict

import { createEpic, createUpdater, createSimpleUpdater } from '../../../../../src/epics'
import { setProp } from '../../../../../src/utils'
import { type ParticipantType } from '../types'
import { GapiSeekerJorneySheetDataFetched } from '../gapi/gapiEvents'
import { initGapiAndFetchSeekersJorneyData, gapi } from '../gapi/gapi'
import { DbParticipantsUpdatedEvent } from '../firebase/firebaseEvents'
import { SyncBtnPressedEvent, SyncCompleteEvent, SyncProgressEvent } from './syncMsgs'
import { SeekerJorneySpreadsheetId, EventKind, SeekerJorneySpreadsheetDataOffset } from '../constants'
import { getEventKindFromFileName, getDateFromFileName } from '../utils'

type SyncStateType = {|
	progress: {| active: false |} | {| active: true, awaitingSeekersJorneyData: bool, index: number, count: number, participant: ParticipantType |},
|}

const setProgress = setProp<SyncStateType, *>('progress')

const eventsFor = (eventKind, participant) => participant.events.filter(e => getEventKindFromFileName(e.fileName) === eventKind)
	.map(e => getDateFromFileName(e.fileName))
	.sort((d1, d2) => d1.getTime() - d2.getTime())
	.map(d => d.toDateString())
	.join(', ')

const syncEpic = createEpic<SyncStateType, empty, empty>({
	vcet: 'SYNC_VCET',
	initialState: { progress: { active: false } },
	updaters: {
		startSync: createUpdater({
			given: {
				allParticipants: DbParticipantsUpdatedEvent.condition.wsk('participants'),
			},
			when: {
				seekerJorneySheetData: GapiSeekerJorneySheetDataFetched.condition.wsk('rows').to().resetConditionsByKeyAfterReducerCall(['seekerJorneySheetData']),
				startSync: SyncBtnPressedEvent.condition,
			},
			then: ({ R, values: { allParticipants, seekerJorneySheetData }, dispatch }) => {
				const initialProgressState = { active: true, index: 0, count: allParticipants.length, participant: allParticipants[0] }

				if (seekerJorneySheetData) {
					let newEntriesAddedCount = 0

					allParticipants.reduce((prevPromise, participant, index) => {
						return prevPromise.then(() => {
							const existingSheetRecord = seekerJorneySheetData.find(({id}) => participant.id === id)

							const indexInSheet = existingSheetRecord ? seekerJorneySheetData.indexOf(existingSheetRecord) : seekerJorneySheetData.length + newEntriesAddedCount

							if (!existingSheetRecord) {
								newEntriesAddedCount ++
							}

							dispatch(SyncProgressEvent.create({ index, participant }))
							const rowIndex = indexInSheet + SeekerJorneySpreadsheetDataOffset + 1
							const range = `A${rowIndex}:M${rowIndex}`
							const params = {
								spreadsheetId: SeekerJorneySpreadsheetId,
								range,
								valueInputOption: 'RAW',
							}

							const valueRangeBody = {
								range,
								majorDimension: 'ROWS',
								values: [
									[
										participant.id,
										indexInSheet + 1,
										participant.name,
										participant.phone,
										participant.email,
										eventsFor(EventKind.SAMBODH_DHYAAN, participant),
										eventsFor(EventKind.MAITRI_LIGHT, participant),
										eventsFor(EventKind.HAVAN, participant),
										eventsFor(EventKind.SOUL_NOURISHING, participant),
										eventsFor(EventKind.BODH_1, participant),
										eventsFor(EventKind.BODH_2, participant),
										eventsFor(EventKind.BODH_3, participant),
										eventsFor(EventKind.BODH_4, participant),
									],
								],
							}

							const request = gapi.client.sheets.spreadsheets.values.update(params, valueRangeBody)

							return request.then(function(response) {
								console.log('sync response for', participant.id, participant.name, response.result) // eslint-disable-line
							}, function(reason) {
								alert(`Failed to sync ${participant.name}(${participant.id}): ${reason}`)
							})
						})
					}, Promise.resolve()).then(() => {
						dispatch(SyncCompleteEvent.create())
					})

					return R.mapState(setProgress({ ...initialProgressState, awaitingSeekersJorneyData: false }))
				} else {
					const reply = confirm('WARNING! Sync progress will take time, and you should not touch computer while it is happening. ARE YOU SURE you want to continue?') // eslint-disable-line
					if (!reply) return R
					initGapiAndFetchSeekersJorneyData(dispatch)

					return R.mapState(setProgress({ ...initialProgressState, awaitingSeekersJorneyData: true }))
				}
			},
		}),
		syncProgress: createSimpleUpdater(
			SyncProgressEvent.condition,
			({ R, value: { index, participant }, state }) => state.progress.active ? R.mapState(setProgress({ ...state.progress, index, participant })) : R
		),
		syncComplete: createSimpleUpdater(
			SyncCompleteEvent.condition,
			({ R }) => R.mapState(setProgress({ active: false }))
		),
	},
})

// eslint-disable-next-line import/group-exports
export {
	syncEpic,
}

// eslint-disable-next-line import/group-exports
export type {
	SyncStateType,
}
