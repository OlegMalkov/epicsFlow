// @flow strict

import { createEpic, createUpdater, createSimpleUpdater, createEpicCondition } from '../../../../../src/epics'
import {
	WorkspaceHtmlDraggingOverEvent,
	WorkspaceHtmlOnDropEvent,
	WorkspaceFileUploadingProgressEvent,
	WorkspaceFileUploadCompleteEvent,
	WorkspaceFileUploadFailedEvent,
	WorkspaceTextsRecognizedEvent,
	WorkspaceImageLoadedEvent,
	WorkspacePickSelectionAreaKindCancelBtnPressedEvent,
} from './workspaceEvents'
import { setProp, setPath2 } from '../../../../../src/utils'
import { storageRef } from '../firebase/firebase'
import { type TextInBoxType, type BoxType } from '../types'
import { BrowserDimensionsEvent } from '../env/envEvents'
import { emptyBox } from '../constants'
import { SelectionFrameSelectionCompleteEvent } from '../selectionFrame/selectionFrameMsgs'

type WorkspaceStateType = {|
    draggingFileOverWorkspace: bool,
    openedFile: {| name: string, url: string, recognizedTexts: Array<TextInBoxType>, dimensions: {| width: number, height: number |}, scale: number, recognizedTextsScaled: Array<TextInBoxType> |},
	uploadingFile: {| active: bool, progress: number |},
	pickSelectionArea: {| active: bool, box: BoxType |},
|}

const initialState: WorkspaceStateType = {
	draggingFileOverWorkspace: false,
	openedFile: { name: '', url: '', recognizedTexts: [], dimensions: { width: 0, height: 0 }, scale: 0, recognizedTextsScaled: [] },
	uploadingFile: { progress: 0, active: false },
	pickSelectionArea: { active: false, box: emptyBox },
}

const setOpenedFileUrl = setPath2<WorkspaceStateType, *, *>('openedFile', 'url')
const setOpenedFileName = setPath2<WorkspaceStateType, *, *>('openedFile', 'name')
const setOpenedFileDimensions = setPath2<WorkspaceStateType, *, *>('openedFile', 'dimensions')
const setOpenedFileScale = setPath2<WorkspaceStateType, *, *>('openedFile', 'scale')
const setOpenedFileRecognizedTexts = setPath2<WorkspaceStateType, *, *>('openedFile', 'recognizedTexts')
const setOpenedFileRecognizedTextsScaled = setPath2<WorkspaceStateType, *, *>('openedFile', 'recognizedTextsScaled')
const setDraggingFileOverWorkspace = setProp<WorkspaceStateType, *>('draggingFileOverWorkspace')
const setPickSelectionArea = setProp<WorkspaceStateType, *>('pickSelectionArea')
const resetPickSelectionArea = setPickSelectionArea(initialState.pickSelectionArea)
const setFileUploadProgress = setPath2<WorkspaceStateType, *, *>('uploadingFile', 'progress')
const setFileUploadActive = setPath2<WorkspaceStateType, *, *>('uploadingFile', 'active')
const resetFileUpload = setProp<WorkspaceStateType, *>('uploadingFile')(initialState.uploadingFile)

const makeReadTextUrl = fileName => `https://us-central1-mbp-ward.cloudfunctions.net/read?fileName=${fileName}`

const vcet = 'WORKSPACE_VCET'
const WorkspaceStateChanged = createEpicCondition<WorkspaceStateType>(vcet)
const WorkspaceOpenedFileChanged = WorkspaceStateChanged.wsk('openedFile')
const WorkspaceOpenedFileDimensionsChanged = WorkspaceOpenedFileChanged.wsk('dimensions')
const WorkspaceOpenedFileRecognizedTextsChanged = WorkspaceOpenedFileChanged.wsk('recognizedTexts')
const WorkspaceOpenedFileScaleChanged = WorkspaceOpenedFileChanged.wsk('scale')

const workspaceEpic = createEpic<WorkspaceStateType, empty, empty>({
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
							.filter(({ text }) => text.length > 1)

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
				recognizedTexts: WorkspaceOpenedFileRecognizedTextsChanged,
			},
			then: ({ values: { scale, recognizedTexts }, R }) => R.mapState(
				setOpenedFileRecognizedTextsScaled(
					recognizedTexts.map(({ box: { width, height, left, top }, text }) => ({
						box: { width: width * scale, height: height * scale, left: left * scale, top: top * scale },
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
		cancelPickSelectionAreaKind: createSimpleUpdater(WorkspacePickSelectionAreaKindCancelBtnPressedEvent.condition, ({ R }) => R.mapState(resetPickSelectionArea)),
	},
})

// eslint-disable-next-line import/group-exports
export {
	workspaceEpic,
}

// eslint-disable-next-line import/group-exports
export type {
	WorkspaceStateType,
}
