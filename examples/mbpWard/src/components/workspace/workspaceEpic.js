// @flow strict

import { createEpic, createUpdater, createSimpleUpdater, createEpicCondition, dispatchMsgEffectCreator, type BuiltInEffectType } from '../../../../../src/epics'
import {
	WorkspaceHtmlDraggingOverEvent,
	WorkspaceHtmlOnDropEvent,
	WorkspaceFileUploadingProgressEvent,
	WorkspaceFileUploadCompleteEvent,
	WorkspaceFileUploadFailedEvent,
	WorkspaceTextsRecognizedEvent,
	WorkspaceImageLoadedEvent,
	WorkspacePickSelectionAreaKindCancelBtnPressedEvent,
	WorkspacePickSelectionAreaKindNameBtnPressedEvent,
	WorkspacePickSelectionAreaKindPhoneBtnPressedEvent,
	WorkspacePickSelectionAreaKindEmailBtnPressedEvent,
	WorkspacePickSelectionAreaKindNationalityBtnPressedEvent,
} from './workspaceMsgs'
import { setProp, setPath2 } from '../../../../../src/utils'
import { storageRef } from '../firebase/firebase'
import { type TextInBoxType, type BoxType, type EventKindType, type BBoxType, type ParticipantType } from '../types'
import { BrowserDimensionsEvent } from '../env/envEvents'
import { emptyBox, EventKind } from '../constants'
import { SelectionFrameSelectionCompleteEvent } from '../selectionFrame/selectionFrameMsgs'
import {
	ParticipantEditorSetNameAndBoxCmd,
	ParticipantEditorSetPhoneAndBoxCmd,
	ParticipantEditorSetEmailAndBoxCmd,
	ParticipantEditorSetNationalityAndBoxCmd,
} from '../participantEditor/participantEditorMsgs'
import { bboxToBox, scaleBox } from '../utils'
import { DbParticipantsUpdatedEvent } from '../firebase/firebaseEvents'

type WorkspaceStateType = {|
	allParticipants: Array<ParticipantType>,
    draggingFileOverWorkspace: bool,
	openedFile: {|
		name: string,
		url: string,
		recognizedTexts: Array<TextInBoxType>,
		dimensions: {| width: number, height: number |},
		scale: number,
		recognizedTextsScaled: Array<TextInBoxType>,
		eventKind: EventKindType,
		eventDate: string,
		eventLocation: string,
		participants: Array<ParticipantType>,
		participantsBoxesScaled: Array<{| box: BoxType, participant: ParticipantType |}>,
		visibleBoxes: Array<{| box: BoxType, text: string, color: string, thickness: number |}>,
	|},
	uploadingFile: {| active: bool, progress: number |},
	pickSelectionArea: {| active: bool, box: BoxType |},
|}

const initialState: WorkspaceStateType = {
	allParticipants: [],
	draggingFileOverWorkspace: false,
	openedFile: {
		name: '',
		url: '',
		recognizedTexts: [],
		dimensions: { width: 0, height: 0 },
		scale: 0,
		recognizedTextsScaled: [],
		eventKind: EventKind.PEACE_INVOKING_CEREMONY,
		eventDate: 'jan-01-2019',
		eventLocation: 'uae-dubai-center',
		participants: [],
		participantsBoxesScaled: [],
		visibleBoxes: [],
	},
	uploadingFile: { progress: 0, active: false },
	pickSelectionArea: { active: false, box: emptyBox },
}

const setOpenedFileUrl = setPath2<WorkspaceStateType, *, *>('openedFile', 'url')
const setOpenedFileParticipants = setPath2<WorkspaceStateType, *, *>('openedFile', 'participants')
const setOpenedFileParticipantsBoxesScaled = setPath2<WorkspaceStateType, *, *>('openedFile', 'participantsBoxesScaled')
const setOpenedFileVisibleBoxes = setPath2<WorkspaceStateType, *, *>('openedFile', 'visibleBoxes')
const setOpenedFileName = setPath2<WorkspaceStateType, *, *>('openedFile', 'name')
const setOpenedFileDimensions = setPath2<WorkspaceStateType, *, *>('openedFile', 'dimensions')
const setOpenedFileScale = setPath2<WorkspaceStateType, *, *>('openedFile', 'scale')
const setOpenedFileRecognizedTexts = setPath2<WorkspaceStateType, *, *>('openedFile', 'recognizedTexts')
const setOpenedFileRecognizedTextsScaled = setPath2<WorkspaceStateType, *, *>('openedFile', 'recognizedTextsScaled')
const setDraggingFileOverWorkspace = setProp<WorkspaceStateType, *>('draggingFileOverWorkspace')
const setPickSelectionArea = setProp<WorkspaceStateType, *>('pickSelectionArea')
const setAllParticipants = setProp<WorkspaceStateType, *>('allParticipants')
const resetPickSelectionArea = setPickSelectionArea(initialState.pickSelectionArea)
const setFileUploadProgress = setPath2<WorkspaceStateType, *, *>('uploadingFile', 'progress')
const setFileUploadActive = setPath2<WorkspaceStateType, *, *>('uploadingFile', 'active')
const resetFileUpload = setProp<WorkspaceStateType, *>('uploadingFile')(initialState.uploadingFile)

const makeReadTextUrl = fileName => `https://us-central1-mbp-ward.cloudfunctions.net/read?fileName=${fileName}`

const vcet = 'WORKSPACE_VCET'
const WorkspaceStateChanged = createEpicCondition<WorkspaceStateType>(vcet)
const WorkspaceAllParticipants = WorkspaceStateChanged.wsk('allParticipants')
const WorkspaceOpenedFileChanged = WorkspaceStateChanged.wsk('openedFile')
const WorkspaceOpenedFileDimensionsChanged = WorkspaceOpenedFileChanged.wsk('dimensions')
const WorkspaceOpenedFileScaleChanged = WorkspaceOpenedFileChanged.wsk('scale')
const WorkspaceOpenedFileRecognizedTexts = WorkspaceOpenedFileChanged.wsk('recognizedTexts')
const WorkspaceOpenedFileRecognizedTextsScaled = WorkspaceOpenedFileChanged.wsk('recognizedTextsScaled')
const WorkspaceOpenedFileParticipantsBoxesScaled = WorkspaceOpenedFileChanged.wsk('participantsBoxesScaled')

const WorkspaceOpenedFileName = WorkspaceOpenedFileChanged.wsk('name')


const toOrigBox = (box: BoxType, scale: number) => {
	return {
		left: box.left / scale,
		top: box.top / scale,
		width: box.width / scale,
		height: box.height / scale,
	}
}

const rectsAreIntersect = (r1, r2) => {
	return !(r2.left > r1.right ||
			r2.right < r1.left ||
			r2.top > r1.bottom ||
			r2.bottom < r1.top)
}

const makeSelectionAreaBtnKindPressedUpdater = ({ btnPressedEvent, cmd, fix }) => createSimpleUpdater(
	btnPressedEvent.condition,
	({ R, state }) => {
		const result = R.mapState(resetPickSelectionArea)

		const box = toOrigBox(state.pickSelectionArea.box, state.openedFile.scale)

		const recognizedTextInArea: Array<{| box: BoxType, bbox: BBoxType, text: string |}> = state.openedFile.recognizedTexts
			.map(({ box, text }) => {
				const { left, top, width, height } = box
				const right = left + width
				const bottom = top + height
				const bbox = { left, top, right, bottom }

				return { box, bbox, text }
			}).filter(({ bbox }) => {
				const boxRight = box.left + box.width
				const boxBottom = box.top + box.height

				return rectsAreIntersect(bbox, { left: box.left, top: box.top, right: boxRight, bottom: boxBottom })
			})

		const firstRecognizedText = recognizedTextInArea[0]

		if (!firstRecognizedText) { return result }

		const firstRecognizedTextBbox = firstRecognizedText.bbox

		const recognizedTextsBbox = recognizedTextInArea.reduce((resultBBox, { bbox }) => {
			return {
				left: Math.min(bbox.left, resultBBox.left),
				top: Math.min(bbox.top, resultBBox.top),
				right: Math.max(bbox.right, resultBBox.right),
				bottom: Math.max(bbox.bottom, resultBBox.bottom),
			}
		}, firstRecognizedTextBbox)

		return result.sideEffect(
			dispatchMsgEffectCreator(cmd.create({
				value: fix(recognizedTextInArea.map(({ text }) => text).join(' ')),
				box: bboxToBox(recognizedTextsBbox),
			}))
		)
	}
)

const workspaceEpic = createEpic<WorkspaceStateType, BuiltInEffectType, empty>({
	vcet,
	initialState,
	updaters: {
		draggingFileOverWorkspace: createSimpleUpdater(
			WorkspaceHtmlDraggingOverEvent.condition,
			({ R }) => R.mapState(setDraggingFileOverWorkspace(true)),
		),
		fileDroppedOnWorkspace: createSimpleUpdater(
			WorkspaceHtmlOnDropEvent.condition,
			({ R, value: { files }, dispatch }) => {
				const file = files[0]

				if (!file) return R

				const { name } = file
				// eslint-disable-next-line no-unused-vars
				const [location, kind, dateStr] = name.split('.')
				const date = new Date(dateStr)

				if (!Object.values(EventKind).includes(kind) || isNaN(date.valueOf())) {
					alert(`File name should be "location.kind.date.jpg"\nExample: uae-dubai-center.pic.jan-01-2019.part1.jpg\nPossible kinds: \n${Object.keys(EventKind).map(k => `"${EventKind[k]}" for ${k}`).join('\n')}`)
					return R
				}

				const ref = storageRef.child(`raw/${file.name}`)

				const uploadTask = ref.put(file)

				uploadTask.on('state_changed', function(snapshot) {
					dispatch(WorkspaceFileUploadingProgressEvent.create({ progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100 }))
				}, function() {
					dispatch(WorkspaceFileUploadFailedEvent.create())
				}, function() {
					uploadTask.snapshot.ref.getDownloadURL().then(function(fileUrl) {
						dispatch(WorkspaceFileUploadCompleteEvent.create({ fileUrl, fileName: file.name }))
					})
				})

				return R
					.mapState(setDraggingFileOverWorkspace(false))
					.mapState(setFileUploadActive(true))
			},
		),
		fileUploadProgress: createSimpleUpdater(
			WorkspaceFileUploadingProgressEvent.condition,
			({ R, value: { progress } }) => R.mapState(setFileUploadProgress(progress)),
		),
		fileUploadComplete: createSimpleUpdater(
			WorkspaceFileUploadCompleteEvent.condition,
			({ R, value: { fileUrl, fileName }, dispatch }) => {
				fetch(makeReadTextUrl(fileName)).then((response) => {
					response.json().then(json => {
						const { textAnnotations } = json
						const texts = textAnnotations
							.filter((e,i) => i !== 0)
							// eslint-disable-next-line no-unused-vars
							.map(({ boundingPoly: { vertices: [{ x: left, y: top }, _, { x: right, y: bottom }] }, description: text }) => {
								const box = {
									left,
									top,
									width: right - left,
									height: bottom - top,
								}

								return {
									box,
									text,
								}
							})

						dispatch(WorkspaceTextsRecognizedEvent.create({ texts }))
					})
				})
				return R
					.mapState(resetFileUpload)
					.mapState(setOpenedFileUrl(fileUrl))
					.mapState(setOpenedFileName(fileName))
					.mapState(setOpenedFileDimensions({ width: 0, height: 0 }))
			},
		),
		fileUploadFailed: createSimpleUpdater(
			WorkspaceFileUploadFailedEvent.condition,
			({ R }) => R.mapState(resetFileUpload),
		),
		elementsRecognized: createSimpleUpdater(
			WorkspaceTextsRecognizedEvent.condition.ws(({ texts }) => texts),
			({ R, value }) => R.mapState(setOpenedFileRecognizedTexts(value)),
		),
		workspaceImageLoaded: createSimpleUpdater(
			WorkspaceImageLoadedEvent.condition.ws(({ width, height }) => ({ width, height })),
			({ value, R }) => R.mapState(setOpenedFileDimensions(value))
		),
		computeOpenedFileScale: createUpdater({
			given: {},
			when: {
				dimensions: WorkspaceOpenedFileDimensionsChanged,
				browserDimensions: BrowserDimensionsEvent.condition,
			},
			then: ({ values: { dimensions, browserDimensions }, R }) => {
				const widthScale = browserDimensions.width / dimensions.width
				const heightScale = browserDimensions.height / dimensions.height
				const scale = Math.min(widthScale, heightScale)

				return R.mapState(setOpenedFileScale(scale))
			},
		}),
		computeRecognizedTextsScaled: createUpdater({
			given: {},
			when: {
				scale: WorkspaceOpenedFileScaleChanged,
				recognizedTexts: WorkspaceOpenedFileRecognizedTexts,
			},
			then: ({ values: { scale, recognizedTexts }, R }) => R.mapState(
				setOpenedFileRecognizedTextsScaled(
					recognizedTexts.map(({ box, text }) => ({
						box: scaleBox({ box, scale }),
						text,
					}))
				)
			),
		}),
		areaSelected: createSimpleUpdater(
			SelectionFrameSelectionCompleteEvent.condition,
			({ R, value: { box }, state }) => {
				if (!state.openedFile.name) return R
				return R.mapState(setPickSelectionArea({ box, active: true }))
			}
		) ,
		cancelPickSelectionAreaKind: createSimpleUpdater(
			WorkspacePickSelectionAreaKindCancelBtnPressedEvent.condition,
			({ R }) => R.mapState(resetPickSelectionArea)
		),
		pickSelectionAreaKindName: makeSelectionAreaBtnKindPressedUpdater({
			btnPressedEvent: WorkspacePickSelectionAreaKindNameBtnPressedEvent,
			cmd: ParticipantEditorSetNameAndBoxCmd,
			fix: s => s,
		}),
		pickSelectionAreaKindPhone: makeSelectionAreaBtnKindPressedUpdater({
			btnPressedEvent: WorkspacePickSelectionAreaKindPhoneBtnPressedEvent,
			cmd: ParticipantEditorSetPhoneAndBoxCmd,
			fix: s => s.toLowerCase().replace(/s/g, '5').replace(/j/g, '5').replace(/o/g, '0').replace(/\s/g, '').replace(/\./g, '').replace(/-/g, '').replace(/t/g, '+'),
		}),
		pickSelectionAreaKindEmail: makeSelectionAreaBtnKindPressedUpdater({
			btnPressedEvent: WorkspacePickSelectionAreaKindEmailBtnPressedEvent,
			cmd: ParticipantEditorSetEmailAndBoxCmd,
			fix: s => s.replace(/\s/g, ''),
		}),
		pickSelectionAreaKindNationality: makeSelectionAreaBtnKindPressedUpdater({
			btnPressedEvent: WorkspacePickSelectionAreaKindNationalityBtnPressedEvent,
			cmd: ParticipantEditorSetNationalityAndBoxCmd,
			fix: s => s.replace(/\s/g, ''),
		}),

		participantsUpdated: createSimpleUpdater(
			DbParticipantsUpdatedEvent.condition,
			({ R, value: { participants } }) => R.mapState(setAllParticipants(participants))
		),

		computeOpenedFileParticipants: createUpdater({
			given: {},
			when: {
				scale: WorkspaceOpenedFileScaleChanged,
				openedFileName: WorkspaceOpenedFileName,
				allParticipants: WorkspaceAllParticipants,
			},
			then: ({ values: { scale, openedFileName, allParticipants }, R }) => {
				const participants = allParticipants.filter(({ events }) => events && events.find(e => e.fileName === openedFileName))

				return R
					.mapState(setOpenedFileParticipants(participants))
					.mapState(setOpenedFileParticipantsBoxesScaled(
						participants.reduce((r, participant) => {
							const event = participant.events.find(e => e.fileName === openedFileName)

							if (event) {
								r.push({ box: scaleBox({ box: event.nameBox, scale }), participant })
								r.push({ box: scaleBox({ box: event.emailBox, scale }), participant })
								r.push({ box: scaleBox({ box: event.phoneBox, scale }), participant })
								r.push({ box: scaleBox({ box: event.nationalityBox, scale }), participant })
							}

							return r
						}, [])))
			},
		}),

		computeOpenedFileVisibleBoxes: createUpdater({
			given: {},
			when: {
				recognizedTextsScaled: WorkspaceOpenedFileRecognizedTextsScaled,
				participantsBoxesScaled: WorkspaceOpenedFileParticipantsBoxesScaled,
			},
			then: ({ values: { recognizedTextsScaled, participantsBoxesScaled }, R }) => {
				return R.mapState(setOpenedFileVisibleBoxes(
					[
						...recognizedTextsScaled.map(({box, text}) => ({ box, text, color: 'orange', thickness: 1 })),
						...participantsBoxesScaled.map(({ box, participant }) => ({
							box,
							text: `${participant.name} - ${participant.nationality} - ${participant.phone} - ${participant.email}`,
							color: 'green',
							thickness: 2,
						})),
					]
				))
			},
		}),
	},
})

// eslint-disable-next-line import/group-exports
export {
	workspaceEpic,
	WorkspaceOpenedFileName,
}

// eslint-disable-next-line import/group-exports
export type {
	WorkspaceStateType,
}
