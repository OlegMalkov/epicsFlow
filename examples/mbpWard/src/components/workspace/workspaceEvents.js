// @flow strict

import { createSimpleEvent, createEvent } from '../../../../../src/epics'

const WorkspaceHtmlDraggingOverEvent = createSimpleEvent('WORKSPACE_HTML_DRAGGING_OVER')
const WorkspaceHtmlOnDropEvent = createEvent<{| files: Array<File> |}>('WORKSPACE_HTML_ON_DROP')
const WorkspaceFileUploadingProgressEvent = createEvent<{| progress: number |}>('WORKSPACE_FILE_UPLOADING_PROGRESS')
const WorkspaceFileUploadCompleteEvent = createEvent<{| fileUrl: string |}>('WORKSPACE_FILE_UPLOAD_COMPLETE')
const WorkspaceFileUploadFailedEvent = createSimpleEvent('WORKSPACE_FILE_UPLOAD_FAILED')

export {
	WorkspaceHtmlDraggingOverEvent,
	WorkspaceHtmlOnDropEvent,
	WorkspaceFileUploadingProgressEvent,
	WorkspaceFileUploadCompleteEvent,
	WorkspaceFileUploadFailedEvent,
}
