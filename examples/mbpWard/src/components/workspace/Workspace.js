// @flow

import React from 'react'
import { type WorkspaceStateType } from './workspaceEpic'
import { type DispatchType } from '../../../../../src/epics'
import { WorkspaceHtmlDraggingOverEvent, WorkspaceHtmlOnDropEvent } from './workspaceEvents'
import './Workspace.css'

type PropsType = {|
    state: WorkspaceStateType,
    dispatch: DispatchType,
|}

export const Workspace = ({ state, dispatch }: PropsType) => {

	return (<div
		style={{ backgroundImage: `url(${state.openedFile.url})` }}
		className={`Workspace${state.draggingFileOverWorkspace ? ' draggingFileOverWorkspace' : ''}`}
		onDragOver={(e) => {
			e.preventDefault()
			dispatch(WorkspaceHtmlDraggingOverEvent.create())
		}}
		onDrop={ev => {
			// Prevent default behavior (Prevent file from being opened)
			ev.preventDefault()
			const files = []

			if (ev.dataTransfer.items) {
				// Use DataTransferItemList interface to access the file(s)
				for (let i = 0; i < ev.dataTransfer.items.length; i++) {
					// If dropped items aren't files, reject them
					if (ev.dataTransfer.items[i].kind === 'file') {
						const file = ev.dataTransfer.items[i].getAsFile()

						files.push(file)
					}
				}
			} else {
				// Use DataTransfer interface to access the file(s)
				for (let i = 0; i < ev.dataTransfer.files.length; i++) {
					files.push(ev.dataTransfer.files[i])
				}
			}

			dispatch(WorkspaceHtmlOnDropEvent.create({ files }))
		}}
	>
		{ state.uploadingFile.active ? <span className="text">Uploading: {state.uploadingFile.progress}%</span> : <div/> }
	</div>)
}
