// @flow strict

import { createSimpleEvent, createEvent } from '../../../../../src/epics'
import { type TextInBoxType } from '../types'

const WorkspaceHtmlDraggingOverEvent = createSimpleEvent('WORKSPACE_HTML_DRAGGING_OVER')
const WorkspaceHtmlOnDropEvent = createEvent<{| files: Array<File> |}>('WORKSPACE_HTML_ON_DROP')
const WorkspaceFileUploadingProgressEvent = createEvent<{| progress: number |}>('WORKSPACE_FILE_UPLOADING_PROGRESS')
const WorkspaceFileUploadCompleteEvent = createEvent<{| fileUrl: string, fileName: string |}>('WORKSPACE_FILE_UPLOAD_COMPLETE')
const WorkspaceFileUploadFailedEvent = createSimpleEvent('WORKSPACE_FILE_UPLOAD_FAILED')
const WorkspaceTextsRecognizedEvent = createEvent<{| texts: Array<TextInBoxType> |}>('WORKSPACE_ELEMENTS_RECOGNIZED')
const WorkspaceImageLoadedEvent = createEvent<{| width: number, height: number |}>('WORKSPACE_IMAGE_LOADED')

const WorkspacePickSelectionAreaKindNameBtnPressedEvent = createSimpleEvent('WORKSPACE_PICK_SELECTION_AREA_NAME_BTN_PRESSED')
const WorkspacePickSelectionAreaKindEmailBtnPressedEvent = createSimpleEvent('WORKSPACE_PICK_SELECTION_AREA_EMAIL_BTN_PRESSED')
const WorkspacePickSelectionAreaKindPhoneBtnPressedEvent = createSimpleEvent('WORKSPACE_PICK_SELECTION_AREA_PHONE_BTN_PRESSED')
const WorkspacePickSelectionAreaKindCancelBtnPressedEvent = createSimpleEvent('WORKSPACE_PICK_SELECTION_AREA_CANCEL_BTN_PRESSED')

export {
	WorkspaceHtmlDraggingOverEvent,
	WorkspaceHtmlOnDropEvent,
	WorkspaceFileUploadingProgressEvent,
	WorkspaceFileUploadCompleteEvent,
	WorkspaceFileUploadFailedEvent,
	WorkspaceTextsRecognizedEvent,
	WorkspaceImageLoadedEvent,
	WorkspacePickSelectionAreaKindNameBtnPressedEvent,
	WorkspacePickSelectionAreaKindEmailBtnPressedEvent,
	WorkspacePickSelectionAreaKindPhoneBtnPressedEvent,
	WorkspacePickSelectionAreaKindCancelBtnPressedEvent,
}
