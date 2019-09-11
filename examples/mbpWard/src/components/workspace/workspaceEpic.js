// @flow strict

import { createEpic, createUpdater } from '../../../../../src/epics'
import {
	WorkspaceHtmlDraggingOverEvent,
	WorkspaceHtmlOnDropEvent,
	WorkspaceFileUploadingProgressEvent,
	WorkspaceFileUploadCompleteEvent,
	WorkspaceFileUploadFailedEvent,
} from './workspaceEvents'
import { setProp, setPath2 } from '../../../../../src/utils'
import { storageRef } from '../firebase/firebase'

type WorkspaceStateType = {|
    draggingFileOverWorkspace: bool,
    openedFile: {| uri: string, url: string |},
	uploadingFile: {| active: bool, uri: string, progress: number |},
|}

const initialState: WorkspaceStateType = {
	draggingFileOverWorkspace: false,
	openedFile: { uri: '', url: '' },
	uploadingFile: { uri: '', progress: 0, active: false },
}

const setOpenedFileUrl = setPath2<WorkspaceStateType, *, *>('openedFile', 'url')
const setDraggingFileOverWorkspace = setProp<WorkspaceStateType, *>('draggingFileOverWorkspace')
const setFileUploadProgress = setPath2<WorkspaceStateType, *, *>('uploadingFile', 'progress')
const setFileUploadActive = setPath2<WorkspaceStateType, *, *>('uploadingFile', 'active')
const resetFileUpload = setProp<WorkspaceStateType, *>('uploadingFile')(initialState.uploadingFile)

const workspaceEpic = createEpic<WorkspaceStateType, empty, empty>({
	vcet: 'WORKSPACE_VCET',
	initialState,
	updaters: {
		draggingFileOverWorkspace: createUpdater({
			given: {},
			when: {
				_: WorkspaceHtmlDraggingOverEvent.condition,
			},
			then: ({ R }) => R.mapState(setDraggingFileOverWorkspace(true)),
		}),
		fileDroppedOnWorkspace: createUpdater({
			given: {},
			when: {
				dropData: WorkspaceHtmlOnDropEvent.condition,
			},
			then: ({ R, values: { dropData: { files } }, dispatch }) => {
				const file = files[0]

				const ref = storageRef.child(`raw/${file.name}`)

				const uploadTask = ref.put(file)

				uploadTask.on('state_changed', function(snapshot) {
					dispatch(WorkspaceFileUploadingProgressEvent.create({ progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100 }))
				}, function() {
					dispatch(WorkspaceFileUploadFailedEvent.create())
				}, function() {
					uploadTask.snapshot.ref.getDownloadURL().then(function(fileUrl) {
						dispatch(WorkspaceFileUploadCompleteEvent.create({ fileUrl }))
					})
				})

				return R
					.mapState(setDraggingFileOverWorkspace(false))
					.mapState(setFileUploadActive(true))
			},
		}),
		fileUploadProgress: createUpdater({
			given: {},
			when: {
				progressAction: WorkspaceFileUploadingProgressEvent.condition,
			},
			then: ({ R, values: { progressAction: { progress } } }) => R.mapState(setFileUploadProgress(progress)),
		}),
		fileUploadComplete: createUpdater({
			given: {},
			when: {
				data: WorkspaceFileUploadCompleteEvent.condition,
			},
			then: ({ R, values: { data: { fileUrl } } }) => R
				.mapState(resetFileUpload)
				.mapState(setOpenedFileUrl(fileUrl)),
		}),
		fileUploadFailed: createUpdater({
			given: {},
			when: {
				progressAction: WorkspaceFileUploadFailedEvent.condition,
			},
			then: ({ R }) => R.mapState(resetFileUpload),
		}),
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
