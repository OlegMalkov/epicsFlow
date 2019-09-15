// @flow

import {
	createEpic,
	createEpicCondition,
	type BuiltInEffectType,
	createSimpleUpdater,
	createUpdater,
} from '../../../../../src/epics'
import { setProp } from '../../../../../src/utils'
import { type BoxType, type ParticipantType } from '../types'
import { emptyBox } from '../constants'
import {
	ParticipantEditorNameInputOnChangeEvent,
	ParticipantEditorPhoneInputOnChangeEvent,
	ParticipantEditorEmailInputOnChangeEvent,
	ParticipantEditorNationalityInputOnChangeEvent,
	ParticipantEditorSetNameAndBoxCmd,
	ParticipantEditorSetPhoneAndBoxCmd,
	ParticipantEditorSetEmailAndBoxCmd,
	ParticipantEditorSetNationalityAndBoxCmd,
	ParticipantEditorAddBtnPressed,
	ParticipantEditorUseExistingParticipant,
} from './participantEditorMsgs'
import { db } from '../firebase/firebase'
import { WorkspaceOpenedFileName } from '../workspace/workspaceEpic'
import { findBestMatch } from 'string-similarity'
import { DbParticipantsUpdatedEvent } from '../firebase/firebaseEvents'

type ParticipantEditorStateType = {|
	existingParticipant: ParticipantType | null,
	visible: bool,
	name: string,
	phone: string,
	email: string,
	nationality: string,
	nameBox: BoxType,
	phoneBox: BoxType,
	emailBox: BoxType,
	nationalityBox: BoxType,
	bestMatchParticipants: Array<{| participant: ParticipantType, rating: number, source: string |}>,
|}

const initialState: ParticipantEditorStateType = {
	existingParticipant: null,
	visible: false,
	name: '',
	phone: '',
	email: '',
	nationality: '',
	nameBox: emptyBox,
	phoneBox: emptyBox,
	emailBox: emptyBox,
	nationalityBox: emptyBox,
	bestMatchParticipants: [],
}

const vcet = 'PARTICIPANT_EDITOR_VCET'
const ParticipantEditiorStateChanged = createEpicCondition<ParticipantEditorStateType>(vcet)

const ParticipantEditiorName = ParticipantEditiorStateChanged.wsk('name')
const ParticipantEditiorPhone = ParticipantEditiorStateChanged.wsk('phone')
const ParticipantEditiorEmail = ParticipantEditiorStateChanged.wsk('email')
const ParticipantEditiorNationality = ParticipantEditiorStateChanged.wsk('nationality')

const setVisible = setProp<ParticipantEditorStateType, *>('visible')
const setExisitngParticipant = setProp<ParticipantEditorStateType, *>('existingParticipant')
const setName = setProp<ParticipantEditorStateType, *>('name')
const setPhone = setProp<ParticipantEditorStateType, *>('phone')
const setEmail = setProp<ParticipantEditorStateType, *>('email')
const setNationality = setProp<ParticipantEditorStateType, *>('nationality')
const setNameBox = setProp<ParticipantEditorStateType, *>('nameBox')
const setPhoneBox = setProp<ParticipantEditorStateType, *>('phoneBox')
const setEmailBox = setProp<ParticipantEditorStateType, *>('emailBox')
const setNationalityBox = setProp<ParticipantEditorStateType, *>('nationalityBox')
const setBestMatchParticipants = setProp<ParticipantEditorStateType, *>('bestMatchParticipants')

const participantEditorEpic = createEpic<ParticipantEditorStateType, BuiltInEffectType, empty>({
	vcet,
	initialState,
	updaters: {
		nameInputOnChange: createSimpleUpdater(
			ParticipantEditorNameInputOnChangeEvent.condition.wsk('value'),
			({ R, value }) => R.mapState(setName(value))
		),
		phoneInputOnChange: createSimpleUpdater(
			ParticipantEditorPhoneInputOnChangeEvent.condition.wsk('value'),
			({ R, value }) => R.mapState(setPhone(value))
		),
		emailInputOnChange: createSimpleUpdater(
			ParticipantEditorEmailInputOnChangeEvent.condition.wsk('value'),
			({ R, value }) => R.mapState(setEmail(value))
		),
		nationalityInputOnChange: createSimpleUpdater(
			ParticipantEditorNationalityInputOnChangeEvent.condition.wsk('value'),
			({ R, value }) => R.mapState(setNationality(value))
		),

		setNameValueAndBox: createSimpleUpdater(
			ParticipantEditorSetNameAndBoxCmd.condition,
			({ R, value: { value, box } }) => R.mapState(setName(value)).mapState(setNameBox(box))
		),
		setPhoneValueAndBox: createSimpleUpdater(
			ParticipantEditorSetPhoneAndBoxCmd.condition,
			({ R, value: { value, box } }) => R.mapState(setPhone(value)).mapState(setPhoneBox(box))
		),
		setEmailValueAndBox: createSimpleUpdater(
			ParticipantEditorSetEmailAndBoxCmd.condition,
			({ R, value: { value, box } }) => R.mapState(setEmail(value)).mapState(setEmailBox(box))
		),
		setNationalityValueAndBox: createSimpleUpdater(
			ParticipantEditorSetNationalityAndBoxCmd.condition,
			({ R, value: { value, box } }) => R.mapState(setNationality(value)).mapState(setNationalityBox(box))
		),

		onInputFieldsChanged: createUpdater({
			given: {},
			when: {
				name: ParticipantEditiorName,
				phone: ParticipantEditiorPhone,
				email: ParticipantEditiorEmail,
				nationality: ParticipantEditiorNationality,
			},
			then: ({ R, values: { name, phone, email, nationality }, state}) => {
				let result = R

				if ((name || phone || email || nationality) && !state.visible) {
					result = result.mapState(setVisible(true))
				}

				// search for existing records

				return result
			},
		}),

		addParticipant: createUpdater({
			given: {
				fileName: WorkspaceOpenedFileName,
			},
			when: {
				_: ParticipantEditorAddBtnPressed.condition,
			},
			then: ({ R, state, values: { fileName } }) => {
				const { name, phone, email, nationality, nameBox, phoneBox, emailBox, nationalityBox, existingParticipant } = state

				const newEvent = {
					fileName,

					nameBox,
					phoneBox,
					emailBox,
					nationalityBox,
				}

				if (existingParticipant) {
					db.collection('participants').doc(existingParticipant.id).set({
						...state.existingParticipant,
						name,
						phone,
						email,
						nationality,
						events: [
							...existingParticipant.events.filter((event) => event.fileName !== fileName),
							newEvent,
						],
					})
				} else {
					db.collection('participants').add({
						name,
						phone,
						email,
						nationality,

						events: [newEvent],
					})
				}

				return R.mapState(() => initialState)
			},
		}),

		searchExistingParticipants: createUpdater({
			given: {
				allParicipants: DbParticipantsUpdatedEvent.condition.wsk('participants'),
			},
			when: {
				name: ParticipantEditiorName,
				phone: ParticipantEditiorPhone,
				email: ParticipantEditiorEmail,
			},
			then: ({ R, values: { name, phone, email, allParicipants } }) => {
				if (!name && !phone && !email) return R

				const { bestMatch: { rating: nameMatchRating }, bestMatchIndex: nameBestMatchIndex } = findBestMatch(name, allParicipants.map(p => p.name))
				const { bestMatch: { rating: phoneMatchRating }, bestMatchIndex: phoneBestMatchIndex } = findBestMatch(phone, allParicipants.map(p => p.phone))
				const { bestMatch: { rating: emailMatchRating }, bestMatchIndex: emailBestMatchIndex } = findBestMatch(email, allParicipants.map(p => p.email))

				const matches = []

				if (name && nameMatchRating > 0.5) matches.push({ rating: nameMatchRating, index: nameBestMatchIndex, source: 'name' })

				if (phone && phoneMatchRating > 0.5) {
					const existing = matches.find(({ index }) => index === phoneBestMatchIndex)

					if (existing) {
						existing.source += '+phone'
						existing.rating = (existing.rating + phoneMatchRating) / 2
					} else {
						matches.push({ rating: phoneMatchRating, index: phoneBestMatchIndex, source: 'phone' })
					}
				}

				if (email && emailMatchRating > 0.5) {
					const existing = matches.find(({ index }) => index === emailBestMatchIndex)

					if (existing) {
						existing.source += '+email'
						existing.rating = (existing.rating + emailMatchRating) / 2
					} else {
						matches.push({ rating: emailMatchRating, index: emailBestMatchIndex, source: 'email' })
					}
				}
				return R.mapState(setBestMatchParticipants(matches.map(({ rating, index, source }) => ({ participant: allParicipants[index], rating, source }))))
			},
		}),
		useExistingParticipant: createSimpleUpdater(
			ParticipantEditorUseExistingParticipant.condition,
			({ R, state, value: { index } }) => {
				const { participant } = state.bestMatchParticipants[index]

				let result = R

				if (participant.name) {
					result = result.mapState(setName(participant.name))
				}
				if (participant.phone) {
					result = result.mapState(setPhone(participant.phone))
				}
				if (participant.email) {
					result = result.mapState(setEmail(participant.email))
				}
				if (participant.nationality) {
					result = result.mapState(setNationality(participant.nationality))
				}

				result = result.mapState(setExisitngParticipant(participant))

				return result
			}
		),
	},
})

// eslint-disable-next-line import/group-exports
export {
	participantEditorEpic,
}

// eslint-disable-next-line import/group-exports
export type {
	ParticipantEditorStateType,
}
